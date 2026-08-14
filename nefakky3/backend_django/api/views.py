from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ProductCategory, ProductItem, AdminOrder, OrderItem, AdminVoucher, UserReview
from .serializers import (
    ProductCategorySerializer, 
    ProductItemSerializer, 
    AdminOrderSerializer, 
    AdminVoucherSerializer, 
    UserReviewSerializer
)
from .services import MidtransPaymentService, HaversineDistanceCalculator
from .utils import (
    calculate_haversine_distance,
    calculate_estimated_delivery_time,
    validate_voucher_rules,
    format_rupiah_currency
)

# ==============================================================================
# VIEWSET 1: PRODUK MAKANAN / MINUMAN (ProductViewSet)
# ==============================================================================
class ProductViewSet(viewsets.ModelViewSet):
    """
    OOP Class-Based ViewSet untuk Manajemen Katalog Makanan/Minuman.
    Menyediakan operasi CRUD standar (GET, POST, PUT, DELETE) secara otomatis.
    """
    # Mengambil seluruh data produk dari database
    queryset = ProductItem.objects.all()
    # Menggunakan ProductItemSerializer untuk konversi data ke format JSON
    serializer_class = ProductItemSerializer

    # Custom Action Endpoint: GET /api/products/visible/
    @action(detail=False, methods=['get'])
    def visible(self, request):
        """Mendapatkan daftar menu yang berstatus aktif & tampil (visible=True) untuk pelanggan."""
        products = ProductItem.objects.filter(visibility=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


# ==============================================================================
# VIEWSET 2: PESANAN PELANGGAN & TRACKING LIVE (OrderViewSet)
# ==============================================================================
class OrderViewSet(viewsets.ModelViewSet):
    """
    OOP Class-Based ViewSet untuk Manajemen Transaksi & Pelacakan Status 5-Tahap.
    """
    # Urutkan pesanan dari yang paling baru dibuat
    queryset = AdminOrder.objects.all().order_by('-created_at')
    serializer_class = AdminOrderSerializer

    def create(self, request, *args, **kwargs):
        """
        Custom Override Method POST /api/orders/
        Menerima data transaksi pesanan baru dari Frontend, menyimpan header pesanan,
        membuat rincian item, dan otomatis mengurangi stok makanan di gudang!
        """
        data = request.data
        # Pisahkan rincian array item makanan dari data utama pesanan
        items_data = data.pop('items', [])
        
        # 1. Buat record transaksi utama di tabel AdminOrder
        order = AdminOrder.objects.create(**data)
        
        # 2. Loop & buat record rincian barang di tabel OrderItem
        for item in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=item.get('id', ''),
                name=item.get('name', ''),
                price=item.get('price', 0),
                quantity=item.get('quantity', 1),
                image=item.get('image', '')
            )
            # 3. Panggil method PBO reduce_stock untuk update stok secara dinamis
            try:
                prod = ProductItem.objects.get(item_id=item.get('id'))
                prod.reduce_stock(item.get('quantity', 1))
            except ProductItem.DoesNotExist:
                pass  # Abaikan jika ID produk tidak ditemukan di database

        # 4. Kembalikan data order yang baru saja dibuat ke Frontend
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Custom Action Endpoint: POST /api/orders/{order_id}/advance_stage/
    @action(detail=True, methods=['post'])
    def advance_stage(self, request, pk=None):
        """
        OOP Custom Action: Memajukan status pengiriman ke tahap berikutnya secara live.
        Alur: RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED
        """
        order = self.get_object()
        new_status = order.advance_status()  # Panggil method PBO di model AdminOrder
        return Response({"status": "success", "new_stage": new_status})


# ==============================================================================
# VIEWSET 3: VOUCHER PROMO (VoucherViewSet)
# ==============================================================================
class VoucherViewSet(viewsets.ModelViewSet):
    """
    OOP Class ViewSet Voucher Promo Belanja.
    """
    queryset = AdminVoucher.objects.all()
    serializer_class = AdminVoucherSerializer

    # Custom Action Endpoint: POST /api/vouchers/claim/
    @action(detail=False, methods=['post'])
    def claim(self, request):
        """
        Endpoint untuk klaim & verifikasi kode voucher promo saat pelanggan checkout.
        """
        code = request.data.get('code', '').strip().upper()
        subtotal = float(request.data.get('subtotal', 0))

        try:
            # Cari kode voucher di database
            voucher = AdminVoucher.objects.get(code=code, is_active=True)
            
            # Memanggil Fungsi Standalone Validation Rule (utils.py)
            validation_res = validate_voucher_rules(
                voucher_code=code,
                subtotal=subtotal,
                discount_percent=float(voucher.discount_percent),
                min_spend=float(voucher.min_spend),
                used_count=getattr(voucher, 'used_count', 0),
                total_limit=getattr(voucher, 'total_limit', 500),
                is_active=voucher.is_active,
                valid_until=getattr(voucher, 'valid_until', None)
            )

            if validation_res["is_valid"]:
                return Response({
                    "success": True,
                    "discount_percent": float(voucher.discount_percent),
                    "discount_amount": validation_res["discount_amount"],
                    "message": validation_res["message"]
                })
            else:
                return Response({
                    "success": False,
                    "message": validation_res["message"]
                }, status=status.HTTP_400_BAD_REQUEST)
        except AdminVoucher.DoesNotExist:
            return Response({
                "success": False,
                "message": "Kode voucher tidak ditemukan atau sudah kadaluarsa."
            }, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# VIEWSET 4: ULASAN PELANGGAN (ReviewViewSet)
# ==============================================================================
class ReviewViewSet(viewsets.ModelViewSet):
    """
    OOP Class ViewSet Ulasan & Rating Pelanggan.
    """
    queryset = UserReview.objects.all()
    serializer_class = UserReviewSerializer


# ==============================================================================
# API VIEW: MIDTRANS SNAP TOKEN (MidtransSnapTokenView)
# ==============================================================================
class MidtransSnapTokenView(APIView):
    """
    OOP Class-Based APIView khusus untuk endpoint Snap Token Midtrans.
    Menghasilkan token pembayaran online untuk QRIS / GoPay / Transfer Bank.
    """
    def post(self, request):
        order_id = request.data.get('order_id', 'ORD-MOCK')
        subtotal = request.data.get('subtotal', 0)
        shipping_cost = request.data.get('shipping_cost', 0)
        customer_name = request.data.get('customer_name', 'Pelanggan Nefakky')
        customer_email = request.data.get('customer_email', 'customer@nefakky.com')

        total_payment = subtotal + shipping_cost

        # Instansiasi Service Class Midtrans (Pattern PBO Services)
        midtrans_service = MidtransPaymentService()
        result = midtrans_service.create_snap_transaction(
            order_id=order_id,
            gross_amount=total_payment,
            customer_details={
                "first_name": customer_name,
                "email": customer_email
            }
        )

        return Response(result, status=status.HTTP_200_OK)


# ==============================================================================
# API VIEW: KALKULASI JARAK HAVERSINE (HaversineDistanceView)
# ==============================================================================
class HaversineDistanceView(APIView):
    """
    OOP Class-Based APIView untuk kalkulasi jarak GPS Haversine antara toko & pelanggan.
    """
    def post(self, request):
        latitude_val = float(request.data.get('lat', -6.2088))
        longitude_val = float(request.data.get('lon', 106.8456))
        
        # Memanggil Fungsi Standalone Jarak Haversine (utils.py)
        distance_km = calculate_haversine_distance(-6.2088, 106.8456, latitude_val, longitude_val)
        estimated_time = calculate_estimated_delivery_time(distance_km)
        
        return Response({
            "distance_km": distance_km,
            "estimated_delivery": estimated_time,
            "is_safe_range": distance_km <= 15.0
        })


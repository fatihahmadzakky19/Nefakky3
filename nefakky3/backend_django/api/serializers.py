from rest_framework import serializers
from .models import ProductCategory, ProductItem, AdminOrder, OrderItem, AdminVoucher, UserReview

# ==============================================================================
# SERIALIZER: KATEGORI PRODUK
# ==============================================================================
class ProductCategorySerializer(serializers.ModelSerializer):
    """
    Serializer untuk mengonversi data ProductCategory dari model Django ke format JSON.
    """
    class Meta:
        model = ProductCategory
        fields = '__all__'  # Mengambil semua kolom yang ada di model ProductCategory


# ==============================================================================
# SERIALIZER: PRODUK MAKANAN / MINUMAN
# ==============================================================================
class ProductItemSerializer(serializers.ModelSerializer):
    """
    Serializer untuk mengonversi data produk makanan/minuman ke format JSON.
    Menyertakan field kalkulasi dinamis 'final_price'.
    """
    # Menyertakan harga bersih setelah diskon dengan memanggil method get_final_price di Model
    final_price = serializers.ReadOnlyField(source='get_final_price')

    class Meta:
        model = ProductItem
        fields = '__all__'  # Mengambil seluruh kolom di ProductItem termasuk field tambahan final_price


# ==============================================================================
# SERIALIZER: RINCIAN ITEM PESANAN
# ==============================================================================
class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer khusus sub-item makanan di dalam transaksi pemesanan.
    """
    class Meta:
        model = OrderItem
        fields = ['product_id', 'name', 'price', 'quantity', 'image']


# ==============================================================================
# SERIALIZER: PESANAN PELANGGAN (AdminOrder)
# ==============================================================================
class AdminOrderSerializer(serializers.ModelSerializer):
    """
    Serializer utama transaksi pesanan pelanggan.
    Menyertakan rincian item (OrderItem) secara nested (bersarang).
    """
    # Menampilkan array rincian item pesanan (OrderItem) di dalam objek pesanan
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = AdminOrder
        fields = '__all__'  # Mengambil seluruh kolom di AdminOrder + daftar items bersarang


# ==============================================================================
# SERIALIZER: KODE VOUCHER PROMO
# ==============================================================================
class AdminVoucherSerializer(serializers.ModelSerializer):
    """
    Serializer untuk mengonversi data voucher promo ke format JSON.
    """
    class Meta:
        model = AdminVoucher
        fields = '__all__'


# ==============================================================================
# SERIALIZER: ULASAN PELANGGAN
# ==============================================================================
class UserReviewSerializer(serializers.ModelSerializer):
    """
    Serializer untuk mengonversi ulasan & rating pelanggan ke format JSON.
    """
    class Meta:
        model = UserReview
        fields = '__all__'


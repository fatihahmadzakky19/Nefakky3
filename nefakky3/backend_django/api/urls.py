from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, 
    OrderViewSet, 
    VoucherViewSet, 
    ReviewViewSet, 
    MidtransSnapTokenView,
    HaversineDistanceView
)

# ==============================================================================
# ROUTER DJANGO REST FRAMEWORK (DefaultRouter)
# ==============================================================================
# Router DRF secara otomatis membuat jalur URL CRUD standar untuk setiap ViewSet:
# - GET /api/products/          -> Mengambil daftar semua produk
# - POST /api/products/         -> Menambah produk baru
# - GET /api/products/{id}/     -> Mengambil detail produk berdasarkan ID
# - PUT /api/products/{id}/     -> Mengedit/mengubah data produk
# - DELETE /api/products/{id}/  -> Menghapus produk
#
# Begitu pula untuk endpoint orders, vouchers, dan reviews!
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'vouchers', VoucherViewSet, basename='voucher')
router.register(r'reviews', ReviewViewSet, basename='review')

# ==============================================================================
# URL PATTERNS APLIKASI RESTORAN NEFAKKY
# ==============================================================================
urlpatterns = [
    # 1. URL bawaan dari Router di atas (products, orders, vouchers, reviews)
    path('', include(router.urls)),
    
    # 2. Custom Endpoint APIView untuk Minta Snap Token Pembayaran Midtrans
    # Endpoint: POST /api/midtrans/token/
    path('midtrans/token/', MidtransSnapTokenView.as_view(), name='midtrans-token'),
    
    # 3. Custom Endpoint APIView untuk Kalkulasi Jarak Pengiriman GPS Haversine
    # Endpoint: POST /api/distance/calculate/
    path('distance/calculate/', HaversineDistanceView.as_view(), name='calculate-distance'),
]


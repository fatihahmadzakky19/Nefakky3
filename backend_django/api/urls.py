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

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'vouchers', VoucherViewSet, basename='voucher')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
    path('midtrans/token/', MidtransSnapTokenView.as_view(), name='midtrans-token'),
    path('distance/calculate/', HaversineDistanceView.as_view(), name='calculate-distance'),
]

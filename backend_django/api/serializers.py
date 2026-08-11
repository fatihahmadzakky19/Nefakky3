from rest_framework import serializers
from .models import ProductCategory, ProductItem, AdminOrder, OrderItem, AdminVoucher, UserReview

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'


class ProductItemSerializer(serializers.ModelSerializer):
    final_price = serializers.ReadOnlyField(source='get_final_price')

    class Meta:
        model = ProductItem
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_id', 'name', 'price', 'quantity', 'image']


class AdminOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = AdminOrder
        fields = '__all__'


class AdminVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminVoucher
        fields = '__all__'


class UserReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReview
        fields = '__all__'

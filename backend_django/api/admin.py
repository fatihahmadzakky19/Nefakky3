from django.contrib import admin
from .models import ProductCategory, ProductItem, AdminOrder, OrderItem, AdminVoucher, UserReview

@admin.register(ProductItem)
class ProductItemAdmin(admin.ModelAdmin):
    list_display = ('item_id', 'name', 'category', 'price', 'stock', 'status', 'visibility')
    list_filter = ('category', 'status', 'visibility')
    search_fields = ('name', 'sku', 'description')


@admin.register(AdminOrder)
class AdminOrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer_name', 'total', 'status', 'payment_badge', 'created_at')
    list_filter = ('status', 'payment_badge')
    search_fields = ('order_id', 'customer_name', 'customer_email')


@admin.register(AdminVoucher)
class AdminVoucherAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'discount_percent', 'min_spend', 'status', 'is_active')
    list_filter = ('status', 'is_active')


@admin.register(UserReview)
class UserReviewAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'product_name', 'rating', 'status')
    list_filter = ('rating', 'status')


admin.site.register(ProductCategory)
admin.site.register(OrderItem)

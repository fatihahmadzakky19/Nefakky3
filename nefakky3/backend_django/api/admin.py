from django.contrib import admin
from .models import ProductCategory, ProductItem, AdminOrder, OrderItem, AdminVoucher, UserReview

# ==============================================================================
# DJANGO ADMIN PANEL REGISTRATION
# ==============================================================================
# File ini digunakan untuk pendaftaran tabel-tabel database agar bisa dikelola
# secara visual melalui halaman admin Django (/admin).

@admin.register(ProductItem)
class ProductItemAdmin(admin.ModelAdmin):
    """Pengaturan tampilan tabel Produk Makanan di halaman Django Admin."""
    # Kolom yang akan ditampilkan pada daftar produk
    list_display = ('item_id', 'name', 'category', 'price', 'stock', 'status', 'visibility')
    # Filter samping berdasarkan kategori, status stok, dan visibility
    list_filter = ('category', 'status', 'visibility')
    # Kotak pencarian berdasarkan nama makanan, SKU, atau deskripsi
    search_fields = ('name', 'sku', 'description')


@admin.register(AdminOrder)
class AdminOrderAdmin(admin.ModelAdmin):
    """Pengaturan tampilan tabel Transaksi Pesanan di halaman Django Admin."""
    # Kolom yang ditampilkan pada tabel pesanan
    list_display = ('order_id', 'customer_name', 'total', 'status', 'payment_badge', 'created_at')
    # Filter samping berdasarkan status pengiriman & status pembayaran
    list_filter = ('status', 'payment_badge')
    # Kotak pencarian berdasarkan ID pesanan, nama pelanggan, atau email
    search_fields = ('order_id', 'customer_name', 'customer_email')


@admin.register(AdminVoucher)
class AdminVoucherAdmin(admin.ModelAdmin):
    """Pengaturan tampilan tabel Voucher Promo di halaman Django Admin."""
    list_display = ('code', 'name', 'discount_percent', 'min_spend', 'status', 'is_active')
    list_filter = ('status', 'is_active')


@admin.register(UserReview)
class UserReviewAdmin(admin.ModelAdmin):
    """Pengaturan tampilan tabel Ulasan Pelanggan di halaman Django Admin."""
    list_display = ('author_name', 'product_name', 'rating', 'status')
    list_filter = ('rating', 'status')


# Pendaftaran tabel tanpa kustomisasi tampilan khusus
admin.site.register(ProductCategory)
admin.site.register(OrderItem)


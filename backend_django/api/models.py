from django.db import models
import math

class ProductCategory(models.Model):
    """OOP Model Kategori Makanan/Minuman Nefakky"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class ProductItem(models.Model):
    """
    OOP Model Produk Makanan/Minuman Nefakky.
    Menerapkan enkapsulasi properti dan metode kalkulasi harga/stok.
    """
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Low Stock', 'Low Stock'),
        ('Inactive', 'Inactive'),
    ]

    BADGE_CHOICES = [
        ('TERPOPULER', 'TERPOPULER'),
        ('BARU', 'BARU'),
        ('BEST SELLER', 'BEST SELLER'),
        ('NEW', 'NEW'),
    ]

    item_id = models.CharField(max_length=50, primary_key=True)
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=50, default='Makanan Utama')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    stock = models.IntegerField(default=50)
    visibility = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    rating = models.FloatField(default=4.9)
    reviews_count = models.IntegerField(default=120)
    sold_count = models.CharField(max_length=50, default='150 Terjual')
    image = models.CharField(max_length=500)
    description = models.TextField()
    badge = models.CharField(max_length=20, choices=BADGE_CHOICES, blank=True, null=True)
    ingredients = models.TextField(blank=True, default='')
    usage_advice = models.TextField(blank=True, default='')
    calories = models.CharField(max_length=30, default='320 kcal')
    fat = models.CharField(max_length=30, default='12g')
    sugar = models.CharField(max_length=30, default='4g')

    # Metode PBO: Kalkulasi Harga Setelah Diskon
    def get_final_price(self) -> float:
        """Kalkulasi harga akhir setelah dipotong persentase diskon."""
        price_val = float(self.price)
        discount_val = float(self.discount)
        if discount_val > 0:
            return round(price_val - (price_val * (discount_val / 100.0)))
        return price_val

    # Metode PBO: Pengurangan Stok Otomatis Saat Transaksi
    def reduce_stock(self, quantity: int) -> bool:
        """Mengurangi jumlah porsi stok secara otomatis saat pesanan dibuat."""
        if self.stock >= quantity:
            self.stock -= quantity
            if self.stock == 0:
                self.status = 'Inactive'
            elif self.stock <= 5:
                self.status = 'Low Stock'
            self.save()
            return True
        return False

    def __str__(self):
        return f"{self.name} (Rp {self.price})"


class AdminVoucher(models.Model):
    """
    OOP Model Kode Voucher Promo Belanja.
    Menerapkan metode PBO validasi minimum belanja dan potongan harga.
    """
    voucher_id = models.CharField(max_length=50, primary_key=True)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    min_spend = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    expiry = models.CharField(max_length=100, default='31 Des 2026')
    status = models.CharField(max_length=20, default='Active')
    is_active = models.BooleanField(default=True)

    # Metode PBO: Validasi & Hitung Potongan Diskon
    def calculate_discount_amount(self, subtotal: float) -> float:
        """Tentukan nominal potongan diskon berdasarkan subtotal belanja."""
        if float(subtotal) >= float(self.min_spend) and self.is_active:
            discount_amount = float(subtotal) * (float(self.discount_percent) / 100.0)
            return round(discount_amount)
        return 0.0

    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"


class AdminOrder(models.Model):
    """
    OOP Model Pesanan Pelanggan & Pelacakan Status 5-Tahap Live.
    """
    STATUS_CHOICES = [
        ('RECEIVED', '1. Diterima'),
        ('COOKING', '2. Dimasak'),
        ('READY', '3. Siap'),
        ('DELIVERING', '4. Diantar'),
        ('COMPLETED', '5. Selesai'),
        ('CANCELLED', 'Dibatalkan'),
    ]

    PAYMENT_BADGES = [
        ('PAID', 'PAID'),
        ('AWAITING', 'AWAITING'),
        ('REFUNDED', 'REFUNDED'),
        ('FAILED', 'FAILED'),
    ]

    order_id = models.CharField(max_length=50, primary_key=True)
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    avatar = models.CharField(max_length=500, blank=True, null=True)
    address = models.TextField()
    phone = models.CharField(max_length=30, blank=True, null=True)
    item_count = models.IntegerField(default=1)
    payment_method = models.CharField(max_length=100, default='Midtrans QRIS / GoPay')
    payment_badge = models.CharField(max_length=20, choices=PAYMENT_BADGES, default='PAID')
    delivery_type = models.CharField(max_length=100, default='Biaya Pengiriman Standard')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COOKING')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    customer_confirmed = models.BooleanField(default=False)

    # Metode PBO: Pembaruan Status Alur Pengiriman Live
    def advance_status(self) -> str:
        """Maju ke status pengiriman berikutnya secara berurutan."""
        status_flow = ['RECEIVED', 'COOKING', 'READY', 'DELIVERING', 'COMPLETED']
        if self.status in status_flow:
            curr_idx = status_flow.index(self.status)
            if curr_idx < len(status_flow) - 1:
                self.status = status_flow[curr_idx + 1]
                self.save()
        return self.status

    def __str__(self):
        return f"{self.order_id} - {self.customer_name} ({self.status})"


class OrderItem(models.Model):
    """OOP Model Sub-item Rincian Pesanan Makanan"""
    order = models.ForeignKey(AdminOrder, related_name='items', on_delete=models.CASCADE)
    product_id = models.CharField(max_length=50)
    name = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.IntegerField(default=1)
    image = models.CharField(max_length=500)

    def get_subtotal(self) -> float:
        return float(self.price) * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.name}"


class UserReview(models.Model):
    """OOP Model Ulasan & Rating Pelanggan"""
    review_id = models.CharField(max_length=50, primary_key=True)
    author_name = models.CharField(max_length=100)
    author_email = models.EmailField()
    author_badge = models.CharField(max_length=50, default='GOLD')
    avatar = models.CharField(max_length=500, blank=True, null=True)
    rating = models.IntegerField(default=5)
    date = models.CharField(max_length=50, default='Kemarin')
    product_name = models.CharField(max_length=150)
    product_image = models.CharField(max_length=500, blank=True, null=True)
    comment = models.TextField()
    likes_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default='PUBLISHED')

    def __str__(self):
        return f"Ulasan oleh {self.author_name} ({self.rating} ⭐)"

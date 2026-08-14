from django.db import models
import math

# ==============================================================================
# MODEL 1: KATEGORI PRODUK (ProductCategory)
# ==============================================================================
class ProductCategory(models.Model):
    """
    OOP Model Kategori Makanan/Minuman Nefakky.
    Digunakan untuk mengelompokkan menu (misal: 'Makanan Utama', 'Minuman', 'Dessert').
    """
    # Nama kategori makanan (contoh: "Minuman Segar"), harus unik tidak boleh kembar
    name = models.CharField(max_length=50, unique=True)
    # Slug adalah versi URL-friendly dari nama (contoh: "minuman-segar")
    slug = models.SlugField(max_length=50, unique=True)
    # Deskripsi tambahan opsi kategori (boleh kosong / null)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        # Mengembalikan nama kategori saat objek dipanggil sebagai string (misal di Django Admin)
        return self.name


# ==============================================================================
# MODEL 2: PRODUK MAKANAN / MINUMAN (ProductItem)
# ==============================================================================
class ProductItem(models.Model):
    """
    OOP Model Produk Makanan/Minuman Nefakky.
    Menerapkan enkapsulasi properti dan metode kalkulasi harga/stok.
    """
    # Opsi status ketersediaan barang di inventaris toko
    STATUS_CHOICES = [
        ('Active', 'Active'),          # Barang tersedia & siap dijual
        ('Low Stock', 'Low Stock'),    # Stok menipis (sisa <= 5)
        ('Inactive', 'Inactive'),      # Stok habis / nonaktif
    ]

    # Opsi label badge khusus pada produk (ditampilkan di frontend)
    BADGE_CHOICES = [
        ('TERPOPULER', 'TERPOPULER'),
        ('BARU', 'BARU'),
        ('BEST SELLER', 'BEST SELLER'),
        ('NEW', 'NEW'),
    ]

    # Primary Key Unik (contoh: 'PROD-001')
    item_id = models.CharField(max_length=50, primary_key=True)
    # SKU (Stock Keeping Unit) untuk pelacakan barang di gudang
    sku = models.CharField(max_length=50, unique=True)
    # Nama makanan/minuman (contoh: "Nasi Goreng Spesial")
    name = models.CharField(max_length=150)
    # Nama kategori makanan
    category = models.CharField(max_length=50, default='Makanan Utama')
    # Harga asli barang (DecimalField dipakai agar presisi untuk mata uang Rupiah)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    # Persentase diskon (contoh: 10.00 artinya diskon 10%)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    # Jumlah stok makanan yang tersedia
    stock = models.IntegerField(default=50)
    # Visibility: True = tampil di menu pelanggan, False = disembunyikan
    visibility = models.BooleanField(default=True)
    # Status ketersediaan menggunakan pilihan STATUS_CHOICES di atas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    # Rating rata-rata dari pelanggan (skala 1.0 - 5.0)
    rating = models.FloatField(default=4.9)
    # Total berapa kali produk diulas oleh pelanggan
    reviews_count = models.IntegerField(default=120)
    # Teks jumlah porsi yang sudah terjual (contoh: "150 Terjual")
    sold_count = models.CharField(max_length=50, default='150 Terjual')
    # Link URL / path gambar produk
    image = models.CharField(max_length=500)
    # Deskripsi detail mengenai hidangan ini
    description = models.TextField()
    # Label badge khusus (boleh kosong jika tidak ada)
    badge = models.CharField(max_length=20, choices=BADGE_CHOICES, blank=True, null=True)
    # Informasi bahan-bahan pembuatan makanan
    ingredients = models.TextField(blank=True, default='')
    # Saran penyajian / petunjuk konsumsi
    usage_advice = models.TextField(blank=True, default='')
    # Informasi nilai gizi: Kalori
    calories = models.CharField(max_length=30, default='320 kcal')
    # Informasi nilai gizi: Lemak
    fat = models.CharField(max_length=30, default='12g')
    # Informasi nilai gizi: Gula
    sugar = models.CharField(max_length=30, default='4g')

    # --------------------------------------------------------------------------
    # METODE LOGIKA PBO (Object-Oriented Programming)
    # --------------------------------------------------------------------------
    def get_final_price(self) -> float:
        """
        Metode PBO: Kalkulasi Harga Setelah Diskon.
        Menghitung harga bersih produk setelah dikurangi persentase diskon.
        """
        price_val = float(self.price)
        discount_val = float(self.discount)
        if discount_val > 0:
            # Rumus: Harga Asli - (Harga Asli * Diskon / 100)
            return round(price_val - (price_val * (discount_val / 100.0)))
        return price_val

    def reduce_stock(self, quantity: int) -> bool:
        """
        Metode PBO: Pengurangan Stok Otomatis Saat Transaksi Berhasil.
        Secara otomatis mengubah status barang jika stok menipis atau habis.
        """
        if self.stock >= quantity:
            self.stock -= quantity  # Kurangi stok sesuai jumlah yang dibeli
            if self.stock == 0:
                self.status = 'Inactive'  # Stok habis -> nonaktifkan produk
            elif self.stock <= 5:
                self.status = 'Low Stock'  # Stok <= 5 -> beri status Low Stock
            self.save()  # Simpan perubahan ke database
            return True
        return False  # Gagalkan jika stok kurang dari jumlah pesanan

    def __str__(self):
        return f"{self.name} (Rp {self.price})"


# ==============================================================================
# MODEL 3: KODE VOUCHER PROMO (AdminVoucher)
# ==============================================================================
class AdminVoucher(models.Model):
    """
    OOP Model Kode Voucher Promo Belanja.
    Menerapkan metode PBO validasi minimum belanja dan potongan harga.
    """
    # Primary Key unik voucher (contoh: 'VOUCH-01')
    voucher_id = models.CharField(max_length=50, primary_key=True)
    # Kode voucher yang diketik pelanggan saat checkout (contoh: "NEFAKKY10")
    code = models.CharField(max_length=50, unique=True)
    # Nama promo (contoh: "Promo Diskon Akhir Tahun")
    name = models.CharField(max_length=150)
    # Besar persentase diskon (contoh: 10.00 = diskon 10%)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    # Syarat minimal total belanja untuk memakai voucher ini
    min_spend = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    # Tanggal kadaluarsa voucher
    expiry = models.CharField(max_length=100, default='31 Des 2026')
    # Status teks voucher ('Active' / 'Expired')
    status = models.CharField(max_length=20, default='Active')
    # Saklar penanda aktif/tidaknya voucher di sistem (True = Aktif, False = Nonaktif)
    is_active = models.BooleanField(default=True)

    def calculate_discount_amount(self, subtotal: float) -> float:
        """
        Metode PBO: Validasi & Hitung Potongan Diskon.
        Memeriksa apakah subtotal belanja memenuhi syarat minimal belanja.
        """
        if float(subtotal) >= float(self.min_spend) and self.is_active:
            # Hitung nominal potongan Rupiah
            discount_amount = float(subtotal) * (float(self.discount_percent) / 100.0)
            return round(discount_amount)
        return 0.0  # Return 0 jika syarat belanja belum terpenuhi

    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"


# ==============================================================================
# MODEL 4: PESANAN PELANGGAN (AdminOrder)
# ==============================================================================
class AdminOrder(models.Model):
    """
    OOP Model Pesanan Pelanggan & Pelacakan Status 5-Tahap Live.
    """
    # Opsi 5-tahap alur status pesanan restoran
    STATUS_CHOICES = [
        ('RECEIVED', '1. Diterima'),    # Tahap 1: Pesanan baru diterima dapur
        ('COOKING', '2. Dimasak'),     # Tahap 2: Makanan sedang dimasak oleh koki
        ('READY', '3. Siap'),          # Tahap 3: Makanan siap dikemas
        ('DELIVERING', '4. Diantar'),   # Tahap 4: Kurir dalam perjalanan ke lokasi
        ('COMPLETED', '5. Selesai'),    # Tahap 5: Makanan diterima pelanggan
        ('CANCELLED', 'Dibatalkan'),    # Pesanan dibatalkan
    ]

    # Opsi status pembayaran transaksi
    PAYMENT_BADGES = [
        ('PAID', 'PAID'),          # Lunas
        ('AWAITING', 'AWAITING'),  # Menunggu pembayaran
        ('REFUNDED', 'REFUNDED'),  # Pengembalian dana
        ('FAILED', 'FAILED'),      # Gagal
    ]

    # ID Pesanan Unik (contoh: 'ORD-88219')
    order_id = models.CharField(max_length=50, primary_key=True)
    # Nama pemesan / pelanggan
    customer_name = models.CharField(max_length=100)
    # Email pemesan (untuk kirim konfirmasi / nota)
    customer_email = models.EmailField()
    # URL Foto Profil Pelanggan
    avatar = models.CharField(max_length=500, blank=True, null=True)
    # Alamat lengkap tujuan pengiriman
    address = models.TextField()
    # Nomor WhatsApp / Telepon pelanggan
    phone = models.CharField(max_length=30, blank=True, null=True)
    # Total jumlah item makanan yang dipesan
    item_count = models.IntegerField(default=1)
    # Metode Pembayaran yang dipilih (contoh: 'Midtrans QRIS / GoPay')
    payment_method = models.CharField(max_length=100, default='Midtrans QRIS / GoPay')
    # Status pembayaran (PAID / AWAITING / FAILED)
    payment_badge = models.CharField(max_length=20, choices=PAYMENT_BADGES, default='PAID')
    # Jenis pengiriman (contoh: "Biaya Pengiriman Standard")
    delivery_type = models.CharField(max_length=100, default='Biaya Pengiriman Standard')
    # Status alur pengerjaan saat ini menggunakan STATUS_CHOICES
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COOKING')
    # Subtotal harga barang saja (sebelum ongkir & diskon)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    # Biaya ongkos kirim ke alamat pelanggan
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    # Potongan harga diskon dari voucher
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    # Total tagihan akhir yang harus dibayar (subtotal + shipping_cost - discount)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    # Waktu tanggal transaksi dibuat secara otomatis
    created_at = models.DateTimeField(auto_now_add=True)
    # Penanda apakah pelanggan sudah mengonfirmasi penerimaan barang
    customer_confirmed = models.BooleanField(default=False)

    def advance_status(self) -> str:
        """
        Metode PBO: Pembaruan Status Alur Pengiriman Live.
        Memajukan status pesanan dari 1. Diterima -> 2. Dimasak -> 3. Siap -> 4. Diantar -> 5. Selesai.
        """
        status_flow = ['RECEIVED', 'COOKING', 'READY', 'DELIVERING', 'COMPLETED']
        if self.status in status_flow:
            curr_idx = status_flow.index(self.status)
            if curr_idx < len(status_flow) - 1:
                self.status = status_flow[curr_idx + 1]  # Maju ke indeks berikutnya
                self.save()  # Simpan perubahan status ke database
        return self.status

    def __str__(self):
        return f"{self.order_id} - {self.customer_name} ({self.status})"


# ==============================================================================
# MODEL 5: RINCIAN ITEM PESANAN (OrderItem)
# ==============================================================================
class OrderItem(models.Model):
    """
    OOP Model Sub-item Rincian Pesanan Makanan.
    Berelasi dengan AdminOrder via Relasi Foreign Key.
    """
    # Relasi ke tabel AdminOrder. Jika Order dihapus, semua itemnya ikut terhapus (CASCADE)
    order = models.ForeignKey(AdminOrder, related_name='items', on_delete=models.CASCADE)
    # ID produk yang dipesan
    product_id = models.CharField(max_length=50)
    # Nama produk saat pesanan dibuat
    name = models.CharField(max_length=150)
    # Harga satuan produk
    price = models.DecimalField(max_digits=12, decimal_places=2)
    # Jumlah porsi yang dibeli pelanggan
    quantity = models.IntegerField(default=1)
    # Gambar produk
    image = models.CharField(max_length=500)

    def get_subtotal(self) -> float:
        """Hitung total harga untuk item ini saja (Harga x Quantity)."""
        return float(self.price) * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.name}"


# ==============================================================================
# MODEL 6: ULASAN & RATING PELANGGAN (UserReview)
# ==============================================================================
class UserReview(models.Model):
    """
    OOP Model Ulasan & Rating Pelanggan untuk Makanan/Minuman Nefakky.
    """
    # Primary Key ID Ulasan
    review_id = models.CharField(max_length=50, primary_key=True)
    # Nama penulis ulasan
    author_name = models.CharField(max_length=100)
    # Email penulis ulasan
    author_email = models.EmailField()
    # Badge keanggotaan pengguna (misal: 'GOLD', 'PLATINUM', 'SILVER')
    author_badge = models.CharField(max_length=50, default='GOLD')
    # Foto profil penulis
    avatar = models.CharField(max_length=500, blank=True, null=True)
    # Jumlah bintang rating (1 sampai 5)
    rating = models.IntegerField(default=5)
    # Waktu/tanggal ulasan ditulis (contoh: "Kemarin" atau "12 Ags 2026")
    date = models.CharField(max_length=50, default='Kemarin')
    # Nama makanan yang diulas
    product_name = models.CharField(max_length=150)
    # Gambar makanan yang diulas
    product_image = models.CharField(max_length=500, blank=True, null=True)
    # Isi komentar / testimoni pelanggan
    comment = models.TextField()
    # Jumlah suka (likes) dari pengguna lain pada ulasan ini
    likes_count = models.IntegerField(default=0)
    # Status publikasi ulasan ('PUBLISHED' / 'HIDDEN')
    status = models.CharField(max_length=20, default='PUBLISHED')

    def __str__(self):
        return f"Ulasan oleh {self.author_name} ({self.rating} ⭐)"


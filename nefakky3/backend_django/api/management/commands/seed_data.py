from django.core.management.base import BaseCommand
from api.models import ProductItem, AdminVoucher, UserReview

DEFAULT_PRODUCTS = [
    {
        "item_id": "m1",
        "sku": "AYM-BKR-01",
        "name": "Ayam Bakar Rempah",
        "category": "Makanan Utama",
        "price": 35000,
        "discount": 0,
        "stock": 50,
        "visibility": True,
        "status": "Active",
        "rating": 4.9,
        "reviews_count": 142,
        "sold_count": "150 Terjual",
        "image": "/images/ayam_bakar.jpg",
        "description": "Ayam pejantan segar dibakar dengan bumbu kecap rempah pilihan khas Jawa hingga meresap ke dalam tulang.",
        "badge": "BEST SELLER",
        "ingredients": "Ayam pejantan, kecap manis bango, serai, jahe, bawang merah, bawang putih, lengkuas, ketumbar.",
        "usage_advice": "Disajikan hangat bersama nasi pulen segar, lalapan mentimun, dan sambal terasi bakar.",
        "calories": "380 kcal",
        "fat": "14g",
        "sugar": "6g"
    },
    {
        "item_id": "m2",
        "sku": "NSI-BKR-02",
        "name": "Nasi Bakar Cumi Pedas",
        "category": "Makanan Utama",
        "price": 28000,
        "discount": 0,
        "stock": 35,
        "visibility": True,
        "status": "Active",
        "rating": 4.8,
        "reviews_count": 98,
        "sold_count": "120 Terjual",
        "image": "/images/nasi_bakar.jpg",
        "description": "Nasi gurih dibungkus daun pisang dengan isian cumi asin cabai hijau yang harum menggugah selera.",
        "badge": "TERPOPULER",
        "ingredients": "Nasi gurih santan, cumi asin segar, cabai hijau irik, kemangi, daun jeruk, bumbu rempah harum.",
        "usage_advice": "Buka bungkus daun pisang yang harum selagi hangat, nikmati dengan kerupuk gurih.",
        "calories": "320 kcal",
        "fat": "10g",
        "sugar": "2g"
    },
    {
        "item_id": "m3",
        "sku": "KRC-PDS-03",
        "name": "Krecek Pedas Gurih",
        "category": "Menu Hemat",
        "price": 22000,
        "discount": 0,
        "stock": 40,
        "visibility": True,
        "status": "Active",
        "rating": 4.7,
        "reviews_count": 85,
        "sold_count": "95 Terjual",
        "image": "/images/krecek.jpg",
        "description": "Sambal goreng krecek kulit sapi lembut dipadu dengan kacang tolo dan kuah santan pedas gurih legit.",
        "badge": "BARU",
        "ingredients": "Kerupuk kulit sapi kualitas super, kacang tolo, cabai rawit merah, santan kental, daun salam.",
        "usage_advice": "Sangat cocok disandingkan bersama Gudeg Jogja dan Telur Bacem.",
        "calories": "260 kcal",
        "fat": "16g",
        "sugar": "4g"
    },
    {
        "item_id": "m4",
        "sku": "GDG-JGJ-04",
        "name": "Gudeg Komplit Jogja",
        "category": "Makanan Utama",
        "price": 32000,
        "discount": 0,
        "stock": 25,
        "visibility": True,
        "status": "Active",
        "rating": 4.9,
        "reviews_count": 110,
        "sold_count": "110 Terjual",
        "image": "/images/gudeg.jpg",
        "description": "Gudeg nangka muda otentik khas Yogyakarta yang dimasak perlahan dengan gula jawa dan santan gurih.",
        "badge": "BEST SELLER",
        "ingredients": "Nangka muda (gori), gula jawa asli, santan kelapa murni, telur bacem, bumbu spekuk tradisional.",
        "usage_advice": "Santap bersama krecek pedas gurih dan emping manis untuk kelezatan maksimal.",
        "calories": "410 kcal",
        "fat": "12g",
        "sugar": "18g"
    },
    {
        "item_id": "m5",
        "sku": "GRG-ASM-05",
        "name": "Garang Asam Ayam Kampung",
        "category": "Makanan Utama",
        "price": 38000,
        "discount": 0,
        "stock": 20,
        "visibility": True,
        "status": "Active",
        "rating": 4.8,
        "reviews_count": 76,
        "sold_count": "80 Terjual",
        "image": "/images/garang_asam.jpg",
        "description": "Olahan potong ayam kampung dengan kuah asam pedas beraroma daun pisang kukus menyegarkan.",
        "badge": "NEW",
        "ingredients": "Ayam kampung segar, belimbing wulung, tomat hijau, cabai rawit utuh, santan cair, daun pisang.",
        "usage_advice": "Nikmati kuah asam pedasnya selagi panas membara.",
        "calories": "290 kcal",
        "fat": "11g",
        "sugar": "3g"
    },
    {
        "item_id": "m6",
        "sku": "JUS-SGR-06",
        "name": "Jus Segar (Jambu, Sirsak, Mangga)",
        "category": "Minuman",
        "price": 15000,
        "discount": 0,
        "stock": 60,
        "visibility": True,
        "status": "Active",
        "rating": 4.9,
        "reviews_count": 160,
        "sold_count": "200 Terjual",
        "image": "/images/jus_mangga.jpg",
        "description": "Jus murni dari sari buah segar pilihan kaya vitamin tanpa pengawet buatan.",
        "badge": "BEST SELLER",
        "ingredients": "Buah segar asli pilihan (Jambu Merah / Sirsak / Mangga Harum Manis), es batu higienis, sedikit gula aren.",
        "usage_advice": "Kocok perlahan sebelum diminum dingin.",
        "calories": "140 kcal",
        "fat": "0.5g",
        "sugar": "14g"
    }
]

DEFAULT_VOUCHERS = [
    {
        "voucher_id": "v1",
        "code": "WEEKENDSERU",
        "name": "Promo Ayam Bakar Rempah 30%",
        "discount_percent": 30,
        "min_spend": 50000,
        "expiry": "31 Des 2026",
        "status": "Active",
        "is_active": True
    },
    {
        "voucher_id": "v2",
        "code": "NEFAKKY10",
        "name": "Voucher Pelanggan Baru 10%",
        "discount_percent": 10,
        "min_spend": 30000,
        "expiry": "31 Des 2026",
        "status": "Active",
        "is_active": True
    }
]

class Command(BaseCommand):
    help = "Membantu populasi data awal default 6 produk dan voucher di SQLite Django DB."

    def handle(self, *args, **options):
        for prod_data in DEFAULT_PRODUCTS:
            ProductItem.objects.update_or_create(
                item_id=prod_data["item_id"],
                defaults=prod_data
            )
        self.stdout.write(self.style.SUCCESS("[OK] 6 Produk Utama Nefakky berhasil di-seed ke Django DB!"))

        for vouch_data in DEFAULT_VOUCHERS:
            AdminVoucher.objects.update_or_create(
                voucher_id=vouch_data["voucher_id"],
                defaults=vouch_data
            )
        self.stdout.write(self.style.SUCCESS("[OK] Voucher Promo berhasil di-seed ke Django DB!"))

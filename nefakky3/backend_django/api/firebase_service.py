import firebase_admin
from firebase_admin import credentials, firestore
import os

class FirebaseFirestoreSyncService:
    """
    OOP Service Class untuk mengelola koneksi & sinkronisasi data real-time
    antara Django REST Backend dengan Firebase Cloud Firestore DB (Project: nefakky3).
    """
    _instance = None
    _db = None

    def __new__(cls):
        """Pattern Singleton (PBO) untuk menjamin koneksi tunggal ke Firebase."""
        if cls._instance is None:
            cls._instance = super(FirebaseFirestoreSyncService, cls).__new__(cls)
            cls._initialize_firebase()
        return cls._instance

    @classmethod
    def _initialize_firebase(cls):
        """Inisialisasi koneksi Firebase Admin SDK ke Firestore project 'nefakky3'."""
        try:
            if not firebase_admin._apps:
                key_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS') or os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
                if key_path and os.path.exists(key_path):
                    cred = credentials.Certificate(key_path)
                    firebase_admin.initialize_app(cred, {'projectId': 'nefakky3'})
                else:
                    options = {'projectId': 'nefakky3'}
                    firebase_admin.initialize_app(options=options)
            
            cls._db = firestore.client()
            print("[FirebaseSync] [OK] Berhasil terhubung ke Firebase Cloud Firestore DB (nefakky3)!")
        except Exception as e:
            print(f"[FirebaseSync] [NOTICE] Inisialisasi Firebase Admin DB berjalan dalam mode local-sync (service account optional): {e}")
            cls._db = None

    def sync_product(self, product_item) -> bool:
        """Sinkronisasi Objek Produk Django ke Firestore collection 'products'."""
        if not self._db:
            return False
        try:
            doc_ref = self._db.collection('products').document(product_item.item_id)
            doc_ref.set({
                'id': product_item.item_id,
                'sku': product_item.sku,
                'name': product_item.name,
                'category': product_item.category,
                'price': float(product_item.price),
                'discount': float(product_item.discount),
                'stock': product_item.stock,
                'visibility': product_item.visibility,
                'status': product_item.status,
                'rating': product_item.rating,
                'reviewsCount': product_item.reviews_count,
                'soldCount': product_item.sold_count,
                'image': product_item.image,
                'description': product_item.description,
                'badge': product_item.badge,
                'ingredients': product_item.ingredients,
                'usageAdvice': product_item.usage_advice,
                'calories': product_item.calories,
                'fat': product_item.fat,
                'sugar': product_item.sugar,
            }, merge=True)
            return True
        except Exception as e:
            print(f"[FirebaseSync Error] Gagal sync produk {product_item.item_id}: {e}")
            return False

    def sync_order(self, admin_order) -> bool:
        """Sinkronisasi Objek Pesanan Django ke Firestore collection 'orders'."""
        if not self._db:
            return False
        try:
            items_list = []
            for item in admin_order.items.all():
                items_list.append({
                    'id': item.product_id,
                    'name': item.name,
                    'price': float(item.price),
                    'quantity': item.quantity,
                    'image': item.image
                })

            doc_ref = self._db.collection('orders').document(admin_order.order_id)
            doc_ref.set({
                'id': admin_order.order_id,
                'customerName': admin_order.customer_name,
                'customerEmail': admin_order.customer_email,
                'avatar': admin_order.avatar,
                'address': admin_order.address,
                'phone': admin_order.phone,
                'itemCount': admin_order.item_count,
                'paymentMethod': admin_order.payment_method,
                'paymentBadge': admin_order.payment_badge,
                'deliveryType': admin_order.delivery_type,
                'status': admin_order.status,
                'subtotal': float(admin_order.subtotal),
                'shippingCost': float(admin_order.shipping_cost),
                'discount': float(admin_order.discount),
                'total': float(admin_order.total),
                'customerConfirmed': admin_order.customer_confirmed,
                'createdAt': getattr(admin_order, 'created_at_ms', None),
                'items': items_list
            }, merge=True)
            return True
        except Exception as e:
            print(f"[FirebaseSync Error] Gagal sync pesanan {admin_order.order_id}: {e}")
            return False

    def sync_voucher(self, admin_voucher) -> bool:
        """Sinkronisasi Objek Voucher ke Firestore collection 'vouchers'."""
        if not self._db:
            return False
        try:
            doc_ref = self._db.collection('vouchers').document(admin_voucher.voucher_id)
            doc_ref.set({
                'id': admin_voucher.voucher_id,
                'code': admin_voucher.code,
                'name': admin_voucher.name,
                'discountPercent': float(admin_voucher.discount_percent),
                'minSpend': float(admin_voucher.min_spend),
                'expiry': admin_voucher.expiry,
                'status': admin_voucher.status,
                'isActive': admin_voucher.is_active,
                'redemptions': getattr(admin_voucher, 'redemptions', '0/500'),
                'usedCount': getattr(admin_voucher, 'used_count', 0),
                'totalLimit': getattr(admin_voucher, 'total_limit', 500),
                'validUntil': getattr(admin_voucher, 'valid_until', None)
            }, merge=True)
            return True
        except Exception as e:
            print(f"[FirebaseSync Error] Gagal sync voucher {admin_voucher.code}: {e}")
            return False

    def fetch_products(self) -> list:
        """Membaca daftar produk langsung dari Firebase Cloud Firestore DB 'products'."""
        if not self._db:
            return []
        try:
            docs = self._db.collection('products').stream()
            return [{**d.to_dict(), 'id': d.id} for d in docs]
        except Exception as e:
            print(f"[FirebaseDB Error] Gagal membaca produk dari Firestore: {e}")
            return []

    def fetch_orders(self) -> list:
        """Membaca daftar transaksi pesanan langsung dari Firebase Cloud Firestore DB 'orders'."""
        if not self._db:
            return []
        try:
            docs = self._db.collection('orders').stream()
            return [{**d.to_dict(), 'id': d.id} for d in docs]
        except Exception as e:
            print(f"[FirebaseDB Error] Gagal membaca pesanan dari Firestore: {e}")
            return []

    def fetch_vouchers(self) -> list:
        """Membaca daftar voucher promo langsung dari Firebase Cloud Firestore DB 'vouchers'."""
        if not self._db:
            return []
        try:
            docs = self._db.collection('vouchers').stream()
            return [{**d.to_dict(), 'id': d.id} for d in docs]
        except Exception as e:
            print(f"[FirebaseDB Error] Gagal membaca voucher dari Firestore: {e}")
            return []

    def fetch_reviews(self) -> list:
        """Membaca daftar ulasan pelanggan langsung dari Firebase Cloud Firestore DB 'reviews'."""
        if not self._db:
            return []
        try:
            docs = self._db.collection('reviews').stream()
            return [{**d.to_dict(), 'id': d.id} for d in docs]
        except Exception as e:
            print(f"[FirebaseDB Error] Gagal membaca ulasan dari Firestore: {e}")
            return []

    def save_document(self, collection_name: str, doc_id: str, data: dict) -> bool:
        """Menyimpan atau memperbarui dokumen langsung ke Firebase Cloud Firestore DB."""
        if not self._db:
            return False
        try:
            self._db.collection(collection_name).document(doc_id).set(data, merge=True)
            return True
        except Exception as e:
            print(f"[FirebaseDB Error] Gagal menyimpan dokumen {collection_name}/{doc_id}: {e}")
            return False

    def delete_document(self, collection_name: str, doc_id: str) -> bool:
        """Menghapus dokumen langsung dari Firebase Cloud Firestore DB."""
        if not self._db:
            return False
        try:
            self._db.collection(collection_name).document(doc_id).delete()
            return True
        except Exception as e:
            print(f"[FirebaseDB Error] Gagal menghapus dokumen {collection_name}/{doc_id}: {e}")
            return False


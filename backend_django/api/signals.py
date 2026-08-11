from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ProductItem, AdminOrder, AdminVoucher
from .firebase_service import FirebaseFirestoreSyncService

firebase_sync = FirebaseFirestoreSyncService()

@receiver(post_save, sender=ProductItem)
def sync_product_on_save(sender, instance, **kwargs):
    """Signal handler PBO saat produk disimpan di Django Admin / REST API."""
    firebase_sync.sync_product(instance)

@receiver(post_delete, sender=ProductItem)
def sync_product_on_delete(sender, instance, **kwargs):
    """Signal handler PBO saat produk dihapus."""
    firebase_sync.delete_product(instance.item_id)

@receiver(post_save, sender=AdminOrder)
def sync_order_on_save(sender, instance, **kwargs):
    """Signal handler PBO saat status pesanan diubah di Django Admin."""
    firebase_sync.sync_order(instance)

@receiver(post_save, sender=AdminVoucher)
def sync_voucher_on_save(sender, instance, **kwargs):
    """Signal handler PBO saat voucher disimpan."""
    firebase_sync.sync_voucher(instance)

"""
==============================================================================
MODULE: Standalone Helper Functions (backend_django/api/utils.py)
DESKRIPSI: Kumpulan fungsi-fungsi terpisah (Standalone Functions) untuk 
           kalkulasi matematis, pengformatan mata uang, generator kode,
           dan validasi bisnis resto Nefakky.
==============================================================================
"""

import math
import random
import time
import datetime
from typing import Dict, Any, Tuple


def format_rupiah_currency(nominal_amount: float) -> str:
    """
    Fungsi Standalone: Mengubah angka nominal menjadi format mata uang Rupiah.
    
    :param nominal_amount: Angka nominal (e.g. 35000)
    :return: String terformat (e.g. "Rp 35.000")
    """
    try:
        amount_int = int(round(nominal_amount))
        formatted_str = f"{amount_int:,}".replace(",", ".")
        return f"Rp {formatted_str}"
    except Exception:
        return f"Rp {nominal_amount}"


def calculate_haversine_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> float:
    """
    Fungsi Standalone: Menghitung jarak garis lurus antara 2 koordinat GPS (Haversine).
    
    :param lat1: Garis lintang asal
    :param lon1: Garis bujur asal
    :param lat2: Garis lintang tujuan
    :param lon2: Garis bujur tujuan
    :return: Jarak dalam kilometer (diperbulan 1 desimal)
    """
    earth_radius_km = 6371.0
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    haversine_a = (
        math.sin(delta_lat / 2.0) ** 2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(delta_lon / 2.0) ** 2
    )

    central_angle_c = 2.0 * math.atan2(
        math.sqrt(haversine_a),
        math.sqrt(1.0 - haversine_a)
    )

    calculated_distance = earth_radius_km * central_angle_c
    return round(calculated_distance, 1)


def generate_unique_order_number(prefix: str = "NFK") -> str:
    """
    Fungsi Standalone: Meng-generate nomor unik transaksi pesanan.
    
    :param prefix: Prefix awal string kode pesanan
    :return: Kode unik pesanan (e.g. "NFK-16982026-834")
    """
    timestamp_part = str(int(time.time()))
    random_part = random.randint(100, 999)
    return f"{prefix}-{timestamp_part}-{random_part}"


def calculate_delivery_cost_by_km(distance_km: float) -> Dict[str, Any]:
    """
    Fungsi Standalone: Perhitungan biaya ongkos kirim berdasarkan jarak km lokasi.
    
    :param distance_km: Jarak lokasi pengiriman dalam kilometer
    :return: Dict berisi ongkir dan keterangan tipe pengiriman
    """
    if distance_km <= 0:
        return {"cost": 0.0, "type": "GRATIS ONGIR (Pick-Up Direct)"}

    # Base cost untuk 0-2 KM pertama adalah Rp 5.000
    if distance_km <= 2.0:
        return {"cost": 5000.0, "type": "STANDARD DELIVERY (0-2 km)"}

    # Setiap penambahan 1 KM melebihi 2 KM dikenakan tambahan Rp 2.500/KM
    extra_km = distance_km - 2.0
    additional_fee = math.ceil(extra_km) * 2500.0
    total_cost = 5000.0 + additional_fee

    return {
        "cost": float(total_cost),
        "type": f"EXPRESS DELIVERY ({distance_km:.1f} km)"
    }


def estimate_cooking_delivery_time(distance_km: float) -> str:
    """
    Fungsi Standalone: Estimasi durasi total pengantaran (Memasak + Perjalanan).
    
    :param distance_km: Jarak lokasi pengiriman dalam kilometer
    :return: String estimasi waktu kedatangan
    """
    base_minutes = 20  # Standar waktu masak dapur 20 menit
    travel_time = int(round(distance_km * 3))
    min_time = base_minutes + travel_time
    max_time = min_time + 15
    return f"~{min_time} - {max_time} Menit Tiba"


def validate_voucher_rules(
    voucher_code: str,
    subtotal: float,
    discount_percent: float,
    min_spend: float,
    used_count: int = 0,
    total_limit: int = 500,
    is_active: bool = True,
    valid_until: str = None
) -> Dict[str, Any]:
    """
    Fungsi Standalone: Memvalidasi kriteria kelayakan kode kupon voucher belanja.
    
    :param voucher_code: Kode voucher (e.g. "WEEKENDSERU")
    :param subtotal: Subtotal belanjaan saat ini
    :param discount_percent: Persentase diskon
    :param min_spend: Syarat minimal belanja
    :param used_count: Jumlah penggunaan sejauh ini
    :param total_limit: Batas total kuota penggunaan
    :param is_active: Status aktif/non-aktif voucher
    :param valid_until: Tanggal kedaluwarsa format YYYY-MM-DD
    :return: Dict hasil status validasi dan nominal diskon
    """
    if not is_active:
        return {
            "is_valid": False,
            "discount_amount": 0.0,
            "message": f"Kode voucher {voucher_code} sedang non-aktif atau dimatikan oleh Admin."
        }

    if total_limit and used_count >= total_limit:
        return {
            "is_valid": False,
            "discount_amount": 0.0,
            "message": f"Maaf, kuota batas penggunaan voucher {voucher_code} telah habis ({used_count}/{total_limit} terpakai)."
        }

    if valid_until:
        try:
            exp_date = datetime.datetime.strptime(valid_until, "%Y-%m-%d")
            exp_date = exp_date.replace(hour=23, minute=59, second=59)
            if datetime.datetime.now() > exp_date:
                return {
                    "is_valid": False,
                    "discount_amount": 0.0,
                    "message": f"Masa berlaku voucher {voucher_code} telah kedaluwarsa."
                }
        except Exception:
            pass

    code_upper = voucher_code.strip().upper()
    if "WEEKEND" in code_upper:
        # weekday(): Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5, Sunday=6
        if datetime.datetime.now().weekday() not in (5, 6):
            return {
                "is_valid": False,
                "discount_amount": 0.0,
                "message": f"Voucher {voucher_code} hanya berlaku pada hari Sabtu dan Minggu (Weekend)."
            }

    if subtotal < min_spend:
        return {
            "is_valid": False,
            "discount_amount": 0.0,
            "message": f"Syarat belanja minimum {format_rupiah_currency(min_spend)} belum terpenuhi."
        }

    calculated_discount = round(subtotal * (discount_percent / 100.0))
    return {
        "is_valid": True,
        "discount_amount": calculated_discount,
        "message": f"Voucher {voucher_code} (Diskon {discount_percent}%) berhasil dipasang!"
    }

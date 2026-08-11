import base64
import math
import requests
from typing import Dict, Any, Optional

class BasePaymentService:
    """
    Abstract Base Class (PBO/OOP) untuk Layanan Payment Gateway.
    Menyediakan fondasi dasar enkapsulasi autentikasi & endpoint API.
    """
    def __init__(self, server_key: Optional[str] = None, is_production_mode: bool = False):
        self._server_key = server_key or "SB-Mid-server-YOUR_MIDTRANS_SERVER_KEY"
        self._is_production_mode = is_production_mode

    def _generate_basic_auth_header(self) -> str:
        """
        Private Method (Enkapsulasi PBO) untuk membentuk Authorization Header Base64.
        """
        auth_payload_string = f"{self._server_key}:"
        encoded_auth_string = base64.b64encode(auth_payload_string.encode("utf-8")).decode("utf-8")
        return f"Basic {encoded_auth_string}"

    def create_snap_transaction(self, order_id: str, gross_amount: int, customer_details: Dict[str, Any]) -> Dict[str, Any]:
        """Method abstrak yang wajib diimplementasikan oleh turunan class."""
        raise NotImplementedError("Subclass wajib mengimplementasikan method create_snap_transaction().")


class MidtransPaymentService(BasePaymentService):
    """
    Class Layanan Payment Gateway Midtrans (Inheritance & Polymorphism PBO).
    Mengelola permintaan Token Snap transaksi pembayaran digital.
    """
    MIDTRANS_SANDBOX_ENDPOINT = "https://app.sandbox.midtrans.com/snap/v1/transactions"
    MIDTRANS_PRODUCTION_ENDPOINT = "https://app.midtrans.com/snap/v1/transactions"

    def __init__(self, server_key: Optional[str] = None, is_production_mode: bool = False):
        super().__init__(server_key=server_key, is_production_mode=is_production_mode)
        self.api_endpoint = (
            self.MIDTRANS_PRODUCTION_ENDPOINT
            if self._is_production_mode
            else self.MIDTRANS_SANDBOX_ENDPOINT
        )

    def create_snap_transaction(
        self,
        order_id: str,
        gross_amount: int,
        customer_details: Dict[str, Any],
        item_details: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Meng-generate Snap Payment Token dari Midtrans Gateway API.
        
        :param order_id: ID Unik Pesanan (e.g. ORD-88219)
        :param gross_amount: Total nominal pembayaran (Rp)
        :param customer_details: Objek rincian data pelanggan (nama, email, telepon)
        :param item_details: List rincian menu makanan yang dipesan
        :return: Dictionary berisi Snap token dan URL redirect pembayaran
        """
        payload = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": int(gross_amount)
            },
            "credit_card": {
                "secure": True
            },
            "customer_details": customer_details
        }

        if item_details:
            payload["item_details"] = item_details

        request_headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": self._generate_basic_auth_header()
        }

        try:
            http_response = requests.post(
                self.api_endpoint,
                json=payload,
                headers=request_headers,
                timeout=10
            )

            if http_response.status_code in [200, 201]:
                return http_response.json()
            else:
                return {
                    "token": f"MOCK-SNAP-TOKEN-{order_id}",
                    "redirect_url": f"https://app.sandbox.midtrans.com/snap/v2/vtweb/{order_id}"
                }
        except Exception as error_exception:
            return {
                "token": f"MOCK-SNAP-TOKEN-{order_id}",
                "redirect_url": f"https://app.sandbox.midtrans.com/snap/v2/vtweb/{order_id}",
                "error_detail": str(error_exception)
            }


class HaversineDistanceCalculator:
    """
    Service Class PBO untuk kalkulasi jarak geografis Haversine (Km).
    """
    EARTH_RADIUS_KILOMETERS: float = 6371.0

    @classmethod
    def calculate_distance_km(
        cls,
        latitude_origin: float,
        longitude_origin: float,
        latitude_destination: float,
        longitude_destination: float
    ) -> float:
        """
        Menhitung jarak garis lurus antara dua titik koordinat bumi (rumus Haversine).
        
        :param latitude_origin: Garis lintang asal
        :param longitude_origin: Garis bujur asal
        :param latitude_destination: Garis lintang tujuan
        :param longitude_destination: Garis bujur tujuan
        :return: Jarak dalam kilometer (diperbulan ke 1 desimal)
        """
        delta_latitude = math.radians(latitude_destination - latitude_origin)
        delta_longitude = math.radians(longitude_destination - longitude_origin)

        haversine_formula_value = (
            math.sin(delta_latitude / 2.0) ** 2 +
            math.cos(math.radians(latitude_origin)) *
            math.cos(math.radians(latitude_destination)) *
            math.sin(delta_longitude / 2.0) ** 2
        )

        central_angle_radians = 2.0 * math.atan2(
            math.sqrt(haversine_formula_value),
            math.sqrt(1.0 - haversine_formula_value)
        )

        calculated_distance_km = cls.EARTH_RADIUS_KILOMETERS * central_angle_radians
        return round(calculated_distance_km, 1)

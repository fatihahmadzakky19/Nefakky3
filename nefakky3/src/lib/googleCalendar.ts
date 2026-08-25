/**
 * ============================================================================
 * UTILITY: Google Calendar API & Event Sync (src/lib/googleCalendar.ts)
 * DESKRIPSI: Modul integrasi Google Calendar untuk sinkronisasi otomatis:
 *            - Jadwal Pengiriman Pesanan Masuk (Kitchen Desk Delivery Milestones)
 *            - Agenda Bazar Event & Penjualan Offline (Business Overview)
 *            - Pengingat Masa Berlaku Promo & Voucher (Promotions Desk)
 *            - Pengingat Restock & Operasional Dapur Toko
 * ============================================================================
 */

export interface GoogleCalendarEventOptions {
  title: string;
  description?: string;
  location?: string;
  startTime: Date | number | string;
  endTime?: Date | number | string;
  allDay?: boolean;
}

/**
 * Format tanggal ke standar Google Calendar URL (YYYYMMDDTHHMMSSZ atau YYYYMMDD untuk All Day)
 */
const formatGCalDate = (date: Date, isAllDay: boolean = false): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());

  if (isAllDay) {
    return `${year}${month}${day}`;
  }

  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

/**
 * Membuat tautan 1-klik langsung ke Google Calendar Web / Mobile App
 * Membuka jendela Google Calendar dengan seluruh data pesanan/event yang terisi otomatis.
 */
export const createGoogleCalendarUrl = (options: GoogleCalendarEventOptions): string => {
  const start = new Date(options.startTime);
  const isAllDay = options.allDay === true;
  
  // Jika endTime tidak ditentukan, default ke 1.5 jam setelah startTime
  const end = options.endTime 
    ? new Date(options.endTime) 
    : isAllDay 
    ? new Date(start.getTime() + 24 * 60 * 60 * 1000) 
    : new Date(start.getTime() + 90 * 60 * 1000);

  const startStr = formatGCalDate(start, isAllDay);
  const endStr = formatGCalDate(end, isAllDay);

  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: options.title,
    dates: `${startStr}/${endStr}`,
    details: options.description || '',
    location: options.location || 'Nefakky Kitchen Jakarta'
  });

  return `${baseUrl}&${params.toString()}`;
};

/**
 * Template Helper: Sinkronisasi Pesanan Pelanggan ke Google Calendar
 */
export const createOrderCalendarUrl = (order: any): string => {
  const orderId = order.id || 'ORD-0000';
  const customer = order.customerName || 'Pelanggan';
  const address = order.address || 'Alamat Toko';
  const totalStr = `Rp ${(order.total || 0).toLocaleString('id-ID')}`;
  const itemsSummary = (order.items || [])
    .map((it: any) => `• ${it.name} (${it.quantity}x) - Rp ${((it.price || 0) * (it.quantity || 1)).toLocaleString('id-ID')}`)
    .join('\n');

  const title = `[Nefakky] Pengiriman Pesanan #${orderId} - ${customer}`;
  
  const description = `
DETAIL PESANAN NEFAKKY MARKETPLACE:
=========================================
• ID Pesanan    : #${orderId}
• Nama Pembeli  : ${customer}
• Telepon       : ${order.phone || '0812-3456-7890'}
• Alamat Antar  : ${address}
• Metode Bayar  : ${order.paymentMethod || 'Midtrans QRIS'}
• Total Tagihan : ${totalStr}
• Status        : ${order.status || 'COOKING'}

DAFTAR MENU HIDANGAN:
${itemsSummary || '• Menu Pesanan Standar'}

CATATAN OPERASIONAL:
Harap pastikan kurir mengantarkan hidangan dalam kondisi hangat dan meminta konfirmasi penerimaan pesanan.
=========================================
Sistem Otomasi Dapur Nefakky
  `.trim();

  // Waktu pengiriman (Jika ada createdAt, gunakan + 45 menit untuk estimasi tiba)
  const baseTime = order.createdAt ? new Date(order.createdAt) : new Date();
  const deliveryStart = new Date(baseTime.getTime() + 15 * 60 * 1000); // 15 menit persiapan
  const deliveryEnd = new Date(baseTime.getTime() + 60 * 60 * 1000);   // 45 menit pengantaran

  return createGoogleCalendarUrl({
    title,
    description,
    location: address,
    startTime: deliveryStart,
    endTime: deliveryEnd
  });
};

/**
 * Template Helper: Sinkronisasi Event Bazar / Penjualan Offline ke Google Calendar
 */
export const createBazarCalendarUrl = (bazarName: string, dateInfo: string, targetOmset: number, note: string): string => {
  const title = `[Nefakky Event] ${bazarName} - Penjualan & Bazar`;
  
  const description = `
AGENDA EVENT BAZAR NEFAKKY:
=========================================
• Nama Event   : ${bazarName}
• Periode      : ${dateInfo}
• Target Omset : Rp ${targetOmset.toLocaleString('id-ID')}
• Catatan      : ${note}

PERSIAPAN LOGISTIK BAZAR:
1. Booth & Banner Promosi Nefakky
2. Stok Ayam Bakar, Gudeg, Nasi Bakar, & Aneka Jus Segar
3. Stand QRIS & Mesin Kasir / Struk
4. Wadah Higienis & Kemasan Takeaway
=========================================
Nefakky Store Management
  `.trim();

  const now = new Date();
  return createGoogleCalendarUrl({
    title,
    description,
    location: 'Area Booth Event / Festival Kuliner Jakarta',
    startTime: now,
    endTime: new Date(now.getTime() + 8 * 60 * 60 * 1000) // 8 jam acara bazar
  });
};

/**
 * Template Helper: Sinkronisasi Jadwal Promo / Voucher ke Google Calendar
 */
export const createPromoCalendarUrl = (promoTitle: string, voucherCode: string, expiryInfo: string): string => {
  const title = `[Nefakky Promo] Masa Berlaku Voucher ${voucherCode} (${promoTitle})`;
  
  const description = `
PENGINGAT PROMOSI NEFAKKY:
=========================================
• Nama Promo   : ${promoTitle}
• Kode Voucher : ${voucherCode}
• Masa Berlaku : ${expiryInfo}

TINDAKAN ADMIN:
1. Pantau kuota penukaran voucher di tab Promotions
2. Evaluasi efektivitas kenaikan omset dari promo ini
=========================================
  `.trim();

  const now = new Date();
  return createGoogleCalendarUrl({
    title,
    description,
    location: 'Nefakky Online Store',
    startTime: now,
    endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000)
  });
};

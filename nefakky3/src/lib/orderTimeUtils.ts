/**
 * Utility helper untuk mendeteksi dan memformat Waktu, Jam, Hari, Tanggal, Bulan, dan Tahun
 * secara presisi & realtime untuk setiap transaksi toko & pesanan online.
 *
 * STANDAR WAKTU TUNGgal: seluruh field tanggal/jam yang dihasilkan util ini diturunkan
 * dari jam Asia/Jakarta (WIB) agar KONSISTEN dengan label "WIB" di UI, string `order.date`,
 * dan seluruh filter rentang waktu (Hari Ini / Minggu / Bulan / Tahun) — terlepas dari
 * timezone mesin/browser. (Bug lama: tanggal kartu admin dihitung dengan timezone lokal
 * mesin sementara filter memakai WIB, sehingga tanggal bisa beda hingga 1 hari dan
 * pesanan baru tidak muncul di tab "Hari Ini".)
 */

export interface DetailedOrderDateTime {
  dayName: string;       // Contoh: "Senin", "Selasa", dll.
  fullDateStr: string;   // Contoh: "24 Agu 2026"
  fullLongDateStr: string; // Contoh: "24 Agustus 2026"
  timeStr: string;       // Contoh: "14:30:25 WIB"
  shortTimeStr: string;  // Contoh: "14:30 WIB"
  monthName: string;     // Contoh: "Agustus"
  year: number;          // Contoh: 2026
  dateNum: number;       // Contoh: 24
  monthIndex: number;    // 0-11 (indeks bulan WIB, untuk agregasi bulanan dashboard)
  combinedLabel: string; // Contoh: "Senin, 24 Agu 2026 • 14:30 WIB"
  fullReceiptLabel: string; // Contoh: "Senin, 24 Agustus 2026 14:30:25 WIB"
  isToday: boolean;
  /**
   * Instant epoch SEJATI (bukan wall-clock hasil konversi timezone).
   * Aman untuk di-sort (getTime()) dan aman dilewatkan ke getJakartaDate()
   * pada filter rentang waktu tanpa konversi ganda.
   */
  dateObj: Date;
}

const DAYS_OF_WEEK = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Offset WIB (Asia/Jakarta) dari UTC dalam ms — WIB tidak memakai DST (UTC+7 tetap). */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Mengubah komponen kalender (yang diasumsikan jam dinding WIB) menjadi instant epoch
 * sejati: Date.UTC(komponen) - 7 jam.
 * Bug lama: komponen WIB dibangun dengan `new Date(y,m,d,...)` (timezone lokal mesin),
 * lalu isOrderToday() mengonversinya SEKALI LAGI ke WIB → bergeser +offset timezone
 * (di mesin GMT-7 = +14 jam) sehingga pesanan jatuh ke hari berikutnya dan hilang
 * dari tab "Hari Ini".
 */
const wibWallClockToInstant = (
  year: number, monthIndex: number, day: number,
  hour: number, minute: number, second: number
): Date => {
  const ms = Date.UTC(year, monthIndex, day, hour, minute, second) - WIB_OFFSET_MS;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? new Date() : d;
};

/**
 * Parser string tanggal bahasa Indonesia (misal: "Senin, 24 Agu 2026 • 12:45:00 WIB" atau "11 September 2026")
 * Komponen hasil parse DIARTIKAN sebagai jam dinding WIB dan dikembalikan sebagai instant epoch sejati.
 */
export const parseIndonesianDateStringToDate = (str?: string): Date | null => {
  if (!str || typeof str !== 'string') return null;

  const MONTH_DICT: Record<string, number> = {
    jan: 0, januari: 0,
    feb: 1, februari: 1,
    mar: 2, maret: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5,
    jul: 6, juli: 6,
    agu: 7, agustus: 7, aug: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9, october: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11, december: 11
  };

  // 0. ISO dengan offset zona eksplisit (contoh: "2026-09-23T18:00:00Z" / "+07:00")
  //    Serahkan ke parser native agar offset aslinya dihormati (bukan diartikan sebagai WIB).
  if (/T\d{1,2}:\d{2}/.test(str) && /(Z|[+-]\d{2}:?\d{2})\s*$/.test(str)) {
    const native = new Date(str);
    if (!isNaN(native.getTime())) return native;
  }

  // 1. Check format ISO YYYY-MM-DD (tanpa offset → dianggap jam dinding WIB)
  const isoMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const timeMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    const hr = timeMatch ? parseInt(timeMatch[1], 10) : 12;
    const min = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const sec = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    return wibWallClockToInstant(y, m, d, hr % 24, min, sec);
  }

  // 2. Check format Indonesia: misal "24 Agu 2026" atau "11 September 2026"
  const dateMatch = str.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (dateMatch) {
    const d = parseInt(dateMatch[1], 10);
    const mKey = dateMatch[2].toLowerCase();
    const y = parseInt(dateMatch[3], 10);
    const m = MONTH_DICT[mKey] ?? MONTH_DICT[mKey.slice(0, 3)];
    if (m !== undefined) {
      const timeMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      const hr = timeMatch ? parseInt(timeMatch[1], 10) : 12;
      const min = timeMatch ? parseInt(timeMatch[2], 10) : 0;
      const sec = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      return wibWallClockToInstant(y, m, d, hr % 24, min, sec);
    }
  }

  return null;
};

/**
 * Mengambil instant epoch sejati dari berbagai bentuk data waktu pesanan:
 * - `createdAt` milidetik (number) atau detik (number kecil)
 * - `createdAt` Firestore Timestamp-like ({seconds, nanoseconds} atau {toDate()})
 * - `createdAt` string ISO
 * - string `order.date` berformat Indonesia/WIB (wall-clock WIB → instant)
 * - fallback: `updatedAt`, lalu waktu SEKARANG.
 * Bug lama: jika kedua sumber hilang, tanggal order DIPALSUKAN acak 1-24 hari ke
 * belakang, sehingga pesanan baru salah tanggal dan tidak pernah masuk "Hari Ini".
 */
const resolveOrderInstant = (order: any): Date => {
  const ca = order?.createdAt;

  // 1. number: milidetik (epoch > 1e12) atau detik (epoch < 1e12)
  if (typeof ca === 'number' && ca > 0) {
    const ms = ca < 1e12 ? ca * 1000 : ca;
    const parsed = new Date(ms);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // 2. Firestore Timestamp-like: {seconds, nanoseconds} atau {toDate()}
  if (ca && typeof ca === 'object') {
    if (typeof (ca as any).seconds === 'number') {
      const ms = (ca as any).seconds * 1000 + Math.floor(((ca as any).nanoseconds || 0) / 1e6);
      const parsed = new Date(ms);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (typeof (ca as any).toDate === 'function') {
      try {
        const td = (ca as any).toDate();
        const t = td instanceof Date ? td.getTime() : NaN;
        if (!isNaN(t) && t > 0) return new Date(t);
      } catch (e) {
        // Abaikan, lanjut ke sumber berikutnya
      }
    }
  }

  // 3. string ISO
  if (typeof ca === 'string' && ca) {
    const parsed = new Date(ca);
    if (!isNaN(parsed.getTime()) && parsed.getTime() > 0) return parsed;
  }

  // 4. Parse string `order.date` (wall-clock WIB → instant)
  if (order?.date && typeof order.date === 'string') {
    const parsed = parseIndonesianDateStringToDate(order.date);
    if (parsed && !isNaN(parsed.getTime())) return parsed;
  }

  // 5. `updatedAt` sebagai perkiraan terbaik berikutnya
  if (typeof order?.updatedAt === 'number' && order.updatedAt > 0) {
    return new Date(order.updatedAt);
  }

  // 6. Waktu sekarang — pesanan tanpa stempel waktu dianggap baru (bukan tanggal lampau).
  return new Date();
};

/**
 * Mengonversi order apa pun (berdasarkan createdAt timestamp atau string tanggal)
 * menjadi objek tanggal terperinci yang memuat Hari, Tanggal, Bulan, Tahun, Jam & Detik.
 * SELURUH field diturunkan dari jam Asia/Jakarta (WIB).
 */
export const getDetailedOrderDateTime = (order: any, fallbackIdx: number = 0): DetailedOrderDateTime => {
  // Instant epoch sejati untuk order ini (lihat resolveOrderInstant)
  const instant = resolveOrderInstant(order);

  // Representasi dinding WIB: field lokal Date ini SELALU berisi komponen WIB,
  // sehingga label "WIB" pada UI akurat di timezone mesin mana pun.
  const d = getJakartaDate(instant);
  const nowWib = getJakartaDate(new Date());

  const isToday =
    d.getDate() === nowWib.getDate() &&
    d.getMonth() === nowWib.getMonth() &&
    d.getFullYear() === nowWib.getFullYear();

  const dayName = DAYS_OF_WEEK[d.getDay()];
  const dateNum = d.getDate();
  const monthIndex = d.getMonth();
  const monthName = MONTH_NAMES[monthIndex];
  const shortMonth = SHORT_MONTH_NAMES[monthIndex];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const fullDateStr = `${dateNum} ${shortMonth} ${year}`;
  const fullLongDateStr = `${dateNum} ${monthName} ${year}`;
  const timeStr = `${hours}:${minutes}:${seconds} WIB`;
  const shortTimeStr = `${hours}:${minutes} WIB`;
  const combinedLabel = `${dayName}, ${fullDateStr} • ${shortTimeStr}`;
  const fullReceiptLabel = `${dayName}, ${fullLongDateStr} ${timeStr}`;

  return {
    dayName,
    fullDateStr,
    fullLongDateStr,
    timeStr,
    shortTimeStr,
    monthName,
    year,
    dateNum,
    monthIndex,
    combinedLabel,
    fullReceiptLabel,
    isToday,
    dateObj: instant
  };
};

/**
 * Mengonversi waktu apa pun ke objek Date dengan kalender dan jam Asia/Jakarta (WIB).
 */
export const getJakartaDate = (input?: Date | number | string): Date => {
  let d: Date;
  if (!input) {
    d = new Date();
  } else if (typeof input === 'number') {
    d = new Date(input);
  } else if (input instanceof Date) {
    d = input;
  } else {
    const parsed = parseIndonesianDateStringToDate(input);
    d = parsed || new Date(input);
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  try {
    const jakartaFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    const parts = jakartaFormatter.formatToParts(d);
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    return new Date(
      getPart('year'),
      getPart('month') - 1,
      getPart('day'),
      getPart('hour') % 24,
      getPart('minute'),
      getPart('second')
    );
  } catch (e) {
    return d;
  }
};

/**
 * Memeriksa apakah pesanan dilakukan pada Hari Ini (WIB Asia/Jakarta).
 */
export const isOrderToday = (order: any, nowRef?: Date): boolean => {
  const orderDateTime = getDetailedOrderDateTime(order);
  const orderJak = getJakartaDate(orderDateTime.dateObj);
  const nowJak = getJakartaDate(nowRef || new Date());
  return (
    orderJak.getFullYear() === nowJak.getFullYear() &&
    orderJak.getMonth() === nowJak.getMonth() &&
    orderJak.getDate() === nowJak.getDate()
  );
};

/**
 * Memeriksa apakah pesanan dilakukan pada Minggu Berjalan (Senin - Minggu WIB Asia/Jakarta).
 */
export const isOrderThisWeek = (order: any, nowRef?: Date): boolean => {
  const orderDateTime = getDetailedOrderDateTime(order);
  const orderJak = getJakartaDate(orderDateTime.dateObj);
  const nowJak = getJakartaDate(nowRef || new Date());

  const dayOfWeek = nowJak.getDay(); // 0 = Minggu, 1 = Senin
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(nowJak.getFullYear(), nowJak.getMonth(), nowJak.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  return orderJak.getTime() >= monday.getTime() && orderJak.getTime() <= sunday.getTime();
};

/**
 * Memeriksa apakah pesanan dilakukan pada Bulan Berjalan (WIB Asia/Jakarta).
 */
export const isOrderThisMonth = (order: any, nowRef?: Date): boolean => {
  const orderDateTime = getDetailedOrderDateTime(order);
  const orderJak = getJakartaDate(orderDateTime.dateObj);
  const nowJak = getJakartaDate(nowRef || new Date());
  return (
    orderJak.getFullYear() === nowJak.getFullYear() &&
    orderJak.getMonth() === nowJak.getMonth()
  );
};

/**
 * Memeriksa apakah pesanan dilakukan pada Tahun Berjalan (WIB Asia/Jakarta).
 */
export const isOrderThisYear = (order: any, nowRef?: Date): boolean => {
  const orderDateTime = getDetailedOrderDateTime(order);
  const orderJak = getJakartaDate(orderDateTime.dateObj);
  const nowJak = getJakartaDate(nowRef || new Date());
  return orderJak.getFullYear() === nowJak.getFullYear();
};

/**
 * Format string tanggal & waktu saat ini untuk pesanan baru yang masuk realtime (WIB).
 */
export const formatCurrentRealtimeOrderDate = (dateObj: Date = new Date()): string => {
  const jakDate = getJakartaDate(dateObj);
  const dayName = DAYS_OF_WEEK[jakDate.getDay()];
  const dateNum = jakDate.getDate();
  const shortMonth = SHORT_MONTH_NAMES[jakDate.getMonth()];
  const year = jakDate.getFullYear();
  const hours = String(jakDate.getHours()).padStart(2, '0');
  const minutes = String(jakDate.getMinutes()).padStart(2, '0');
  const seconds = String(jakDate.getSeconds()).padStart(2, '0');

  return `${dayName}, ${dateNum} ${shortMonth} ${year} • ${hours}:${minutes}:${seconds} WIB`;
};

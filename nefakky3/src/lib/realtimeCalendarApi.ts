/**
 * ============================================================================
 * SERVICE: Realtime Calendar & Time API (src/lib/realtimeCalendarApi.ts)
 * DESKRIPSI: Layanan API Kalender & Waktu Realtime Presisi Tinggi (WIB / Asia/Jakarta)
 *            untuk mendeteksi Hari, Tanggal, Bulan, Tahun, Jam, Menit, & Detik
 *            secara otomatis pada setiap transaksi dan aktivitas pengguna.
 * ============================================================================
 */

export interface RealtimeCalendarInfo {
  timestamp: number;
  dayName: string;         // "Senin", "Selasa", dll.
  dayIndex: number;        // 0 = Minggu, 1 = Senin, dst.
  dateNum: number;         // 1 - 31
  monthNum: number;        // 1 - 12
  monthName: string;       // "Januari" - "Desember"
  shortMonth: string;      // "Jan" - "Des"
  year: number;            // 2026
  timeStr: string;         // "13:35:20 WIB"
  shortTimeStr: string;    // "13:35 WIB"
  hours: string;           // "13"
  minutes: string;         // "35"
  seconds: string;         // "20"
  formattedFull: string;   // "Senin, 25 Agustus 2026 • 13:35:20 WIB"
  formattedShort: string;  // "Senin, 25 Agu 2026 • 13:35 WIB"
  isoString: string;
  source: 'server_api' | 'world_time_api' | 'local_synced';
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Selisih offset waktu (drift offset) antara perangkat lokal dan server kalender
let serverClockOffsetMs = 0;
let isClockSynced = false;

/**
 * Sinkronisasi jam kalender dengan Server / World Time API
 */
export const syncRealtimeCalendarClock = async (): Promise<number> => {
  try {
    const startTime = performance.now();
    const res = await fetch('/api/calendar/time', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const endTime = performance.now();
      const latency = (endTime - startTime) / 2;
      const serverTimestamp = data.timestamp;
      serverClockOffsetMs = serverTimestamp + latency - Date.now();
      isClockSynced = true;
      return serverClockOffsetMs;
    }
  } catch (err) {
    console.warn('Realtime Calendar sync fallback to high-precision local clock:', err);
  }
  return 0;
};

/**
 * Mendapatkan data Kalender & Waktu Realtime saat ini (Presisi WIB)
 */
export const getRealtimeCalendarNow = (): RealtimeCalendarInfo => {
  const currentEpoch = Date.now() + (isClockSynced ? serverClockOffsetMs : 0);
  return parseCalendarInfoFromDate(new Date(currentEpoch), isClockSynced ? 'server_api' : 'local_synced');
};

/**
 * Mengonversi tanggal/timestamp transaksi apa pun menjadi informasi kalender terperinci
 */
export const parseCalendarInfoFromDate = (dateInput?: Date | number | string, source: 'server_api' | 'world_time_api' | 'local_synced' = 'local_synced'): RealtimeCalendarInfo => {
  let d: Date;
  if (!dateInput) {
    d = new Date(Date.now() + (isClockSynced ? serverClockOffsetMs : 0));
  } else if (typeof dateInput === 'number') {
    d = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    const parsed = new Date(dateInput);
    d = isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  const dayIndex = d.getDay();
  const dayName = DAYS[dayIndex];
  const dateNum = d.getDate();
  const monthIndex = d.getMonth();
  const monthNum = monthIndex + 1;
  const monthName = MONTHS[monthIndex];
  const shortMonth = SHORT_MONTHS[monthIndex];
  const year = d.getFullYear();

  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  const timeStr = `${hours}:${minutes}:${seconds} WIB`;
  const shortTimeStr = `${hours}:${minutes} WIB`;
  const formattedFull = `${dayName}, ${dateNum} ${monthName} ${year} • ${timeStr}`;
  const formattedShort = `${dayName}, ${dateNum} ${shortMonth} ${year} • ${shortTimeStr}`;

  return {
    timestamp: d.getTime(),
    dayName,
    dayIndex,
    dateNum,
    monthNum,
    monthName,
    shortMonth,
    year,
    timeStr,
    shortTimeStr,
    hours,
    minutes,
    seconds,
    formattedFull,
    formattedShort,
    isoString: d.toISOString(),
    source
  };
};

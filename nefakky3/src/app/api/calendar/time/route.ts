import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export async function GET() {
  try {
    const now = new Date();
    
    const dayIndex = now.getDay();
    const dayName = DAYS[dayIndex];
    const dateNum = now.getDate();
    const monthIndex = now.getMonth();
    const monthNum = monthIndex + 1;
    const monthName = MONTHS[monthIndex];
    const shortMonth = SHORT_MONTHS[monthIndex];
    const year = now.getFullYear();

    const pad = (n: number) => String(n).padStart(2, '0');
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    const timeStr = `${hours}:${minutes}:${seconds} WIB`;
    const shortTimeStr = `${hours}:${minutes} WIB`;
    const formattedFull = `${dayName}, ${dateNum} ${monthName} ${year} • ${timeStr}`;
    const formattedShort = `${dayName}, ${dateNum} ${shortMonth} ${year} • ${shortTimeStr}`;

    return NextResponse.json({
      success: true,
      timestamp: now.getTime(),
      iso: now.toISOString(),
      timezone: 'Asia/Jakarta (WIB)',
      calendar: {
        dayName,
        dayIndex,
        dateNum,
        monthNum,
        monthName,
        shortMonth,
        year,
        hours,
        minutes,
        seconds,
        timeStr,
        shortTimeStr,
        formattedFull,
        formattedShort
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Gagal mengambil waktu kalender server.'
    }, { status: 500 });
  }
}

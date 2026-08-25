import { NextRequest, NextResponse } from 'next/server';
import { createGoogleCalendarUrl, createOrderCalendarUrl, createBazarCalendarUrl } from '@/lib/googleCalendar';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, order, bazarName, dateInfo, targetOmset, note, title, description, location, startTime, endTime } = body;

    let calendarUrl = '';

    if (type === 'order' && order) {
      calendarUrl = createOrderCalendarUrl(order);
    } else if (type === 'bazar') {
      calendarUrl = createBazarCalendarUrl(bazarName || 'Bazar Event', dateInfo || 'Agustus 2026', targetOmset || 3500000, note || 'Operasional Bazar');
    } else if (title && startTime) {
      calendarUrl = createGoogleCalendarUrl({
        title,
        description,
        location,
        startTime,
        endTime
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Parameter tidak valid untuk sinkronisasi Google Calendar.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tautan agenda Google Calendar berhasil dibuat.',
      calendarUrl,
      syncedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('API Google Calendar Sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Gagal memproses sinkronisasi Google Calendar.'
    }, { status: 500 });
  }
}

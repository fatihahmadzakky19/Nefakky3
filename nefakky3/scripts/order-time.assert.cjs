// ===========================================================================
// ASERSI REGRESI BUG PEMESANAN (CommonJS — dijalankan test-order-time.mjs)
// Bug #1: tanggal kartu admin harus WIB (bukan timezone mesin) dan konsisten
//         dengan string `order.date` saat checkout.
// Bug #2: pesanan baru harus masuk tab "Hari Ini" (filter isOrderToday WIB).
// ===========================================================================
const path = require('path');
const u = require(path.join(__dirname, '..', '.order-time-test', 'orderTimeUtils.js'));

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const failures = [];
const check = (name, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(`${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

// Ground truth WIB via Intl dengan zona eksplisit (independen dari TZ proses)
const wibParts = (ms) => {
  const p = {};
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; });
  return { y: +p.year, mo: +p.month, d: +p.day, h: p.hour === '24' ? '00' : p.hour, mi: p.minute, s: p.second };
};

// 1. (Bug #1) Tanggal kartu admin harus dihitung dalam WIB, bukan timezone mesin
const t1 = Date.UTC(2026, 8, 23, 17, 30); // = 24 Sep 2026 00:30 WIB
const info1 = u.getDetailedOrderDateTime({ createdAt: t1 });
check('kartu.tanggal', info1.fullDateStr, '24 Sep 2026');
check('kartu.jam', info1.timeStr, '00:30:00 WIB');
check('kartu.hari', info1.dayName, DAYS[new Date(Date.UTC(2026, 8, 24)).getUTCDay()]);
check('kartu.bulanIndex', info1.monthIndex, 8);
check('kartu.tanggalNum', info1.dateNum, 24);

// 2. (Bug #1) String checkout (`order.date`) & tampilan kartu admin harus konsisten
[t1, Date.UTC(2026, 8, 23, 10, 0), Date.now() - 3600e3].forEach((t, i) => {
  const info = u.getDetailedOrderDateTime({ createdAt: t });
  const s = u.formatCurrentRealtimeOrderDate(new Date(t));
  check('konsistensiCheckoutVsKartu[' + i + ']', s.startsWith(info.dayName + ', ' + info.fullDateStr), true);
});

// 3. (Bug #2) Pesanan baru harus masuk tab "Hari Ini", pesanan lama tidak
check('hariIni.pesananBaru', u.isOrderToday({ createdAt: Date.now() }), true);
check('hariIni.pesanan2HariLalu', u.isOrderToday({ createdAt: Date.now() - 2 * 86400e3 }), false);

// 4. (Bug #1 & #2) Pesanan yang hanya punya string `date` (tanpa createdAt):
//    harus tampil hari ini dengan tanggal yang sama seperti string — bukan tanggal lampau palsu
const base = new Date();
const nowStr = u.formatCurrentRealtimeOrderDate(base);
const g = wibParts(base.getTime());
const expectedToday = g.d + ' ' + SHORT[g.mo - 1] + ' ' + g.y;
const viaStr = { id: 'NFK-999999', date: nowStr };
check('stringDate.tanggal', u.getDetailedOrderDateTime(viaStr).fullDateStr, expectedToday);
check('stringDate.hariIni', u.isOrderToday(viaStr), true);
check('kartu.tanggalSekarang', u.getDetailedOrderDateTime({ createdAt: base.getTime() }).fullDateStr, expectedToday);

// 5. createdAt berbentuk Firestore Timestamp-like ({seconds, nanoseconds})
check(
  'timestampObjek',
  u.getDetailedOrderDateTime({ createdAt: { seconds: Math.floor(t1 / 1000), nanoseconds: 0 } }).fullDateStr,
  '24 Sep 2026'
);

// 6. Order tanpa stempel waktu sama sekali dianggap BARU (bukan tanggal lampau acak)
check('tanpaStempel.hariIni', u.isOrderToday({ id: 'NFK-111111' }), true);

// 7. Parser tanggal Indonesia menghasilkan instant WIB yang tepat
const parsed = u.parseIndonesianDateStringToDate('23 Sep 2026 18:00:00');
const pInfo = u.getDetailedOrderDateTime({ createdAt: parsed.getTime() });
check('parser.tanggal', pInfo.fullDateStr, '23 Sep 2026');
check('parser.jam', pInfo.timeStr, '18:00:00 WIB');

if (failures.length > 0) {
  console.error('FAIL:\n - ' + failures.join('\n - '));
  process.exit(1);
}
console.log('OK — semua asersi lulus (TZ proses: ' + (process.env.TZ || 'default') + ')');
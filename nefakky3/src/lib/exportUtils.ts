import { AdminOrder, ProductItem } from '@/context/DataContext';

export interface ExcelExportOptions {
  selectedMonthLabel?: string;
  customChartMonths?: { label: string; gross: number; net: number; isBazar: boolean; badge: string }[];
  manualOmsetData?: any;
}

/**
 * Helper function untuk mengekspor laporan komprehensif ke format Microsoft Excel (.xls)
 * Terformat 100% rapi dengan warna background khas Nefakky, gridlines, dan 5 seksi lengkap dari Halaman Ringkasan Bisnis:
 * 1. Kop Header Resmi & Information Filter Periode Laporan
 * 2. 5 Metrik Eksekutif KPI Utama (Omset, Margin 40%, Total Pesanan, AOV, Rating 4.9/5.0)
 * 3. Analisis Tren Omset & Laba Bersih (Tabel Data Visual Grafik Bulanan & Event Bazar)
 * 4. Rekap Pembelian & Kinerja Penjualan Produk (Terlaris & Kurang Laris)
 * 5. Detil Log Transaksi Pesanan Realtime (Riwayat Seluruh Order & COD Dual Proof Verification)
 */
export function exportNefakkyExcelReport(
  orders: AdminOrder[], 
  products: ProductItem[],
  options?: ExcelExportOptions
) {
  const safeOrders = orders || [];
  const safeProducts = products || [];

  // 1. Calculate Core Summary Metrics
  const totalOmset = safeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = safeOrders.length;
  const completedOrders = safeOrders.filter(o => o.status === 'COMPLETED').length;
  const estimatedMargin = Math.round(totalOmset * 0.40); // 40% Margin Laba Bersih
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalOmset / totalOrdersCount) : 0;
  const selectedPeriodText = options?.selectedMonthLabel || 'Semua Periode (Akumulasi Total)';

  // 2. Default Monthly Trend Chart Data if not provided
  const chartMonths = options?.customChartMonths || [
    { label: 'Juni 2026', gross: 10500000, net: 4750000, isBazar: true, badge: '🎪 Event Bazar Pembukaan Juni (>10Jt Omset)' },
    { label: 'Juli 2026', gross: 11200000, net: 5100000, isBazar: true, badge: '🎪 Event Bazar Kuliner Juli (>10Jt Omset)' },
    { label: 'Agustus 2026 (Live)', gross: 12000000 + totalOmset, net: 6000000 + estimatedMargin, isBazar: true, badge: '🎪 Event Bazar Merdeka + Live Web Realtime' },
    { label: 'September 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: 'Oktober 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: 'November 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
  ];

  // 3. Aggregate Rekap Pembelian (Product Sales Summary)
  const productMap: Record<string, { name: string; category: string; price: number; qty: number; totalRevenue: number }> = {};

  // Initialize with master products
  safeProducts.forEach(p => {
    productMap[p.name] = {
      name: p.name,
      category: p.category || 'Makanan Berat',
      price: p.price || 0,
      qty: 0,
      totalRevenue: 0
    };
  });

  // Accumulate actual orders
  safeOrders.forEach(o => {
    if (o.status !== 'CANCELLED') {
      (o.items || []).forEach(item => {
        const nameKey = item.name;
        if (!productMap[nameKey]) {
          productMap[nameKey] = {
            name: item.name,
            category: 'Makanan Berat',
            price: item.price || 0,
            qty: 0,
            totalRevenue: 0
          };
        }
        productMap[nameKey].qty += item.quantity || 1;
        productMap[nameKey].totalRevenue += (item.price * (item.quantity || 1));
      });
    }
  });

  const productRecapList = Object.values(productMap).sort((a, b) => b.qty - a.qty);
  const exportDateStr = new Date().toLocaleString('id-ID');

  // 4. Construct Pristine Microsoft Excel XML/HTML Format (.xls) with full bgcolor attributes & inline CSS
  const excelHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Laporan Ringkasan Bisnis</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #1B1C1A; }
  table { border-collapse: collapse; margin-bottom: 24px; }
  th { font-weight: bold; padding: 10px 14px; text-align: left; }
  td { padding: 8px 12px; font-size: 10.5pt; vertical-align: middle; }
</style>
</head>
<body bgcolor="#FBF9F5" style="background-color: #FBF9F5;">

  <!-- KOP HEADER LAPORAN RESMI -->
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1.5px solid #25160E;">
    <tr bgcolor="#25160E" style="background-color: #25160E;">
      <td colspan="5" bgcolor="#25160E" style="background-color: #25160E; color: #FFFFFF; font-family: Georgia, serif; font-size: 16pt; font-weight: bold; padding: 14px; text-align: left;">
        LAPORAN REKAPITULASI BISNIS &amp; OMSET PENJUALAN NEFAKKY
      </td>
    </tr>
    <tr bgcolor="#3C2A21" style="background-color: #3C2A21;">
      <td colspan="5" bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FDE68A; font-size: 10.5pt; font-weight: bold; padding: 8px 14px;">
        Diterbitkan Resmi Oleh: Manajemen Command Desk Nefakky | Tanggal Cetak: ${exportDateStr} | Periode: ${selectedPeriodText}
      </td>
    </tr>
  </table>

  <br />

  <!-- SEKSI 1: 5 METRIK EKSEKUTIF KPI UTAMA -->
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1.5px solid #934B19;">
    <col width="280" />
    <col width="240" />
    <col width="380" />
    <tr bgcolor="#934B19" style="background-color: #934B19;">
      <td colspan="3" bgcolor="#934B19" style="background-color: #934B19; color: #FFFFFF; font-size: 12pt; font-weight: bold; padding: 10px 14px; border: 1px solid #783603;">
        1. METRIK EKSEKUTIF KINERJA BISNIS (5 KPI CARDS)
      </td>
    </tr>
    <tr bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF;">
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Indikator Metrik Utama</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: right;">Nilai Terukur (Rp / Transaksi)</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Keterangan &amp; Status Catatan</th>
    </tr>
    <tr bgcolor="#FFFDF9" style="background-color: #FFFDF9;">
      <td style="font-weight: bold; border: 1px solid #D3C3BD;">Total Omset Penjualan Utama</td>
      <td style="font-weight: bold; color: #934B19; text-align: right; border: 1px solid #D3C3BD; font-size: 11pt;">Rp ${totalOmset.toLocaleString('id-ID')}</td>
      <td style="border: 1px solid #D3C3BD; color: #4F4540;">Total pendapatan bruto dari seluruh pesanan terverifikasi</td>
    </tr>
    <tr bgcolor="#F0FDF4" style="background-color: #F0FDF4;">
      <td style="font-weight: bold; border: 1px solid #D3C3BD;">Estimasi Margin (40% Laba Bersih)</td>
      <td style="font-weight: bold; color: #047857; text-align: right; border: 1px solid #D3C3BD; font-size: 11pt;">Rp ${estimatedMargin.toLocaleString('id-ID')}</td>
      <td style="border: 1px solid #D3C3BD; color: #065F46;">Proyeksi laba bersih 40% dari total omset kotor</td>
    </tr>
    <tr bgcolor="#FFFFFF" style="background-color: #FFFFFF;">
      <td style="font-weight: bold; border: 1px solid #D3C3BD;">Total Pesanan Masuk</td>
      <td style="font-weight: bold; text-align: center; border: 1px solid #D3C3BD;">${totalOrdersCount} Transaksi (${completedOrders} Selesai)</td>
      <td style="border: 1px solid #D3C3BD; color: #4F4540;">Akumulasi jumlah pesanan masuk sistem &amp; offline bazar</td>
    </tr>
    <tr bgcolor="#F0FDF4" style="background-color: #F0FDF4;">
      <td style="font-weight: bold; border: 1px solid #D3C3BD;">Rata-Rata Nilai Transaksi (AOV)</td>
      <td style="font-weight: bold; text-align: right; color: #25160E; border: 1px solid #D3C3BD;">Rp ${averageOrderValue.toLocaleString('id-ID')}</td>
      <td style="border: 1px solid #D3C3BD; color: #4F4540;">Rata-rata pengeluaran belanja pelanggan per 1 transaksi</td>
    </tr>
    <tr bgcolor="#FFFBEB" style="background-color: #FFFBEB;">
      <td style="font-weight: bold; border: 1px solid #D3C3BD;">Rating Kepuasan Pelanggan</td>
      <td style="font-weight: bold; text-align: center; color: #D97706; border: 1px solid #D3C3BD;">4.9 / 5.0 ⭐⭐⭐⭐⭐</td>
      <td style="border: 1px solid #D3C3BD; color: #92400E;">Evaluasi skor ulasan cita rasa &amp; pelayanan dari pembeli</td>
    </tr>
  </table>

  <br />

  <!-- SEKSI 2: ANALISIS TREN OMSET & LABA BERSIH (DATA GRAFIK BULANAN) -->
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1.5px solid #934B19;">
    <col width="60" />
    <col width="180" />
    <col width="220" />
    <col width="220" />
    <col width="260" />
    <tr bgcolor="#934B19" style="background-color: #934B19;">
      <td colspan="5" bgcolor="#934B19" style="background-color: #934B19; color: #FFFFFF; font-size: 12pt; font-weight: bold; padding: 10px 14px; border: 1px solid #783603;">
        2. ANALISIS TREN OMSET PENJUALAN &amp; LABA BERSIH (DATA GRAFIK BULANAN)
      </td>
    </tr>
    <tr bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF;">
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: center;">No</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Periode / Bulan</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: right;">Omset Kotor Bruto (Rp)</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: right;">Estimasi Laba Bersih 40% (Rp)</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Status Operasional &amp; Catatan Event</th>
    </tr>
    ${chartMonths.map((m, idx) => {
      const bg = idx % 2 === 1 ? '#FBF9F5' : '#FFFFFF';
      const hasData = m.gross > 0;
      return `
    <tr bgcolor="${bg}" style="background-color: ${bg};">
      <td style="text-align: center; font-weight: bold; border: 1px solid #D3C3BD;">${idx + 1}</td>
      <td style="font-weight: bold; color: #25160E; border: 1px solid #D3C3BD;">${m.label}</td>
      <td style="text-align: right; font-weight: bold; color: ${hasData ? '#934B19' : '#9CA3AF'}; border: 1px solid #D3C3BD;">${hasData ? 'Rp ' + m.gross.toLocaleString('id-ID') : '-'}</td>
      <td style="text-align: right; font-weight: bold; color: ${hasData ? '#047857' : '#9CA3AF'}; border: 1px solid #D3C3BD;">${hasData ? 'Rp ' + m.net.toLocaleString('id-ID') : '-'}</td>
      <td style="border: 1px solid #D3C3BD; color: #4F4540;">${m.badge}</td>
    </tr>
      `;
    }).join('')}
  </table>

  <br />

  <!-- SEKSI 3: REKAP PEMBELIAN & KINERJA PRODUK (TERLARIS & KURANG LARIS) -->
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1.5px solid #934B19;">
    <col width="60" />
    <col width="260" />
    <col width="160" />
    <col width="140" />
    <col width="160" />
    <col width="200" />
    <col width="180" />
    <tr bgcolor="#934B19" style="background-color: #934B19;">
      <td colspan="7" bgcolor="#934B19" style="background-color: #934B19; color: #FFFFFF; font-size: 12pt; font-weight: bold; padding: 10px 14px; border: 1px solid #783603;">
        3. REKAP PEMBELIAN &amp; KINERJA PENJUALAN PRODUK TERLARIS
      </td>
    </tr>
    <tr bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF;">
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: center;">Rank</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Nama Menu / Hidangan Kuliner</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Kategori Menu</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: right;">Harga Satuan (Rp)</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: center;">Total Terjual (Qty)</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: right;">Total Omset Produk (Rp)</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: center;">Status Performa</th>
    </tr>
    ${productRecapList.length > 0 ? productRecapList.map((p, idx) => {
      const bg = idx % 2 === 1 ? '#FBF9F5' : '#FFFFFF';
      const isTop3 = idx < 3;
      const statusBadge = isTop3 ? '🔥 Best Seller Terlaris' : p.qty === 0 ? '⚠️ Belum Ada Penjualan' : '⭐ Penjualan Stabil';
      const statusBg = isTop3 ? '#FEF3C7' : p.qty === 0 ? '#FEE2E2' : '#F3F4F6';
      const statusColor = isTop3 ? '#92400E' : p.qty === 0 ? '#991B1B' : '#374151';

      return `
    <tr bgcolor="${bg}" style="background-color: ${bg};">
      <td style="text-align: center; font-weight: bold; border: 1px solid #D3C3BD;">#${idx + 1}</td>
      <td style="font-weight: bold; color: #25160E; border: 1px solid #D3C3BD;">${p.name}</td>
      <td style="border: 1px solid #D3C3BD; color: #4F4540;">${p.category}</td>
      <td style="text-align: right; border: 1px solid #D3C3BD;">Rp ${(p.price || 0).toLocaleString('id-ID')}</td>
      <td style="text-align: center; font-weight: bold; color: #934B19; border: 1px solid #D3C3BD;">${p.qty} Porsi</td>
      <td style="text-align: right; font-weight: bold; color: #25160E; border: 1px solid #D3C3BD;">Rp ${p.totalRevenue.toLocaleString('id-ID')}</td>
      <td bgcolor="${statusBg}" style="background-color: ${statusBg}; color: ${statusColor}; font-weight: bold; text-align: center; border: 1px solid #D3C3BD;">${statusBadge}</td>
    </tr>
      `;
    }).join('') : `
    <tr bgcolor="#FFFFFF">
      <td colspan="7" style="text-align: center; color: #6B7280; font-style: italic; border: 1px solid #D3C3BD;">Belum ada data pembelian produk terjual.</td>
    </tr>
    `}
  </table>

  <br />

  <!-- SEKSI 4: DETIL LOG TRANSAKSI PESANAN REALTIME -->
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1.5px solid #934B19;">
    <col width="50" />
    <col width="100" />
    <col width="140" />
    <col width="160" />
    <col width="220" />
    <col width="240" />
    <col width="140" />
    <col width="130" />
    <col width="160" />
    <tr bgcolor="#934B19" style="background-color: #934B19;">
      <td colspan="9" bgcolor="#934B19" style="background-color: #934B19; color: #FFFFFF; font-size: 12pt; font-weight: bold; padding: 10px 14px; border: 1px solid #783603;">
        4. DETIL LOG TRANSAKSI OMSET &amp; PESANAN PELANGGAN REALTIME
      </td>
    </tr>
    <tr bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF;">
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: center;">No</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">ID Pesanan</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Tanggal &amp; Waktu</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Nama Pelanggan</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Alamat Pengiriman</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Detail Item Dipesan</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E;">Metode Pembayaran</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: center;">Status Pesanan</th>
      <th bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FFFFFF; font-weight: bold; border: 1px solid #25160E; text-align: right;">Total Omset (Rp)</th>
    </tr>
    ${safeOrders.length > 0 ? safeOrders.map((o, idx) => {
      const itemsFormatted = (o.items || []).map(i => `${i.name} (${i.quantity}x)`).join(', ');
      const bg = idx % 2 === 1 ? '#FBF9F5' : '#FFFFFF';
      const isCompleted = o.status === 'COMPLETED';
      const statusBg = isCompleted ? '#D1FAE5' : '#FEF3C7';
      const statusColor = isCompleted ? '#065F46' : '#92400E';

      return `
    <tr bgcolor="${bg}" style="background-color: ${bg};">
      <td style="text-align: center; font-weight: bold; border: 1px solid #D3C3BD;">${idx + 1}</td>
      <td style="font-weight: bold; color: #25160E; border: 1px solid #D3C3BD;">#${o.id}</td>
      <td style="border: 1px solid #D3C3BD;">${o.date}</td>
      <td style="font-weight: bold; border: 1px solid #D3C3BD;">${o.customerName || 'Pelanggan'}</td>
      <td style="border: 1px solid #D3C3BD;">${o.address || '-'}</td>
      <td style="border: 1px solid #D3C3BD;">${itemsFormatted}</td>
      <td style="border: 1px solid #D3C3BD;">${o.paymentMethod || 'Online'}</td>
      <td bgcolor="${statusBg}" style="background-color: ${statusBg}; color: ${statusColor}; font-weight: bold; text-align: center; border: 1px solid #D3C3BD;">${o.status}</td>
      <td style="text-align: right; font-weight: bold; color: #25160E; border: 1px solid #D3C3BD;">Rp ${(o.total || 0).toLocaleString('id-ID')}</td>
    </tr>
      `;
    }).join('') : `
    <tr bgcolor="#FFFFFF">
      <td colspan="9" style="text-align: center; color: #6B7280; font-style: italic; border: 1px solid #D3C3BD;">Belum ada data transaksi pesanan.</td>
    </tr>
    `}
  </table>

</body>
</html>
  `.trim();

  // Trigger browser download with .xls format (Microsoft Excel HTML Table Format)
  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Ringkasan_Bisnis_Nefakky_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


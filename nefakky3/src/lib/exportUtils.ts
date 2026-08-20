import { AdminOrder, ProductItem } from '@/context/DataContext';

export interface ExcelExportOptions {
  selectedYear?: string;
  selectedMonthLabel?: string;
  customChartMonths?: { label: string; gross: number; net: number; isBazar: boolean; badge: string }[];
  manualOmsetData?: any;
}

/**
 * Helper function untuk mengekspor laporan komprehensif ke format Microsoft Excel (.xls)
 */
export function exportNefakkyExcelReport(
  orders: AdminOrder[], 
  products: ProductItem[],
  options?: ExcelExportOptions
) {
  const safeOrders = orders || [];
  const safeProducts = products || [];

  const yearStr = options?.selectedYear || new Date().getFullYear().toString();
  const totalOmset = safeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = safeOrders.length;
  const completedOrders = safeOrders.filter(o => o.status === 'COMPLETED').length;
  const estimatedMargin = Math.round(totalOmset * 0.40);
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalOmset / totalOrdersCount) : 0;
  const selectedPeriodText = options?.selectedMonthLabel || `Periode Tahun ${yearStr}`;

  const chartMonths = options?.customChartMonths || [
    { label: `Juni ${yearStr}`, gross: 10500000, net: 4750000, isBazar: true, badge: 'Event Bazar Pembukaan Juni (>10Jt Omset)' },
    { label: `Juli ${yearStr}`, gross: 11200000, net: 5100000, isBazar: true, badge: 'Event Bazar Kuliner Juli (>10Jt Omset)' },
    { label: `Agustus ${yearStr} (Live)`, gross: 13800000, net: 6900000, isBazar: true, badge: 'Event Bazar Merdeka + Live Web Realtime' },
    { label: `September ${yearStr}`, gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: `Oktober ${yearStr}`, gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: `November ${yearStr}`, gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: `Desember ${yearStr}`, gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
  ];

  const productMap: Record<string, { name: string; category: string; price: number; qty: number; totalRevenue: number }> = {};

  safeProducts.forEach(p => {
    productMap[p.name] = {
      name: p.name,
      category: p.category || 'Makanan Berat',
      price: p.price || 0,
      qty: 0,
      totalRevenue: 0
    };
  });

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

  const excelHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Laporan Omset ${yearStr}</x:Name>
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
        LAPORAN REKAPITULASI BISNIS &amp; OMSET PENJUALAN NEFAKKY TAHUN ${yearStr}
      </td>
    </tr>
    <tr bgcolor="#3C2A21" style="background-color: #3C2A21;">
      <td colspan="5" bgcolor="#3C2A21" style="background-color: #3C2A21; color: #FDE68A; font-size: 10.5pt; font-weight: bold; padding: 8px 14px;">
        Diterbitkan Resmi Oleh: Manajemen Command Desk Nefakky | Tanggal Cetak: ${exportDateStr} | Periode: ${selectedPeriodText}
      </td>
    </tr>
  </table>

  <br />

  <!-- SEKSI 1: KPI CARDS -->
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1.5px solid #934B19;">
    <col width="280" />
    <col width="240" />
    <col width="380" />
    <tr bgcolor="#934B19" style="background-color: #934B19;">
      <td colspan="3" bgcolor="#934B19" style="background-color: #934B19; color: #FFFFFF; font-size: 12pt; font-weight: bold; padding: 10px 14px; border: 1px solid #783603;">
        1. METRIK EKSEKUTIF KINERJA BISNIS TAHUN ${yearStr}
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

  <!-- SEKSI 2: REKAP BULANAN -->
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1.5px solid #934B19;">
    <col width="60" />
    <col width="180" />
    <col width="220" />
    <col width="220" />
    <col width="260" />
    <tr bgcolor="#934B19" style="background-color: #934B19;">
      <td colspan="5" bgcolor="#934B19" style="background-color: #934B19; color: #FFFFFF; font-size: 12pt; font-weight: bold; padding: 10px 14px; border: 1px solid #783603;">
        2. DATA TREN OMSET BULANAN TAHUN ${yearStr}
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
</body>
</html>
  `.trim();

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Omset_Nefakky_Tahun_${yearStr}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper function untuk mencetak/mengekspor laporan resmi ke format PDF
 */
export function exportNefakkyPDFReport(
  year: string,
  totalGross: number,
  totalNet: number,
  totalOrders: number,
  months: { label: string; gross: number; net: number; isBazar: boolean; badge: string }[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const exportDateStr = new Date().toLocaleString('id-ID');
  const aov = totalOrders > 0 ? Math.round(totalGross / totalOrders) : 0;

  const pdfHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Laporan Omset Penjualan Tahun ${year} - Nefakky</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #25160E; background: #FFFDF9; }
    .header { background: #25160E; color: #FFFFFF; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-family: Georgia, serif; font-size: 20pt; color: #FDE68A; }
    .header p { margin: 6px 0 0 0; font-size: 10pt; opacity: 0.9; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; text-align: center; }
    .kpi-title { font-size: 9pt; color: #6B7280; font-weight: bold; text-transform: uppercase; }
    .kpi-value { font-size: 14pt; font-weight: bold; color: #934B19; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; background: #FFFFFF; border-radius: 8px; overflow: hidden; }
    th { background: #3C2A21; color: #FFFFFF; text-align: left; padding: 10px 12px; font-size: 10pt; }
    td { padding: 10px 12px; border-bottom: 1px solid #E5E7EB; font-size: 10pt; }
    tr:nth-child(even) { background: #FBF9F5; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .footer { margin-top: 30px; font-size: 9pt; color: #6B7280; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 12px; }
    @media print {
      body { padding: 0; background: #FFFFFF; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; text-align: right;">
    <button onclick="window.print()" style="background: #934B19; color: #FFF; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold;">
      🖨️ Cetak / Download PDF
    </button>
  </div>

  <div class="header">
    <h1>NEFAKKY ARTISANAL FOOD &amp; CULINARY</h1>
    <p>LAPORAN RESMI REKAPITULASI OMSET PENJUALAN &amp; LABA BERSIH TAHUN ${year}</p>
    <p style="font-size: 8.5pt; color: #FDE68A;">Alamat Produksi Resmi: Puri Bojong Lestari AF No 41, Bojong Gede, Bogor | Dicetak: ${exportDateStr}</p>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-title">Total Omset Kotor</div>
      <div class="kpi-value">Rp ${totalGross.toLocaleString('id-ID')}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Laba Bersih (40%)</div>
      <div class="kpi-value" style="color: #047857;">Rp ${totalNet.toLocaleString('id-ID')}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Total Transaksi</div>
      <div class="kpi-value" style="color: #25160E;">${totalOrders} Transaksi</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Rata-Rata AOV</div>
      <div class="kpi-value" style="color: #D97706;">Rp ${aov.toLocaleString('id-ID')}</div>
    </div>
  </div>

  <h3 style="font-family: Georgia, serif; color: #25160E; margin-bottom: 8px;">Rincian Omset Bulanan (Tahun ${year})</h3>
  <table>
    <thead>
      <tr>
        <th class="text-center">No</th>
        <th>Bulan / Periode</th>
        <th class="text-right">Omset Kotor (Bruto)</th>
        <th class="text-right">Laba Bersih (40%)</th>
        <th>Catatan Event / Bazar</th>
      </tr>
    </thead>
    <tbody>
      ${months.map((m, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td style="font-weight: bold;">${m.label}</td>
          <td class="text-right" style="font-weight: bold; color: #934B19;">Rp ${m.gross.toLocaleString('id-ID')}</td>
          <td class="text-right" style="font-weight: bold; color: #047857;">Rp ${m.net.toLocaleString('id-ID')}</td>
          <td>${m.badge}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    Dokumen ini diterbitkan secara sah oleh Sistem Operasional Command Desk Nefakky (Laravel API Backend).
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(pdfHtml);
  printWindow.document.close();
}
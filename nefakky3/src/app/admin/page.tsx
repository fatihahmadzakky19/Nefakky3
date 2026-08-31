'use client';

/**
 * ============================================================================
 * HALAMAN: Dashboard Ringkasan Bisnis Admin (src/app/admin/page.tsx)
 * DESKRIPSI: Halaman overview utama panel Admin Command Center.
 *            Mengambil data produk dan pesanan dari DataContext, menyediakan handler
 *            ekspor Excel dan cetak PDF, serta menghubungkan interaksi pembuatan
 *            voucher promosi langsung ke halaman promosi.
 * ============================================================================
 */

// Mengimpor library React
import React from 'react';
// Mengimpor hook useRouter Next.js untuk navigasi dinamis
import { useRouter } from 'next/navigation';
// Mengimpor hook useData dari DataContext
import { useData } from '@/context/DataContext';
// Mengimpor utilitas ekspor data laporan penjualan ke format Microsoft Excel
import { exportNefakkyExcelReport } from '@/lib/exportUtils';
// Mengimpor komponen tampilan utama tab dashboard admin
import AdminDashboardTab from '@/components/admin/AdminDashboardTab';

/**
 * Komponen Utama: AdminOverviewPage
 */
export default function AdminOverviewPage() {
  // Inisialisasi router navigasi Next.js
  const router = useRouter();
  // Mengambil state produk dan pesanan dari DataContext
  const { products, orders } = useData();

  /**
   * Handler: Ekspor seluruh data transaksi dan katalog produk ke format Excel (.xlsx)
   */
  const handleExportCSV = () => {
    exportNefakkyExcelReport(orders || [], products || []);
  };

  /**
   * Handler: Cetak ringkasan laporan keuangan via dialog print browser
   */
  const handlePrintPDFReport = () => {
    window.print();
  };

  /**
   * Handler: Membuka formulir pembuatan voucher promo baru dengan pre-filled nama dan kode
   * @param name Nama promo yang direkomendasikan
   * @param code Kode promo yang direkomendasikan
   */
  const handleOpenCreateVoucher = (name: string, code: string) => {
    // Arahkan ke halaman promosi dengan query parameters
    router.push(`/admin/promotions?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}`);
  };

  // Merender komponen AdminDashboardTab dengan seluruh props yang dibutuhkan
  return (
    <AdminDashboardTab
      productList={products || []} // Daftar produk hidangan (dengan fallback array kosong)
      orderList={orders || []} // Daftar pesanan masuk (dengan fallback array kosong)
      onOpenCreateVoucher={handleOpenCreateVoucher} // Handler buat voucher dari dashboard
      onExportCSV={handleExportCSV} // Handler ekspor data ke Excel
      onPrintPDF={handlePrintPDFReport} // Handler cetak PDF
    />
  );
}

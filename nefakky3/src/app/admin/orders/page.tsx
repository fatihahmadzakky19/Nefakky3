'use client';

/**
 * ============================================================================
 * HALAMAN: AdminOrdersPage (src/app/admin/orders/page.tsx)
 * DESKRIPSI: Halaman Kitchen Desk & Dispatcher Pesanan pada panel Admin.
 *            Mengambil daftar pesanan pelanggan realtime dan fungsi pembaruan
 *            status pemrosesan dapur 5-tahap dari DataContext.
 * ============================================================================
 */

// Mengimpor library React
import React from 'react';
// Mengimpor hook useData dari DataContext untuk mengambil state pesanan
import { useData } from '@/context/DataContext';
// Mengimpor komponen tampilan utama tab kitchen desk & orders
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';

/**
 * Komponen Utama: AdminOrdersPage
 */
export default function AdminOrdersPage() {
  // Mengambil daftar pesanan dan fungsi update status pesanan dari DataContext
  const { orders, updateOrderStatus } = useData();

  /**
   * Handler: Memicu dialog cetak printer bawaan browser untuk laporan pesanan
   */
  const handlePrintPDFReport = () => {
    window.print();
  };

  // Merender komponen AdminOrdersTab dengan data pesanan dan handler yang dibutuhkan
  return (
    <AdminOrdersTab
      orderList={orders || []} // Daftar pesanan realtime (fallback ke array kosong)
      updateOrderStatus={updateOrderStatus} // Fungsi pengubah status alur dapur 1-klik
      onPrintPDF={handlePrintPDFReport} // Handler aksi cetak laporan
    />
  );
}

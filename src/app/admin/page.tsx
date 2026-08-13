'use client';

/**
 * ============================================================================
 * HALAMAN: Dashboard Ringkasan Bisnis Admin (/admin)
 * DESKRIPSI: Presisi 100% sesuai Google Stitch Design System & HTML Layout
 * ============================================================================
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import AdminDashboardTab from '@/components/admin/AdminDashboardTab';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { products, orders } = useData();

  const handleExportCSV = () => {
    const csvRows = [
      ['ID Pesanan', 'Tanggal', 'Pelanggan', 'Alamat', 'Total Omset (Rp)', 'Status Alur', 'Metode Pembayaran'],
      ...(orders || []).map(o => [
        o.id,
        o.date,
        o.customerName,
        `"${o.address}"`,
        o.total,
        o.status,
        o.paymentMethod
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Omset_Nefakky_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDFReport = () => {
    window.print();
  };

  const handleOpenCreateVoucher = (name: string, code: string) => {
    router.push(`/admin/promotions?code=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}`);
  };

  return (
    <AdminDashboardTab
      productList={products || []}
      orderList={orders || []}
      onOpenCreateVoucher={handleOpenCreateVoucher}
      onExportCSV={handleExportCSV}
      onPrintPDF={handlePrintPDFReport}
    />
  );
}

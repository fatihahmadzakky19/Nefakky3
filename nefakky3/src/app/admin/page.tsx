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
import { exportNefakkyExcelReport } from '@/lib/exportUtils';
import AdminDashboardTab from '@/components/admin/AdminDashboardTab';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { products, orders } = useData();

  const handleExportCSV = () => {
    exportNefakkyExcelReport(orders || [], products || []);
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

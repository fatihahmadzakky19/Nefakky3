'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { orders } = useData();

  const pendingOrdersCount = (orders || []).filter(
    o => o.status === 'PENDING' || o.status === 'RECEIVED'
  ).length;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160e] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#4f4540] font-medium tracking-wide">Memuat Panel Administrator...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans selection:bg-[#934b19]/10 selection:text-[#934b19]">
      {/* 1. SIDEBAR NAVIGATION */}
      <AdminSidebar pendingOrdersCount={pendingOrdersCount} />

      {/* 2. MAIN ADMIN CONTENT CONTAINER */}
      <div className="pl-72 print:pl-0">
        {/* TOP HEADER BAR */}
        <AdminHeader
          onPrintPDF={handlePrintPDFReport}
          onExportCSV={handleExportCSV}
          managerName={user?.displayName || 'Fatih Ahmad Zakky'}
          managerRole="Store Manager"
        />

        {/* MAIN BODY AREA FOR ROUTE PAGES */}
        <main className="pt-20 px-8 pb-24 max-w-[1280px] mx-auto space-y-8 print:pt-4 print:px-4">
          {children}
        </main>
      </div>
    </div>
  );
}

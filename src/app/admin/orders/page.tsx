'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useData();

  const handlePrintPDFReport = () => {
    window.print();
  };

  return (
    <AdminOrdersTab
      orderList={orders || []}
      updateOrderStatus={updateOrderStatus}
      onPrintPDF={handlePrintPDFReport}
    />
  );
}

'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/DataContext';
import AdminPromotionsTab from '@/components/admin/AdminPromotionsTab';

export default function AdminPromotionsPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const initialName = searchParams.get('name') || '';

  const {
    vouchers,
    addVoucher,
    updateVoucher,
    deleteVoucher,
    toggleVoucherStatus
  } = useData();

  return (
    <AdminPromotionsTab
      voucherList={vouchers || []}
      addVoucher={addVoucher}
      updateVoucher={updateVoucher}
      deleteVoucher={deleteVoucher}
      toggleVoucherStatus={toggleVoucherStatus}
      initialVoucherCode={initialCode}
      initialVoucherName={initialName}
    />
  );
}

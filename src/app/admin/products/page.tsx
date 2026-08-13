'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import AdminProductsTab from '@/components/admin/AdminProductsTab';

export default function AdminProductsPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility
  } = useData();

  return (
    <AdminProductsTab
      productList={products || []}
      addProduct={addProduct}
      updateProduct={updateProduct}
      deleteProduct={deleteProduct}
      toggleProductVisibility={toggleProductVisibility}
    />
  );
}

'use client';

/**
 * ============================================================================
 * HALAMAN: AdminProductsPage (src/app/admin/products/page.tsx)
 * DESKRIPSI: Halaman manajemen katalog menu hidangan pada panel Admin Command Center.
 *            Menghubungkan data produk hidangan dari DataContext dengan komponen
 *            AdminProductsTab untuk operasi tambah menu, edit harga/foto/nutrisi/stok,
 *            hapus menu, dan sembunyikan/tampilkan produk.
 * ============================================================================
 */

// Mengimpor library React
import React from 'react';
// Mengimpor hook useData dari DataContext
import { useData } from '@/context/DataContext';
// Mengimpor komponen tampilan utama tab manajemen katalog produk admin
import AdminProductsTab from '@/components/admin/AdminProductsTab';

/**
 * Komponen Utama: AdminProductsPage
 */
export default function AdminProductsPage() {
  // Mengambil state daftar produk dan method manipulasi produk dari DataContext
  const {
    products, // Array daftar seluruh hidangan menu makanan dan minuman
    addProduct, // Fungsi untuk menambahkan hidangan baru ke database
    updateProduct, // Fungsi untuk mengedit data hidangan (harga, nama, stok, komposisi)
    deleteProduct, // Fungsi untuk menghapus hidangan dari katalog
    toggleProductVisibility // Fungsi untuk mengubah visibilitas (tampilkan/sembunyikan di etalase)
  } = useData();

  // Merender komponen AdminProductsTab dengan data dan handler lengkap
  return (
    <AdminProductsTab
      productList={products || []} // Daftar produk hidangan (dengan fallback array kosong)
      addProduct={addProduct} // Handler tambah hidangan
      updateProduct={updateProduct} // Handler edit hidangan
      deleteProduct={deleteProduct} // Handler hapus hidangan
      toggleProductVisibility={toggleProductVisibility} // Handler toggle visibilitas hidangan
    />
  );
}

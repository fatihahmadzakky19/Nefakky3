'use client';

/**
 * ============================================================================
 * HALAMAN: AdminPromotionsPage (src/app/admin/promotions/page.tsx)
 * DESKRIPSI: Halaman manajemen voucher & promosi pada panel Admin Command Center.
 *            Membaca query URL (code, name) jika diarahkan dari halaman lain,
 *            mengambil data & fungsi CRUD voucher dari DataContext, serta
 *            merender komponen AdminPromotionsTab.
 * ============================================================================
 */

// Mengimpor library React untuk komponen antarmuka
import React from 'react';
// Mengimpor useSearchParams dari Next.js untuk membaca parameter query URL
import { useSearchParams } from 'next/navigation';
// Mengimpor hook useData dari DataContext untuk operasi basis data voucher
import { useData } from '@/context/DataContext';
// Mengimpor komponen tampilan utama tab manajemen promosi admin
import AdminPromotionsTab from '@/components/admin/AdminPromotionsTab';

/**
 * Komponen Utama: AdminPromotionsPage
 * Mengelola integrasi data promo voucher dengan komponen AdminPromotionsTab
 */
export default function AdminPromotionsPage() {
  // Mengambil objek parameter pencarian URL (query params)
  const searchParams = useSearchParams();
  // Membaca nilai parameter 'code' dari URL jika ada (fallback ke string kosong)
  const initialCode = searchParams.get('code') || '';
  // Membaca nilai parameter 'name' dari URL jika ada (fallback ke string kosong)
  const initialName = searchParams.get('name') || '';

  // Mengambil state daftar voucher dan method-method manipulasi dari DataContext
  const {
    vouchers, // Array daftar seluruh voucher promo yang tersimpan
    addVoucher, // Fungsi untuk menambahkan voucher promo baru
    updateVoucher, // Fungsi untuk memperbarui data voucher yang sudah ada
    deleteVoucher, // Fungsi untuk menghapus voucher promo
    toggleVoucherStatus // Fungsi untuk mengubah status aktif/nonaktif voucher secara instan
  } = useData();

  // Merender komponen tab manajemen promosi dengan mengoper seluruh props yang diperlukan
  return (
    <AdminPromotionsTab
      voucherList={vouchers || []} // Daftar data voucher promo (dengan proteksi array kosong)
      addVoucher={addVoucher} // Handler penambahan voucher
      updateVoucher={updateVoucher} // Handler pembaruan voucher
      deleteVoucher={deleteVoucher} // Handler penghapusan voucher
      toggleVoucherStatus={toggleVoucherStatus} // Handler ubah status voucher
      initialVoucherCode={initialCode} // Nilai awal input kode voucher dari query URL
      initialVoucherName={initialName} // Nilai awal input nama voucher dari query URL
    />
  );
}

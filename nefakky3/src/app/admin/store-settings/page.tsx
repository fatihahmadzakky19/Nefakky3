'use client';

/**
 * ============================================================================
 * HALAMAN: AdminStoreSettingsPage (src/app/admin/store-settings/page.tsx)
 * DESKRIPSI: Halaman pengaturan toko & peta operasional pada panel Admin Command Center.
 *            Menghubungkan komponen AdminSettingsTab dengan data percakapan CS live chat
 *            serta konfigurasi operasional resto.
 * ============================================================================
 */

// Mengimpor library React
import React from 'react';
// Mengimpor hook useData dari DataContext
import { useData } from '@/context/DataContext';
// Mengimpor komponen tampilan utama tab pengaturan admin
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';

/**
 * Komponen Utama: AdminStoreSettingsPage
 */
export default function AdminStoreSettingsPage() {
  // Mengambil state dan fungsi penangan chat dari DataContext
  const {
    chatMessages, // Array daftar riwayat pesan percakapan
    replyChatMessage, // Fungsi kirim balasan pesan
    markChatAsRead // Fungsi tandai pesan telah dibaca
  } = useData();

  // Merender komponen pengaturan toko admin
  return (
    <AdminSettingsTab
      chatMessages={chatMessages || []} // Riwayat pesan chat (dengan fallback array kosong)
      replyChatMessage={replyChatMessage} // Handler kirim balasan
      markChatAsRead={markChatAsRead} // Handler tandai pesan dibaca
    />
  );
}

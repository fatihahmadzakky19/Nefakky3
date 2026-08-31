'use client';

/**
 * ============================================================================
 * HALAMAN: AdminSettingsPage (src/app/admin/settings/page.tsx)
 * DESKRIPSI: Halaman pengaturan sistem & konfigurasi operasional pada panel Admin.
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
 * Komponen Utama: AdminSettingsPage
 */
export default function AdminSettingsPage() {
  // Mengambil state dan fungsi penangan chat dari DataContext
  const {
    chatMessages, // Array daftar riwayat pesan percakapan
    replyChatMessage, // Fungsi kirim balasan pesan
    markChatAsRead // Fungsi tandai pesan telah dibaca
  } = useData();

  // Merender komponen pengaturan admin
  return (
    <AdminSettingsTab
      chatMessages={chatMessages || []} // Riwayat pesan chat (dengan fallback array kosong)
      replyChatMessage={replyChatMessage} // Handler kirim balasan
      markChatAsRead={markChatAsRead} // Handler tandai pesan dibaca
    />
  );
}

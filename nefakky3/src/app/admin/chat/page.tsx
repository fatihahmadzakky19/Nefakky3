'use client';

/**
 * ============================================================================
 * HALAMAN: Meja Pelayanan CS Live Chat (src/app/admin/chat/page.tsx)
 * DESKRIPSI: Halaman mandiri panel admin untuk mengelola komunikasi obrolan pelanggan (CS Live Chat).
 *            Mengambil data pesan obrolan, fungsi membalas pesan, dan fungsi menandai
 *            pesan telah dibaca dari DataContext secara realtime.
 * ============================================================================
 */

// Mengimpor library React
import React, { Suspense } from 'react';
// Mengimpor hook useData dari DataContext
import { useData } from '@/context/DataContext';
// Mengimpor komponen tampilan utama tab meja percakapan CS live chat
import AdminLiveChatTab from '@/components/admin/AdminLiveChatTab';

/**
 * Komponen Pembungkus Suspense untuk AdminLiveChatPage.
 * AdminLiveChatTab memakai useSearchParams() sehingga wajib dibungkus <Suspense>,
 * jika tidak, `next build` akan gagal dengan error
 * "useSearchParams() should be wrapped in a suspense boundary".
 */
export default function AdminLiveChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-stone-500 text-sm">Memuat live chat...</div>}>
      <AdminLiveChatContent />
    </Suspense>
  );
}

/**
 * Komponen Isi: AdminLiveChatContent
 */
function AdminLiveChatContent() {
  // Mengambil state chatMessages dan fungsi penangan pesan dari DataContext
  const {
    chatMessages, // Array daftar seluruh pesan chat antara admin dan pelanggan
    replyChatMessage, // Fungsi untuk mengirim balasan chat ke pelanggan spesifik
    markChatAsRead // Fungsi untuk menandai pesan pengguna sebagai telah dibaca
  } = useData();

  // Merender komponen antarmuka percakapan CS Live Chat
  return (
    <AdminLiveChatTab
      chatMessages={chatMessages || []} // Daftar seluruh riwayat chat (dengan fallback array kosong)
      replyChatMessage={replyChatMessage} // Handler kirim balasan pesan
      markChatAsRead={markChatAsRead} // Handler tandai pesan dibaca
    />
  );
}

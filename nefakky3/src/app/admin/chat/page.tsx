'use client';

/**
 * ============================================================================
 * HALAMAN: Meja Pelayanan CS Live Chat (/admin/chat)
 * DESKRIPSI: Tampilan khusus mandiri untuk pengelolaan percakapan CS live chat
 *            dengan pelanggan toko secara realtime.
 * ============================================================================
 */

import React from 'react';
import { useData } from '@/context/DataContext';
import AdminLiveChatTab from '@/components/admin/AdminLiveChatTab';

export default function AdminLiveChatPage() {
  const {
    chatMessages,
    replyChatMessage,
    markChatAsRead
  } = useData();

  return (
    <AdminLiveChatTab
      chatMessages={chatMessages || []}
      replyChatMessage={replyChatMessage}
      markChatAsRead={markChatAsRead}
    />
  );
}

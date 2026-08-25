'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';

export default function AdminStoreSettingsPage() {
  const {
    chatMessages,
    replyChatMessage,
    markChatAsRead
  } = useData();

  return (
    <AdminSettingsTab
      chatMessages={chatMessages || []}
      replyChatMessage={replyChatMessage}
      markChatAsRead={markChatAsRead}
    />
  );
}

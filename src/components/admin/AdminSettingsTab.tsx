'use client';

import React, { useState } from 'react';
import { Send, User } from 'lucide-react';
import { ChatMessage } from '@/context/DataContext';

interface AdminSettingsTabProps {
  chatMessages: ChatMessage[];
  replyChatMessage: (userEmail: string, text: string) => void;
  markChatAsRead: (userEmail: string, role: 'admin' | 'user') => void;
}

export default function AdminSettingsTab({
  chatMessages,
  replyChatMessage,
  markChatAsRead
}: AdminSettingsTabProps) {
  const [selectedChatUserEmail, setSelectedChatUserEmail] = useState<string>('');
  const [adminReplyInput, setAdminReplyInput] = useState<string>('');

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUserEmail || !adminReplyInput.trim()) return;
    replyChatMessage(selectedChatUserEmail, adminReplyInput.trim());
    setAdminReplyInput('');
  };

  const chatUsersMap = React.useMemo(() => {
    const map: Record<string, { email: string; name: string; avatar?: string; lastMessage: string; lastTime: string; unread: boolean }> = {};
    (chatMessages || []).forEach((m) => {
      if (!map[m.userEmail]) {
        map[m.userEmail] = {
          email: m.userEmail,
          name: m.userName || m.userEmail.split('@')[0],
          avatar: m.userAvatar,
          lastMessage: m.text,
          lastTime: m.timestamp,
          unread: m.readByAdmin === false
        };
      } else {
        map[m.userEmail].lastMessage = m.text;
        map[m.userEmail].lastTime = m.timestamp;
        if (m.readByAdmin === false) map[m.userEmail].unread = true;
      }
    });
    return Object.values(map);
  }, [chatMessages]);

  const activeChatMessages = React.useMemo(() => {
    if (!selectedChatUserEmail) return [];
    return (chatMessages || []).filter((m) => m.userEmail === selectedChatUserEmail);
  }, [chatMessages, selectedChatUserEmail]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#25160e]">Pengaturan Toko &amp; Layanan Pelanggan</h1>
        <p className="text-xs text-[#4f4540]">Atur profil restoran, lokasi dapur, serta respon CS live chat langsung kepada pembeli.</p>
      </div>

      {/* 1. TOKO SETTINGS FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-4 max-w-2xl">
        <h2 className="font-serif text-lg font-bold text-[#25160e]">Profil Restoran &amp; Dapur</h2>
        <div>
          <label className="block text-xs font-bold text-[#25160e] mb-1">Nama Toko Kuliner</label>
          <input type="text" defaultValue="Nefakky Artisanal Marketplace" className="w-full px-4 py-3 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#25160e] mb-1">Alamat Dapur Utama (GPS Center)</label>
          <input type="text" defaultValue="Jl. Pemuda No. 45, Kebayoran, Jakarta Selatan" className="w-full px-4 py-3 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#25160e] mb-1">Batas Maksimum Pengiriman (Km)</label>
          <input type="number" defaultValue="25" className="w-full px-4 py-3 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs" />
        </div>
        <button className="px-6 py-3 bg-[#934b19] text-white text-xs font-bold rounded-2xl shadow-md hover:bg-[#783603] transition-colors">
          Simpan Pengaturan
        </button>
      </div>

      {/* 2. CS LIVE CHAT SPLIT DESK */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#25160e]">Layanan Pelanggan (CS Live Chat)</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[450px]">
          {/* User List Panel */}
          <div className="md:col-span-4 border border-stone-200 rounded-2xl p-3 overflow-y-auto space-y-2 bg-[#fbf9f5]">
            {chatUsersMap.length === 0 ? (
              <p className="text-xs text-stone-400 p-4 text-center">Belum ada percakapan dari pembeli.</p>
            ) : (
              chatUsersMap.map((u) => (
                <div
                  key={u.email}
                  onClick={() => {
                    setSelectedChatUserEmail(u.email);
                    markChatAsRead(u.email, 'admin');
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center gap-3 ${
                    selectedChatUserEmail === u.email
                      ? 'bg-[#25160e] text-white border-[#25160e]'
                      : 'bg-white text-[#25160e] border-stone-200 hover:border-[#934b19]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#934b19] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs truncate">{u.name}</span>
                      {u.unread && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${selectedChatUserEmail === u.email ? 'text-amber-200/80' : 'text-stone-500'}`}>
                      {u.lastMessage}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Chat Thread Panel */}
          <div className="md:col-span-8 border border-stone-200 rounded-2xl flex flex-col bg-[#fbf9f5]">
            {selectedChatUserEmail ? (
              <>
                <div className="p-3 bg-white border-b border-stone-200 font-bold text-xs text-[#25160e] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#934b19]" />
                  <span>Chat dengan: {selectedChatUserEmail}</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {activeChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md p-3 rounded-2xl text-xs font-medium ${
                          msg.sender === 'admin'
                            ? 'bg-[#934b19] text-white rounded-br-none'
                            : 'bg-white text-[#25160e] border border-stone-200 rounded-bl-none shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendAdminReply} className="p-3 bg-white border-t border-stone-200 flex gap-2">
                  <input
                    type="text"
                    value={adminReplyInput}
                    onChange={(e) => setAdminReplyInput(e.target.value)}
                    placeholder="Tulis balasan CS admin..."
                    className="flex-1 px-4 py-2 bg-[#fbf9f5] border border-amber-900/15 rounded-xl text-xs outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-[#934b19] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#783603]">
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-stone-400 p-6 text-center">
                Pilih pengguna di sebelah kiri untuk melihat dan membalas percakapan live chat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, User, Paperclip, Film, X, Phone, Building2, MapPin, Truck, CheckCircle2, MessageCircle } from 'lucide-react';
import { ChatMessage } from '@/context/DataContext';

interface AdminSettingsTabProps {
  chatMessages: ChatMessage[];
  replyChatMessage: (userEmail: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  markChatAsRead: (userEmail: string, role: 'admin' | 'user') => void;
}

export default function AdminSettingsTab({
  chatMessages,
  replyChatMessage,
  markChatAsRead
}: AdminSettingsTabProps) {
  const searchParams = useSearchParams();
  const chatQuery = searchParams?.get('chat');

  const [selectedChatUserEmail, setSelectedChatUserEmail] = useState<string>('');
  const [adminReplyInput, setAdminReplyInput] = useState<string>('');
  const [adminMediaUrl, setAdminMediaUrl] = useState<string | null>(null);
  const [adminMediaType, setAdminMediaType] = useState<'image' | 'video'>('image');
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // Store Settings State
  const [storeName, setStoreName] = useState<string>('Nefakky Artisanal Marketplace');
  const [storeAddress, setStoreAddress] = useState<string>('Jl. Pemuda No. 45, Kebayoran, Jakarta Selatan');
  const [storePhone, setStorePhone] = useState<string>('0812-3456-7890');
  const [storeMaxKm, setStoreMaxKm] = useState<string>('25');
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  // Auto select chat from URL param
  useEffect(() => {
    if (chatQuery) {
      setSelectedChatUserEmail(chatQuery);
      markChatAsRead(chatQuery, 'admin');
    }
  }, [chatQuery, markChatAsRead]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nefakky_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.storeAddress) setStoreAddress(parsed.storeAddress);
        if (parsed.storePhone) setStorePhone(parsed.storePhone);
        if (parsed.storeMaxKm) setStoreMaxKm(parsed.storeMaxKm);
      }
    } catch (e) {
      console.error('Error loading store settings:', e);
    }
  }, []);

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { storeName, storeAddress, storePhone, storeMaxKm };
      localStorage.setItem('nefakky_store_settings', JSON.stringify(payload));
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3500);
    } catch (e) {
      console.error('Error saving store settings:', e);
    }
  };

  const handleAdminMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 20MB.');
        return;
      }
      const isVid = file.type.startsWith('video/');
      const isImg = file.type.startsWith('image/');
      if (!isVid && !isImg) {
        alert('Harap pilih file gambar atau video.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminMediaUrl(reader.result as string);
        setAdminMediaType(isVid ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUserEmail || (!adminReplyInput.trim() && !adminMediaUrl)) return;
    
    replyChatMessage(
      selectedChatUserEmail, 
      adminReplyInput.trim() || (adminMediaType === 'video' ? '📹 [Video Balasan CS]' : '📷 [Foto Balasan CS]'),
      adminMediaUrl || undefined,
      adminMediaType
    );
    
    setAdminReplyInput('');
    setAdminMediaUrl(null);
    if (adminFileInputRef.current) adminFileInputRef.current.value = '';
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
      <form onSubmit={handleSaveStoreSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-4 max-w-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-serif text-lg font-bold text-[#25160e]">Profil Restoran &amp; Dapur</h2>
          <span className="text-[10px] bg-amber-900/10 text-[#934b19] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Informasi Layanan
          </span>
        </div>

        {showSaveToast && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pengaturan profil restoran &amp; nomor telepon berhasil disimpan!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#25160e] mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#934b19]" />
            <span>Nama Toko Kuliner</span>
          </label>
          <input 
            type="text" 
            value={storeName} 
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-4 py-3 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#934b19]/30" 
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#25160e] mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#934b19]" />
            <span>Nomor Telepon / WhatsApp CS Restoran</span>
          </label>
          <input 
            type="text" 
            value={storePhone} 
            onChange={(e) => setStorePhone(e.target.value)}
            placeholder="contoh: 0812-3456-7890 / 081399887766"
            className="w-full px-4 py-3 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#934b19]/30" 
            required
          />
          <p className="text-[10px] text-stone-400 mt-1">Nomor telepon ini digunakan untuk hotline CS toko, konfirmasi pesanan, dan cetakan struk pembelian.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#25160e] mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#934b19]" />
            <span>Alamat Dapur Utama (GPS Center)</span>
          </label>
          <input 
            type="text" 
            value={storeAddress} 
            onChange={(e) => setStoreAddress(e.target.value)}
            className="w-full px-4 py-3 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#934b19]/30" 
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#25160e] mb-1 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#934b19]" />
            <span>Batas Maksimum Pengiriman (Km)</span>
          </label>
          <input 
            type="number" 
            value={storeMaxKm} 
            onChange={(e) => setStoreMaxKm(e.target.value)}
            className="w-full px-4 py-3 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#934b19]/30" 
            required
          />
        </div>

        <button 
          type="submit" 
          className="px-6 py-3 bg-[#934b19] text-white text-xs font-bold rounded-2xl shadow-md hover:bg-[#783603] transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Simpan Pengaturan</span>
        </button>
      </form>

      {/* 2. CS LIVE CHAT SPLIT DESK */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-serif text-lg font-bold text-[#25160e] flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#934b19]" />
            <span>Layanan Pelanggan (CS Live Chat)</span>
          </h2>
          {chatUsersMap.filter(u => u.unread).length > 0 && (
            <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full animate-pulse shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>{chatUsersMap.filter(u => u.unread).length} Chat Baru Belum Dibalas</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[480px]">
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
                      ? 'bg-[#25160e] text-white border-[#25160e] shadow-md'
                      : u.unread
                      ? 'bg-rose-50 border-rose-300 text-[#25160e] hover:border-rose-500 shadow-xs'
                      : 'bg-white text-[#25160e] border-stone-200 hover:border-[#934b19]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#934b19] text-white flex items-center justify-center font-bold text-xs shrink-0 relative">
                    {u.name.charAt(0)}
                    {u.unread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-600 border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className="font-bold text-xs truncate">{u.name}</span>
                      {u.unread && (
                        <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-full animate-pulse shrink-0">
                          BARU
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${selectedChatUserEmail === u.email ? 'text-amber-200/80' : u.unread ? 'text-rose-700 font-bold' : 'text-stone-500'}`}>
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
                        className={`max-w-xs sm:max-w-md p-3 rounded-2xl text-xs font-medium space-y-2 ${
                          msg.sender === 'admin'
                            ? 'bg-[#934b19] text-white rounded-br-none'
                            : 'bg-white text-[#25160e] border border-stone-200 rounded-bl-none shadow-2xs'
                        }`}
                      >
                        {msg.text && <p>{msg.text}</p>}
                        
                        {msg.mediaUrl && (
                          <div className="mt-1 rounded-xl overflow-hidden border border-stone-200/40 bg-black/10">
                            {msg.mediaType === 'video' || msg.mediaUrl.startsWith('data:video') ? (
                              <video 
                                src={msg.mediaUrl} 
                                controls 
                                className="max-w-full max-h-48 rounded-xl object-contain bg-black" 
                              />
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img 
                                src={msg.mediaUrl} 
                                alt="Lampiran Admin CS" 
                                onClick={() => window.open(msg.mediaUrl, '_blank')}
                                className="max-w-full max-h-48 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>

                {/* Preview Lampiran Admin CS */}
                {adminMediaUrl && (
                  <div className="flex items-center gap-2 p-2 bg-amber-100/80 border-t border-amber-200">
                    {adminMediaType === 'video' ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#934b19]">
                        <Film className="w-4 h-4 shrink-0" />
                        <span className="text-[11px]">Video terlampir siap dikirim</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={adminMediaUrl} alt="Preview Admin Lampiran" className="w-8 h-8 rounded-lg object-cover border border-amber-900/20" />
                        <span className="text-[11px] font-bold text-[#934b19]">Foto terlampir</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAdminMediaUrl(null);
                        if (adminFileInputRef.current) adminFileInputRef.current.value = '';
                      }}
                      className="ml-auto text-rose-600 hover:text-rose-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendAdminReply} className="p-3 bg-white border-t border-stone-200 flex gap-2 items-center">
                  <input
                    type="file"
                    ref={adminFileInputRef}
                    onChange={handleAdminMediaUpload}
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => adminFileInputRef.current?.click()}
                    className="p-2 bg-[#fbf9f5] hover:bg-amber-100 text-[#934b19] border border-amber-900/15 rounded-xl transition-colors shrink-0"
                    title="Lampirkan Foto atau Video"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={adminReplyInput}
                    onChange={(e) => setAdminReplyInput(e.target.value)}
                    placeholder="Tulis balasan CS admin atau lampirkan media..."
                    className="flex-1 px-4 py-2 bg-[#fbf9f5] border border-amber-900/15 rounded-xl text-xs outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!adminReplyInput.trim() && !adminMediaUrl}
                    className="px-4 py-2 bg-[#934b19] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#783603] disabled:opacity-50"
                  >
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

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData, ChatMessage } from '@/context/DataContext';
import { exportNefakkyExcelReport } from '@/lib/exportUtils';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { MessageCircle, X, ArrowRight } from 'lucide-react';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { orders, products, chatMessages } = useData();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [latestChatNotification, setLatestChatNotification] = useState<ChatMessage | null>(null);

  const prevChatCountRef = useRef<number>((chatMessages || []).length);

  const unreadMessagesList = useMemo(() => {
    return (chatMessages || []).filter(
      m => m.sender === 'user' && m.readByAdmin === false
    );
  }, [chatMessages]);

  const unreadChatCount = unreadMessagesList.length;

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio Context silent catch
    }
  };

  useEffect(() => {
    if (!chatMessages) return;
    const currentUnreadUserMsgs = chatMessages.filter(m => m.sender === 'user' && m.readByAdmin === false);

    if (currentUnreadUserMsgs.length > 0) {
      const newestMsg = currentUnreadUserMsgs[currentUnreadUserMsgs.length - 1];
      if (chatMessages.length > prevChatCountRef.current) {
        setLatestChatNotification(newestMsg);
        playNotificationSound();
      }
    }
    prevChatCountRef.current = chatMessages.length;
  }, [chatMessages]);

  const pendingOrdersCount = (orders || []).filter(
    o => o.status === 'PENDING' || o.status === 'RECEIVED'
  ).length;

  const handleExportCSV = () => {
    exportNefakkyExcelReport(orders || [], products || []);
  };

  const handlePrintPDFReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160e] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#4f4540] font-medium tracking-wide">Memuat Panel Administrator...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans selection:bg-[#934b19]/10 selection:text-[#934b19] relative">
      {/* 1. SIDEBAR NAVIGATION */}
      <AdminSidebar 
        pendingOrdersCount={pendingOrdersCount} 
        unreadChatCount={unreadChatCount}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. MAIN ADMIN CONTENT CONTAINER */}
      <div className="pl-0 lg:pl-72 print:pl-0 transition-all duration-300">
        {/* TOP HEADER BAR */}
        <AdminHeader
          onPrintPDF={handlePrintPDFReport}
          onExportCSV={handleExportCSV}
          managerName={user?.displayName || 'Fatih Ahmad Zakky'}
          managerRole="Store Manager"
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          unreadChatCount={unreadChatCount}
          unreadMessagesList={unreadMessagesList}
        />

        {/* MAIN BODY AREA FOR ROUTE PAGES */}
        <main className="pt-20 px-4 sm:px-8 pb-24 max-w-[1280px] mx-auto space-y-8 print:pt-4 print:px-4">
          {children}
        </main>
      </div>

      {/* FLOATING REALTIME TOAST CHAT NOTIFICATION FOR ADMIN */}
      {latestChatNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#25160E] text-white rounded-3xl p-4 shadow-2xl border-2 border-amber-500/40 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#934B19] text-white flex items-center justify-center font-bold text-sm shrink-0">
                <MessageCircle className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    💬 Pesan Baru CS
                  </span>
                  <span className="text-[10px] text-stone-400">{latestChatNotification.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-amber-100 mt-1">
                  {latestChatNotification.userName || latestChatNotification.userEmail.split('@')[0]}
                </h4>
              </div>
            </div>
            <button 
              onClick={() => setLatestChatNotification(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-300 font-light mt-2 line-clamp-2 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
            "{latestChatNotification.text}"
          </p>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                setLatestChatNotification(null);
                router.push(`/admin/settings?chat=${encodeURIComponent(latestChatNotification.userEmail)}`);
              }}
              className="px-4 py-2 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Balas Chat Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


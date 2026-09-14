'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { 
  X, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  QrCode, 
  Building2, 
  Wallet, 
  CreditCard,
  Check,
  Sparkles,
  Smartphone,
  Info
} from 'lucide-react';
import { Clock, ShieldCheck, Download, CheckCircle2 } from '@/components/icons/CustomIcons';

interface MidtransTxData {
  orderId: string;
  vaNumber: string;
  simulatorUrl: string;
  grossAmount: number;
  paymentType: string;
  qrString?: string;
  qrUrl?: string;
}

interface MidtransPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  midtransTx: MidtransTxData | null;
  midtransStatus: 'idle' | 'loading' | 'pending' | 'checking' | 'paid' | 'failed';
  onCheckStatus: () => void;
  finalPayableTotal: number;
}

export default function MidtransPaymentModal({
  isOpen,
  onClose,
  midtransTx,
  midtransStatus,
  onCheckStatus,
  finalPayableTotal
}: MidtransPaymentModalProps) {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showRawPayload, setShowRawPayload] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 menit hitung mundur (900 detik)
  const [activeBankGuide, setActiveBankGuide] = useState<'mbanking' | 'atm' | 'ibanking'>('mbanking');

  // Countdown timer 15 menit
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(900);
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !midtransTx) return null;

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, label: string = 'Disalin!') => {
    navigator.clipboard?.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Download QRIS code sebagai file PNG
  const handleDownloadQR = () => {
    try {
      const svg = document.getElementById('qris-svg-code');
      if (!svg) {
        if (midtransTx.qrUrl) {
          window.open(midtransTx.qrUrl, '_blank');
        }
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        const padding = 32;
        const bannerHeight = 80;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2 + bannerHeight;
        
        if (ctx) {
          // Background Putih
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Header Merah QRIS
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(0, 0, canvas.width, 8);
          
          // Label Toko
          ctx.fillStyle = '#1E293B';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('NEFAKKY RESTO & BAKERY', canvas.width / 2, 35);
          
          ctx.font = '12px monospace';
          ctx.fillStyle = '#64748B';
          ctx.fillText(`NMID: ID1020023849201 • Rp ${(midtransTx.grossAmount || finalPayableTotal).toLocaleString('id-ID')}`, canvas.width / 2, 55);
          
          // Draw QR
          ctx.drawImage(img, padding, bannerHeight);
          
          // Footer
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#94A3B8';
          ctx.fillText('Dicetak via Standar QRIS Indonesia', canvas.width / 2, canvas.height - 12);
          
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `QRIS-NEFAKKY-${midtransTx.orderId}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.warn('Gagal mengunduh QR via canvas:', err);
      if (midtransTx.qrUrl) {
        window.open(midtransTx.qrUrl, '_blank');
      }
    }
  };

  const isQris = midtransTx.paymentType === 'qris';
  const isVa = midtransTx.paymentType === 'va' || midtransTx.paymentType === 'bank_transfer';
  const isEwallet = midtransTx.paymentType === 'ewallet' || midtransTx.paymentType === 'gopay' || midtransTx.paymentType === 'shopeepay';
  const isCc = midtransTx.paymentType === 'cc';

  const qrValue = midtransTx.qrString || midtransTx.vaNumber || `QRIS-NEFAKKY-${midtransTx.orderId}`;
  const totalAmountFormatted = `Rp ${(midtransTx.grossAmount || finalPayableTotal).toLocaleString('id-ID')}`;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-left my-auto transition-all">
        
        {/* ========================================================================= */}
        {/* 1. HEADER MIDTRANS SANDBOX */}
        {/* ========================================================================= */}
        <div className="bg-[#102A43] text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/40 relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm tracking-wider text-white">MIDTRANS PAYMENT GATEWAY</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[9px] font-extrabold tracking-wider uppercase">
                  SANDBOX
                </span>
              </div>
              <span className="text-[11px] text-blue-200/80 font-light flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                {isQris 
                  ? 'Pembayaran Instan QRIS Real-Time' 
                  : isVa 
                  ? 'Virtual Account Otomatis' 
                  : 'Sistem Pembayaran Digital Terverifikasi'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative z-10"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOTAL TAGIHAN & ORDER ID BANNER */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-stone-50 via-amber-50/30 to-stone-50 px-5 sm:px-6 py-3.5 border-b border-stone-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider block">Total Pembayaran</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#934B19]">
              {totalAmountFormatted}
            </span>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1 text-[10px] text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded-md mb-1 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-700 animate-spin-slow" />
              <span>Batas Bayar: <strong className="font-mono text-amber-950">{formatCountdown(timeLeft)}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <span>Order ID:</span>
              <button 
                onClick={() => handleCopy(midtransTx.orderId, 'ID Disalin!')}
                className="font-mono font-bold text-[#25160E] hover:text-[#934B19] flex items-center gap-1 cursor-pointer bg-white px-1.5 py-0.5 rounded border border-stone-200 shadow-2xs"
                title="Salin Order ID"
              >
                <span>#{midtransTx.orderId}</span>
                <Copy className="w-2.5 h-2.5 opacity-60" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN PAYMENT BODY */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">

          {/* ----------------------------------------------------------------------- */}
          {/* A. TAMPILAN KHUSUS METODE QRIS INSTANT */}
          {/* ----------------------------------------------------------------------- */}
          {isQris && (
            <div className="space-y-4">
              
              {/* Standar Kartu QRIS Resmi Indonesia */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-sm overflow-hidden text-center relative">
                
                {/* QRIS Header Ribbon */}
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-2 px-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="bg-white text-red-600 font-black px-2 py-0.5 rounded text-xs tracking-tighter">
                      QRIS
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase opacity-95">
                      Standar Pembayaran Digital Indonesia
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded text-white tracking-widest uppercase">
                    GPN
                  </span>
                </div>

                {/* Merchant Information Bar */}
                <div className="py-2.5 px-4 bg-stone-50 border-b border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left">
                  <div>
                    <h4 className="font-bold text-xs text-[#25160E] leading-tight">NEFAKKY RESTO & BAKERY</h4>
                    <span className="text-[10px] text-stone-500 font-mono">NMID: ID1020023849201</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                      VERIFIED MERCHANT
                    </span>
                  </div>
                </div>

                {/* QR CODE DISPLAY BOX */}
                <div className="p-5 flex flex-col items-center justify-center bg-stone-50/40">
                  <div className="relative p-3.5 bg-white rounded-2xl border border-stone-200/90 shadow-md">
                    
                    {/* Scan Frame Tech Corners */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-[#934B19] rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-[#934B19] rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-[#934B19] rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-[#934B19] rounded-br-lg" />

                    {/* QR Code SVG / Image Canvas */}
                    <div className="w-[190px] h-[190px] sm:w-[210px] sm:h-[210px] flex items-center justify-center bg-white rounded-xl overflow-hidden">
                      <QRCode
                        id="qris-svg-code"
                        value={qrValue}
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 200 200`}
                        level="M"
                      />
                    </div>

                    {/* Badge di tengah / petunjuk scan */}
                    <div className="mt-2 text-center">
                      <span className="text-[10px] text-stone-500 font-medium block">
                        Arahkan kamera atau upload QR ke aplikasi e-wallet / m-Banking
                      </span>
                    </div>
                  </div>

                  {/* QR Action Buttons (Unduh & Salin String) */}
                  <div className="flex items-center gap-2 mt-3.5">
                    <button
                      onClick={handleDownloadQR}
                      className="px-3 py-1.5 bg-white hover:bg-stone-100 text-[#25160E] border border-stone-300 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-[#934B19]" />
                      <span>Unduh Gambar QR</span>
                    </button>

                    <button
                      onClick={() => handleCopy(qrValue, 'QR String Disalin!')}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>{copyFeedback || 'Salin Kode QR'}</span>
                    </button>
                  </div>
                </div>

                {/* E-Wallets & Banks Compatibility Row */}
                <div className="p-3 bg-stone-100/70 border-t border-stone-200 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] text-stone-600 font-medium">
                  <span className="text-stone-400 font-normal">Mendukung:</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-bold text-blue-600">BCA</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-bold text-blue-500">GoPay</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-bold text-purple-600">OVO</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-bold text-blue-400">DANA</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-bold text-orange-600">ShopeePay</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-bold text-teal-600">Livin</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-bold text-stone-700">& Semua Bank</span>
                </div>

              </div>

              {/* Panduan Pembayaran QRIS Realistis */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 text-[11px] text-stone-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-amber-800" />
                  <span>Cara Bayar dengan QRIS:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-0.5 text-stone-600 leading-relaxed font-light">
                  <li>Buka aplikasi <strong>BCA Mobile, Livin, GoPay, OVO, ShopeePay, DANA</strong>, atau bank apa saja di HP.</li>
                  <li>Pilih menu <strong>Bayar / Scan QRIS</strong>, lalu arahkan kamera ke kode QR di atas.</li>
                  <li>Periksa nama penerima <strong>NEFAKKY RESTO</strong> dan jumlah bayar <strong>{totalAmountFormatted}</strong>.</li>
                  <li>Konfirmasi PIN pembayaran Anda untuk menyelesaikan transaksi.</li>
                </ol>
              </div>

              {/* Box Pengujian Simulator Midtrans Sandbox */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 p-4 rounded-2xl border border-blue-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                    <ExternalLink className="w-4 h-4 text-blue-700" />
                    <span>Simulator Midtrans Sandbox (Testing)</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/70 px-2 py-0.5 rounded-md">
                    Mode Pengujian
                  </span>
                </div>

                <p className="text-[11px] text-blue-900/80 leading-relaxed font-light">
                  Ingin mensimulasikan pelunasan QRIS sekarang? Buka simulator Midtrans di tab baru, lalu klik <strong>Pay</strong>.
                </p>

                <a 
                  href={midtransTx.simulatorUrl || 'https://simulator.sandbox.midtrans.com/qris/index'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#004B99] hover:bg-[#003B7A] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Buka Simulator QRIS Midtrans ↗</span>
                </a>

                {/* Collapsible Detail QR String (Untuk Developer / Testing simulator) */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowRawPayload(!showRawPayload)}
                    className="text-[10px] font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{showRawPayload ? 'Sembunyikan' : 'Lihat'} Kode QR String Lengkap (Untuk Input Manual Simulator)</span>
                    {showRawPayload ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showRawPayload && (
                    <div className="mt-2 p-2.5 bg-white rounded-xl border border-blue-200 text-[10px] font-mono text-stone-700 break-all leading-tight relative shadow-2xs">
                      <div className="max-h-24 overflow-y-auto pr-1">
                        {qrValue}
                      </div>
                      <button
                        onClick={() => handleCopy(qrValue, 'String QR Disalin!')}
                        className="mt-2 w-full py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Salin String QR Lengkap</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* B. TAMPILAN KHUSUS METODE VIRTUAL ACCOUNT (BCA / MANDIRI / DLL) */}
          {/* ----------------------------------------------------------------------- */}
          {isVa && (
            <div className="space-y-4">
              
              {/* Box Nomor Virtual Account */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                    Nomor Virtual Account
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-md">
                    BCA Virtual Account
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
                  <span className="font-mono font-bold text-lg sm:text-xl text-[#102A43] tracking-widest">
                    {midtransTx.vaNumber}
                  </span>
                  <button 
                    onClick={() => handleCopy(midtransTx.vaNumber, 'Nomor VA Disalin!')}
                    className="px-3 py-1.5 bg-[#102A43] hover:bg-blue-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ml-2 shadow-xs active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                    <span>{copyFeedback || 'Salin Nomor VA'}</span>
                  </button>
                </div>
              </div>

              {/* Action Button: Buka Midtrans VA Simulator */}
              <div className="space-y-2">
                <a 
                  href={midtransTx.simulatorUrl || 'https://simulator.sandbox.midtrans.com/bca/va/index'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#004B99] hover:bg-[#003B7A] text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Buka Midtrans Payment Simulator ↗</span>
                </a>

                {/* Panduan 3 Langkah Cepat Simulator */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-[11px] text-stone-600 space-y-1 font-light leading-relaxed">
                  <span className="font-bold text-[#25160E] block text-xs">Cara Bayar di Simulator Midtrans:</span>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Klik tombol <strong>Buka Midtrans Payment Simulator</strong> di atas (tab baru).</li>
                    <li>Tempelkan nomor VA <strong className="font-mono text-[#102A43] font-bold">{midtransTx.vaNumber}</strong> ke kolom simulator.</li>
                    <li>Klik tombol <strong>Inquire</strong> lalu klik <strong>Pay</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* Panduan Transfer Bank Asli */}
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-3.5 space-y-2">
                <span className="font-bold text-xs text-[#25160E] block">Petunjuk Pembayaran ATM & Mobile Banking:</span>
                
                <div className="flex gap-1.5 border-b border-stone-200 pb-2">
                  <button
                    onClick={() => setActiveBankGuide('mbanking')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      activeBankGuide === 'mbanking' ? 'bg-[#102A43] text-white' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    BCA Mobile
                  </button>
                  <button
                    onClick={() => setActiveBankGuide('atm')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      activeBankGuide === 'atm' ? 'bg-[#102A43] text-white' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    ATM BCA
                  </button>
                  <button
                    onClick={() => setActiveBankGuide('ibanking')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      activeBankGuide === 'ibanking' ? 'bg-[#102A43] text-white' : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    KlikBCA
                  </button>
                </div>

                <div className="text-[11px] text-stone-600 leading-relaxed font-light pt-1">
                  {activeBankGuide === 'mbanking' && (
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Buka m-BCA dan pilih <strong>m-Transfer &gt; BCA Virtual Account</strong>.</li>
                      <li>Masukkan kode VA <strong>{midtransTx.vaNumber}</strong> lalu klik Send.</li>
                      <li>Periksa tagihan <strong>{totalAmountFormatted}</strong> dan masukkan PIN m-BCA.</li>
                    </ol>
                  )}
                  {activeBankGuide === 'atm' && (
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Masukkan Kartu ATM & PIN BCA Anda di mesin ATM.</li>
                      <li>Pilih menu <strong>Transaksi Lainnya &gt; Transfer &gt; Ke Rekening BCA Virtual Account</strong>.</li>
                      <li>Masukkan nomor VA <strong>{midtransTx.vaNumber}</strong> lalu ikuti instruksi pada layar.</li>
                    </ol>
                  )}
                  {activeBankGuide === 'ibanking' && (
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Login ke KlikBCA Individual, pilih <strong>Transfer Dana &gt; Transfer ke BCA Virtual Account</strong>.</li>
                      <li>Masukkan nomor VA <strong>{midtransTx.vaNumber}</strong> dan ikuti petunjuk KeyBCA.</li>
                    </ol>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* C. METODE LAINNYA (E-WALLET / KARTU KREDIT) */}
          {/* ----------------------------------------------------------------------- */}
          {!isQris && !isVa && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-blue-950 block">Pembayaran Digital Sandbox</span>
                <p className="text-[11px] text-blue-900/80 leading-relaxed">
                  Silakan selesaikan pengujian pembayaran melalui simulator Midtrans:
                </p>
                <a 
                  href={midtransTx.simulatorUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#004B99] hover:bg-[#003B7A] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Buka Simulator Pembayaran ↗</span>
                </a>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* 4. REALTIME LIVE STATUS RADAR BAR */}
          {/* ----------------------------------------------------------------------- */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 relative flex items-center justify-center shrink-0">
                <div className="absolute w-full h-full bg-amber-500 rounded-full animate-ping opacity-75"></div>
                <div className="w-1.5 h-1.5 bg-amber-700 rounded-full relative z-10"></div>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-xs text-amber-950 block truncate">
                  {midtransStatus === 'checking' 
                    ? 'Mengecek Status Pelunasan...' 
                    : isQris 
                    ? 'Menunggu Scan & Pelunasan QRIS...' 
                    : 'Menunggu Konfirmasi Pembayaran...'}
                </span>
                <span className="text-[10px] text-amber-800/90 font-light block truncate">
                  Sistem otomatis mendeteksi transaksi Anda secara real-time.
                </span>
              </div>
            </div>

            <button 
              onClick={onCheckStatus}
              disabled={midtransStatus === 'checking'}
              className="px-3 py-1.5 bg-white hover:bg-amber-100/80 text-amber-950 border border-amber-300 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 text-amber-700 ${midtransStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span>{midtransStatus === 'checking' ? 'Mengecek...' : 'Cek Status'}</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 5. FOOTER CANCEL / SWITCH PAYMENT BUTTON */}
          {/* ----------------------------------------------------------------------- */}
          <button 
            onClick={onClose}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Batal / Ganti Metode Pembayaran
          </button>

        </div>

      </div>
    </div>
  );
}

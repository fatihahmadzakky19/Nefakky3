'use client';

/**
 * ============================================================================
 * HALAMAN: Keranjang, Checkout, & Payment Midtrans (src/app/cart/page.tsx)
 * DESKRIPSI: Alur transaksi presisi 4-Tahap sesuai Google Stitch AI Design System
 *            (Cart -> Checkout -> Payment Midtrans -> Success).
 * BIAYA PENGIRIMAN LOGIK:
 *   - Jarak <= 3 km: 15% dari total harga produk (subtotal).
 *   - Jarak > 3 km: (15% x subtotal) + (Math.ceil((jarak - 3) / 2) * 1.500).
 * METODE PEMBAYARAN:
 *   - 100% Eksklusif Midtrans Snap Payment Gateway Engine.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart, CartLineItem } from '@/context/CartContext';
import { useData, isVoucherValidNow } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import AutoMapPickerModal from '@/components/AutoMapPickerModal';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  Tag, 
  Sparkles,
  MapPin,
  Truck,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Check,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Info,
  Edit3,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';

interface PlacedOrder {
  orderId: string;
  items: CartLineItem[];
  subtotal: number;
  shippingCost: number;
  serviceFee: number;
  discountAmount: number;
  totalPayment: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
  deliveryMethod: string;
  paymentMethod: string;
  date: string;
}

export default function BasketCartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addOrder, products: storeProducts, updateProduct, vouchers, claimVoucherRedemption } = useData();
  const { 
    cartItems, 
    totalCartCount, 
    subtotal, 
    addToCart, 
    removeFromCart, 
    deleteFromCart, 
    clearCart,
    appliedPromo,
    discountPercent,
    discountAmount,
    claimPromo,
    removePromo 
  } = useCart();

  // Multi-step Checkout state: 1 (Cart) -> 2 (Checkout) -> 3 (Payment) -> 4 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showMapPickerModal, setShowMapPickerModal] = useState<boolean>(false);
  const [detectedDistanceKm, setDetectedDistanceKm] = useState<number>(2.5);
  const [deliveryMethod, setDeliveryMethod] = useState<'express' | 'standard'>('express');
  const [cookingNotes, setCookingNotes] = useState<string>('');
  const [selectedMidtransChannel, setSelectedMidtransChannel] = useState<'va' | 'ewallet' | 'qris' | 'card'>('va');
  const [promoCode, setPromoCode] = useState<string>('');

  // Address State
  const [shippingAddress, setShippingAddress] = useState({
    name: 'Gourmet User',
    phone: '+62 812-3456-7890',
    address: 'Jl. Sudirman Kav 52-53, Jakarta Selatan, 12190'
  });
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
  const [tempAddress, setTempAddress] = useState({ ...shippingAddress });

  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        name: user.displayName || user.email?.split('@')[0] || prev.name,
        phone: user.phoneNumber || prev.phone
      }));
      setTempAddress(prev => ({
        ...prev,
        name: user.displayName || user.email?.split('@')[0] || prev.name,
        phone: user.phoneNumber || prev.phone
      }));
    }
  }, [user]);

  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  // =========================================================================
  // BIAYA PENGIRIMAN LOGIK EXPLICIT USER SPECIFICATION:
  // Jarak <= 3 km: 15% dari total harga produk (subtotal).
  // Jarak > 3 km: (15% x subtotal) + (Math.ceil((jarak - 3) / 2) * 1.500).
  // =========================================================================
  const baseShippingCost = Math.round(subtotal * 0.15);
  const extraDistanceKm = Math.max(0, detectedDistanceKm - 3);
  const extraFeeUnits = Math.ceil(extraDistanceKm / 2);
  const extraDistanceFee = extraFeeUnits * 1500;
  const shippingCost = baseShippingCost + extraDistanceFee;

  const serviceFee = 0;
  const calculatedDiscount = Math.round(discountAmount);
  const totalPayment = Math.max(0, subtotal + shippingCost - calculatedDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const res = claimPromo(promoCode.trim().toUpperCase());
    alert(res.message);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingAddress({ ...tempAddress });
    setIsEditingAddress(false);
  };

  const finalizeOrderPlacement = (generatedId: string, orderSummarySnapshot: PlacedOrder) => {
    addOrder({
      customerName: shippingAddress.name || user?.displayName || 'Pelanggan Nefakky',
      customerEmail: user?.email || undefined,
      userId: user?.uid || undefined,
      avatar: user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(shippingAddress.name)}&background=25160E&color=ffffff&bold=true`,
      address: shippingAddress.address,
      phone: shippingAddress.phone,
      items: cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image
      })),
      itemCount: totalCartCount,
      paymentMethod: 'Midtrans Payment Gateway',
      paymentBadge: 'PAID',
      deliveryType: deliveryMethod === 'express' ? 'Express Delivery (30-45 Mins)' : 'Standard Delivery (60 Mins)',
      status: 'COOKING',
      subtotal,
      shippingCost,
      discount: calculatedDiscount,
      total: totalPayment
    });

    if (appliedPromo) {
      claimVoucherRedemption(appliedPromo);
    }

    cartItems.forEach(item => {
      const found = (storeProducts || []).find(p => p.id === item.id);
      if (found) {
        const newStock = Math.max(0, found.stock - item.quantity);
        const currentCountNum = parseInt((found.soldCount || '0').replace(/[^0-9]/g, '')) || 0;
        const newCount = currentCountNum + item.quantity;
        updateProduct(item.id, {
          stock: newStock,
          soldCount: `${newCount} Terjual`,
          status: newStock === 0 ? 'Inactive' : newStock <= 5 ? 'Low Stock' : 'Active'
        });
      }
    });

    setPlacedOrder(orderSummarySnapshot);
    clearCart();
    setIsProcessingPayment(false);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [showMidtransSimulatorModal, setShowMidtransSimulatorModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<{
    orderId: string;
    grossAmount: number;
    vaNumber: string;
    paymentChannelName: string;
    simulatorUrl: string;
    orderSummarySnapshot: PlacedOrder;
  } | null>(null);

  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    const generatedId = `NFK-${Math.floor(100000 + Math.random() * 900000)}`;

    let vaCode = '';
    let channelName = 'Midtrans Virtual Account';
    let simUrl = 'https://simulator.sandbox.midtrans.com/bca/va/index';

    if (selectedMidtransChannel === 'va') {
      vaCode = `82740${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      channelName = 'Virtual Account Bank BCA / Mandiri / BNI';
      simUrl = 'https://simulator.sandbox.midtrans.com/bca/va/index';
    } else if (selectedMidtransChannel === 'ewallet' || selectedMidtransChannel === 'qris') {
      vaCode = `QRIS-NFK-${Math.floor(100000 + Math.random() * 900000)}`;
      channelName = 'QRIS / GoPay / ShopeePay Instant';
      simUrl = 'https://simulator.sandbox.midtrans.com/qris/index';
    } else {
      vaCode = `4811-1111-1111-${Math.floor(1000 + Math.random() * 9000)}`;
      channelName = 'Kartu Kredit / Debit (3D Secure)';
      simUrl = 'https://simulator.sandbox.midtrans.com/card/index';
    }

    const orderSummarySnapshot: PlacedOrder = {
      orderId: generatedId,
      items: [...cartItems],
      subtotal,
      shippingCost,
      serviceFee,
      discountAmount: calculatedDiscount,
      totalPayment,
      shippingAddress,
      deliveryMethod: deliveryMethod === 'express' ? 'Express Delivery' : 'Standard Delivery',
      paymentMethod: `Midtrans Snap (${channelName})`,
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setTimeout(() => {
      setPendingPaymentOrder({
        orderId: generatedId,
        grossAmount: totalPayment,
        vaNumber: vaCode,
        paymentChannelName: channelName,
        simulatorUrl: simUrl,
        orderSummarySnapshot
      });
      setIsProcessingPayment(false);
      setShowMidtransSimulatorModal(true);
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160E] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#4F4540] font-medium tracking-wide">Memuat Halaman Keranjang...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-[#25160E] text-amber-200 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-xl border border-amber-900/20">
            🛒
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#25160E]">Keranjang Belanja Anda</h2>
            <p className="text-xs text-[#4F4540] font-light leading-relaxed">
              Silakan masuk atau mendaftar akun terlebih dahulu untuk melihat dan mengelola pesanan makanan Anda.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 bg-[#25160E] hover:bg-[#3C2A21] text-white font-bold text-xs rounded-2xl shadow-lg transition-all block text-center uppercase tracking-wider"
            >
              Masuk ke Akun Saya
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 border border-[#25160E] text-[#25160E] hover:bg-stone-50 font-bold text-xs rounded-2xl transition-all block text-center uppercase tracking-wider"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans selection:bg-[#934B19]/10 selection:text-[#934B19]">
      
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* AUTO MAP PICKER MODAL */}
      <AutoMapPickerModal
        isOpen={showMapPickerModal}
        initialAddress={shippingAddress.address}
        onSelectAddress={(selectedAddress: string, distanceKm: number) => {
          setShippingAddress(prev => ({ ...prev, address: selectedAddress }));
          setDetectedDistanceKm(distanceKm);
          setShowMapPickerModal(false);
        }}
        onClose={() => setShowMapPickerModal(false)}
      />

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-[1280px] mx-auto px-6 lg:px-16 py-10 space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#25160E] tracking-tight">
            {currentStep === 1 && 'Keranjang Belanja Anda'}
            {currentStep === 2 && 'Checkout & Alamat Pengiriman'}
            {currentStep === 3 && 'Pembayaran via Midtrans'}
            {currentStep === 4 && 'Pesanan Berhasil Diselesaikan'}
          </h1>
          <p className="text-xs sm:text-sm text-[#4F4540] font-medium leading-relaxed max-w-2xl">
            Tinjau pilihan makanan otentik Nusantara Anda sebelum menyelesaikan transaksi pembayaran Midtrans Snap.
          </p>
        </div>

        {/* STEPPER PROGRESS INDICATOR (Cart -> Checkout -> Payment -> Success) */}
        <div className="max-w-lg mx-auto py-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-amber-900/15 -z-0" />
            <div 
              className="absolute left-6 top-4 -translate-y-1/2 h-0.5 bg-[#25160E] transition-all duration-500 -z-0"
              style={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%'
              }}
            />

            {/* STEP 1: CART */}
            <div className="flex flex-col items-center gap-1 z-10 bg-[#FBF9F5] px-1">
              <button 
                onClick={() => currentStep > 1 && currentStep < 4 && setCurrentStep(1)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep > 1 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-[#25160E] text-white shadow-md ring-4 ring-[#25160E]/20'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </button>
              <span className={`text-[11px] ${currentStep === 1 ? 'text-[#25160E] font-bold' : 'text-stone-500'}`}>
                1. Keranjang
              </span>
            </div>

            {/* STEP 2: CHECKOUT */}
            <div className="flex flex-col items-center gap-1 z-10 bg-[#FBF9F5] px-1">
              <button 
                onClick={() => currentStep > 2 && currentStep < 4 && setCurrentStep(2)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep > 2 
                    ? 'bg-emerald-600 text-white' 
                    : currentStep === 2 
                    ? 'bg-[#25160E] text-white shadow-md ring-4 ring-[#25160E]/20' 
                    : 'bg-stone-300 text-stone-600'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </button>
              <span className={`text-[11px] ${currentStep === 2 ? 'text-[#25160E] font-bold' : 'text-stone-500'}`}>
                2. Checkout
              </span>
            </div>

            {/* STEP 3: PAYMENT */}
            <div className="flex flex-col items-center gap-1 z-10 bg-[#FBF9F5] px-1">
              <button 
                onClick={() => currentStep > 3 && currentStep < 4 && setCurrentStep(3)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep > 3 
                    ? 'bg-emerald-600 text-white' 
                    : currentStep === 3 
                    ? 'bg-[#934B19] text-white shadow-md ring-4 ring-[#934B19]/20' 
                    : 'bg-stone-300 text-stone-600'
                }`}
              >
                {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </button>
              <span className={`text-[11px] ${currentStep === 3 ? 'text-[#934B19] font-bold' : 'text-stone-500'}`}>
                3. Payment
              </span>
            </div>

            {/* STEP 4: SUCCESS */}
            <div className="flex flex-col items-center gap-1 z-10 bg-[#FBF9F5] px-1">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 4 
                    ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-200' 
                    : 'bg-stone-300 text-stone-600'
                }`}
              >
                {currentStep === 4 ? <Check className="w-4 h-4" /> : '4'}
              </div>
              <span className={`text-[11px] ${currentStep === 4 ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
                4. Selesai
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: CART VIEW */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Basket Items List (Left Column) */}
            <div className="lg:col-span-7 space-y-6">
              {cartItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-amber-900/10 shadow-xl space-y-4">
                  <div className="w-16 h-16 bg-[#25160E] text-amber-200 rounded-full flex items-center justify-center mx-auto text-2xl shadow-md">
                    🛒
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#25160E]">Keranjang Belanja Kosong</h3>
                  <p className="text-xs text-[#4F4540] font-light max-w-xs mx-auto">
                    Belum ada menu yang Anda pilih. Silakan eksplorasi menu otentik kami.
                  </p>
                  <Link 
                    href="/menu" 
                    className="inline-block px-6 py-3 bg-[#934B19] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#783603] transition-all"
                  >
                    Pilih Menu Makanan
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6 divide-y divide-stone-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pt-6 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#25160E] shrink-0 border border-amber-900/10">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#934B19] font-bold uppercase tracking-wider">
                            {item.category || 'MAKANAN BERAT'}
                          </span>
                          <h3 className="font-serif text-base sm:text-lg font-bold text-[#25160E]">
                            {item.name}
                          </h3>
                          <p className="text-xs text-[#4F4540] font-semibold mt-0.5">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                        <div className="flex items-center gap-2 bg-[#FBF9F5] px-3 py-1.5 rounded-full border border-amber-900/15">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 rounded-full bg-white text-[#25160E] flex items-center justify-center hover:bg-stone-200 transition-colors shadow-xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-2 text-[#25160E] min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item.id)}
                            className="w-6 h-6 rounded-full bg-[#25160E] text-white flex items-center justify-center hover:bg-[#3C2A21] transition-colors shadow-xs font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-bold text-sm text-[#25160E] min-w-[90px] text-right">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>

                        <button
                          onClick={() => deleteFromCart(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Hapus dari Keranjang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Promo Input Section */}
                  <div className="pt-6 space-y-3">
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#934B19]" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Kode Promo (e.g. WEEKENDSERU)"
                          className="w-full pl-10 pr-4 py-3 bg-[#FBF9F5] border border-amber-900/15 text-[#1B1C1A] placeholder-stone-400 rounded-2xl outline-none focus:ring-2 focus:ring-[#934B19]/30 text-xs shadow-xs font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-3 bg-[#25160E] hover:bg-[#3C2A21] text-white text-xs font-bold rounded-2xl transition-colors shrink-0 uppercase tracking-wider shadow-xs"
                      >
                        Gunakan Kode
                      </button>
                    </form>

                    {appliedPromo && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
                        <p className="text-xs text-[#934B19] font-bold flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#934B19]" />
                          <span>Promo Aktif: <strong>{appliedPromo}</strong> (Diskon {discountPercent}%)</span>
                        </p>
                        <button 
                          type="button" 
                          onClick={removePromo} 
                          className="text-[11px] text-rose-600 hover:underline font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Sticky Order Summary (Right Column) */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#25160E] mb-1">Ringkasan Biaya</h3>
                  <p className="text-xs text-[#4F4540] font-medium">{totalCartCount} Porsi Menu Dalam Keranjang</p>
                </div>

                <div className="space-y-3 text-xs border-t border-b border-stone-100 py-4">
                  <div className="flex justify-between text-[#1B1C1A]">
                    <span>Subtotal Makanan</span>
                    <span className="font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[#1B1C1A]">
                    <span>Estimasi Ongkos Kirim ({detectedDistanceKm.toFixed(1)} km)</span>
                    <span className="font-bold">Rp {shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Potongan Diskon Promo</span>
                      <span>-Rp {calculatedDiscount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-[#4F4540] font-medium">Total Pembayaran</p>
                    <p className="text-[10px] text-stone-400">Termasuk pajak & ongkir</p>
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#25160E]">
                    Rp {totalPayment.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (cartItems.length === 0) return;
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={cartItems.length === 0}
                  className="w-full py-4 bg-[#25160E] hover:bg-[#3C2A21] text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                >
                  <span>Lanjutkan Ke Checkout (Alamat & Detail)</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#4F4540]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sistem Pembayaran 100% Eksklusif Midtrans Snap Engine</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: CHECKOUT VIEW (Alamat Pengiriman & Detail Pesanan) */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Column: Alamat & Opsi Pengiriman */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Alamat Penerima Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-[#934B19]" />
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#25160E]">Alamat Tujuan Pengiriman</h3>
                      <p className="text-xs text-[#4F4540]">Alamat rumah atau lokasi pengantaran Anda.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMapPickerModal(true)}
                    className="px-4 py-2 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-200" />
                    <span>Pilih dari Peta GPS ({detectedDistanceKm.toFixed(1)} km)</span>
                  </button>
                </div>

                {isEditingAddress ? (
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#25160E] mb-1">Nama Penerima</label>
                      <input
                        type="text"
                        value={tempAddress.name}
                        onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#25160E] mb-1">Nomor WhatsApp / Telepon</label>
                      <input
                        type="text"
                        value={tempAddress.phone}
                        onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#25160E] mb-1">Alamat Lengkap</label>
                      <textarea
                        value={tempAddress.address}
                        onChange={(e) => setTempAddress({ ...tempAddress, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] outline-none resize-none"
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-4 py-2.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-2xl"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#25160E] text-white text-xs font-bold rounded-2xl shadow-sm"
                      >
                        Simpan Alamat
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-[#FBF9F5] p-5 rounded-2xl border border-amber-900/15 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#25160E]">{shippingAddress.name} <span className="text-xs text-[#934B19]">({shippingAddress.phone})</span></p>
                      <p className="text-xs text-[#4F4540] font-light leading-relaxed">{shippingAddress.address}</p>
                    </div>
                    <button
                      onClick={() => {
                        setTempAddress({ ...shippingAddress });
                        setIsEditingAddress(true);
                      }}
                      className="p-2 text-[#934B19] hover:bg-amber-100/50 rounded-xl transition-colors shrink-0"
                      title="Edit Alamat Manual"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Formula Penjelasan Ongkir Transparency Card */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs text-[#934B19] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold">
                    <Info className="w-4 h-4 shrink-0 text-[#934B19]" />
                    <span>Rincian Kalkulasi Ongkos Kirim ({detectedDistanceKm.toFixed(1)} km)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#4F4540]">
                    • Jarak <strong>{detectedDistanceKm.toFixed(1)} km</strong> ({detectedDistanceKm <= 3 ? 'Standar <= 3 km' : 'Luar Jangkauan > 3 km'})<br />
                    • Dasar 15% Subtotal Makanan: <strong>Rp {baseShippingCost.toLocaleString('id-ID')}</strong><br />
                    {detectedDistanceKm > 3 ? (
                      <>• Tambahan Di atas 3 km ({extraDistanceKm.toFixed(1)} km = {extraFeeUnits} kelipatan 2km x Rp 1.500): <strong>+Rp {extraDistanceFee.toLocaleString('id-ID')}</strong><br /></>
                    ) : null}
                    • Total Biaya Pengiriman: <strong className="text-[#934B19]">Rp {shippingCost.toLocaleString('id-ID')}</strong>
                  </p>
                </div>
              </div>

              {/* Catatan Khusus Masakan */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#25160E]">Catatan Khusus Untuk Dapur</h3>
                <textarea
                  value={cookingNotes}
                  onChange={(e) => setCookingNotes(e.target.value)}
                  placeholder="Contoh: Kurangi tingkat pedas, pisahkan kuah gudeg, tolong kirim sendok kayu..."
                  rows={2}
                  className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] outline-none resize-none placeholder-stone-400"
                />
              </div>

            </div>

            {/* Right Column: Checkout Summary & Navigation Buttons */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#25160E] mb-1">Rincian Checkout</h3>
                  <p className="text-xs text-[#4F4540] font-medium">Langkah 2 dari 4 sebelum Pembayaran</p>
                </div>

                <div className="space-y-3 text-xs border-t border-b border-stone-100 py-4">
                  <div className="flex justify-between text-[#1B1C1A]">
                    <span>Subtotal Makanan</span>
                    <span className="font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[#1B1C1A]">
                    <span>Ongkos Kirim ({detectedDistanceKm.toFixed(1)} km)</span>
                    <span className="font-bold">Rp {shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Potongan Diskon Promo</span>
                      <span>-Rp {calculatedDiscount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-[#4F4540] font-medium">Total Pembayaran</p>
                    <p className="text-[10px] text-stone-400">Pajak & Ongkir Terhitung</p>
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#25160E]">
                    Rp {totalPayment.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setCurrentStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-4 bg-[#934B19] hover:bg-[#783603] text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                  >
                    <span>Lanjutkan Ke Pembayaran Midtrans</span>
                    <ArrowRight className="w-4 h-4 text-amber-200" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-3.5 bg-[#FBF9F5] border border-amber-900/15 text-[#25160E] font-bold text-xs rounded-2xl hover:bg-stone-100 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali Ke Keranjang</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* STEP 3: PAYMENT VIEW (Eksklusif Midtrans Snap Engine) */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Column: Midtrans Console Selection */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Midtrans Header Banner */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#25160E] text-amber-300 flex items-center justify-center font-bold text-xl shadow-md">
                      💳
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#25160E]">Midtrans Snap Payment Engine</h3>
                      <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>SECURED BY MIDTRANS 256-BIT ENCRYPTION</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-[#934B19] text-[10px] font-bold rounded-full uppercase border border-amber-300">
                    AUTOMATIC SNAP GATEWAY
                  </span>
                </div>

                {/* Channel Payment Cards Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#25160E] uppercase tracking-wider block">Pilih Saluran Pembayaran Midtrans:</span>
                  
                  {/* Option 1: Virtual Account */}
                  <div
                    onClick={() => setSelectedMidtransChannel('va')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedMidtransChannel === 'va'
                        ? 'bg-[#25160E] text-white border-[#25160E] shadow-md'
                        : 'bg-[#FBF9F5] text-[#1B1C1A] border-amber-900/15 hover:border-[#934B19]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-amber-300" />
                      <div>
                        <h4 className="font-bold text-xs">Virtual Account Bank (BCA, Mandiri, BNI, BRI)</h4>
                        <p className="text-[11px] opacity-80">Verifikasi otomatis 24/7 tanpa perlu unggah struk.</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMidtransChannel === 'va' ? 'border-amber-300 bg-amber-300 text-[#25160E]' : 'border-stone-400'}`}>
                      {selectedMidtransChannel === 'va' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Option 2: E-Wallet */}
                  <div
                    onClick={() => setSelectedMidtransChannel('ewallet')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedMidtransChannel === 'ewallet'
                        ? 'bg-[#25160E] text-white border-[#25160E] shadow-md'
                        : 'bg-[#FBF9F5] text-[#1B1C1A] border-amber-900/15 hover:border-[#934B19]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-amber-300" />
                      <div>
                        <h4 className="font-bold text-xs">GoPay, ShopeePay, OVO, DANA Instant</h4>
                        <p className="text-[11px] opacity-80">Langsung memotong saldo dompet digital Anda.</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMidtransChannel === 'ewallet' ? 'border-amber-300 bg-amber-300 text-[#25160E]' : 'border-stone-400'}`}>
                      {selectedMidtransChannel === 'ewallet' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Option 3: QRIS */}
                  <div
                    onClick={() => setSelectedMidtransChannel('qris')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedMidtransChannel === 'qris'
                        ? 'bg-[#25160E] text-white border-[#25160E] shadow-md'
                        : 'bg-[#FBF9F5] text-[#1B1C1A] border-amber-900/15 hover:border-[#934B19]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <QrCode className="w-5 h-5 text-amber-300" />
                      <div>
                        <h4 className="font-bold text-xs">QRIS Standar Nasional (Scan QR Code All Bank)</h4>
                        <p className="text-[11px] opacity-80">Scan QR Code menggunakan m-Banking atau e-Money apa saja.</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMidtransChannel === 'qris' ? 'border-amber-300 bg-amber-300 text-[#25160E]' : 'border-stone-400'}`}>
                      {selectedMidtransChannel === 'qris' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Option 4: Credit Card */}
                  <div
                    onClick={() => setSelectedMidtransChannel('card')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedMidtransChannel === 'card'
                        ? 'bg-[#25160E] text-white border-[#25160E] shadow-md'
                        : 'bg-[#FBF9F5] text-[#1B1C1A] border-amber-900/15 hover:border-[#934B19]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-amber-300" />
                      <div>
                        <h4 className="font-bold text-xs">Kartu Kredit / Debit Visa & MasterCard</h4>
                        <p className="text-[11px] opacity-80">Diproteksi oleh 3D Secure Midtrans Fraud Detection Engine.</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMidtransChannel === 'card' ? 'border-amber-300 bg-amber-300 text-[#25160E]' : 'border-stone-400'}`}>
                      {selectedMidtransChannel === 'card' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Final Payment Summary & Action Button */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#25160E] mb-1">Tagihan Pembayaran</h3>
                  <p className="text-xs text-[#4F4540] font-medium">Konfirmasi Akhir Sebelum Eksekusi Midtrans</p>
                </div>

                <div className="space-y-3 text-xs border-t border-b border-stone-100 py-4">
                  <div className="flex justify-between text-[#1B1C1A]">
                    <span>Total Tagihan Transaksi</span>
                    <span className="font-bold text-[#934B19]">Rp {totalPayment.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[#1B1C1A]">
                    <span>Metode Dipilih</span>
                    <span className="font-bold text-[#25160E] uppercase">{selectedMidtransChannel} (Midtrans Snap)</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-[#4F4540] font-medium">Total Yang Dibayar</p>
                    <p className="text-[10px] text-emerald-700 font-bold">● Lunas Setelah Konfirmasi</p>
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#25160E]">
                    Rp {totalPayment.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessingPayment}
                    className="w-full py-4 bg-[#25160E] hover:bg-[#3C2A21] text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isProcessingPayment ? 'Memproses Midtrans Snap...' : 'BAYAR SEKARANG VIA MIDTRANS SNAP'}</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-3.5 bg-[#FBF9F5] border border-amber-900/15 text-[#25160E] font-bold text-xs rounded-2xl hover:bg-stone-100 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali Ke Detail Checkout</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#4F4540] text-center pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transaksi Anda Terlindungi Oleh Midtrans Snap Payment Security</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 4: SUCCESS VIEW */}
        {currentStep === 4 && placedOrder && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-amber-900/10 shadow-2xl text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full uppercase border border-emerald-200">
                PEMBAYARAN DITERIMA REAL-TIME
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#25160E]">Pesanan Anda Berhasil!</h2>
              <p className="text-xs text-[#4F4540] font-light max-w-sm mx-auto leading-relaxed">
                Terima kasih atas pemesanan Anda. Tim dapur kami sedang meracik hidangan otentik Anda.
              </p>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-amber-900/10 text-left space-y-2 text-xs">
              <div className="flex justify-between font-mono font-bold text-[#934B19]">
                <span>ID Transaksi:</span>
                <span>#{placedOrder.orderId}</span>
              </div>
              <div className="flex justify-between text-[#4F4540]">
                <span>Total Biaya:</span>
                <span className="font-bold text-[#25160E]">Rp {placedOrder.totalPayment.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[#4F4540]">
                <span>Metode Pembayaran:</span>
                <span className="font-semibold text-emerald-700">{placedOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/notifications"
                className="w-full py-3.5 bg-[#25160E] hover:bg-[#3C2A21] text-white font-bold text-xs rounded-2xl shadow-lg transition-all block text-center uppercase tracking-wider"
              >
                Lacak Status Pengiriman Real-time
              </Link>
              <Link
                href="/menu"
                className="w-full py-3.5 border border-[#25160E] text-[#25160E] hover:bg-stone-50 font-bold text-xs rounded-2xl transition-all block text-center uppercase tracking-wider"
              >
                Kembali ke Katalog Menu
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* MODAL SIMULATOR PEMBAYARAN MIDTRANS SANDBOX */}
      {showMidtransSimulatorModal && pendingPaymentOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-900/10 space-y-6 relative">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25160E] text-amber-300 flex items-center justify-center font-bold text-xl shadow-md">
                  💳
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#25160E]">Midtrans Payment Simulator</h3>
                  <p className="text-xs text-[#934B19] font-semibold">Mode Simulasi Uji Coba Transaksi Sandbox</p>
                </div>
              </div>
              <button
                onClick={() => setShowMidtransSimulatorModal(false)}
                className="p-2 text-stone-400 hover:text-[#25160E] hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-[#783603] space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <Info className="w-4 h-4 text-[#934B19]" />
                <span>Petunjuk Lakukan Pembayaran di Midtrans Simulator:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Salin <strong>Kode Pembayaran / VA Code</strong> di bawah ini.</li>
                <li>Klik tombol <strong>Buka Midtrans Simulator</strong> untuk menuju simulator resmi Midtrans.</li>
                <li>Tempelkan kode di simulator lalu tekan <strong>Inquire / Pay</strong> hingga status sukses.</li>
                <li>Kembali ke halaman ini dan tekan tombol <strong>Saya Sudah Bayar di Midtrans Simulator</strong>.</li>
              </ol>
            </div>

            {/* Payment Code Box */}
            <div className="bg-[#25160E] text-white p-5 rounded-2xl space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-xs border-b border-amber-900/30 pb-2">
                <span className="text-stone-300">Channel Pembayaran:</span>
                <span className="font-bold text-amber-300">{pendingPaymentOrder.paymentChannelName}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-bold">KODE PEMBAYARAN / VA NUMBER:</span>
                <div className="flex items-center justify-between bg-[#3C2A21] px-4 py-3 rounded-xl border border-amber-900/40">
                  <span className="font-mono text-lg font-bold text-amber-300 tracking-wider">
                    {pendingPaymentOrder.vaNumber}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pendingPaymentOrder.vaNumber);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-stone-300">Total Nominal Tagihan:</span>
                <span className="font-serif text-lg font-bold text-white">Rp {pendingPaymentOrder.grossAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* External Simulator Direct Link Button */}
            <a
              href={pendingPaymentOrder.simulatorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#FBF9F5] hover:bg-stone-100 border border-amber-900/20 text-[#25160E] font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs group cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#934B19] group-hover:scale-110 transition-transform" />
              <span>🚀 Buka Website Midtrans Payment Simulator</span>
            </a>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  setShowMidtransSimulatorModal(false);
                  finalizeOrderPlacement(
                    pendingPaymentOrder.orderId,
                    pendingPaymentOrder.orderSummarySnapshot
                  );
                }}
                className="w-full py-4 bg-[#934B19] hover:bg-[#783603] text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Saya Sudah Bayar di Midtrans Simulator</span>
              </button>

              <button
                onClick={() => setShowMidtransSimulatorModal(false)}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition-all text-center cursor-pointer"
              >
                Batal / Ulangi Pilih Pembayaran
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

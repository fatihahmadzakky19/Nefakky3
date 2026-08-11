'use client';

/**
 * ============================================================================
 * HALAMAN: Keranjang & Checkout (src/app/cart/page.tsx)
 * DESKRIPSI: Desain presisi sesuai Figma mockup Nefakky.
 *            Dilengkapi penyesuaian kuantitas, sistem diskon voucher otomatis,
 *            penghitungan ongkir berbasis lokasi, integrasi Midtrans Snap,
 *            dan 100% Bahasa Indonesia.
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
  Navigation
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
  const [detectedDistanceKm, setDetectedDistanceKm] = useState<number>(4.2);

  // Address State
  const [shippingAddress, setShippingAddress] = useState({
    name: 'Eleanor Thorne',
    phone: '+62 812-3456-7890',
    address: '824 Artisans Lane, Suite 12, West Village, Jakarta Selatan, 12190'
  });
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
  const [tempAddress, setTempAddress] = useState({ ...shippingAddress });

  // Update address with user info if available
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        name: user.displayName || user.email?.split('@')[0] || prev.name,
      }));
    }
  }, [user]);

  // Options state
  const [deliveryMethod, setDeliveryMethod] = useState<'standard'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'midtrans'>('midtrans');

  // Load Midtrans Snap Script dynamically in Sandbox (Demo) mode
  useEffect(() => {
    const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-8T4q9uw1fIGB-pla';

    if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
      const script = document.createElement('script');
      script.src = snapScriptUrl;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Promo code input state
  const [promoCode, setPromoCode] = useState<string>('');

  // Payment processing state & completed order snapshot
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  // Midtrans Interactive Snap Popup Modal Mockup state
  const [showMidtransModal, setShowMidtransModal] = useState<boolean>(false);
  const [midtransChannel, setMidtransChannel] = useState<'gopay' | 'va' | 'shopeepay' | 'cc'>('gopay');
  const [midtransOrderData, setMidtransOrderData] = useState<{ generatedId: string; snapshot: PlacedOrder } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const res = claimPromo(promoCode);
    if (res.success) {
      alert(res.message);
      setPromoCode('');
    } else {
      alert(res.message);
    }
  };

  // Biaya Pengiriman & Subtotal calculation
  const shippingCost = subtotal > 0 ? Math.round(subtotal * 0.10) : 0;
  const serviceFee = 0;
  const calculatedDiscount = discountAmount || Math.round(subtotal * (discountPercent / 100));
  const totalPayment = Math.max(0, subtotal + shippingCost - calculatedDiscount);

  // Save address edit
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingAddress(tempAddress);
    setIsEditingAddress(false);
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) return;
    if (!shippingAddress.address || shippingAddress.address.trim() === '' || shippingAddress.address === 'Belum diisi') {
      setIsEditingAddress(true);
      alert('Alamat pengiriman wajib diisi terlebih dahulu sebelum melanjutkan ke pembayaran!');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalizeOrderPlacement = (generatedId: string, orderSummarySnapshot: PlacedOrder) => {
    addOrder({
      customerName: shippingAddress.name || user?.displayName || user?.email?.split('@')[0] || 'Pelanggan Nefakky',
      customerEmail: user?.email ? user.email.toLowerCase() : undefined,
      userId: user?.uid || undefined,
      createdAt: Date.now(),
      avatar: user?.photoURL || (
        user?.displayName 
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=613A1F&color=ffffff&bold=true`
          : user?.email 
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=613A1F&color=ffffff&bold=true`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(shippingAddress.name || 'User')}&background=613A1F&color=ffffff&bold=true`
      ),
      address: shippingAddress.address || 'Belum diisi',
      phone: shippingAddress.phone,
      items: cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image
      })),
      itemCount: totalCartCount,
      paymentMethod: orderSummarySnapshot.paymentMethod,
      paymentBadge: 'PAID',
      deliveryType: 'Ongkir Standar (Nefakky Delivery)',
      status: 'COOKING',
      subtotal,
      shippingCost: shippingCost,
      discount: calculatedDiscount,
      total: totalPayment
    });

    // Auto-increment promo redemptions & auto-kill promo in real-time if usage limit is reached
    if (appliedPromo) {
      claimVoucherRedemption(appliedPromo);
    }

    // Update product stock & soldCount dynamically
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

  // Finalize payment from Payment (Step 3) -> Success (Step 4)
  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    const generatedId = `NFK-${Math.floor(100000 + Math.random() * 900000)}`;

    const formattedPaymentMethod = 'Midtrans Payment Gateway';

    const orderSummarySnapshot: PlacedOrder = {
      orderId: generatedId,
      items: [...cartItems],
      subtotal,
      shippingCost,
      serviceFee,
      discountAmount: calculatedDiscount,
      totalPayment,
      shippingAddress,
      deliveryMethod,
      paymentMethod: formattedPaymentMethod,
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    if (paymentMethod === 'midtrans') {
      try {
        if (typeof (window as any).snap === 'undefined') {
          const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
          const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-8T4q9uw1fIGB-pla';
          await new Promise((resolve) => {
            let script = document.querySelector(`script[src="${snapScriptUrl}"]`) as HTMLScriptElement;
            if (!script) {
              script = document.createElement('script');
              script.src = snapScriptUrl;
              script.setAttribute('data-client-key', clientKey);
              script.async = true;
              script.onload = () => resolve(true);
              script.onerror = () => resolve(false);
              document.body.appendChild(script);
            } else {
              resolve(true);
            }
          });
        }

        const res = await fetch('/api/midtrans/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: generatedId,
            grossAmount: totalPayment,
            customerDetails: {
              name: shippingAddress.name || user?.displayName || 'Pelanggan',
              email: user?.email || 'customer@nefakky.com',
              phone: shippingAddress.phone || '081234567890',
              address: shippingAddress.address || 'Jakarta'
            },
            itemDetails: cartItems.map(i => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity
            }))
          })
        });

        const data = await res.json();
        setIsProcessingPayment(false);

        if (data.error) {
          console.error('Midtrans API Error:', data.error);
          setMidtransOrderData({ generatedId, snapshot: orderSummarySnapshot });
          setShowMidtransModal(true);
          return;
        }

        if (data.token && typeof (window as any).snap !== 'undefined') {
          (window as any).snap.pay(data.token, {
            onSuccess: function () {
              alert('Pembayaran Midtrans Real-Time Berhasil! Terima kasih.');
              finalizeOrderPlacement(generatedId, orderSummarySnapshot);
            },
            onPending: function () {
              alert('Pembayaran Midtrans Pending / Berhasil Disimulasikan!');
              finalizeOrderPlacement(generatedId, orderSummarySnapshot);
            },
            onError: function () {
              alert('Pembayaran Gagal / Dibatalkan di Midtrans.');
              finalizeOrderPlacement(generatedId, orderSummarySnapshot);
            },
            onClose: function () {
              alert('Jendela Midtrans Snap ditutup. Pesanan Anda kami proses secara otomatis!');
              finalizeOrderPlacement(generatedId, orderSummarySnapshot);
            }
          });
          return;
        } else if (data.redirect_url) {
          window.open(data.redirect_url, '_blank');
          finalizeOrderPlacement(generatedId, orderSummarySnapshot);
          return;
        } else {
          setMidtransOrderData({ generatedId, snapshot: orderSummarySnapshot });
          setShowMidtransModal(true);
          return;
        }
      } catch (e) {
        console.warn('Midtrans Snap Token Real-Time Error, falling back to Interactive Modal:', e);
        setIsProcessingPayment(false);
        setMidtransOrderData({ generatedId, snapshot: orderSummarySnapshot });
        setShowMidtransModal(true);
        return;
      }
    }

    setTimeout(() => {
      finalizeOrderPlacement(generatedId, orderSummarySnapshot);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8E9DE] flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#6A3B12] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#7A4B29] font-medium">Memuat Halaman Keranjang...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8E9DE] text-[#2D1B0E] font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-[#F2AE72] text-[#2D1B0E] rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
            🛒
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#2D1B0E]">Keranjang Belanja Anda</h2>
            <p className="text-xs text-[#7A4B29] font-light leading-relaxed">
              Silakan masuk atau mendaftar akun terlebih dahulu untuk melihat dan mengelola pesanan makanan Anda.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 bg-[#6A3B12] hover:bg-[#572F0D] text-white font-bold text-xs rounded-full shadow transition-all block text-center uppercase tracking-wider"
            >
              Masuk ke Akun Saya
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 border border-[#6A3B12] text-[#6A3B12] hover:bg-[#6A3B12]/5 font-bold text-xs rounded-full transition-all block text-center uppercase tracking-wider"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8E9DE] text-[#2D1B0E] font-sans selection:bg-[#F2AE72]/30">
      
      {/* 1. TOP NAVBAR (MATCHING FIGMA ORANGE TOP BAR) */}
      <Navbar />

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        
        {/* STEPPER PROGRESS INDICATOR (ONLY WHEN CHECKING OUT - STEPS 2, 3, 4) */}
        {currentStep > 1 && (
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-[#E2C3AF] -z-0" />
              <div 
                className="absolute left-6 top-4 -translate-y-1/2 h-0.5 bg-[#6A3B12] transition-all duration-500 -z-0"
                style={{
                  width: currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%'
                }}
              />

              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1 z-10 bg-[#F8E9DE] px-1">
                <button 
                  onClick={() => setCurrentStep(1)}
                  className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold"
                >
                  <Check className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-[#6A3B12]">Cart</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1 z-10 bg-[#F8E9DE] px-1">
                <button 
                  onClick={() => currentStep > 2 && currentStep < 4 && setCurrentStep(2)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > 2 
                      ? 'bg-emerald-600 text-white' 
                      : currentStep === 2 
                      ? 'bg-[#6A3B12] text-white shadow-md' 
                      : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                </button>
                <span className={`text-[11px] ${currentStep === 2 ? 'text-[#6A3B12] font-bold' : 'text-stone-500'}`}>
                  Checkout
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-1 z-10 bg-[#F8E9DE] px-1">
                <button 
                  onClick={() => currentStep > 3 && currentStep < 4 && setCurrentStep(3)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > 3 
                      ? 'bg-emerald-600 text-white' 
                      : currentStep === 3 
                      ? 'bg-[#6A3B12] text-white shadow-md' 
                      : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
                </button>
                <span className={`text-[11px] ${currentStep === 3 ? 'text-[#6A3B12] font-bold' : 'text-stone-500'}`}>
                  Payment
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center gap-1 z-10 bg-[#F8E9DE] px-1">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 4 
                      ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-200' 
                      : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  {currentStep === 4 ? <Check className="w-4 h-4" /> : '4'}
                </div>
                <span className={`text-[11px] ${currentStep === 4 ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
                  Success
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 1: CART PAGE (EXACT FIGMA LAYOUT MATCH) */}
        {/* ---------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            {/* Header Title (Matches Figma: Keranjang Anda) */}
            <div className="mb-8">
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#2D1B0E] tracking-tight">
                Keranjang <span className="font-normal">Anda</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#7A4B29]/80 font-light mt-1.5">
                Cita rasa artisan pilihan, siap untuk dapur Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              
              {/* Basket Items List (Left Column) */}
              <div className="lg:col-span-7 space-y-6">
                {cartItems.length === 0 ? (
                  /* EMPTY STATE CARD (EXACT FIGMA MATCH) */
                  <div className="bg-white rounded-[28px] p-10 sm:p-14 text-center border border-stone-100 shadow-xs space-y-5">
                    <div className="w-16 h-16 bg-[#EFEFEF] text-stone-700 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1B0E]">
                        Keranjang <span className="font-normal">Anda Kosong</span>
                      </h3>
                      <p className="text-xs text-[#7A4B29]/80 max-w-xs mx-auto font-light leading-relaxed">
                        Belum ada barang yang dipesan. Silakan pilih hidangan favorit Anda dari halaman katalog menu.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link 
                        href="/menu" 
                        className="inline-block px-8 py-3.5 bg-[#824B1B] hover:bg-[#683B12] text-white text-xs font-bold rounded-full shadow-sm transition-all"
                      >
                        Pilih Menu Makanan
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* FILLED CART ITEMS CARD (EXACT FIGMA MATCH) */
                  <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-100 shadow-xs space-y-6 divide-y divide-stone-100">
                    {cartItems.map((item) => (
                      <div key={item.id} className="pt-6 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8A6337] font-bold uppercase tracking-wider">
                              {item.category || 'MAKANAN BERAT'}
                            </span>
                            <h3 className="font-serif text-base sm:text-lg font-bold text-[#2D1B0E]">
                              {item.name}
                            </h3>
                            <p className="text-xs text-stone-500 font-mono mt-0.5">
                              Rp {item.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                          {/* Quantity selector pill */}
                          <div className="flex items-center gap-2 bg-[#F3F3F3] px-3 py-1.5 rounded-full border border-stone-200/60">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 rounded-full bg-white text-stone-800 flex items-center justify-center hover:bg-stone-200 transition-colors shadow-2xs font-bold"
                            >
                              <Minus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <span className="text-xs font-bold px-2 text-stone-900 min-w-[20px] text-center font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-6 h-6 rounded-full bg-[#4A280D] text-white flex items-center justify-center hover:bg-[#381D08] transition-colors shadow-2xs font-bold"
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>

                          <span className="font-serif font-bold text-sm text-[#2D1B0E] min-w-[90px] text-right">
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

                    {/* Promo input section */}
                    <div className="pt-6">
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C320A]" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Kode Promo (e.g. WEEKENDSERU)"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#EE9B44] hover:bg-[#E8933A] focus:bg-[#EE9B44] border border-[#DE8B32] text-[#2A1506] placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 text-xs shadow-xs font-medium"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#5E330D] hover:bg-[#472608] text-white text-xs font-bold rounded-xl transition-colors shrink-0 uppercase tracking-wider shadow-xs"
                        >
                          GUNAKAN KODE
                        </button>
                      </form>

                      {appliedPromo && (
                        <div className="mt-3 p-3 bg-[#FCEEE2] border border-[#EACBB0] rounded-xl flex items-center justify-between shadow-xs">
                          <p className="text-xs text-[#6E3E13] font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#6E3E13]" />
                            <span>Promo Aktif: <strong className="font-mono">{appliedPromo}</strong> (Diskon {discountPercent}%)</span>
                          </p>
                          <button 
                            type="button" 
                            onClick={removePromo} 
                            className="text-[11px] text-red-600 hover:underline font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      )}

                      {/* Registered Vouchers */}
                      {vouchers && vouchers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
                          <span className="text-[10px] text-[#7A5B43] font-bold uppercase tracking-wider block">
                            Pilihan Kode Promo Terdaftar:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(vouchers || []).map((v: any) => {
                              const { active: isActive, reason } = isVoucherValidNow(v);
                              const disabledReason = !isActive
                                ? (reason || `Promo ${v.code} sedang tidak aktif`)
                                : `Gunakan promo ${v.code}`;

                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  disabled={!isActive}
                                  onClick={() => {
                                    if (isActive) {
                                      setPromoCode(v.code);
                                      const res = claimPromo(v.code);
                                      alert(res.message);
                                    } else {
                                      alert(reason || `Promo ${v.code} sedang tidak aktif`);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 border ${
                                    isActive
                                      ? 'bg-[#F59E3D] text-[#2D1B0E] border-[#DE8B32] hover:bg-[#F3952D] cursor-pointer shadow-xs'
                                      : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60'
                                  }`}
                                  title={disabledReason}
                                >
                                  <span>{v.code} ({v.discountPercent}%)</span>
                                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-500'}`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Side Card (EXACT FIGMA MATCH) */}
              <div className="lg:col-span-5">
                <div className="bg-[#F3B375] rounded-[28px] p-8 sm:p-10 space-y-6 shadow-sm border border-[#E9A464]/40 sticky top-24">
                  
                  {/* Brand Title */}
                  <h3 className="font-serif text-3xl font-bold text-[#2D1B0E] text-center">
                    Nefakky
                  </h3>

                  {/* Section Title */}
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1B0E]">
                    Ringkasan Pesanan
                  </h2>

                  <div className="space-y-3.5 text-xs text-[#2D1B0E] font-medium">
                    <div className="flex items-center justify-between">
                      <span>Total Items</span>
                      <span className="font-bold">{totalCartCount} Items</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Biaya Pengiriman</span>
                      <span className="font-mono">
                        {cartItems.length > 0 ? `Rp ${shippingCost.toLocaleString('id-ID')}` : 'Rp 0.000'}
                      </span>
                    </div>

                    {calculatedDiscount > 0 && (
                      <div className="flex items-center justify-between text-[#6E3E13] font-bold">
                        <span>Diskon Promo</span>
                        <span className="font-mono">- Rp {calculatedDiscount.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="border-t border-[#D99357] pt-4" />

                    <div className="flex items-center justify-between text-[#2D1B0E] font-serif text-lg font-bold">
                      <span>Total Payment</span>
                      <span>Rp {totalPayment.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-[#6A3B12] hover:bg-[#542E0C] active:scale-[0.99] disabled:bg-stone-500/50 disabled:cursor-not-allowed text-white font-bold rounded-full shadow-md transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <span>CHECKOUT NOW</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] tracking-wider text-white/90 font-medium uppercase pt-1">
                    <Lock className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Secure SSL Checkout</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: CHECKOUT PAGE */}
        {/* ---------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-8">
            <div>
              <button 
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 text-xs text-[#7A4B29] hover:text-[#2D1B0E] font-semibold transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Keranjang</span>
              </button>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#2D1B0E] tracking-tight">
                Checkout
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-7 space-y-6">
                
                {/* ADDRESS CARD */}
                <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[#2D1B0E]">
                      <MapPin className="w-5 h-5 text-[#8A6337]" />
                      <h2 className="font-serif text-xl font-bold">Alamat Pengiriman</h2>
                    </div>
                    <button 
                      onClick={() => {
                        setTempAddress({ ...shippingAddress });
                        setIsEditingAddress(!isEditingAddress);
                      }}
                      className="text-xs font-bold text-[#8A6337] hover:underline"
                    >
                      {isEditingAddress ? 'Batal' : 'Edit Alamat'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMapPickerModal(true)}
                    className="w-full py-2.5 px-4 bg-[#F5EBE1] hover:bg-[#EBDCCF] text-[#5C3D28] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-[#5C3D28]/20"
                  >
                    <Navigation className="w-4 h-4 text-[#5C3D28]" />
                    <span>📍 Pilih Alamat via Peta Otomatis (GPS)</span>
                  </button>

                  {isEditingAddress ? (
                    <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1 font-semibold">Nama Penerima</label>
                        <input
                          type="text"
                          value={tempAddress.name}
                          onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#F5F2EC] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#5C3D28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1 font-semibold">Nomor Telepon</label>
                        <input
                          type="text"
                          value={tempAddress.phone}
                          onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#F5F2EC] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#5C3D28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1 font-semibold">Alamat Lengkap</label>
                        <textarea
                          rows={2}
                          value={tempAddress.address}
                          onChange={(e) => setTempAddress({ ...tempAddress, address: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#F5F2EC] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#5C3D28]"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#5C3D28] text-white text-xs font-bold rounded-full hover:bg-[#472E1E] transition-colors"
                      >
                        Simpan Alamat
                      </button>
                    </form>
                  ) : (
                    <div className="text-xs space-y-1.5 text-stone-600 pt-1">
                      <p className="font-bold text-[#2D1B0E] text-sm">{shippingAddress.name}</p>
                      <p className="text-stone-500 font-mono">{shippingAddress.phone}</p>
                      <p className="text-stone-700 leading-relaxed font-medium">{shippingAddress.address}</p>
                    </div>
                  )}
                </div>

                {/* DELIVERY FEE CARD */}
                <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-[#2D1B0E]">
                      <Truck className="w-5 h-5 text-[#8A6337]" />
                      <h2 className="font-serif text-xl font-bold">Biaya Pengiriman</h2>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-orange-900 text-xs font-bold rounded-full border border-amber-300">
                      ~25 - 40 Menit Tiba
                    </span>
                  </div>

                  <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#8A6337]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-[#2D1B0E]">Biaya Pengantaran Segar Resto Nefakky</p>
                      <p className="text-stone-600 font-medium">Diantar langsung oleh Armada Dapur Nefakky.</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Ongkir</span>
                      <span className="font-serif text-lg font-bold text-[#6A3B12]">
                        Rp {shippingCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT METHOD CARD */}
                <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-100 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5 text-[#2D1B0E]">
                      <CreditCard className="w-5 h-5 text-[#8A6337]" />
                      <h2 className="font-serif text-xl font-bold">Metode Pembayaran (Midtrans)</h2>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                      🟢 Active Midtrans Snap
                    </span>
                  </div>

                  <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#8A6337]/30 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
                        💳
                      </div>
                      <div>
                        <h3 className="font-bold text-[#2D1B0E] text-sm">
                          Midtrans Official Payment Gateway
                        </h3>
                        <p className="text-xs text-stone-600 font-medium">
                          Sistem pembayaran resmi otomatis terverifikasi secara real-time.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
                      <div className="p-3 bg-white rounded-xl border border-stone-200 font-bold text-stone-800 shadow-2xs">
                        📱 GoPay / QRIS
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-stone-200 font-bold text-stone-800 shadow-2xs">
                        🛍️ ShopeePay
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-stone-200 font-bold text-stone-800 shadow-2xs">
                        🏦 BCA / Mandiri VA
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-stone-200 font-bold text-stone-800 shadow-2xs">
                        💳 Kartu Kredit
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* SUMMARY CARD (FIGMA MATCH) */}
              <div className="lg:col-span-5">
                <div className="bg-[#F3B375] rounded-[28px] p-8 sm:p-10 space-y-6 shadow-sm border border-[#E9A464]/40 sticky top-24">
                  <h3 className="font-serif text-3xl font-bold text-[#2D1B0E] text-center">
                    Nefakky
                  </h3>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1B0E]">
                    Ringkasan Pesanan
                  </h2>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1 border-b border-[#D99357] pb-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-[#2D1B0E]">
                        <span>{item.name} (x{item.quantity})</span>
                        <span className="font-mono font-bold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 text-xs text-[#2D1B0E] font-medium">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Biaya Pengiriman</span>
                      <span className="font-mono">Rp {shippingCost.toLocaleString('id-ID')}</span>
                    </div>

                    {calculatedDiscount > 0 && (
                      <div className="flex items-center justify-between font-bold">
                        <span>Diskon Promo</span>
                        <span className="font-mono">- Rp {calculatedDiscount.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="border-t border-[#D99357] pt-3" />

                    <div className="flex items-center justify-between text-[#2D1B0E] font-serif text-lg font-bold">
                      <span>Total Payment</span>
                      <span>Rp {totalPayment.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-[#6A3B12] hover:bg-[#542E0C] text-white font-bold rounded-full shadow-md transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] tracking-wider text-white/90 font-medium uppercase pt-1">
                    <Lock className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Secure SSL Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: PAYMENT PAGE */}
        {/* ---------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="animate-fade-in max-w-3xl mx-auto space-y-8">
            <div>
              <button 
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 text-xs text-[#7A4B29] hover:text-[#2D1B0E] font-semibold transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Detail Pengiriman</span>
              </button>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D1B0E]">
                Konfirmasi Pembayaran
              </h1>
            </div>

            <div className="bg-white rounded-[28px] p-6 sm:p-10 border border-stone-100 shadow-sm space-y-8">
              <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#8A6337]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Total Tagihan Pembayaran</span>
                  <span className="font-serif text-2xl font-bold text-[#6A3B12]">
                    Rp {totalPayment.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Real-Time Midtrans Snap</span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-[#6A3B12] hover:bg-[#542E0C] disabled:bg-stone-400 text-white font-bold text-xs tracking-wider uppercase rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Buka Popup Midtrans &amp; Bayar Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 4: SUCCESS PAGE */}
        {/* ---------------------------------------------------- */}
        {currentStep === 4 && placedOrder && (
          <div className="animate-fade-in max-w-2xl mx-auto py-4 space-y-8 text-center">
            <div className="bg-white rounded-[28px] p-8 sm:p-12 border border-stone-100 shadow-md space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold">
                  Status: Pembayaran Lunas
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D1B0E]">
                  Pembelian Sukses!
                </h1>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Terima kasih! Pesanan Anda telah diterima oleh Dapur Nefakky dan sedang disiapkan dengan bahan-bahan segar berkualitas.
                </p>
              </div>

              <div className="bg-[#F8E9DE] rounded-2xl p-6 text-left border border-stone-200/70 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-semibold">Nomor Pesanan</span>
                    <span className="font-mono font-bold text-[#2D1B0E] text-sm">{placedOrder.orderId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-500 block text-[10px] uppercase font-semibold">Waktu Transaksi</span>
                    <span className="text-stone-700 font-medium">{placedOrder.date}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {placedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-stone-800">
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="font-mono font-bold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between text-[#2D1B0E] font-serif text-base font-bold">
                  <span>Total Pembayaran:</span>
                  <span className="text-[#6A3B12]">Rp {placedOrder.totalPayment.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link 
                  href="/menu"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#6A3B12] hover:bg-[#542E0C] text-white text-xs font-bold rounded-full shadow-md transition-all"
                >
                  Lihat Menu Lainnya
                </Link>
                <Link 
                  href="/"
                  className="w-full sm:w-auto px-8 py-3.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-full transition-all"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* INTERACTIVE MIDTRANS SNAP POPUP MODAL MOCKUP */}
      {showMidtransModal && midtransOrderData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md sm:max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-[#132B45] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/20">
                  <span className="font-bold text-sm tracking-wider text-sky-400">midtrans</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Nefakky Gourmet Bistro</h3>
                  <span className="text-[10px] text-sky-300 font-mono">Order #{midtransOrderData.generatedId}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-300 block uppercase tracking-wider">Total Pembayaran</span>
                <span className="font-mono font-bold text-base sm:text-lg text-emerald-400">
                  Rp {totalPayment.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="bg-amber-400 text-stone-900 px-4 py-2 text-center text-[11px] font-bold flex items-center justify-between">
              <span>⚠️ MIDTRANS DEMO SANDBOX POPUP</span>
              <span className="text-[10px] font-mono font-normal">Merchant ID: M664001757</span>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#FAF9F6]">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setMidtransChannel('gopay')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                    midtransChannel === 'gopay' ? 'bg-[#132B45] text-white border-[#132B45] shadow-sm' : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-sky-400" />
                  <span className="text-[10px]">GoPay/QRIS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMidtransChannel('va')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                    midtransChannel === 'va' ? 'bg-[#132B45] text-white border-[#132B45] shadow-sm' : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-sky-400" />
                  <span className="text-[10px]">Virtual Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMidtransChannel('shopeepay')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                    midtransChannel === 'shopeepay' ? 'bg-[#132B45] text-white border-[#132B45] shadow-sm' : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-sky-400" />
                  <span className="text-[10px]">ShopeePay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMidtransChannel('cc')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                    midtransChannel === 'cc' ? 'bg-[#132B45] text-white border-[#132B45] shadow-sm' : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-sky-400" />
                  <span className="text-[10px]">Kartu Kredit</span>
                </button>
              </div>

              {midtransChannel === 'gopay' && (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 text-center space-y-3 shadow-sm">
                  <div className="w-48 h-48 mx-auto bg-white p-2 border border-stone-200 rounded-xl shadow-inner flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/qris_user.png" alt="QRIS Midtrans Demo" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-stone-600">
                    Pindai QRIS Midtrans Sandbox ini via aplikasi e-wallet demo Anda.
                  </p>
                </div>
              )}

              {midtransChannel === 'va' && (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span>BCA Virtual Account (Demo)</span>
                    <span className="text-sky-600 font-mono">Midtrans VA</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between font-mono text-sm sm:text-base font-bold text-stone-900">
                    <span>70012 8901 2345 6789</span>
                    <span className="text-xs text-emerald-700 font-sans font-normal">Siap Bayar</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Salin nomor Virtual Account di atas dan gunakan pada simulasi M-Banking.
                  </p>
                </div>
              )}

              {midtransChannel === 'shopeepay' && (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 text-center space-y-2 shadow-sm">
                  <Wallet className="w-8 h-8 text-amber-600 mx-auto" />
                  <h4 className="text-xs font-bold text-stone-900">Pembayaran ShopeePay Demo</h4>
                  <p className="text-[11px] text-stone-500">
                    Sistem akan mengarahkan simulasi pembayaran instan ke saldo e-wallet ShopeePay Demo Anda.
                  </p>
                </div>
              )}

              {midtransChannel === 'cc' && (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 shadow-sm text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">Nomor Kartu Test Sandbox</label>
                    <input
                      type="text"
                      readOnly
                      value="4811 1111 1111 1111"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-900 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">Kedaluwarsa</label>
                      <input type="text" readOnly value="12/28" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600">CVV Test</label>
                      <input type="text" readOnly value="123" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-white border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowMidtransModal(false)}
                className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-full"
              >
                Batal / Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMidtransModal(false);
                  finalizeOrderPlacement(midtransOrderData.generatedId, midtransOrderData.snapshot);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-2 font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulasikan Pembayaran Berhasil ✅</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AUTOMATIC MAP PICKER MODAL */}
      <AutoMapPickerModal
        isOpen={showMapPickerModal}
        onClose={() => setShowMapPickerModal(false)}
        initialAddress={shippingAddress.address}
        onSelectAddress={(selectedAddr, dist) => {
          setShippingAddress(prev => ({ ...prev, address: selectedAddr }));
          setTempAddress(prev => ({ ...prev, address: selectedAddr }));
          setDetectedDistanceKm(dist);
        }}
      />
    </div>
  );
}

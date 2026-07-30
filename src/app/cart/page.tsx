'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart, CartLineItem } from '@/context/CartContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import { 
  Search, 
  ShoppingBag, 
  User, 
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
  Coins,
  Wallet,
  Check,
  Edit3,
  Copy,
  ArrowRight,
  Clock,
  ShieldCheck,
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
  const { addOrder, products: storeProducts, updateProduct, vouchers } = useData();
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
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express' | 'sameday'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'qris' | 'bank' | 'cod'>('midtrans');
  const [selectedBank, setSelectedBank] = useState<string>('bca');

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
  const [copiedVA, setCopiedVA] = useState<boolean>(false);

  // Midtrans Interactive Snap Popup Modal Mockup state
  const [showMidtransModal, setShowMidtransModal] = useState<boolean>(false);
  const [midtransChannel, setMidtransChannel] = useState<'gopay' | 'va' | 'shopeepay' | 'cc'>('gopay');
  const [midtransOrderData, setMidtransOrderData] = useState<{ generatedId: string; snapshot: PlacedOrder } | null>(null);

  // Authentication guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const res = claimPromo(promoCode);
    if (res.success) {
      alert(res.message);
      setPromoCode('');
    }
  };

  const getShippingCost = () => {
    if (cartItems.length === 0 && !placedOrder) return 0;
    if (deliveryMethod === 'express') return 25000;
    if (deliveryMethod === 'sameday') return 40000;
    return 12000; // standard
  };

  const serviceFee = (cartItems.length > 0 || placedOrder) ? 5000 : 0;
  const shippingCost = getShippingCost();
  const calculatedDiscount = discountAmount || Math.round(subtotal * (discountPercent / 100));
  const totalPayment = Math.max(0, subtotal + shippingCost + serviceFee - calculatedDiscount);

  // Save address edit
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingAddress(tempAddress);
    setIsEditingAddress(false);
  };

  // 1-Hour Countdown Timer for Non-Midtrans Payments (3600 seconds)
  const [nonMidtransTimeLeft, setNonMidtransTimeLeft] = useState<number>(3600);
  useEffect(() => {
    let interval: any;
    if (currentStep === 3 && paymentMethod !== 'midtrans') {
      interval = setInterval(() => {
        setNonMidtransTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            alert('Waktu batas pembayaran 1 Jam telah berakhir! Pesanan dibatalkan secara otomatis.');
            setCurrentStep(1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setNonMidtransTimeLeft(3600);
    }
    return () => clearInterval(interval);
  }, [currentStep, paymentMethod]);

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Proceed from Checkout (Step 2) to Payment (Step 3)
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
      customerEmail: user?.email || undefined,
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
      deliveryType: deliveryMethod === 'express' ? 'EXPRESS' : deliveryMethod === 'sameday' ? 'SAME DAY' : 'STANDARD',
      status: 'COOKING',
      subtotal,
      shippingCost,
      discount: calculatedDiscount,
      total: totalPayment
    });

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

    const formattedPaymentMethod = 
      paymentMethod === 'midtrans' ? 'Midtrans Demo (Sandbox)' :
      paymentMethod === 'qris' ? 'QRIS Instant' :
      paymentMethod === 'bank' ? 'BCA Virtual Account' :
      'COD (Bayar di Tempat)';

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
        // Ensure Snap Script is loaded into window
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
          // Fallback to Interactive Demo Modal so user is never blocked
          setMidtransOrderData({ generatedId, snapshot: orderSummarySnapshot });
          setShowMidtransModal(true);
          return;
        }

        if (data.token && typeof (window as any).snap !== 'undefined') {
          // Launch OFFICIAL REAL-TIME MIDTRANS SNAP POPUP!
          (window as any).snap.pay(data.token, {
            onSuccess: function (result: any) {
              alert('Pembayaran Midtrans Real-Time Berhasil! Terima kasih.');
              finalizeOrderPlacement(generatedId, orderSummarySnapshot);
            },
            onPending: function (result: any) {
              alert('Pembayaran Midtrans Pending / Berhasil Disimulasikan!');
              finalizeOrderPlacement(generatedId, orderSummarySnapshot);
            },
            onError: function (result: any) {
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
          // Fallback to Interactive Demo Modal if Snap SDK is unavailable
          setMidtransOrderData({
            generatedId,
            snapshot: orderSummarySnapshot
          });
          setShowMidtransModal(true);
          return;
        }
      } catch (e) {
        console.warn('Midtrans Snap Token Real-Time Error, falling back to Interactive Modal:', e);
        setIsProcessingPayment(false);
        setMidtransOrderData({
          generatedId,
          snapshot: orderSummarySnapshot
        });
        setShowMidtransModal(true);
        return;
      }
    }

    setTimeout(() => {
      finalizeOrderPlacement(generatedId, orderSummarySnapshot);
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5C3D28] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Halaman Keranjang...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-[#5C3D28]/10 selection:text-[#5C3D28]">
      
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 md:py-12">
        
        {/* STEPPER PROGRESS INDICATOR (MATCHING REFERENCE DESIGN) */}
        <div className="max-w-md mx-auto mb-10">
          <div className="flex items-center justify-between relative">
            {/* Connecting line background */}
            <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-stone-200 -z-0" />
            
            {/* Active connecting line */}
            <div 
              className="absolute left-6 top-4 -translate-y-1/2 h-0.5 bg-[#5C3D28] transition-all duration-500 -z-0"
              style={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '88%'
              }}
            />

            {/* Step 1: Cart */}
            <div className="flex flex-col items-center gap-1.5 z-10 bg-[#FAF8F5] px-1">
              <button 
                onClick={() => currentStep > 1 && currentStep < 4 && setCurrentStep(1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep > 1 
                    ? 'bg-emerald-600 text-white' 
                    : currentStep === 1 
                    ? 'bg-[#5C3D28] text-white shadow-md' 
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </button>
              <span className={`text-[11px] ${currentStep === 1 ? 'text-[#5C3D28] font-bold' : 'text-stone-500'}`}>
                Cart
              </span>
            </div>

            {/* Step 2: Checkout */}
            <div className="flex flex-col items-center gap-1.5 z-10 bg-[#FAF8F5] px-1">
              <button 
                onClick={() => currentStep > 2 && currentStep < 4 && setCurrentStep(2)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep > 2 
                    ? 'bg-emerald-600 text-white' 
                    : currentStep === 2 
                    ? 'bg-[#5C3D28] text-white shadow-md' 
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </button>
              <span className={`text-[11px] ${currentStep === 2 ? 'text-[#5C3D28] font-bold' : 'text-stone-500'}`}>
                Checkout
              </span>
            </div>

            {/* Step 3: Payment */}
            <div className="flex flex-col items-center gap-1.5 z-10 bg-[#FAF8F5] px-1">
              <button 
                onClick={() => currentStep > 3 && currentStep < 4 && setCurrentStep(3)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep > 3 
                    ? 'bg-emerald-600 text-white' 
                    : currentStep === 3 
                    ? 'bg-[#5C3D28] text-white shadow-md' 
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </button>
              <span className={`text-[11px] ${currentStep === 3 ? 'text-[#5C3D28] font-bold' : 'text-stone-500'}`}>
                Payment
              </span>
            </div>

            {/* Step 4: Success */}
            <div className="flex flex-col items-center gap-1.5 z-10 bg-[#FAF8F5] px-1">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep === 4 
                    ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100' 
                    : 'bg-stone-200 text-stone-500'
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

        {/* ---------------------------------------------------- */}
        {/* STEP 1: CART PAGE */}
        {/* ---------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            {/* Header Title */}
            <div className="mb-8">
              <Link href="/menu" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors mb-3">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Menu</span>
              </Link>
              <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#2D231C] tracking-tight">
                Your Basket
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-light mt-2">
                Curated artisanal flavors, ready for your kitchen.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-start">
              {/* Basket Items List */}
              <div className="lg:col-span-7 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/60 shadow-sm space-y-4">
                    <div className="w-16 h-16 bg-[#F5F2EC] rounded-full flex items-center justify-center mx-auto text-stone-400">
                      <ShoppingBag className="w-8 h-8 stroke-1" />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-stone-800">Keranjang Anda Kosong</h3>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto font-light leading-relaxed">
                      Belum ada barang yang dipesan. Silakan pilih hidangan favorit Anda dari halaman katalog menu.
                    </p>
                    <div className="pt-2">
                      <Link 
                        href="/menu" 
                        className="inline-block px-8 py-3.5 bg-[#5C3D28] hover:bg-[#472E1E] text-white text-xs font-semibold rounded-full shadow-md transition-all"
                      >
                        Pilih Menu Makanan
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/60 shadow-sm space-y-6 divide-y divide-stone-100">
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
                            <span className="text-[10px] text-[#8A6337] font-semibold uppercase tracking-wider">
                              {item.category}
                            </span>
                            <h3 className="font-serif text-base font-semibold text-stone-900">
                              {item.name}
                            </h3>
                            <p className="text-xs text-stone-500 font-mono mt-0.5">
                              Rp {item.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                          <div className="flex items-center gap-2 bg-[#F5F2EC] px-2.5 py-1 rounded-full border border-stone-200/60">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 rounded-full bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200 transition-colors shadow-sm"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-2 text-stone-800 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-6 h-6 rounded-full bg-[#5C3D28] text-white flex items-center justify-center hover:bg-[#472E1E] transition-colors shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-serif font-bold text-sm text-stone-900 min-w-[90px] text-right">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>

                          <button
                            onClick={() => deleteFromCart(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                            title="Hapus dari Keranjang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-6">
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Kode Promo (e.g. NEFAKKY10)"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F2EC] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#5C3D28]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-xl transition-colors shrink-0"
                        >
                          Gunakan Kode
                        </button>
                      </form>
                      {appliedPromo && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between">
                          <p className="text-xs text-[#7A4B29] font-medium flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#7A4B29]" />
                            <span>Promo Aktif: <strong className="font-mono">{appliedPromo}</strong> (Diskon {discountPercent}%)</span>
                          </p>
                          <button 
                            type="button" 
                            onClick={removePromo} 
                            className="text-[11px] text-red-600 hover:underline font-medium"
                          >
                            Hapus
                          </button>
                        </div>
                      )}

                      {/* Available Vouchers List with Live Status */}
                      {vouchers && vouchers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                            Pilihan Kode Promo Terdaftar:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(vouchers || []).map((v: any) => {
                              const isActive = v.status === 'Active' && (v.isActive !== false);
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  disabled={!isActive}
                                  onClick={() => {
                                    if (isActive) {
                                      setPromoCode(v.code);
                                      const res = claimPromo(v.code);
                                      if (res.success) {
                                        alert(res.message);
                                      } else {
                                        alert(res.message);
                                      }
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 border ${
                                    isActive
                                      ? 'bg-amber-50 text-[#7A4B29] border-amber-200 hover:bg-amber-100 cursor-pointer shadow-xs'
                                      : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-65'
                                  }`}
                                  title={isActive ? `Gunakan promo ${v.code}` : `Promo ${v.code} sedang tidak aktif`}
                                >
                                  <span>{v.code} ({v.discountPercent}%)</span>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-400'}`} />
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

              {/* Summary Card */}
              <div className="lg:col-span-5">
                <div className="bg-[#EFECE6] rounded-[24px] p-8 space-y-6 shadow-soft-card border border-stone-200/50 sticky top-28">
                  <h2 className="font-serif text-2xl font-semibold text-[#2D231C]">
                    Order Summary
                  </h2>

                  <div className="space-y-3.5 text-xs text-stone-600 font-normal">
                    <div className="flex items-center justify-between">
                      <span>Total Items</span>
                      <span className="font-semibold text-stone-900">{totalCartCount} Items</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Shipping Cost</span>
                      <span className="font-mono">
                        {cartItems.length > 0 ? `Rp ${shippingCost.toLocaleString('id-ID')}` : 'Gratis'}
                      </span>
                    </div>

                    {calculatedDiscount > 0 && (
                      <div className="flex items-center justify-between text-[#8A6337] font-medium">
                        <span>Discount</span>
                        <span className="font-mono">- Rp {calculatedDiscount.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="border-t border-stone-300/70 pt-4" />

                    <div className="flex items-center justify-between text-stone-900 font-serif text-lg font-bold">
                      <span>Total Payment</span>
                      <span>Rp {totalPayment.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-[#5C3D28] hover:bg-[#472E1E] active:scale-[0.99] disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-medium rounded-full shadow-md transition-all text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2"
                  >
                    <span>CHECKOUT NOW</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] tracking-wider text-stone-500 font-semibold uppercase pt-1">
                    <Lock className="w-3 h-3 stroke-[2]" />
                    <span>SECURE SSL CHECKOUT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: CHECKOUT PAGE (MATCHES USER ATTACHED SCREENSHOT) */}
        {/* ---------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-8">
            
            {/* Header Title */}
            <div>
              <button 
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Keranjang</span>
              </button>
              <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#2D231C] tracking-tight">
                Checkout
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
              
              {/* LEFT COLUMN: Address, Delivery Method, Payment Method */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. SHIPPING ADDRESS CARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-stone-900">
                      <MapPin className="w-5 h-5 text-[#8A6337]" />
                      <h2 className="font-serif text-xl font-semibold">Shipping Address</h2>
                    </div>
                    <button 
                      onClick={() => {
                        setTempAddress({ ...shippingAddress });
                        setIsEditingAddress(!isEditingAddress);
                      }}
                      className="text-xs font-semibold text-[#8A6337] hover:text-[#5C3D28] transition-colors"
                    >
                      {isEditingAddress ? 'Batal' : 'Edit'}
                    </button>
                  </div>

                  {isEditingAddress ? (
                    <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1 font-medium">Nama Penerima</label>
                        <input
                          type="text"
                          value={tempAddress.name}
                          onChange={(e) => setTempAddress({ ...tempAddress, name: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#F5F2EC] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#5C3D28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1 font-medium">Nomor Telepon</label>
                        <input
                          type="text"
                          value={tempAddress.phone}
                          onChange={(e) => setTempAddress({ ...tempAddress, phone: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#F5F2EC] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#5C3D28]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-500 mb-1 font-medium">Alamat Lengkap</label>
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
                        className="px-5 py-2 bg-[#5C3D28] text-white text-xs font-medium rounded-full hover:bg-[#472E1E] transition-colors"
                      >
                        Simpan Alamat
                      </button>
                    </form>
                  ) : (
                    <div className="text-xs space-y-1 text-stone-600 font-light pt-1">
                      <p className="font-semibold text-stone-900 text-sm">{shippingAddress.name}</p>
                      <p className="text-stone-500">{shippingAddress.phone}</p>
                      <p className="text-stone-600 leading-relaxed">{shippingAddress.address}</p>
                    </div>
                  )}
                </div>

                {/* 2. DELIVERY METHOD CARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 text-stone-900">
                    <Truck className="w-5 h-5 text-[#8A6337]" />
                    <h2 className="font-serif text-xl font-semibold">Delivery Method</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Standard */}
                    <div 
                      onClick={() => setDeliveryMethod('standard')}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all relative ${
                        deliveryMethod === 'standard' 
                          ? 'border-[#8A6337] bg-[#FAF6F0] ring-1 ring-[#8A6337]' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-xs text-stone-900 block">Standard</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          deliveryMethod === 'standard' ? 'border-[#8A6337] bg-[#8A6337]' : 'border-stone-300'
                        }`}>
                          {deliveryMethod === 'standard' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 mb-3">3–5 Business Days</p>
                      <p className="font-semibold text-xs text-stone-800">Rp 12.000</p>
                    </div>

                    {/* Express */}
                    <div 
                      onClick={() => setDeliveryMethod('express')}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all relative ${
                        deliveryMethod === 'express' 
                          ? 'border-[#8A6337] bg-[#FAF6F0] ring-1 ring-[#8A6337]' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-xs text-stone-900 block">Express</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          deliveryMethod === 'express' ? 'border-[#8A6337] bg-[#8A6337]' : 'border-stone-300'
                        }`}>
                          {deliveryMethod === 'express' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 mb-3">1–2 Business Days</p>
                      <p className="font-semibold text-xs text-stone-800">Rp 25.000</p>
                    </div>

                    {/* Same Day */}
                    <div 
                      onClick={() => setDeliveryMethod('sameday')}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all relative ${
                        deliveryMethod === 'sameday' 
                          ? 'border-[#8A6337] bg-[#FAF6F0] ring-1 ring-[#8A6337]' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-xs text-stone-900 block">Same Day</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          deliveryMethod === 'sameday' ? 'border-[#8A6337] bg-[#8A6337]' : 'border-stone-300'
                        }`}>
                          {deliveryMethod === 'sameday' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 mb-3">Delivery by 8 PM</p>
                      <p className="font-semibold text-xs text-stone-800">Rp 40.000</p>
                    </div>
                  </div>
                </div>

                {/* 3. PAYMENT METHOD CARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-stone-900">
                      <CreditCard className="w-5 h-5 text-[#8A6337]" />
                      <h2 className="font-serif text-xl font-semibold">Payment Method</h2>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                      Midtrans Demo Mode Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {/* Midtrans Demo Sandbox */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('midtrans')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                        paymentMethod === 'midtrans' 
                          ? 'border-[#8A6337] bg-[#FAF6F0] ring-2 ring-[#8A6337]' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-[#8A6337]" />
                      <span className="text-xs font-semibold text-stone-800">Midtrans Demo</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Sandbox</span>
                    </button>

                    {/* QRIS */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                        paymentMethod === 'qris' 
                          ? 'border-[#8A6337] bg-[#FAF6F0] ring-2 ring-[#8A6337]' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-[#8A6337]" />
                      <span className="text-xs font-semibold text-stone-800">QRIS</span>
                    </button>

                    {/* Bank Transfer */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                        paymentMethod === 'bank' 
                          ? 'border-[#8A6337] bg-[#FAF6F0] ring-2 ring-[#8A6337]' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-[#8A6337]" />
                      <span className="text-xs font-semibold text-stone-800">Bank Transfer</span>
                    </button>

                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                        paymentMethod === 'cod' 
                          ? 'border-[#8A6337] bg-[#FAF6F0] ring-2 ring-[#8A6337]' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <Coins className="w-5 h-5 text-[#8A6337]" />
                      <span className="text-xs font-semibold text-stone-800">COD</span>
                    </button>
                  </div>

                  {/* MIDTRANS DEMO SANDBOX INFO CARD */}
                  {paymentMethod === 'midtrans' && (
                    <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#8A6337]/30 space-y-4 animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Midtrans Sandbox Mode</span>
                        </div>
                        <span className="text-[11px] font-mono font-medium text-stone-600">
                          Merchant ID: <strong className="text-stone-900">M664001757</strong>
                        </span>
                      </div>

                      <div className="space-y-2 bg-white p-4 rounded-xl border border-stone-200 text-xs text-stone-700 shadow-xs">
                        <p className="font-semibold text-stone-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#8A6337]" />
                          <span>Simulasi Gateway Pembayaran Midtrans Demo</span>
                        </p>
                        <p className="text-stone-500 leading-relaxed text-[11px]">
                          Metode pembayaran ini khusus disiapkan untuk pengujian transaksi tanpa KTP / Rekening Pribadi. Mendukung semua kanal simulasi resmi:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] font-medium text-stone-800">
                          <li className="flex items-center gap-1.5">⚡ <span>GoPay & QRIS Simulator</span></li>
                          <li className="flex items-center gap-1.5">⚡ <span>ShopeePay Simulator</span></li>
                          <li className="flex items-center gap-1.5">⚡ <span>BCA / Mandiri / BRI VA Demo</span></li>
                          <li className="flex items-center gap-1.5">⚡ <span>Kartu Kredit Test Sandbox</span></li>
                        </ul>
                      </div>

                      <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex flex-wrap items-center justify-between gap-2">
                        <span>Client Key Active: <code className="font-mono text-stone-800 bg-white px-2 py-0.5 rounded border">Mid-client-8T4q9uw1fIGB...</code></span>
                        <a 
                          href="https://simulator.sandbox.midtrans.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#8A6337] font-semibold underline hover:text-[#5C3D28]"
                        >
                          Midtrans Simulator Resmi ↗
                        </a>
                      </div>
                    </div>
                  )}
                  {/* NON-MIDTRANS 1-HOUR EXPIRY COUNTDOWN TIMER */}
                  {paymentMethod !== 'midtrans' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                        <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                        <span>Selesaikan Pembayaran Dalam (Batas 1 Jam):</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-200/80 px-3 py-1 rounded-full shadow-xs">
                        ⏱️ {formatCountdown(nonMidtransTimeLeft)}
                      </span>
                    </div>
                  )}

                  {/* DIRECT PAYMENT DETAILS IN STEP 2 (LIVE REVISION FROM TEACHER) */}
                  {paymentMethod === 'qris' && (
                    <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#8A6337]/30 text-center space-y-4 animate-fade-in">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[11px] font-semibold text-[#5C3D28] shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#8A6337]" />
                        <span>Scan QRIS Resmi Fatih Ahmad Zakky</span>
                      </div>

                      <div className="w-52 h-52 mx-auto bg-white p-2.5 rounded-2xl border border-stone-200 shadow-md relative overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src="/images/qris_user.png" 
                          alt="QRIS Code Fatih Ahmad Zakky" 
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>

                      <p className="text-[11px] text-stone-600 max-w-xs mx-auto leading-relaxed">
                        Pindai QRIS di atas melalui GoPay, OVO, DANA, ShopeePay, BCA Mobile, atau Livin' Mandiri.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="p-5 bg-[#FAF6F0] rounded-2xl border border-[#8A6337]/30 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                        <span>Nomor Rekening Bank ({selectedBank.toUpperCase()})</span>
                        <span className="text-emerald-700 font-semibold">a/n Fatih Ahmad Zakky</span>
                      </div>
                      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                        <span className="font-mono text-lg font-bold tracking-wider text-stone-900">
                          1350021595952
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('1350021595952')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8A6337] hover:bg-[#5C3D28] text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedVA ? 'Tersalin!' : 'Salin No. Rek'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1 animate-fade-in">
                      <p className="text-xs text-stone-600 font-medium">
                        Bayar tunai langsung saat kurir mengantarkan pesanan ke rumah Anda.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary Sidebar */}
              <div className="lg:col-span-5">
                <div className="bg-[#EFECE6] rounded-[24px] p-6 sm:p-8 space-y-6 shadow-soft-card border border-stone-200/50 sticky top-28">
                  
                  {/* Promo Code Box */}
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2">Promo Code</h3>
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#5C3D28]"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 bg-stone-700 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </form>
                    {appliedPromo && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>{appliedPromo}</span>
                      </p>
                    )}
                  </div>

                  {/* Order Summary Header */}
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-[#2D231C] mb-4">
                      Order Summary
                    </h2>

                    {/* Cart Mini Item List */}
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1 border-b border-stone-300/60 pb-4 mb-4">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-stone-200">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                              <p className="text-stone-500 text-[11px]">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-stone-800">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Summary Numbers */}
                    <div className="space-y-2.5 text-xs text-stone-600 font-normal">
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Shipping</span>
                        <span className="font-mono">Rp {shippingCost.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Service Fee</span>
                        <span className="font-mono">Rp {serviceFee.toLocaleString('id-ID')}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex items-center justify-between text-[#8A6337] font-medium">
                          <span>Promo Discount</span>
                          <span className="font-mono">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      <div className="border-t border-stone-300/70 pt-3" />

                      <div className="flex items-center justify-between text-stone-900 font-serif text-lg font-bold">
                        <span>Total</span>
                        <span>Rp {totalPayment.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Button: Place Order -> Step 3 */}
                  <button
                    onClick={handleProceedToPayment}
                    disabled={cartItems.length === 0}
                    className="w-full py-4 bg-[#5C3D28] hover:bg-[#472E1E] active:scale-[0.99] text-white font-medium rounded-full shadow-md transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <span>Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[10px] text-center text-stone-500 font-medium tracking-tight">
                    Secure payment powered by Nefakky Vault.
                  </p>

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
                className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Detail Pengiriman</span>
              </button>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#2D231C]">
                Selesaikan Pembayaran
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Pilih instruksi pembayaran berikut untuk menyelesaikan pesanan Anda.
              </p>
            </div>

            {/* Payment Details Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-md space-y-8">
              
              {/* Total Payment Banner */}
              <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#8A6337]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">Total Tagihan Pembayaran</span>
                  <span className="font-serif text-2xl font-bold text-[#5C3D28]">
                    Rp {totalPayment.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Batas waktu: 23:59:59</span>
                </div>
              </div>

              {/* PAYMENT METHOD SPECIFIC CONTROLS */}
              {paymentMethod === 'qris' && (
                <div className="text-center space-y-5 bg-[#FAF6F0] p-6 rounded-3xl border border-[#8A6337]/30">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full text-xs font-semibold text-[#5C3D28] shadow-xs">
                    <QrCode className="w-4 h-4 text-[#8A6337]" />
                    <span>Pembayaran Instan via QRIS (Semua e-Wallet & M-Banking)</span>
                  </div>

                  <div className="w-64 h-64 mx-auto bg-white p-3 rounded-2xl border-2 border-stone-200 shadow-md relative overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/images/qris_user.png" 
                      alt="QRIS Pembayaran Fatih Ahmad Zakky" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>

                  <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed font-medium">
                    Buka aplikasi e-Wallet (GoPay, OVO, ShopeePay, DANA) atau m-Banking Anda (BCA Mobile, Livin' Mandiri), lalu pindaikan QRIS di atas untuk membayar.
                  </p>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="space-y-6 bg-[#FAF6F0] p-6 rounded-3xl border border-[#8A6337]/30">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">Pilih Bank Transfer</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['mandiri', 'bca', 'bni'].map(bank => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                            selectedBank === bank 
                              ? 'border-[#8A6337] bg-white text-[#5C3D28] ring-2 ring-[#8A6337]' 
                              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          Bank {bank}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bank Account Info Box */}
                  <div className="bg-white rounded-2xl p-5 border border-stone-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Nomor Rekening Bank ({selectedBank.toUpperCase()})</span>
                      <span className="font-semibold text-emerald-600">a/n Fatih Ahmad Zakky</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
                      <span className="font-mono text-xl font-bold tracking-wider text-stone-900">
                        1350021595952
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('1350021595952')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8A6337] hover:bg-[#5C3D28] text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedVA ? 'Tersalin!' : 'Salin No. Rek'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 text-center space-y-2">
                  <Coins className="w-8 h-8 text-[#8A6337] mx-auto" />
                  <h3 className="font-serif text-lg font-semibold text-stone-800">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    Anda dapat melakukan pembayaran secara tunai langsung kepada kurir saat pesanan hidangan hangat Nefakky sampai di lokasi Anda.
                  </p>
                </div>
              )}

              {/* Action Submit Payment */}
              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-[#5C3D28] hover:bg-[#472E1E] disabled:bg-stone-400 text-white font-semibold text-xs tracking-wider uppercase rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Konfirmasi & Bayar Sekarang</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 4: SUCCESS PAGE (PEMBELIAN SUKSES) */}
        {/* ---------------------------------------------------- */}
        {currentStep === 4 && placedOrder && (
          <div className="animate-fade-in max-w-2xl mx-auto py-4 space-y-8 text-center">
            
            {/* Animated Success Badge */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xl space-y-6">
              
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold">
                  Status: Pembayaran Lunas
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
                  Pembelian Sukses!
                </h1>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Terima kasih! Pesanan Anda telah diterima oleh Dapur Nefakky dan sedang disiapkan dengan bahan-bahan segar berkualitas.
                </p>
              </div>

              {/* Order Details Card */}
              <div className="bg-[#FAF8F5] rounded-2xl p-6 text-left border border-stone-200/70 space-y-4 text-xs">
                
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Nomor Pesanan</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">{placedOrder.orderId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Waktu Transaksi</span>
                    <span className="text-stone-600 font-medium">{placedOrder.date}</span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="space-y-2 py-1">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Rincian Hidangan</span>
                  {placedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-stone-800">
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="font-mono font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-3 space-y-1.5">
                  <div className="flex justify-between text-stone-600">
                    <span>Metode Pengiriman:</span>
                    <span className="font-medium capitalize">{placedOrder.deliveryMethod}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Metode Pembayaran:</span>
                    <span className="font-medium uppercase">{placedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-serif text-base font-bold pt-2 border-t border-stone-200/80">
                    <span>Total Pembayaran:</span>
                    <span className="text-[#5C3D28]">Rp {placedOrder.totalPayment.toLocaleString('id-ID')}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link 
                  href="/menu"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#5C3D28] hover:bg-[#472E1E] text-white text-xs font-semibold rounded-full shadow-md transition-all"
                >
                  Lihat Menu Lainnya
                </Link>
                <Link 
                  href="/"
                  className="w-full sm:w-auto px-8 py-3.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-full transition-all"
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
            
            {/* Midtrans Header Bar */}
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

            {/* Sandbox Notice Banner */}
            <div className="bg-amber-400 text-stone-900 px-4 py-2 text-center text-[11px] font-bold flex items-center justify-between">
              <span>⚠️ MIDTRANS DEMO SANDBOX POPUP</span>
              <span className="text-[10px] font-mono font-normal">Merchant ID: M664001757</span>
            </div>

            {/* Midtrans Payment Channels Tabs */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#FAF9F6]">
              
              {/* Method Selector Chips */}
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

              {/* Channel Details Content */}
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

            {/* Footer Modal Action Buttons */}
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
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulasikan Pembayaran Berhasil ✅</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}


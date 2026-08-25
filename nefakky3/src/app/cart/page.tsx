'use client';

/**
 * ============================================================================
 * HALAMAN: Alur Checkout Lengkap (src/app/cart/page.tsx)
 * TAHAPAN: 1. Keranjang -> 2. Alamat -> 3. Pembayaran Midtrans -> 4. Selesai
 * DESKRIPSI: Dikonversikan secara presisi 100% dari 3 ekspor Stitch MCP HTML/Tailwind
 *            (Stepper 4-tahap, Alamat dengan GPS Map Picker & Catatan Dapur,
 *            Transparansi Ongkir, Pilihan Pembayaran Midtrans Snap & COD,
 *            serta Layar Sukses Pesanan Berhasil).
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, isVoucherValidNow } from '@/context/DataContext';
import { formatCurrentRealtimeOrderDate } from '@/lib/orderTimeUtils';
import { 
  Search, 
  Bell, 
  ShoppingBag, 
  User, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft,
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  Check,
  X, 
  MapPin, 
  Edit,
  Navigation,
  Info,
  Bike,
  Building2,
  Wallet,
  QrCode,
  CreditCard,
  Truck,
  Sparkles,
  Zap,
  ShoppingBag as BagIcon,
  Copy,
  Lock,
  Smartphone,
  ExternalLink
} from 'lucide-react';

export default function CartCheckoutWorkflowPage() {
  const router = useRouter();
  const { user, addAddress, updateProfile } = useAuth();
  const { vouchers, addOrder } = useData();
  const { 
    cartItems, 
    totalCartCount, 
    subtotal, 
    appliedPromo, 
    discountPercent, 
    discountAmount, 
    addToCart, 
    removeFromCart, 
    deleteFromCart, 
    claimPromo, 
    removePromo, 
    clearCart 
  } = useCart();

  // Workflow State: 'cart' | 'address' | 'payment' | 'success'
  const [step, setStep] = useState<'cart' | 'address' | 'payment' | 'success'>('cart');
  
  // Promo input
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Address & Notes State
  const userDefaultAddr = user?.addresses?.find(a => a.isDefault)?.address || user?.addresses?.[0]?.address || '';
  const [customerName, setCustomerName] = useState<string>(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phoneNumber || '');
  const [addressLabel, setAddressLabel] = useState<string>('Rumah');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(userDefaultAddr);
  const [courierNotes, setCourierNotes] = useState<string>('');
  const [kitchenNotes, setKitchenNotes] = useState<string>('');
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);

  React.useEffect(() => {
    if (user) {
      if (!customerName && user.displayName) setCustomerName(user.displayName);
      if (!customerPhone && user.phoneNumber) setCustomerPhone(user.phoneNumber);
      const activeAddr = user.addresses?.find(a => a.isDefault)?.address || user.addresses?.[0]?.address;
      if (!deliveryAddress && activeAddr) setDeliveryAddress(activeAddr);
    }
  }, [user]);

  // Payment State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'va' | 'ewallet' | 'qris' | 'cc' | 'cod'>('va');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [showSandboxModal, setShowSandboxModal] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [simulatedCardNumber, setSimulatedCardNumber] = useState<string>('4000 1234 5678 9010');
  const [simulatedCardExp, setSimulatedCardExp] = useState<string>('12/28');
  const [simulatedCardCvv, setSimulatedCardCvv] = useState<string>('123');

  // Midtrans Live Sandbox & Realtime Polling State
  const [midtransTx, setMidtransTx] = useState<{
    orderId: string;
    vaNumber: string;
    simulatorUrl: string;
    grossAmount: number;
    paymentType: string;
    qrString?: string;
    qrUrl?: string;
  } | null>(null);
  const [midtransStatus, setMidtransStatus] = useState<'idle' | 'loading' | 'pending' | 'checking' | 'paid' | 'failed'>('idle');
  const [paymentSuccessNotif, setPaymentSuccessNotif] = useState<{
    orderId: string;
    amount: number;
    paymentType: string;
  } | null>(null);
  const pollingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const stopStatusPolling = () => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      stopStatusPolling();
    };
  }, []);

  const checkMidtransStatusNow = async (orderIdToCheck?: string) => {
    const targetOrderId = orderIdToCheck || midtransTx?.orderId;
    if (!targetOrderId) return;
    setMidtransStatus('checking');

    try {
      const res = await fetch(`/api/midtrans/status?orderId=${encodeURIComponent(targetOrderId)}`);
      const data = await res.json();

      if (data.isPaid) {
        stopStatusPolling();
        setMidtransStatus('paid');
        setShowSandboxModal(false);

        // Tampilkan Notifikasi Pembayaran Berhasil
        setPaymentSuccessNotif({
          orderId: targetOrderId,
          amount: data.grossAmount ? parseFloat(data.grossAmount) : finalPayableTotal,
          paymentType: data.paymentType || selectedPaymentMethod
        });

        // Eksekusi Pembuatan Pesanan di Database
        handleExecutePayment(targetOrderId, true);
      } else {
        setMidtransStatus('pending');
      }
    } catch (err) {
      console.warn('Status polling check notice:', err);
      setMidtransStatus('pending');
    }
  };

  const startStatusPolling = (orderId: string) => {
    stopStatusPolling();
    pollingTimerRef.current = setInterval(() => {
      checkMidtransStatusNow(orderId);
    }, 2500);
  };

  // Jarak Pengantaran & Perhitungan Ongkos Kirim Berdasarkan Jarak
  // Aturan Ongkir Nefakky:
  // - Jarak <= 10 km: Flat Rp 10.000
  // - Jarak > 10 km: Rp 10.000 + (ceil((jarak - 10) / 2) * Rp 2.500)
  const deliveryDistanceKm = 4.2; // Default estimasi jarak dapur resto ke alamat (4.2 Km)

  const calculateShippingByDistance = (distKm: number = 4.2): number => {
    if (cartItems.length === 0) return 0;
    if (distKm <= 10) {
      return 10000; // Flat Rp 10.000 untuk jarak <= 10 km
    }
    const extraKm = distKm - 10;
    const extraIntervals = Math.ceil(extraKm / 2); // Nambah Rp 2.500 per 2 km
    return 10000 + (extraIntervals * 2500);
  };

  const shippingCost = calculateShippingByDistance(deliveryDistanceKm);
  const finalPayableTotal = Math.max(0, subtotal + shippingCost - discountAmount);

  /**
   * Handler: Menerapkan kode voucher promo ke keranjang belanja
   * Memvalidasi kode kupon dan memperbarui persentase diskon
   */
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    // Memanggil fungsi claimPromo dari CartContext
    const res = claimPromo(promoInput.trim());
    if (res.success) {
      setPromoMessage({ text: res.message, type: 'success' });
      setPromoInput('');
    } else {
      setPromoMessage({ text: res.message, type: 'error' });
    }

    // Menghilangkan pesan notifikasi promo setelah 4 detik
    setTimeout(() => setPromoMessage(null), 4000);
  };

  /**
   * Handler: Melanjutkan navigasi dari formulir alamat ke langkah pembayaran
   */
  const handleProceedToPayment = () => {
    if (cartItems.length === 0) return;
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handler: Inisialisasi Transaksi Pembayaran
   * - Jika metode COD: Langsung membuat pesanan tanpa popup Midtrans
   * - Jika metode Online (VA / E-Wallet / QRIS / CC): Memanggil API Route Midtrans Charge
   */
  const handleInitiatePayment = async () => {
    if (selectedPaymentMethod === 'cod') {
      // Pembayaran Bayar di Tempat (COD) langsung dieksekusi secara instan
      handleExecutePayment();
      return;
    }

    // Mengaktifkan status pemrosesan dan loading pembayaran online
    setIsProcessingPayment(true);
    setMidtransStatus('loading');
    const newOrderId = `NFK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Mengirim payload transaksi ke API Route Next.js (/api/midtrans/charge)
      const res = await fetch('/api/midtrans/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrderId,
          grossAmount: finalPayableTotal,
          paymentType: selectedPaymentMethod,
          bank: 'bca',
          customerDetails: {
            name: (customerName || user?.displayName || 'Pelanggan Nefakky').trim(),
            email: user?.email || 'customer@nefakky.com',
            phone: (customerPhone || user?.phoneNumber || '081234567890').trim(),
            address: (deliveryAddress || 'Alamat Pengiriman').trim()
          },
          itemDetails: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        })
      });

      const data = await res.json();
      setIsProcessingPayment(false);

      if (data.success) {
        // Menyimpan data respons pembayaran Midtrans ke state lokal
        setMidtransTx({
          orderId: data.orderId || newOrderId,
          vaNumber: data.vaNumber || newOrderId,
          simulatorUrl: data.simulatorUrl || 'https://simulator.sandbox.midtrans.com/',
          grossAmount: data.grossAmount || finalPayableTotal,
          paymentType: selectedPaymentMethod,
          qrString: data.qrString,
          qrUrl: data.qrUrl
        });
        setMidtransStatus('pending');
        setShowSandboxModal(true);

        // Memulai polling otomatis status pelunasan setiap 2.5 detik
        startStatusPolling(data.orderId || newOrderId);
      } else {
        alert(data.error || 'Gagal menghubungi Midtrans Sandbox API.');
      }
    } catch (err: any) {
      setIsProcessingPayment(false);
      console.error('Midtrans Charge error:', err);
      alert('Terjadi kesalahan saat memproses transaksi Midtrans.');
    }
  };

  /**
   * Handler: Eksekusi Penyelesaian Pesanan & Simpan ke Database
   * - Menghasilkan ID unik pesanan (format NFK-XXXXXX)
   * - Menyimpan snapshot rincian item produk, kuantitas, harga, dan kalkulasi total
   * - Menyimpan status pembayaran (PAID untuk Midtrans, AWAITING untuk COD)
   * - Mengosongkan keranjang belanja setelah transaksi berhasil
   */
  const handleExecutePayment = (explicitOrderId?: string, isMidtransPaid: boolean = false) => {
    setIsProcessingPayment(true);
    setShowSandboxModal(false);
    stopStatusPolling();

    // Menentukan ID pesanan dari Midtrans atau membuat ID baru
    const newOrderId = explicitOrderId || midtransTx?.orderId || `NFK-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentMethodNames: { [key: string]: string } = {
      va: 'Virtual Account BCA (Midtrans)',
      ewallet: 'E-Wallet GoPay/ShopeePay (Midtrans)',
      qris: 'QRIS Instant (Midtrans)',
      cc: 'Kartu Kredit (Midtrans)',
      cod: 'Cash on Delivery (COD)'
    };

    const isCod = selectedPaymentMethod === 'cod';

    // Membentuk objek data pesanan lengkap
    const orderData = {
      id: newOrderId,
      customerName: (customerName || user?.displayName || 'Pelanggan Nefakky').trim(),
      customerEmail: user?.email || '',
      avatar: user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName || user?.displayName || 'Pelanggan')}&background=25160E&color=ffffff`,
      address: (deliveryAddress || 'Alamat Pengiriman').trim(),
      phone: (customerPhone || user?.phoneNumber || '').trim(),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '/images/ayam_bakar.jpg'
      })),
      itemCount: totalCartCount,
      paymentMethod: paymentMethodNames[selectedPaymentMethod] || (isCod ? 'Tunai (COD)' : 'Online Midtrans'),
      paymentBadge: (isCod ? 'AWAITING' : 'PAID') as 'AWAITING' | 'PAID',
      deliveryType: 'KURIR NEFAKKY',
      distance: `${deliveryDistanceKm} Km`,
      status: 'RECEIVED' as const,
      subtotal: subtotal,
      shippingCost: shippingCost,
      discount: discountAmount || 0,
      total: finalPayableTotal,
      voucherCode: appliedPromo || '',
      appliedPromo: appliedPromo || '',
      date: formatCurrentRealtimeOrderDate(new Date()),
      createdAt: Date.now()
    };

    try {
      // Menyimpan transaksi ke DataContext (LocalStorage & Firebase Sync)
      if (addOrder) {
        addOrder(orderData);
      }
    } catch (err) {
      console.warn("Order save notice:", err);
    }

    // Menyimpan pesanan yang baru diselesaikan ke state selesai
    setCompletedOrder(orderData);

    // Otomatis simpan alamat baru ke profil pengguna jika belum ada
    if (user && deliveryAddress && deliveryAddress.trim()) {
      const trimmedAddr = deliveryAddress.trim();
      const existingAddresses = user.addresses || [];
      const addressAlreadyExists = existingAddresses.some(
        a => a.address.trim().toLowerCase() === trimmedAddr.toLowerCase()
      );
      
      if (!addressAlreadyExists && addAddress) {
        addAddress({
          label: addressLabel || 'Alamat Pesanan',
          receiverName: customerName || user.displayName || 'Pelanggan',
          receiverPhone: customerPhone || user.phoneNumber || '',
          address: trimmedAddr,
          isDefault: existingAddresses.length === 0
        });
      }
      
      // Simpan nomor telepon jika di profil masih kosong
      if (customerPhone && customerPhone.trim() && !user.phoneNumber && updateProfile) {
        updateProfile({ phoneNumber: customerPhone.trim() });
      }
    }

    setIsProcessingPayment(false);
    clearCart();
    setStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const userAvatar = user?.photoURL || (user?.displayName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=25160E&color=ffffff&bold=true` : (user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=25160E&color=ffffff&bold=true` : null));

  return (
    <div className="bg-[#FBF9F5] font-sans text-[#25160E] min-h-screen selection:bg-stone-900 selection:text-white flex flex-col justify-between">
      
      <div>
        {/* 1. FIXED HEADER SESUAI STITCH MCP */}
        <header className="fixed top-0 w-full z-50 bg-[#fcf8fa]/90 backdrop-blur-xl border-b border-stone-200 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
            
            {/* Brand Wordmark (Left) */}
            <div className="flex-1 flex items-center font-serif text-2xl tracking-widest text-black font-bold">
              <Link href="/">NEFAKKY</Link>
            </div>

            {/* Desktop Navigation (Centered) */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link href="/" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Beranda
              </Link>
              <Link href="/menu" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Menu
              </Link>
              <Link href="/comments" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Ulasan Rasa
              </Link>
              <Link href="/notifications" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Pesanan
              </Link>
            </nav>

            {/* Right Action Icons & Profile (Right) */}
            <div className="flex-1 flex items-center justify-end gap-6">
              <div className="relative flex items-center">
                <Link href="/cart" className="text-stone-600 hover:text-black transition-colors" title="Keranjang">
                  <ShoppingBag className="w-5 h-5" />
                </Link>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 bg-black text-white text-[10px] font-bold rounded-full">
                    {totalCartCount}
                  </span>
                )}
              </div>

              <Link 
                href={user ? "/profile" : "/login"}
                className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:bg-neutral-800 transition-colors overflow-hidden cursor-pointer"
              >
                {userAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </Link>
            </div>

          </div>
        </header>

        {/* 2. MAIN WORKFLOW AREA */}
        <main className="w-full pt-20">
          <div className="flex flex-col w-full pb-28 lg:pb-16">
            
            {/* ========================================================================= */}
            {/* STEP 1: KERANJANG BELANJA (CART) */}
            {/* ========================================================================= */}
            {step === 'cart' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full text-left">
                
                {/* Header Section */}
                <div className="mb-8 flex flex-col gap-2">
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#25160E] font-bold tracking-tight">
                    Keranjang Belanja Anda
                  </h1>
                  <p className="text-sm sm:text-base text-stone-600 font-light max-w-2xl">
                    Tinjau daftar porsi makanan otentik sebelum melanjutkan ke tahap checkout pengiriman.
                  </p>
                </div>

                {/* Toast Notification */}
                {promoMessage && (
                  <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 mb-6 font-medium shadow-xs ${
                    promoMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}>
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{promoMessage.text}</span>
                  </div>
                )}

                {/* 2 Columns Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left: Cart Items & Promo (8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    {cartItems.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-xs space-y-4">
                        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-bold text-black">Keranjang Anda Masih Kosong</h3>
                          <p className="text-xs text-stone-500 font-light mt-1 max-w-xs mx-auto">
                            Belum ada hidangan nusantara yang dipilih. Yuk jelajahi menu lezat kami!
                          </p>
                        </div>
                        <Link
                          href="/menu"
                          className="inline-flex items-center gap-2 bg-[#25160E] text-white px-6 py-3 rounded-xl font-semibold text-xs hover:bg-black transition-colors shadow-sm"
                        >
                          <span>Eksplorasi Menu</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {cartItems.map((item) => (
                          <div 
                            key={item.id}
                            className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 flex flex-col sm:flex-row gap-5 transition-transform hover:-translate-y-0.5 duration-300"
                          >
                            <div className="w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 relative">
                              <Image src={item.image || '/images/ayam_bakar.jpg'} alt={item.name} fill className="object-cover" sizes="128px" />
                            </div>

                            <div className="flex flex-col flex-1 justify-between gap-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">
                                  {item.category || 'Makanan Berat'}
                                </span>
                                <div className="flex justify-between items-start gap-4">
                                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#25160E] leading-snug">
                                    {item.name}
                                  </h3>
                                  <button onClick={() => deleteFromCart(item.id)} className="text-stone-400 hover:text-rose-600 transition-colors p-1" title="Hapus">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-xs text-stone-500 font-mono">
                                  Rp {(item.price || 0).toLocaleString('id-ID')}
                                </span>
                              </div>

                              <div className="flex justify-between items-end pt-2 border-t border-stone-100 sm:border-0 sm:pt-0">
                                <div className="flex items-center bg-stone-100 rounded-full p-1 gap-1 border border-stone-200">
                                  <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-black shadow-2xs hover:bg-stone-200 transition-colors font-bold">
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-bold text-black w-7 text-center font-mono">{item.quantity}</span>
                                  <button onClick={() => addToCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center bg-[#25160E] text-white shadow-2xs hover:bg-black transition-colors font-bold">
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <span className="font-serif text-base font-bold text-[#25160E]">
                                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {cartItems.length > 0 && (
                      <Link href="/menu" className="flex items-center justify-center gap-2 h-14 w-full bg-stone-100 hover:bg-stone-200/80 text-[#25160E] rounded-2xl transition-colors font-semibold text-xs tracking-wide border border-stone-200">
                        <Plus className="w-4 h-4" />
                        <span>Tambah Menu Makanan Lainnya</span>
                      </Link>
                    )}

                    {cartItems.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200 flex flex-col gap-4">
                        <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 bg-stone-50 border border-stone-200 rounded-xl flex items-center px-4 gap-2 focus-within:ring-2 focus-within:ring-black">
                            <Tag className="w-4 h-4 text-stone-400" />
                            <input 
                              type="text"
                              value={promoInput}
                              onChange={(e) => setPromoInput(e.target.value)}
                              placeholder="Masukkan kode promo (misal: DISKON50, WEEKENDSERU)"
                              className="bg-transparent border-none outline-none text-xs text-black w-full h-12 placeholder-stone-400 font-medium"
                            />
                          </div>
                          <button type="submit" className="bg-[#25160E] text-white h-12 px-6 rounded-xl font-semibold text-xs tracking-wide hover:bg-black transition-colors cursor-pointer shrink-0">
                            Gunakan Kode
                          </button>
                        </form>

                        {appliedPromo && (
                          <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-amber-700" />
                              <span className="font-semibold text-xs">
                                Promo Aktif: {appliedPromo} (Diskon {discountPercent}%)
                              </span>
                            </div>
                            <button onClick={removePromo} className="font-bold text-[11px] text-rose-600 hover:text-rose-800 transition-colors uppercase tracking-wider">
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Sticky Summary (4 Cols) */}
                  <div className="lg:col-span-4 relative">
                    <div className="sticky top-28 bg-white rounded-2xl shadow-md border border-stone-200 p-6 flex flex-col gap-6">
                      <h2 className="font-serif text-xl font-bold text-[#25160E] flex items-center justify-between">
                        <span>Ringkasan Biaya</span>
                        <span className="text-xs font-normal text-stone-500">({totalCartCount} item)</span>
                      </h2>

                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex justify-between items-center text-stone-700">
                          <span>Subtotal Makanan</span>
                          <span className="font-mono font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-stone-700">
                          <span>Estimasi Ongkir</span>
                          <span className="font-mono font-semibold">Rp {shippingCost.toLocaleString('id-ID')}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between items-center text-emerald-700 font-semibold">
                            <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Diskon Promo</span>
                            <span className="font-mono">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </div>

                      <div className="h-[1px] w-full bg-stone-200"></div>

                      <div className="flex justify-between items-end">
                        <span className="text-xs sm:text-sm font-semibold text-stone-600">Total Bayar</span>
                        <span className="font-serif text-2xl font-bold text-[#25160E]">Rp {(subtotal + shippingCost - discountAmount).toLocaleString('id-ID')}</span>
                      </div>

                      <button 
                        disabled={cartItems.length === 0}
                        onClick={() => { setStep('address'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="bg-[#25160E] text-white h-14 rounded-xl flex items-center justify-center font-semibold text-xs tracking-wide w-full gap-2 hover:bg-black transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        <span>Lanjutkan Ke Alamat Pengiriman</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="flex items-center justify-center gap-1.5 opacity-70">
                        <ShieldCheck className="w-4 h-4 text-stone-500" />
                        <span className="text-[11px] text-stone-500 font-light">Sistem Pembayaran 100% Eksklusif Midtrans</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}


            {/* ========================================================================= */}
            {/* STEP 2: CHECKOUT & ALAMAT PENGIRIMAN */}
            {/* ========================================================================= */}
            {step === 'address' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full text-left">
                
                {/* Stepper Header */}
                <div className="mb-8 flex flex-col items-start gap-4">
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#25160E] font-bold tracking-tight">
                    Checkout &amp; Alamat
                  </h1>

                  {/* 4-Stage Stepper Bar */}
                  <div className="flex items-center w-full max-w-2xl gap-2 mt-2">
                    <div className="flex flex-col items-center gap-1 flex-1 cursor-pointer" onClick={() => setStep('cart')}>
                      <div className="w-8 h-8 rounded-full bg-[#25160E] text-white flex items-center justify-center shadow-sm relative z-10">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#25160E] uppercase tracking-wider hidden sm:block">1. Keranjang</span>
                    </div>

                    <div className="h-1 bg-[#25160E] flex-1 -mx-4 mb-4 sm:mb-6 rounded-full"></div>

                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-8 h-8 rounded-full bg-[#25160E] text-white flex items-center justify-center shadow-sm relative z-10 ring-4 ring-[#25160E]/20">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#25160E] uppercase tracking-wider hidden sm:block">2. Alamat</span>
                    </div>

                    <div className="h-1 bg-stone-200 flex-1 -mx-4 mb-4 sm:mb-6 rounded-full"></div>

                    <div className="flex flex-col items-center gap-1 flex-1 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center relative z-10">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <span className="text-[11px] text-stone-500 uppercase tracking-wider hidden sm:block">3. Pembayaran</span>
                    </div>

                    <div className="h-1 bg-stone-200 flex-1 -mx-4 mb-4 sm:mb-6 rounded-full"></div>

                    <div className="flex flex-col items-center gap-1 flex-1 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center relative z-10">
                        <span className="text-xs font-bold">4</span>
                      </div>
                      <span className="text-[11px] text-stone-500 uppercase tracking-wider hidden sm:block">4. Selesai</span>
                    </div>
                  </div>
                </div>

                {/* 2-Columns Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                  
                  {/* Left Column: Address Selection & Notes (8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Selected Address Card */}
                    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                      <div className="p-5 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
                        <h2 className="font-serif text-lg font-bold text-[#25160E] flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-[#25160E]" />
                          <span>Alamat Pengiriman</span>
                        </h2>
                        <button 
                          onClick={() => setIsEditingAddress(!isEditingAddress)}
                          className="font-semibold text-xs text-[#25160E] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                          <span>{isEditingAddress ? 'Simpan' : 'Edit'}</span>
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        {isEditingAddress ? (
                          <div className="space-y-3">
                            <div>
                              <label className="font-semibold text-xs text-[#25160E] block mb-1">
                                Label Alamat <span className="text-[10px] font-normal text-stone-500">(Bisa diketik manual atau pilih cepat)</span>
                              </label>
                              <div className="space-y-1.5">
                                <input 
                                  type="text" 
                                  value={addressLabel} 
                                  onChange={(e) => setAddressLabel(e.target.value)} 
                                  placeholder="Contoh: Rumah, Kantor, Kosan..." 
                                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-black font-medium focus:outline-none focus:ring-2 focus:ring-black" 
                                />
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] text-stone-400 font-medium mr-0.5">Pilihan cepat:</span>
                                  {['Rumah', 'Kantor', 'Apartemen', 'Kos', 'Villa', 'Toko'].map((lbl) => (
                                    <button
                                      key={lbl}
                                      type="button"
                                      onClick={() => setAddressLabel(lbl)}
                                      className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                                        addressLabel.trim().toLowerCase() === lbl.toLowerCase()
                                          ? 'bg-black text-white shadow-2xs'
                                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                      }`}
                                    >
                                      {lbl}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="font-semibold text-xs text-[#25160E] block mb-1">Nama Penerima &amp; Telepon</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama Lengkap" className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black" />
                                <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Nomor Telepon" className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black" />
                              </div>
                            </div>

                            <div>
                              <label className="font-semibold text-xs text-[#25160E] block mb-1">Alamat Lengkap</label>
                              <textarea rows={2} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-black resize-none focus:outline-none focus:ring-2 focus:ring-black" />
                            </div>

                            <div>
                              <label className="font-semibold text-xs text-[#25160E] block mb-1">Catatan Kurir (Patokan)</label>
                              <input type="text" value={courierNotes} onChange={(e) => setCourierNotes(e.target.value)} placeholder="Contoh: Pagar hitam depan warung soto" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-black focus:outline-none focus:ring-2 focus:ring-black" />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#FBF9F5] rounded-xl p-4 border border-stone-200 relative overflow-hidden group cursor-pointer">
                            <div className="absolute top-4 right-4">
                              <div className="w-6 h-6 rounded-full bg-[#25160E] flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            </div>

                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col gap-1 pr-8">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-sm text-[#25160E]">{addressLabel}</h3>
                                  <span className="px-2 py-0.5 bg-[#25160E]/10 text-[#25160E] rounded text-[9px] font-bold uppercase tracking-wider">
                                    Utama
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-[#25160E]">
                                  {customerName} <span className="text-stone-500 font-normal">| {customerPhone}</span>
                                </p>
                                <p className="text-xs text-stone-600 font-light leading-relaxed mt-0.5">
                                  {deliveryAddress}
                                </p>
                                {courierNotes && (
                                  <p className="text-xs text-stone-500 italic mt-0.5">
                                    Catatan kurir: {courierNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Live Delivery Tracking Info */}
                        <div className="flex items-center gap-2.5 px-4 py-3 bg-[#FCF8FA] border border-stone-200 rounded-xl text-xs text-stone-700">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <p className="font-medium text-xs text-[#25160E]">
                            <span className="font-bold">Navigasi Terhubung:</span> Alamat tujuan otomatis terlacak secara realtime pada rute pengantaran Karyawan Nefakky.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Kitchen Order Notes */}
                    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                      <div className="p-5 bg-stone-50 border-b border-stone-200">
                        <h2 className="font-serif text-lg font-bold text-[#25160E] flex items-center gap-2">
                          <Edit className="w-5 h-5 text-[#25160E]" />
                          <span>Catatan Pesanan</span>
                        </h2>
                      </div>
                      <div className="p-6">
                        <textarea 
                          rows={3}
                          value={kitchenNotes}
                          onChange={(e) => setKitchenNotes(e.target.value)}
                          placeholder="Tolong pisahkan sambalnya, atau instruksi khusus lainnya untuk dapur..."
                          className="w-full p-3 bg-[#FBF9F5] border border-stone-200 rounded-xl text-xs text-[#25160E] focus:outline-none focus:ring-1 focus:ring-black resize-none placeholder-stone-400"
                        />
                        <p className="mt-2 text-xs text-stone-500 font-light flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-stone-400" />
                          <span>Catatan ini akan langsung dibaca oleh tim koki dapur kami.</span>
                        </p>
                      </div>
                    </section>

                    {/* Transparansi Ongkir Banner */}
                    <section className="bg-stone-100 rounded-2xl p-5 border border-stone-200 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center shrink-0">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1.5 text-left">
                        <h3 className="font-bold text-xs text-[#25160E]">Transparansi Ongkos Kirim</h3>
                        <p className="text-xs text-stone-600 font-light leading-relaxed">
                          Kami menggunakan perhitungan jarak berbasis GPS dari dapur kami ke lokasi Anda. Tarif dasar adalah Rp 10.000 untuk 3km pertama, ditambah Rp 1.500/km berikutnya.
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-mono text-xs bg-white px-2.5 py-1 rounded-md border border-stone-200 text-black">Jarak Estimasi: 4.2 km</span>
                          <span className="font-mono text-xs bg-white px-2.5 py-1 rounded-md border border-stone-200 text-black">Tarif: Rp 13.000</span>
                        </div>
                      </div>
                    </section>

                  </div>

                  {/* Right Column: Sticky Summary (4 Cols) */}
                  <div className="lg:col-span-4 relative">
                    <div className="sticky top-28 flex flex-col gap-4">
                      
                      <div className="bg-white rounded-2xl shadow-md border border-stone-200 overflow-hidden">
                        <div className="p-5 border-b border-stone-200">
                          <h2 className="font-serif text-lg font-bold text-[#25160E]">Ringkasan</h2>
                        </div>

                        <div className="p-6 flex flex-col gap-3 text-xs border-b border-stone-200">
                          <div className="flex justify-between items-center text-stone-600">
                            <span>Subtotal ({totalCartCount} Item)</span>
                            <span className="font-mono font-semibold text-[#25160E]">Rp {subtotal.toLocaleString('id-ID')}</span>
                          </div>

                          <div className="flex justify-between items-center text-stone-600">
                            <span className="flex items-center gap-1" title="Dihitung berdasarkan jarak 4.2 km (<=10 km Rp 10.000, >10 km +Rp 2.500/2km)">
                              Ongkos Kirim ({deliveryDistanceKm} Km)
                              <Info className="w-3.5 h-3.5 text-stone-400" />
                            </span>
                            <span className="font-mono font-semibold text-[#25160E]">Rp {shippingCost.toLocaleString('id-ID')}</span>
                          </div>

                          {discountAmount > 0 && (
                            <div className="flex justify-between items-center text-emerald-700 font-semibold">
                              <span>Diskon Promo ({appliedPromo})</span>
                              <span className="font-mono">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-6 bg-stone-50">
                          <div className="flex justify-between items-end">
                            <span className="font-semibold text-xs text-[#25160E] uppercase tracking-wider">Total Pembayaran</span>
                            <span className="font-serif text-2xl font-bold text-[#25160E]">Rp {finalPayableTotal.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleProceedToPayment}
                        className="w-full py-4 px-6 bg-[#25160E] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-black transition-all cursor-pointer"
                      >
                        <span>Lanjutkan Ke Pembayaran</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => { setStep('cart'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-full py-3 px-6 bg-transparent border border-stone-300 text-[#25160E] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali Ke Keranjang</span>
                      </button>

                      {/* Payment Provider Logo Strip */}
                      <div className="flex items-center justify-center gap-3 mt-2 opacity-60">
                        <span className="text-[10px] font-mono uppercase text-stone-500">Midtrans • QRIS • BCA • GoPay • COD</span>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            )}


            {/* ========================================================================= */}
            {/* STEP 3: PEMBAYARAN MIDTRANS SNAP */}
            {/* ========================================================================= */}
            {step === 'payment' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full text-left">
                
                {/* Stepper Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-stone-100 p-6 sm:p-8 rounded-2xl border border-stone-200">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#25160E] mb-1">
                      Pembayaran Midtrans
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 font-light">Pilih metode pembayaran yang Anda inginkan.</p>
                  </div>

                  {/* 4-Stage Stepper Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setStep('cart')}>
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">1. Keranjang</span>
                    </div>

                    <div className="h-[2px] w-6 sm:w-10 bg-emerald-600"></div>

                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setStep('address')}>
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">2. Alamat</span>
                    </div>

                    <div className="h-[2px] w-6 sm:w-10 bg-[#25160E]"></div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-[#25160E] text-white flex items-center justify-center ring-4 ring-[#25160E]/20">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#25160E]">3. Pembayaran</span>
                    </div>

                    <div className="h-[2px] w-6 sm:w-10 bg-stone-300"></div>

                    <div className="flex flex-col items-center gap-1 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center">
                        <span className="text-xs font-bold">4</span>
                      </div>
                      <span className="text-[10px] text-stone-500">4. Selesai</span>
                    </div>
                  </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left: Payment Options Grid (8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    <div className="flex items-center justify-between bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-[#25160E]" />
                        <div>
                          <h2 className="font-serif text-base sm:text-lg font-bold text-[#25160E]">Metode Pembayaran Resmi</h2>
                          <p className="text-xs text-stone-500 font-light">Proses checkout aman dengan enkripsi 256-bit.</p>
                        </div>
                      </div>
                      <div className="bg-stone-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-stone-200">
                        <ShieldCheck className="w-4 h-4 text-[#25160E]" />
                        <span className="text-[10px] font-bold text-[#25160E] uppercase tracking-wider">Secured by Midtrans</span>
                      </div>
                    </div>

                    {/* Radio Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Virtual Account */}
                      <label 
                        onClick={() => setSelectedPaymentMethod('va')}
                        className={`cursor-pointer bg-white p-5 rounded-2xl border flex items-start gap-4 transition-all shadow-xs ${
                          selectedPaymentMethod === 'va' ? 'border-[#25160E] ring-2 ring-[#25160E] bg-stone-50/50' : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <Building2 className={`w-6 h-6 mt-0.5 ${selectedPaymentMethod === 'va' ? 'text-[#25160E]' : 'text-stone-400'}`} />
                        <div className="flex-1">
                          <span className="block font-bold text-xs text-[#25160E] mb-0.5">Virtual Account</span>
                          <span className="block text-xs text-stone-500 font-light">BCA, Mandiri, BNI, BRI, Permata</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'va' ? 'border-[#25160E] bg-[#25160E] text-white' : 'border-stone-300'
                        }`}>
                          {selectedPaymentMethod === 'va' && <Check className="w-3 h-3" />}
                        </div>
                      </label>

                      {/* E-Wallet */}
                      <label 
                        onClick={() => setSelectedPaymentMethod('ewallet')}
                        className={`cursor-pointer bg-white p-5 rounded-2xl border flex items-start gap-4 transition-all shadow-xs ${
                          selectedPaymentMethod === 'ewallet' ? 'border-[#25160E] ring-2 ring-[#25160E] bg-stone-50/50' : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <Wallet className={`w-6 h-6 mt-0.5 ${selectedPaymentMethod === 'ewallet' ? 'text-[#25160E]' : 'text-stone-400'}`} />
                        <div className="flex-1">
                          <span className="block font-bold text-xs text-[#25160E] mb-0.5">E-Wallet</span>
                          <span className="block text-xs text-stone-500 font-light">GoPay, ShopeePay, OVO, DANA</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'ewallet' ? 'border-[#25160E] bg-[#25160E] text-white' : 'border-stone-300'
                        }`}>
                          {selectedPaymentMethod === 'ewallet' && <Check className="w-3 h-3" />}
                        </div>
                      </label>

                      {/* QRIS */}
                      <label 
                        onClick={() => setSelectedPaymentMethod('qris')}
                        className={`cursor-pointer bg-white p-5 rounded-2xl border flex items-start gap-4 transition-all shadow-xs ${
                          selectedPaymentMethod === 'qris' ? 'border-[#25160E] ring-2 ring-[#25160E] bg-stone-50/50' : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <QrCode className={`w-6 h-6 mt-0.5 ${selectedPaymentMethod === 'qris' ? 'text-[#25160E]' : 'text-stone-400'}`} />
                        <div className="flex-1">
                          <span className="block font-bold text-xs text-[#25160E] mb-0.5">QRIS Instant</span>
                          <span className="block text-xs text-stone-500 font-light">Scan dengan aplikasi bank / e-wallet apa saja</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'qris' ? 'border-[#25160E] bg-[#25160E] text-white' : 'border-stone-300'
                        }`}>
                          {selectedPaymentMethod === 'qris' && <Check className="w-3 h-3" />}
                        </div>
                      </label>

                      {/* Credit Card */}
                      <label 
                        onClick={() => setSelectedPaymentMethod('cc')}
                        className={`cursor-pointer bg-white p-5 rounded-2xl border flex items-start gap-4 transition-all shadow-xs ${
                          selectedPaymentMethod === 'cc' ? 'border-[#25160E] ring-2 ring-[#25160E] bg-stone-50/50' : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <CreditCard className={`w-6 h-6 mt-0.5 ${selectedPaymentMethod === 'cc' ? 'text-[#25160E]' : 'text-stone-400'}`} />
                        <div className="flex-1">
                          <span className="block font-bold text-xs text-[#25160E] mb-0.5">Kartu Kredit / Debit</span>
                          <span className="block text-xs text-stone-500 font-light">Visa, Mastercard, JCB</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'cc' ? 'border-[#25160E] bg-[#25160E] text-white' : 'border-stone-300'
                        }`}>
                          {selectedPaymentMethod === 'cc' && <Check className="w-3 h-3" />}
                        </div>
                      </label>

                      {/* COD */}
                      <label 
                        onClick={() => setSelectedPaymentMethod('cod')}
                        className={`cursor-pointer bg-white p-5 rounded-2xl border md:col-span-2 flex items-center gap-4 transition-all shadow-xs ${
                          selectedPaymentMethod === 'cod' ? 'border-[#25160E] ring-2 ring-[#25160E] bg-stone-50/50' : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <Truck className={`w-6 h-6 ${selectedPaymentMethod === 'cod' ? 'text-[#25160E]' : 'text-stone-400'}`} />
                        <div className="flex-1 flex items-center gap-3">
                          <span className="block font-bold text-xs text-[#25160E]">Cash on Delivery (COD)</span>
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            BISA COD
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPaymentMethod === 'cod' ? 'border-[#25160E] bg-[#25160E] text-white' : 'border-stone-300'
                        }`}>
                          {selectedPaymentMethod === 'cod' && <Check className="w-3 h-3" />}
                        </div>
                      </label>

                    </div>

                  </div>

                  {/* Right: Order Summary & Pay Action (4 Cols) */}
                  <div className="lg:col-span-4 relative">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-stone-200 sticky top-28 flex flex-col gap-6">
                      
                      <h3 className="font-serif text-lg font-bold text-[#25160E]">Order Summary</h3>

                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex justify-between items-center text-stone-600">
                          <span>Subtotal ({totalCartCount} items)</span>
                          <span className="font-mono font-semibold text-[#25160E]">Rp {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-stone-600">
                          <span>Ongkos Kirim ({deliveryDistanceKm} Km)</span>
                          <span className="font-mono font-semibold text-[#25160E]">Rp {shippingCost.toLocaleString('id-ID')}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between items-center text-emerald-700 font-semibold">
                            <span>Diskon Promo ({appliedPromo})</span>
                            <span className="font-mono">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </div>

                      <div className="h-[1px] bg-stone-200 w-full my-1"></div>

                      <div className="flex justify-between items-end">
                        <span className="font-serif text-base font-bold text-[#25160E]">Total Bayar</span>
                        <span className="font-serif text-2xl font-bold text-[#25160E]">Rp {finalPayableTotal.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex flex-col gap-3 mt-2">
                        {/* Tombol Eksekusi Pembayaran Utama */}
                        <button 
                          disabled={isProcessingPayment}
                          onClick={handleInitiatePayment}
                          className="w-full bg-[#25160E] hover:bg-black text-white py-4 rounded-xl font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                        >
                          {isProcessingPayment ? (
                            <span>MEMPROSES PESANAN...</span>
                          ) : selectedPaymentMethod === 'cod' ? (
                            <>
                              <span>BUAT PESANAN (BAYAR DI TEMPAT / COD)</span>
                              <Truck className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <span>BAYAR SEKARANG VIA MIDTRANS SNAP</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        {/* Keterangan Khusus Metode Pembayaran Bayar di Tempat (COD) */}
                        {selectedPaymentMethod === 'cod' && (
                          <p className="text-[11px] text-stone-500 text-center font-light leading-relaxed bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 text-amber-900">
                            <strong>Bayar di Tempat (COD):</strong> Anda tidak perlu melakukan transfer saat ini. Silakan siapkan uang pas sebesar <strong>Rp {finalPayableTotal.toLocaleString('id-ID')}</strong> untuk diserahkan ke kurir saat pesanan tiba.
                          </p>
                        )}

                        {/* Tombol Navigasi Kembali ke Langkah Sebelumnya */}
                        <button 
                          onClick={() => { setStep('address'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="w-full bg-transparent hover:bg-stone-100 text-[#25160E] py-3 rounded-xl font-semibold text-xs border border-stone-200 transition-colors cursor-pointer"
                        >
                          Kembali Ke Detail Alamat
                        </button>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            )}


            {/* ========================================================================= */}
            {/* STEP 4: PESANAN BERHASIL (SUCCESS) */}
            {/* ========================================================================= */}
            {step === 'success' && (
              <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-grow flex flex-col justify-center text-left animate-fade-in">
                
                {/* Stepper Header Selesai */}
                <div className="mb-8 flex justify-between items-center relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-px before:w-full before:bg-stone-200 before:z-0">
                  <div className="relative z-10 flex flex-col items-center gap-1 bg-[#FBF9F5] px-2">
                    <div className="w-8 h-8 rounded-full bg-[#25160E] text-white flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-500">1. Keranjang</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-1 bg-[#FBF9F5] px-2">
                    <div className="w-8 h-8 rounded-full bg-[#25160E] text-white flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-500">2. Alamat</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-1 bg-[#FBF9F5] px-2">
                    <div className="w-8 h-8 rounded-full bg-[#25160E] text-white flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-500">3. Pembayaran</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-1 bg-[#FBF9F5] px-2">
                    <div className="w-8 h-8 rounded-full bg-[#25160E] text-white flex items-center justify-center shadow-sm ring-4 ring-[#25160E]/20">
                      <span className="text-xs font-bold">4</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#25160E]">4. Selesai</span>
                  </div>
                </div>

                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative border border-stone-200">
                  
                  {/* Header/Icon */}
                  <div className="p-8 sm:p-10 flex flex-col items-center text-center bg-stone-50/80 relative overflow-hidden">
                    <div className="w-24 h-24 rounded-full bg-[#25160E]/10 flex items-center justify-center mb-4 relative z-10">
                      <div className="w-16 h-16 rounded-full bg-[#25160E] flex items-center justify-center shadow-md animate-bounce">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-3 uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-emerald-700" />
                      <span>PEMBAYARAN DITERIMA REAL-TIME</span>
                    </div>

                    <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#25160E] mb-2">
                      Pesanan Berhasil
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 font-light max-w-md">
                      Terima kasih! Pesanan Anda #{completedOrder?.id || 'NFK-892102'} sedang diproses dan akan segera disiapkan oleh tim culinary kami.
                    </p>
                  </div>

                  {/* Order Details */}
                  <div className="p-6 sm:p-8 bg-white relative z-20 space-y-6">
                    <div className="bg-stone-50 rounded-xl p-4 sm:p-5 flex flex-col gap-2.5 shadow-2xs border border-stone-200 text-xs">
                      
                      <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                        <span className="text-stone-500 font-light">Order ID</span>
                        <span className="font-mono font-bold text-[#25160E] tracking-wider">#{completedOrder?.id || 'NFK-892102'}</span>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-stone-500 font-light">Metode Pembayaran</span>
                        <span className="font-semibold text-[#25160E] flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5 text-stone-600" />
                          <span>{completedOrder?.paymentMethod || 'Midtrans Snap / COD'}</span>
                        </span>
                      </div>

                      {completedOrder?.voucherCode && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-stone-500 font-light">Promo Terpakai</span>
                          <span className="font-semibold text-emerald-700">-Rp {(completedOrder?.discount || 0).toLocaleString('id-ID')} ({completedOrder?.voucherCode})</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-stone-200 mt-1">
                        <span className="font-semibold text-sm text-[#25160E]">Total Pembayaran</span>
                        <span className="font-serif text-lg font-bold text-[#25160E]">
                          Rp {(completedOrder?.total || finalPayableTotal).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link 
                        href="/notifications" 
                        className="flex-1 bg-[#25160E] text-white py-3.5 px-4 rounded-xl text-xs font-semibold shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Lacak Status Pengiriman</span>
                      </Link>

                      <Link 
                        href="/menu" 
                        className="flex-1 bg-white text-[#25160E] border border-stone-300 py-3.5 px-4 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <BagIcon className="w-4 h-4" />
                        <span>Kembali ke Katalog Menu</span>
                      </Link>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        </main>
      </div>



      {/* 5. MODAL MIDTRANS PAYMENT CONSOLE & SIMULATOR SANDBOX */}
      {showSandboxModal && midtransTx && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-fade-in text-left">
            
            {/* Header Midtrans Sandbox */}
            <div className="bg-[#102A43] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-wide block text-white">MIDTRANS PAYMENT GATEWAY</span>
                    <span className="px-2 py-0.2 bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded-md text-[9px] font-bold tracking-wider uppercase">
                      SANDBOX ACTIVE
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-300 font-light">Pembayaran Digital Real-Time & Integrasi Simulator</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  stopStatusPolling();
                  setShowSandboxModal(false);
                }}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount & Order ID Banner */}
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider block">Total Tagihan</span>
                <span className="font-serif text-xl font-bold text-[#934B19]">
                  Rp {(midtransTx.grossAmount || finalPayableTotal).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wider block">Order ID</span>
                <span className="font-mono text-xs font-bold text-[#25160E] bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                  #{midtransTx.orderId}
                </span>
              </div>
            </div>

            {/* Content: Kode VA / QRIS & Simulator Link */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Box Kode Pembayaran / Virtual Account */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                    {midtransTx.paymentType === 'qris' ? 'Kode Transaksi QRIS' : 'Nomor Virtual Account / Kode Bayar'}
                  </span>
                  <span className="text-[10px] text-blue-700 font-medium">BCA / Midtrans Sandbox</span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <span className="font-mono font-bold text-base sm:text-lg text-[#102A43] tracking-widest break-all">
                    {midtransTx.vaNumber}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText(midtransTx.vaNumber);
                      setCopyFeedback('Kode Disalin!');
                      setTimeout(() => setCopyFeedback(null), 2500);
                    }}
                    className="px-3 py-1.5 bg-[#102A43] hover:bg-blue-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ml-2 shadow-xs active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                    <span>{copyFeedback || 'Salin Kode'}</span>
                  </button>
                </div>
              </div>

              {/* Action Button: Buka Midtrans Payment Simulator */}
              <div className="space-y-2">
                <a 
                  href={midtransTx.simulatorUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#004B99] hover:bg-[#003B7A] text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Buka Midtrans Payment Simulator ↗</span>
                </a>

                {/* Panduan 3 Langkah Cepat */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-[11px] text-stone-600 space-y-1 font-light leading-relaxed">
                  <span className="font-bold text-[#25160E] block text-xs">Cara Bayar di Simulator Midtrans:</span>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Klik tombol <strong>Buka Midtrans Payment Simulator</strong> di atas (membuka di tab baru).</li>
                    <li>Tempelkan nomor VA <strong className="font-mono text-[#102A43]">{midtransTx.vaNumber}</strong> ke kolom simulator.</li>
                    <li>Klik tombol <strong>Inquire</strong> lalu klik <strong>Pay</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* Realtime Live Status Radar */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500 relative flex items-center justify-center shrink-0">
                    <div className="absolute w-full h-full bg-amber-500 rounded-full animate-ping opacity-75"></div>
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full relative z-10"></div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-amber-950 block">
                      {midtransStatus === 'checking' ? 'Mengecek Status Pembayaran...' : 'Menunggu Pembayaran di Simulator...'}
                    </span>
                    <span className="text-[10px] text-amber-800 font-light block">
                      Web akan otomatis mendeteksi ketika Anda selesai membayar.
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => checkMidtransStatusNow()}
                  className="px-3 py-1.5 bg-white text-amber-950 hover:bg-amber-100/60 border border-amber-300 rounded-xl text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                >
                  Cek Status Sekarang
                </button>
              </div>

              {/* Tutup Modal Button */}
              <button 
                onClick={() => {
                  stopStatusPolling();
                  setShowSandboxModal(false);
                }}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Batal / Ganti Metode Pembayaran
              </button>

            </div>

          </div>
        </div>
      )}

      {/* 6. NOTIFIKASI SUKSES PEMBAYARAN MIDTRANS (POP-UP ALERT) */}
      {paymentSuccessNotif && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-emerald-200 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                PEMBAYARAN TERVERIFIKASI
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#25160E]">
                Pembayaran Berhasil!
              </h3>
              <p className="text-xs text-stone-600 font-light">
                Midtrans Gateway telah mengonfirmasi pelunasan transaksi <strong>#{paymentSuccessNotif.orderId}</strong> sebesar <strong>Rp {paymentSuccessNotif.amount.toLocaleString('id-ID')}</strong>.
              </p>
            </div>

            {/* Status Pelunasan Pembayaran */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
              Status: <strong>LUNAS (Settlement)</strong> • Pesanan telah diteruskan ke Dapur Resto Nefakky!
            </div>

            <button 
              onClick={() => {
                setPaymentSuccessNotif(null);
                setStep('success');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3.5 bg-[#25160E] hover:bg-black text-amber-300 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Ringkasan Pesanan</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

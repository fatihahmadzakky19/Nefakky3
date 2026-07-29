'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
  Search,
  Bell,
  MessageSquare,
  LayoutDashboard,
  ShoppingBag,
  Box,
  Users,
  BarChart3,
  Plus,
  Settings,
  HelpCircle,
  Calendar,
  Download,
  Upload,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  ShieldCheck,
  LogOut,
  X,
  Sparkles,
  Tag,
  ArrowUpRight,
  Filter,
  Check,
  Receipt,
  Truck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  RotateCcw,
  FileSpreadsheet,
  Star,
  Trash2,
  Layers,
  Archive,
  Camera,
  MapPin,
  Edit3,
  Image as ImageIcon,
  ArrowLeft,
  MoreHorizontal,
  FolderPlus,
  Globe,
  Ticket,
  Percent,
  Zap,
  Copy,
  MoreVertical,
  SlidersHorizontal,
  Grid,
  List,
  MessageCircle,
  Eye,
  EyeOff,
  Pin,
  Flag,
  CornerUpLeft,
  User,
  ShieldAlert,
  Target
} from 'lucide-react';

interface RecentOrder {
  id: string;
  customerName: string;
  avatar: string;
  productName: string;
  paymentStatus: 'VERIFIED' | 'PENDING' | 'REFUNDED';
  amount: number;
  date: string;
}

interface OrderManagementItem {
  id: string;
  customerName: string;
  avatar: string;
  address: string;
  itemCount: number;
  paymentMethod: string;
  paymentBadge: 'PAID' | 'AWAITING' | 'REFUNDED';
  deliveryType: 'EXPRESS' | 'STANDARD' | 'SAME DAY';
  status: 'SHIPPING' | 'COOKING' | 'COMPLETED' | 'PENDING';
  total: number;
}

interface ProductManagementItem {
  id: string;
  name: string;
  sku: string;
  image: string;
  gallery: string[];
  category: string;
  price: number;
  discount: number;
  stock: number;
  visibility: boolean;
  status: 'Active' | 'Low Stock' | 'Inactive';
  rating: number;
  soldCount: string;
  ingredients: string;
  usageAdvice: string;
  origin: string;
  calories: string;
  fat: string;
  sugar: string;
  satFat: string;
}

interface PromotionItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badge: 'Active' | 'Scheduled' | 'Ended';
  image: string;
  duration: string;
  type: string;
  usedCount: number;
  totalLimit: number;
  isActive: boolean;
}

interface VoucherItem {
  id: string;
  code: string;
  name: string;
  type: string;
  minSpend: number;
  redemptions: string;
  expiry: string;
  status: 'Active' | 'Expired';
}

interface ReviewItem {
  id: string;
  authorName: string;
  authorBadge: 'PLATINUM' | 'GOLD' | 'MEMBER';
  authorAvatar: string;
  productName: string;
  productImage: string;
  rating: number;
  date: string;
  status: 'PUBLISHED' | 'PENDING REVIEW' | 'FLAGGED';
  flaggedReason?: string;
  comment: string;
  photos?: string[];
  isPinned?: boolean;
  isHidden?: boolean;
}

const INITIAL_RECENT_ORDERS: RecentOrder[] = [
  {
    id: '#NF-8821',
    customerName: 'Eleanor James',
    avatar: 'EJ',
    productName: 'Signature Truffle Box',
    paymentStatus: 'VERIFIED',
    amount: 145000,
    date: 'July 28, 2026'
  },
  {
    id: '#NF-8819',
    customerName: 'Marcus Knight',
    avatar: 'MK',
    productName: 'Saffron Honey Jar',
    paymentStatus: 'VERIFIED',
    amount: 85000,
    date: 'July 28, 2026'
  },
  {
    id: '#NF-8815',
    customerName: 'Sophia Chen',
    avatar: 'SC',
    productName: 'Organic Earl Grey Tea',
    paymentStatus: 'VERIFIED',
    amount: 52000,
    date: 'July 27, 2026'
  },
  {
    id: '#NF-8812',
    customerName: 'David Miller',
    avatar: 'DM',
    productName: 'Artisanal Sourdough & Cheese',
    paymentStatus: 'PENDING',
    amount: 120000,
    date: 'July 27, 2026'
  }
];

const INITIAL_ORDER_MANAGEMENT: OrderManagementItem[] = [
  {
    id: '#NF-8821',
    customerName: 'Eleanor Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    address: 'Brooklyn, NY',
    itemCount: 3,
    paymentMethod: 'Visa',
    paymentBadge: 'PAID',
    deliveryType: 'EXPRESS',
    status: 'SHIPPING',
    total: 142.50
  },
  {
    id: '#NF-8822',
    customerName: 'Liam Sterling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    address: 'Austin, TX',
    itemCount: 1,
    paymentMethod: 'COD',
    paymentBadge: 'AWAITING',
    deliveryType: 'STANDARD',
    status: 'COOKING',
    total: 45.00
  },
  {
    id: '#NF-8820',
    customerName: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    address: 'San Fran, CA',
    itemCount: 5,
    paymentMethod: 'Apple Pay',
    paymentBadge: 'PAID',
    deliveryType: 'EXPRESS',
    status: 'COMPLETED',
    total: 288.75
  },
  {
    id: '#NF-8819',
    customerName: 'Marcus Knight',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    address: 'Chicago, IL',
    itemCount: 2,
    paymentMethod: 'QRIS',
    paymentBadge: 'PAID',
    deliveryType: 'STANDARD',
    status: 'SHIPPING',
    total: 85.00
  },
  {
    id: '#NF-8818',
    customerName: 'David Miller',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    address: 'Miami, FL',
    itemCount: 4,
    paymentMethod: 'Transfer Bank',
    paymentBadge: 'PAID',
    deliveryType: 'EXPRESS',
    status: 'COOKING',
    total: 195.20
  },
  {
    id: '#NF-8817',
    customerName: 'Isabella Rose',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    address: 'Seattle, WA',
    itemCount: 1,
    paymentMethod: 'Visa',
    paymentBadge: 'PAID',
    deliveryType: 'STANDARD',
    status: 'COMPLETED',
    total: 32.00
  }
];

const INITIAL_PRODUCT_MANAGEMENT: ProductManagementItem[] = [
  {
    id: 'prod-1',
    name: 'Truffle Infused Olive Oil',
    sku: 'SKU-2948-V',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'
    ],
    category: 'Pantry & Oils',
    price: 45.00,
    discount: 5,
    stock: 124,
    visibility: true,
    status: 'Active',
    rating: 5,
    soldCount: '842',
    ingredients: 'Extra Virgin Olive Oil, Dried Black Winter Truffles (Tuber Melanosporum), Natural Truffle Essence, Cold-pressed for 24 hours.',
    usageAdvice: 'Finishing only',
    origin: 'Umbria, Italy',
    calories: '824',
    fat: '92g',
    sugar: '0g',
    satFat: '14g'
  },
  {
    id: 'prod-2',
    name: 'Rustic Sourdough Bread',
    sku: 'SKU-BAK-293',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'
    ],
    category: 'Bakery',
    price: 12.50,
    discount: 0,
    stock: 14,
    visibility: true,
    status: 'Active',
    rating: 5,
    soldCount: '1.2k',
    ingredients: 'Organic Unbleached Wheat Flour, Filtered Water, Natural Starter Culture, Sea Salt.',
    usageAdvice: 'Toast before serving',
    origin: 'Artisanal Bakery, NY',
    calories: '240',
    fat: '1.5g',
    sugar: '1g',
    satFat: '0.3g'
  },
  {
    id: 'prod-3',
    name: 'Wildflower Honey Jar',
    sku: 'SKU-HON-552',
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80'
    ],
    category: 'Spreads',
    price: 18.00,
    discount: 0,
    stock: 42,
    visibility: true,
    status: 'Active',
    rating: 4,
    soldCount: '2.1k',
    ingredients: '100% Pure Raw Wildflower Honey.',
    usageAdvice: 'Tea sweetener & cheese pairings',
    origin: 'Vermont, USA',
    calories: '64',
    fat: '0g',
    sugar: '17g',
    satFat: '0g'
  },
  {
    id: 'prod-4',
    name: 'Mediterranean Spice Blend',
    sku: 'SKU-SPI-092',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    gallery: [],
    category: 'Spices',
    price: 9.00,
    discount: 0,
    stock: 0,
    visibility: false,
    status: 'Inactive',
    rating: 3.5,
    soldCount: '115',
    ingredients: 'Oregano, Thyme, Rosemary, Garlic Flakes, Sea Salt, Red Pepper.',
    usageAdvice: 'Grill seasoning',
    origin: 'Crete, Greece',
    calories: '5',
    fat: '0.1g',
    sugar: '0g',
    satFat: '0g'
  }
];

const INITIAL_PROMOTIONS: PromotionItem[] = [
  {
    id: 'promo-1',
    title: 'Promo Special Wagyu Bowl 30%',
    subtitle: 'Hidangan daging wagyu MB7 pilihan dengan kuning telur organik.',
    tag: '30% OFF',
    badge: 'Active',
    image: '/images/wagyu_bowl.png',
    duration: '01 Mei - 31 Des',
    type: 'Percentage',
    usedCount: 142,
    totalLimit: 500,
    isActive: true
  },
  {
    id: 'promo-2',
    title: 'Flash Sale: Rendang Daging Premium',
    subtitle: 'Rendang sapi olahan 12 jam dengan rempah padang asli.',
    tag: 'FLASH SALE',
    badge: 'Active',
    image: '/images/hero_rendang.png',
    duration: 'Akhir Pekan',
    type: 'Fixed Amount',
    usedCount: 98,
    totalLimit: 1000,
    isActive: true
  },
  {
    id: 'promo-3',
    title: 'Hemat Sate Ayam Madura',
    subtitle: 'Sate ayam dada pilihan dengan bumbu kacang khas Madura.',
    tag: 'BOGO',
    badge: 'Active',
    image: '/images/sate_ayam.png',
    duration: '01 Juni - 31 Des',
    type: 'Buy 1 Get 1',
    usedCount: 45,
    totalLimit: 100,
    isActive: true
  }
];

const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    id: 'vouch-1',
    code: 'WEEKENDSERU',
    name: 'Promo Akhir Pekan 30%',
    type: 'Percentage',
    minSpend: 50000,
    redemptions: '142/500',
    expiry: '31 Des 2026',
    status: 'Active'
  },
  {
    id: 'vouch-2',
    code: 'NEFAKKY10',
    name: 'Voucher Pelanggan Baru 10%',
    type: 'Percentage',
    minSpend: 30000,
    redemptions: '98/1000',
    expiry: '31 Des 2026',
    status: 'Active'
  },
  {
    id: 'vouch-3',
    code: 'HEMAT50',
    name: 'Diskon Spesial 50%',
    type: 'Buy 1 Get 1',
    minSpend: 100000,
    redemptions: '45/100',
    expiry: '31 Des 2026',
    status: 'Active'
  }
];

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'Ahmad Zakky',
    authorBadge: 'PLATINUM',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    productName: 'Special Wagyu Bowl',
    productImage: '/images/wagyu_bowl.png',
    rating: 5,
    date: 'Kemarin, 14:20',
    status: 'PUBLISHED',
    comment: '"Daging wagyu nya sangat lembut dan bumbunya meresap sempurna. Porsi cukup banyak dan pengiriman super cepat!"',
    photos: [
      '/images/wagyu_bowl.png'
    ],
    isPinned: true,
    isHidden: false
  },
  {
    id: 'rev-2',
    authorName: 'Siti Rahma',
    authorBadge: 'GOLD',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    productName: 'Rendang Daging Premium',
    productImage: '/images/hero_rendang.png',
    rating: 5,
    date: '2 hari lalu',
    status: 'PUBLISHED',
    comment: '"Rendang terbaik yang pernah saya pesan online. Bumbu kelapa sangrainya beraroma wangi harum dan daging sangat empuk."',
    isPinned: false,
    isHidden: false
  },
  {
    id: 'rev-3',
    authorName: 'Dimas Pratama',
    authorBadge: 'MEMBER',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    productName: 'Sate Ayam Madura',
    productImage: '/images/sate_ayam.png',
    rating: 5,
    date: '3 hari lalu',
    status: 'PUBLISHED',
    comment: '"Bumbu kacangnya gurih medok banget! Daging dada ayamnya tebal dan tidak pelit bumbu."',
    isPinned: false,
    isHidden: false
  }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { 
    products: productList, 
    setProducts: setProductList,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductVisibility,
    vouchers: voucherList,
    setVouchers: setVoucherList,
    addVoucher,
    deleteVoucher,
    orders: orderList,
    setOrders: setOrderList,
    addOrder,
    updateOrderStatus,
    updatePaymentStatus,
    reviews: reviewList,
    setReviews: setReviewList,
    deleteReview
  } = useData();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'promotions' | 'reviews' | 'analytics' | 'settings'>('analytics');
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(INITIAL_RECENT_ORDERS);
  
  // Promotions State
  const [promotionList, setPromotionList] = useState<PromotionItem[]>(INITIAL_PROMOTIONS);
  const [voucherFilterTab, setVoucherFilterTab] = useState<'All' | 'Active' | 'Expired'>('All');
  const [showCreatePromoModal, setShowCreatePromoModal] = useState<boolean>(false);

  // Review Intelligence State
  const [reviewFilterTab, setReviewFilterTab] = useState<'All' | 'Pending' | 'Flagged' | 'Published'>('All');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('All Ratings');
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>('Artisan Breads');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Analytics Filter State
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<string>('Last 30 Days');

  // Form state for Create Promotion modal
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoSubtitle, setNewPromoSubtitle] = useState('');
  const [newPromoTag, setNewPromoTag] = useState('20% OFF');
  const [newPromoType, setNewPromoType] = useState('Percentage');
  const [newPromoDuration, setNewPromoDuration] = useState('May 01 - May 30');
  const [newPromoLimit, setNewPromoLimit] = useState('500');
  const [newPromoVoucherCode, setNewPromoVoucherCode] = useState('');

  // Product View Mode: 'list' (Table) or 'editor' (Visual Identity & General Info Editor)
  const [productViewMode, setProductViewMode] = useState<'list' | 'editor'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // File Input References for Galeri Upload
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Selection State for Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [paymentFilter, setPaymentFilter] = useState<string>('Any Payment');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [stockLevelFilter, setStockLevelFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals
  const [showCreateOrderModal, setShowCreateOrderModal] = useState<boolean>(false);

  // Form states inside Product Editor
  const [editName, setEditName] = useState('');
  const [editSKU, setEditSKU] = useState('');
  const [editCategory, setEditCategory] = useState('Pantry & Oils');
  const [editBasePrice, setEditBasePrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('0');
  const [editStock, setEditStock] = useState('100');
  const [editVisibility, setEditVisibility] = useState(true);
  const [editHeroImage, setEditHeroImage] = useState('');
  const [editGalleryImages, setEditGalleryImages] = useState<string[]>([]);
  const [editIngredients, setEditIngredients] = useState('');
  const [editUsageAdvice, setEditUsageAdvice] = useState('');
  const [editOrigin, setEditOrigin] = useState('');
  const [editCalories, setEditCalories] = useState('824');
  const [editFat, setEditFat] = useState('92g');
  const [editSugar, setEditSugar] = useState('0g');
  const [editSatFat, setEditSatFat] = useState('14g');

  // Form state for Manual Order modal
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualItems, setManualItems] = useState('2 ITEMS');
  const [manualPayment, setManualPayment] = useState('Visa');
  const [manualDelivery, setManualDelivery] = useState<'EXPRESS' | 'STANDARD'>('EXPRESS');
  const [manualTotal, setManualTotal] = useState('');

  // Protect Admin route
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin' && user.email !== 'fatihahmadzakky19@gmail.com') {
        alert('Akses khusus Admin! Anda akan diarahkan ke halaman utama.');
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center text-stone-800">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#613A1F] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memverifikasi Hak Akses Administrator...</p>
      </div>
    );
  }

  // Review Actions
  const handleTogglePinReview = (id: string) => {
    setReviewList(reviewList.map(r => r.id === id ? { ...r, isPinned: !r.isPinned } : r));
  };

  const handleToggleHideReview = (id: string) => {
    setReviewList(reviewList.map(r => r.id === id ? { ...r, isHidden: !r.isHidden } : r));
  };

  const handleDeleteReview = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus ulasan ini secara permanen?')) {
      deleteReview(id);
    }
  };

  const handleInvestigateReview = (id: string) => {
    setReviewList(reviewList.map(r => r.id === id ? { ...r, status: 'PUBLISHED', flaggedReason: undefined } : r));
    alert('Ulasan telah diinvestigasi dan dipublikasikan kembali!');
  };

  const handleRejectReview = (id: string) => {
    setReviewList(reviewList.filter(r => r.id !== id));
    alert('Ulasan yang ditandai telah ditolak dan dihapus dari marketplace.');
  };

  const handleSendReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !replyingReviewId) return;
    alert(`Balasan resmi Admin telah dikirim ke ulasan!`);
    setReplyText('');
    setReplyingReviewId(null);
  };

  // Toggle active promotion status
  const togglePromoActive = (id: string) => {
    setPromotionList(promotionList.map(p => {
      if (p.id === id) {
        const nextActive = !p.isActive;
        return {
          ...p,
          isActive: nextActive,
          badge: nextActive ? 'Active' : 'Ended'
        };
      }
      return p;
    }));
  };

  // Delete promotion
  const handleDeletePromo = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus promosi ini?')) {
      setPromotionList(promotionList.filter(p => p.id !== id));
    }
  };

  // Duplicate promotion
  const handleDuplicatePromo = (promo: PromotionItem) => {
    const dup: PromotionItem = {
      ...promo,
      id: `promo-${Date.now()}`,
      title: `${promo.title} (Copy)`,
      badge: 'Scheduled',
      isActive: false,
      usedCount: 0
    };
    setPromotionList([dup, ...promotionList]);
    alert(`Promosi "${promo.title}" berhasil diduplikasi!`);
  };

  // Submit new promotion creation
  const handleCreatePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoTitle) return;

    const createdPromo: PromotionItem = {
      id: `promo-${Date.now()}`,
      title: newPromoTitle,
      subtitle: newPromoSubtitle || 'Special promotional campaign for Nefakky Marketplace.',
      tag: newPromoTag || 'PROMO',
      badge: 'Active',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      duration: newPromoDuration || 'Active Now',
      type: newPromoType,
      usedCount: 0,
      totalLimit: parseInt(newPromoLimit) || 500,
      isActive: true
    };

    setPromotionList([createdPromo, ...promotionList]);

    if (newPromoVoucherCode) {
      addVoucher({
        code: newPromoVoucherCode.toUpperCase(),
        name: newPromoTitle,
        discountPercent: parseInt(newPromoTag) || 20,
        minSpend: 50000,
        redemptions: `0/${newPromoLimit}`,
        expiry: '30 Dec 2026',
        status: 'Active'
      });
    }

    setNewPromoTitle('');
    setNewPromoSubtitle('');
    setNewPromoVoucherCode('');
    setShowCreatePromoModal(false);
    alert(`Promosi "${newPromoTitle}" berhasil dibuat dan ditambahkan!`);
  };

  // Handle local file selection for Hero Image (Galeri HP / Perangkat)
  const handleHeroFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditHeroImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local file selection for Gallery Thumbnails (Galeri HP / Perangkat)
  const handleGalleryFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setEditGalleryImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Open Editor for new product (Clean empty form)
  const openNewProductEditor = () => {
    const randomSku = `SKU-${Math.floor(1000 + Math.random() * 9000)}-V`;
    setEditingProductId(null);
    setEditName('');
    setEditSKU(randomSku);
    setEditCategory('Makanan Berat');
    setEditBasePrice('');
    setEditDiscount('0');
    setEditStock('50');
    setEditVisibility(true);
    setEditHeroImage('');
    setEditGalleryImages([]);
    setEditIngredients('');
    setEditUsageAdvice('');
    setEditOrigin('');
    setEditCalories('');
    setEditFat('');
    setEditSugar('');
    setEditSatFat('');
    setProductViewMode('editor');
  };

  // Open Editor for existing product
  const openExistingProductEditor = (prod: ProductManagementItem) => {
    setEditingProductId(prod.id);
    setEditName(prod.name);
    setEditSKU(prod.sku);
    setEditCategory(prod.category);
    setEditBasePrice(prod.price.toString());
    setEditDiscount((prod.discount || 0).toString());
    setEditStock(prod.stock.toString());
    setEditVisibility(prod.visibility ?? true);
    setEditHeroImage(prod.image);
    setEditGalleryImages(prod.gallery || []);
    setEditIngredients(prod.ingredients || 'Natural organic ingredients.');
    setEditUsageAdvice(prod.usageAdvice || 'Store in a cool dry place');
    setEditOrigin(prod.origin || 'Imported');
    setEditCalories(prod.calories || '250');
    setEditFat(prod.fat || '12g');
    setEditSugar(prod.sugar || '2g');
    setEditSatFat(prod.satFat || '1.5g');
    setProductViewMode('editor');
  };

  // Save changes from Editor
  const handleSaveProductEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editBasePrice) return;

    const parsedPrice = parseFloat(editBasePrice) || 0;
    const parsedDiscount = parseFloat(editDiscount) || 0;
    const parsedStock = parseInt(editStock) || 0;

    const computedStatus: 'Active' | 'Low Stock' | 'Inactive' = 
      parsedStock === 0 ? 'Inactive' : parsedStock < 10 ? 'Low Stock' : 'Active';

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: editName,
        sku: editSKU,
        category: editCategory,
        price: parsedPrice,
        discount: parsedDiscount,
        stock: parsedStock,
        visibility: editVisibility,
        status: computedStatus,
        image: editHeroImage,
        gallery: editGalleryImages,
        ingredients: editIngredients,
        usageAdvice: editUsageAdvice,
        origin: editOrigin,
        calories: editCalories,
        fat: editFat,
        sugar: editSugar,
        satFat: editSatFat
      });
      alert(`Detail Produk "${editName}" berhasil diperbarui dan disinkronkan ke Halaman Pengguna!`);
    } else {
      addProduct({
        name: editName,
        sku: editSKU,
        category: editCategory,
        price: parsedPrice,
        discount: parsedDiscount,
        stock: parsedStock,
        visibility: editVisibility,
        status: computedStatus,
        rating: 5,
        reviewsCount: 1,
        soldCount: '0',
        image: editHeroImage,
        gallery: editGalleryImages,
        description: editIngredients || editName,
        ingredients: editIngredients,
        usageAdvice: editUsageAdvice,
        origin: editOrigin,
        calories: editCalories,
        fat: editFat,
        sugar: editSugar,
        satFat: editSatFat
      });
      alert(`Produk Baru "${editName}" berhasil dibuat dan tampil di Halaman Pengguna!`);
    }

    setProductViewMode('list');
  };

  const handleCreateManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomer || !manualTotal) return;

    addOrder({
      customerName: manualCustomer,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      address: manualAddress || 'Jakarta, ID',
      items: [],
      itemCount: parseInt(manualItems) || 2,
      paymentMethod: manualPayment,
      paymentBadge: 'PAID',
      deliveryType: manualDelivery,
      status: 'COOKING',
      subtotal: parseFloat(manualTotal) || 0,
      shippingCost: 12000,
      discount: 0,
      total: parseFloat(manualTotal) || 0
    });

    setManualCustomer('');
    setManualAddress('');
    setManualTotal('');
    setShowCreateOrderModal(false);
    alert(`Manual Order berhasil dibuat!`);
  };

  const resetFilters = () => {
    setStatusFilter('All Statuses');
    setPaymentFilter('Any Payment');
    setCategoryFilter('All Categories');
    setStockLevelFilter('All');
    setDateFilter('');
    setSearchQuery('');
  };

  const toggleSelectAllProducts = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(item => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) {
      alert('Pilih setidaknya satu produk untuk tindakan massal.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedProductIds.length} produk terpilih?`)) {
      setProductList(productList.filter(p => !selectedProductIds.includes(p.id)));
      setSelectedProductIds([]);
    }
  };

  // Filtered orders list
  const filteredOrders = orderList.filter(item => {
    const q = (searchQuery || '').toLowerCase();
    const customer = (item.customerName || '').toLowerCase();
    const orderId = (item.id || '').toLowerCase();
    const addr = (item.address || '').toLowerCase();

    const matchSearch = customer.includes(q) || orderId.includes(q) || addr.includes(q);
    const matchStatus = statusFilter === 'All Statuses' || (item.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchPayment = paymentFilter === 'Any Payment' || (item.paymentMethod || '').toLowerCase().includes(paymentFilter.toLowerCase());
    return matchSearch && matchStatus && matchPayment;
  });

  // Filtered products list
  const filteredProducts = productList.filter(item => {
    const q = (searchQuery || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const sku = (item.sku || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    const matchSearch = name.includes(q) || sku.includes(q) || cat.includes(q);
    const matchCategory = categoryFilter === 'All Categories' || cat === categoryFilter.toLowerCase();
    const matchStock = stockLevelFilter === 'All' || 
                       (stockLevelFilter === 'Active' && item.status === 'Active') ||
                       (stockLevelFilter === 'Low Stock' && item.status === 'Low Stock') ||
                       (stockLevelFilter === 'Inactive' && item.status === 'Inactive');
    return matchSearch && matchCategory && matchStock;
  });

  // Filtered voucher list
  const filteredVouchers = voucherList.filter(v => {
    if (voucherFilterTab === 'Active') return v.status === 'Active';
    if (voucherFilterTab === 'Expired') return v.status === 'Expired';
    return true;
  });

  // Filtered review list (Safe against missing/undefined authorName or comment)
  const filteredReviews = reviewList.filter(r => {
    const q = (searchQuery || '').toLowerCase();
    const author = (r.authorName || (r as any).author || '').toLowerCase();
    const prodName = (r.productName || (r as any).dishName || '').toLowerCase();
    const commentText = (r.comment || (r as any).text || '').toLowerCase();

    const matchSearch = author.includes(q) || prodName.includes(q) || commentText.includes(q);
    
    let matchStatus = true;
    if (reviewFilterTab === 'Pending') matchStatus = r.status === 'PENDING REVIEW' || r.status === 'PENDING';
    if (reviewFilterTab === 'Flagged') matchStatus = r.status === 'FLAGGED' || !!r.flaggedReason;
    if (reviewFilterTab === 'Published') matchStatus = r.status === 'PUBLISHED' || !r.status;

    let matchRating = true;
    if (reviewRatingFilter === '5 Stars') matchRating = r.rating === 5;
    if (reviewRatingFilter === '4 Stars') matchRating = r.rating === 4;
    if (reviewRatingFilter === '1-3 Stars') matchRating = r.rating <= 3;

    let matchCategory = true;
    if (reviewCategoryFilter && reviewCategoryFilter !== 'All Categories' && reviewCategoryFilter !== 'Semua Kategori') {
      const prod = productList.find(p => p.name.toLowerCase() === prodName);
      if (prod) {
        matchCategory = prod.category.toLowerCase() === reviewCategoryFilter.toLowerCase();
      } else {
        matchCategory = prodName.includes(reviewCategoryFilter.toLowerCase());
      }
    }

    return matchSearch && matchStatus && matchRating && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans flex selection:bg-[#7A4B29]/10 selection:text-[#7A4B29]">
      
      {/* HIDDEN FILE INPUTS FOR LOCAL GALLERY SELECTION */}
      <input
        type="file"
        ref={heroFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleHeroFileSelected}
      />
      <input
        type="file"
        ref={galleryFileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleGalleryFilesSelected}
      />

      {/* 1. LEFT SIDEBAR (MATCHING REFERENCE IMAGE) */}
      <aside className="w-64 bg-white border-r border-stone-200/70 p-6 flex flex-col justify-between shrink-0 sticky top-0 h-screen hidden md:flex">
        <div className="space-y-8">
          
          {/* Brand Logo Header */}
          <div className="px-2">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[#4A3222] block">
              Nefakky
            </Link>
            <span className="text-[10px] tracking-wider text-stone-400 font-semibold uppercase block mt-0.5">
              Admin Console
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => { setActiveTab('dashboard'); setProductViewMode('list'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#EFECE6] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[1.8]" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setProductViewMode('list'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#EFECE6] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => { setActiveTab('products'); setProductViewMode('list'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-[#EFECE6] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Box className="w-4 h-4 stroke-[1.8]" />
              <span>Products</span>
            </button>

            {/* PROMOTIONS */}
            <button
              onClick={() => { setActiveTab('promotions'); setProductViewMode('list'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === 'promotions'
                  ? 'bg-[#EFECE6] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Tag className="w-4 h-4 stroke-[1.8]" />
              <span>Promotions</span>
            </button>

            {/* REVIEW INTELLIGENCE */}
            <button
              onClick={() => { setActiveTab('reviews'); setProductViewMode('list'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#EFECE6] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <MessageCircle className="w-4 h-4 stroke-[1.8]" />
              <span>Review Intelligence</span>
            </button>

            {/* ANALYTICS */}
            <button
              onClick={() => { setActiveTab('analytics'); setProductViewMode('list'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#EFECE6] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 stroke-[1.8]" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Action Button: + New Product */}
          <div className="pt-2">
            <button
              onClick={() => { setActiveTab('products'); openNewProductEditor(); }}
              className="w-full py-3 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-medium text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Links */}
        <div className="space-y-1 text-xs font-medium border-t border-stone-100 pt-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
              activeTab === 'settings' ? 'bg-[#EFECE6] text-stone-900' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Settings className="w-4 h-4 stroke-[1.8]" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => alert('Dukungan Administrator Bantuan Nefakky telah dihubungi.')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-stone-500 hover:text-stone-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4 stroke-[1.8]" />
            <span>Support</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2"
          >
            <LogOut className="w-4 h-4 stroke-[1.8]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP BAR / HEADER (MATCHING ANALYTICS USER SCREENSHOT FOR ALEX MERCER) */}
        <header className="bg-[#FAF8F5] border-b border-stone-200/50 px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-white/80">
          
          {/* Search Input Bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'analytics'
                  ? "Search analytics..."
                  : activeTab === 'reviews'
                  ? "Search reviews, users, or products..."
                  : activeTab === 'promotions'
                  ? "Search promotions..."
                  : activeTab === 'products' 
                  ? "Search products, SKUs..." 
                  : "Search analytics, orders, products..."
              }
              className="w-full pl-10 pr-4 py-2 bg-[#EFECE6]/80 border border-transparent rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-stone-300 transition-all"
            />
          </div>

          {/* Right Header Utility Controls */}
          <div className="flex items-center gap-5 ml-auto">
            
            {/* Notification Bell */}
            <button 
              className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
              title="Notifikasi Masuk"
            >
              <Bell className="w-4 h-4 stroke-[1.8] text-rose-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full" />
            </button>



          </div>
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* ANALYTICS VIEW (ACTIVE TAB = 'analytics') - MATCHING USER IMAGE */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'analytics' && (
          <main className="p-6 lg:p-10 space-y-10 max-w-7xl animate-fade-in">
            
            {/* TITLE & TOP ACTION CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C] tracking-tight">
                  Sales Overview
                </h1>
                <p className="text-xs text-stone-500 font-light mt-1">
                  Comprehensive analysis of your store's performance.
                </p>
              </div>

              {/* Right Action Controls: Timeframe Filter Dropdown & Export CSV */}
              <div className="flex items-center gap-3 shrink-0">
                
                {/* Timeframe Dropdown */}
                <div className="relative bg-white border border-stone-200/80 rounded-2xl px-4 py-2.5 shadow-sm">
                  <select
                    value={analyticsTimeframe}
                    onChange={(e) => setAnalyticsTimeframe(e.target.value)}
                    className="appearance-none bg-transparent text-xs font-semibold text-stone-700 focus:outline-none pr-6 cursor-pointer"
                  >
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="Year to Date">Year to Date</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Export CSV Button */}
                <button
                  onClick={() => alert('Laporan performa penjualan CSV berhasil diunduh.')}
                  className="px-5 py-2.5 bg-[#4A3C31] hover:bg-stone-800 text-white font-semibold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-white/90" />
                  <span>Export CSV</span>
                </button>

              </div>
            </div>

            {/* 5 METRIC CARDS ROW (MATCHING USER SCREENSHOT) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              
              {/* Card 1: Revenue */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    +12.5%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Revenue
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    $142,850.00
                  </p>
                </div>
              </div>

              {/* Card 2: Orders */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    +8.2%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Orders
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    1,482
                  </p>
                </div>
              </div>

              {/* Card 3: Profit */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    +10.1%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Profit
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    $42,300.00
                  </p>
                </div>
              </div>

              {/* Card 4: Visitors */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    +15.3%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Visitors
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    24.5k
                  </p>
                </div>
              </div>

              {/* Card 5: Conv. Rate */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Target className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    +0.4%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Conv. Rate
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    3.2%
                  </p>
                </div>
              </div>

            </div>

            {/* CHARTS GRID (2 COLUMNS: 65% / 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT CARD: DAILY REVENUE BAR CHART */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm flex flex-col justify-between space-y-8">
                
                {/* Header Title & Legends */}
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-semibold text-stone-900 tracking-tight">
                    Daily Revenue
                  </h3>

                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8A6337]" />
                      <span>Current</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <span>Previous</span>
                    </div>
                  </div>
                </div>

                {/* 6 Step Bar Chart Visual */}
                <div className="w-full h-64 relative flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-stone-200/70">
                  <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: '48%' }} />
                  <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: '58%' }} />
                  <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: '52%' }} />
                  <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: '72%' }} />
                  <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: '68%' }} />
                  <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: '85%' }} />
                  <div className="w-full bg-[#EAE4D9] rounded-t border-t-2 border-[#613A1F] transition-all hover:bg-amber-100/80" style={{ height: '96%' }} />
                </div>

                {/* X-Axis Labels */}
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider px-2">
                  <span>DAY 01</span>
                  <span>DAY 15</span>
                  <span>TODAY</span>
                </div>

              </div>

              {/* RIGHT CARD: SALES BY PAYMENT DONUT CHART */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm flex flex-col justify-between space-y-6">
                
                <h3 className="font-serif text-xl font-semibold text-stone-900 tracking-tight">
                  Sales by Payment
                </h3>

                {/* Donut Ring Visual */}
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-4">
                  <div className="w-full h-full rounded-full border-[18px] border-[#613A1F] border-t-[#8A6337] border-l-[#A3805B] shadow-inner" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-stone-400 font-medium block">Total</span>
                    <span className="font-serif text-3xl font-bold text-stone-900 block leading-none mt-0.5">
                      $142k
                    </span>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5">
                  <div className="bg-[#FAF8F5] border border-stone-200/60 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#613A1F]" />
                      <span className="font-semibold text-stone-800">Visa</span>
                    </div>
                    <span className="font-bold text-stone-900">45%</span>
                  </div>

                  <div className="bg-[#FAF8F5] border border-stone-200/60 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                      <span className="font-semibold text-stone-800">Apple Pay</span>
                    </div>
                    <span className="font-bold text-stone-900">28%</span>
                  </div>

                  <div className="bg-[#FAF8F5] border border-stone-200/60 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <span className="font-semibold text-stone-800">Mastercard</span>
                    </div>
                    <span className="font-bold text-stone-900">18%</span>
                  </div>
                </div>

              </div>

            </div>

            {/* BOTTOM SECTION: BEST SELLING PRODUCTS & TOP CATEGORIES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT CARD: BEST SELLING PRODUCTS */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-semibold text-stone-900 tracking-tight">
                    Best Selling Products
                  </h3>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-semibold text-[#8A6337] hover:text-[#613A1F] transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  
                  {/* Product 1 */}
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                        <Image
                          src="https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=300&q=80"
                          alt="Rustic Sourdough"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-xs">Rustic Sourdough</h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">Bakery & Breads</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-xs text-stone-900 block">$3,420</span>
                      <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">+12% vol</span>
                    </div>
                  </div>

                  {/* Product 2 */}
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                        <Image
                          src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80"
                          alt="Black Truffle Oil"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-xs">Black Truffle Oil</h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">Oils & Infusions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-xs text-stone-900 block">$2,890</span>
                      <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">+5% vol</span>
                    </div>
                  </div>

                  {/* Product 3 */}
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                        <Image
                          src="https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=300&q=80"
                          alt="Wildflower Honey"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-xs">Wildflower Honey</h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">Sweeteners</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-xs text-stone-900 block">$2,110</span>
                      <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">+18% vol</span>
                    </div>
                  </div>

                  {/* Product 4 */}
                  <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                        <Image
                          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80"
                          alt="Mediterranean Blend"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 text-xs">Mediterranean Blend</h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">Spices & Herbs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-xs text-stone-900 block">$1,950</span>
                      <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">+3% vol</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT CARD: TOP CATEGORIES */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm space-y-6">
                <h3 className="font-serif text-xl font-semibold text-stone-900 tracking-tight">
                  Top Categories
                </h3>

                <div className="space-y-6 pt-2">
                  
                  {/* Category 1: Bakery */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                      <span>Bakery</span>
                      <span>72%</span>
                    </div>
                    <div className="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#613A1F] rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>

                  {/* Category 2: Oils & Vinegar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                      <span>Oils & Vinegar</span>
                      <span>58%</span>
                    </div>
                    <div className="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A6337] rounded-full" style={{ width: '58%' }} />
                    </div>
                  </div>

                  {/* Category 3: Spices */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                      <span>Spices</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden">
                      <div className="h-full bg-stone-500 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>

                  {/* Category 4: Sweets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                      <span>Sweets</span>
                      <span>29%</span>
                    </div>
                    <div className="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden">
                      <div className="h-full bg-stone-300 rounded-full" style={{ width: '29%' }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* REVIEW INTELLIGENCE VIEW (ACTIVE TAB = 'reviews') */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'reviews' && (
          <main className="p-6 lg:p-10 space-y-8 max-w-7xl animate-fade-in">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C] tracking-tight">
                Review Intelligence
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-3">
                <span className="text-xs text-stone-500 font-medium block">
                  Average Rating
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    4.8
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 font-medium">
                  +0.2 from last month
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-3">
                <span className="text-xs text-stone-500 font-medium block">
                  Total Reviews
                </span>
                <p className="font-serif text-3xl font-bold text-stone-900 leading-none">
                  2,482
                </p>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span>📈</span>
                  <span>12% growth</span>
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-3">
                <span className="text-xs text-stone-500 font-medium block">
                  Positive Reviews
                </span>
                <p className="font-serif text-3xl font-bold text-stone-900 leading-none">
                  94%
                </p>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 w-[94%] rounded-full" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-3">
                <span className="text-xs text-stone-500 font-medium block">
                  Negative Reviews
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    2%
                  </span>
                  <AlertTriangle className="w-4 h-4 text-rose-600 fill-rose-100 shrink-0" />
                </div>
                <p className="text-[11px] text-rose-600 font-medium">
                  3 alerts pending
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
                  Review Moderation
                </h2>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-[#EFECE6] p-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                    {(['All', 'Pending', 'Flagged', 'Published'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setReviewFilterTab(tab)}
                        className={`px-4 py-1.5 rounded-full transition-all ${
                          reviewFilterTab === tab
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="relative bg-[#FAF8F5] border border-stone-200/80 rounded-2xl px-4 py-2 text-xs font-medium flex items-center gap-2 text-stone-700">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">RATING:</span>
                    <select
                      value={reviewRatingFilter}
                      onChange={(e) => setReviewRatingFilter(e.target.value)}
                      className="bg-transparent font-semibold focus:outline-none cursor-pointer pr-4"
                    >
                      <option value="All Ratings">All Ratings</option>
                      <option value="5 Stars">5 Stars</option>
                      <option value="4 Stars">4 Stars</option>
                      <option value="1-3 Stars">1-3 Stars</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 pointer-events-none absolute right-3" />
                  </div>

                  <div className="relative bg-[#FAF8F5] border border-stone-200/80 rounded-2xl px-4 py-2 text-xs font-medium flex items-center gap-2 text-stone-700">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">CATEGORY:</span>
                    <select
                      value={reviewCategoryFilter}
                      onChange={(e) => setReviewCategoryFilter(e.target.value)}
                      className="bg-transparent font-semibold focus:outline-none cursor-pointer pr-4"
                    >
                      <option value="All Categories">Semua Kategori</option>
                      <option value="Makanan Berat">Makanan Berat</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Minuman">Minuman</option>
                      <option value="Snack">Snack</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Paket Hemat">Paket Hemat</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 pointer-events-none absolute right-3" />
                  </div>
                </div>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-4">
                  <div className="w-16 h-16 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto text-stone-400 border border-stone-200/60">
                    <MessageSquare className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-stone-800">
                    Belum Ada Ulasan untuk Kategori Ini
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto font-light leading-relaxed">
                    Belum ada ulasan atau komentar dari pengguna untuk kategori makanan <strong className="font-semibold text-stone-700">"{reviewCategoryFilter}"</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`rounded-3xl p-6 sm:p-8 space-y-5 transition-all relative overflow-hidden ${
                      rev.flaggedReason || rev.status === 'PENDING REVIEW'
                        ? 'bg-white border-2 border-rose-200 shadow-sm'
                        : 'bg-[#FAF8F5]/60 border border-stone-200/80 shadow-xs hover:shadow-sm'
                    }`}
                  >
                    {rev.flaggedReason && (
                      <div className="absolute top-0 right-0 bg-rose-700 text-white text-[9px] font-bold tracking-widest uppercase px-4 py-1 rounded-bl-xl shadow-xs">
                        {rev.flaggedReason}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-stone-200 shadow-xs">
                          <Image src={rev.authorAvatar || rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={rev.authorName} fill unoptimized className="object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-stone-900 text-sm">{rev.authorName}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                              rev.authorBadge === 'PLATINUM'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : rev.authorBadge === 'GOLD'
                                ? 'bg-amber-50 text-amber-800 border border-amber-100'
                                : 'bg-stone-200 text-stone-700'
                            }`}>
                              {rev.authorBadge}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-3 bg-[#FAF8F5] border border-stone-200/70 p-2.5 rounded-2xl max-w-xs">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                              <Image src={rev.productImage || '/images/wagyu_bowl.png'} alt={rev.productName || 'Product'} fill unoptimized className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] tracking-wider text-stone-400 font-bold uppercase block">PRODUCT</span>
                              <span className="font-semibold text-xs text-stone-800 truncate block">{rev.productName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-1.5 pt-1">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-400 font-medium">{rev.date}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                            rev.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}>
                            {rev.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="font-serif text-sm sm:text-base text-stone-800 italic leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>

                    {rev.photos && rev.photos.length > 0 && (
                      <div className="flex items-center gap-3 pt-2">
                        {rev.photos.map((photoUrl, pIdx) => (
                          <div key={pIdx} className="relative w-28 h-28 rounded-2xl overflow-hidden border border-stone-200 shadow-xs">
                            <Image src={photoUrl} alt={`Review photo ${pIdx + 1}`} fill unoptimized className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-stone-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {rev.status === 'PENDING REVIEW' || rev.flaggedReason ? (
                          <>
                            <button
                              onClick={() => handleInvestigateReview(rev.id)}
                              className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-full transition-colors"
                            >
                              Investigate
                            </button>
                            <button
                              onClick={() => handleRejectReview(rev.id)}
                              className="px-5 py-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-600 font-semibold text-xs rounded-full transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setReplyingReviewId(rev.id)}
                            className="px-5 py-2 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-semibold text-xs rounded-full shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-stone-400">
                        <button
                          onClick={() => handleToggleHideReview(rev.id)}
                          className="p-2 hover:text-stone-700 transition-colors"
                        >
                          {rev.isHidden ? <EyeOff className="w-4 h-4 text-rose-500" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-2 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleTogglePinReview(rev.id)}
                          className={`p-2 transition-colors ${rev.isPinned ? 'text-amber-600' : 'hover:text-stone-700'}`}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PROMOTION MANAGEMENT VIEW (ACTIVE TAB = 'promotions') */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'promotions' && (
          <main className="p-6 lg:p-10 space-y-10 max-w-7xl animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C] tracking-tight">
                  Promotion Management
                </h1>
                <p className="text-xs text-stone-500 font-light mt-1">
                  Design and manage high-impact campaigns for Nefakky Marketplace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setNewPromoTag('FLASH SALE');
                    setNewPromoType('Fixed Amount');
                    setShowCreatePromoModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#F5F2ED] hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-full border border-stone-200/80 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-stone-600" />
                  <span>New Flash Sale</span>
                </button>

                <button
                  onClick={() => {
                    setNewPromoTag('COUPON');
                    setNewPromoType('Percentage');
                    setNewPromoVoucherCode(`PROMO${Math.floor(100 + Math.random() * 900)}`);
                    setShowCreatePromoModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#F5F2ED] hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-full border border-stone-200/80 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Ticket className="w-3.5 h-3.5 text-stone-600" />
                  <span>Generate Coupon</span>
                </button>

                <button
                  onClick={() => {
                    setNewPromoTag('20% OFF');
                    setShowCreatePromoModal(true);
                  }}
                  className="px-6 py-2.5 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-semibold text-xs rounded-full shadow-md transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Promotion</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Tag className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-0.5">
                    📈 +12%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Active Promotions
                  </span>
                  <p className="font-serif text-3xl font-bold text-stone-900 mt-1">
                    24
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Ticket className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#8A6337] flex items-center gap-0.5">
                    📈 +8.4k
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Total Redemptions
                  </span>
                  <p className="font-serif text-3xl font-bold text-stone-900 mt-1">
                    12,840
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#8A6337] flex items-center gap-0.5">
                    📈 +22%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Revenue from Offers
                  </span>
                  <p className="font-serif text-3xl font-bold text-stone-900 mt-1">
                    Rp 45.2jt
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Percent className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-medium text-stone-400">
                    Limit: 5,000
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Available Vouchers
                  </span>
                  <p className="font-serif text-3xl font-bold text-stone-900 mt-1">
                    1,450
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
                  Current Promotions
                </h2>

                <div className="flex items-center gap-1 bg-white p-1 border border-stone-200/80 rounded-xl shadow-xs">
                  <button className="p-1.5 bg-[#EFECE6] text-stone-800 rounded-lg">
                    <Grid className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg">
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {promotionList.map((promo) => (
                  <div 
                    key={promo.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-4 flex flex-col justify-between group hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-100">
                      <Image
                        src={promo.image}
                        alt={promo.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <span className="absolute top-3 left-3 px-3 py-1 bg-[#613A1F]/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full tracking-wider uppercase shadow-xs">
                        {promo.tag}
                      </span>

                      <span className={`absolute top-3 right-3 px-3 py-1 backdrop-blur-sm text-[10px] font-bold rounded-full shadow-xs flex items-center gap-1 ${
                        promo.badge === 'Active'
                          ? 'bg-emerald-500/90 text-white'
                          : promo.badge === 'Scheduled'
                          ? 'bg-stone-700/80 text-white'
                          : 'bg-rose-500/90 text-white'
                      }`}>
                        <span>●</span>
                        <span>{promo.badge}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#613A1F] transition-colors">
                        {promo.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-1 font-light">
                        {promo.subtitle}
                      </p>
                    </div>

                    <div className="bg-[#FAF8F5] border border-stone-200/60 rounded-2xl p-3.5 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[9px] tracking-wider text-stone-400 font-bold uppercase block mb-1">
                          DURATION
                        </span>
                        <span className="font-medium text-stone-800 text-[11px]">
                          {promo.duration}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] tracking-wider text-stone-400 font-bold uppercase block mb-1">
                          TYPE
                        </span>
                        <span className="font-medium text-stone-800 text-[11px]">
                          {promo.type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="font-medium text-[11px]">Usage</span>
                        <span className="font-semibold text-stone-800 text-[11px]">
                          {promo.usedCount}/{promo.totalLimit} used
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#613A1F] rounded-full transition-all"
                          style={{ width: `${Math.min(100, (promo.usedCount / promo.totalLimit) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => alert(`Edit promo "${promo.title}"`)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicatePromo(promo)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePromo(promo.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-400 font-medium">Active</span>
                        <button
                          type="button"
                          onClick={() => togglePromoActive(promo.id)}
                          className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                            promo.isActive ? 'bg-[#613A1F]' : 'bg-stone-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            promo.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
                  Voucher & Coupon Management
                </h2>

                <div className="flex items-center gap-4">
                  <div className="bg-[#EFECE6] p-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                    {(['All', 'Active', 'Expired'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setVoucherFilterTab(tab)}
                        className={`px-4 py-1.5 rounded-full transition-all ${
                          voucherFilterTab === tab
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => alert('Voucher data CSV exported successfully.')}
                    className="text-xs font-semibold text-[#8A6337] hover:text-[#613A1F] transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200/70 shadow-sm overflow-hidden space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                      <tr>
                        <th className="py-4 px-6">VOUCHER CODE</th>
                        <th className="py-4 px-4">PROMOTION NAME</th>
                        <th className="py-4 px-4 text-center">TYPE</th>
                        <th className="py-4 px-4">MIN. SPEND</th>
                        <th className="py-4 px-4">REDEMPTIONS</th>
                        <th className="py-4 px-4">EXPIRY</th>
                        <th className="py-4 px-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {filteredVouchers.map((vouch) => (
                        <tr key={vouch.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-5 px-6">
                            <span className="inline-block px-3 py-1 bg-[#FFF9F3] border border-amber-200/80 rounded-lg text-amber-900 font-mono font-bold text-xs shadow-2xs">
                              {vouch.code}
                            </span>
                          </td>

                          <td className="py-5 px-4 font-semibold text-stone-900">
                            {vouch.name}
                          </td>

                          <td className="py-5 px-4 text-center">
                            <span className="inline-block px-3.5 py-1 bg-stone-100 text-stone-700 rounded-full text-[11px] font-medium">
                              {vouch.type}
                            </span>
                          </td>

                          <td className="py-5 px-4 font-medium text-stone-800">
                            Rp {(vouch.minSpend || 0).toLocaleString('id-ID')}
                          </td>

                          <td className="py-5 px-4 font-medium text-stone-800">
                            {vouch.redemptions}
                          </td>

                          <td className="py-5 px-4 text-stone-500 font-light">
                            {vouch.expiry}
                          </td>

                          <td className="py-5 px-6 text-right">
                            <button className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PRODUCT MANAGEMENT VIEW (ACTIVE TAB = 'products') */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'products' && (
          <main className="p-6 lg:p-10 space-y-8 max-w-7xl animate-fade-in">
            {/* SUB-VIEW 1: PRODUCT LIST TABLE */}
            {productViewMode === 'list' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#2D231C] tracking-tight">
                      Product Management
                    </h1>
                    <p className="text-xs text-stone-500 font-light mt-1">
                      Curate and manage your artisanal inventory.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => alert('Fitur Impor Produk CSV/Excel Aktif!')}
                      className="px-5 py-2.5 bg-white border border-stone-200/80 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-stone-500" />
                      <span>Import</span>
                    </button>

                    <button
                      onClick={() => alert('Laporan Inventaris Produk CSV berhasil diunduh.')}
                      className="px-5 py-2.5 bg-white border border-stone-200/80 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-stone-500" />
                      <span>Export</span>
                    </button>

                    <button
                      onClick={openNewProductEditor}
                      className="px-6 py-2.5 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-semibold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="appearance-none px-5 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-semibold text-stone-700 hover:border-stone-300 focus:outline-none focus:border-[#613A1F] pr-9 shadow-sm cursor-pointer"
                      >
                        <option value="All Categories">All Categories</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Pantry & Oils">Pantry & Oils</option>
                        <option value="Spreads">Spreads</option>
                        <option value="Spices">Spices</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={stockLevelFilter}
                        onChange={(e) => setStockLevelFilter(e.target.value)}
                        className="appearance-none px-5 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-semibold text-stone-700 hover:border-stone-300 focus:outline-none focus:border-[#613A1F] pr-9 shadow-sm cursor-pointer"
                      >
                        <option value="All">Stock Level: All</option>
                        <option value="Active">Active Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Inactive">Inactive (0 Units)</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500 pointer-events-none" />
                    </div>

                    <button
                      onClick={resetFilters}
                      className="px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <Filter className="w-3.5 h-3.5 text-stone-500" />
                      <span>More Filters</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                    <span className="text-xs text-stone-400 font-medium">Bulk Actions:</span>
                    <button
                      onClick={handleBulkDelete}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                      title="Hapus Produk Terpilih"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-stone-200/70 shadow-sm overflow-hidden space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                        <tr>
                          <th className="py-4 px-5 text-center w-10">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                              onChange={toggleSelectAllProducts}
                              className="rounded border-stone-300 text-[#613A1F] focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-4 px-4">PRODUCT</th>
                          <th className="py-4 px-4 text-center">CATEGORY</th>
                          <th className="py-4 px-4">PRICE</th>
                          <th className="py-4 px-4">STOCK</th>
                          <th className="py-4 px-4 text-center">STATUS</th>
                          <th className="py-4 px-4 text-center">RATING</th>
                          <th className="py-4 px-6 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {filteredProducts.map((prod) => (
                          <tr 
                            key={prod.id} 
                            className="hover:bg-stone-50/70 transition-colors cursor-pointer group"
                            onClick={() => openExistingProductEditor(prod)}
                          >
                            <td className="py-5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedProductIds.includes(prod.id)}
                                onChange={() => toggleSelectProduct(prod.id)}
                                className="rounded border-stone-300 text-[#613A1F] focus:ring-0 cursor-pointer"
                              />
                            </td>

                            <td className="py-5 px-4">
                              <div className="flex items-center gap-3.5">
                                <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                                  <Image
                                    src={prod.image}
                                    alt={prod.name}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-stone-900 text-xs group-hover:text-[#613A1F] transition-colors">
                                    {prod.name}
                                  </h4>
                                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                                    {prod.sku}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-5 px-4 text-center">
                              <span className="inline-block px-3.5 py-1.5 bg-[#FAF8F5] text-stone-600 rounded-xl text-[11px] font-medium border border-stone-200/50">
                                {prod.category}
                              </span>
                            </td>

                            <td className="py-5 px-4 font-semibold text-stone-900 text-xs">
                              ${prod.price.toFixed(2)}
                            </td>

                            <td className="py-5 px-4">
                              <div className="space-y-1">
                                <span className={`text-xs font-semibold block ${
                                  prod.stock < 10 ? 'text-red-600 font-bold' : 'text-stone-800'
                                }`}>
                                  {prod.stock} units
                                </span>
                                {prod.stock < 10 && prod.stock > 0 && (
                                  <div className="w-16 h-1 bg-red-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-1/3 rounded-full" />
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-5 px-4 text-center">
                              {prod.status === 'Active' && (
                                <span className="inline-block px-3.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                                  ● Active
                                </span>
                              )}
                              {prod.status === 'Low Stock' && (
                                <span className="inline-block px-3.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-bold">
                                  ● Low Stock
                                </span>
                              )}
                              {prod.status === 'Inactive' && (
                                <span className="inline-block px-3.5 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold">
                                  ● Inactive
                                </span>
                              )}
                            </td>

                            <td className="py-5 px-4 text-center">
                              <div className="flex items-center justify-center gap-0.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= Math.floor(prod.rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-stone-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </td>

                            <td className="py-5 px-6 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openExistingProductEditor(prod); }}
                                className="px-3 py-1 bg-stone-100 hover:bg-[#613A1F] hover:text-white text-stone-700 text-[11px] font-semibold rounded-lg transition-colors"
                              >
                                Edit Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* SUB-VIEW 2: RICH PRODUCT EDITOR */}
            {productViewMode === 'editor' && (
              <form onSubmit={handleSaveProductEditor} className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/50">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setProductViewMode('list')}
                      className="p-2 bg-white border border-stone-200/80 hover:bg-stone-100 text-stone-700 rounded-full transition-colors shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D231C] tracking-tight">
                        {editingProductId ? `Edit: ${editName}` : 'Add New Product'}
                      </h1>
                      <p className="text-xs text-stone-400">
                        Product Management / {editingProductId ? 'Edit Details' : 'Create Product'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setProductViewMode('list')}
                      className="px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs rounded-full transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-semibold text-xs rounded-full shadow-md transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Product Details</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-2xl font-semibold text-stone-900">
                            Visual Identity
                          </h3>
                          <p className="text-xs text-stone-400 mt-1">
                            Manage high-resolution imagery for marketing assets.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => heroFileInputRef.current?.click()}
                            className="px-4 py-2 bg-[#5C544B] hover:bg-stone-800 text-white rounded-full text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Upload New</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const newUrl = prompt('Atau Tempel URL Gambar Online:', editHeroImage);
                              if (newUrl) setEditHeroImage(newUrl);
                            }}
                            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm bg-stone-100 group flex items-center justify-center">
                        {editHeroImage ? (
                          <Image
                            src={editHeroImage}
                            alt="Visual Hero Product"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-stone-400 gap-2 p-6 text-center">
                            <Camera className="w-10 h-10 stroke-[1.5]" />
                            <span className="text-xs font-semibold text-stone-600">Belum Ada Foto Produk</span>
                            <span className="text-[11px] text-stone-400">Klik "Pilih Dari Galeri" atau upload foto produk di atas</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => heroFileInputRef.current?.click()}
                            className="px-4 py-2 bg-white text-stone-900 text-xs font-semibold rounded-full shadow-lg hover:bg-stone-100 transition-all flex items-center gap-1.5"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>Pilih Dari Galeri</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {editGalleryImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative h-32 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group">
                            <Image
                              src={imgUrl}
                              alt={`Gallery thumbnail ${idx + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setEditGalleryImages(editGalleryImages.filter((_, i) => i !== idx))}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <div
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="h-32 border-2 border-dashed border-stone-200/90 rounded-2xl flex flex-col items-center justify-center p-4 bg-white hover:bg-stone-50 transition-colors cursor-pointer text-stone-400 hover:text-stone-600 gap-1.5 text-center group"
                        >
                          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium">Tambah Galeri</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm space-y-6">
                      <h3 className="font-serif text-2xl font-semibold text-stone-900">
                        Artisanal Specifications
                      </h3>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-stone-700">
                          Ingredients List
                        </label>
                        <div className="bg-[#FAF8F5] border border-stone-200/70 rounded-2xl p-4 focus-within:border-[#613A1F] transition-colors">
                          <textarea
                            rows={3}
                            value={editIngredients}
                            onChange={(e) => setEditIngredients(e.target.value)}
                            placeholder="Tuliskan daftar bahan-bahan utama hidangan..."
                            className="w-full bg-transparent text-xs text-stone-800 leading-relaxed focus:outline-none resize-none placeholder-stone-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-stone-700">
                            Cooking / Usage Advice
                          </label>
                          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl shadow-sm focus-within:border-[#613A1F]">
                            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                            <input
                              type="text"
                              value={editUsageAdvice}
                              onChange={(e) => setEditUsageAdvice(e.target.value)}
                              placeholder="cth: Santap selagi hangat"
                              className="w-full text-xs text-stone-800 focus:outline-none placeholder-stone-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-stone-700">
                            Origin Region
                          </label>
                          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl shadow-sm focus-within:border-[#613A1F]">
                            <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                            <input
                              type="text"
                              value={editOrigin}
                              onChange={(e) => setEditOrigin(e.target.value)}
                              placeholder="cth: Jakarta, Indonesia"
                              className="w-full text-xs text-stone-800 focus:outline-none placeholder-stone-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF8F5] border border-stone-200/70 rounded-2xl p-5 space-y-3">
                        <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                          NUTRITION FACTS (PER 100G)
                        </span>

                        <div className="grid grid-cols-4 gap-2 text-center pt-1">
                          <div className="p-2">
                            <input
                              type="text"
                              value={editCalories}
                              onChange={(e) => setEditCalories(e.target.value)}
                              placeholder="0"
                              className="font-serif text-xl sm:text-2xl font-bold text-[#613A1F] bg-transparent text-center w-full focus:outline-none placeholder-stone-300"
                            />
                            <span className="text-[10px] text-stone-400 font-medium block mt-0.5">kcal</span>
                          </div>

                          <div className="p-2 border-l border-stone-200/60">
                            <input
                              type="text"
                              value={editFat}
                              onChange={(e) => setEditFat(e.target.value)}
                              placeholder="0g"
                              className="font-serif text-xl sm:text-2xl font-bold text-[#613A1F] bg-transparent text-center w-full focus:outline-none placeholder-stone-300"
                            />
                            <span className="text-[10px] text-stone-400 font-medium block mt-0.5">Fat</span>
                          </div>

                          <div className="p-2 border-l border-stone-200/60">
                            <input
                              type="text"
                              value={editSugar}
                              onChange={(e) => setEditSugar(e.target.value)}
                              placeholder="0g"
                              className="font-serif text-xl sm:text-2xl font-bold text-[#613A1F] bg-transparent text-center w-full focus:outline-none placeholder-stone-300"
                            />
                            <span className="text-[10px] text-stone-400 font-medium block mt-0.5">Sugar</span>
                          </div>

                          <div className="p-2 border-l border-stone-200/60">
                            <input
                              type="text"
                              value={editSatFat}
                              onChange={(e) => setEditSatFat(e.target.value)}
                              placeholder="0g"
                              className="font-serif text-xl sm:text-2xl font-bold text-[#613A1F] bg-transparent text-center w-full focus:outline-none placeholder-stone-300"
                            />
                            <span className="text-[10px] text-stone-400 font-medium block mt-0.5">Sat. Fat</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm space-y-5">
                      <h3 className="font-serif text-2xl font-semibold text-stone-900">
                        General Information
                      </h3>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-stone-700">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Masukkan nama produk baru..."
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] shadow-sm placeholder-stone-400"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-stone-700">
                            SKU Code
                          </label>
                          <input
                            type="text"
                            value={editSKU}
                            onChange={(e) => setEditSKU(e.target.value)}
                            placeholder="cth: SKU-9812-V"
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] shadow-sm placeholder-stone-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-stone-700">
                            Category
                          </label>
                          <div className="relative">
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full appearance-none px-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] pr-8 shadow-sm cursor-pointer"
                            >
                              <option value="Makanan Berat">Makanan Berat</option>
                              <option value="Makanan">Makanan</option>
                              <option value="Minuman">Minuman</option>
                              <option value="Snack">Snack</option>
                              <option value="Dessert">Dessert</option>
                              <option value="Paket Hemat">Paket Hemat</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-stone-700">
                            Base Price (Rp)
                          </label>
                          <input
                            type="number"
                            value={editBasePrice}
                            onChange={(e) => setEditBasePrice(e.target.value)}
                            placeholder="cth: 55000"
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] shadow-sm placeholder-stone-400"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-stone-700">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            value={editDiscount}
                            onChange={(e) => setEditDiscount(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm space-y-6">
                      <h3 className="font-serif text-2xl font-semibold text-stone-900">
                        Inventory & Status
                      </h3>

                      <div className="bg-[#FAF8F5] border border-stone-200/70 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-xs text-stone-900 block">
                            Product Visibility
                          </span>
                          <span className="text-[11px] text-stone-400">
                            Live on marketplace
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditVisibility(!editVisibility)}
                          className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                            editVisibility ? 'bg-[#613A1F]' : 'bg-stone-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            editVisibility ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-700">
                            Current Stock
                          </span>
                          <span className="px-3.5 py-1 bg-amber-100/70 text-amber-900 font-bold rounded-full text-xs">
                            {editStock} Units
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-full accent-[#613A1F] cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-stone-400 font-medium pt-1">
                            <span>Out of Stock</span>
                            <span>Low Stock (20)</span>
                            <span>In Stock</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium">
                            <BarChart3 className="w-3.5 h-3.5 text-stone-400" />
                            <span>Last 30 days performance</span>
                          </div>
                          <div className="mt-2">
                            <span className="font-serif text-2xl font-bold text-stone-900 block leading-none">
                              842
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium block mt-1">
                              Units Sold
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end gap-1 h-12">
                          <div className="w-2 bg-amber-200 h-4 rounded-t" />
                          <div className="w-2 bg-amber-300 h-6 rounded-t" />
                          <div className="w-2 bg-amber-400 h-8 rounded-t" />
                          <div className="w-2 bg-[#613A1F] h-11 rounded-t" />
                          <div className="w-2 bg-[#8A6337] h-9 rounded-t" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase">
                          REVISION HISTORY
                        </span>
                        <button type="button" className="text-stone-400 hover:text-stone-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                            <Edit3 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-stone-900 block">
                              Price Updated
                            </span>
                            <span className="text-[10px] text-stone-400">
                              By Admin Jane • 2h ago
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-stone-900 block">
                              Main Hero Updated
                            </span>
                            <span className="text-[10px] text-stone-400">
                              By Studio X • Yesterday
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* DASHBOARD VIEW (ACTIVE TAB = 'dashboard') */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'dashboard' && (
          <main className="p-6 lg:p-10 space-y-8 max-w-7xl animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#2D231C] tracking-tight">
                  Good Morning, Administrator
                </h1>
                <p className="text-xs text-stone-500 font-light mt-1">
                  Today is Tuesday, July 28, 2026
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white border border-stone-200/80 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-full shadow-sm transition-all flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>This Month</span>
                </button>
                <button 
                  onClick={() => alert('Laporan ekspor data CSV siap diunduh.')}
                  className="px-4 py-2 bg-white border border-stone-200/80 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-full shadow-sm transition-all flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +12.5%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                      TOTAL REVENUE
                    </span>
                    <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      $124,500.00
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +8%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                      TODAY'S ORDERS
                    </span>
                    <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      42
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +24
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                      ACTIVE CUSTOMERS
                    </span>
                    <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      1,240
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                      <Box className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                      Static
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                      TOTAL PRODUCTS
                    </span>
                    <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      850
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-stone-900">Revenue & Sales</h3>
                    <p className="text-xs text-stone-400 mt-0.5">Comparison between direct and affiliate sales</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8A6337]" />
                      <span>Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <span>Sales</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-52 relative flex items-end pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <path d="M 0 130 Q 70 120 120 90 T 250 110 T 370 40 T 500 100" fill="none" stroke="#E5E0D8" strokeWidth="2.5" />
                    <path d="M 0 115 Q 70 100 120 70 T 250 90 T 370 20 T 500 80" fill="none" stroke="#8A6337" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm flex flex-col items-center justify-between space-y-6">
                <div className="text-center">
                  <h3 className="font-serif text-xl font-semibold text-stone-900">Category Dist.</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Product performance by segment</p>
                </div>

                <div className="relative w-44 h-44 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#F5F2EC" strokeWidth="12" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#5C544B" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="71" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#613A1F" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="110" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-serif text-2xl font-bold text-stone-900 leading-none">85%</span>
                    <span className="text-[9px] text-stone-400 font-semibold tracking-wider uppercase mt-1">EFFICIENCY</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-stone-600 w-full pt-2 border-t border-stone-100">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#613A1F]" />
                      <span className="font-semibold text-stone-800">Artisanal</span>
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">55% Share</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5C544B]" />
                      <span className="font-semibold text-stone-800">Standard</span>
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">30% Share</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* ORDER MANAGEMENT VIEW (ACTIVE TAB = 'orders') */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'orders' && (
          <main className="p-6 lg:p-10 space-y-8 max-w-7xl animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#2D231C] tracking-tight">
                  Order Management
                </h1>
                <p className="text-xs text-stone-500 font-light mt-1">
                  Real-time logistics and fulfillment tracking.
                </p>
              </div>

              <button
                onClick={() => setShowCreateOrderModal(true)}
                className="px-5 py-3 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-medium text-xs rounded-full shadow-md transition-all flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Manual Order</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Receipt className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    +12%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    Total Orders
                  </span>
                  <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                    1,482
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Clock className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    Pending
                  </span>
                  <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                    24
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Truck className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full">
                    In Delivery
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    In Delivery
                  </span>
                  <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                    18
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                    Daily
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    Completed Today
                  </span>
                  <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                    116
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto flex-1 max-w-3xl">
                <div>
                  <label className="block text-[10px] tracking-wider text-stone-400 font-bold uppercase mb-1.5">
                    ORDER STATUS
                  </label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] pr-8"
                    >
                      <option value="All Statuses">All Statuses</option>
                      <option value="SHIPPING">Shipping</option>
                      <option value="COOKING">Cooking</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-wider text-stone-400 font-bold uppercase mb-1.5">
                    DATE RANGE
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-wider text-stone-400 font-bold uppercase mb-1.5">
                    PAYMENT METHOD
                  </label>
                  <div className="relative">
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] pr-8"
                    >
                      <option value="Any Payment">Any Payment</option>
                      <option value="Visa">Visa</option>
                      <option value="COD">COD</option>
                      <option value="Apple Pay">Apple Pay</option>
                      <option value="QRIS">QRIS</option>
                      <option value="Transfer Bank">Transfer Bank</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-[#8A6337] hover:text-[#613A1F] transition-colors shrink-0 pt-3 md:pt-0"
              >
                Reset Filters
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/70 shadow-sm overflow-hidden space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                    <tr>
                      <th className="py-4 px-6">ORDER ID</th>
                      <th className="py-4 px-4">CUSTOMER</th>
                      <th className="py-4 px-4">ADDRESS</th>
                      <th className="py-4 px-4 text-center">ITEMS</th>
                      <th className="py-4 px-4">PAYMENT</th>
                      <th className="py-4 px-4 text-center">DELIVERY</th>
                      <th className="py-4 px-4 text-center">STATUS</th>
                      <th className="py-4 px-6 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-5 px-6 font-mono font-bold text-[#8A6337]">{ord.id}</td>
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-stone-200 border border-stone-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={
                                  ord.avatar && (ord.avatar.startsWith('http') || ord.avatar.startsWith('/')) 
                                    ? ord.avatar 
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(ord.customerName)}&background=5C3D28&color=ffffff&bold=true`
                                } 
                                alt={ord.customerName} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span className="font-semibold text-stone-900">{ord.customerName}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-stone-500 font-light">{ord.address}</td>
                        <td className="py-5 px-4 text-center font-bold text-stone-900">
                          {ord.itemCount} <span className="text-[10px] text-stone-400 font-normal">ITEMS</span>
                        </td>
                        <td className="py-5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-[11px]">
                              <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                              <span>{ord.paymentMethod}</span>
                            </div>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider ${
                              ord.paymentBadge === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            }`}>
                              {ord.paymentBadge}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-center">
                          <span className="inline-block px-3 py-1 bg-[#FAF6F0] text-[#8A6337] rounded-full text-[9px] font-bold uppercase tracking-wider border border-[#8A6337]/20">
                            {ord.deliveryType}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <div className="space-y-1.5 w-32 mx-auto">
                            <div className="flex items-center justify-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                ord.status === 'COMPLETED' ? 'bg-emerald-500' : ord.status === 'SHIPPING' ? 'bg-sky-500' : 'bg-amber-500'
                              }`} />
                              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                ord.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : ord.status === 'SHIPPING' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {ord.status}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${
                                ord.status === 'COMPLETED' ? 'w-full bg-emerald-600' : ord.status === 'SHIPPING' ? 'w-3/4 bg-sky-600' : 'w-2/5 bg-amber-600'
                              }`} />
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right font-serif font-bold text-stone-900 text-sm">
                          Rp {(ord.total || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* OTHER TABS FALLBACK (SETTINGS) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab !== 'dashboard' && activeTab !== 'orders' && activeTab !== 'products' && activeTab !== 'promotions' && activeTab !== 'reviews' && activeTab !== 'analytics' && (
          <main className="p-6 lg:p-10 max-w-7xl animate-fade-in">
            <div className="bg-white rounded-3xl p-10 border border-stone-200/70 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 bg-[#FAF6F0] text-[#613A1F] rounded-full flex items-center justify-center mx-auto">
                <Settings className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-semibold capitalize text-stone-900">
                {activeTab} Panel
              </h2>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Modul kelola {activeTab} siap digunakan untuk operasional administrator Nefakky.
              </p>
              <button 
                onClick={() => setActiveTab('analytics')}
                className="px-6 py-2.5 bg-[#613A1F] text-white text-xs font-semibold rounded-full hover:bg-[#4A2B16] transition-colors"
              >
                Lihat Analytics Sales Overview
              </button>
            </div>
          </main>
        )}

      </div>

      {/* MODAL: REPLY TO REVIEW */}
      {replyingReviewId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-semibold text-stone-900">Balas Ulasan Customer</h3>
              <button
                onClick={() => setReplyingReviewId(null)}
                className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Pesan Balasan Resmi Admin</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Terima kasih atas ulasan ulasan Anda! Kami sangat senang Anda menyukainya..."
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReplyingReviewId(null)}
                  className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-full transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-semibold text-xs rounded-full shadow-md transition-colors"
                >
                  Kirim Balasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW PROMOTION */}
      {showCreatePromoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-semibold text-stone-900">Create New Promotion</h3>
              <button
                onClick={() => setShowCreatePromoModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Judul Promosi</label>
                <input
                  type="text"
                  value={newPromoTitle}
                  onChange={(e) => setNewPromoTitle(e.target.value)}
                  placeholder="e.g. Summer Festival 25%"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={newPromoSubtitle}
                  onChange={(e) => setNewPromoSubtitle(e.target.value)}
                  placeholder="e.g. Exclusive discount for seasonal orders."
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Label Badge Tag</label>
                  <input
                    type="text"
                    value={newPromoTag}
                    onChange={(e) => setNewPromoTag(e.target.value)}
                    placeholder="25% OFF / FLASH SALE"
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tipe Promo</label>
                  <select
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Buy 1 Get 1">Buy 1 Get 1</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Durasi Waktu</label>
                  <input
                    type="text"
                    value={newPromoDuration}
                    onChange={(e) => setNewPromoDuration(e.target.value)}
                    placeholder="May 01 - May 30"
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Batas Penggunaan</label>
                  <input
                    type="number"
                    value={newPromoLimit}
                    onChange={(e) => setNewPromoLimit(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kode Voucher (Opsional)</label>
                <input
                  type="text"
                  value={newPromoVoucherCode}
                  onChange={(e) => setNewPromoVoucherCode(e.target.value)}
                  placeholder="e.g. SUMMER25"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F] uppercase font-mono"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreatePromoModal(false)}
                  className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-full transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-semibold text-xs rounded-full shadow-md transition-colors"
                >
                  Buat Promosi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MANUAL ORDER */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-semibold text-stone-900">Create Manual Order</h3>
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Customer</label>
                <input
                  type="text"
                  value={manualCustomer}
                  onChange={(e) => setManualCustomer(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kota / Alamat</label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="e.g. Brooklyn, NY"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Jumlah Item</label>
                  <input
                    type="text"
                    value={manualItems}
                    onChange={(e) => setManualItems(e.target.value)}
                    placeholder="3"
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Pengiriman</label>
                  <select
                    value={manualDelivery}
                    onChange={(e) => setManualDelivery(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  >
                    <option value="EXPRESS">EXPRESS</option>
                    <option value="STANDARD">STANDARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Total ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualTotal}
                  onChange={(e) => setManualTotal(e.target.value)}
                  placeholder="142.50"
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#613A1F]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateOrderModal(false)}
                  className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-full transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#613A1F] hover:bg-[#4A2B16] text-white font-semibold text-xs rounded-full shadow-md transition-colors"
                >
                  Buat Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

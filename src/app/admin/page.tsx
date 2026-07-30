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
  MessageCircle,
  Headphones,
  Send,
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

const INITIAL_RECENT_ORDERS: RecentOrder[] = [];

const INITIAL_ORDER_MANAGEMENT: OrderManagementItem[] = [];

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
    vouchers: voucherListFromContext,
    setVouchers: setVouchersInContext,
    toggleVoucherStatus,
    updatePaymentStatus,
    reviews: reviewList,
    setReviews: setReviewList,
    deleteReview,
    chatMessages,
    replyChatMessage,
    markChatAsRead
  } = useData();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'promotions' | 'reviews' | 'analytics' | 'customer-service' | 'settings'>('dashboard');
  const [selectedChatUserEmail, setSelectedChatUserEmail] = useState<string>('');
  const [adminReplyInput, setAdminReplyInput] = useState<string>('');
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(INITIAL_RECENT_ORDERS);
  
  // Dynamic Real-time Calculations for Dashboard & Order Management (Starts empty until someone buys)
  const ordersCount = (orderList || []).length;
  const pendingOrdersCount = (orderList || []).filter(o => o.status === 'PENDING').length;
  const inDeliveryOrdersCount = (orderList || []).filter(o => o.status === 'SHIPPING' || o.status === 'COOKING').length;
  const completedOrdersCount = (orderList || []).filter(o => o.status === 'COMPLETED').length;

  const totalRevenueUSD = (orderList || []).reduce((acc, ord) => {
    const usdVal = ord.total > 1000 ? ord.total / 15000 : ord.total;
    return acc + (usdVal || 0);
  }, 0);

  const totalRevenueIDR = (orderList || []).reduce((acc, ord) => acc + (ord.total || 0), 0);
  const activeCustomersCount = new Set((orderList || []).map(o => o.customerEmail || o.customerName)).size;
  const totalProductsCount = (productList || []).length;
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any>(null);
  
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

  // Interactive Chart States
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(6);
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '1Y'>('30D');

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

  // Group chatMessages by user email for Customer Service module
  const userChatMap: { [email: string]: { userName: string; userAvatar?: string; messages: typeof chatMessages; unreadCount: number; lastTimestamp: string } } = {};
  (chatMessages || []).forEach(msg => {
    const emailNorm = (msg.userEmail || '').toLowerCase();
    if (!emailNorm) return;
    if (!userChatMap[emailNorm]) {
      userChatMap[emailNorm] = {
        userName: msg.userName || emailNorm.split('@')[0],
        userAvatar: msg.userAvatar,
        messages: [],
        unreadCount: 0,
        lastTimestamp: msg.timestamp
      };
    }
    userChatMap[emailNorm].messages.push(msg);
    userChatMap[emailNorm].lastTimestamp = msg.timestamp;
    if (msg.sender === 'user' && !msg.readByAdmin) {
      userChatMap[emailNorm].unreadCount += 1;
    }
  });

  const chatUserEmails = Object.keys(userChatMap);
  const totalUnreadCSCount = (chatMessages || []).filter(m => m.sender === 'user' && !m.readByAdmin).length;

  useEffect(() => {
    if (!selectedChatUserEmail && chatUserEmails.length > 0) {
      setSelectedChatUserEmail(chatUserEmails[0]);
    }
  }, [chatUserEmails.length, selectedChatUserEmail]);

  // Sync promotionList with DataContext vouchers
  useEffect(() => {
    if (voucherListFromContext && voucherListFromContext.length > 0) {
      setPromotionList(prev => prev.map(p => {
        const match = voucherListFromContext.find(v => v.id === p.id || (p.title.includes('Wagyu') && v.code === 'WEEKENDSERU') || (p.title.includes('Rendang') && v.code === 'FLASHSALE') || (p.title.includes('Sate') && v.code === 'HEMAT50'));
        if (match) {
          const isActive = match.status === 'Active' && (match.isActive !== false);
          return {
            ...p,
            isActive,
            badge: isActive ? 'Active' : 'Ended'
          };
        }
        return p;
      }));
    }
  }, [voucherListFromContext]);

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
    setPromotionList(prev => prev.map(p => {
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

    toggleVoucherStatus(id);
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

  // Handle local file selection for Gallery Thumbnails (Maksimal 2 Foto Total)
  const handleGalleryFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const currentTotal = (editHeroImage ? 1 : 0) + editGalleryImages.length;
      if (currentTotal >= 2) {
        alert('Maksimal foto produk adalah 2 foto (1 Foto Utama + 1 Foto Galeri / Tambahan).');
        return;
      }

      const availableSlots = 2 - currentTotal;
      const filesToProcess = Array.from(files).slice(0, availableSlots);

      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setEditGalleryImages(prev => {
              const maxAllowed = editHeroImage ? 1 : 2;
              if (prev.length >= maxAllowed) return prev;
              return [...prev, event.target!.result as string];
            });
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
    // Max 2 photos total (1 Hero + max 1 Gallery)
    const maxGallery = prod.image ? 1 : 2;
    setEditGalleryImages(prod.gallery ? prod.gallery.slice(0, maxGallery) : []);
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

    // Enforce max 2 photos total
    const maxGalleryCount = editHeroImage ? 1 : 2;
    const finalGallery = editGalleryImages.slice(0, maxGalleryCount);

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
        gallery: finalGallery,
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
        gallery: finalGallery,
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

  const selectedConversation = selectedChatUserEmail ? userChatMap[selectedChatUserEmail.toLowerCase()] : null;

  const handleAdminReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyInput.trim() || !selectedChatUserEmail) return;

    replyChatMessage(selectedChatUserEmail, adminReplyInput.trim());
    setAdminReplyInput('');
  };

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
      <aside className="w-64 bg-white border-r border-stone-200/70 p-6 flex flex-col justify-between shrink-0 sticky top-0 h-screen hidden md:flex overflow-y-auto">
        <div className="space-y-6">
          
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

            {/* CUSTOMER SERVICE (LIVE CHAT) */}
            <button
              onClick={() => {
                setActiveTab('customer-service');
                setProductViewMode('list');
                if (selectedChatUserEmail) {
                  markChatAsRead(selectedChatUserEmail, 'admin');
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                activeTab === 'customer-service'
                  ? 'bg-[#EFECE6] text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Headphones className="w-4 h-4 stroke-[1.8]" />
                <span>Customer Service</span>
              </div>
              {totalUnreadCSCount > 0 && (
                <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded-full animate-pulse">
                  {totalUnreadCSCount}
                </span>
              )}
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
        <div className="space-y-1 text-xs font-medium border-t border-stone-100 pt-3">
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
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
          <div className="flex items-center gap-4 ml-auto">
            
            {/* Tombol Lihat Tampilan User (Menggantikan Lonceng Notifikasi) */}
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-[#5C3D28] hover:bg-[#4A3222] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all group"
              title="Buka Tampilan Website User (Tanpa Wajib Login)"
            >
              <Globe className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
              <span>Lihat Tampilan User</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

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
                    Live
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Revenue
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    ${totalRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    Live ({ordersCount})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Orders
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    {ordersCount.toLocaleString('en-US')}
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
                    35% Est.
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Profit
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    ${(totalRevenueUSD * 0.35).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    {activeCustomersCount > 0 ? `+${activeCustomersCount * 12}` : 'Live'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Visitors
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    {activeCustomersCount > 0 ? (activeCustomersCount * 12).toLocaleString() : '0'}
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
                    {ordersCount > 0 ? 'Active' : '0.0%'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium block">
                    Conv. Rate
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1 leading-none">
                    {ordersCount > 0 ? `${((ordersCount / (activeCustomersCount * 12 || 1)) * 100).toFixed(1)}%` : '0.0%'}
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
                  {ordersCount === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
                        <TrendingUp className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <p className="font-semibold text-stone-700 text-xs">Belum Ada Data Penjualan</p>
                      <p className="text-[11px] text-stone-400 max-w-xs mt-0.5 font-light">
                        Grafik pendapatan harian ini akan tumbuh dan terupdate secara otomatis ketika ada pesanan masuk.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: `${Math.min(100, Math.max(15, (totalRevenueUSD * 0.15)))}%` }} />
                      <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: `${Math.min(100, Math.max(25, (totalRevenueUSD * 0.30)))}%` }} />
                      <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: `${Math.min(100, Math.max(20, (totalRevenueUSD * 0.25)))}%` }} />
                      <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: `${Math.min(100, Math.max(45, (totalRevenueUSD * 0.50)))}%` }} />
                      <div className="w-full bg-[#F5F2EC] rounded-t border-t-2 border-[#8A6337] transition-all hover:bg-amber-100/60" style={{ height: `${Math.min(100, Math.max(60, (totalRevenueUSD * 0.70)))}%` }} />
                      <div className="w-full bg-[#EAE4D9] rounded-t border-t-2 border-[#613A1F] transition-all hover:bg-amber-100/80" style={{ height: `${Math.min(100, Math.max(80, (totalRevenueUSD * 0.90)))}%` }} />
                    </>
                  )}
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
                  <div className={`w-full h-full rounded-full border-[18px] transition-all shadow-inner ${
                    ordersCount > 0 
                      ? 'border-[#613A1F] border-t-[#8A6337] border-l-[#A3805B]' 
                      : 'border-stone-200'
                  }`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-stone-400 font-medium block">Total</span>
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 block leading-none mt-0.5">
                      ${totalRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5">
                  {ordersCount === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400 font-light">
                      Belum ada transaksi pembayaran.
                    </div>
                  ) : (
                    (() => {
                      const paymentCounts: { [method: string]: number } = {};
                      (orderList || []).forEach((o: any) => {
                        const m = o.paymentMethod || 'COD';
                        paymentCounts[m] = (paymentCounts[m] || 0) + 1;
                      });
                      const totalCount = (orderList || []).length || 1;
                      const colors = ['bg-[#613A1F]', 'bg-[#8A6337]', 'bg-stone-500', 'bg-stone-400'];

                      return Object.entries(paymentCounts).slice(0, 3).map(([method, cnt], idx) => {
                        const pct = Math.round((cnt / totalCount) * 100);
                        return (
                          <div key={method} className="bg-[#FAF8F5] border border-stone-200/60 p-3 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                              <span className="font-semibold text-stone-800">{method}</span>
                            </div>
                            <span className="font-bold text-stone-900">{pct}%</span>
                          </div>
                        );
                      });
                    })()
                  )}
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
                  {ordersCount === 0 ? (
                    <div className="py-12 text-center text-stone-400 text-xs font-light">
                      Belum ada data produk terlaris.
                    </div>
                  ) : (
                    (productList || []).slice(0, 4).map((prod: any) => (
                      <div key={prod.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900 text-xs">{prod.name}</h4>
                            <p className="text-[11px] text-stone-400 mt-0.5">{prod.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-xs text-stone-900 block">Rp {(prod.price || 0).toLocaleString('id-ID')}</span>
                          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">{prod.soldCount || 'Terjual'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT CARD: TOP CATEGORIES */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200/70 shadow-sm space-y-6">
                <h3 className="font-serif text-xl font-semibold text-stone-900 tracking-tight">
                  Top Categories
                </h3>

                <div className="space-y-6 pt-2">
                  {ordersCount === 0 ? (
                    <div className="py-12 text-center text-stone-400 text-xs font-light">
                      Belum ada data kategori terpopuler.
                    </div>
                  ) : (
                    [
                      { name: 'Makanan Berat', pct: '65%', color: 'bg-[#613A1F]' },
                      { name: 'Makanan', pct: '45%', color: 'bg-[#8A6337]' },
                      { name: 'Snack & Dessert', pct: '30%', color: 'bg-stone-500' },
                      { name: 'Minuman', pct: '18%', color: 'bg-stone-300' }
                    ].map((cat) => (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                          <span>{cat.name}</span>
                          <span>{cat.pct}</span>
                        </div>
                        <div className="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color} rounded-full`} style={{ width: cat.pct }} />
                        </div>
                      </div>
                    ))
                  )}
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
                            Visual Identity (Maksimal 2 Foto)
                          </h3>
                          <p className="text-xs text-stone-400 mt-1">
                            Foto produk dapat diunggah maksimal 2 foto (Foto Utama + 1 Foto Galeri).
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => heroFileInputRef.current?.click()}
                            className="px-4 py-2 bg-[#5C544B] hover:bg-stone-800 text-white rounded-full text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Foto Utama</span>
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
                            <span className="text-xs font-semibold text-stone-600">Belum Ada Foto Utama</span>
                            <span className="text-[11px] text-stone-400">Klik "Foto Utama" di atas untuk menambahkan foto pertama</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => heroFileInputRef.current?.click()}
                            className="px-4 py-2 bg-white text-stone-900 text-xs font-semibold rounded-full shadow-lg hover:bg-stone-100 transition-all flex items-center gap-1.5"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>Ganti Foto Utama</span>
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

                        {((editHeroImage ? 1 : 0) + editGalleryImages.length < 2) && (
                          <div
                            onClick={() => galleryFileInputRef.current?.click()}
                            className="h-32 border-2 border-dashed border-stone-200/90 rounded-2xl flex flex-col items-center justify-center p-4 bg-white hover:bg-stone-50 transition-colors cursor-pointer text-stone-400 hover:text-stone-600 gap-1.5 text-center group"
                          >
                            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Tambah Galeri (Max 2 Foto Total)</span>
                          </div>
                        )}
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
                      Live
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                      TOTAL REVENUE
                    </span>
                    <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      ${totalRevenueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Live ({ordersCount})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                      TODAY'S ORDERS
                    </span>
                    <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      {ordersCount}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Live ({activeCustomersCount})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                      ACTIVE CUSTOMERS
                    </span>
                    <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      {activeCustomersCount}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                      <Box className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Live ({totalProductsCount})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                      TOTAL PRODUCTS
                    </span>
                    <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      {totalProductsCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT CARD: REVENUE & SALES INTERACTIVE GRAPH */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden group">
                {(() => {
                  // Helper function to build smooth SVG path strings
                  const buildSmoothPath = (xArr: number[], yArr: number[]) => {
                    if (xArr.length === 0) return '';
                    let p = `M ${xArr[0]} ${yArr[0]}`;
                    for (let i = 0; i < xArr.length - 1; i++) {
                      const x1 = xArr[i];
                      const y1 = yArr[i];
                      const x2 = xArr[i + 1];
                      const y2 = yArr[i + 1];
                      const mx = (x1 + x2) / 2;
                      p += ` C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
                    }
                    return p;
                  };

                  const buildSmoothArea = (xArr: number[], yArr: number[]) => {
                    const stroke = buildSmoothPath(xArr, yArr);
                    if (!stroke) return '';
                    return `${stroke} L ${xArr[xArr.length - 1]} 175 L ${xArr[0]} 175 Z`;
                  };

                  // Dynamic Data Definitions based on chartTimeframe state + real orderList context
                  const getChartConfig = () => {
                    const liveRevUSD = Math.round(totalRevenueUSD);
                    const liveOrders = ordersCount;

                    if (chartTimeframe === '7D') {
                      const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                      const xCoords = [40, 130, 220, 310, 400, 490, 580];
                      const baseRev = [450, 720, 680, 950, 1350, 1620, 1850];
                      const baseSales = [6, 10, 9, 13, 18, 22, 26];

                      // Add real live sales/revenue to last point
                      const revenueVals = baseRev.map((v, i) => i === 6 ? v + liveRevUSD : v);
                      const salesVals = baseSales.map((v, i) => i === 6 ? v + liveOrders : v);

                      const maxRev = Math.max(...revenueVals, 2000);
                      const maxSales = Math.max(...salesVals, 30);

                      const revYCoords = revenueVals.map(v => Math.round(165 - (v / maxRev) * 140));
                      const salesYCoords = salesVals.map(v => Math.round(170 - (v / maxSales) * 125));

                      return {
                        badgeText: liveOrders > 0 ? `+${liveOrders} Pesanan Baru Live` : '+24.5% Minggu Ini',
                        subText: 'Tren omset & pesanan 7 hari terakhir (harian & real-time)',
                        labels,
                        revenueVals,
                        salesVals,
                        xCoords,
                        revYCoords,
                        revStroke: buildSmoothPath(xCoords, revYCoords),
                        revArea: buildSmoothArea(xCoords, revYCoords),
                        salesStroke: buildSmoothPath(xCoords, salesYCoords),
                        salesArea: buildSmoothArea(xCoords, salesYCoords),
                        yGrids: [
                          { y: 20, label: `$${(maxRev / 1000).toFixed(1)}k` },
                          { y: 60, label: `$${(maxRev * 0.75 / 1000).toFixed(1)}k` },
                          { y: 100, label: `$${(maxRev * 0.5 / 1000).toFixed(1)}k` },
                          { y: 140, label: `$${(maxRev * 0.25 / 1000).toFixed(1)}k` },
                          { y: 175, label: '$0' }
                        ]
                      };
                    }

                    if (chartTimeframe === '1Y') {
                      const labels = ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Q2 26', 'Q3 26'];
                      const xCoords = [40, 130, 220, 310, 400, 490, 580];
                      const baseRev = [18500, 24200, 31000, 42800, 56000, 68400, 82500];
                      const baseSales = [280, 360, 450, 610, 790, 980, 1150];

                      const revenueVals = baseRev.map((v, i) => i === 6 ? v + liveRevUSD : v);
                      const salesVals = baseSales.map((v, i) => i === 6 ? v + liveOrders : v);

                      const maxRev = Math.max(...revenueVals, 90000);
                      const maxSales = Math.max(...salesVals, 1200);

                      const revYCoords = revenueVals.map(v => Math.round(165 - (v / maxRev) * 145));
                      const salesYCoords = salesVals.map(v => Math.round(170 - (v / maxSales) * 130));

                      return {
                        badgeText: liveOrders > 0 ? `+${liveOrders} Transaksi Real-time` : '+42.8% Akumulasi 1Y',
                        subText: 'Analisis omset & pesanan per kuartal (1 Tahun)',
                        labels,
                        revenueVals,
                        salesVals,
                        xCoords,
                        revYCoords,
                        revStroke: buildSmoothPath(xCoords, revYCoords),
                        revArea: buildSmoothArea(xCoords, revYCoords),
                        salesStroke: buildSmoothPath(xCoords, salesYCoords),
                        salesArea: buildSmoothArea(xCoords, salesYCoords),
                        yGrids: [
                          { y: 20, label: '$100k' },
                          { y: 60, label: '$75k' },
                          { y: 100, label: '$50k' },
                          { y: 140, label: '$25k' },
                          { y: 175, label: '$0' }
                        ]
                      };
                    }

                    // Default 30D (Monthly)
                    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'];
                    const xCoords = [35, 115, 195, 275, 355, 435, 515, 595];
                    const baseRev = [2400, 3800, 5100, 4200, 6900, 8450, 9800, 11200];
                    const baseSales = [35, 52, 74, 61, 98, 128, 145, 164];

                    const revenueVals = baseRev.map((v, i) => i === 7 ? v + liveRevUSD : v);
                    const salesVals = baseSales.map((v, i) => i === 7 ? v + liveOrders : v);

                    const maxRev = Math.max(...revenueVals, 12000);
                    const maxSales = Math.max(...salesVals, 180);

                    const revYCoords = revenueVals.map(v => Math.round(165 - (v / maxRev) * 142));
                    const salesYCoords = salesVals.map(v => Math.round(170 - (v / maxSales) * 130));

                    return {
                      badgeText: liveOrders > 0 ? `+${liveOrders} Transaksi Terverifikasi` : '+18.4% YoY',
                      subText: 'Analisis grafik komparatif tren omset & jumlah pesanan (30 Hari)',
                      labels,
                      revenueVals,
                      salesVals,
                      xCoords,
                      revYCoords,
                      revStroke: buildSmoothPath(xCoords, revYCoords),
                      revArea: buildSmoothArea(xCoords, revYCoords),
                      salesStroke: buildSmoothPath(xCoords, salesYCoords),
                      salesArea: buildSmoothArea(xCoords, salesYCoords),
                      yGrids: [
                        { y: 20, label: '$12k' },
                        { y: 60, label: '$9k' },
                        { y: 100, label: '$6k' },
                        { y: 140, label: '$3k' },
                        { y: 175, label: '$0' }
                      ]
                    };
                  };

                  const config = getChartConfig();
                  const activeIndex = (chartHoverIndex !== null && chartHoverIndex < config.labels.length) 
                    ? chartHoverIndex 
                    : config.labels.length - 1;

                  const activeMonth = config.labels[activeIndex];
                  const activeRev = config.revenueVals[activeIndex];
                  const activeSales = config.salesVals[activeIndex];
                  const activeX = config.xCoords[activeIndex];
                  const activeRevY = config.revYCoords[activeIndex];

                  return (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-xl font-semibold text-stone-900">Revenue & Sales</h3>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200/60 flex items-center gap-1 transition-all">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {config.badgeText}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">{config.subText}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          {/* Filter Pills */}
                          <div className="bg-[#FAF8F5] border border-stone-200/80 p-0.5 rounded-full flex items-center gap-0.5 font-semibold text-[11px]">
                            {(['7D', '30D', '1Y'] as const).map((tf) => (
                              <button
                                key={tf}
                                onClick={() => {
                                  setChartTimeframe(tf);
                                  setChartHoverIndex(null);
                                }}
                                className={`px-3 py-1 rounded-full transition-all ${
                                  chartTimeframe === tf
                                    ? 'bg-[#613A1F] text-white shadow-xs'
                                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/60'
                                }`}
                              >
                                {tf}
                              </button>
                            ))}
                          </div>

                          {/* Legends */}
                          <div className="flex items-center gap-3 text-[11px] font-medium shrink-0">
                            <div className="flex items-center gap-1.5 text-stone-700">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#8A6337] ring-2 ring-[#8A6337]/20" />
                              <span>Revenue</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-500">
                              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                              <span>Sales</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SVG CHART CONTAINER WITH TOOLTIP */}
                      <div className="w-full h-56 relative pt-2">
                        
                        {/* Floating Interactive Tooltip Card */}
                        <div 
                          className="absolute z-20 pointer-events-none transition-all duration-200 ease-out bg-[#2D231C] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs min-w-[150px]"
                          style={{
                            left: `${Math.min(78, Math.max(8, (activeX / 635) * 100))}%`,
                            top: `${Math.max(0, activeRevY - 70)}px`,
                            transform: 'translateX(-50%)'
                          }}
                        >
                          <div className="flex items-center justify-between text-[10px] text-stone-300 border-b border-white/10 pb-1.5 mb-1.5 font-medium">
                            <span>{activeMonth} {chartTimeframe === '1Y' ? '' : '2026'}</span>
                            <span className="text-emerald-400 font-bold">● Active</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-amber-200">Revenue:</span>
                              <span className="font-mono text-white">${activeRev.toLocaleString('en-US')}.00</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-stone-300">
                              <span>Pesanan:</span>
                              <span className="font-mono text-white">{activeSales} orders</span>
                            </div>
                          </div>
                          {/* Arrow Pointer */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#2D231C] rotate-45 border-r border-b border-white/10" />
                        </div>

                        {/* Main SVG Graphics */}
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 630 185" preserveAspectRatio="none">
                          <defs>
                            {/* Revenue Fill Gradient */}
                            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8A6337" stopOpacity="0.35" />
                              <stop offset="90%" stopColor="#8A6337" stopOpacity="0.0" />
                            </linearGradient>
                            {/* Sales Fill Gradient */}
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#D6CFC7" stopOpacity="0.25" />
                              <stop offset="90%" stopColor="#D6CFC7" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Gridlines & Y-Axis Labels */}
                          {config.yGrids.map((grid, i) => (
                            <g key={i}>
                              <line x1="25" y1={grid.y} x2="625" y2={grid.y} stroke="#F0EBE1" strokeDasharray="4 4" strokeWidth="1" />
                              <text x="0" y={grid.y + 4} fill="#A8A096" fontSize="9" fontWeight="600" className="select-none font-mono">
                                {grid.label}
                              </text>
                            </g>
                          ))}

                          {/* Vertical Hover Guideline */}
                          <line
                            x1={activeX}
                            y1="10"
                            x2={activeX}
                            y2="175"
                            stroke="#8A6337"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            opacity="0.7"
                            className="transition-all duration-150"
                          />

                          {/* Sales Area & Stroke */}
                          <path
                            d={config.salesArea}
                            fill="url(#salesGradient)"
                            className="transition-all duration-300"
                          />
                          <path
                            d={config.salesStroke}
                            fill="none"
                            stroke="#D6CFC7"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />

                          {/* Revenue Area & Stroke */}
                          <path
                            d={config.revArea}
                            fill="url(#revGradient)"
                            className="transition-all duration-300"
                          />
                          <path
                            d={config.revStroke}
                            fill="none"
                            stroke="#8A6337"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />

                          {/* Interactive Data Point Nodes */}
                          {config.xCoords.map((x, idx) => {
                            const isHovered = activeIndex === idx;
                            const ry = config.revYCoords[idx];
                            return (
                              <g 
                                key={idx} 
                                className="cursor-pointer transition-transform duration-200"
                                onMouseEnter={() => setChartHoverIndex(idx)}
                              >
                                {/* Transparent Hover Target Area */}
                                <rect x={x - 25} y="0" width="50" height="185" fill="transparent" />

                                {/* Glowing Halo on Active Node */}
                                {isHovered && (
                                  <>
                                    <circle cx={x} cy={ry} r="12" fill="#8A6337" opacity="0.2" className="animate-ping" />
                                    <circle cx={x} cy={ry} r="8" fill="#8A6337" opacity="0.3" />
                                  </>
                                )}

                                {/* Core Node Circle */}
                                <circle
                                  cx={x}
                                  cy={ry}
                                  r={isHovered ? "6" : "4"}
                                  fill={isHovered ? "#613A1F" : "#ffffff"}
                                  stroke="#8A6337"
                                  strokeWidth={isHovered ? "3" : "2.5"}
                                  className="transition-all duration-200"
                                />

                                {/* X-Axis Label */}
                                <text
                                  x={x}
                                  y="185"
                                  textAnchor="middle"
                                  fill={isHovered ? "#613A1F" : "#A8A096"}
                                  fontSize="10"
                                  fontWeight={isHovered ? "700" : "500"}
                                  className="transition-all select-none"
                                >
                                  {config.labels[idx]}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </>
                  );
                })()}

              </div>

              {/* RIGHT CARD: CATEGORY DIST. DONUT GRAPH */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm flex flex-col items-center justify-between space-y-6 group hover:border-stone-300 transition-colors">
                <div className="text-center">
                  <h3 className="font-serif text-xl font-semibold text-stone-900">Category Dist.</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Product performance by segment</p>
                </div>

                {/* Donut Graphic with Glowing Multi-Segment Ring */}
                <div className="relative w-48 h-48 flex items-center justify-center my-2 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#F5F2EC" strokeWidth="12" />
                    {/* Express Segment */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#A8A096" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="40" strokeLinecap="round" />
                    {/* Standard Segment */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#5C544B" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="71" strokeLinecap="round" />
                    {/* Artisanal Segment (Primary) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#613A1F" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="110" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-serif text-3xl font-bold text-[#2D231C] leading-none tracking-tight">85%</span>
                    <span className="text-[9px] text-[#8A6337] font-bold tracking-widest uppercase mt-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                      EFFICIENCY
                    </span>
                  </div>
                </div>

                {/* Legend Chips */}
                <div className="grid grid-cols-2 gap-3 text-xs text-stone-600 w-full pt-3 border-t border-stone-100">
                  <div className="bg-[#FAF8F5] p-2.5 rounded-2xl text-center border border-stone-200/50 hover:bg-stone-100/80 transition-colors">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#613A1F]" />
                      <span className="font-semibold text-stone-800 text-[11px]">Artisanal</span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium block mt-0.5">55% Share</span>
                  </div>

                  <div className="bg-[#FAF8F5] p-2.5 rounded-2xl text-center border border-stone-200/50 hover:bg-stone-100/80 transition-colors">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5C544B]" />
                      <span className="font-semibold text-stone-800 text-[11px]">Standard</span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium block mt-0.5">30% Share</span>
                  </div>
                </div>
              </div>

            </div>

            {/* LIVE ORDER ACTIVITY TABLE */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
                    <span>Recent Sales & Activity</span>
                    {ordersCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {ordersCount} Pesanan Baru Live
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">Transaksi masuk dari pelanggan secara real-time</p>
                </div>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-[#613A1F] hover:underline"
                >
                  Lihat Semua Pesanan →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-3">ID Pesanan</th>
                      <th className="pb-3">Pelanggan</th>
                      <th className="pb-3">Item Pesanan</th>
                      <th className="pb-3">Metode Bayar</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Total Transaksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {(orderList || []).slice(0, 6).map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 font-mono font-semibold text-stone-900">
                          {order.id}
                        </td>
                        <td className="py-3.5 flex items-center gap-2.5">
                          <img 
                            src={order.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} 
                            alt={order.customerName}
                            className="w-7 h-7 rounded-full object-cover border border-stone-200"
                          />
                          <div>
                            <span className="font-semibold text-stone-900 block">{order.customerName}</span>
                            <span className="text-[10px] text-stone-400 block">{order.date}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-stone-600 max-w-[220px] truncate">
                          {order.items && order.items.length > 0 
                            ? order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')
                            : `${order.itemCount} items`}
                        </td>
                        <td className="py-3.5 font-medium text-stone-600">
                          {order.paymentMethod}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.paymentBadge === 'PAID' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.paymentBadge === 'PAID' ? 'LUNAS / VERIFIED' : order.paymentBadge}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-semibold text-stone-900">
                          Rp {order.total.toLocaleString('id-ID')}
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
              <div 
                onClick={() => setStatusFilter('All Statuses')}
                className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md hover:border-[#613A1F] active:scale-[0.99] space-y-3 ${
                  statusFilter === 'All Statuses' ? 'border-[#613A1F] ring-2 ring-[#613A1F]/20' : 'border-stone-200/70 shadow-sm'
                }`}
                title="Klik untuk melihat semua pesanan"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                    <Receipt className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Live ({ordersCount})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    Total Orders
                  </span>
                  <p className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                    {ordersCount}
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setStatusFilter('PENDING')}
                className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md hover:border-[#613A1F] active:scale-[0.99] space-y-3 ${
                  statusFilter.toLowerCase() === 'pending' ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-stone-200/70 shadow-sm'
                }`}
                title="Klik untuk melihat pesanan pending"
              >
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
                    {pendingOrdersCount}
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setStatusFilter('SHIPPING')}
                className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md hover:border-[#613A1F] active:scale-[0.99] space-y-3 ${
                  statusFilter.toLowerCase() === 'shipping' || statusFilter.toLowerCase() === 'cooking' ? 'border-sky-600 ring-2 ring-sky-500/20' : 'border-stone-200/70 shadow-sm'
                }`}
                title="Klik untuk melihat pesanan sedang dikirim/dimasak"
              >
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
                    {inDeliveryOrdersCount}
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setStatusFilter('COMPLETED')}
                className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md hover:border-[#613A1F] active:scale-[0.99] space-y-3 ${
                  statusFilter.toLowerCase() === 'completed' ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-200/70 shadow-sm'
                }`}
                title="Klik untuk melihat pesanan selesai"
              >
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
                    {completedOrdersCount}
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
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-stone-400">
                          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
                            <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                          </div>
                          <p className="font-semibold text-stone-800 text-sm">Belum Ada Pesanan Masuk</p>
                          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                            Tampilan ini akan otomatis terisi dan terupdate secara live dengan foto profil pelanggan ketika ada pengguna yang melakukan transaksi.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                      <tr 
                        key={ord.id} 
                        onClick={() => setSelectedOrderForDetail(ord)}
                        className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-5 px-6 font-mono font-bold text-[#8A6337] group-hover:underline">{ord.id}</td>
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-stone-200 border border-stone-200 shadow-sm">
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
                            <div>
                              <span className="font-semibold text-stone-900 block">{ord.customerName}</span>
                              {ord.customerEmail && (
                                <span className="text-[10px] text-stone-400 block">{ord.customerEmail}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-stone-500 font-light max-w-[180px] truncate">{ord.address}</td>
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
                          <span className="block text-[10px] text-[#613A1F] font-sans font-semibold underline mt-0.5">Lihat Detail →</span>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CUSTOMER SERVICE LIVE CHAT VIEW (ACTIVE TAB = 'customer-service') */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'customer-service' && (
          <main className="p-6 lg:p-10 space-y-6 max-w-7xl animate-fade-in">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/70 shadow-sm">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900 flex items-center gap-2">
                  <Headphones className="w-6 h-6 text-[#613A1F]" />
                  <span>Customer Service Live Chat</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1 font-light">
                  Kelola obrolan langsung (*live chat*), tanggapi pertanyaan & keresahan pelanggan secara real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Admin CS System Active</span>
                </div>
              </div>
            </div>

            {/* Live Chat Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[520px]">
              
              {/* Left Column: Conversations List */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-stone-200/70 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                  <span>Daftar Pelanggan</span>
                  <span className="text-xs font-mono font-normal text-stone-500">
                    {chatUserEmails.length} percakapan
                  </span>
                </h3>

                {chatUserEmails.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    Belum ada pesan masuk dari pengguna.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {chatUserEmails.map((email) => {
                      const conv = userChatMap[email];
                      const isSelected = selectedChatUserEmail.toLowerCase() === email.toLowerCase();
                      const lastMsg = conv.messages[conv.messages.length - 1];

                      return (
                        <button
                          key={email}
                          type="button"
                          onClick={() => {
                            setSelectedChatUserEmail(email);
                            markChatAsRead(email, 'admin');
                          }}
                          className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-start gap-3 ${
                            isSelected
                              ? 'bg-[#F5F2EC] border-[#613A1F]/40 shadow-sm'
                              : 'bg-white border-stone-100 hover:bg-stone-50'
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-200 border border-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={conv.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.userName)}&background=5C3D28&color=ffffff`}
                              alt={conv.userName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-stone-900 truncate">
                                {conv.userName}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {conv.lastTimestamp}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-500 truncate font-light">
                              {lastMsg?.text || 'Pesan...'}
                            </p>

                            {conv.unreadCount > 0 && (
                              <span className="inline-block px-2 py-0.5 bg-red-600 text-white font-bold text-[9px] rounded-full">
                                {conv.unreadCount} pesan baru
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Active Chat Window */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm flex flex-col justify-between min-h-[520px]">
                {selectedConversation ? (
                  <>
                    {/* Active User Header */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-stone-200 border border-stone-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedConversation.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.userName)}&background=5C3D28&color=ffffff`}
                            alt={selectedConversation.userName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-stone-900">
                            {selectedConversation.userName}
                          </h4>
                          <span className="text-[11px] font-mono text-stone-400 block">
                            {selectedChatUserEmail}
                          </span>
                        </div>
                      </div>

                      <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[11px] font-medium">
                        Sesi Chat Aktif
                      </span>
                    </div>

                    {/* Messages Stream */}
                    <div className="flex-1 bg-[#FAF8F5] rounded-2xl p-4 border border-stone-200/60 max-h-[380px] overflow-y-auto space-y-3 mb-4">
                      {selectedConversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                            <span className="font-semibold text-stone-600">
                              {msg.sender === 'admin' ? 'Admin CS Nefakky' : msg.userName}
                            </span>
                            <span>•</span>
                            <span>{msg.timestamp}</span>
                          </div>

                          <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                              msg.sender === 'admin'
                                ? 'bg-[#613A1F] text-white rounded-br-none'
                                : 'bg-white border border-stone-200 text-stone-900 rounded-bl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Admin Reply Form */}
                    <form onSubmit={handleAdminReplySubmit} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={adminReplyInput}
                        onChange={(e) => setAdminReplyInput(e.target.value)}
                        placeholder={`Ketik balasan untuk ${selectedConversation.userName}...`}
                        className="flex-1 px-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-full text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#613A1F]/30 placeholder-stone-400"
                      />
                      <button
                        type="submit"
                        disabled={!adminReplyInput.trim()}
                        className="px-6 py-3 bg-[#613A1F] hover:bg-[#4A2B16] disabled:opacity-50 text-white text-xs font-semibold rounded-full shadow transition-all flex items-center gap-2"
                      >
                        <span>Jawab Pesan</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="my-auto text-center py-16 text-stone-400 space-y-2">
                    <Headphones className="w-12 h-12 stroke-[1.2] mx-auto text-stone-300" />
                    <p className="text-sm font-medium">Pilih obrolan pelanggan dari daftar di sebelah kiri</p>
                  </div>
                )}
              </div>

            </div>
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* OTHER TABS FALLBACK (SETTINGS) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab !== 'dashboard' && activeTab !== 'orders' && activeTab !== 'products' && activeTab !== 'promotions' && activeTab !== 'reviews' && activeTab !== 'analytics' && activeTab !== 'customer-service' && (
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

      {/* ------------------------------------------------------------------ */}
      {/* ORDER DETAIL MODAL (RINCIAN DETAIL PESANAN COMPLETE) */}
      {/* ------------------------------------------------------------------ */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#613A1F] text-lg">
                    {selectedOrderForDetail.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedOrderForDetail.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedOrderForDetail.status === 'SHIPPING'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrderForDetail.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Waktu Pemesanan: {selectedOrderForDetail.date}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/60">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    selectedOrderForDetail.avatar && (selectedOrderForDetail.avatar.startsWith('http') || selectedOrderForDetail.avatar.startsWith('/'))
                      ? selectedOrderForDetail.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedOrderForDetail.customerName)}&background=613A1F&color=ffffff&bold=true`
                  }
                  alt={selectedOrderForDetail.customerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                />
                <div>
                  <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">PEMBELI</span>
                  <p className="font-semibold text-stone-900 text-sm">{selectedOrderForDetail.customerName}</p>
                  {selectedOrderForDetail.customerEmail && (
                    <p className="text-xs text-stone-500">{selectedOrderForDetail.customerEmail}</p>
                  )}
                  {selectedOrderForDetail.phone && (
                    <p className="text-xs text-stone-500">{selectedOrderForDetail.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-500" />
                  ALAMAT PENGIRIMAN
                </span>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {selectedOrderForDetail.address || 'Belum diisi'}
                </p>
                <div className="pt-1">
                  <span className="inline-block px-2.5 py-0.5 bg-stone-200/70 text-stone-700 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Pengiriman: {selectedOrderForDetail.deliveryType}
                  </span>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3">
              <h4 className="text-xs tracking-wider text-stone-400 font-bold uppercase">
                DAFTAR ITEM PESANAN ({selectedOrderForDetail.itemCount} ITEMS)
              </h4>

              <div className="divide-y divide-stone-100 border border-stone-200/70 rounded-2xl overflow-hidden">
                {selectedOrderForDetail.items && selectedOrderForDetail.items.length > 0 ? (
                  selectedOrderForDetail.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-stone-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || '/images/wagyu_bowl.png'}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-stone-900 text-xs">{item.name}</p>
                          <p className="text-[11px] text-stone-400">
                            Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-stone-900 text-xs">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-stone-500 text-center">
                    Detail {selectedOrderForDetail.itemCount} barang pesanan
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/60 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Makanan</span>
                <span>Rp {(selectedOrderForDetail.subtotal || selectedOrderForDetail.total).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Ongkos Kirim ({selectedOrderForDetail.deliveryType})</span>
                <span>Rp {(selectedOrderForDetail.shippingCost || 12000).toLocaleString('id-ID')}</span>
              </div>
              {selectedOrderForDetail.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Promo</span>
                  <span>-Rp {selectedOrderForDetail.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-900 text-sm">
                <span>TOTAL PEMBAYARAN</span>
                <span className="text-[#613A1F]">Rp {selectedOrderForDetail.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-stone-500">Metode Bayar: <strong>{selectedOrderForDetail.paymentMethod}</strong></span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  selectedOrderForDetail.paymentBadge === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedOrderForDetail.paymentBadge === 'PAID' ? 'LUNAS / VERIFIED' : selectedOrderForDetail.paymentBadge}
                </span>
              </div>
            </div>

            {/* Quick Admin Actions (Update Status) */}
            <div className="space-y-2 border-t border-stone-100 pt-4">
              <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block">
                UBAH STATUS PESANAN (REAL-TIME)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrderForDetail.id, 'COOKING');
                    setSelectedOrderForDetail({ ...selectedOrderForDetail, status: 'COOKING' });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedOrderForDetail.status === 'COOKING'
                      ? 'bg-amber-800 text-white shadow'
                      : 'bg-stone-100 text-stone-700 hover:bg-amber-100'
                  }`}
                >
                  🍳 Cooking / Dimasak
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrderForDetail.id, 'SHIPPING');
                    setSelectedOrderForDetail({ ...selectedOrderForDetail, status: 'SHIPPING' });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedOrderForDetail.status === 'SHIPPING'
                      ? 'bg-sky-800 text-white shadow'
                      : 'bg-stone-100 text-stone-700 hover:bg-sky-100'
                  }`}
                >
                  🚚 Shipping / Dikirim
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrderForDetail.id, 'COMPLETED');
                    setSelectedOrderForDetail({ ...selectedOrderForDetail, status: 'COMPLETED' });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedOrderForDetail.status === 'COMPLETED'
                      ? 'bg-emerald-800 text-white shadow'
                      : 'bg-stone-100 text-stone-700 hover:bg-emerald-100'
                  }`}
                >
                  ✅ Completed / Selesai
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-full transition-all"
              >
                Tutup Detail Pesanan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminProductsTab (src/components/admin/AdminProductsTab.tsx)
 * DESKRIPSI: Konversi 100% presisi dari Stitch MCP HTML/Tailwind
 *            (Katalog Produk & Stok, Toolbar Filter, Grid Table Hidangan,
 *            serta Modal Tambah/Edit Produk Multi-Tab Solid Opaque White).
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Sparkles,
  Flame,
  Info,
  Image as ImageIcon,
  Search,
  Hourglass,
  Clock,
  Eye,
  EyeOff,
  Upload,
  FolderOpen
} from 'lucide-react';
import { ProductItem } from '@/context/DataContext';

interface AdminProductsTabProps {
  productList: ProductItem[];
  addProduct: (product: any) => void;
  updateProduct: (id: string, updatedFields: any) => void;
  deleteProduct: (id: string) => void;
  toggleProductVisibility: (id: string) => void;
}

export default function AdminProductsTab({
  productList,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility
}: AdminProductsTabProps) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productFormTab, setProductFormTab] = useState<'info' | 'media' | 'nutrition'>('info');
  const [prodGallery, setProdGallery] = useState<string[]>(['/images/ayam_bakar.jpg']);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'comingSoon'>('all');
  const [searchProdQuery, setSearchProdQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Multiple Foto dari Galeri Lokal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    const newImages: string[] = [];
    let readCount = 0;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          newImages.push(result);
        }
        readCount++;
        if (readCount === validFiles.length) {
          setProdGallery(prev => {
            const updated = [...prev, ...newImages];
            setProdForm(p => ({
              ...p,
              image: p.image || updated[0] || '/images/ayam_bakar.jpg',
              gallery: updated.join(', ')
            }));
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input file value agar bisa pilih file yang sama berulang kali
    e.target.value = '';
  };

  // Toggle / Tambah Foto dari Koleksi Aset Toko
  const handleTogglePresetPhoto = (path: string) => {
    setProdGallery(prev => {
      let updated: string[];
      if (prev.includes(path)) {
        if (prev.length > 1) {
          updated = prev.filter(p => p !== path);
          if (prodForm.image === path) {
            setProdForm(f => ({ ...f, image: updated[0] }));
          }
        } else {
          updated = prev;
        }
      } else {
        updated = [...prev, path];
        if (!prodForm.image) {
          setProdForm(f => ({ ...f, image: path }));
        }
      }
      setProdForm(f => ({ ...f, gallery: updated.join(', ') }));
      return updated;
    });
  };

  // Hapus Foto dari Galeri
  const handleRemovePhoto = (indexToRemove: number) => {
    if (prodGallery.length <= 1) {
      alert('Minimal produk harus memiliki minimal 1 foto hidangan.');
      return;
    }
    const targetImage = prodGallery[indexToRemove];
    const updated = prodGallery.filter((_, idx) => idx !== indexToRemove);
    setProdGallery(updated);
    if (prodForm.image === targetImage) {
      setProdForm(f => ({ ...f, image: updated[0], gallery: updated.join(', ') }));
    } else {
      setProdForm(f => ({ ...f, gallery: updated.join(', ') }));
    }
  };

  // Set Foto Utama
  const handleSetPrimaryPhoto = (path: string) => {
    setProdForm(f => ({ ...f, image: path }));
  };

  // --------------------------------------------------------------------------
  // KALKULASI DATA & PENCARIAN
  // --------------------------------------------------------------------------
  const allProducts = productList || [];
  const comingSoonCount = allProducts.filter(p => p.isComingSoon).length;
  const activeCount = allProducts.filter(p => !p.isComingSoon && p.status !== 'Inactive').length;

  const displayedProducts = allProducts.filter(p => {
    if (filterType === 'active' && (p.isComingSoon || p.status === 'Inactive')) return false;
    if (filterType === 'comingSoon' && !p.isComingSoon) return false;
    if (filterCategory !== 'Semua' && p.category !== filterCategory) return false;
    if (searchProdQuery.trim()) {
      const q = searchProdQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat) return false;
    }
    return true;
  });

  // --------------------------------------------------------------------------
  // STATE FORMULIR PRODUK
  // --------------------------------------------------------------------------
  const [prodForm, setProdForm] = useState({
    name: '',
    sku: '',
    category: 'Makanan Berat',
    price: '35000',
    discount: '0',
    stock: '25',
    visibility: true,
    status: 'Active' as 'Active' | 'Low Stock' | 'Inactive',
    badge: '' as 'TERPOPULER' | 'BARU' | 'BEST SELLER' | 'NEW' | '',
    isComingSoon: false,
    releaseDate: '',
    image: '/images/ayam_bakar.jpg',
    gallery: '/images/ayam_bakar.jpg',
    description: '',
    ingredients: 'Bahan alami segar, rempah khas Nusantara pilihan.',
    usageAdvice: 'Disajikan hangat bersama nasi pulen.',
    origin: 'Dapur Nefakky',
    calories: '350 Kkal',
    fat: '12g',
    sugar: '5g',
    satFat: '4g',
    maxDeliveryKm: '25'
  });

  // --------------------------------------------------------------------------
  // HANDLERS: MODAL BUKA / SIMPAN / HAPUS
  // --------------------------------------------------------------------------
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormTab('info');
    setProdGallery(['/images/ayam_bakar.jpg']);
    setProdForm({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}-NFK`,
      category: 'Makanan Berat',
      price: '35000',
      discount: '0',
      stock: '25',
      visibility: true,
      status: 'Active',
      badge: '',
      isComingSoon: false,
      releaseDate: '',
      image: '/images/ayam_bakar.jpg',
      gallery: '/images/ayam_bakar.jpg',
      description: '',
      ingredients: 'Bahan alami segar, rempah khas Nusantara pilihan.',
      usageAdvice: 'Disajikan hangat bersama nasi pulen.',
      origin: 'Dapur Nefakky',
      calories: '350 Kkal',
      fat: '12g',
      sugar: '5g',
      satFat: '4g',
      maxDeliveryKm: '25'
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    setProductFormTab('info');
    setProdGallery(Array.isArray(prod.gallery) && prod.gallery.length > 0 ? prod.gallery : [prod.image || '/images/ayam_bakar.jpg']);
    setProdForm({
      name: prod.name,
      sku: prod.sku || `SKU-${prod.id}`,
      category: prod.category || 'Makanan Berat',
      price: String(prod.price || 35000),
      discount: String(prod.discount || 0),
      stock: String(prod.stock || 25),
      visibility: prod.visibility ?? true,
      status: prod.status || 'Active',
      badge: (prod.badge as any) || '',
      isComingSoon: prod.isComingSoon ?? false,
      releaseDate: prod.releaseDate || '',
      image: prod.image || '/images/ayam_bakar.jpg',
      gallery: Array.isArray(prod.gallery) ? prod.gallery.join(', ') : (prod.gallery || prod.image || '/images/ayam_bakar.jpg'),
      description: prod.description || '',
      ingredients: prod.ingredients || 'Bahan alami segar, rempah khas Nusantara pilihan.',
      usageAdvice: prod.usageAdvice || 'Disajikan hangat bersama nasi pulen.',
      origin: (prod as any).origin || 'Dapur Nefakky',
      calories: (prod as any).nutrition?.calories || '350 Kkal',
      fat: (prod as any).nutrition?.fat || '12g',
      sugar: (prod as any).nutrition?.sugar || '5g',
      satFat: (prod as any).nutrition?.saturatedFat || '4g',
      maxDeliveryKm: String(prod.maxDeliveryKm || 25)
    });
    setShowProductModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim()) {
      alert('Nama hidangan wajib diisi!');
      return;
    }

    const payload = {
      name: prodForm.name.trim(),
      sku: prodForm.sku.trim(),
      category: prodForm.category,
      price: parseInt(prodForm.price) || 0,
      discount: parseInt(prodForm.discount) || 0,
      stock: parseInt(prodForm.stock) || 0,
      visibility: prodForm.visibility,
      status: prodForm.status,
      badge: prodForm.badge || undefined,
      isComingSoon: prodForm.isComingSoon,
      releaseDate: prodForm.isComingSoon ? prodForm.releaseDate : undefined,
      image: prodForm.image || '/images/ayam_bakar.jpg',
      gallery: prodGallery,
      description: prodForm.description,
      ingredients: prodForm.ingredients,
      usageAdvice: prodForm.usageAdvice,
      origin: prodForm.origin,
      nutrition: {
        calories: prodForm.calories,
        fat: prodForm.fat,
        sugar: prodForm.sugar,
        saturatedFat: prodForm.satFat
      },
      maxDeliveryKm: parseInt(prodForm.maxDeliveryKm) || 25
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setShowProductModal(false);
  };

  return (
    <div className="flex flex-col w-full text-on-surface space-y-6">
      
      {/* 1. HEADER & ACTION TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight font-['Playfair_Display']">
            Katalog Produk &amp; Stok
          </h1>
          <p className="font-body-base text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Tambah hidangan baru, ubah harga porsi, dan kelola ketersediaan stok menu.
          </p>
        </div>

        {/* Add Product Button */}
        <button 
          type="button"
          onClick={handleOpenAddProduct}
          className="bg-[#934B19] hover:bg-[#7a3e14] text-white px-5 py-2.5 rounded-full font-headline-sm font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* 2. FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/20 shadow-xs">
        
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button 
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all' 
                ? 'bg-primary text-on-primary shadow-xs' 
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Semua Menu ({allProducts.length})
          </button>

          <button 
            type="button"
            onClick={() => setFilterType('active')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'active' 
                ? 'bg-primary text-on-primary shadow-xs' 
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Menu Aktif ({activeCount})
          </button>

          <button 
            type="button"
            onClick={() => setFilterType('comingSoon')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'comingSoon' 
                ? 'bg-primary text-on-primary shadow-xs' 
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Segera Hadir ({comingSoonCount})
          </button>
        </div>

        {/* Search Bar & Category Dropdown */}
        <div className="flex items-center gap-2">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface-container text-on-surface text-xs font-bold px-3 py-2 rounded-xl border border-outline-variant/30 focus:outline-none cursor-pointer"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Makanan Berat">Makanan Berat</option>
            <option value="Minuman">Minuman</option>
            <option value="Menu Hemat">Menu Hemat</option>
            <option value="Camilan">Camilan</option>
            <option value="Dessert">Dessert</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input 
              type="text"
              value={searchProdQuery}
              onChange={(e) => setSearchProdQuery(e.target.value)}
              placeholder="Cari nama menu / SKU..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
            />
          </div>
        </div>
      </div>

      {/* 3. PRODUCT CATALOG GRID / TABLE */}
      <div className="bg-surface-container-lowest shadow-xs rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-outline-variant/20 bg-surface-container-low text-[11px] font-label-caps text-on-surface-variant uppercase font-bold min-w-[700px]">
            <div className="col-span-4">Hidangan &amp; SKU</div>
            <div className="col-span-2">Kategori</div>
            <div className="col-span-2">Harga Porsi</div>
            <div className="col-span-2">Stok / Status</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-surface-container min-w-[700px]">
            {displayedProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-on-surface-variant">
                Tidak ada hidangan yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              displayedProducts.map((prod) => {
                const isComingSoon = prod.isComingSoon;
                const isInactive = prod.status === 'Inactive' || prod.visibility === false;

                return (
                  <div 
                    key={prod.id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low/50 transition-colors text-xs"
                  >
                    {/* Item & SKU (Col 4) */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high shrink-0 shadow-2xs relative">
                        <img 
                          src={prod.image || '/images/ayam_bakar.jpg'} 
                          alt={prod.name} 
                          className="w-full h-full object-cover"
                        />
                        {isComingSoon && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-[9px] font-bold text-amber-300 uppercase">
                            Soon
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-headline-sm font-bold text-on-surface text-xs sm:text-sm truncate">
                          {prod.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono-data text-[10px] text-on-surface-variant">
                            {prod.sku || `SKU-${prod.id.slice(0, 6)}`}
                          </span>
                          {prod.badge && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 font-bold rounded text-[9px] tracking-wider">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Kategori (Col 2) */}
                    <div className="col-span-2 text-on-surface font-medium">
                      {prod.category || 'Makanan Berat'}
                    </div>

                    {/* Harga (Col 2) */}
                    <div className="col-span-2 font-mono-data font-bold text-on-surface">
                      Rp {(prod.price || 0).toLocaleString('id-ID')}
                    </div>

                    {/* Stok / Status (Col 2) */}
                    <div className="col-span-2 flex flex-col">
                      <span className="font-mono-data font-bold text-on-surface">
                        {prod.stock ?? 25} Porsi
                      </span>
                      <span className={`text-[10px] font-bold uppercase mt-0.5 ${
                        isComingSoon 
                          ? 'text-amber-800' 
                          : isInactive 
                          ? 'text-error' 
                          : 'text-emerald-800'
                      }`}>
                        {isComingSoon ? 'Coming Soon' : isInactive ? 'Inactive' : 'Active'}
                      </span>
                    </div>

                    {/* Aksi (Col 2) */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      {/* Toggle Visibility */}
                      <button 
                        type="button"
                        onClick={() => toggleProductVisibility(prod.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                        title={isInactive ? 'Tampilkan Menu' : 'Sembunyikan Menu'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isInactive ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>

                      {/* Edit Button */}
                      <button 
                        type="button"
                        onClick={() => handleOpenEditProduct(prod)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                        title="Edit Hidangan"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      {/* Delete Button */}
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus "${prod.name}" dari katalog?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/50 transition-colors cursor-pointer"
                        title="Hapus Hidangan"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. MODAL TAMBAH / EDIT PRODUK MULTI-TAB (Opaque Solid White) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-white text-stone-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-stone-200 animate-fade-in text-left">
            
            {/* Modal Header (Opaque White) */}
            <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-white">
              <div className="flex flex-col">
                <h2 className="font-display-lg text-lg sm:text-xl text-stone-900 m-0 leading-tight font-bold font-['Playfair_Display']">
                  {editingProduct ? 'Edit Hidangan Menu' : 'Tambah Produk Menu Baru'}
                </h2>
                <span className="font-body-sm text-xs text-stone-500">
                  Lengkapi detail hidangan untuk katalog digital resmi Nefakky.
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowProductModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs (Opaque White) */}
            <div className="px-6 pt-2 flex gap-4 border-b border-stone-200 bg-white text-xs font-semibold">
              <button 
                type="button"
                onClick={() => setProductFormTab('info')}
                className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  productFormTab === 'info'
                    ? 'border-[#934B19] text-[#934B19] font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>Informasi</span>
              </button>

              <button 
                type="button"
                onClick={() => setProductFormTab('media')}
                className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  productFormTab === 'media'
                    ? 'border-[#934B19] text-[#934B19] font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">image</span>
                <span>Foto &amp; Media</span>
              </button>

              <button 
                type="button"
                onClick={() => setProductFormTab('nutrition')}
                className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  productFormTab === 'nutrition'
                    ? 'border-[#934B19] text-[#934B19] font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">restaurant</span>
                <span>Nutrisi &amp; Detail</span>
              </button>
            </div>

            {/* Modal Body (Opaque White) */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="p-6 overflow-y-auto flex-1 bg-white space-y-4 text-xs">
                
                {/* TAB 1: INFORMASI UMUM */}
                {productFormTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Nama Hidangan
                        </label>
                        <input 
                          type="text"
                          required
                          value={prodForm.name}
                          onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                          placeholder="Contoh: Ayam Bakar Madu Spesial"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          SKU / Kode (Opsional)
                        </label>
                        <input 
                          type="text"
                          value={prodForm.sku}
                          onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                          placeholder="#SKU-AUTOGEN"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs font-mono text-stone-900 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Kategori
                        </label>
                        <select 
                          value={prodForm.category}
                          onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-semibold cursor-pointer"
                        >
                          <option value="Makanan Berat">Makanan Berat</option>
                          <option value="Minuman">Minuman</option>
                          <option value="Menu Hemat">Menu Hemat</option>
                          <option value="Camilan">Camilan</option>
                          <option value="Dessert">Dessert</option>
                        </select>
                      </div>

                      {/* Coming Soon Toggle */}
                      <div className="p-3.5 bg-stone-50 rounded-xl flex items-center justify-between border border-stone-200 mt-1">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-stone-900">Menu Segera Hadir</span>
                          <span className="text-[10px] text-stone-500">Tampilkan badge rilis mendatang</span>
                        </div>
                        <input 
                          type="checkbox"
                          checked={prodForm.isComingSoon}
                          onChange={(e) => setProdForm({ ...prodForm, isComingSoon: e.target.checked })}
                          className="w-4 h-4 accent-[#934B19] cursor-pointer"
                        />
                      </div>

                      {prodForm.isComingSoon && (
                        <div className="flex flex-col gap-1">
                          <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                            Estimasi Rilis (Contoh: Sept 2026)
                          </label>
                          <input 
                            type="text"
                            value={prodForm.releaseDate}
                            onChange={(e) => setProdForm({ ...prodForm, releaseDate: e.target.value })}
                            placeholder="Sept 2026"
                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                            Harga (Rp)
                          </label>
                          <input 
                            type="number"
                            required
                            value={prodForm.price}
                            onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                            placeholder="35000"
                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none font-mono text-xs text-stone-900 font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                            Stok Porsi
                          </label>
                          <input 
                            type="number"
                            value={prodForm.stock}
                            onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                            placeholder="25"
                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none font-mono text-xs text-stone-900 font-bold"
                          />
                        </div>
                      </div>

                      {/* Badge Spesial Chips */}
                      <div className="flex flex-col gap-1 mt-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Badge Spesial
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setProdForm({ ...prodForm, badge: prodForm.badge === 'BEST SELLER' ? '' : 'BEST SELLER' })}
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                              prodForm.badge === 'BEST SELLER'
                                ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                            <span>Best Seller</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setProdForm({ ...prodForm, badge: prodForm.badge === 'TERPOPULER' ? '' : 'TERPOPULER' })}
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                              prodForm.badge === 'TERPOPULER'
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">star</span>
                            <span>Terpopuler</span>
                          </button>
                        </div>
                      </div>

                      {/* Deskripsi Singkat */}
                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Deskripsi Hidangan
                        </label>
                        <textarea 
                          rows={3}
                          value={prodForm.description}
                          onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                          placeholder="Ceritakan kelezatan bumbu dan olahan menu ini..."
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FOTO & MEDIA */}
                {productFormTab === 'media' && (
                  <div className="space-y-4 text-xs">
                    
                    {/* 1. Upload dari Galeri Perangkat / Kamera (Mendukung Multi-Foto) */}
                    <div className="p-4 sm:p-5 bg-amber-50/70 rounded-2xl border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:bg-amber-50">
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={handleFileUpload}
                        className="hidden" 
                      />
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-[#934B19] flex items-center justify-center shadow-xs">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">Ambil Foto dari Galeri (Bisa Lebih dari 1 Foto)</h4>
                        <p className="text-stone-500 text-[11px] mt-0.5 max-w-sm">
                          Pilih satu atau beberapa foto hidangan sekaligus (JPG, PNG, WebP) dari galeri perangkat.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Pilih Foto dari Galeri</span>
                      </button>
                    </div>

                    {/* 2. Pilihan Cepat dari Galeri Aset Toko (Bisa Pilih Banyak) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Koleksi Foto Menu Resmi Toko:
                        </label>
                        <span className="text-[10px] text-stone-500 italic">
                          (Klik untuk menambah / menghapus dari galeri)
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2.5 bg-stone-50 rounded-2xl border border-stone-200">
                        {[
                          { name: 'Ayam Bakar', path: '/images/ayam_bakar.jpg' },
                          { name: 'Nasi Bakar', path: '/images/nasi_bakar.jpg' },
                          { name: 'Krecek', path: '/images/krecek.jpg' },
                          { name: 'Gudeg', path: '/images/gudeg.jpg' },
                          { name: 'Garang Asam', path: '/images/garang_asam.jpg' },
                          { name: 'Jus Mangga', path: '/images/jus_mangga.jpg' },
                          { name: 'Jus Sirsak', path: '/images/jus_sirsak.jpg' },
                          { name: 'Jus Jambu', path: '/images/jus_jambu.jpg' },
                        ].map((asset) => {
                          const isInGallery = prodGallery.includes(asset.path);
                          const isPrimary = prodForm.image === asset.path;
                          return (
                            <button
                              key={asset.path}
                              type="button"
                              onClick={() => handleTogglePresetPhoto(asset.path)}
                              className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                                isInGallery 
                                  ? (isPrimary ? 'border-[#934B19] ring-2 ring-amber-400 shadow-md scale-105' : 'border-amber-500 ring-1 ring-amber-300')
                                  : 'border-stone-200 hover:border-stone-400 opacity-60 hover:opacity-100'
                              }`}
                              title={`${asset.name} (Klik untuk ${isInGallery ? 'hapus' : 'tambah'})`}
                            >
                              <img src={asset.path} alt={asset.name} className="w-full h-full object-cover" />
                              {isInGallery && (
                                <div className="absolute inset-0 bg-[#934B19]/30 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white drop-shadow stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. DAFTAR GALERI FOTO TERPILIH (MULTI-FOTO PREVIEW & PENGATURAN FOTO UTAMA) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold">
                            Galeri Foto Menu ({prodGallery.length} Foto Aktif)
                          </label>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                            Multi-Foto Aktif
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500">
                          Klik foto untuk dijadikan <strong>Foto Utama</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        {prodGallery.map((imgUrl, idx) => {
                          const isPrimary = prodForm.image === imgUrl || (!prodForm.image && idx === 0);
                          return (
                            <div 
                              key={idx}
                              className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group bg-white shadow-xs ${
                                isPrimary 
                                  ? 'border-[#934B19] ring-2 ring-amber-400 shadow-md' 
                                  : 'border-stone-200 hover:border-stone-400'
                              }`}
                            >
                              <img 
                                src={imgUrl} 
                                alt={`Foto ${idx + 1}`} 
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => handleSetPrimaryPhoto(imgUrl)}
                              />
                              
                              {/* Badge Foto Utama */}
                              {isPrimary ? (
                                <div className="absolute top-1.5 left-1.5 bg-[#934B19] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                  <span>Utama</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryPhoto(imgUrl)}
                                  className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/70 hover:bg-black text-white text-[9px] font-bold py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-center cursor-pointer"
                                >
                                  Jadikan Utama
                                </button>
                              )}

                              {/* Tombol Hapus Foto */}
                              {prodGallery.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow cursor-pointer transition-transform hover:scale-110"
                                  title="Hapus foto ini dari galeri"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Card Tambah Foto Tambahan */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#934B19] hover:bg-amber-50/50 aspect-square flex flex-col items-center justify-center gap-1.5 text-stone-500 hover:text-[#934B19] transition-all cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold">Tambah Foto</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 3: NUTRISI & DETAIL */}
                {productFormTab === 'nutrition' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Bahan Utama &amp; Rempah
                        </label>
                        <input 
                          type="text"
                          value={prodForm.ingredients}
                          onChange={(e) => setProdForm({ ...prodForm, ingredients: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Saran Penyajian
                        </label>
                        <input 
                          type="text"
                          value={prodForm.usageAdvice}
                          onChange={(e) => setProdForm({ ...prodForm, usageAdvice: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Kalori (Kkal)
                        </label>
                        <input 
                          type="text"
                          value={prodForm.calories}
                          onChange={(e) => setProdForm({ ...prodForm, calories: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Lemak (g)
                        </label>
                        <input 
                          type="text"
                          value={prodForm.fat}
                          onChange={(e) => setProdForm({ ...prodForm, fat: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Gula (g)
                        </label>
                        <input 
                          type="text"
                          value={prodForm.sugar}
                          onChange={(e) => setProdForm({ ...prodForm, sugar: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Lemak Jenuh (g)
                        </label>
                        <input 
                          type="text"
                          value={prodForm.satFat}
                          onChange={(e) => setProdForm({ ...prodForm, satFat: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-stone-200 bg-white flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#934B19] text-white hover:bg-[#783603] transition-colors shadow-md flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <span>Simpan Produk</span>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

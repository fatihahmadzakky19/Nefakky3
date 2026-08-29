'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminProductsTab (src/components/admin/AdminProductsTab.tsx)
 * DESKRIPSI: Konversi 100% presisi dari Stitch MCP HTML/Tailwind
 *            (Katalog Produk & Stok, Toolbar Filter, Grid Table Hidangan,
 *            serta Modal Tambah/Edit Produk Multi-Tab Solid Opaque White
 *            dengan Form Input Alamat Dapur / Lokasi Pengolahan Menu Lengkap).
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
  FolderOpen,
  MapPin,
  Store,
  Building2,
  Navigation
} from 'lucide-react';
import { ProductItem } from '@/context/DataContext';
import { getMapSettings, DEFAULT_CENTRAL_KITCHEN } from '@/lib/mapService';

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
  // STATE MODAL TAMBAH / EDIT PRODUK MULTI-TAB
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
      const matchAddr = ((p as any).kitchenAddress || p.origin || '').toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat && !matchAddr) return false;
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
    stokMangga: '20',
    stokSirsak: '15',
    stokJambu: '15',
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
    origin: 'Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor',
    kitchenAddress: 'Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Kel. Pabuaran, Kec. Bojong Gede, Kab. Bogor, Prov. Jawa Barat',
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
    const defaultAddress = getMapSettings()?.centralKitchen?.address || DEFAULT_CENTRAL_KITCHEN.address;
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
      stokMangga: '20',
      stokSirsak: '15',
      stokJambu: '15',
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
      origin: 'Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor',
      kitchenAddress: defaultAddress,
      calories: '350 Kkal',
      fat: '12g',
      sugar: '5g',
      satFat: '4g',
      maxDeliveryKm: '25'
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    const defaultAddress = getMapSettings()?.centralKitchen?.address || DEFAULT_CENTRAL_KITCHEN.address;
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
      stokMangga: String(prod.variantStocks?.Mangga ?? 20),
      stokSirsak: String(prod.variantStocks?.Sirsak ?? 15),
      stokJambu: String(prod.variantStocks?.Jambu ?? 15),
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
      origin: prod.origin || 'Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor',
      kitchenAddress: (prod as any).kitchenAddress || prod.origin || defaultAddress,
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

    const isDrink = prodForm.category === 'Minuman' || prodForm.name.toLowerCase().includes('jus');
    let finalStock = parseInt(prodForm.stock) || 0;
    let variantStocksObj: { [key: string]: number } | undefined = undefined;

    if (isDrink) {
      variantStocksObj = {
        'Mangga': Math.max(0, parseInt(prodForm.stokMangga) || 0),
        'Sirsak': Math.max(0, parseInt(prodForm.stokSirsak) || 0),
        'Jambu': Math.max(0, parseInt(prodForm.stokJambu) || 0)
      };
      finalStock = variantStocksObj.Mangga + variantStocksObj.Sirsak + variantStocksObj.Jambu;
    }

    const payload: any = {
      name: prodForm.name.trim(),
      sku: prodForm.sku.trim(),
      category: prodForm.category,
      price: parseInt(prodForm.price) || 0,
      discount: parseInt(prodForm.discount) || 0,
      stock: finalStock,
      variantStocks: variantStocksObj,
      visibility: prodForm.visibility,
      status: finalStock === 0 ? 'Low Stock' : prodForm.status,
      badge: prodForm.badge || undefined,
      isComingSoon: prodForm.isComingSoon,
      releaseDate: prodForm.isComingSoon ? prodForm.releaseDate : undefined,
      image: prodForm.image || '/images/ayam_bakar.jpg',
      gallery: prodGallery,
      description: prodForm.description,
      ingredients: prodForm.ingredients,
      usageAdvice: prodForm.usageAdvice,
      origin: prodForm.origin || prodForm.kitchenAddress,
      kitchenAddress: prodForm.kitchenAddress || prodForm.origin,
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
          <p className="font-body-base text-xs sm:text-sm text-on-surface-variant max-w-xl">
            Kelola menu hidangan kuliner Nusantara, status stok harian, foto galeri, alamat dapur pengolahan, serta perilisan produk baru.
          </p>
        </div>

        {/* Action Button: Tambah Menu */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleOpenAddProduct}
            className="px-4 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW & FILTER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button 
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all' 
                ? 'bg-[#25160E] text-white shadow-xs' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Semua Menu ({allProducts.length})
          </button>

          <button 
            type="button"
            onClick={() => setFilterType('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'active' 
                ? 'bg-[#25160E] text-white shadow-xs' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Aktif Dijual ({activeCount})
          </button>

          <button 
            type="button"
            onClick={() => setFilterType('comingSoon')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'comingSoon' 
                ? 'bg-[#25160E] text-white shadow-xs' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Segera Hadir ({comingSoonCount})</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-outline-variant/30 font-semibold cursor-pointer outline-none"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Makanan Berat">Makanan Berat</option>
            <option value="Minuman">Minuman</option>
            <option value="Menu Hemat">Menu Hemat</option>
            <option value="Camilan">Camilan</option>
            <option value="Dessert">Dessert</option>
          </select>

          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input 
              type="text"
              value={searchProdQuery}
              onChange={(e) => setSearchProdQuery(e.target.value)}
              placeholder="Cari nama menu, SKU, alamat..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-xl text-xs text-on-surface placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#934B19] border border-outline-variant/30"
            />
          </div>
        </div>
      </div>

      {/* 3. PRODUCT CATALOG GRID / TABLE */}
      <div className="bg-surface-container-lowest shadow-xs rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-outline-variant/20 bg-surface-container-low text-[11px] font-label-caps text-on-surface-variant uppercase font-bold min-w-[700px]">
            <div className="col-span-4">Hidangan &amp; Asal Dapur</div>
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
                const displayAddress = (prod as any).kitchenAddress || prod.origin || 'Dapur Bojong Gede';

                return (
                  <div 
                    key={prod.id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container-low/50 transition-colors text-xs"
                  >
                    {/* Item & Origin Address (Col 4) */}
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline-sm font-bold text-on-surface text-xs sm:text-sm truncate">
                            {prod.name}
                          </span>
                          {prod.badge && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-[#934B19] rounded text-[8.5px] font-bold uppercase shrink-0">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono-data text-[10px] text-on-surface-variant font-bold">
                            {prod.sku || `SKU-${prod.id.slice(0, 6)}`}
                          </span>
                          <span className="text-[10px] text-stone-400 truncate flex items-center gap-0.5 max-w-[160px]">
                            <MapPin className="w-2.5 h-2.5 text-[#934B19] shrink-0" />
                            <span className="truncate">{displayAddress}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Kategori (Col 2) */}
                    <div className="col-span-2">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container text-[11px] font-medium text-on-surface">
                        {prod.category}
                      </span>
                    </div>

                    {/* Harga (Col 2) */}
                    <div className="col-span-2 font-mono font-bold text-on-surface text-xs">
                      Rp {prod.price.toLocaleString('id-ID')}
                    </div>

                    {/* Stok & Status (Col 2) */}
                    <div className="col-span-2 flex flex-col gap-1">
                      {prod.category === 'Minuman' || prod.id === 'm6' || prod.name.toLowerCase().includes('jus') ? (() => {
                        const vStocks = prod.variantStocks || {};
                        const manggaStock = Number(vStocks.Mangga ?? vStocks.mangga ?? (prod.stock === 40 ? 13 : 20));
                        const sirsakStock = Number(vStocks.Sirsak ?? vStocks.sirsak ?? (prod.stock === 40 ? 14 : 15));
                        const jambuStock = Number(vStocks.Jambu ?? vStocks.jambu ?? (prod.stock === 40 ? 13 : 15));
                        const totalCalculated = manggaStock + sirsakStock + jambuStock;

                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-on-surface">
                                {totalCalculated} Porsi
                              </span>
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 font-bold text-[8.5px] rounded-md">
                                3 Varian
                              </span>
                            </div>
                            
                            <div className="space-y-0.5 text-[10px] font-mono bg-stone-50 p-1.5 rounded-lg border border-stone-200/80 shadow-2xs">
                              <div className="flex justify-between items-center text-stone-700">
                                <span className="flex items-center gap-1 font-sans">
                                  <span>🥭</span>
                                  <span>Mangga:</span>
                                </span>
                                <span className={`font-bold ${manggaStock > 0 ? 'text-emerald-700' : 'text-rose-600 font-extrabold'}`}>
                                  {manggaStock} Porsi
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-stone-700">
                                <span className="flex items-center gap-1 font-sans">
                                  <span>🍈</span>
                                  <span>Sirsak:</span>
                                </span>
                                <span className={`font-bold ${sirsakStock > 0 ? 'text-emerald-700' : 'text-rose-600 font-extrabold'}`}>
                                  {sirsakStock} Porsi
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-stone-700">
                                <span className="flex items-center gap-1 font-sans">
                                  <span>🍓</span>
                                  <span>Jambu:</span>
                                </span>
                                <span className={`font-bold ${jambuStock > 0 ? 'text-emerald-700' : 'text-rose-600 font-extrabold'}`}>
                                  {jambuStock} Porsi
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })() : (
                        <>
                          <span className="font-mono text-xs font-semibold text-on-surface">
                            {prod.stock} Porsi
                          </span>
                          {isComingSoon ? (
                            <span className="text-[10px] font-bold text-amber-600">Rilis {prod.releaseDate || 'Mendatang'}</span>
                          ) : (
                            <span className={`text-[10px] font-bold ${
                              prod.stock <= 0 ? 'text-rose-600' : prod.stock < 10 ? 'text-amber-600' : 'text-emerald-700'
                            }`}>
                              {prod.stock <= 0 ? 'Stok Kosong' : prod.stock < 10 ? 'Stok Menipis' : 'Tersedia'}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Aksi (Col 2) */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button 
                        type="button"
                        onClick={() => toggleProductVisibility(prod.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isInactive ? 'text-stone-400 hover:text-stone-700' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={isInactive ? 'Tampilkan Menu' : 'Sembunyikan Menu'}
                      >
                        {isInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-2 rounded-xl text-stone-600 hover:text-[#934B19] hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Edit Hidangan Menu & Alamat"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus hidangan "${prod.name}" dari katalog?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
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
                  Lengkapi detail hidangan, foto, nutrisi, dan alamat dapur pengolahan untuk katalog resmi Nefakky.
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
                <Info className="w-4 h-4" />
                <span>Informasi &amp; Alamat</span>
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
                <ImageIcon className="w-4 h-4" />
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
                <Store className="w-4 h-4" />
                <span>Nutrisi &amp; Detail</span>
              </button>
            </div>

            {/* Modal Body (Opaque White) */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="p-6 overflow-y-auto flex-1 bg-white space-y-4 text-xs">
                
                {/* TAB 1: INFORMASI UMUM & ALAMAT DAPUR */}
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

                        {prodForm.category !== 'Minuman' && !prodForm.name.toLowerCase().includes('jus') && (
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
                        )}
                      </div>

                      {/* Khusus Minuman / Jus: Input Stok 3 Varian Tersendiri */}
                      {(prodForm.category === 'Minuman' || prodForm.name.toLowerCase().includes('jus')) && (
                        <div className="space-y-2 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <label className="font-label-caps text-amber-950 uppercase text-[11px] font-bold flex items-center gap-1.5">
                              <span>🍹</span>
                              <span>Stok Per Varian Rasa Jus:</span>
                            </label>
                            <span className="font-mono font-bold text-xs bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md">
                              Total: {(parseInt(prodForm.stokMangga) || 0) + (parseInt(prodForm.stokSirsak) || 0) + (parseInt(prodForm.stokJambu) || 0)} Porsi
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-stone-700 truncate">🥭 Jus Mangga</label>
                              <input
                                type="number"
                                min="0"
                                value={prodForm.stokMangga}
                                onChange={(e) => setProdForm({ ...prodForm, stokMangga: e.target.value })}
                                placeholder="20"
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:ring-1 focus:ring-[#934B19] outline-none"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-stone-700 truncate">🍈 Jus Sirsak</label>
                              <input
                                type="number"
                                min="0"
                                value={prodForm.stokSirsak}
                                onChange={(e) => setProdForm({ ...prodForm, stokSirsak: e.target.value })}
                                placeholder="15"
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:ring-1 focus:ring-[#934B19] outline-none"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-stone-700 truncate">🍓 Jus Jambu</label>
                              <input
                                type="number"
                                min="0"
                                value={prodForm.stokJambu}
                                onChange={(e) => setProdForm({ ...prodForm, stokJambu: e.target.value })}
                                placeholder="15"
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:ring-1 focus:ring-[#934B19] outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

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
                            <Flame className="w-3.5 h-3.5 text-amber-600" />
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
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                          rows={2}
                          value={prodForm.description}
                          onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                          placeholder="Ceritakan kelezatan bumbu dan olahan menu ini..."
                          className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 leading-relaxed resize-none"
                        />
                      </div>
                    </div>

                    {/* Full Width Row: Alamat Dapur / Lokasi Pengiriman Menu */}
                    <div className="md:col-span-2 flex flex-col gap-1.5 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                      <div className="flex items-center justify-between">
                        <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#934B19]" />
                          <span>Alamat Lengkap Dapur / Lokasi Pengolahan Menu</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const central = getMapSettings()?.centralKitchen?.address || DEFAULT_CENTRAL_KITCHEN.address;
                            setProdForm(p => ({ 
                              ...p, 
                              kitchenAddress: central,
                              origin: 'Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor'
                            }));
                          }}
                          className="text-[10.5px] text-[#934B19] font-bold hover:underline cursor-pointer flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs"
                          title="Gunakan alamat dapur pusat restoran"
                        >
                          <Navigation className="w-3 h-3 text-[#934B19]" />
                          <span>Pakai Alamat Dapur Utama</span>
                        </button>
                      </div>

                      <textarea 
                        rows={2}
                        value={prodForm.kitchenAddress}
                        onChange={(e) => setProdForm({ ...prodForm, kitchenAddress: e.target.value })}
                        placeholder="Contoh: Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Kel. Pabuaran, Kec. Bojong Gede, Kab. Bogor, Prov. Jawa Barat"
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 leading-relaxed font-medium resize-none shadow-2xs"
                      />
                      <p className="text-[10px] text-stone-500 italic">
                        *Alamat ini digunakan sebagai titik asal penjemputan pesanan dan perhitungan jarak radius pengantaran kurir.
                      </p>
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
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#934B19] text-white flex items-center justify-center shadow">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                              {isPrimary && (
                                <div className="absolute inset-x-0 bottom-0 bg-[#934B19]/90 text-white text-[8px] font-bold py-0.5 text-center">
                                  UTAMA
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Preview Galeri Terpilih */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Foto Galeri Terpasang ({prodGallery.length} Foto):
                        </label>
                        <span className="text-[10px] text-stone-500">
                          Klik foto untuk menjadikannya foto sampul utama
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        {prodGallery.map((imgUrl, idx) => {
                          const isPrimary = prodForm.image === imgUrl;
                          return (
                            <div 
                              key={idx}
                              className={`relative rounded-2xl overflow-hidden aspect-square border-2 shadow-xs group transition-all ${
                                isPrimary ? 'border-[#934B19] ring-2 ring-amber-400' : 'border-stone-200 hover:border-amber-400'
                              }`}
                            >
                              <img 
                                src={imgUrl} 
                                alt={`Galeri ${idx + 1}`} 
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => handleSetPrimaryPhoto(imgUrl)}
                              />
                              
                              {/* Badge Utama */}
                              {isPrimary ? (
                                <div className="absolute bottom-2 left-2 bg-[#934B19] text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow">
                                  Foto Utama
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryPhoto(imgUrl)}
                                  className="absolute bottom-2 left-2 bg-black/60 hover:bg-[#934B19] text-white px-2 py-0.5 rounded-md text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  Jadikan Utama
                                </button>
                              )}

                              {/* Tombol Hapus */}
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

                      <div className="flex flex-col gap-1">
                        <label className="font-label-caps text-stone-700 uppercase text-[11px] font-bold">
                          Asal Masakan / Wilayah
                        </label>
                        <input 
                          type="text"
                          value={prodForm.origin}
                          onChange={(e) => setProdForm({ ...prodForm, origin: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-medium"
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

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  <span>Simpan Produk</span>
                  <Check className="w-4 h-4 text-amber-200" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState } from 'react';
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
  Apple,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { ProductItem, useData } from '@/context/DataContext';

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
  const { softDeleteProduct, restoreProduct, forceDeleteProduct } = useData();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productFormTab, setProductFormTab] = useState<'info' | 'media' | 'nutrition'>('info');
  const [prodGallery, setProdGallery] = useState<string[]>(['/images/ayam_bakar.jpg']);

  const activeProducts = (productList || []).filter(p => !p.isDeleted);
  const trashedProducts = (productList || []).filter(p => p.isDeleted);
  const displayedProducts = viewMode === 'active' ? activeProducts : trashedProducts;

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

    const existingPhotos = Array.isArray(prod.gallery) && prod.gallery.length > 0
      ? prod.gallery.filter(Boolean).slice(0, 5)
      : [prod.image || '/images/ayam_bakar.jpg'];

    setProdGallery(existingPhotos.length > 0 ? existingPhotos : ['/images/ayam_bakar.jpg']);

    setProdForm({
      name: prod.name || '',
      sku: prod.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}-NFK`,
      category: prod.category || 'Makanan Berat',
      price: String(prod.price ?? 35000),
      discount: String(prod.discount ?? 0),
      stock: String(prod.stock ?? 25),
      visibility: prod.visibility !== false,
      status: prod.status || 'Active',
      badge: (prod.badge || '') as any,
      image: prod.image || '/images/ayam_bakar.jpg',
      gallery: existingPhotos.join(', '),
      description: prod.description || '',
      ingredients: prod.ingredients || 'Bahan alami segar, rempah khas Nusantara pilihan.',
      usageAdvice: prod.usageAdvice || 'Disajikan hangat bersama nasi pulen.',
      origin: prod.origin || 'Dapur Nefakky',
      calories: prod.calories || '350 Kkal',
      fat: prod.fat || '12g',
      sugar: prod.sugar || '5g',
      satFat: prod.satFat || '4g',
      maxDeliveryKm: String(prod.maxDeliveryKm ?? 25)
    });
    setShowProductModal(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim()) return;

    const validPhotos = prodGallery.map(s => s.trim()).filter(Boolean).slice(0, 5);
    const mainCover = validPhotos[0] || prodForm.image || '/images/ayam_bakar.jpg';
    const galleryPayload = validPhotos.length > 0 ? validPhotos : [mainCover];

    const productPayload = {
      name: prodForm.name.trim(),
      sku: prodForm.sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}-NFK`,
      category: prodForm.category,
      price: parseFloat(prodForm.price) || 0,
      discount: parseFloat(prodForm.discount) || 0,
      stock: parseInt(prodForm.stock) || 0,
      visibility: prodForm.visibility,
      status: prodForm.status,
      badge: prodForm.badge || null,
      image: mainCover,
      gallery: galleryPayload,
      description: prodForm.description.trim() || 'Hidangan tradisional rumahan otentik khas Nefakky.',
      ingredients: prodForm.ingredients.trim(),
      usageAdvice: prodForm.usageAdvice.trim(),
      origin: prodForm.origin.trim(),
      calories: prodForm.calories.trim(),
      fat: prodForm.fat.trim(),
      sugar: prodForm.sugar.trim(),
      satFat: prodForm.satFat.trim(),
      maxDeliveryKm: parseInt(prodForm.maxDeliveryKm) || 25
    };

    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, productPayload);
      } else {
        addProduct({
          ...productPayload,
          rating: 5.0,
          reviewsCount: 1,
          soldCount: '0 Porsi'
        });
      }
    } catch (err) {
      console.error('Gagal menyimpan produk:', err);
    }

    setShowProductModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#25160e]">Katalog Produk & Stok</h1>
          <p className="text-xs text-[#4f4540]">Tambah hidangan baru, ubah harga porsi, atur stok, dan kelola tempat sampah (soft & force delete).</p>
        </div>
        <button
          onClick={handleOpenAddProduct}
          className="px-5 py-3 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-amber-900/10 shadow-md">
        <button
          onClick={() => setViewMode('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'active'
              ? 'bg-[#25160e] text-white shadow-sm'
              : 'text-[#4f4540] hover:bg-stone-100'
          }`}
        >
          <Apple className="w-4 h-4 text-amber-400" />
          <span>Katalog Aktif ({activeProducts.length})</span>
        </button>

        <button
          onClick={() => setViewMode('trash')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'trash'
              ? 'bg-rose-950 text-rose-200 border border-rose-800/40 shadow-sm'
              : 'text-[#4f4540] hover:bg-stone-100'
          }`}
        >
          <Trash2 className="w-4 h-4 text-rose-500" />
          <span>Tempat Sampah ({trashedProducts.length})</span>
        </button>
      </div>

      {viewMode === 'trash' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Produk di Tempat Sampah tersembunyi dari pelanggan publik. Anda dapat <strong>Pulihkan (Restore)</strong> kembali atau <strong>Hapus Permanen (Force Delete)</strong>.</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[#4f4540] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Hidangan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Porsi</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4">Status / Visibilitas</th>
                <th className="py-3 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-medium">
                    {viewMode === 'trash' ? 'Tempat sampah kosong. Belum ada produk yang terhapus sementara.' : 'Belum ada produk aktif.'}
                  </td>
                </tr>
              ) : (
                displayedProducts.map((prod) => (
                  <tr key={prod.id} className={`hover:bg-[#fbf9f5] ${prod.isDeleted ? 'bg-stone-50/80 opacity-85' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => !prod.isDeleted && handleOpenEditProduct(prod)}
                        className={`flex items-center gap-3 ${!prod.isDeleted ? 'cursor-pointer group' : ''}`}
                      >
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#25160e] shrink-0 group-hover:ring-2 group-hover:ring-[#934b19] transition-all">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-[#25160e] group-hover:text-[#934b19] transition-colors block">{prod.name}</span>
                          <span className="text-[10px] text-[#4f4540]">SKU: {prod.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#4f4540]">{prod.category}</td>
                    <td className="py-3.5 px-4 font-bold text-[#25160e]">
                      Rp {prod.price.toLocaleString('id-ID')}
                      {prod.discount > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-normal">Diskon Rp {prod.discount.toLocaleString('id-ID')}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{prod.stock} Porsi</td>
                    <td className="py-3.5 px-4">
                      {prod.isDeleted ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          🗑️ Terhapus Sementara
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleProductVisibility(prod.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            prod.visibility !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-stone-100 text-stone-500 border-stone-200'
                          }`}
                        >
                          {prod.visibility !== false ? 'Publik' : 'Tersembunyi'}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {prod.isDeleted ? (
                          <>
                            <button
                              onClick={() => {
                                restoreProduct(prod.id);
                                alert(`Produk "${prod.name}" berhasil dipulihkan kembali ke katalog aktif!`);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                              title="Pulihkan Produk ke Katalog Aktif"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Pulihkan</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`PERINGATAN FORCE DELETE!\nApakah Anda YAKIN ingin menghapus produk "${prod.name}" secara PERMANEN?\nData yang dihapus permanen tidak dapat dikembalikan lagi.`)) {
                                  forceDeleteProduct(prod.id);
                                }
                              }}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                              title="Hapus Permanen (Force Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Permanen</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-2 text-[#934b19] hover:bg-amber-100/60 rounded-xl transition-colors"
                              title="Edit Detail Produk"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Pindahkan produk "${prod.name}" ke Tempat Sampah (Soft Delete)?\nProduk akan disembunyikan dari pelanggan dan dapat dipulihkan kapan saja.`)) {
                                  softDeleteProduct(prod.id);
                                }
                              }}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Hapus Sementara (Soft Delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETIL TAMBAH / EDIT PRODUK (3 TABS) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160e]/60 backdrop-blur-md animate-fade-in print:hidden">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-amber-900/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#25160e]">
                  {editingProduct ? `Edit Detail Hidangan: ${editingProduct.name}` : 'Tambah Produk Menu Baru'}
                </h3>
                <p className="text-xs text-[#4f4540]">Lengkapi parameter informasi, galeri foto maksimal 5, dan kandungan nutrisi.</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="text-stone-400 hover:text-[#25160e]">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* TAB SELECTOR HEADER */}
            <div className="flex border-b border-stone-200 gap-6">
              <button
                type="button"
                onClick={() => setProductFormTab('info')}
                className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
                  productFormTab === 'info'
                    ? 'border-[#934b19] text-[#934b19]'
                    : 'border-transparent text-stone-400 hover:text-[#25160e]'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>1. Informasi Utama</span>
              </button>

              <button
                type="button"
                onClick={() => setProductFormTab('media')}
                className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
                  productFormTab === 'media'
                    ? 'border-[#934b19] text-[#934b19]'
                    : 'border-transparent text-stone-400 hover:text-[#25160e]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>2. Foto & Deskripsi</span>
              </button>

              <button
                type="button"
                onClick={() => setProductFormTab('nutrition')}
                className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
                  productFormTab === 'nutrition'
                    ? 'border-[#934b19] text-[#934b19]'
                    : 'border-transparent text-stone-400 hover:text-[#25160e]'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span>3. Komposisi & Nutrisi</span>
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-6 text-xs">
              
              {/* TAB 1: INFORMASI UTAMA */}
              {productFormTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Nama Hidangan / Kuliner *</label>
                      <input
                        type="text"
                        value={prodForm.name}
                        onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                        placeholder="contoh: Ayam Bakar Madu Spesial"
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">SKU Kode Inventaris</label>
                      <input
                        type="text"
                        value={prodForm.sku}
                        onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Kategori</label>
                      <select
                        value={prodForm.category}
                        onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-bold text-xs"
                      >
                        <option value="Makanan Berat">Makanan Berat</option>
                        <option value="Camilan">Camilan</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Paket Hemat">Paket Hemat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Harga Porsi (Rp) *</label>
                      <input
                        type="number"
                        value={prodForm.price}
                        onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-mono font-bold text-xs text-[#934b19]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Diskon Porsi (Rp)</label>
                      <input
                        type="number"
                        value={prodForm.discount}
                        onChange={(e) => setProdForm({ ...prodForm, discount: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Stok Porsi Tersedia</label>
                      <input
                        type="number"
                        value={prodForm.stock}
                        onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Badge Spesial</label>
                      <select
                        value={prodForm.badge}
                        onChange={(e) => setProdForm({ ...prodForm, badge: e.target.value as any })}
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-bold text-xs"
                      >
                        <option value="">Tanpa Badge</option>
                        <option value="TERPOPULER">🔥 TERPOPULER</option>
                        <option value="BEST SELLER">⭐ BEST SELLER</option>
                        <option value="BARU">✨ BARU</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Batas Jarak Delivery (Km)</label>
                      <input
                        type="number"
                        value={prodForm.maxDeliveryKm}
                        onChange={(e) => setProdForm({ ...prodForm, maxDeliveryKm: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-900/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#25160e] block">Status Visibilitas Di Toko</span>
                      <span className="text-[10px] text-[#4f4540]">Tampilkan atau sembunyikan hidangan ini dari katalog pembeli.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, visibility: !prodForm.visibility })}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                        prodForm.visibility
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {prodForm.visibility ? 'Dipublikasikan' : 'Disembunyikan'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: FOTO & DESKRIPSI (MANAJER FOTO MAKSIMAL 5) */}
              {productFormTab === 'media' && (
                <div className="space-y-4">
                  <div className="space-y-2 border border-amber-900/15 p-4 rounded-2xl bg-[#fbf9f5]">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-[#25160e] block">Galeri Foto Makanan (Maksimal 5 Foto)</span>
                        <span className="text-[10px] text-[#4f4540]">Foto pertama otomatis menjadi Cover Utama di katalog.</span>
                      </div>
                      <span className="px-2.5 py-1 bg-[#25160e] text-amber-200 text-[10px] font-bold rounded-full">
                        {prodGallery.length} / 5 Foto
                      </span>
                    </div>

                    {/* Slots grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                      {prodGallery.map((photoUrl, idx) => (
                        <div key={idx} className="relative group bg-white border border-stone-200 rounded-2xl p-2 space-y-1.5 shadow-2xs">
                          <div className="w-full h-24 rounded-xl overflow-hidden bg-stone-100 relative">
                            <img src={photoUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#934b19] text-white text-[8px] font-bold rounded-md">
                                COVER
                              </span>
                            )}
                          </div>
                          
                          <input
                            type="text"
                            value={photoUrl}
                            onChange={(e) => {
                              const updated = [...prodGallery];
                              updated[idx] = e.target.value;
                              setProdGallery(updated);
                            }}
                            className="w-full px-2 py-1 bg-[#fbf9f5] border border-stone-300 rounded-lg text-[9px] font-mono truncate"
                            placeholder="/images/..."
                          />

                          <div className="flex items-center justify-between text-[9px]">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...prodGallery];
                                  const temp = updated[0];
                                  updated[0] = updated[idx];
                                  updated[idx] = temp;
                                  setProdGallery(updated);
                                }}
                                className="text-[#934b19] font-bold hover:underline"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (prodGallery.length === 1) return alert('Minimal harus ada 1 foto!');
                                setProdGallery(prodGallery.filter((_, i) => i !== idx));
                              }}
                              className="text-rose-600 font-bold hover:underline ml-auto"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add photo slot button */}
                      {prodGallery.length < 5 && (
                        <button
                          type="button"
                          onClick={() => {
                            setProdGallery([...prodGallery, '/images/ayam_bakar.jpg']);
                          }}
                          className="h-36 border-2 border-dashed border-amber-900/30 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:text-[#934b19] hover:border-[#934b19] hover:bg-amber-50/50 transition-all p-2"
                        >
                          <Plus className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-bold">Tambah Slot Foto</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#25160e] mb-1">Deskripsi Hidangan</label>
                    <textarea
                      rows={3}
                      value={prodForm.description}
                      onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                      placeholder="Jelaskan keunikan rasa, kelezatan bumbu, dan tekstur hidangan..."
                      className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#25160e] mb-1">Saran Penyajian &amp; Penyimpanan</label>
                    <input
                      type="text"
                      value={prodForm.usageAdvice}
                      onChange={(e) => setProdForm({ ...prodForm, usageAdvice: e.target.value })}
                      placeholder="contoh: Disajikan hangat bersama nasi pulen &amp; sambal terasi."
                      className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: KOMPOSISI & NUTRISI */}
              {productFormTab === 'nutrition' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-[#25160e] mb-1">Bahan & Komposisi Utama</label>
                    <textarea
                      rows={2}
                      value={prodForm.ingredients}
                      onChange={(e) => setProdForm({ ...prodForm, ingredients: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Asal Resep / Dapur</label>
                      <input
                        type="text"
                        value={prodForm.origin}
                        onChange={(e) => setProdForm({ ...prodForm, origin: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Kandungan Kalori</label>
                      <input
                        type="text"
                        value={prodForm.calories}
                        onChange={(e) => setProdForm({ ...prodForm, calories: e.target.value })}
                        placeholder="350 Kkal"
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Total Lemak</label>
                      <input
                        type="text"
                        value={prodForm.fat}
                        onChange={(e) => setProdForm({ ...prodForm, fat: e.target.value })}
                        placeholder="12g"
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Gula</label>
                      <input
                        type="text"
                        value={prodForm.sugar}
                        onChange={(e) => setProdForm({ ...prodForm, sugar: e.target.value })}
                        placeholder="5g"
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#25160e] mb-1">Lemak Jenuh</label>
                      <input
                        type="text"
                        value={prodForm.satFat}
                        onChange={(e) => setProdForm({ ...prodForm, satFat: e.target.value })}
                        placeholder="4g"
                        className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="flex gap-2">
                  {productFormTab !== 'info' && (
                    <button
                      type="button"
                      onClick={() => setProductFormTab(productFormTab === 'nutrition' ? 'media' : 'info')}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4f4540] text-xs font-semibold rounded-2xl"
                    >
                      Kembali
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4f4540] text-xs font-semibold rounded-2xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingProduct ? 'Simpan Perubahan' : 'Simpan Produk Baru'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

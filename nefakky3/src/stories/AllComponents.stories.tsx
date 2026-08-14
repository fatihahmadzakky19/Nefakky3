import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Navbar from '@/components/Navbar';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';
import AutoMapPickerModal from '@/components/AutoMapPickerModal';
import RealtimeOrderTracker from '@/components/RealtimeOrderTracker';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { DataProvider, AdminOrder } from '@/context/DataContext';

const sampleProduct: DetailProduct = {
  id: 'm1',
  name: 'Ayam Bakar Madu Spesial',
  category: 'Makanan Berat',
  price: 35000,
  rating: 4.9,
  reviewsCount: '128',
  soldCount: '450+ Porsi',
  image: '/images/ayam_bakar.jpg',
  description: 'Ayam pejantan pilihan dibakar dengan lumuran bumbu kecap rempah tradisional yang meresap hingga ke tulang.',
  ingredients: 'Ayam Pejantan, Madu, Kecap Manis, Bumbu Rempah.',
  storage: 'Kulkas 2 hari',
  serving: 'Panaskan di microwave 2 menit'
};

const sampleOrder: AdminOrder = {
  id: 'ORD-DEMO-99',
  customerName: 'Fatih Ahmad Zakky',
  avatar: '/images/ayam_bakar.jpg',
  address: 'Jl. Sudirman No. 45, Jakarta Selatan',
  items: [{ id: 'm1', name: 'Ayam Bakar Madu Spesial', quantity: 2, price: 35000, image: '/images/ayam_bakar.jpg' }],
  itemCount: 2,
  paymentMethod: 'Midtrans QRIS',
  paymentBadge: 'PAID',
  deliveryType: 'EXPRESS',
  status: 'COOKING',
  subtotal: 70000,
  shippingCost: 10000,
  discount: 0,
  total: 80000,
  date: '12 Agt 2026',
  createdAt: Date.now()
};

function AllComponentsShowcase() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedAddr, setSelectedAddr] = useState('Jl. Sudirman No. 45, Jakarta Selatan');

  return (
    <div className="bg-[#fbf9f5] min-h-screen pb-20">
      {/* 1. Navbar */}
      <Navbar showSearch searchQuery="" onSearchChange={() => {}} />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        <div className="border-b border-stone-200 pb-4">
          <h1 className="font-serif text-3xl font-bold text-[#25160e]">Showcase Komponen Spesifik Nefakky</h1>
          <p className="text-xs text-stone-600 mt-1">Kumpulan seluruh komponen interaktif dalam project Nefakky3 untuk keperluan Storybook.</p>
        </div>

        {/* 2. Realtime Order Tracker Component */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-[#934b19]">1. RealtimeOrderTracker</h2>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md">
            <RealtimeOrderTracker order={sampleOrder} onConfirmReceived={() => {}} isHighDemand={false} />
          </div>
        </section>

        {/* 3. Modal Buttons & Previews */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#934b19]">2. Modals (MenuDetailModal & AutoMapPickerModal)</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowDetailModal(true)}
              className="px-5 py-2.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md transition-all"
            >
              Buka MenuDetailModal
            </button>

            <button
              onClick={() => setShowMapModal(true)}
              className="px-5 py-2.5 bg-[#25160e] hover:bg-[#3c2a21] text-white text-xs font-bold rounded-2xl shadow-md transition-all"
            >
              Buka AutoMapPickerModal
            </button>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-900/10 text-xs text-[#25160e]">
            <strong>Alamat Terpilih dari AutoMapPickerModal:</strong> {selectedAddr}
          </div>
        </section>
      </main>

      {/* Render Modals when active */}
      {showDetailModal && (
        <MenuDetailModal product={sampleProduct} onClose={() => setShowDetailModal(false)} />
      )}

      <AutoMapPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        initialAddress={selectedAddr}
        onSelectAddress={(addr) => {
          setSelectedAddr(addr);
          setShowMapModal(false);
        }}
      />
    </div>
  );
}

const meta: Meta = {
  title: 'Showcase/AllComponents',
  component: AllComponentsShowcase,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story: any) => (
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <Story />
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    ),
  ],
};

export default meta;

export const ComprehensiveShowcase: StoryObj = {};

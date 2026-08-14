import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MenuDetailModal, { DetailProduct } from './MenuDetailModal';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';

const mockFoodProduct: DetailProduct = {
  id: 'm1',
  name: 'Ayam Bakar Madu Spesial',
  category: 'Makanan Berat',
  price: 35000,
  rating: 4.9,
  reviewsCount: '128',
  soldCount: '450+ Porsi',
  image: '/images/ayam_bakar.jpg',
  description: 'Ayam pejantan pilihan dibakar dengan lumuran bumbu kecap rempah tradisional yang meresap hingga ke tulang. Disajikan lengkap dengan sambal terasi pedas manis, lalapan segar, dan kremesan renyah.',
  ingredients: 'Ayam Pejantan Segar, Madu Murni, Kecap Manis Khas, Bawang Merah, Bawang Putih, Serai, Lengkuas, Ketumbar.',
  storage: 'Simpan di wadah tertutup rapat dalam kulkas hingga 2 hari.',
  serving: 'Panaskan di microwave selama 2 menit atau panggang sebentar di atas teflon.',
  thumbnails: ['/images/ayam_bakar.jpg', '/images/nasi_bakar.jpg', '/images/gudeg.jpg'],
  reviews: [
    {
      id: 'r1',
      author: 'Ahmad Zakky',
      avatar: '/images/ayam_bakar.jpg',
      rating: 5,
      text: 'Ayam bakarnya sangat empuk dan bumbu madunya meresap sampai ke tulang! Porsi cukup kenyang.',
    },
    {
      id: 'r2',
      author: 'Siti Rahma',
      avatar: '/images/gudeg.jpg',
      rating: 5,
      text: 'Sambal terasinya mantap banget, pas dipadu sama bumbu manis gurih ayamnya.',
    }
  ]
};

const mockDrinkProduct: DetailProduct = {
  id: 'm6',
  name: 'Jus Segar (Jambu, Sirsak, Mangga)',
  category: 'Minuman',
  price: 15000,
  rating: 4.8,
  reviewsCount: '95',
  soldCount: '320+ Gelas',
  image: '/images/jus_mangga.jpg',
  description: 'Jus buah murni dingin tanpa pemanis buatan, diolah dari buah segar pilihan murni kaya akan vitamin dan kesegaran alami.',
  ingredients: 'Buah Murni Segar, Es Batu Steril, Gula Cair Alami.',
  storage: 'Sajikan segera dingin atau simpan di kulkas maksimal 24 jam.',
  serving: 'Kocok atau aduk terlebih dahulu sebelum diminum.',
  thumbnails: ['/images/jus_mangga.jpg', '/images/jus_sirsak.jpg', '/images/jus_jambu.jpg'],
};

const meta: Meta<typeof MenuDetailModal> = {
  title: 'Components/MenuDetailModal',
  component: MenuDetailModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story: any) => (
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <div className="bg-[#25160e]/40 min-h-screen flex items-center justify-center p-4">
              <Story />
            </div>
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MenuDetailModal>;

export const FoodDetail: Story = {
  args: {
    product: mockFoodProduct,
    onClose: () => console.log('Modal closed'),
  },
};

export const DrinkDetailWithVariants: Story = {
  args: {
    product: mockDrinkProduct,
    onClose: () => console.log('Modal closed'),
  },
};

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RealtimeOrderTracker from './RealtimeOrderTracker';
import { AdminOrder } from '@/context/DataContext';

const baseOrder: AdminOrder = {
  id: 'ORD-2026-8812',
  customerName: 'Fatih Ahmad Zakky',
  avatar: '/images/ayam_bakar.jpg',
  address: 'Jl. Sudirman No. 45, Jakarta Selatan (Lantai 5 Apt. Executive)',
  items: [
    { id: 'm1', name: 'Ayam Bakar Madu Spesial', quantity: 2, price: 35000, image: '/images/ayam_bakar.jpg' },
    { id: 'm6', name: 'Jus Mangga Segar', quantity: 2, price: 15000, image: '/images/jus_mangga.jpg' }
  ],
  itemCount: 4,
  paymentMethod: 'Midtrans QRIS / GoPay',
  paymentBadge: 'PAID',
  deliveryType: 'EXPRESS',
  status: 'COOKING',
  subtotal: 100000,
  shippingCost: 15000,
  discount: 0,
  total: 115000,
  date: '12 Agt 2026',
  createdAt: Date.now(),
};

const meta: Meta<typeof RealtimeOrderTracker> = {
  title: 'Components/RealtimeOrderTracker',
  component: RealtimeOrderTracker,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story: any) => (
      <div className="bg-[#fbf9f5] p-6 rounded-3xl max-w-2xl mx-auto shadow-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RealtimeOrderTracker>;

export const CookingStatus: Story = {
  args: {
    order: { ...baseOrder, status: 'COOKING' },
    onConfirmReceived: (id: string) => console.log('Confirmed order received:', id),
    isHighDemand: false,
  },
};

export const ShippingStatus: Story = {
  args: {
    order: { ...baseOrder, status: 'SHIPPING' },
    onConfirmReceived: (id: string) => console.log('Confirmed order received:', id),
    isHighDemand: false,
  },
};

export const CompletedStatus: Story = {
  args: {
    order: { ...baseOrder, status: 'COMPLETED' },
    onConfirmReceived: (id: string) => console.log('Confirmed order received:', id),
    isHighDemand: false,
  },
};

export const HighDemandPeakHours: Story = {
  args: {
    order: { ...baseOrder, status: 'COOKING' },
    onConfirmReceived: (id: string) => console.log('Confirmed order received:', id),
    isHighDemand: true,
  },
};

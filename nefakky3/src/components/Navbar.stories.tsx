import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Navbar from './Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { DataProvider } from '@/context/DataContext';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story: any) => (
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <div className="bg-[#fbf9f5] min-h-[300px]">
              <Story />
            </div>
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: {
    showSearch: false,
  },
};

export const WithSearch: Story = {
  args: {
    showSearch: true,
    searchQuery: 'Ayam Bakar Madu',
    onSearchChange: (val: string) => console.log('Search input:', val),
  },
};

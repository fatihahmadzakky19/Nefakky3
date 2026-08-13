import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AutoMapPickerModal from './AutoMapPickerModal';

const meta: Meta<typeof AutoMapPickerModal> = {
  title: 'Components/AutoMapPickerModal',
  component: AutoMapPickerModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story: any) => (
      <div className="bg-[#25160e]/50 min-h-screen flex items-center justify-center p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AutoMapPickerModal>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Map picker closed'),
    onSelectAddress: (address: string, distanceKm: number) => {
      console.log('Selected address:', address, 'Distance:', distanceKm, 'km');
    },
  },
};

export const WithInitialAddress: Story = {
  args: {
    isOpen: true,
    initialAddress: 'Jl. Jend. Sudirman No. 52, Senayan, Kebayoran Baru, Jakarta Selatan',
    onClose: () => console.log('Map picker closed'),
    onSelectAddress: (address: string, distanceKm: number) => {
      console.log('Selected address:', address, 'Distance:', distanceKm, 'km');
    },
  },
};

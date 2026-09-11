import type { Meta, StoryObj } from '@storybook/react';
import MidtransPaymentModal from './MidtransPaymentModal';

const meta: Meta<typeof MidtransPaymentModal> = {
  title: 'Components/MidtransPaymentModal',
  component: MidtransPaymentModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MidtransPaymentModal>;

export const QRISPayment: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    midtransTx: {
      orderId: 'NFK-220725',
      vaNumber: '00020101021226620014COM.GO-JEK.WWW011993600914366400175750210M6640017570303UKE51440014ID.CO.QRIS.WWW0215AID6208688452290303UKE5204751253033605405350005802ID5907Nefakky6005JAMBI61053613462395028A120260901040554RaEZ0P3HIHID0703A016304EA80',
      simulatorUrl: 'https://simulator.sandbox.midtrans.com/qris/index',
      grossAmount: 55000,
      paymentType: 'qris',
      qrString: '00020101021226620014COM.GO-JEK.WWW011993600914366400175750210M6640017570303UKE51440014ID.CO.QRIS.WWW0215AID6208688452290303UKE5204751253033605405350005802ID5907Nefakky6005JAMBI61053613462395028A120260901040554RaEZ0P3HIHID0703A016304EA80',
    },
    midtransStatus: 'pending',
    onCheckStatus: () => console.log('Checking status'),
    finalPayableTotal: 55000,
  },
};

export const VirtualAccountBCA: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close modal'),
    midtransTx: {
      orderId: 'NFK-892102',
      vaNumber: '7001239871234567',
      simulatorUrl: 'https://simulator.sandbox.midtrans.com/bca/va/index',
      grossAmount: 75000,
      paymentType: 'va',
    },
    midtransStatus: 'pending',
    onCheckStatus: () => console.log('Checking status'),
    finalPayableTotal: 75000,
  },
};

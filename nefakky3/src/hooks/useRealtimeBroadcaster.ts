'use client';

/**
 * ============================================================================
 * HOOK: useRealtimeBroadcaster (useRealtimeBroadcaster.ts)
 * ============================================================================
 * Berlangganan (Subscribe) ke channel WebSocket Laravel Reverb secara otomatis.
 * Menerima event realtime pesanan, live chat, stok hidangan, dan notifikasi.
 * ============================================================================
 */

import { useEffect, useCallback } from 'react';
import { getEchoInstance } from '@/lib/echo';

export interface RealtimeOrderPayload {
  type: string;
  order_id: string;
  customer_name?: string;
  total_amount?: number;
  status?: string;
  new_status?: string;
  message?: string;
  timestamp?: string;
  order?: any;
}

export interface RealtimeChatPayload {
  type: string;
  chat_id: string;
  user_email: string;
  user_name: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: string;
  message?: any;
}

export interface RealtimeProductPayload {
  type: string;
  product_id: string;
  name: string;
  stock: number;
  status: string;
  visibility: boolean;
  message?: string;
  timestamp?: string;
  product?: any;
}

export interface RealtimeActivityPayload {
  type: string;
  title: string;
  message: string;
  category: string;
  data?: any;
  timestamp?: string;
}

export interface UseRealtimeBroadcasterOptions {
  onOrderPlaced?: (data: RealtimeOrderPayload) => void;
  onOrderStatusUpdated?: (data: RealtimeOrderPayload) => void;
  onChatMessageSent?: (data: RealtimeChatPayload) => void;
  onProductStockUpdated?: (data: RealtimeProductPayload) => void;
  onActivityLogged?: (data: RealtimeActivityPayload) => void;
  userEmail?: string | null;
  orderId?: string | null;
}

export function useRealtimeBroadcaster(options: UseRealtimeBroadcasterOptions = {}) {
  const {
    onOrderPlaced,
    onOrderStatusUpdated,
    onChatMessageSent,
    onProductStockUpdated,
    onActivityLogged,
    userEmail,
    orderId,
  } = options;

  useEffect(() => {
    const echo = getEchoInstance();
    if (!echo) return;

    // 1. Channel Pesanan ('orders')
    const ordersChannel = echo.channel('orders');
    if (onOrderPlaced) {
      ordersChannel.listen('.order.placed', (data: RealtimeOrderPayload) => {
        onOrderPlaced(data);
      });
    }
    if (onOrderStatusUpdated) {
      ordersChannel.listen('.order.status.updated', (data: RealtimeOrderPayload) => {
        onOrderStatusUpdated(data);
      });
    }

    // 2. Channel Produk ('products')
    const productsChannel = echo.channel('products');
    if (onProductStockUpdated) {
      productsChannel.listen('.product.stock.updated', (data: RealtimeProductPayload) => {
        onProductStockUpdated(data);
      });
    }

    // 3. Channel Live Chat ('chat')
    const chatChannel = echo.channel('chat');
    if (onChatMessageSent) {
      chatChannel.listen('.chat.message.sent', (data: RealtimeChatPayload) => {
        onChatMessageSent(data);
      });
    }

    // 4. Channel Aktivitas Global & Notifikasi ('activity-feed')
    const activityChannel = echo.channel('activity-feed');
    if (onActivityLogged) {
      activityChannel.listen('.activity.logged', (data: RealtimeActivityPayload) => {
        onActivityLogged(data);
      });
    }

    // 5. Channel Khusus Pesanan Spesifik (jika ada orderId)
    let singleOrderChannel: any = null;
    if (orderId && onOrderStatusUpdated) {
      singleOrderChannel = echo.channel(`order.${orderId}`);
      singleOrderChannel.listen('.order.status.updated', (data: RealtimeOrderPayload) => {
        onOrderStatusUpdated(data);
      });
    }

    // 6. Channel Khusus Chat Pengguna (jika ada userEmail)
    let singleChatChannel: any = null;
    if (userEmail && onChatMessageSent) {
      const cleanEmail = userEmail.replace(/[@.]/g, '_');
      singleChatChannel = echo.channel(`chat.${cleanEmail}`);
      singleChatChannel.listen('.chat.message.sent', (data: RealtimeChatPayload) => {
        onChatMessageSent(data);
      });
    }

    return () => {
      try {
        ordersChannel.stopListening('.order.placed');
        ordersChannel.stopListening('.order.status.updated');
        productsChannel.stopListening('.product.stock.updated');
        chatChannel.stopListening('.chat.message.sent');
        activityChannel.stopListening('.activity.logged');
        if (singleOrderChannel) {
          singleOrderChannel.stopListening('.order.status.updated');
        }
        if (singleChatChannel) {
          singleChatChannel.stopListening('.chat.message.sent');
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [
    onOrderPlaced,
    onOrderStatusUpdated,
    onChatMessageSent,
    onProductStockUpdated,
    onActivityLogged,
    userEmail,
    orderId,
  ]);
}

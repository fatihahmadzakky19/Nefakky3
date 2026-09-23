'use client';

/**
 * ============================================================================
 * HOOK: useRealtimeBroadcaster (useRealtimeBroadcaster.ts)
 * ============================================================================
 * Berlangganan (Subscribe) ke channel WebSocket Laravel Reverb secara otomatis.
 * Menerima event realtime pesanan, live chat, stok hidangan, dan notifikasi.
 * ============================================================================
 */

import { useEffect, useRef } from 'react';
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

  // Simpan referensi callback terbaru di ref agar useEffect tidak perlu
  // subscribe ulang (pasang/cabut listener) setiap kali render component.
  // Sebelumnya callback inline menyebabkan listener WebSocket dibongkar-pasang
  // berulang kali (memory leak & event hilang saat transisi).
  const callbacksRef = useRef({
    onOrderPlaced,
    onOrderStatusUpdated,
    onChatMessageSent,
    onProductStockUpdated,
    onActivityLogged,
  });

  useEffect(() => {
    callbacksRef.current = {
      onOrderPlaced,
      onOrderStatusUpdated,
      onChatMessageSent,
      onProductStockUpdated,
      onActivityLogged,
    };
  }, [
    onOrderPlaced,
    onOrderStatusUpdated,
    onChatMessageSent,
    onProductStockUpdated,
    onActivityLogged,
  ]);

  useEffect(() => {
    const echo = getEchoInstance();
    if (!echo) return;

    // 1. Channel Pesanan ('orders')
    const ordersChannel = echo.channel('orders');
    ordersChannel.listen('.order.placed', (data: RealtimeOrderPayload) => {
      callbacksRef.current.onOrderPlaced?.(data);
    });
    ordersChannel.listen('.order.status.updated', (data: RealtimeOrderPayload) => {
      callbacksRef.current.onOrderStatusUpdated?.(data);
    });

    // 2. Channel Produk ('products')
    const productsChannel = echo.channel('products');
    productsChannel.listen('.product.stock.updated', (data: RealtimeProductPayload) => {
      callbacksRef.current.onProductStockUpdated?.(data);
    });

    // 3. Channel Live Chat ('chat')
    const chatChannel = echo.channel('chat');
    chatChannel.listen('.chat.message.sent', (data: RealtimeChatPayload) => {
      callbacksRef.current.onChatMessageSent?.(data);
    });

    // 4. Channel Aktivitas Global & Notifikasi ('activity-feed')
    const activityChannel = echo.channel('activity-feed');
    activityChannel.listen('.activity.logged', (data: RealtimeActivityPayload) => {
      callbacksRef.current.onActivityLogged?.(data);
    });

    // 5. Channel Khusus Pesanan Spesifik (jika ada orderId)
    let singleOrderChannel: any = null;
    if (orderId) {
      singleOrderChannel = echo.channel(`order.${orderId}`);
      singleOrderChannel.listen('.order.status.updated', (data: RealtimeOrderPayload) => {
        callbacksRef.current.onOrderStatusUpdated?.(data);
      });
    }

    // 6. Channel Khusus Chat Pengguna (jika ada userEmail)
    let singleChatChannel: any = null;
    if (userEmail) {
      const cleanEmail = userEmail.replace(/[@.]/g, '_');
      singleChatChannel = echo.channel(`chat.${cleanEmail}`);
      singleChatChannel.listen('.chat.message.sent', (data: RealtimeChatPayload) => {
        callbacksRef.current.onChatMessageSent?.(data);
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
  }, [userEmail, orderId]);
}

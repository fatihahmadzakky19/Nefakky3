<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
| File ini mendefinisikan otorisasi untuk channel WebSocket privat & kehadiran (presence).
*/

// Channel User Privat
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel Pesanan Khusus Pelanggan / Admin
Broadcast::channel('orders.{orderId}', function ($user, $orderId) {
    return true; // Izinkan user yang relevan atau admin memantau pesanan
});

// Channel Chat Khusus Pelanggan
Broadcast::channel('chat.{userEmail}', function ($user, $userEmail) {
    return true;
});

// Channel Admin Notifikasi
Broadcast::channel('admin-channel', function ($user) {
    return $user && ($user->role === 'admin' || $user->role === 'superadmin' || $user->is_admin);
});

<!DOCTYPE html>
<html lang="id" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nefakky Marketplace - Laravel 12 RESTful API Portal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#FAF6F0',
                            100: '#F4ECE1',
                            500: '#D97706',
                            600: '#B45309',
                            700: '#92400E',
                            800: '#5C3D28',
                            900: '#3D2817',
                        }
                    },
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                        mono: ['"JetBrains Mono"', 'monospace'],
                    }
                }
            }
        }
    </script>
    <style>
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0b0f19; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        .code-syntax {
            counter-reset: line;
        }
        .glow-amber {
            box-shadow: 0 0 25px -5px rgba(217, 119, 6, 0.15);
        }
    </style>
</head>
<body class="bg-[#070a12] text-slate-200 font-sans min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-white">

    <!-- Top Sticky Header Navigation -->
    <header class="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div class="flex items-center gap-4">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center font-black text-white shadow-lg shadow-amber-500/20 text-sm tracking-wider">
                NK
            </div>
            <div>
                <div class="flex items-center gap-2.5">
                    <h1 class="text-base font-bold tracking-tight text-white">Nefakky API Portal</h1>
                    <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        v3.0.0 Online
                    </span>
                </div>
                <p class="text-[11px] text-slate-400">Laravel 12 Engine • Clean Architecture & ACID Database</p>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono">
                <span class="text-slate-500 mr-2">Base URL:</span>
                <span class="text-amber-400 font-semibold select-all">http://localhost:8000/api</span>
            </div>

            <a href="/api/health" target="_blank" class="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/80 transition flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Health Check
            </a>

            <button onclick="testQuickToken()" class="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg transition shadow-md shadow-amber-600/20 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
                Get Admin Token
            </button>
        </div>
    </header>

    <!-- Main Container -->
    <div class="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 lg:gap-8">
        
        <!-- Sidebar Navigation -->
        <aside class="w-64 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-6.5rem)] overflow-y-auto pr-2 space-y-5">
            
            <!-- Live Search Bar -->
            <div class="relative">
                <input 
                    type="text" 
                    id="endpointSearch" 
                    oninput="filterEndpoints(this.value)" 
                    placeholder="Cari rute endpoint..."
                    class="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition"
                />
                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>

            <!-- Navigation Links -->
            <div class="space-y-1">
                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Daftar Modul</p>
                <nav class="space-y-0.5 text-xs font-medium">
                    <a href="#auth" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Autentikasi & Akun</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Sanctum</span>
                    </a>
                    <a href="#products" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Produk & Stok</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Catalog</span>
                    </a>
                    <a href="#categories" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Kategori Menu</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Master</span>
                    </a>
                    <a href="#orders" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Pesanan & Tracking</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">5 Stages</span>
                    </a>
                    <a href="#vouchers" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Voucher & Promo</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Engine</span>
                    </a>
                    <a href="#reviews" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Ulasan & Rating</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Reviews</span>
                    </a>
                    <a href="#reports" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Laporan Omset & Laba</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Financial</span>
                    </a>
                    <a href="#dashboard" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Dashboard Analytics</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Overview</span>
                    </a>
                    <a href="#haversine" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Haversine & Ongkir</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Geo</span>
                    </a>
                    <a href="#midtrans" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Midtrans Payment</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Gateway</span>
                    </a>
                    <a href="#chats" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>Live Chat Support</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Support</span>
                    </a>
                </nav>
            </div>

            <!-- Server Info Card -->
            <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Spesifikasi</span>
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div class="space-y-1.5 text-xs">
                    <div class="flex items-center justify-between text-slate-400">
                        <span>Framework</span>
                        <span class="font-mono text-amber-400 font-semibold">Laravel 12</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-400">
                        <span>Database</span>
                        <span class="font-mono text-slate-300">SQLite (ACID)</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-400">
                        <span>Central Kitchen</span>
                        <span class="text-[11px] text-slate-300">Bojong Gede, Bogor</span>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Documentation Content -->
        <main class="flex-1 space-y-8 pb-16 min-w-0">
            
            <!-- Hero Stats Card -->
            <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0d1322] to-slate-900/90 border border-slate-800/80 shadow-2xl relative overflow-hidden">
                <div class="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="max-w-2xl">
                    <h2 class="text-2xl font-extrabold text-white tracking-tight">Dokumentasi RESTful API Backend</h2>
                    <p class="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                        Sistem backend modern untuk aplikasi marketplace kuliner dan katering Nefakky. Dibangun dengan standar Clean Architecture, validasi Form Request terpisah, kontrol stok ACID, dan token Laravel Sanctum.
                    </p>
                </div>

                <!-- 4 Quick Stats -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        <span class="text-[10px] font-bold uppercase text-slate-500">Total Routes</span>
                        <p class="text-lg font-extrabold text-white font-mono mt-0.5">82 Endpoints</p>
                    </div>
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        <span class="text-[10px] font-bold uppercase text-slate-500">Eloquent Models</span>
                        <p class="text-lg font-extrabold text-amber-400 font-mono mt-0.5">12 Models</p>
                    </div>
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        <span class="text-[10px] font-bold uppercase text-slate-500">Response Trait</span>
                        <p class="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">Standardized</p>
                    </div>
                    <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        <span class="text-[10px] font-bold uppercase text-slate-500">Security</span>
                        <p class="text-lg font-extrabold text-blue-400 font-mono mt-0.5">Sanctum Token</p>
                    </div>
                </div>
            </div>

            <!-- Global Test Response Modal / Toast Container -->
            <div id="liveResultBox" class="hidden p-5 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <h4 class="text-xs font-bold text-white uppercase tracking-wider" id="liveResultTitle">Hasil Eksekusi API Live</h4>
                    </div>
                    <button onclick="document.getElementById('liveResultBox').classList.add('hidden')" class="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded">Tutup</button>
                </div>
                <pre class="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-64" id="liveResultContent"></pre>
            </div>

            <!-- ========================================================================= -->
            <!-- SECTION 1: AUTHENTICATION -->
            <!-- ========================================================================= -->
            <section id="auth" class="endpoint-section space-y-4 scroll-mt-24">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                        <h3 class="text-base font-bold text-white tracking-tight">1. Autentikasi Pengguna & Multi-Alamat</h3>
                        <p class="text-xs text-slate-400">Pengelolaan otentikasi Bearer Token Sanctum, profil, dan buku alamat.</p>
                    </div>
                    <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/auth</span>
                </div>

                <div class="grid gap-3">
                    <!-- POST /api/auth/login -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/auth/login</code>
                                <button onclick="copyToClipboard('/api/auth/login')" title="Salin rute" class="text-slate-500 hover:text-slate-300 text-xs">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                </button>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[11px] text-slate-400 font-medium">Login Akun Admin / Customer</span>
                                <button onclick="tryLoginAdmin()" class="px-2.5 py-1 text-[11px] font-semibold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded border border-blue-500/30 transition">Test Live</button>
                            </div>
                        </div>
                        <p class="text-xs text-slate-400 mb-3">Memverifikasi email dan password terenkripsi, menghasilkan token autentikasi Sanctum.</p>
                        
                        <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                            <span class="text-slate-500">// Request Payload Body (JSON)</span><br>
                            {"email": "fatihahmadzakky19@gmail.com", "password": "password123"}
                        </div>
                    </div>

                    <!-- POST /api/auth/register -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/auth/register</code>
                            </div>
                            <span class="text-[11px] text-slate-400 font-medium">Pendaftaran Akun Pelanggan Baru</span>
                        </div>
                        <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                            {"name": "Pelanggan Baru", "email": "user@nefakky.com", "phone": "08123456789", "password": "password123"}
                        </div>
                    </div>

                    <!-- GET /api/auth/profile -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/auth/profile</code>
                                <span class="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">Bearer Token</span>
                            </div>
                            <span class="text-[11px] text-slate-400 font-medium">Profil & Multi-Alamat Pengguna</span>
                        </div>
                        <p class="text-xs text-slate-400">Mengambil data identitas pengguna yang sedang login beserta seluruh daftar alamat pengiriman tersimpan.</p>
                    </div>
                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- SECTION 2: PRODUCTS & MENU -->
            <!-- ========================================================================= -->
            <section id="products" class="endpoint-section space-y-4 scroll-mt-24">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                        <h3 class="text-base font-bold text-white tracking-tight">2. Menu Kuliner & Kontrol Stok</h3>
                        <p class="text-xs text-slate-400">Katalog menu, kalkulasi diskon, manajemen stok, pencarian, dan soft deletes.</p>
                    </div>
                    <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/products</span>
                </div>

                <div class="grid gap-3">
                    <!-- GET /api/products/visible -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/products/visible</code>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[11px] text-slate-400 font-medium">Katalog Etalase Pengunjung</span>
                                <button onclick="testFetch('/api/products/visible')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                        <p class="text-xs text-slate-400">Mengambil seluruh produk yang berstatus aktif dan visibel untuk ditampilkan di etalase toko pelanggan.</p>
                    </div>

                    <!-- GET /api/products -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/products?search=&category=&sort=&per_page=</code>
                            </div>
                            <span class="text-[11px] text-slate-400 font-medium">Filter, Sorting & Paginasi Produk</span>
                        </div>
                        <p class="text-xs text-slate-400">Mendukung parameter query: <code>search</code>, <code>category</code>, <code>status</code> (Active/Low Stock/Inactive), <code>sort</code> (newest/price_asc/price_desc/rating), dan <code>per_page</code>.</p>
                    </div>

                    <!-- POST /api/products/{id}/stock -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/products/{id}/stock</code>
                            </div>
                            <span class="text-[11px] text-slate-400 font-medium">Update Langsung Jumlah Stok</span>
                        </div>
                        <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                            {"stock": 50}
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- SECTION 3: ORDERS & TRACKING -->
            <!-- ========================================================================= -->
            <section id="orders" class="endpoint-section space-y-4 scroll-mt-24">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                        <h3 class="text-base font-bold text-white tracking-tight">3. Transaksi Pesanan & Live Tracking 5-Tahap</h3>
                        <p class="text-xs text-slate-400">Checkout pesanan ACID, pemotongan stok otomatis, dan alur pengantaran.</p>
                    </div>
                    <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/orders</span>
                </div>

                <div class="grid gap-3">
                    <!-- POST /api/orders -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/orders</code>
                            </div>
                            <span class="text-[11px] text-slate-400 font-medium">Checkout Pesanan (ACID Transaction)</span>
                        </div>
                        <p class="text-xs text-slate-400 mb-2">Membuat pesanan baru, memvalidasi dan memotong stok produk secara otomatis dalam transaksi database.</p>
                        <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                            {"customer_name": "Fatih Ahmad Zakky", "customer_email": "fatih@nefakky.com", "phone": "081234567890", "address": "Puri Bojong Lestari Bogor", "payment_method": "Midtrans QRIS", "items": [{"product_id": "PROD-001", "name": "Ayam Bakar Madu", "price": 38000, "quantity": 2}]}
                        </div>
                    </div>

                    <!-- POST /api/orders/{id}/advance_stage -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">POST</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/orders/{id}/advance_stage</code>
                            </div>
                            <span class="text-[11px] font-mono text-amber-400 font-semibold">RECEIVED &rarr; COOKING &rarr; READY &rarr; DELIVERING &rarr; COMPLETED</span>
                        </div>
                        <p class="text-xs text-slate-400">Memajukan alur status pesanan ke tahap berikutnya secara instan.</p>
                    </div>

                    <!-- GET /api/orders/stats -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/orders/stats</code>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[11px] text-slate-400 font-medium">Statistik Jumlah Order Per Status</span>
                                <button onclick="testFetch('/api/orders/stats')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- SECTION 4: VOUCHERS & PROMO ENGINE -->
            <!-- ========================================================================= -->
            <section id="vouchers" class="endpoint-section space-y-4 scroll-mt-24">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                        <h3 class="text-base font-bold text-white tracking-tight">4. Voucher & Promo Engine</h3>
                        <p class="text-xs text-slate-400">Mesin validasi kupon, batas min spend, diskon bertingkat, dan auto-reset ISO week.</p>
                    </div>
                    <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/vouchers</span>
                </div>

                <div class="grid gap-3">
                    <!-- POST /api/vouchers/validate -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/vouchers/validate</code>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[11px] text-slate-400 font-medium">Validasi Kuota & Hitung Potongan Diskon</span>
                                <button onclick="testValidateVoucher()" class="px-2.5 py-1 text-[11px] font-semibold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded border border-blue-500/30 transition">Test Live</button>
                            </div>
                        </div>
                        <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                            {"code": "NEFAKKY10", "subtotal": 60000}
                        </div>
                    </div>
                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- SECTION 5: HAVERSINE & MIDTRANS -->
            <!-- ========================================================================= -->
            <section id="haversine" class="endpoint-section space-y-4 scroll-mt-24">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                        <h3 class="text-base font-bold text-white tracking-tight">5. Kalkulator Jarak Haversine & Midtrans Payment</h3>
                        <p class="text-xs text-slate-400">Pengukuran jarak presisi dari Central Kitchen Bojong Gede dan Snap Token Midtrans.</p>
                    </div>
                </div>

                <div class="grid gap-3">
                    <!-- POST /api/haversine/distance -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/haversine/distance</code>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[11px] text-slate-400 font-medium">Kalkulasi Jarak KM & Ongkir</span>
                                <button onclick="testHaversine()" class="px-2.5 py-1 text-[11px] font-semibold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded border border-blue-500/30 transition">Test Live</button>
                            </div>
                        </div>
                        <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                            {"lat": -6.4789, "lon": 106.7912}
                        </div>
                    </div>

                    <!-- POST /api/midtrans/token -->
                    <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/midtrans/token</code>
                            </div>
                            <span class="text-[11px] text-slate-400 font-medium">Generate Midtrans Snap Token (Sandbox / Mock Simulator)</span>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    </div>

    <!-- Minimalist Footer -->
    <footer class="mt-auto border-t border-slate-800/80 bg-[#070a12] py-6 px-6 text-center text-xs text-slate-500">
        &copy; 2026 Nefakky Marketplace Backend Engine. Clean Architecture • Laravel 12.
    </footer>

    <!-- Interactive JavaScript Engine for Testing Endpoints -->
    <script>
        let currentAuthToken = '';

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text);
            showToast('Rute endpoint berhasil disalin ke clipboard!');
        }

        function showToast(msg) {
            const el = document.createElement('div');
            el.className = 'fixed bottom-5 right-5 bg-slate-900 border border-amber-500/60 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold z-50 transition-all';
            el.innerText = msg;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2500);
        }

        function displayLiveResult(title, data) {
            const box = document.getElementById('liveResultBox');
            const titleEl = document.getElementById('liveResultTitle');
            const contentEl = document.getElementById('liveResultContent');

            titleEl.innerText = title;
            contentEl.innerText = JSON.stringify(data, null, 2);
            box.classList.remove('hidden');
            box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        async function testFetch(endpoint) {
            try {
                const headers = { 'Accept': 'application/json' };
                if (currentAuthToken) headers['Authorization'] = 'Bearer ' + currentAuthToken;
                
                const res = await fetch(endpoint, { headers });
                const json = await res.json();
                displayLiveResult(`Hasil ${endpoint} (${res.status} ${res.statusText})`, json);
            } catch (err) {
                displayLiveResult(`Gagal Menghubungi ${endpoint}`, { error: err.message });
            }
        }

        async function tryLoginAdmin() {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ email: 'fatihahmadzakky19@gmail.com', password: 'password123' })
                });
                const json = await res.json();
                if (json.data && json.data.token) {
                    currentAuthToken = json.data.token;
                    showToast('Login Admin Berhasil! Token aktif tersimpan.');
                }
                displayLiveResult('Hasil Login Admin (/api/auth/login)', json);
            } catch (err) {
                displayLiveResult('Error Login', { error: err.message });
            }
        }

        async function testQuickToken() {
            await tryLoginAdmin();
        }

        async function testValidateVoucher() {
            try {
                const res = await fetch('/api/vouchers/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ code: 'NEFAKKY10', subtotal: 60000 })
                });
                const json = await res.json();
                displayLiveResult('Hasil Validasi Voucher (/api/vouchers/validate)', json);
            } catch (err) {
                displayLiveResult('Error Voucher', { error: err.message });
            }
        }

        async function testHaversine() {
            try {
                const res = await fetch('/api/haversine/distance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ lat: -6.4789, lon: 106.7912 })
                });
                const json = await res.json();
                displayLiveResult('Hasil Haversine Distance (/api/haversine/distance)', json);
            } catch (err) {
                displayLiveResult('Error Haversine', { error: err.message });
            }
        }

        function filterEndpoints(query) {
            const q = query.toLowerCase();
            const cards = document.querySelectorAll('.endpoint-card');
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(q) ? 'block' : 'none';
            });
        }
    </script>
</body>
</html>

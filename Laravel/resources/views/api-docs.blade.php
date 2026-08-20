<!DOCTYPE html>
<html lang="id" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nefakky Marketplace - Laravel 12 Backend Portal</title>
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
        ::-webkit-scrollbar-track { background: #070a12; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
    </style>
</head>
<body class="bg-[#070a12] text-slate-200 font-sans min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-white">

    <!-- Top Sticky Header Navigation -->
    <header class="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div class="flex items-center gap-4">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center font-black text-white shadow-lg shadow-amber-500/20 text-sm tracking-wider">
                NK
            </div>
            <div>
                <div class="flex items-center gap-2.5">
                    <h1 class="text-base font-bold tracking-tight text-white">Nefakky Backend Engine</h1>
                    <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Laravel 12 Active
                    </span>
                </div>
                <p class="text-[11px] text-slate-400">Clean Architecture • ACID Transaction • Multi-DataType Schema</p>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <div class="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono">
                <span class="text-slate-500 mr-2">Base URL:</span>
                <span class="text-amber-400 font-semibold select-all">http://localhost:8000/api</span>
            </div>

            <a href="/api/health" target="_blank" class="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/80 transition flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Health Check
            </a>

            <button onclick="tryLoginAdmin()" class="px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg transition shadow-md shadow-amber-600/20 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
                Get Admin Token
            </button>
        </div>
    </header>

    <!-- Main Sub-Navigation Tab Bar -->
    <div class="border-b border-slate-800/80 bg-[#090d16] sticky top-[57px] z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar">
            <div class="flex items-center gap-1 sm:gap-2 py-2">
                <button onclick="switchMainTab('endpoints')" id="tabBtn-endpoints" class="tab-btn px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    REST API Endpoints (82)
                </button>
                <button onclick="switchMainTab('schema')" id="tabBtn-schema" class="tab-btn px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
                    Skema & Tipe Data Database (12 Tabel)
                </button>
                <button onclick="switchMainTab('data')" id="tabBtn-data" class="tab-btn px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Live Table Data Inspector
                </button>
            </div>
            <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>SQLite DB Active</span>
            </div>
        </div>
    </div>

    <!-- Main Container -->
    <div class="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 lg:gap-8">
        
        <!-- Sidebar Navigation -->
        <aside class="w-64 shrink-0 hidden lg:block sticky top-28 h-[calc(100vh-8.5rem)] overflow-y-auto pr-2 space-y-5">
            
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
                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Daftar Modul Layanan</p>
                <nav class="space-y-0.5 text-xs font-medium">
                    <a href="#auth" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>1. Autentikasi & Akun</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Sanctum</span>
                    </a>
                    <a href="#products" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>2. Produk & Stok</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Catalog</span>
                    </a>
                    <a href="#categories" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>3. Kategori Menu</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Master</span>
                    </a>
                    <a href="#orders" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>4. Pesanan & Tracking</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">5 Stages</span>
                    </a>
                    <a href="#vouchers" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>5. Voucher & Promo</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Engine</span>
                    </a>
                    <a href="#reviews" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>6. Ulasan & Rating</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Reviews</span>
                    </a>
                    <a href="#reports" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>7. Laporan Omset & Laba</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Financial</span>
                    </a>
                    <a href="#dashboard" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>8. Dashboard Analytics</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Overview</span>
                    </a>
                    <a href="#promotions" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>9. Banner Promosi</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Banners</span>
                    </a>
                    <a href="#haversine" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>10. Haversine & Ongkir</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Geo</span>
                    </a>
                    <a href="#midtrans" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>11. Midtrans Payment</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Gateway</span>
                    </a>
                    <a href="#chats" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>12. Live Chat Support</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Support</span>
                    </a>
                    <a href="#settings" class="nav-item flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
                        <span>13. Pengaturan Toko</span>
                        <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Config</span>
                    </a>
                </nav>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 space-y-8 pb-16 min-w-0">
            
            <!-- Global Result Modal Container -->
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
            <!-- TAB 1: REST API ENDPOINTS -->
            <!-- ========================================================================= -->
            <div id="content-endpoints" class="tab-content space-y-8">
                
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
                            <span class="text-[10px] font-bold uppercase text-slate-500">Ragam Tipe Data</span>
                            <p class="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">ENUM & Date</p>
                        </div>
                        <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                            <span class="text-[10px] font-bold uppercase text-slate-500">Security</span>
                            <p class="text-lg font-extrabold text-blue-400 font-mono mt-0.5">Sanctum Token</p>
                        </div>
                    </div>
                </div>

                <!-- SECTION 1: AUTHENTICATION -->
                <section id="auth" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">1. Autentikasi Pengguna & Multi-Alamat</h3>
                            <p class="text-xs text-slate-400">Pengelolaan otentikasi Bearer Token Sanctum, profil, dan buku alamat.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/auth</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/auth/login</code>
                                    <button onclick="copyToClipboard('/api/auth/login')" class="text-slate-500 hover:text-slate-300 text-xs"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-[11px] text-slate-400 font-medium">Login Admin / Customer</span>
                                    <button onclick="tryLoginAdmin()" class="px-2.5 py-1 text-[11px] font-semibold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded border border-blue-500/30 transition">Test Live</button>
                                </div>
                            </div>
                            <p class="text-xs text-slate-400 mb-2">Memverifikasi email dan password, mengembalikan token bearer Sanctum dan data profil lengkap.</p>
                            <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                                <span class="text-slate-500">// Payload Body (JSON)</span><br>
                                {"email": "fatihahmadzakky19@gmail.com", "password": "password123"}
                            </div>
                        </div>

                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/auth/register</code>
                                </div>
                                <span class="text-[11px] text-slate-400 font-medium">Pendaftaran Akun Baru</span>
                            </div>
                        </div>

                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/auth/profile</code>
                                    <span class="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">Bearer Token</span>
                                </div>
                                <span class="text-[11px] text-slate-400 font-medium">Profil & Multi-Alamat Pengguna</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 2: PRODUCTS -->
                <section id="products" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">2. Menu Kuliner & Kontrol Stok</h3>
                            <p class="text-xs text-slate-400">Katalog menu, diskon decimal(5,2), stok unsigned int, dan status enum.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/products</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/products/visible</code>
                                </div>
                                <button onclick="testFetch('/api/products/visible')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                            <p class="text-xs text-slate-400">Mengambil daftar menu aktif yang terlihat di katalog etalase.</p>
                        </div>

                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/products?search=&category=&sort=&per_page=</code>
                                </div>
                                <button onclick="testFetch('/api/products?per_page=5')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>

                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/products/{id}/stock</code>
                                </div>
                                <span class="text-[11px] text-slate-400 font-medium">Update Stok Produk</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 3: CATEGORIES -->
                <section id="categories" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">3. Kategori Menu Kuliner</h3>
                            <p class="text-xs text-slate-400">Master kategori menu, enum tipe kategori, dan urutan tampilan.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/categories</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/categories</code>
                                </div>
                                <button onclick="testFetch('/api/categories')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 4: ORDERS -->
                <section id="orders" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">4. Transaksi Pesanan & Live Tracking 5-Tahap</h3>
                            <p class="text-xs text-slate-400">Alur status enum (RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED), transaksi ACID.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/orders</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/orders</code>
                                </div>
                                <span class="text-[11px] text-slate-400 font-medium">Checkout Pesanan (ACID DB Transaction)</span>
                            </div>
                        </div>

                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">POST</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/orders/{id}/advance_stage</code>
                                </div>
                                <span class="text-[11px] font-mono text-amber-400 font-semibold">RECEIVED &rarr; COOKING &rarr; READY &rarr; DELIVERING &rarr; COMPLETED</span>
                            </div>
                        </div>

                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/orders/stats</code>
                                </div>
                                <button onclick="testFetch('/api/orders/stats')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 5: VOUCHERS -->
                <section id="vouchers" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">5. Voucher & Promo Engine</h3>
                            <p class="text-xs text-slate-400">Validasi kupon promo, aturan min spend, aturan hari date/time, dan reset ISO-week.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/vouchers</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/vouchers/validate</code>
                                </div>
                                <button onclick="testValidateVoucher()" class="px-2.5 py-1 text-[11px] font-semibold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded border border-blue-500/30 transition">Test Live</button>
                            </div>
                            <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                                {"code": "NEFAKKY10", "subtotal": 60000}
                            </div>
                        </div>

                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/vouchers</code>
                                </div>
                                <button onclick="testFetch('/api/vouchers')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 6: REVIEWS -->
                <section id="reviews" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">6. Ulasan & Rating Pelanggan</h3>
                            <p class="text-xs text-slate-400">Rating unsigned tinyint (1-5), ulasan datetime, balasan seller, dan moderasi enum.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/reviews</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/reviews/summary</code>
                                </div>
                                <button onclick="testFetch('/api/reviews/summary')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/reviews</code>
                                </div>
                                <button onclick="testFetch('/api/reviews')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 7: SALES REPORTS -->
                <section id="reports" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">7. Laporan Omset & Finansial</h3>
                            <p class="text-xs text-slate-400">Omset kotor decimal(15,2), laba bersih, total orders, metrik AOV, dan event bazar.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/reports/sales</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/reports/sales?year=2026</code>
                                </div>
                                <button onclick="testFetch('/api/reports/sales?year=2026')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/reports/sales/years</code>
                                </div>
                                <button onclick="testFetch('/api/reports/sales/years')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 8: DASHBOARD -->
                <section id="dashboard" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">8. Dashboard Analytics Admin</h3>
                            <p class="text-xs text-slate-400">Ringkasan eksekutif omset, menu terlaris, stok menipis, dan grafik bulanan.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/dashboard</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/dashboard/overview</code>
                                </div>
                                <button onclick="testFetch('/api/dashboard/overview')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 9: PROMOTIONS -->
                <section id="promotions" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">9. Banner & Event Promosi</h3>
                            <p class="text-xs text-slate-400">Banner promosi visual, status enum, penempatan enum, dan masa aktif datetime.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/promotions</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/promotions</code>
                                </div>
                                <button onclick="testFetch('/api/promotions')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 10: HAVERSINE -->
                <section id="haversine" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">10. Kalkulator Jarak Haversine & Ongkir</h3>
                            <p class="text-xs text-slate-400">Kalkulasi jarak linier GPS presisi decimal(10,7) dari Central Kitchen Bojong Gede Bogor.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/haversine</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/haversine/distance</code>
                                </div>
                                <button onclick="testHaversine()" class="px-2.5 py-1 text-[11px] font-semibold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded border border-blue-500/30 transition">Test Live</button>
                            </div>
                            <div class="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-900">
                                {"lat": -6.4789, "lon": 106.7912}
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 11: MIDTRANS -->
                <section id="midtrans" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">11. Payment Gateway Midtrans</h3>
                            <p class="text-xs text-slate-400">Snap Token generator + Webhook notification handler untuk update status bayar otomatis.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/midtrans</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">POST</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/midtrans/token</code>
                                </div>
                                <span class="text-[11px] text-slate-400 font-medium">Generate Snap Token (Sandbox / Mock)</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 12: CHATS -->
                <section id="chats" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">12. Live Chat Support CS</h3>
                            <p class="text-xs text-slate-400">Pesan percakapan pelanggan dan admin, sent/read datetime, dan media attachment.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/chats</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/chats</code>
                                </div>
                                <button onclick="testFetch('/api/chats')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 13: SETTINGS -->
                <section id="settings" class="endpoint-section space-y-4 scroll-mt-28">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                            <h3 class="text-base font-bold text-white tracking-tight">13. Pengaturan Operasional Toko</h3>
                            <p class="text-xs text-slate-400">Konfigurasi dinamis, koordinat GPS dapur pusat, tarif ongkir dasar, dan pajak PB1.</p>
                        </div>
                        <span class="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">prefix: /api/settings</span>
                    </div>

                    <div class="grid gap-3">
                        <div class="endpoint-card p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GET</span>
                                    <code class="text-xs sm:text-sm font-mono text-slate-200 font-semibold">/api/settings</code>
                                </div>
                                <button onclick="testFetch('/api/settings')" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition">Test Live</button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            <!-- ========================================================================= -->
            <!-- TAB 2: DATABASE SCHEMA & TIPE DATA (12 TABEL) -->
            <!-- ========================================================================= -->
            <div id="content-schema" class="tab-content hidden space-y-8">
                <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0e1628] to-slate-900 border border-amber-500/30 shadow-2xl relative overflow-hidden">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold font-mono border border-amber-500/20">DATABASE INSPECTOR</span>
                                <span class="text-xs text-slate-400 font-mono">SQLite (ACID DB Engine)</span>
                            </div>
                            <h2 class="text-2xl font-black text-white mt-1.5 tracking-tight">Spesifikasi Struktur Tabel & Ragam Tipe Data</h2>
                            <p class="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
                                Seluruh 12 tabel basis data di backend telah dilengkapi dengan tipe data spesifik (ENUM, DATETIME, DATE, TIME, DECIMAL presisi mata uang/GPS, UNSIGNED INTEGER bertingkat, dan batasan panjang karakter).
                            </p>
                        </div>
                        <button onclick="loadLiveSchema()" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Refresh Schema Live
                        </button>
                    </div>

                    <!-- Tipe Data Summary Chips -->
                    <div class="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800/80">
                        <span class="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">ENUM (Status / Role / Method)</span>
                        <span class="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">DATETIME & TIMESTAMP</span>
                        <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">DATE (YYYY-MM-DD)</span>
                        <span class="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">TIME (HH:MM:SS)</span>
                        <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">DECIMAL(12,2) / (10,7)</span>
                        <span class="px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/30 text-xs font-mono font-bold">UNSIGNED INT / SMALLINT / TINYINT</span>
                        <span class="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 text-xs font-mono font-bold">JSON Array</span>
                        <span class="px-2.5 py-1 rounded-lg bg-slate-700/40 text-slate-300 border border-slate-600/40 text-xs font-mono font-bold">STRING(length) & TEXT</span>
                    </div>
                </div>

                <!-- Live Dynamic Schema Grid Container -->
                <div id="schemaGridContainer" class="space-y-6">
                    <div class="text-center py-12">
                        <div class="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        <p class="text-xs text-slate-400 mt-3 font-mono">Memuat struktur skema 12 tabel dari database...</p>
                    </div>
                </div>
            </div>

            <!-- ========================================================================= -->
            <!-- TAB 3: LIVE DATABASE TABLE RECORDS INSPECTOR -->
            <!-- ========================================================================= -->
            <div id="content-data" class="tab-content hidden space-y-6">
                <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-white tracking-tight">Live Table Records Viewer</h2>
                        <p class="text-xs text-slate-400 mt-1">Lihat baris data aktual yang tersimpan di dalam tabel database SQLite.</p>
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="text-xs text-slate-400 font-medium">Pilih Tabel:</label>
                        <select id="tableSelector" onchange="inspectSelectedTable(this.value)" class="bg-slate-950 border border-slate-700 text-xs font-mono text-amber-400 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500">
                            <option value="users">users (Pengguna)</option>
                            <option value="user_addresses">user_addresses (Buku Alamat)</option>
                            <option value="categories">categories (Kategori Menu)</option>
                            <option value="product_items" selected>product_items (Katalog Produk & Stok)</option>
                            <option value="vouchers">vouchers (Voucher Promo)</option>
                            <option value="orders">orders (Transaksi Pesanan)</option>
                            <option value="order_items">order_items (Rincian Item)</option>
                            <option value="user_reviews">user_reviews (Ulasan & Rating)</option>
                            <option value="sales_reports">sales_reports (Laporan Omset)</option>
                            <option value="promotions">promotions (Banner Promo)</option>
                            <option value="chat_messages">chat_messages (Live Chat)</option>
                            <option value="store_settings">store_settings (Pengaturan Toko)</option>
                        </select>
                    </div>
                </div>

                <!-- Table Content Container -->
                <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                            <h3 class="text-sm font-bold text-white font-mono" id="activeTableNameHeader">product_items</h3>
                        </div>
                        <span class="text-xs text-slate-400 font-mono" id="activeTableRowsCount">Memuat data...</span>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                        <table class="w-full text-left text-xs text-slate-300 font-mono" id="liveTableRender">
                            <!-- Injected dynamically by JavaScript -->
                        </table>
                    </div>
                </div>
            </div>

        </main>
    </div>

    <!-- Minimalist Footer -->
    <footer class="mt-auto border-t border-slate-800/80 bg-[#070a12] py-6 px-6 text-center text-xs text-slate-500">
        &copy; 2026 Nefakky Marketplace Backend Engine. Clean Architecture • Laravel 12.
    </footer>

    <!-- Interactive JavaScript Engine -->
    <script>
        let currentAuthToken = '';

        function switchMainTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.className = 'tab-btn px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent transition flex items-center gap-2';
            });

            const targetContent = document.getElementById('content-' + tabId);
            const targetBtn = document.getElementById('tabBtn-' + tabId);
            if (targetContent) targetContent.classList.remove('hidden');
            if (targetBtn) {
                targetBtn.className = 'tab-btn px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30';
            }

            if (tabId === 'schema') {
                loadLiveSchema();
            } else if (tabId === 'data') {
                const sel = document.getElementById('tableSelector');
                inspectSelectedTable(sel ? sel.value : 'product_items');
            }
        }

        async function loadLiveSchema() {
            const container = document.getElementById('schemaGridContainer');
            try {
                const res = await fetch('/api/database/schema');
                const json = await res.json();
                
                if (!json.success || !json.data || !json.data.tables) {
                    container.innerHTML = `<div class="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-xs font-mono">Gagal memuat skema database: ${json.message || 'Error'}</div>`;
                    return;
                }

                let html = '';
                json.data.tables.forEach(tbl => {
                    html += `
                    <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition space-y-4 shadow-xl">
                        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                            <div>
                                <div class="flex items-center gap-2.5">
                                    <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                    <h3 class="text-sm sm:text-base font-extrabold text-white font-mono">${tbl.table_name}</h3>
                                    <span class="text-[11px] text-slate-400 font-medium">(${tbl.label})</span>
                                </div>
                                <p class="text-xs text-slate-400 mt-0.5">${tbl.description}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">${tbl.total_columns} Kolom</span>
                                <span class="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">${tbl.total_rows} Baris Tersimpan</span>
                                <button onclick="quickViewTableData('${tbl.table_name}')" class="px-2.5 py-0.5 rounded bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white text-[11px] font-bold border border-amber-500/30 transition">Lihat Data &rarr;</button>
                            </div>
                        </div>

                        <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                            <table class="w-full text-left text-xs font-mono">
                                <thead class="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                                    <tr>
                                        <th class="p-2.5">Nama Kolom (Field)</th>
                                        <th class="p-2.5">Tipe Data & Ukuran (Type & Length)</th>
                                        <th class="p-2.5">Nullable</th>
                                        <th class="p-2.5">Default Value</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-900 text-slate-300">
                                    ${tbl.columns.map(c => {
                                        let typeBadge = 'bg-slate-800 text-slate-300 border-slate-700';
                                        const typeLower = (c.type_full || c.type_name).toLowerCase();
                                        
                                        if (typeLower.includes('enum') || typeLower.includes('varchar') || typeLower.includes('string')) {
                                            typeBadge = 'bg-purple-950/50 text-purple-300 border-purple-500/30 font-bold';
                                        } else if (typeLower.includes('date') || typeLower.includes('time')) {
                                            typeBadge = 'bg-blue-950/50 text-blue-300 border-blue-500/30 font-bold';
                                        } else if (typeLower.includes('decimal') || typeLower.includes('numeric') || typeLower.includes('float') || typeLower.includes('double')) {
                                            typeBadge = 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30 font-bold';
                                        } else if (typeLower.includes('int')) {
                                            typeBadge = 'bg-orange-950/50 text-orange-300 border-orange-500/30 font-bold';
                                        } else if (typeLower.includes('bool')) {
                                            typeBadge = 'bg-teal-950/50 text-teal-300 border-teal-500/30';
                                        } else if (typeLower.includes('json')) {
                                            typeBadge = 'bg-pink-950/50 text-pink-300 border-pink-500/30';
                                        } else if (typeLower.includes('text')) {
                                            typeBadge = 'bg-amber-950/40 text-amber-300 border-amber-500/20';
                                        }

                                        return `
                                        <tr class="hover:bg-slate-900/50 transition">
                                            <td class="p-2.5 font-bold text-white">${c.name}</td>
                                            <td class="p-2.5">
                                                <span class="px-2 py-0.5 rounded border text-[11px] ${typeBadge}">${c.type_full || c.type_name}</span>
                                            </td>
                                            <td class="p-2.5 ${c.nullable ? 'text-amber-400' : 'text-slate-500'}">${c.nullable ? 'YES' : 'NO'}</td>
                                            <td class="p-2.5 text-slate-400">${c.default !== null ? c.default : '<span class="text-slate-600 italic">null</span>'}</td>
                                        </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    `;
                });

                container.innerHTML = html;
            } catch (err) {
                container.innerHTML = `<div class="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl text-xs font-mono">Error memuat skema: ${err.message}</div>`;
            }
        }

        async function inspectSelectedTable(tableName) {
            const tableRender = document.getElementById('liveTableRender');
            const titleEl = document.getElementById('activeTableNameHeader');
            const countEl = document.getElementById('activeTableRowsCount');
            titleEl.innerText = tableName;
            countEl.innerText = 'Memuat baris...';

            try {
                const res = await fetch(`/api/database/schema/${tableName}`);
                const json = await res.json();
                
                if (!json.success || !json.data) {
                    tableRender.innerHTML = `<tr><td class="p-4 text-red-400 font-mono">Gagal memuat data tabel</td></tr>`;
                    return;
                }

                const cols = json.data.columns || [];
                const rows = json.data.data || [];
                countEl.innerText = `${rows.length} Baris Pertama Terbaca`;

                if (cols.length === 0) {
                    tableRender.innerHTML = `<tr><td class="p-4 text-slate-500 font-mono">Tabel kosong / tidak ditemukan kolom.</td></tr>`;
                    return;
                }

                let html = '<thead class="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]"><tr>';
                cols.forEach(c => {
                    html += `<th class="p-2.5 whitespace-nowrap">${c.name}</th>`;
                });
                html += '</tr></thead><tbody class="divide-y divide-slate-900 text-slate-300">';

                if (rows.length === 0) {
                    html += `<tr><td colspan="${cols.length}" class="p-6 text-center text-slate-500">Belum ada baris data pada tabel ini.</td></tr>`;
                } else {
                    rows.forEach(r => {
                        html += '<tr class="hover:bg-slate-900/60 transition">';
                        cols.forEach(c => {
                            let val = r[c.name];
                            if (val === null || val === undefined) {
                                val = '<span class="text-slate-600 italic">null</span>';
                            } else if (typeof val === 'object') {
                                val = JSON.stringify(val);
                            } else if (typeof val === 'boolean') {
                                val = val ? '<span class="text-emerald-400 font-bold">true</span>' : '<span class="text-slate-500">false</span>';
                            }
                            html += `<td class="p-2.5 whitespace-nowrap text-xs max-w-xs truncate">${val}</td>`;
                        });
                        html += '</tr>';
                    });
                }
                html += '</tbody>';
                tableRender.innerHTML = html;
            } catch (err) {
                tableRender.innerHTML = `<tr><td class="p-4 text-red-400 font-mono">Error: ${err.message}</td></tr>`;
            }
        }

        function quickViewTableData(tableName) {
            switchMainTab('data');
            const sel = document.getElementById('tableSelector');
            if (sel) {
                sel.value = tableName;
                inspectSelectedTable(tableName);
            }
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text);
            showToast('Rute endpoint berhasil disalin!');
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

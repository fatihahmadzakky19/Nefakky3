// Mengimpor fungsi inisialisasi aplikasi Firebase SDK
import { initializeApp, getApps, getApp } from 'firebase/app';
// Mengimpor fungsi-fungsi autentikasi Firebase (Email/Password, Sign In Google, Logout)
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup
} from 'firebase/auth';
// Mengimpor Firestore Database dari Firebase SDK
import { getFirestore } from 'firebase/firestore';
// Mengimpor Realtime Database (RTDB) dari Firebase SDK untuk fitur tracker pesanan live
import { getDatabase } from 'firebase/database';

// Konfigurasi kredensial proyek Firebase Nefakky Marketplace
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCP1_JAH-yhHXWPH6EeTK-TnnYzTl59S0E", // API Key Firebase
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nefakky3.firebaseapp.com", // Domain autentikasi
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://nefakky3-default-rtdb.asia-southeast1.firebasedatabase.app", // URL Realtime DB
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nefakky3", // ID Proyek Firebase
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nefakky3.firebasestorage.app", // Storage Bucket gambar
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "903118383042", // ID Pengirim Pesan
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:903118383042:web:84d5cb1b6863a51be7585b", // App ID unik
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-R2ZTLDN2R9" // Measurement ID Analytics
};

// Inisialisasi Aplikasi Firebase (mencegah inisialisasi ganda jika aplikasi sudah berjalan)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Inisialisasi modul Autentikasi Firebase
const auth = getAuth(app);
// Inisialisasi modul Firestore Database
const db = getFirestore(app);
// Inisialisasi modul Realtime Database (RTDB) untuk sinkronisasi posisi kurir & pesanan
const rtdb = getDatabase(app);
// Inisialisasi Google Auth Provider untuk login sosial menggunakan akun Google
const googleProvider = new GoogleAuthProvider();

// Mengamankan eksportasi instance Firebase untuk digunakan di seluruh aplikasi Next.js
export { 
  app, 
  auth, 
  db,
  rtdb,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup
};



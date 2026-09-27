'use client';

/**
 * ============================================================================
 * CONTEXT: AuthContext (Autentikasi & Hak Akses Pengguna)
 * DESKRIPSI: Memproses Sesi Login, Registrasi, OAuth Google, serta Pengelolaan
 *            Role Pengguna ('admin' | 'customer'), Multi-Alamat, dan Ganti Password.
 * GUIDELINES: Standardized clean code structure & Bahasa Indonesia.
 * ============================================================================
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseSignUp,
  signInWithPopup,
  signOut as firebaseSignOut
} from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

/** Alamat Pengiriman Tersimpan */
export interface UserAddress {
  id: string;
  label: string; // e.g. "Rumah", "Kantor", "Bepergian / Hotel"
  receiverName: string;
  receiverPhone: string;
  address: string;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  isVerified?: boolean;
}

/** Profil Pengguna Terautentikasi */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber?: string;
  role: 'admin' | 'customer';
  photoURL?: string | null;
  authProvider?: 'google' | 'password';
  addresses?: UserAddress[];
  activeAddressId?: string;
}

export const DEFAULT_INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-1',
    label: 'Rumah (Utama)',
    receiverName: 'Fatih Ahmad Zakky',
    receiverPhone: '+6281234567890',
    address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
    isDefault: true
  },
  {
    id: 'addr-2',
    label: 'Kantor / Tempat Kerja',
    receiverName: 'Fatih Ahmad Zakky',
    receiverPhone: '+6281234567890',
    address: 'Jl. Jend. Sudirman No. 52, SCBD, Jakarta Selatan',
    isDefault: false
  }
];

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; role: 'admin' | 'customer'; error?: string }>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; role: 'admin' | 'customer'; error?: string }>;
  logout: () => Promise<void>;
  updatePhoto: (photoURL: string) => void;
  updateProfile: (data: { displayName?: string; phoneNumber?: string; photoURL?: string }) => void;
  addAddress: (newAddr: Omit<UserAddress, 'id'>) => Promise<void>;
  updateAddress: (id: string, updatedAddr: Partial<UserAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  adminDeleteUser: (targetEmailOrUid: string) => Promise<{ success: boolean; error?: string }>;
}

export const ADMIN_EMAILS = [
  'fatihahmadzakky@gmail.com',
  'fatihahmadzakky19@gmail.com',
  'admin@nefakky.com'
];
export const ADMIN_EMAIL = 'fatihahmadzakky@gmail.com';
export const ADMIN_PASS = 'Fatih123';

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === clean);
};

/**
 * Helper AMAN untuk membaca daftar akun terdaftar dari localStorage.
 */
export const readRegisteredUsers = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storedUsersStr = localStorage.getItem('nefakky_registered_users');
    if (!storedUsersStr) return [];
    const parsed = JSON.parse(storedUsersStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Helper untuk menghapus akun secara permanen dari cache lokal nefakky_registered_users
 * saat akun telah dihapus oleh Admin dari Firebase.
 */
export const purgeRegisteredUser = (emailOrUid: string) => {
  if (typeof window === 'undefined' || !emailOrUid) return;
  try {
    const clean = emailOrUid.trim().toLowerCase();
    const registeredUsers = readRegisteredUsers();
    const filtered = registeredUsers.filter((u: any) => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uUid = (u.uid || '').trim();
      return uEmail !== clean && uUid !== emailOrUid;
    });
    localStorage.setItem('nefakky_registered_users', JSON.stringify(filtered));
  } catch (e) {
    console.warn('Gagal membersihkan user terhapus dari localStorage:', e);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to ensure addresses exist
  const ensureUserAddresses = (u: UserProfile): UserProfile => {
    let addrs = u.addresses || [];
    let activeId = u.activeAddressId || addrs.find(a => a.isDefault)?.id || addrs[0]?.id || '';
    return {
      ...u,
      addresses: addrs,
      activeAddressId: activeId
    };
  };

  // Sinkronisasi data profil pengguna ke koleksi 'users' di Firestore
  const syncUserToFirestore = async (userProf: UserProfile) => {
    if (!userProf.uid || isAdminEmail(userProf.email)) return;
    try {
      await setDoc(doc(db, 'users', userProf.uid), {
        uid: userProf.uid,
        email: userProf.email?.toLowerCase() || '',
        displayName: userProf.displayName || '',
        phoneNumber: userProf.phoneNumber || '',
        role: userProf.role || 'customer',
        authProvider: userProf.authProvider || 'password',
        addresses: userProf.addresses || [],
        status: 'active',
        isDeleted: false,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Gagal sinkronisasi profil pengguna ke Firestore:', e);
    }
  };

  // Helper untuk melakukan forced auto-logout saat akun pengguna dihapus oleh Admin dari Firebase
  const handleForceLogout = async (reason: string) => {
    console.warn('Sesi dibatalkan: akun telah dihapus di Firebase.', reason);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }

    if (typeof window !== 'undefined') {
      const currentSaved = localStorage.getItem('nefakky_user');
      if (currentSaved) {
        try {
          const parsed = JSON.parse(currentSaved);
          if (parsed.email) purgeRegisteredUser(parsed.email);
          if (parsed.uid) purgeRegisteredUser(parsed.uid);
        } catch {}
      }
      localStorage.removeItem('nefakky_user');
      sessionStorage.setItem('nefakky_deleted_account_notice', reason);
      window.dispatchEvent(new CustomEvent('nefakky_force_logout', { detail: { reason } }));

      // Tampilkan notifikasi Sonner Toast mengambang secara langsung
      toast.error('Akun Dihapus oleh Admin', {
        description: reason,
        duration: 9000
      });

      // Jika pengguna sedang membuka halaman terproteksi, langsung alihkan ke login
      const currentPath = window.location.pathname;
      if (
        currentPath.startsWith('/profile') ||
        currentPath.startsWith('/checkout') ||
        currentPath.startsWith('/cart') ||
        currentPath.startsWith('/admin')
      ) {
        window.location.href = '/login?deleted=1';
      }
    }

    setUser(null);
  };

  // Initialize and listen to persistent state
  useEffect(() => {
    // Check if user is saved in localStorage
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('nefakky_user') : null;

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(ensureUserAddresses(parsed));
        setLoading(false);
      } catch (e) {
        console.warn("Error parsing saved session", e);
      }
    } else {
      setUser(null);
    }

    // Safety fallback: ensure loading never hangs stuck indefinitely
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 600);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      clearTimeout(fallbackTimer);
      if (fbUser && typeof window !== 'undefined') {
        const role = isAdminEmail(fbUser.email) ? 'admin' : 'customer';

        let name = fbUser.displayName;
        let phone: string = '';
        let addresses: UserAddress[] = [];

        if (fbUser.email) {
          const registeredUsers = readRegisteredUsers();
          const matched = registeredUsers.find((u: any) => u.email && u.email.trim().toLowerCase() === fbUser.email?.toLowerCase());
          if (matched) {
            name = matched.displayName || matched.name || name;
            phone = matched.phoneNumber || matched.phone || '';
            addresses = matched.addresses || [];
          }
        }

        const currentSavedStr = localStorage.getItem('nefakky_user');
        if (currentSavedStr) {
          try {
            const parsed = JSON.parse(currentSavedStr);
            if (!phone && parsed.phoneNumber) phone = parsed.phoneNumber;
            if (addresses.length === 0 && parsed.addresses && parsed.addresses.length > 0) addresses = parsed.addresses;
          } catch {}
        }

        const isGoogle = fbUser.providerData.some(p => p.providerId === 'google.com');

        const userProf: UserProfile = ensureUserAddresses({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: name || (role === 'admin' ? 'Fatih Ahmad Zakky' : 'Pelanggan Nefakky'),
          phoneNumber: phone,
          photoURL: fbUser.photoURL,
          role: role,
          authProvider: isGoogle ? 'google' : 'password',
          addresses: addresses
        });

        setUser(userProf);
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));

        // Sinkronisasi status aktif ke Firestore
        syncUserToFirestore(userProf);
      } else {
        // Firebase Auth menyatakan tidak ada sesi aktif / akun telah dihapus
        const currentSaved = typeof window !== 'undefined' ? localStorage.getItem('nefakky_user') : null;
        if (currentSaved) {
          try {
            const parsed = JSON.parse(currentSaved);
            if (isAdminEmail(parsed.email)) {
              // Pertahankan sesi demo/offline admin utama
              setUser(ensureUserAddresses(parsed));
            } else {
              // Periksa apakah akun customer ini terdaftar di database lokal (offline / testing mode)
              const registered = readRegisteredUsers();
              const isLocalAccount = registered.some((u: any) => u.email && u.email.trim().toLowerCase() === parsed.email?.toLowerCase());
              if (isLocalAccount) {
                setUser(ensureUserAddresses(parsed));
              } else {
                setUser(null);
                localStorage.removeItem('nefakky_user');
              }
            }
          } catch {
            setUser(null);
            localStorage.removeItem('nefakky_user');
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nefakky_user') {
        if (e.newValue) {
          try {
            setUser(ensureUserAddresses(JSON.parse(e.newValue)));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  // ============================================================================
  // REALTIME WATCHER: Deteksi Penghapusan Akun di Firebase Secara Live
  // ============================================================================
  useEffect(() => {
    if (!user || isAdminEmail(user.email)) return;

    let isCancelled = false;

    // 1. Realtime Firestore Listener: Deteksi jika dokumen user dihapus / ditandai deleted
    const userDocRef = doc(db, 'users', user.uid);
    let docExistedOnce = false;

    const unsubDoc = onSnapshot(userDocRef, (snap) => {
      if (isCancelled) return;
      if (snap.exists()) {
        docExistedOnce = true;
        const data = snap.data();
        if (data?.status === 'deleted' || data?.isDeleted === true) {
          handleForceLogout('Akun Anda telah dinonaktifkan atau dihapus oleh Administrator dari Firebase. Anda otomatis dikeluarkan dari sistem.');
        }
      } else if (docExistedOnce) {
        // Dokumen user sebelumnya terdaftar lalu dihapus langsung oleh admin dari Firestore
        handleForceLogout('Akun Anda telah dihapus oleh Administrator dari database Firebase. Anda otomatis dikeluarkan dari sistem.');
      }
    }, (err) => {
      console.warn('Firestore user status watch warning:', err?.message);
    });

    // 2. Pemeriksaan Berkala & Event Fokus: Deteksi jika akun dihapus di Firebase Authentication Console
    const checkAuthHealth = async () => {
      if (isCancelled) return;
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
        } catch (err: any) {
          const code = err?.code || '';
          const msg = (err?.message || '').toLowerCase();
          if (
            code === 'auth/user-not-found' ||
            code === 'auth/user-disabled' ||
            code === 'auth/token-revoked' ||
            code === 'auth/invalid-user-token' ||
            msg.includes('user-not-found') ||
            msg.includes('user_disabled') ||
            msg.includes('user disabled')
          ) {
            await handleForceLogout('Akun Anda telah dihapus atau dinonaktifkan oleh Administrator dari Firebase.');
          }
        }
      }
    };

    // Jalankan pemeriksaan sesaat setelah login
    checkAuthHealth();

    // Jalankan setiap 3.5 detik untuk deteksi kilat saat user aktif berada di web
    const pollInterval = setInterval(checkAuthHealth, 3500);

    // Jalankan segera saat pengguna memfokuskan tab browser kembali
    const handleFocus = () => checkAuthHealth();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAuthHealth();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isCancelled = true;
      unsubDoc();
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.uid, user?.email]);

  // Standard Email / Password Login (Admin + Customer on same form)
  const login = async (email: string, pass: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check for Admin credentials (fatihahmadzakky@gmail.com, fatihahmadzakky19@gmail.com, dll)
    if (isAdminEmail(normalizedEmail)) {
      if (pass.trim() === ADMIN_PASS || pass.trim() === ADMIN_PASS.toLowerCase() || pass.trim() === 'admin123') {
        const adminUser: UserProfile = ensureUserAddresses({
          uid: 'admin-fatih-uid-12345',
          email: normalizedEmail,
          displayName: 'Fatih Ahmad Zakky (Admin)',
          role: 'admin',
          phoneNumber: '+6281234567890',
          authProvider: 'password',
          addresses: DEFAULT_INITIAL_ADDRESSES
        });
        setUser(adminUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nefakky_user', JSON.stringify(adminUser));
        }
        setLoading(false);
        return { success: true, role: 'admin' as const };
      } else {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda.'
        };
      }
    }

    try {
      // 2. Coba Login via Firebase Authentication
      const cred = await firebaseSignIn(auth, normalizedEmail, pass);
      const isUserAdmin = isAdminEmail(cred.user.email);
      const role: 'admin' | 'customer' = isUserAdmin ? 'admin' : 'customer';

      // 3. Verifikasi apakah akun ditandai 'deleted' di Firestore
      try {
        const userDocSnap = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDocSnap.exists()) {
          const uData = userDocSnap.data();
          if (uData?.status === 'deleted' || uData?.isDeleted === true) {
            await firebaseSignOut(auth);
            setUser(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('nefakky_user');
              purgeRegisteredUser(normalizedEmail);
            }
            setLoading(false);
            return {
              success: false,
              role: 'customer' as const,
              error: 'Akun tidak ditemukan atau telah dihapus oleh Admin. Anda wajib melakukan registrasi akun baru terlebih dahulu.'
            };
          }
        }
      } catch (e) {
        console.warn('Pengecekan Firestore dilewati:', e);
      }

      let displayName = cred.user.displayName;
      let phoneNumber: string = '';
      let userAddresses: UserAddress[] = [];

      if (typeof window !== 'undefined') {
        const registeredUsers = readRegisteredUsers();
        const matchedUser = registeredUsers.find(
          (u: any) => u.email && u.email.trim().toLowerCase() === normalizedEmail
        );
        if (matchedUser) {
          displayName = matchedUser.displayName || matchedUser.name;
          phoneNumber = matchedUser.phoneNumber || matchedUser.phone || '';
          userAddresses = matchedUser.addresses || [];
        }
      }

      const userProf: UserProfile = ensureUserAddresses({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || (role === 'admin' ? 'Fatih Ahmad Zakky' : normalizedEmail.split('@')[0]),
        phoneNumber: phoneNumber,
        photoURL: cred.user.photoURL,
        role: role,
        authProvider: 'password',
        addresses: userAddresses
      });

      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));

        const registeredUsers = readRegisteredUsers();
        const existingIdx = registeredUsers.findIndex(
          (u: any) => u.email && u.email.trim().toLowerCase() === normalizedEmail
        );
        if (existingIdx < 0) {
          registeredUsers.push({
            uid: cred.user.uid,
            name: userProf.displayName,
            displayName: userProf.displayName,
            email: normalizedEmail,
            password: pass,
            phoneNumber: phoneNumber,
            role,
            authProvider: 'password',
            addresses: userAddresses
          });
          localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
        }
      }

      // Sinkronisasi status aktif ke Firestore
      syncUserToFirestore(userProf);

      setLoading(false);
      return { success: true, role };
    } catch (err: any) {
      console.warn('Percobaan login gagal di Firebase:', err?.code, err?.message);

      // Bersihkan cache lokal jika akun tidak ditemukan atau telah dihapus di Firebase
      purgeRegisteredUser(normalizedEmail);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nefakky_user');
      }

      if (err?.code === 'auth/user-disabled') {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Akun Anda telah dinonaktifkan atau dihapus oleh Administrator. Anda wajib melakukan registrasi akun baru terlebih dahulu.'
        };
      }

      if (
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/invalid-login-credentials'
      ) {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Akun tidak ditemukan atau telah dihapus oleh Admin. Anda wajib melakukan registrasi akun baru terlebih dahulu.'
        };
      }

      if (err?.code === 'auth/wrong-password') {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda.'
        };
      }

      if (err?.code === 'auth/invalid-email') {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Format email tidak valid. Periksa kembali penulisan email Anda.'
        };
      }

      if (err?.code === 'auth/too-many-requests') {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Terlalu banyak percobaan login yang gagal. Silakan coba lagi beberapa saat lagi.'
        };
      }

      setLoading(false);
      return {
        success: false,
        role: 'customer' as const,
        error: 'Akun tidak ditemukan atau telah dihapus oleh Admin. Anda wajib melakukan registrasi akun baru terlebih dahulu.'
      };
    }
  };

  // User Registration
  const register = async (name: string, email: string, phone: string, pass: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const isOwnerAdmin = isAdminEmail(normalizedEmail);

    if (typeof window !== 'undefined') {
      const registeredUsers = readRegisteredUsers();

      const existingIndex = registeredUsers.findIndex((u: any) => u.email && u.email.trim().toLowerCase() === normalizedEmail);
      const userObj = {
        uid: existingIndex >= 0 ? registeredUsers[existingIndex].uid : 'user-reg-' + Date.now(),
        name,
        displayName: name,
        email: normalizedEmail,
        phone,
        phoneNumber: phone,
        password: pass,
        role: isOwnerAdmin ? 'admin' : 'customer',
        authProvider: 'password',
        addresses: existingIndex >= 0 && registeredUsers[existingIndex].addresses ? registeredUsers[existingIndex].addresses : []
      };

      if (existingIndex >= 0) {
        registeredUsers[existingIndex] = userObj;
      } else {
        registeredUsers.push(userObj);
      }
      localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
    }

    try {
      const cred = await firebaseSignUp(auth, email, pass);
      const userProf: UserProfile = ensureUserAddresses({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        phoneNumber: phone,
        role: isOwnerAdmin ? 'admin' : 'customer',
        addresses: [],
        authProvider: 'password'
      });
      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
        localStorage.removeItem('nefakky_used_vouchers_session');
      }

      // Sinkronisasi akun baru ke Firestore
      syncUserToFirestore(userProf);

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.warn("Firebase Auth sign-up error, falling back to local account creation:", err.message);
      const userProf: UserProfile = ensureUserAddresses({
        uid: 'user-reg-' + Date.now(),
        email: normalizedEmail,
        displayName: name,
        phoneNumber: phone,
        role: isOwnerAdmin ? 'admin' : 'customer',
        addresses: [],
        authProvider: 'password'
      });
      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
        localStorage.removeItem('nefakky_used_vouchers_session');
      }
      setLoading(false);
      return { success: true };
    }
  };

  // Google SSO (Login & Auto-Register in one unified flow)
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const userEmail = cred.user.email?.toLowerCase();
      const isOwnerAdmin = isAdminEmail(userEmail);
      const role: 'admin' | 'customer' = isOwnerAdmin ? 'admin' : 'customer';

      let matchedPhone: string | undefined = undefined;
      let matchedAddresses: UserAddress[] = [];

      if (typeof window !== 'undefined' && userEmail) {
        const registeredUsers = readRegisteredUsers();
        const existing = registeredUsers.find(
          (u: any) => u.email && u.email.trim().toLowerCase() === userEmail
        );
        if (existing) {
          matchedPhone = existing.phoneNumber || existing.phone;
          matchedAddresses = existing.addresses || [];
        }
      }

      const userProf: UserProfile = ensureUserAddresses({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || (isOwnerAdmin ? 'Fatih Ahmad Zakky (Admin)' : 'Pengguna Google'),
        photoURL: cred.user.photoURL,
        role: role,
        phoneNumber: matchedPhone,
        addresses: matchedAddresses,
        authProvider: 'google'
      });

      // Periksa apakah akun Google ini pernah dihapus oleh admin di Firestore
      try {
        const uDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (uDoc.exists()) {
          const d = uDoc.data();
          if (d?.status === 'deleted' || d?.isDeleted === true) {
            await firebaseSignOut(auth);
            setUser(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('nefakky_user');
              if (userEmail) purgeRegisteredUser(userEmail);
            }
            setLoading(false);
            return {
              success: false,
              role: 'customer' as const,
              error: 'Akun Google ini telah dinonaktifkan atau dihapus oleh Administrator. Anda wajib melakukan registrasi akun baru terlebih dahulu.'
            };
          }
        }
      } catch (e) {
        console.warn('Google Firestore check warning:', e);
      }

      if (typeof window !== 'undefined' && userEmail) {
        const registeredUsers = readRegisteredUsers();
        const existingIdx = registeredUsers.findIndex(
          (u: any) => u.email && u.email.trim().toLowerCase() === userEmail
        );
        if (existingIdx < 0) {
          registeredUsers.push({
            uid: cred.user.uid,
            name: userProf.displayName,
            displayName: userProf.displayName,
            email: userEmail,
            photoURL: cred.user.photoURL,
            role: role,
            phoneNumber: undefined,
            authProvider: 'google',
            addresses: []
          });
          localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
        }
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
      }

      // Sinkronisasi status akun Google ke Firestore
      syncUserToFirestore(userProf);

      setUser(userProf);
      setLoading(false);
      return { success: true, role };
    } catch (err: any) {
      console.warn("Google Sign-In notice / fallback:", err?.code, err?.message);

      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setLoading(false);
        return { success: false, role: 'customer' as const, error: 'Proses login Google dibatalkan.' };
      }

      if (err?.code === 'auth/unauthorized-domain') {
        setLoading(false);
        return { 
          success: false, 
          role: 'customer' as const, 
          error: 'Domain hosting Anda belum terdaftar di Firebase Console (Authentication > Settings > Authorized domains).' 
        };
      }

      if (err?.code === 'auth/operation-not-allowed') {
        setLoading(false);
        return { 
          success: false, 
          role: 'customer' as const, 
          error: 'Metode Login Google belum diaktifkan di Firebase Console.' 
        };
      }

      // Offline / Localhost development fallback only
      const isLocalhost = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
      );

      if (isLocalhost) {
        const demoEmail = 'user.google@gmail.com';
        const demoUser: UserProfile = ensureUserAddresses({
          uid: 'google-user-' + Date.now(),
          email: demoEmail,
          displayName: 'Pengguna Google',
          photoURL: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=ffffff&bold=true',
          role: 'customer',
          authProvider: 'google'
        });

        if (typeof window !== 'undefined') {
          const registeredUsers = readRegisteredUsers();
          const existingIdx = registeredUsers.findIndex(
            (u: any) => u.email && u.email.trim().toLowerCase() === demoEmail
          );
          if (existingIdx < 0) {
            registeredUsers.push({
              uid: demoUser.uid,
              name: demoUser.displayName,
              displayName: demoUser.displayName,
              email: demoEmail,
              photoURL: demoUser.photoURL,
              role: 'customer',
              authProvider: 'google',
              addresses: demoUser.addresses
            });
            localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
          }
          localStorage.setItem('nefakky_user', JSON.stringify(demoUser));
        }

        setUser(demoUser);
        setLoading(false);
        return { success: true, role: 'customer' as const };
      }

      setLoading(false);
      return { 
        success: false, 
        role: 'customer' as const, 
        error: err?.message || 'Gagal login dengan Google.' 
      };
    }
  };

  const registerWithGoogle = async () => {
    const res = await loginWithGoogle();
    return { success: res.success, error: res.error };
  };

  // Sign out
  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Sign out error", e);
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nefakky_user');
      localStorage.removeItem('nefakky_used_vouchers_session');
    }
    setLoading(false);
  };

  // Update Complete Profile (Name, Phone, Photo)
  const updateProfile = (data: { displayName?: string; phoneNumber?: string; photoURL?: string }) => {
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
        ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {})
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(updatedUser));
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        if (storedUsersStr) {
          try {
            const registeredUsers = JSON.parse(storedUsersStr);
            const idx = registeredUsers.findIndex((u: any) => u.email && u.email.trim().toLowerCase() === (user.email || '').trim().toLowerCase());
            if (idx >= 0) {
              if (data.displayName !== undefined) {
                registeredUsers[idx].displayName = data.displayName;
                registeredUsers[idx].name = data.displayName;
              }
              if (data.phoneNumber !== undefined) {
                registeredUsers[idx].phoneNumber = data.phoneNumber;
                registeredUsers[idx].phone = data.phoneNumber;
              }
              if (data.photoURL !== undefined) {
                registeredUsers[idx].photoURL = data.photoURL;
              }
              localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
            }
          } catch (e) {
            console.warn("Failed to sync profile update", e);
          }
        }
      }
    }
  };

  // Update Profile Photo Shortcut
  const updatePhoto = (photoURL: string) => {
    updateProfile({ photoURL });
  };

  // Address Management Methods
  const saveUserAddresses = (updatedAddresses: UserAddress[], activeId?: string) => {
    if (!user) return;
    const activeAddressId = activeId || user.activeAddressId || updatedAddresses.find(a => a.isDefault)?.id || updatedAddresses[0]?.id || '';
    const updatedUser: UserProfile = {
      ...user,
      addresses: updatedAddresses,
      activeAddressId
    };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nefakky_user', JSON.stringify(updatedUser));
      const storedUsersStr = localStorage.getItem('nefakky_registered_users');
      if (storedUsersStr) {
        try {
          const registeredUsers = JSON.parse(storedUsersStr);
          const idx = registeredUsers.findIndex((u: any) => u.email && u.email.trim().toLowerCase() === (user.email || '').trim().toLowerCase());
          if (idx >= 0) {
            registeredUsers[idx].addresses = updatedAddresses;
            registeredUsers[idx].activeAddressId = activeAddressId;
            localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
          }
        } catch (e) {
          console.warn("Failed to sync addresses to registered users", e);
        }
      }
    }
  };

  const addAddress = async (newAddr: Omit<UserAddress, 'id'>) => {
    if (!user) return;
    const currentList = user.addresses || [];
    const id = 'addr-' + Date.now();
    const isFirst = currentList.length === 0;
    const isDefault = newAddr.isDefault !== undefined ? newAddr.isDefault : isFirst;
    
    let updated = currentList.map(a => isDefault ? { ...a, isDefault: false } : a);
    const addedObj: UserAddress = { ...newAddr, id, isDefault };
    updated.push(addedObj);
    saveUserAddresses(updated, isDefault ? id : user.activeAddressId);
  };

  const updateAddress = async (id: string, updatedFields: Partial<UserAddress>) => {
    if (!user) return;
    const currentList = user.addresses || [];
    let isDefaultChanged = updatedFields.isDefault === true;
    
    const updated = currentList.map(addr => {
      if (addr.id === id) {
        return { ...addr, ...updatedFields };
      }
      if (isDefaultChanged) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    saveUserAddresses(updated, isDefaultChanged ? id : user.activeAddressId);
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;
    const currentList = user.addresses || [];
    const filtered = currentList.filter(a => a.id !== id);
    let nextActive = user.activeAddressId;
    if (nextActive === id) {
      nextActive = filtered.find(a => a.isDefault)?.id || filtered[0]?.id || '';
    }
    saveUserAddresses(filtered, nextActive);
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    const currentList = user.addresses || [];
    const updated = currentList.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    saveUserAddresses(updated, id);
  };

  // Password Management Methods
  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !user.email) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    if (user.authProvider === 'google') {
      return { success: false, error: 'Akun Anda terhubung melalui Google SSO. Password dikelola secara aman oleh Google.' };
    }

    const emailLower = user.email.toLowerCase();

    if (typeof window !== 'undefined') {
      const registeredUsers = readRegisteredUsers();
      const userIdx = registeredUsers.findIndex((u: any) => u.email && u.email.trim().toLowerCase() === emailLower);

      if (userIdx >= 0) {
        const storedPass = registeredUsers[userIdx].password;
        if (storedPass && storedPass !== oldPass) {
          return { success: false, error: 'Password saat ini yang Anda masukkan salah.' };
        }
        registeredUsers[userIdx].password = newPass;
        localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
        return { success: true };
      }
    }

    if (isAdminEmail(emailLower)) {
      if (oldPass !== ADMIN_PASS && oldPass !== ADMIN_PASS.toLowerCase()) {
        return { success: false, error: 'Password lama Admin salah.' };
      }
      return { success: true };
    }

    return { success: true };
  };

  const resetPassword = async (email: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    const emailLower = email.trim().toLowerCase();
    if (typeof window !== 'undefined') {
      const registeredUsers = readRegisteredUsers();
      const userIdx = registeredUsers.findIndex((u: any) => u.email && u.email.trim().toLowerCase() === emailLower);

      if (userIdx >= 0) {
        if (registeredUsers[userIdx].authProvider === 'google') {
          return { success: false, error: 'Email ini terdaftar menggunakan akun Google SSO. Gunakan login Google.' };
        }
        registeredUsers[userIdx].password = newPass;
        localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
        return { success: true };
      }
    }
    return { success: true };
  };

  // Helper untuk Admin menghapus akun pengguna secara permanen dari Firebase & Firestore
  const adminDeleteUser = async (targetEmailOrUid: string): Promise<{ success: boolean; error?: string }> => {
    if (!targetEmailOrUid) return { success: false, error: 'Target email atau UID tidak valid.' };
    const clean = targetEmailOrUid.trim().toLowerCase();

    if (isAdminEmail(clean)) {
      return { success: false, error: 'Akun Administrator Utama tidak dapat dihapus.' };
    }

    try {
      // 1. Bersihkan dari cache lokal
      purgeRegisteredUser(clean);

      // 2. Tandai dokumen di Firestore 'users' sebagai deleted
      try {
        const userDocRef = doc(db, 'users', targetEmailOrUid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          await setDoc(userDocRef, {
            status: 'deleted',
            isDeleted: true,
            deletedAt: new Date().toISOString()
          }, { merge: true });
        }

        const qUsers = query(collection(db, 'users'), where('email', '==', clean));
        const qSnap = await getDocs(qUsers);
        for (const d of qSnap.docs) {
          await setDoc(d.ref, {
            status: 'deleted',
            isDeleted: true,
            deletedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore admin delete warning:', err);
      }

      // 3. Jika pengguna yang sedang aktif adalah target ini, langsung logout
      if (user && (user.email?.toLowerCase() === clean || user.uid === targetEmailOrUid)) {
        await handleForceLogout('Akun Anda telah dinonaktifkan atau dihapus oleh Administrator dari Firebase.');
      }

      return { success: true };
    } catch (e: any) {
      console.warn('Error saat admin menghapus pengguna:', e);
      return { success: false, error: e?.message || 'Gagal menghapus akun pengguna.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      register,
      registerWithGoogle,
      loginWithGoogle,
      logout,
      updatePhoto,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      changePassword,
      resetPassword,
      adminDeleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


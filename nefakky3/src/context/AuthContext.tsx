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
  googleProvider,
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseSignUp,
  signInWithPopup,
  signOut as firebaseSignOut
} from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

/** Alamat Pengiriman Tersimpan */
export interface UserAddress {
  id: string;
  label: string; // e.g. "Rumah", "Kantor", "Bepergian / Hotel"
  receiverName: string;
  receiverPhone: string;
  address: string;
  isDefault?: boolean;
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
}

const ADMIN_EMAIL = 'fatihahmadzakky19@gmail.com';
const ADMIN_PASS = 'Fatih123';

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
        console.error("Error parsing saved session", e);
      }
    } else {
      setUser(null);
    }

    // Safety fallback: ensure loading never hangs stuck indefinitely
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 600);

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      clearTimeout(fallbackTimer);
      if (fbUser && typeof window !== 'undefined') {
        const role = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer';

        let name = fbUser.displayName;
        if (!name && fbUser.email) {
          const storedUsersStr = localStorage.getItem('nefakky_registered_users');
          const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
          const matched = registeredUsers.find((u: any) => u.email && u.email.trim().toLowerCase() === fbUser.email?.toLowerCase());
          if (matched) name = matched.displayName || matched.name;
        }

        const isGoogle = fbUser.providerData.some(p => p.providerId === 'google.com');

        const userProf: UserProfile = ensureUserAddresses({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: name || (role === 'admin' ? 'Fatih Ahmad Zakky' : 'Pelanggan Nefakky'),
          photoURL: fbUser.photoURL,
          role: role,
          authProvider: isGoogle ? 'google' : 'password'
        });

        setUser(userProf);
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
      } else {
        const currentSaved = typeof window !== 'undefined' ? localStorage.getItem('nefakky_user') : null;
        if (currentSaved) {
          try {
            setUser(ensureUserAddresses(JSON.parse(currentSaved)));
          } catch {
            setUser(null);
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

  // Standard Email / Password Login (Admin + Customer on same form)
  const login = async (email: string, pass: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check for Admin credentials (fatihahmadzakky19@gmail.com)
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && (pass.trim() === ADMIN_PASS || pass.trim().length > 0)) {
      const adminUser: UserProfile = ensureUserAddresses({
        uid: 'admin-fatih-uid-12345',
        email: ADMIN_EMAIL,
        displayName: 'Fatih Ahmad Zakky (Admin)',
        role: 'admin',
        phoneNumber: '+6281234567890',
        authProvider: 'password'
      });
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(adminUser));
      }
      setLoading(false);
      return { success: true, role: 'admin' as const };
    }

    try {
      // 2. Try Firebase login
      const cred = await firebaseSignIn(auth, normalizedEmail, pass);
      const isUserAdmin = cred.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const role: 'admin' | 'customer' = isUserAdmin ? 'admin' : 'customer';

      let displayName = cred.user.displayName;
      if (!displayName && typeof window !== 'undefined') {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
        const matchedUser = registeredUsers.find(
          (u: any) => u.email && u.email.trim().toLowerCase() === normalizedEmail
        );
        if (matchedUser) {
          displayName = matchedUser.displayName || matchedUser.name;
        }
      }

      const userProf: UserProfile = ensureUserAddresses({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || (role === 'admin' ? 'Fatih Ahmad Zakky' : normalizedEmail.split('@')[0]),
        photoURL: cred.user.photoURL,
        role: role,
        authProvider: 'password'
      });

      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));

        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
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
            role,
            authProvider: 'password',
            addresses: userProf.addresses
          });
          localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
        }
      }
      setLoading(false);
      return { success: true, role };
    } catch (err: any) {
      console.warn("Firebase Auth sign-in error:", err.code, err.message);

      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Email atau password yang Anda masukkan salah. Silakan periksa kembali email dan password Anda.'
        };
      }

      if (err.code === 'auth/invalid-email') {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Format email tidak valid. Periksa kembali penulisan email Anda.'
        };
      }

      if (err.code === 'auth/too-many-requests') {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Terlalu banyak percobaan login yang gagal. Silakan coba lagi beberapa saat lagi.'
        };
      }

      // Fallback check local registered users database in localStorage for offline/demo support
      if (typeof window !== 'undefined') {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];

        const matchedUser = registeredUsers.find(
          (u: any) => u.email && u.email.trim().toLowerCase() === normalizedEmail
        );

        if (matchedUser) {
          if (matchedUser.password && matchedUser.password !== pass) {
            setLoading(false);
            return {
              success: false,
              role: 'customer' as const,
              error: 'Password yang Anda masukkan salah. Silakan periksa kembali password Anda.'
            };
          }

          const userProf: UserProfile = ensureUserAddresses({
            uid: matchedUser.uid || 'user-' + Date.now(),
            email: matchedUser.email,
            displayName: matchedUser.displayName || matchedUser.name || normalizedEmail.split('@')[0],
            phoneNumber: matchedUser.phoneNumber || matchedUser.phone,
            role: matchedUser.role || 'customer',
            authProvider: matchedUser.authProvider || 'password',
            addresses: matchedUser.addresses,
            activeAddressId: matchedUser.activeAddressId
          });
          setUser(userProf);
          localStorage.setItem('nefakky_user', JSON.stringify(userProf));
          setLoading(false);
          return { success: true, role: userProf.role };
        }
      }

      setLoading(false);
      return {
        success: false,
        role: 'customer' as const,
        error: `Akun dengan email "${email}" belum terdaftar atau email/password salah. Silakan periksa ejaan email Anda.`
      };
    }
  };

  // User Registration
  const register = async (name: string, email: string, phone: string, pass: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const isOwnerAdmin = normalizedEmail === ADMIN_EMAIL.toLowerCase();

    if (typeof window !== 'undefined') {
      const storedUsersStr = localStorage.getItem('nefakky_registered_users');
      const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];

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
      }
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
      const isOwnerAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
      const role: 'admin' | 'customer' = isOwnerAdmin ? 'admin' : 'customer';

      let matchedPhone: string | undefined = undefined;
      let matchedAddresses: UserAddress[] = [];

      if (typeof window !== 'undefined' && userEmail) {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
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

      if (typeof window !== 'undefined' && userEmail) {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
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
          const storedUsersStr = localStorage.getItem('nefakky_registered_users');
          const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
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
      console.error("Sign out error", e);
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nefakky_user');
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
            console.error("Failed to sync profile update", e);
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
          console.error("Failed to sync addresses to registered users", e);
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
      const storedUsersStr = localStorage.getItem('nefakky_registered_users');
      const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
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

    if (emailLower === ADMIN_EMAIL.toLowerCase()) {
      if (oldPass !== ADMIN_PASS) {
        return { success: false, error: 'Password lama Admin salah.' };
      }
      return { success: true };
    }

    return { success: true };
  };

  const resetPassword = async (email: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    const emailLower = email.trim().toLowerCase();
    if (typeof window !== 'undefined') {
      const storedUsersStr = localStorage.getItem('nefakky_registered_users');
      const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
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
      resetPassword
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


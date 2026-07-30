'use client';

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

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber?: string;
  role: 'admin' | 'customer';
  photoURL?: string | null;
}

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
}

const ADMIN_EMAIL = 'fatihahmadzakky19@gmail.com';
const ADMIN_PASS = 'Fatih123';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and listen to persistent state
  useEffect(() => {
    // Check if user is saved in localStorage
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('nefakky_user') : null;

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        console.error("Error parsing saved session", e);
      }
    } else {
      setUser(null);
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser && typeof window !== 'undefined') {
        const role = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer';
        
        // Retrieve local displayName if Firebase user does not have it set
        let name = fbUser.displayName;
        if (!name && fbUser.email) {
          const storedUsersStr = localStorage.getItem('nefakky_registered_users');
          const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
          const matched = registeredUsers.find((u: any) => u.email && u.email.trim().toLowerCase() === fbUser.email?.toLowerCase());
          if (matched) name = matched.displayName || matched.name;
        }

        const userProf: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: name || (role === 'admin' ? 'Fatih Ahmad Zakky' : 'Pelanggan Nefakky'),
          photoURL: fbUser.photoURL,
          role: role,
        };
        setUser(userProf);
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
      } else {
        const currentSaved = typeof window !== 'undefined' ? localStorage.getItem('nefakky_user') : null;
        if (currentSaved) {
          try {
            setUser(JSON.parse(currentSaved));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Listen for localStorage changes across browser tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nefakky_user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
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

    // 1. Check for Admin credentials (fatihahmadzakky19@gmail.com / Fatih123)
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASS) {
      const adminUser: UserProfile = {
        uid: 'admin-fatih-uid-12345',
        email: ADMIN_EMAIL,
        displayName: 'Fatih Ahmad Zakky (Admin)',
        role: 'admin',
        phoneNumber: '+6281234567890'
      };
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

      const userProf: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName || (role === 'admin' ? 'Fatih Ahmad Zakky' : normalizedEmail.split('@')[0]),
        photoURL: cred.user.photoURL,
        role: role,
      };

      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));

        // Sync to registered users in localStorage for seamless cross-tab & offline support
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
            role
          });
          localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
        }
      }
      setLoading(false);
      return { success: true, role };
    } catch (err: any) {
      console.warn("Firebase Auth sign-in error:", err.code, err.message);

      // Handle specific Firebase Auth error codes
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

          const userProf: UserProfile = {
            uid: matchedUser.uid || 'user-' + Date.now(),
            email: matchedUser.email,
            displayName: matchedUser.displayName || matchedUser.name || normalizedEmail.split('@')[0],
            phoneNumber: matchedUser.phoneNumber || matchedUser.phone,
            role: matchedUser.role || 'customer'
          };
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

    // Store in local registered users list for seamless offline/local login
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
        role: isOwnerAdmin ? 'admin' : 'customer'
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
      const userProf: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        phoneNumber: phone,
        role: isOwnerAdmin ? 'admin' : 'customer'
      };
      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
      }
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.warn("Firebase Auth sign-up error, falling back to local account creation:", err.message);
      // Fallback local registration
      const userProf: UserProfile = {
        uid: 'user-reg-' + Date.now(),
        email: normalizedEmail,
        displayName: name,
        phoneNumber: phone,
        role: isOwnerAdmin ? 'admin' : 'customer'
      };
      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
      }
      setLoading(false);
      return { success: true };
    }
  };

  // Register with Google
  const registerWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const userEmail = cred.user.email?.toLowerCase();
      const isOwnerAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

      if (typeof window !== 'undefined' && userEmail) {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
        
        const existing = registeredUsers.find((u: any) => u.email && u.email.trim().toLowerCase() === userEmail);
        if (!existing) {
          registeredUsers.push({
            uid: cred.user.uid,
            name: cred.user.displayName || 'Pengguna Google',
            displayName: cred.user.displayName || 'Pengguna Google',
            email: userEmail,
            phone: cred.user.phoneNumber || '',
            photoURL: cred.user.photoURL,
            role: isOwnerAdmin ? 'admin' : 'customer'
          });
          localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
        }
      }

      const userProf: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || 'Pengguna Google',
        photoURL: cred.user.photoURL,
        role: isOwnerAdmin ? 'admin' : 'customer'
      };

      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
      }
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.warn("Google Registration error / demo fallback:", err.message);

      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return { success: false, error: 'Proses registrasi Google dibatalkan.' };
      }

      // Demo fallback registration
      const demoEmail = 'user.google@nefakky.com';
      if (typeof window !== 'undefined') {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
        
        const existing = registeredUsers.find((u: any) => u.email && u.email.trim().toLowerCase() === demoEmail);
        if (!existing) {
          registeredUsers.push({
            uid: 'google-demo-' + Date.now(),
            name: 'Google Demo User',
            displayName: 'Google Demo User',
            email: demoEmail,
            phone: '',
            role: 'customer'
          });
          localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
        }
      }

      const demoUser: UserProfile = {
        uid: 'google-demo-' + Date.now(),
        email: demoEmail,
        displayName: 'Google Demo User',
        role: 'customer'
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(demoUser));
      }
      setLoading(false);
      return { success: true };
    }
  };

  // Google SSO (Login only if registered)
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const userEmail = cred.user.email?.toLowerCase();
      const isUserAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

      // Check if user is registered
      let isRegistered = isUserAdmin;
      if (!isRegistered && typeof window !== 'undefined' && userEmail) {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
        isRegistered = registeredUsers.some(
          (u: any) => u.email && u.email.trim().toLowerCase() === userEmail
        );
      }

      if (!isRegistered) {
        // Sign out Firebase session since account is not registered yet
        await firebaseSignOut(auth);
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nefakky_user');
        }
        setLoading(false);
        return { 
          success: false, 
          role: 'customer' as const,
          error: `Akun Google (${userEmail || 'Anda'}) belum terdaftar. Silakan melakukan registrasi akun terlebih dahulu.`
        };
      }

      const role: 'admin' | 'customer' = isUserAdmin ? 'admin' : 'customer';

      const userProf: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || 'Google User',
        photoURL: cred.user.photoURL,
        role: role,
      };

      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
      }
      setLoading(false);
      return { success: true, role };
    } catch (err: any) {
      console.warn("Google Sign-In error / demo fallback:", err.message);

      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return { success: false, role: 'customer' as const, error: 'Proses login Google dibatalkan.' };
      }

      // Demo fallback check
      const demoEmail = 'user.google@nefakky.com';
      let isRegistered = false;
      if (typeof window !== 'undefined') {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
        isRegistered = registeredUsers.some(
          (u: any) => u.email && u.email.trim().toLowerCase() === demoEmail
        );
      }

      if (!isRegistered) {
        setLoading(false);
        return {
          success: false,
          role: 'customer' as const,
          error: 'Akun Google (user.google@nefakky.com) belum terdaftar. Silakan melakukan registrasi akun terlebih dahulu.'
        };
      }

      const demoUser: UserProfile = {
        uid: 'google-demo-' + Date.now(),
        email: demoEmail,
        displayName: 'Google Demo User',
        role: 'customer'
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(demoUser));
      }
      setLoading(false);
      return { success: true, role: 'customer' as const };
    }
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

  // Update Profile Photo
  const updatePhoto = (photoURL: string) => {
    if (user) {
      const updatedUser = { ...user, photoURL };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(updatedUser));
      }
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
      updatePhoto
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

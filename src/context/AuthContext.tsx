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
    // Check if session is active in current browser session
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('nefakky_user') : null;
    const sessionActive = typeof window !== 'undefined' ? sessionStorage.getItem('nefakky_session_active') : null;

    if (savedUser && sessionActive) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        console.error("Error parsing saved session", e);
      }
    } else {
      // Force initial load/run to land on login page
      setUser(null);
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser && typeof window !== 'undefined' && sessionStorage.getItem('nefakky_session_active')) {
        const role = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer';
        const userProf: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (role === 'admin' ? 'Admin Fatih' : 'Pelanggan Nefakky'),
          photoURL: fbUser.photoURL,
          role: role,
        };
        setUser(userProf);
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
      } else if (!savedUser || !sessionActive) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
        sessionStorage.setItem('nefakky_session_active', 'true');
      }
      setLoading(false);
      return { success: true, role: 'admin' as const };
    }

    try {
      // 2. Try Firebase login
      const cred = await firebaseSignIn(auth, email, pass);
      const isUserAdmin = cred.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const role: 'admin' | 'customer' = isUserAdmin ? 'admin' : 'customer';

      const userProf: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || (role === 'admin' ? 'Fatih Ahmad Zakky' : 'Pelanggan Nefakky'),
        photoURL: cred.user.photoURL,
        role: role,
      };

      setUser(userProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(userProf));
        sessionStorage.setItem('nefakky_session_active', 'true');
      }
      setLoading(false);
      return { success: true, role };
    } catch (err: any) {
      console.warn("Firebase Auth sign-in failed or local validation checked:", err.message);
      
      // 3. Fallback check local registered users database in localStorage
      if (typeof window !== 'undefined') {
        const storedUsersStr = localStorage.getItem('nefakky_registered_users');
        const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
        
        const matchedUser = registeredUsers.find(
          (u: any) => u.email.trim().toLowerCase() === normalizedEmail
        );

        if (matchedUser) {
          if (matchedUser.password && matchedUser.password !== pass) {
            setLoading(false);
            return {
              success: false,
              role: 'customer' as const,
              error: 'Password yang Anda masukkan salah.'
            };
          }

          const userProf: UserProfile = {
            uid: matchedUser.uid || 'user-' + Date.now(),
            email: matchedUser.email,
            displayName: matchedUser.displayName || matchedUser.name || normalizedEmail.split('@')[0],
            phoneNumber: matchedUser.phoneNumber || matchedUser.phone,
            role: 'customer'
          };
          setUser(userProf);
          localStorage.setItem('nefakky_user', JSON.stringify(userProf));
          sessionStorage.setItem('nefakky_session_active', 'true');
          setLoading(false);
          return { success: true, role: 'customer' as const };
        }
      }

      setLoading(false);
      return { 
        success: false, 
        role: 'customer' as const,
        error: 'Akun tidak ditemukan. Silakan lakukan registrasi terlebih dahulu.'
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
      
      // Check if already registered
      const existing = registeredUsers.find((u: any) => u.email.trim().toLowerCase() === normalizedEmail);
      if (!existing) {
        registeredUsers.push({
          uid: 'user-reg-' + Date.now(),
          name,
          displayName: name,
          email: normalizedEmail,
          phone,
          phoneNumber: phone,
          password: pass,
          role: isOwnerAdmin ? 'admin' : 'customer'
        });
        localStorage.setItem('nefakky_registered_users', JSON.stringify(registeredUsers));
      }
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
        sessionStorage.setItem('nefakky_session_active', 'true');
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
        sessionStorage.setItem('nefakky_session_active', 'true');
      }
      setLoading(false);
      return { success: true };
    }
  };

  // Google SSO
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const isUserAdmin = cred.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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
        sessionStorage.setItem('nefakky_session_active', 'true');
      }
      setLoading(false);
      return { success: true, role };
    } catch (err: any) {
      console.warn("Google Sign-In demo fallback triggered");
      const demoUser: UserProfile = {
        uid: 'google-demo-' + Date.now(),
        email: 'user.google@nefakky.com',
        displayName: 'Google Demo User',
        role: 'customer'
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_user', JSON.stringify(demoUser));
        sessionStorage.setItem('nefakky_session_active', 'true');
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
      sessionStorage.removeItem('nefakky_session_active');
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

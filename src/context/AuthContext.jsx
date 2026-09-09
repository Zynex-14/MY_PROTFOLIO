import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from 'firebase/auth';

const AuthContext = createContext(null);

const DEMO_AUTH_KEY = 'portfolio_demo_auth_session';
const CUSTOM_CREDS_KEY = 'portfolio_custom_admin_creds';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get active credentials (custom or fallback env default)
  const getActiveCreds = () => {
    try {
      const saved = localStorage.getItem(CUSTOM_CREDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@portfolio.com',
      password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'admin123'
    };
  };

  const [activeCreds, setActiveCreds] = useState(getActiveCreds);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Admin',
            photoURL: user.photoURL,
            isDemo: false
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo session restore
      try {
        const demoSession = localStorage.getItem(DEMO_AUTH_KEY);
        if (demoSession) {
          setCurrentUser(JSON.parse(demoSession));
        }
      } catch (e) {
        console.error('Error reading demo auth session', e);
      }
      setLoading(false);
    }
  }, []);

  // Email & Password Login
  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || 'Admin',
        isDemo: false
      };
    } else {
      const creds = getActiveCreds();
      if (email.trim().toLowerCase() === creds.email.toLowerCase() && password === creds.password) {
        const userObj = {
          uid: 'demo-admin-uid-1',
          email: creds.email,
          displayName: 'Administrator',
          isDemo: true
        };
        localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(userObj));
        setCurrentUser(userObj);
        return userObj;
      } else {
        throw new Error(`Invalid credentials! For demo mode, use: ${creds.email} / ${creds.password}`);
      }
    }
  };

  // Google Authentication
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const res = await signInWithPopup(auth, googleProvider);
      return {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || 'Google Admin',
        photoURL: res.user.photoURL,
        isDemo: false
      };
    } else {
      // Demo Google Auth simulation
      const userObj = {
        uid: 'demo-google-admin-1',
        email: 'admin.google@portfolio.com',
        displayName: 'Google Admin (Demo)',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        isDemo: true
      };
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(userObj));
      setCurrentUser(userObj);
      return userObj;
    }
  };

  // Password Reset Request
  const resetPassword = async (email) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
      return `Password reset instructions have been sent to ${email}. Check your inbox.`;
    } else {
      return `[Demo Mode] Password reset requested for ${email}. In demo mode, your password is '${activeCreds.password}' or can be changed directly in the Admin Dashboard Settings tab.`;
    }
  };

  // Update Admin Email / Username
  const updateAdminEmail = async (newEmail) => {
    if (!newEmail || !newEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (isFirebaseConfigured && auth && auth.currentUser) {
      await updateEmail(auth.currentUser, newEmail);
    }

    const updated = { ...activeCreds, email: newEmail };
    localStorage.setItem(CUSTOM_CREDS_KEY, JSON.stringify(updated));
    setActiveCreds(updated);

    if (currentUser) {
      const updatedUser = { ...currentUser, email: newEmail };
      setCurrentUser(updatedUser);
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(updatedUser));
    }
    return true;
  };

  // Update Admin Password
  const updateAdminPassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    if (isFirebaseConfigured && auth && auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
    }

    const updated = { ...activeCreds, password: newPassword };
    localStorage.setItem(CUSTOM_CREDS_KEY, JSON.stringify(updated));
    setActiveCreds(updated);
    return true;
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    localStorage.removeItem(DEMO_AUTH_KEY);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    loginWithGoogle,
    resetPassword,
    updateAdminEmail,
    updateAdminPassword,
    logout,
    isDemoMode: !isFirebaseConfigured,
    demoEmail: activeCreds.email,
    demoPassword: activeCreds.password
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

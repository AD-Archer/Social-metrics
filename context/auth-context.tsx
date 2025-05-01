/**
 * @fileoverview Authentication context provider using Firebase Authentication.
 * Provides user state, loading status, and authentication functions (Google Sign-In, Logout, Profile Update).
 * This context wraps the application to make authentication state available globally.
 */
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  UserCredential
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<UserCredential>
  logout: () => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
  isTwitchLoginDisabled: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Flag to indicate Twitch login is disabled
  const isTwitchLoginDisabled = true

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      
      if (user) {
        // Create or update user document in Firestore
        updateUserDocument(user);
      }
    })

    return () => unsubscribe()
  }, [])

  // Create or update user document in Firestore
  const updateUserDocument = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      const userData = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
        providers: user.providerData.map(provider => provider.providerId)
      };
      
      if (!userSnap.exists()) {
        // New user - create document with initial data
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Existing user - update document
        await setDoc(userRef, userData, { merge: true });
      }
    } catch (error) {
      console.error("Error updating user document:", error);
    }
  };

  // Authentication functions
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result;
  }

  const logout = () => {
    return signOut(auth);
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    return updateProfile(auth.currentUser, {
      displayName,
      photoURL: photoURL || auth.currentUser.photoURL
    });
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
    updateUserProfile,
    isTwitchLoginDisabled
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
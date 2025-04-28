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

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<UserCredential>
  logout: () => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If the user signed up with Google, their profile might already have a name.
      // If signing up with email/password previously, we updated the profile manually.
      // Now, we might want to ensure the profile is updated if needed after Google sign-in,
      // potentially on the first login or in a dedicated profile settings page.
      // For now, I'll just set the user state.
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Authentication functions
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    // Optionally, you could check if the user is new here (e.g., using getAdditionalUserInfo)
    // and perform actions like setting up default data in Firestore.
    // const additionalUserInfo = getAdditionalUserInfo(result);
    // if (additionalUserInfo?.isNewUser) {
    //   console.log("New user signed up with Google.");
    //   // Perform first-time setup if needed
    // }
    return result
  }

  const logout = () => {
    return signOut(auth)
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error("No user logged in")
    // I'll ensure the display name is updated. Google might provide one initially,
    // but allowing updates is good.
    return updateProfile(auth.currentUser, {
      displayName,
      photoURL: photoURL || auth.currentUser.photoURL // Keep existing photo if none provided
    })
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
    updateUserProfile
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
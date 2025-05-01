/**
 * @fileoverview Authentication context provider using Firebase Authentication.
 * Provides user state, loading status, and authentication functions (Sign-In, Link, Logout, Profile Update).
 * Handles linking multiple OAuth providers (Google, Twitch) to a single user account.
 * Automatically redirects authenticated users from login/signup pages to the dashboard.
 * This context wraps the application to make authentication state available globally.
 */
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"; // Import router and pathname hooks
import {
  User,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  linkWithPopup, // Import linkWithPopup
  updateProfile,
  UserCredential,
  AuthErrorCodes // Import AuthErrorCodes for specific error handling
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<UserCredential>
  signInWithTwitch: () => Promise<UserCredential>
  linkWithGoogle: () => Promise<UserCredential | null> // Add link function
  linkWithTwitch: () => Promise<UserCredential | null> // Add link function
  logout: () => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
  isTwitchLoginDisabled: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isTwitchLoginDisabled = false // Keep false
  const router = useRouter(); // Initialize router
  const pathname = usePathname(); // Get current path

  useEffect(() => {
    console.log("AuthProvider useEffect triggered"); // Add log
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("onAuthStateChanged triggered. User:", currentUser ? currentUser.uid : null); // Add log
      if (currentUser) {
        await updateUserDocument(currentUser);
        const freshUser = auth.currentUser; // Re-fetch user data after potential updates
        setUser(freshUser);
        console.log("User is authenticated. Current path:", pathname); // Add log
        // Redirect if user is authenticated and on login/signup page
        if (pathname === '/login' || pathname === '/signup') {
          console.log("Redirecting authenticated user from", pathname, "to /dashboard"); // Add log
          router.push('/dashboard');
        }
      } else {
        setUser(null);
        console.log("User is not authenticated."); // Add log
      }
      setLoading(false);
      console.log("Auth loading state set to false"); // Add log
    });

    return () => {
      console.log("AuthProvider cleanup: Unsubscribing from onAuthStateChanged"); // Add log
      unsubscribe();
    }
    // Add router and pathname to dependency array to re-run if navigation occurs
    // while auth state is potentially changing, though primarily driven by auth changes.
  }, [router, pathname]);

  // ... updateUserDocument remains the same ...
  const updateUserDocument = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Ensure providerData is always updated
      const providerIds = user.providerData.map(provider => provider.providerId);

      const userData = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
        providers: providerIds // Use the fresh list of provider IDs
      };

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Merge to update existing fields and add/update providers array
        await setDoc(userRef, userData, { merge: true });
      }
    } catch (error) {
      console.error("Error updating user document:", error);
      // Consider adding user-facing feedback here if needed
    }
  };


  // --- Authentication Functions ---

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    console.log("Attempting Google Sign-In..."); // Add log
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign-In successful for:", result.user.uid); // Add log
      // Redirect is now handled by useEffect
      return result;
    } catch (error: any) {
      console.error("Google Sign-In Error:", error); // Log error
      if (error.code === "auth/account-exists-with-different-credential") {
        throw new Error("An account already exists with this email address using a different sign-in method. Please sign in using that method or link your accounts in settings.");
      }
      throw error;
    }
  }

  const signInWithTwitch = async () => {
    const provider = new OAuthProvider('oidc.twitch');
    console.log("Attempting Twitch Sign-In..."); // Add log
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Twitch Sign-In successful for:", result.user.uid); // Add log
      // Redirect is now handled by useEffect
      return result;
    } catch (error: any) {
      console.error("Twitch Sign-In Error:", error); // Log error
      if (error.code === "auth/account-exists-with-different-credential") {
        throw new Error("An account already exists with this email address using a different sign-in method. Please sign in using that method or link your accounts in settings.");
      }
      throw error;
    }
  }

  // --- Linking Functions ---

  const linkWithProvider = async (provider: GoogleAuthProvider | OAuthProvider): Promise<UserCredential | null> => {
    if (!auth.currentUser) {
      console.error("No user logged in to link provider.");
      throw new Error("You must be logged in to link a new sign-in method.");
    }
    try {
      const result = await linkWithPopup(auth.currentUser, provider);
      // Manually trigger user document update after successful link
      await updateUserDocument(result.user);
      // Update local state immediately for responsiveness
      setUser(auth.currentUser);
      console.log(`Successfully linked ${provider.providerId}`);
      return result;
    } catch (error: any) {
      // Handle common linking errors
      if (error.code === AuthErrorCodes.PROVIDER_ALREADY_LINKED) {
        console.warn("This sign-in method is already linked to your account.", error);
        // Optionally inform the user via toast or message
        throw new Error("This sign-in method is already linked to your account.");
      } else if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        console.error("This sign-in method is already associated with another account.", error);
        // This is a tricky scenario - the user might need to sign in to the other account first
        throw new Error("This sign-in method is already associated with a different account.");
      } else {
        console.error(`Error linking ${provider.providerId}:`, error);
        throw new Error(`Failed to link ${provider.providerId}. Please try again.`);
      }
    }
  };

  const linkWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Add scopes if needed
    // provider.addScope('profile');
    // provider.addScope('email');
    return linkWithProvider(provider);
  }

  const linkWithTwitch = async () => {
    const provider = new OAuthProvider('oidc.twitch');
    // Add scopes if needed
    // provider.addScope('user:read:email');
    return linkWithProvider(provider);
  }


  // --- Other Functions ---

  const logout = () => {
    return signOut(auth);
  }

  // ... updateUserProfile remains the same ...
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    const trimmedDisplayName = displayName.trim();
    if (!trimmedDisplayName) throw new Error("Display name cannot be empty");

    await updateProfile(auth.currentUser, {
      displayName: trimmedDisplayName,
      photoURL: photoURL || auth.currentUser.photoURL
    });

    // Also update the Firestore document
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, {
      displayName: trimmedDisplayName,
      photoURL: auth.currentUser.photoURL // Use the potentially updated photoURL
    }, { merge: true });

    // Update local state if needed, though onAuthStateChanged might handle it
    setUser(auth.currentUser);
  }


  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithTwitch,
    linkWithGoogle, // Expose link function
    linkWithTwitch, // Expose link function
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

// ... useAuth hook remains the same ...
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
/**
 * @fileoverview Authentication context provider using Firebase Authentication.
 * Provides user state, loading status, and authentication functions (Sign-In, Link, Logout, Profile Update, Email Update).
 * Handles linking multiple OAuth providers (Google, Twitch) to a single user account.
 * Manages redirection based on authentication status and profile completeness (email presence).
 * This context wraps the application to make authentication state available globally.
 */
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  linkWithPopup,
  updateProfile,
  updateEmail, // Import updateEmail
  UserCredential,
  AuthErrorCodes
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore" // Import updateDoc
import { db } from "@/lib/firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<UserCredential>
  signInWithTwitch: () => Promise<UserCredential>
  linkWithGoogle: () => Promise<UserCredential | null>
  linkWithTwitch: () => Promise<UserCredential | null>
  logout: () => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
  updateUserEmail: (email: string) => Promise<void> // Add function to update email
  isTwitchLoginDisabled: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// List of public paths accessible without authentication
const PUBLIC_PATHS = ['/login', '/signup', '/landing'];
// Path where users are sent to complete their profile (e.g., add email)
const WELCOME_PATH = '/welcome';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isTwitchLoginDisabled = false
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("AuthProvider useEffect triggered. Path:", pathname);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("onAuthStateChanged triggered. User:", currentUser ? currentUser.uid : null, "Email:", currentUser?.email);
      setLoading(true); // Start loading state for auth check

      if (currentUser) {
        // User is authenticated
        await updateUserDocument(currentUser); // Ensure Firestore is up-to-date
        const freshUser = auth.currentUser; // Re-fetch potentially updated user data
        setUser(freshUser);

        if (!freshUser?.email) {
          // User authenticated but lacks email
          console.log("User authenticated but missing email.");
          if (pathname !== WELCOME_PATH) {
            console.log(`Redirecting user ${freshUser?.uid} to ${WELCOME_PATH} to add email.`);
            router.push(WELCOME_PATH);
          } else {
             console.log(`User is already on ${WELCOME_PATH}. No redirect needed.`);
          }
        } else {
          // User authenticated and has email
          console.log("User authenticated with email:", freshUser.email);
          if (pathname === WELCOME_PATH || PUBLIC_PATHS.includes(pathname)) {
             console.log(`Redirecting user ${freshUser.uid} from ${pathname} to /dashboard.`);
            router.push('/dashboard');
          } else {
             console.log(`User is on an allowed authenticated path (${pathname}). No redirect needed.`);
          }
        }
      } else {
        // User is not authenticated
        setUser(null);
        console.log("User is not authenticated.");
        if (!PUBLIC_PATHS.includes(pathname) && pathname !== '/') { // Allow access to root '/' maybe landing page?
           console.log(`Redirecting unauthenticated user from protected path ${pathname} to /login.`);
          router.push('/login');
        } else {
           console.log(`User is on a public path (${pathname}). No redirect needed.`);
        }
      }
      setLoading(false); // End loading state
      console.log("Auth loading state set to false");
    });

    return () => {
      console.log("AuthProvider cleanup: Unsubscribing from onAuthStateChanged");
      unsubscribe();
    }
    // Dependency array includes pathname to re-evaluate redirects on navigation
  }, [pathname, router]); // Removed router from deps as it's stable, keep pathname

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

  const logout = async () => { // Make async
    console.log("Attempting logout...");
    try {
      await signOut(auth);
      setUser(null); // Clear user state immediately
      console.log("Logout successful. Redirecting to /login.");
      router.push('/login'); // Redirect after logout
    } catch (error) {
       console.error("Logout failed:", error);
       // Optionally show an error toast to the user
       throw error; // Re-throw if needed elsewhere
    }
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
  };

  // --- New Function to Update Email ---
  const updateUserEmail = async (email: string) => {
    if (!auth.currentUser) {
      throw new Error("No user logged in to update email.");
    }
    console.log(`Attempting to update email for user ${auth.currentUser.uid} to ${email}`);
    const userRef = doc(db, "users", auth.currentUser.uid);

    try {
      // 1. Update Firestore document first (less likely to fail)
      await updateDoc(userRef, { email: email });
      console.log(`Firestore email updated for user ${auth.currentUser.uid}.`);

      // 2. Attempt to update Firebase Auth email
      // NOTE: This might fail if the user hasn't logged in recently,
      // requiring re-authentication. Consider adding email verification flow later.
      try {
        await updateEmail(auth.currentUser, email);
        console.log(`Firebase Auth email updated for user ${auth.currentUser.uid}.`);
      } catch (authError: any) {
        console.warn(`Failed to update Firebase Auth email directly for user ${auth.currentUser.uid}:`, authError);
        // Common error: auth/requires-recent-login
        // For now, we'll rely on the Firestore update.
        // Consider prompting the user to re-authenticate or verify email later.
        if (authError.code === "auth/requires-recent-login") {
           // Optionally inform the user they might need to re-login for the change to fully apply everywhere.
        }
        // Don't throw here, as Firestore update succeeded.
      }

      // 3. Refresh user state locally to reflect potential changes
      // Although onAuthStateChanged might pick it up, manual refresh ensures immediate UI update.
      await auth.currentUser.reload(); // Fetches latest profile data
      const refreshedUser = auth.currentUser;
      setUser(refreshedUser); // Update context state
      console.log(`User state refreshed. New email: ${refreshedUser?.email}`);

    } catch (error) {
      console.error(`Error updating email for user ${auth.currentUser.uid}:`, error);
      throw new Error("Failed to update email. Please try again."); // Throw for the UI to catch
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithTwitch,
    linkWithGoogle,
    linkWithTwitch,
    logout,
    updateUserProfile,
    updateUserEmail, // Expose the new function
    isTwitchLoginDisabled
  }

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only when loading is finished to prevent layout shifts/flashes */}
      {!loading ? children : (
         // Optional: Render a global loading indicator while auth state resolves initially
         <div className="flex h-screen items-center justify-center">
           <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
         </div>
      )}
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
/**
 * Firebase Admin SDK initialization for server-side operations.
 * Provides secure administrative access to Firebase services for API routes.
 * Uses embedded service account credentials to access Firestore with admin privileges,
 * bypassing client-side authentication limitations.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';


// Initialize Firebase Admin SDK with service account credentials
const initializeFirebaseAdmin = () => {
  const apps = getApps();
  
  if (!apps.length) {
    try {
      return initializeApp({
        credential: cert(serviceAccountCredentials),
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }
  
  return getApps()[0];
};

// Initialize services 
const app = initializeFirebaseAdmin();
const adminDb = getFirestore();
const adminAuth = getAuth();

export { app, adminDb, adminAuth };
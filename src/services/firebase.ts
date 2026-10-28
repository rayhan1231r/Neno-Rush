/**
 * NEON RUSH - Firebase Authentication & Cloud Firestore Service
 * Connects the game to Firebase using the official Firebase Web SDK (v11+).
 * Supports:
 * - Google Sign-In with popup
 * - Email & Password registration and login
 * - Cloud Firestore synchronization for player profiles, inventory, stats, and missions
 * - Offline-first fallback with guest mode preservation
 * - Standardized handleFirestoreError error handling
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Mission, PlayerProfile } from '../types/game';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Standardized Firestore Error Handling per Skill Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn('[FIRESTORE ERROR]', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test at startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore: Client appears offline or project not reachable yet.');
    }
    return false;
  }
}

// Auth Helpers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export class FirebaseService {
  /**
   * Sign In with Google via Popup
   */
  public static async signInWithGoogle(): Promise<{ user: FirebaseUser | null; error?: string }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or failed';
      return { user: null, error: msg };
    }
  }

  /**
   * Register with Email & Password
   */
  public static async registerWithEmail(
    email: string,
    pass: string
  ): Promise<{ user: FirebaseUser | null; error?: string }> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      return { user: result.user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return { user: null, error: msg };
    }
  }

  /**
   * Login with Email & Password
   */
  public static async loginWithEmail(
    email: string,
    pass: string
  ): Promise<{ user: FirebaseUser | null; error?: string }> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return { user: result.user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      return { user: null, error: msg };
    }
  }

  /**
   * Sign out and return to Guest Mode
   */
  public static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
  }

  /**
   * Listen to Firebase Auth state
   */
  public static onAuthState(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Load Player Profile from Cloud Firestore
   */
  public static async loadCloudProfile(userId: string): Promise<Partial<PlayerProfile> | null> {
    const userDocPath = `users/${userId}`;
    try {
      const userSnap = await getDoc(doc(db, 'users', userId));
      if (!userSnap.exists()) return null;

      const profileData = userSnap.data();

      // Subcollection docs
      const invSnap = await getDoc(doc(db, 'users', userId, 'gameData', 'inventory'));
      const statsSnap = await getDoc(doc(db, 'users', userId, 'gameData', 'stats'));
      const missionsSnap = await getDoc(doc(db, 'users', userId, 'gameData', 'missions'));

      const invData = invSnap.exists() ? invSnap.data() : {};
      const statsData = statsSnap.exists() ? statsSnap.data() : {};
      const missionsData = missionsSnap.exists() ? missionsSnap.data() : {};

      return {
        userId,
        username: profileData.username,
        email: profileData.email,
        avatarSeed: profileData.avatarSeed || 'jax_turbo',
        coins: invData.coins !== undefined ? invData.coins : 1500,
        gems: invData.gems !== undefined ? invData.gems : 25,
        selectedCharacterId: invData.selectedCharacterId || 'char_starter',
        selectedSkateboardId: invData.selectedSkateboardId || 'board_classic',
        unlockedCharacterIds: invData.unlockedCharacterIds || ['char_starter'],
        unlockedSkateboardIds: invData.unlockedSkateboardIds || ['board_classic'],
        highScore: statsData.highScore || 0,
        highestDistance: statsData.highestDistance || 0,
        lifetimeCoins: statsData.lifetimeCoins || 0,
        runsPlayed: statsData.runsPlayed || 0,
        loginStreak: missionsData.loginStreak || 1,
        claimedDailyRewards: missionsData.claimedDailyRewards || [],
        completedMissionIds: missionsData.completedMissionIds || [],
        claimedMissionIds: missionsData.claimedMissionIds || [],
        isGuest: false,
        lastSyncedAt: Date.now(),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, userDocPath);
      return null;
    }
  }

  /**
   * Save / Sync Profile & Game Data to Cloud Firestore
   */
  public static async syncProfileToCloud(profile: PlayerProfile): Promise<boolean> {
    if (profile.isGuest || !auth.currentUser) return false;
    const uid = auth.currentUser.uid;

    try {
      // 1. User base document
      await setDoc(
        doc(db, 'users', uid),
        {
          userId: uid,
          username: profile.username,
          email: auth.currentUser.email || profile.email || '',
          avatarSeed: profile.avatarSeed,
          isGuest: false,
          lastSyncedAt: Date.now(),
        },
        { merge: true }
      );

      // 2. Inventory document
      await setDoc(
        doc(db, 'users', uid, 'gameData', 'inventory'),
        {
          userId: uid,
          coins: profile.coins,
          gems: profile.gems,
          selectedCharacterId: profile.selectedCharacterId,
          selectedSkateboardId: profile.selectedSkateboardId,
          unlockedCharacterIds: profile.unlockedCharacterIds,
          unlockedSkateboardIds: profile.unlockedSkateboardIds,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // 3. Stats document
      await setDoc(
        doc(db, 'users', uid, 'gameData', 'stats'),
        {
          userId: uid,
          highScore: profile.highScore,
          highestDistance: profile.highestDistance,
          lifetimeCoins: profile.lifetimeCoins,
          runsPlayed: profile.runsPlayed,
          lastPlayedAt: Date.now(),
        },
        { merge: true }
      );

      // 4. Missions document
      await setDoc(
        doc(db, 'users', uid, 'gameData', 'missions'),
        {
          userId: uid,
          loginStreak: profile.loginStreak,
          lastLoginDate: profile.lastLoginDate,
          claimedDailyRewards: profile.claimedDailyRewards,
          completedMissionIds: profile.completedMissionIds,
          claimedMissionIds: profile.claimedMissionIds,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
      return false;
    }
  }

  /**
   * Sync active mission list state to Firestore
   */
  public static async syncMissionsToCloud(missions: Mission[]): Promise<void> {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
      await setDoc(
        doc(db, 'users', uid, 'gameData', 'activeMissions'),
        {
          missions: missions.map((m) => ({
            id: m.id,
            currentValue: m.currentValue,
            completed: m.completed,
            claimed: m.claimed,
          })),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/gameData/activeMissions`);
    }
  }
}

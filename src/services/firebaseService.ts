import { 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  collection, 
  updateDoc 
} from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import { Deck, Flashcard, UserStats } from "../types";

// Firestore Operation Types as specified in the Firebase Skill Integration
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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Handles Firestore errors by wrapping them into a JSON structure as requested by security specs.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Stores or updates a deck document inside the user's cloud "users/{userId}/decks" collection.
 */
export async function saveDeckToCloud(userId: string, deck: Deck): Promise<void> {
  const path = `users/${userId}/decks/${deck.id}`;
  try {
    await setDoc(doc(db, "users", userId, "decks", deck.id), deck);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches all user decks from the "users/{userId}/decks" subcollection path.
 */
export async function fetchCloudDecks(userId: string): Promise<Deck[]> {
  const path = `users/${userId}/decks`;
  try {
    const qSnap = await getDocs(collection(db, "users", userId, "decks"));
    const list: Deck[] = [];
    qSnap.forEach((d) => {
      list.push(d.data() as Deck);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Updates individual spaced-repetition intervals/metrics directly inside a card document doc ref.
 */
export async function updateCardMetrics(
  userId: string, 
  deckId: string, 
  cardId: string, 
  metrics: Partial<Flashcard>
): Promise<void> {
  const path = `users/${userId}/decks/${deckId}/cards/${cardId}`;
  try {
    await updateDoc(doc(db, "users", userId, "decks", deckId, "cards", cardId), metrics as { [x: string]: any });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Initializes a new user stats/profile document in Firestore on registration with zeroed metrics.
 */
export async function initializeUserProfileInCloud(userId: string, userName: string | null): Promise<UserStats> {
  const path = `users/${userId}`;
  const initialProfile: UserStats = {
    cardsMastered: 0,
    currentStreak: 0,
    userName: userName || 'Operator',
    masteredCount: 0,
    streakDays: 0,
    completionRatio: 0,
    weeklyLog: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    decks: [],
    cards: []
  };
  try {
    await setDoc(doc(db, "users", userId), initialProfile);
    return initialProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Saves current user stats to the cloud inside "users/{userId}".
 */
export async function saveUserStatsToCloud(userId: string, stats: UserStats): Promise<void> {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, "users", userId), stats);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches user stats from the cloud inside "users/{userId}".
 */
export async function fetchUserStatsFromCloud(userId: string): Promise<UserStats | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserStats;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

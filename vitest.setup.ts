import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase Auth globally
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Default: trigger callback with null (no user)
    setTimeout(() => callback(null), 0);
    return vi.fn(); // unsubscribe function
  }),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

// Mock Firebase App
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApp: vi.fn(() => ({})),
}));

// Mock Firebase Firestore Timestamp class
class MockTimestamp {
  private date: Date;

  constructor(seconds: number, nanoseconds: number) {
    this.date = new Date(seconds * 1000 + nanoseconds / 1000000);
  }

  toDate(): Date {
    return this.date;
  }

  static fromDate(date: Date): MockTimestamp {
    return new MockTimestamp(Math.floor(date.getTime() / 1000), 0);
  }
}

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new MockTimestamp(Date.now() / 1000, 0)),
  Timestamp: MockTimestamp,
  arrayUnion: vi.fn((val) => ({ _arrayUnion: val })),
  arrayRemove: vi.fn((val) => ({ _arrayRemove: val })),
}));

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
}));

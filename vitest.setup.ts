import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver (not implemented in jsdom, required by cmdk)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock scrollIntoView (not implemented in jsdom, required by cmdk)
Element.prototype.scrollIntoView = vi.fn()

// Mock window.matchMedia (not implemented in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock Firebase Auth globally
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Default: trigger callback with null (no user)
    setTimeout(() => callback(null), 0)
    return vi.fn() // unsubscribe function
  }),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  getAuth: vi.fn(() => ({})),
}))

// Mock Firebase App
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApp: vi.fn(() => ({})),
}))

// Mock Firebase Firestore Timestamp class
class MockTimestamp {
  private date: Date

  constructor(seconds: number, nanoseconds: number) {
    this.date = new Date(seconds * 1000 + nanoseconds / 1000000)
  }

  toDate(): Date {
    return this.date
  }

  static fromDate(date: Date): MockTimestamp {
    return new MockTimestamp(Math.floor(date.getTime() / 1000), 0)
  }
}

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  // PERF: New initialization functions for offline persistence
  initializeFirestore: vi.fn(() => ({})),
  persistentLocalCache: vi.fn(() => ({})),
  persistentMultipleTabManager: vi.fn(() => ({})),
  CACHE_SIZE_UNLIMITED: -1,
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
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new MockTimestamp(Date.now() / 1000, 0)),
  Timestamp: MockTimestamp,
  arrayUnion: vi.fn(val => ({ _arrayUnion: val })),
  arrayRemove: vi.fn(val => ({ _arrayRemove: val })),
}))

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
}))

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => vi.fn().mockResolvedValue({ data: {} })),
  connectFunctionsEmulator: vi.fn(),
}))

// Note: virtual:pwa-register is resolved via alias in vitest.config.ts
// to src/__mocks__/virtual-pwa-register.ts

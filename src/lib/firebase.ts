import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CurriculumDoc, CategoryDef, SchoolProfile } from '../types/curriculum';
import {
  INITIAL_DOCUMENTS,
  INITIAL_CATEGORIES,
  INITIAL_SCHOOL_PROFILE,
} from '../data/initialData';
import { normalizeDocCategory, normalizeCurriculumDoc } from '../utils/storage';

// Initialize Firebase App with support for both config file and Vercel Environment Variables
const resolvedConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId: (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
};

const app = initializeApp(resolvedConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as second argument
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling according to SKILL specifications
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot as required by SKILL.md
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline, falling back to cached state.');
    }
    return false;
  }
}
testConnection();

// Collection names
export const COLLECTIONS = {
  DOCS: 'curriculum_docs',
  CATEGORIES: 'categories',
  SCHOOL: 'school_profile',
};

// Clean doc for Firestore (prevent exceeding document 1MB limit by trimming huge base64)
export function sanitizeDocForFirestore(docItem: CurriculumDoc): CurriculumDoc {
  const cleaned: CurriculumDoc = {
    ...docItem,
    id: String(docItem.id).slice(0, 128),
    code: String(docItem.code).slice(0, 64),
    title: String(docItem.title).slice(0, 255),
    category: String(docItem.category).slice(0, 100),
    subject: String(docItem.subject).slice(0, 100),
    academicYear: String(docItem.academicYear).slice(0, 20),
    semester: (docItem.semester || 'Ganjil'),
    authorName: String(docItem.authorName).slice(0, 100),
    fileName: String(docItem.fileName).slice(0, 255),
    tags: Array.isArray(docItem.tags) ? docItem.tags.slice(0, 15) : [],
    description: String(docItem.description || '').slice(0, 2000),
  };

  // If base64 file data is greater than 300KB, remove to safeguard Firestore 1MB doc limit
  if (cleaned.fileDataUrl && cleaned.fileDataUrl.length > 300000) {
    delete cleaned.fileDataUrl;
  }

  return cleaned;
}

// Real-time Subscriptions with onSnapshot
export function subscribeToCurriculumDocs(
  onUpdate: (docs: CurriculumDoc[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colRef = collection(db, COLLECTIONS.DOCS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const docsList: CurriculumDoc[] = [];
      snapshot.forEach((d) => {
        const raw = d.data() as CurriculumDoc;
        docsList.push(normalizeCurriculumDoc(raw));
      });
      // Sort newest first
      docsList.sort((a, b) => (b.uploadDate || '').localeCompare(a.uploadDate || ''));
      onUpdate(docsList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.DOCS);
    }
  );
}

export function subscribeToCategories(
  onUpdate: (cats: CategoryDef[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colRef = collection(db, COLLECTIONS.CATEGORIES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const catsList: CategoryDef[] = [];
      snapshot.forEach((d) => {
        catsList.push(d.data() as CategoryDef);
      });
      const hasStandard = catsList.some(
        (c) => c.id === 'rincian-minggu-efektif' || c.id === 'kktp'
      );
      if (hasStandard && catsList.length > 0) {
        const orderMap = new Map(INITIAL_CATEGORIES.map((c, i) => [c.id, i]));
        catsList.sort((a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99));
        onUpdate(catsList);
      } else {
        syncStandardCategoriesToCloud();
        onUpdate(INITIAL_CATEGORIES);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.CATEGORIES);
    }
  );
}

export async function syncStandardCategoriesToCloud(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      if (!INITIAL_CATEGORIES.some((c) => c.id === d.id)) {
        batch.delete(d.ref);
      }
    });
    INITIAL_CATEGORIES.forEach((c) => {
      batch.set(doc(db, COLLECTIONS.CATEGORIES, c.id), c);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Sync categories to cloud warning:', err);
  }
}

export function subscribeToSchoolProfile(
  onUpdate: (profile: SchoolProfile) => void,
  onError?: (err: unknown) => void
): () => void {
  const docRef = doc(db, COLLECTIONS.SCHOOL, 'main_profile');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data() as SchoolProfile;
        onUpdate({
          ...INITIAL_SCHOOL_PROFILE,
          ...cloudData,
          teachers:
            Array.isArray(cloudData.teachers) && cloudData.teachers.length > 0
              ? cloudData.teachers
              : INITIAL_SCHOOL_PROFILE.teachers,
        });
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.SCHOOL}/main_profile`);
    }
  );
}

// Write / Save functions
export async function saveDocToCloud(docItem: CurriculumDoc): Promise<void> {
  const path = `${COLLECTIONS.DOCS}/${docItem.id}`;
  try {
    const payload = sanitizeDocForFirestore(docItem);
    await setDoc(doc(db, COLLECTIONS.DOCS, docItem.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveBatchDocsToCloud(docsList: CurriculumDoc[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    docsList.forEach((item) => {
      const payload = sanitizeDocForFirestore(item);
      const docRef = doc(db, COLLECTIONS.DOCS, item.id);
      batch.set(docRef, payload);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.DOCS);
  }
}

export async function updateDocInCloud(
  docId: string,
  updates: Partial<CurriculumDoc>
): Promise<void> {
  const path = `${COLLECTIONS.DOCS}/${docId}`;
  try {
    const docRef = doc(db, COLLECTIONS.DOCS, docId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDocFromCloud(docId: string): Promise<void> {
  const path = `${COLLECTIONS.DOCS}/${docId}`;
  try {
    const docRef = doc(db, COLLECTIONS.DOCS, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCategoryToCloud(cat: CategoryDef): Promise<void> {
  const path = `${COLLECTIONS.CATEGORIES}/${cat.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.CATEGORIES, cat.id), cat);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSchoolProfileToCloud(profile: SchoolProfile): Promise<void> {
  const path = `${COLLECTIONS.SCHOOL}/main_profile`;
  try {
    await setDoc(doc(db, COLLECTIONS.SCHOOL, 'main_profile'), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Initial Database Seeder: Seeds starter data if Cloud is completely empty
export async function seedCloudIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DOCS));
    if (snap.empty) {
      console.log('Database cloud kosong, melakukan inisialisasi arsip default SMPN 14 Tubaba...');
      const batch = writeBatch(db);

      // Seed documents
      INITIAL_DOCUMENTS.forEach((d) => {
        const docRef = doc(db, COLLECTIONS.DOCS, d.id);
        batch.set(docRef, sanitizeDocForFirestore(d));
      });

      // Seed categories
      INITIAL_CATEGORIES.forEach((c) => {
        const catRef = doc(db, COLLECTIONS.CATEGORIES, c.id);
        batch.set(catRef, c);
      });

      // Seed school profile
      const schoolRef = doc(db, COLLECTIONS.SCHOOL, 'main_profile');
      batch.set(schoolRef, INITIAL_SCHOOL_PROFILE);

      await batch.commit();
      console.log('Inisialisasi cloud database berhasil!');
      return true;
    } else {
      // Migrate any legacy academic year documents to 2026/2027
      syncAcademicYearToCloud();
    }
  } catch (error) {
    console.warn('Seeding check failed or skipped:', error);
  }
  return false;
}

export async function syncAcademicYearToCloud(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DOCS));
    if (snap.empty) return;
    const batch = writeBatch(db);
    let count = 0;
    const existingIds = new Set<string>();

    snap.forEach((d) => {
      existingIds.add(d.id);
      const data = d.data() as CurriculumDoc;
      const normalized = normalizeCurriculumDoc(data);
      if (
        data.academicYear !== normalized.academicYear ||
        data.title !== normalized.title ||
        data.grade !== normalized.grade ||
        data.targetRole !== normalized.targetRole
      ) {
        batch.set(d.ref, sanitizeDocForFirestore(normalized));
        count++;
      }
    });

    // Seed any newly added extracurricular sample docs if not yet in cloud
    INITIAL_DOCUMENTS.forEach((initDoc) => {
      if (initDoc.id.startsWith('doc-eskul-') && !existingIds.has(initDoc.id)) {
        const docRef = doc(db, COLLECTIONS.DOCS, initDoc.id);
        batch.set(docRef, sanitizeDocForFirestore(initDoc));
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Berhasil menyinkronkan ${count} berkas cloud ke struktur kelas & eskul terbaru`);
    }
  } catch (err) {
    console.warn('Sync academic year to cloud warning:', err);
  }
}

// Google Auth Helpers
export function getGoogleAuthErrorMessage(error: any): { title: string; detail: string; actionHint: string } {
  const code = error?.code || '';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/operation-not-allowed') {
    return {
      title: 'Provider Google Belum Aktif',
      detail: 'Metode masuk dengan Google belum diaktifkan pada Firebase Console proyek ini.',
      actionHint: 'Buka Firebase Console -> Authentication -> tab Sign-in method -> aktifkan "Google".',
    };
  }
  if (code === 'auth/unauthorized-domain') {
    return {
      title: 'Domain Belum Terdaftar di Firebase',
      detail: `Domain "${currentHost}" belum diizinkan untuk otentikasi Google.`,
      actionHint: `Tambahkan "${currentHost}" di Firebase Console -> Authentication -> Settings -> Authorized domains.`,
    };
  }
  if (code === 'auth/popup-blocked') {
    return {
      title: 'Jendela Popup Diblokir',
      detail: 'Peramban memblokir jendela popup masuk Google (sering terjadi jika dijalankan di dalam iFrame).',
      actionHint: 'Izinkan pop-up di peramban Anda atau gunakan pilihan "Masuk Profil Pendidik".',
    };
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      title: 'Proses Masuk Dibatalkan',
      detail: 'Jendela login ditutup sebelum proses verifikasi selesai.',
      actionHint: 'Silakan coba klik tombol masuk kembali.',
    };
  }
  return {
    title: 'Gagal Masuk Google',
    detail: error?.message || 'Terjadi kendala saat menghubungkan ke akun Google.',
    actionHint: 'Gunakan opsi Masuk Profil Pendidik untuk masuk instan tanpa hambatan.',
  };
}

export async function loginWithGoogle(): Promise<User> {
  try {
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google Sign-in failed with details:', error);
    const diag = getGoogleAuthErrorMessage(error);
    const err = new Error(`${diag.title}: ${diag.detail}`);
    (err as any).code = error?.code;
    (err as any).diagnostics = diag;
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

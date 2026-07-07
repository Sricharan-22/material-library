import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { isSupabaseConfigured, supabase, supabaseBucket } from "./supabase";

const foldersCollection = "libraryFolders";
const filesCollection = "libraryFiles";

function ensureFirebase() {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase Storage is not configured.");
  }
}

function getStorageErrorMessage(error, bucketName) {
  const message = error?.message || "Supabase Storage request failed.";
  if (message.toLowerCase().includes("bucket not found")) {
    return `Supabase bucket "${bucketName}" was not found. Create that bucket in the Supabase project from VITE_SUPABASE_URL, or update VITE_SUPABASE_STORAGE_BUCKET to the exact bucket name.`;
  }
  return message;
}

function cleanParentId(parentId) {
  return parentId || null;
}

export async function loadLibraryResources() {
  ensureFirebase();
  const [folderSnapshot, fileSnapshot] = await Promise.all([
    getDocs(collection(db, foldersCollection)),
    getDocs(collection(db, filesCollection)),
  ]);

  const folders = folderSnapshot.docs.map((item) => ({
    id: item.id,
    source: "firebase",
    ...item.data(),
    parentId: cleanParentId(item.data().parentId),
  }));
  const files = fileSnapshot.docs.map((item) => ({
    id: item.id,
    source: "firebase",
    ...item.data(),
    folderId: cleanParentId(item.data().folderId),
  }));

  return { folders, files };
}

export async function createLibraryFolder({ subjectId, name, parentId }) {
  ensureFirebase();
  const docRef = await addDoc(collection(db, foldersCollection), {
    subjectId,
    name,
    parentId: cleanParentId(parentId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    source: "firebase",
    subjectId,
    name,
    parentId: cleanParentId(parentId),
  };
}

export async function renameLibraryFolder(folderId, name) {
  ensureFirebase();
  await updateDoc(doc(db, foldersCollection, folderId), {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadLibraryFile({ subjectId, folderId, file }) {
  ensureFirebase();
  ensureSupabase();
  const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
  const storagePath = `${subjectId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(supabaseBucket).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) {
    throw new Error(getStorageErrorMessage(uploadError, supabaseBucket));
  }

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(storagePath);

  const record = {
    subjectId,
    folderId: cleanParentId(folderId),
    title: file.name.replace(/\.[^.]+$/, ""),
    description: "Uploaded to Supabase Storage.",
    period: "New",
    type: extension,
    fileName: file.name,
    storageBucket: supabaseBucket,
    storagePath,
    downloadUrl: data.publicUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, filesCollection), record);

  return {
    id: docRef.id,
    source: "firebase",
    ...record,
  };
}

export async function getLibraryFileUrl(file, fallbackUrl, options = {}) {
  if (!file.storagePath) {
    return fallbackUrl || file.downloadUrl || file.localUrl || "";
  }

  ensureSupabase();
  const bucketName = file.storageBucket || supabaseBucket;
  const signedUrlOptions = options.download ? { download: file.fileName || true } : undefined;
  const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(file.storagePath, 60 * 60, signedUrlOptions);
  if (error) {
    throw new Error(getStorageErrorMessage(error, bucketName));
  }

  return data.signedUrl;
}

export async function deleteLibraryFolder(folderId) {
  ensureFirebase();
  await deleteDoc(doc(db, foldersCollection, folderId));
}

export async function deleteLibraryFile(file) {
  ensureFirebase();
  await deleteDoc(doc(db, filesCollection, file.id));
  if (file.storagePath && isSupabaseConfigured && supabase) {
    await supabase.storage.from(file.storageBucket || supabaseBucket).remove([file.storagePath]);
  }
}

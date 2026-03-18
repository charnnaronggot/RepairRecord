import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { RepairRecord } from "../types/RepairRecord";

const COLLECTION_NAME = "RepairRecord";

export async function addRepairRecord(record: RepairRecord): Promise<string> {
  // เก็บรูปเป็น base64 ตรงใน Firestore ไม่ต้องอัปโหลด Storage
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...record,
    status: record.status || "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getRepairRecords(): Promise<RepairRecord[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as RepairRecord
  );
}

export async function updateRepairRecord(
  id: string,
  record: Partial<RepairRecord>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);

  const existingDoc = await getDoc(docRef);
  if (!existingDoc.exists()) {
    const notFoundError = new Error("REPAIR_RECORD_NOT_FOUND");
    (notFoundError as Error & { code?: string }).code = "not-found";
    throw notFoundError;
  }

  await updateDoc(docRef, {
    ...record,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRepairRecord(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

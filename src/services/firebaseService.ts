import {
  collection,
  addDoc,
  getDocs,
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
  await updateDoc(docRef, {
    ...record,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRepairRecord(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function getNextJobNumber(): Promise<string> {
const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));

let max = 0;
querySnapshot.forEach((d) => {
const raw = String((d.data() as Partial<RepairRecord>).jobNumber ?? "").trim();
const n = Number(raw);
if (Number.isFinite(n) && n > max) max = n;
});

return String(max + 1).padStart(3, "0");
}
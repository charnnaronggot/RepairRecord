import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { RepairRecord } from "../types/RepairRecord";

const COLLECTION_NAME = "RepairRecord";

const roundTo2 = (value: number): number => Math.round(value * 100) / 100;

function normalizeRepairPartsForSave(record: RepairRecord): RepairRecord {
  return {
    ...record,
    repairParts: (record.repairParts || []).map((part) => {
      const quantity = Number(part.quantity || 0);
      const unitPrice = roundTo2(Number(part.unitPrice || 0));
      const computedTotal = roundTo2(quantity * unitPrice);

      return {
        ...part,
        quantity,
        unitPrice,
        totalPrice: computedTotal,
      };
    }),
  };
}

function normalizePartialRepairRecordForSave(record: Partial<RepairRecord>): Partial<RepairRecord> {
  if (!record.repairParts) {
    return record;
  }

  return {
    ...record,
    repairParts: record.repairParts.map((part) => {
      const quantity = Number(part.quantity || 0);
      const unitPrice = roundTo2(Number(part.unitPrice || 0));
      const computedTotal = roundTo2(quantity * unitPrice);

      return {
        ...part,
        quantity,
        unitPrice,
        totalPrice: computedTotal,
      };
    }),
  };
}

export async function addRepairRecord(record: RepairRecord): Promise<string> {
  const normalizedRecord = normalizeRepairPartsForSave(record);

  // เก็บรูปเป็น base64 ตรงใน Firestore ไม่ต้องอัปโหลด Storage
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...normalizedRecord,
    status: normalizedRecord.status || "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getRepairRecords(): Promise<RepairRecord[]> {
  const recordsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("repairReportDate", "desc"),
  );
  const querySnapshot = await getDocs(recordsQuery);
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

  const normalizedRecord = normalizePartialRepairRecordForSave(record);

  await updateDoc(docRef, {
    ...normalizedRecord,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRepairRecord(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function getNextJobNumber(currentYear: number): Promise<string> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));

  let max = 0;
  querySnapshot.forEach((d) => {
    const data = d.data() as Partial<RepairRecord>;
    const reportYear = Number(String(data.repairReportDate ?? "").slice(0, 4));
    if (reportYear !== currentYear) {
      return;
    }
    const raw = String(data.jobNumber ?? "").trim();
    const n = Number(raw);
    if (Number.isFinite(n) && n > max) {
      max = n;
    }
  });

  return String(max + 1).padStart(3, "0");
}
import { getNowDateTimeLocalValue } from "../utils/dateTime";

export interface RepairItem {
  id: string;
  description: string;
  // unitPrice: number;
  // totalPrice: number;
}

export interface RepairPart {
  id: string;
  partName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface RemarkItem {
  id: string;
  description: string;
}

export interface RepairRecord {
  id?: string;
  invoiceNumber: string;
  client: string;
  phone: string;
  driver: string;
  repairReportDate: string;
  brand: string;
  vehicleModel: string;
  vehicleNumber: string;
  licensePlate: string;
  vehicleIdentificationNumber: string;
  serialNumber: string;
  mileNumber: string;
  jobNumber: string;
  photo: string; // base64 string
  repairItems: RepairItem[]; // แรงงาน/การซ่อม
  repairParts: RepairPart[]; // อะไหล่
  remarks: RemarkItem[]; // หมายเหตุ
  status: "pending" | "completed"; // สถานะการซ่อม
  createdAt?: string;
  updatedAt?: string;
  remark?: string; // รองรับข้อมูลเก่าแบบข้อความเดี่ยว
}

export const emptyRepairRecord: RepairRecord = {
  invoiceNumber: "",
  client: "",
  phone: "",
  driver: "",
  repairReportDate: getNowDateTimeLocalValue(),
  brand: "",
  vehicleModel: "",
  vehicleNumber: "",
  licensePlate: "",
  vehicleIdentificationNumber: "",
  serialNumber: "",
  mileNumber: "",
  jobNumber: "",
  photo: "",
  repairItems: [],
  repairParts: [],
  remarks: [],
  remark: "",
  status: "pending",
};

export const emptyRepairItem: Omit<RepairItem, "id"> = {
  description: "",
  // unitPrice: 0,
  // totalPrice: 0,
};

export const emptyRepairPart: Omit<RepairPart, "id"> = {
  partName: "",
  quantity: 1,
  unit: "",
  unitPrice: 0,
  totalPrice: 0,
};

export const emptyRemarkItem: Omit<RemarkItem, "id"> = {
  description: "",
};

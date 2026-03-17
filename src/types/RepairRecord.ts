export interface RepairItem {
  id: string;
  description: string;
  // quantity: number;
  // unit: string;
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
  status: "pending" | "completed"; // สถานะการซ่อม
  createdAt?: string;
  updatedAt?: string;
}

export const emptyRepairRecord: RepairRecord = {
  invoiceNumber: "",
  client: "",
  phone: "",
  driver: "",
  repairReportDate: new Date().toISOString().split("T")[0],
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
  status: "pending",
};

export const emptyRepairItem: Omit<RepairItem, "id"> = {
  description: "",
  // quantity: 1,
  // unit: "ชิ้น",
  // unitPrice: 0,
  // totalPrice: 0,
};

export const emptyRepairPart: Omit<RepairPart, "id"> = {
  partName: "",
  quantity: 1,
  unit: "ชิ้น",
  unitPrice: 0,
  totalPrice: 0,
};

import type { RepairRecord } from "../types/RepairRecord";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hinoLogo from "../assets/images/hino_logo.jpg";

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

function formatThaiDateOnly(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("th-TH");
}

/**
 * Export records to CSV format
 */
export function exportToCSV(records: RepairRecord[]): void {
  if (records.length === 0) {
    alert("ไม่มีข้อมูลให้ export");
    return;
  }

  // Prepare header
  const headers = [
    "Job No.",
    "Client",
    "Phone",
    "Driver",
    "Date",
    "Brand",
    "Model",
    "Vehicle No.",
    "License Plate",
    "VIN",
    "Serial No.",
    "Mile No.",
    "Invoice No.",
    "Status",
    "Repair Items Count",
    "Parts Count",
    "Created Date",
  ];

  // Prepare data rows
  const rows = records.map((record) => [
    record.jobNumber,
    record.client,
    record.phone,
    record.driver,
    record.repairReportDate,
    record.brand,
    record.vehicleModel,
    record.vehicleNumber,
    record.licensePlate,
    record.vehicleIdentificationNumber,
    record.serialNumber,
    record.mileNumber,
    record.invoiceNumber,
    record.status,
    record.repairItems.length,
    record.repairParts.length,
    formatThaiDateOnly(record.repairReportDate),
  ]);

  // Escape CSV values
  const escapedRows = rows.map((row) =>
    row.map((cell) => {
      const str = String(cell || "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
  );

  // Build CSV content
  const csvContent = [
    headers.join(","),
    ...escapedRows.map((row) => row.join(",")),
  ].join("\n");

  // Add BOM for proper UTF-8 in Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `repair_records_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportListToPDF(records: RepairRecord[]): void {
  if (records.length === 0) {
    alert("ไม่มีข้อมูลให้ export");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");
  const title = "Repair Records (Filtered List)";

  doc.setFontSize(14);
  doc.text(title, 14, 14);
  doc.setFontSize(9);
  doc.text(`Total: ${records.length} records`, 14, 20);

  autoTable(doc, {
    startY: 24,
    head: [["#", "Job No.", "Client", "Vehicle", "Plate", "Status", "Date"]],
    body: records.map((record, index) => [
      String(index + 1),
      record.jobNumber || "-",
      record.client || "-",
      `${record.brand || ""} ${record.vehicleModel || ""}`.trim() || "-",
      record.licensePlate || "-",
      record.status === "completed" ? "completed" : "pending",
      formatThaiDateOnly(record.repairReportDate),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [44, 62, 80], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 24 },
      2: { cellWidth: 44 },
      3: { cellWidth: 42 },
      4: { cellWidth: 26 },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: 24, halign: "center" },
    },
    margin: { left: 14, right: 14 },
    theme: "grid",
  });

  doc.save(`repair_records_filtered_${new Date().toISOString().split("T")[0]}.pdf`);
}

function applyBorderRange(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number
): void {
  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      worksheet.getCell(row, col).border = BORDER_THIN;
    }
  }
}

function setCell(
  worksheet: ExcelJS.Worksheet,
  address: string,
  value: string | number,
  options?: {
    bold?: boolean;
    fontSize?: number;
    align?: "left" | "center" | "right";
  }
): void {
  const cell = worksheet.getCell(address);
  cell.value = value;
  cell.font = {
    name: "TH Sarabun New",
    size: options?.fontSize ?? 14,
    bold: options?.bold ?? false,
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: options?.align ?? "left",
    wrapText: true,
  };
}

function sheetNameForRecord(record: RepairRecord, index: number): string {
  const base = (record.jobNumber || `Record_${index + 1}`).replace(/[\\/*?:\[\]]/g, "-");
  return base.slice(0, 31);
}

interface ExcelRowData {
  index: number;
  repairText: string;
  partText: string;
  quantity: string | number;
  unitPrice: string | number;
  totalPrice: string | number;
}

const PAGE_ROW_CAPACITY = 20;

function buildExcelRows(record: RepairRecord): ExcelRowData[] {
  const contentCount = Math.max(record.repairItems.length, record.repairParts.length);
  const normalizedCount = Math.max(
    PAGE_ROW_CAPACITY,
    Math.ceil(Math.max(contentCount, 1) / PAGE_ROW_CAPACITY) * PAGE_ROW_CAPACITY
  );

  return Array.from({ length: normalizedCount }, (_, i) => {
    const item = record.repairItems[i];
    const part = record.repairParts[i];
    return {
      index: i + 1,
      repairText: item?.description || "",
      partText: part?.partName || "",
      quantity: part?.quantity ?? "",
      unitPrice: part?.unitPrice ?? "",
      totalPrice: part?.totalPrice ?? "",
    };
  });
}

function toPageChunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

async function toBase64DataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to convert image"));
    reader.readAsDataURL(blob);
  });
}

async function buildTemplateSheet(
  workbook: ExcelJS.Workbook,
  record: RepairRecord,
  index: number,
  pageIndex: number,
  totalPages: number,
  pageRows: ExcelRowData[],
  logoDataUrl: string
): Promise<void> {
  const baseName = sheetNameForRecord(record, index);
  const pageSuffix = totalPages > 1 ? `_P${pageIndex + 1}` : "";
  const worksheet = workbook.addWorksheet(`${baseName}${pageSuffix}`.slice(0, 31));

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.3,
      bottom: 0.3,
      header: 0,
      footer: 0,
    },
  };

  worksheet.properties.defaultRowHeight = 20;

  worksheet.columns = [
    { width: 9 },
    { width: 9 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 9 },
    { width: 9 },
  ];

  worksheet.mergeCells("A1:B4");
  worksheet.mergeCells("C1:F1");
  worksheet.mergeCells("C2:F2");
  worksheet.mergeCells("C3:F3");
  worksheet.mergeCells("C4:F4");

  const logoImageId = workbook.addImage({
    base64: logoDataUrl,
    extension: "jpeg",
  });
  worksheet.addImage(logoImageId, "A1:B4");

  setCell(worksheet, "C1", "บริษัท ประธานพรเซอร์วิซ จำกัด", { bold: true, fontSize: 18, align: "center" });
  setCell(worksheet, "C2", "124/69 หมู่ 4 ถ.เลียบคลอง 10 ต.บึงสนั่น อ.ธัญบุรี จ.ปทุมธานี 12110", { align: "center" });
  setCell(worksheet, "C3", "เบอร์โทรติดต่อ 081-3747760, 02-9089477 แฟกซ์ 02-9089477", { align: "center" });
  setCell(worksheet, "C4", "ใบแจ้งซ่อม", { bold: true, fontSize: 22, align: "center" });

  worksheet.mergeCells("G6:H11");
  applyBorderRange(worksheet, 6, 11, 7, 8);

  if (record.photo) {
    const extension = record.photo.includes("image/png") ? "png" : "jpeg";
    const photoImageId = workbook.addImage({
      base64: record.photo,
      extension,
    });
    worksheet.addImage(photoImageId, "G6:H11");
  }

  worksheet.mergeCells("A6:C6");
  worksheet.mergeCells("D6:F6");
  worksheet.mergeCells("A7:F7");
  worksheet.mergeCells("D9:F9");
  worksheet.mergeCells("B11:F11");

  setCell(worksheet, "A6", `ชื่อ บริษัท/ลูกค้า ${record.client || "-"}`);
  setCell(worksheet, "D6", `เบอร์โทร ${record.phone || "-"}`);
  setCell(worksheet, "A7", `พขร. ${record.driver || "-"}`);
  setCell(worksheet, "A8", "ยี่ห้อรถ", { bold: true });
  setCell(worksheet, "B8", record.brand || "-");
  setCell(worksheet, "C8", "รุ่นรถ", { bold: true });
  setCell(worksheet, "D8", record.vehicleModel || "-");
  setCell(worksheet, "E8", "เบอร์รถ", { bold: true });
  setCell(worksheet, "F8", record.vehicleNumber || "-");
  setCell(worksheet, "A9", "ทะเบียนรถ", { bold: true });
  setCell(worksheet, "B9", record.licensePlate || "-");
  setCell(worksheet, "C9", "เลขตัวถัง", { bold: true });
  setCell(worksheet, "D9", record.vehicleIdentificationNumber || "-");
  setCell(worksheet, "A10", "เลขเครื่อง", { bold: true });
  setCell(worksheet, "B10", record.serialNumber || "-");
  setCell(worksheet, "C10", "เลขไมล์", { bold: true });
  setCell(worksheet, "D10", record.mileNumber || "-");
  setCell(worksheet, "E10", "เลข Job", { bold: true });
  setCell(worksheet, "F10", record.jobNumber || "-");
  setCell(worksheet, "A11", "วันที่ใบแจ้งซ่อม", { bold: true });
  setCell(worksheet, "B11", record.repairReportDate || "-");

  applyBorderRange(worksheet, 6, 11, 1, 6);

  const tableHeaderRow = 13;
  const tableStartRow = 14;

  const headers = ["ลำดับ", "รายการซ่อม", "รายการอะไหล่", "จำนวน", "ราคา/หน่วย", "ราคา", "หมายเหตุ"];
  headers.forEach((header, i) => {
    const cell = worksheet.getCell(tableHeaderRow, i + 1);
    cell.value = header;
    cell.font = { name: "TH Sarabun New", size: 14, bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = BORDER_THIN;
  });

  for (let i = 0; i < pageRows.length; i += 1) {
    const row = tableStartRow + i;
    const rowData = pageRows[i];

    worksheet.getCell(row, 1).value = rowData.index;
    worksheet.getCell(row, 2).value = rowData.repairText;
    worksheet.getCell(row, 3).value = rowData.partText;
    worksheet.getCell(row, 4).value = rowData.quantity;
    worksheet.getCell(row, 5).value = rowData.unitPrice;
    worksheet.getCell(row, 6).value = rowData.totalPrice;
    worksheet.getCell(row, 7).value = "";

    for (let c = 1; c <= 7; c += 1) {
      const cell = worksheet.getCell(row, c);
      cell.font = { name: "TH Sarabun New", size: 13 };
      cell.alignment = {
        horizontal: c === 1 || c >= 4 ? "center" : "left",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = BORDER_THIN;
    }
  }

  const signatureRow = tableStartRow + pageRows.length + 2;
  worksheet.mergeCells(`C${signatureRow}:E${signatureRow}`);
  setCell(worksheet, `C${signatureRow}`, "ลายเซ็น ............................", { align: "center", fontSize: 16 });

  worksheet.pageSetup.printArea = `A1:H${signatureRow + 1}`;
}

export async function exportToExcel(records: RepairRecord[]): Promise<void> {
  if (records.length === 0) {
    alert("ไม่มีข้อมูลให้ export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const logoDataUrl = await toBase64DataUrl(hinoLogo);

  for (let i = 0; i < records.length; i += 1) {
    const rows = buildExcelRows(records[i]);
    const pages = toPageChunks(rows, PAGE_ROW_CAPACITY);
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      await buildTemplateSheet(
        workbook,
        records[i],
        i,
        pageIndex,
        pages.length,
        pages[pageIndex],
        logoDataUrl
      );
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob(
    [buffer],
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
  );
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `repair_records_${new Date().toISOString().split("T")[0]}.xlsx`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

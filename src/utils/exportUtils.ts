import type { RepairRecord } from "../types/RepairRecord";
import { utils, writeFileXLSX } from "xlsx";

function safeCellValue(value: unknown): string | number {
  if (typeof value === "number") return value;
  const text = String(value ?? "");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

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
    record.repairItems,
    record.repairParts,
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

/**
 * Export records to real .xlsx format to preserve UTF-8/Thai text correctly in Excel
 */
export function exportToExcel(records: RepairRecord[]): void {
  if (records.length === 0) {
    alert("ไม่มีข้อมูลให้ export");
    return;
  }

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
    "Items",
    "Parts",
    "Created",
  ];

  const rows = records.map((record) => [
    safeCellValue(record.jobNumber),
    safeCellValue(record.client),
    safeCellValue(record.phone),
    safeCellValue(record.driver),
    safeCellValue(formatThaiDateOnly(record.repairReportDate)),
    safeCellValue(record.brand),
    safeCellValue(record.vehicleModel),
    safeCellValue(record.vehicleNumber),
    safeCellValue(record.licensePlate),
    safeCellValue(record.vehicleIdentificationNumber),
    safeCellValue(record.serialNumber),
    safeCellValue(record.mileNumber),
    safeCellValue(record.invoiceNumber),
    safeCellValue(record.status === "completed" ? "completed" : "pending"),
    record.repairItems.length,
    record.repairParts.length,
    safeCellValue(formatThaiDateOnly(record.repairReportDate)),
  ]);

  const worksheet = utils.aoa_to_sheet([headers, ...rows]);
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 16 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 8 },
    { wch: 8 },
    { wch: 22 },
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Repair Records");

  writeFileXLSX(
    workbook,
    `repair_records_${new Date().toISOString().split("T")[0]}.xlsx`,
    { compression: true }
  );
}

import type { RepairRecord } from "../types/RepairRecord";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hinoLogo from "../assets/images/hino_logo.jpg";
import { formatThaiDateTime } from "./dateTime";

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

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
    formatThaiDateTime(record.repairReportDate),
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
      formatThaiDateTime(record.repairReportDate),
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
    name: "Arial",
    size: options?.fontSize ?? 10,
    
    bold: options?.bold ?? false,
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: options?.align ?? "left",
    indent: options?.align === "center" ? 0 : 1,
    wrapText: true,
  };
}

function setLabelValueCell(
  worksheet: ExcelJS.Worksheet,
  address: string,
  label: string,
  value: string | number,
  options?: {
    fontSize?: number;
    align?: "left" | "center" | "right";
  }
): void {
  const cell = worksheet.getCell(address);
  cell.value = {
    richText: [
      {
        text: `${label} `,
        font: { name: "Arial", size: options?.fontSize ?? 10, bold: true },
      },
      {
        text: String(value ?? "-"),
        font: { name: "Arial", size: options?.fontSize ?? 10 },
      },
    ],
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

function sheetNameForRecordPage(
  record: RepairRecord,
  index: number,
  pageIndex: number,
  totalPages: number
): string {
  const baseName = sheetNameForRecord(record, index);
  const pageSuffix = totalPages > 1 ? `_P${pageIndex + 1}` : "";
  return `${baseName}${pageSuffix}`.slice(0, 31);
}

function sheetNameForFormula(name: string): string {
  return `'${name.replace(/'/g, "''")}'`;
}

interface ExcelRowData {
  index: number;
  repairText: string;
  partText: string;
  quantity: string | number;
  unitPrice: string | number;
  totalPrice: string | number;
  rowUnits: number;
  rowHeight: number;
}

const BASE_TABLE_ROW_HEIGHT = 20;
const TABLE_LINE_HEIGHT = 14;
const REPAIR_TEXT_CHARS_PER_LINE = 32;
const PART_TEXT_CHARS_PER_LINE = 32;
const INFO_SECTION_ROW_HEIGHT = 22;
const SIGNATURE_BOTTOM_ROW = 36;
const DETAIL_START_ROW = 14;
const DETAIL_END_ROW = SIGNATURE_BOTTOM_ROW - 2;
const PAGE_ROW_CAPACITY_UNITS = DETAIL_END_ROW - DETAIL_START_ROW + 1;

function estimateTextLines(text: string, charsPerLine: number): number {
  if (!text) return 1;

  return text
    .split("\n")
    .reduce((total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
}

function estimateRowMetrics(repairText: string, partText: string): { rowUnits: number; rowHeight: number } {
  const repairLines = estimateTextLines(repairText, REPAIR_TEXT_CHARS_PER_LINE);
  const partLines = estimateTextLines(partText, PART_TEXT_CHARS_PER_LINE);
  const lines = Math.max(1, repairLines, partLines);
  const rowHeight = Math.max(BASE_TABLE_ROW_HEIGHT, lines * TABLE_LINE_HEIGHT);

  return {
    rowUnits: Math.max(1, Math.ceil(rowHeight / BASE_TABLE_ROW_HEIGHT)),
    rowHeight,
  };
}

function buildExcelRows(record: RepairRecord): ExcelRowData[] {
  const contentCount = Math.max(record.repairItems.length, record.repairParts.length, 1);

  const rows = Array.from({ length: contentCount }, (_, i) => {
    const item = record.repairItems[i];
    const part = record.repairParts[i];
    const repairText = item?.description || "";
    const partText = part?.partName || "";
    const quantity = part?.quantity ?? "";
    const unitPrice = part?.unitPrice ?? "";
    const totalPrice = part?.totalPrice ?? "";

    const hasData =
      repairText.trim() !== "" ||
      partText.trim() !== "" ||
      String(quantity).trim() !== "" ||
      String(unitPrice).trim() !== "" ||
      String(totalPrice).trim() !== "";

    return {
      repairText,
      partText,
      quantity,
      unitPrice,
      totalPrice,
      hasData,
    };
  }).filter((row) => row.hasData);

  if (rows.length === 0) {
    const metrics = estimateRowMetrics("", "");
    return [
      {
        index: 1,
        repairText: "",
        partText: "",
        quantity: "",
        unitPrice: "",
        totalPrice: "",
        rowUnits: metrics.rowUnits,
        rowHeight: metrics.rowHeight,
      },
    ];
  }

  return rows.map((row, index) => {
    const metrics = estimateRowMetrics(row.repairText, row.partText);

    return {
      index: index + 1,
      repairText: row.repairText,
      partText: row.partText,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      totalPrice: row.totalPrice,
      rowUnits: metrics.rowUnits,
      rowHeight: metrics.rowHeight,
    };
  });
}

function toPageChunks(items: ExcelRowData[], maxUnits: number): ExcelRowData[][] {
  const result: ExcelRowData[][] = [];
  let currentPage: ExcelRowData[] = [];
  let currentUnits = 0;
  let runningIndex = 1;

  for (const item of items) {
    const itemUnits = Math.max(1, item.rowUnits);
    const exceed = currentUnits + itemUnits > maxUnits;

    if (currentPage.length > 0 && exceed) {
      result.push(currentPage);
      currentPage = [];
      currentUnits = 0;
    }

    currentPage.push({
      ...item,
      index: runningIndex,
    });
    runningIndex += 1;
    currentUnits += itemUnits;

    if (currentUnits >= maxUnits) {
      result.push(currentPage);
      currentPage = [];
      currentUnits = 0;
    }
  }

  if (currentPage.length > 0) {
    while (currentUnits < maxUnits) {
      currentPage.push({
        index: runningIndex,
        repairText: "",
        partText: "",
        quantity: "",
        unitPrice: "",
        totalPrice: "",
        rowUnits: 1,
        rowHeight: BASE_TABLE_ROW_HEIGHT,
      });
      runningIndex += 1;
      currentUnits += 1;
    }
    result.push(currentPage);
  }

  return result;
}

function getColumnPixelWidth(worksheet: ExcelJS.Worksheet, col: number): number {
  const width = worksheet.getColumn(col).width ?? 8.43;
  return Math.max(1, Math.floor(width * 7 + 5));
}

function getRowPixelHeight(worksheet: ExcelJS.Worksheet, row: number): number {
  const rowHeight = worksheet.getRow(row).height ?? worksheet.properties.defaultRowHeight ?? 15;
  return Math.max(1, Math.floor((rowHeight * 96) / 72));
}

function getRangePixelSize(
  worksheet: ExcelJS.Worksheet,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): { width: number; height: number } {
  let width = 0;
  let height = 0;

  for (let c = startCol; c <= endCol; c += 1) {
    width += getColumnPixelWidth(worksheet, c);
  }
  for (let r = startRow; r <= endRow; r += 1) {
    height += getRowPixelHeight(worksheet, r);
  }

  return { width, height };
}

function pixelToColumnOffset(
  worksheet: ExcelJS.Worksheet,
  startCol: number,
  pixels: number
): number {
  let remaining = pixels;
  let col = startCol;
  let units = 0;

  while (remaining > 0) {
    const colPixels = getColumnPixelWidth(worksheet, col);
    if (remaining >= colPixels) {
      units += 1;
      remaining -= colPixels;
      col += 1;
    } else {
      units += remaining / colPixels;
      remaining = 0;
    }
  }

  return units;
}

function pixelToRowOffset(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  pixels: number
): number {
  let remaining = pixels;
  let row = startRow;
  let units = 0;

  while (remaining > 0) {
    const rowPixels = getRowPixelHeight(worksheet, row);
    if (remaining >= rowPixels) {
      units += 1;
      remaining -= rowPixels;
      row += 1;
    } else {
      units += remaining / rowPixels;
      remaining = 0;
    }
  }

  return units;
}

async function getImageSize(base64DataUrl: string): Promise<{ width: number; height: number }> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Failed to load image dimensions"));
    image.src = base64DataUrl;
  });
}

async function addContainedImageToRange(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  imageDataUrl: string,
  extension: "png" | "jpeg",
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): Promise<void> {
  const { width: imageWidth, height: imageHeight } = await getImageSize(imageDataUrl);
  const { width: boxWidth, height: boxHeight } = getRangePixelSize(worksheet, startCol, startRow, endCol, endRow);
  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);

  const renderWidth = Math.max(1, Math.floor(imageWidth * scale));
  const renderHeight = Math.max(1, Math.floor(imageHeight * scale));
  const offsetX = Math.floor((boxWidth - renderWidth) / 2);
  const offsetY = Math.floor((boxHeight - renderHeight) / 2);

  const colOffset = pixelToColumnOffset(worksheet, startCol, offsetX);
  const rowOffset = pixelToRowOffset(worksheet, startRow, offsetY);

  const imageId = workbook.addImage({
    base64: imageDataUrl,
    extension,
  });

  worksheet.addImage(imageId, {
    tl: { col: startCol - 1 + colOffset, row: startRow - 1 + rowOffset },
    ext: { width: renderWidth, height: renderHeight },
  });
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
): Promise<string> {
  const worksheet = workbook.addWorksheet(sheetNameForRecordPage(record, index, pageIndex, totalPages));

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
    { width: 6 },
    { width: 20 },
    { width: 20 },
    { width: 10 },
    { width: 9 },
    { width: 10 },
    { width: 9 },
    { width: 10 },
  ];
  worksheet.mergeCells("A1:B4");
  worksheet.mergeCells("C1:F1");
  worksheet.mergeCells("C2:F2");
  worksheet.mergeCells("C3:F4");

  worksheet.getRow(1).height = 28;
  worksheet.getRow(2).height = 20;
  worksheet.getRow(3).height = 20;
  worksheet.getRow(4).height = 30;

  await addContainedImageToRange(workbook, worksheet, logoDataUrl, "jpeg", 1, 1, 2, 4);
  
  setCell(worksheet, "C1", "บริษัท ประธานพรเซอร์วิซ จำกัด", { bold: true, fontSize: 16, align: "center" });
  setCell(worksheet, "C2", "124/69 หมู่ 4 ถ.เลียบคลอง 10 ต.บึงสนั่น อ.ธัญบุรี จ.ปทุมธานี 12110", { fontSize: 10, align: "center" });
  // setCell(worksheet, "C3", "เบอร์โทรติดต่อ 081-3747760, 02-9089477 แฟกซ์ 02-9089477", { fontSize: 10, align: "center" });
  setCell(worksheet, "C3", "ใบแจ้งซ่อม", { bold: true, fontSize: 20 , align: "center" });

  worksheet.mergeCells("G6:H11");

  if (record.photo) {
    const extension = record.photo.includes("image/png") ? "png" : "jpeg";
    await addContainedImageToRange(workbook, worksheet, record.photo, extension, 7, 6, 8, 11);
  }

  worksheet.mergeCells("A6:C6");
  worksheet.mergeCells("D6:F6");
  worksheet.mergeCells("A7:F7");
  worksheet.mergeCells("A8:B8");
  worksheet.mergeCells("C8:D8");
  worksheet.mergeCells("E8:F8");
  worksheet.mergeCells("A9:C9");
  worksheet.mergeCells("D9:F9");
  worksheet.mergeCells("A10:C10");
  worksheet.mergeCells("D10:F10");
  worksheet.mergeCells("A11:C11");
  worksheet.mergeCells("D11:F11");

  for (let row = 6; row <= 11; row += 1) {
    worksheet.getRow(row).height = INFO_SECTION_ROW_HEIGHT;
  }

  setLabelValueCell(worksheet, "A6", "ชื่อ บริษัท/ลูกค้า", record.client || "-");
  setLabelValueCell(worksheet, "D6", "เบอร์โทร", record.phone || "-");
  setLabelValueCell(worksheet, "A7", "พขร.", record.driver || "-");
  setLabelValueCell(worksheet, "A8", "ยี่ห้อรถ", record.brand || "-");
  setLabelValueCell(worksheet, "C8", "รุ่นรถ", record.vehicleModel || "-");
  setLabelValueCell(worksheet, "E8", "เบอร์รถ", record.vehicleNumber || "-");
  setLabelValueCell(worksheet, "A9", "ทะเบียนรถ", record.licensePlate || "-");
  setLabelValueCell(worksheet, "D9", "เลขตัวถัง", record.vehicleIdentificationNumber || "-");
  setLabelValueCell(worksheet, "A10", "เลขเครื่อง", record.serialNumber || "-");
  setLabelValueCell(worksheet, "D10", "เลขไมล์", record.mileNumber || "-");
  setLabelValueCell(worksheet, "A11", "เลข Job", record.jobNumber || "-");
  setLabelValueCell(worksheet, "D11", "วันที่ใบแจ้งซ่อม", formatThaiDateTime(record.repairReportDate));

  applyBorderRange(worksheet, 6, 11, 1, 6);

  const tableHeaderRow = 13;
  const tableStartRow = DETAIL_START_ROW;
  const grandTotal = record.repairParts.reduce((sum, part) => sum + Number(part.totalPrice || 0), 0);



  const headers = ["ลำดับ", "รายการซ่อม", "รายการอะไหล่", "จำนวน", "ราคา/หน่วย", "ราคา", "หมายเหตุ"];
  worksheet.getRow(tableHeaderRow).height = 24;
  headers.forEach((header, i) => {
    const cell = worksheet.getCell(tableHeaderRow, i + 1);
    cell.value = header; 
    cell.font = { name: "Arial", size: 10, bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = BORDER_THIN;
  });
  worksheet.mergeCells(`G${tableHeaderRow}:H${tableHeaderRow}`);
  worksheet.getCell(tableHeaderRow, 8).border = BORDER_THIN;

  for (let i = 0; i < pageRows.length; i += 1) {
    const row = tableStartRow + i;
    if (row > DETAIL_END_ROW) {
      break;
    }
    const rowData = pageRows[i];
    worksheet.getRow(row).height = rowData.rowHeight;

    worksheet.getCell(row, 1).value = rowData.index > 0 ? rowData.index : "";
    worksheet.getCell(row, 2).value = rowData.repairText;
    worksheet.getCell(row, 3).value = rowData.partText;
    worksheet.getCell(row, 4).value = rowData.quantity;
    worksheet.getCell(row, 5).value = rowData.unitPrice;
    worksheet.getCell(row, 5).numFmt = "#,##0.00";
    worksheet.getCell(row, 6).value = {
      formula: `IF(AND(D${row}<>"",E${row}<>""),D${row}*E${row},"")`,
      result: rowData.totalPrice ? Number(rowData.totalPrice) : undefined,
    };
    worksheet.getCell(row, 6).numFmt = "#,##0.00";
    worksheet.getCell(row, 7).value = "";
    worksheet.mergeCells(`G${row}:H${row}`);

    for (let c = 1; c <= 8; c += 1) {
      const cell = worksheet.getCell(row, c);
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = {
        horizontal: c === 1 || c >= 4 ? "center" : "left",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = BORDER_THIN;
    }
  }

  const signatureRow = SIGNATURE_BOTTOM_ROW;

  if (pageIndex === totalPages - 1) {
    const totalRow = signatureRow - 1;
    const lastDataRow = DETAIL_END_ROW;
    worksheet.mergeCells(`A${totalRow}:E${totalRow}`);
    worksheet.mergeCells(`F${totalRow}:H${totalRow}`);

    setCell(worksheet, `A${totalRow}`, "รวมราคา", { bold: true, align: "center", fontSize: 10 });
    worksheet.getCell(`F${totalRow}`).value = {
      formula: `SUMIFS(F${tableStartRow}:F${lastDataRow},A${tableStartRow}:A${lastDataRow},"<>")`,
      result: grandTotal,
    };
    worksheet.getCell(`F${totalRow}`).numFmt = "#,##0.00";
    worksheet.getCell(`F${totalRow}`).font = { name: "Arial", size: 10, bold: true };
    worksheet.getCell(`F${totalRow}`).alignment = { horizontal: "right", vertical: "middle" };

    applyBorderRange(worksheet, totalRow, totalRow, 1, 8);
  }

  worksheet.mergeCells(`C${signatureRow}:E${signatureRow}`);
  setCell(worksheet, `C${signatureRow}`, "ลายเซ็น ............................", { align: "center", fontSize: 12 });
  worksheet.getRow(signatureRow).height = 24;
  worksheet.getCell(`C${signatureRow}`).alignment = {
    horizontal: "center",
    vertical: "bottom",
    wrapText: true,
  };

  worksheet.pageSetup.printArea = `A1:H${SIGNATURE_BOTTOM_ROW}`;

  return worksheet.name;
}

export async function exportToExcel(records: RepairRecord[]): Promise<void> {
  if (records.length === 0) {
    alert("ไม่มีข้อมูลให้ export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.calcProperties.fullCalcOnLoad = true;
  const logoDataUrl = await toBase64DataUrl(hinoLogo);

  for (let i = 0; i < records.length; i += 1) {
    const rows = buildExcelRows(records[i]);
    const pages = toPageChunks(rows, PAGE_ROW_CAPACITY_UNITS);
    const pageSheetNames: string[] = [];
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const sheetName = await buildTemplateSheet(
        workbook,
        records[i],
        i,
        pageIndex,
        pages.length,
        pages[pageIndex],
        logoDataUrl
      );
      pageSheetNames.push(sheetName);
    }


    const lastPageIndex = pages.length - 1;
    if (lastPageIndex >= 0) {
      const lastSheet = workbook.getWorksheet(pageSheetNames[lastPageIndex]);
      if (lastSheet) {
        const totalRow = SIGNATURE_BOTTOM_ROW - 1;
        const formulaRefs = pageSheetNames
          .map((sheetName) => {
            const sheetRef = sheetNameForFormula(sheetName);
            return `SUMIFS(${sheetRef}!F${DETAIL_START_ROW}:F${DETAIL_END_ROW},${sheetRef}!A${DETAIL_START_ROW}:A${DETAIL_END_ROW},"<>")`;
          })
          .join(",");

        lastSheet.getCell(`F${totalRow}`).value = {
          formula: formulaRefs ? `SUM(${formulaRefs})` : "0",
        };
      }
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

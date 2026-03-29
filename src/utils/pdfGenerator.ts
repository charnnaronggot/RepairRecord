import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { RepairRecord } from "../types/RepairRecord";
import autoTable from "jspdf-autotable";
import { formatThaiDateTime } from "./dateTime";

const DEFAULT_EXPORT_FONT = "Arial";

const PDF_FONT_SIZE = {
  title: 20,
  subtitle: 11,
  body: 11,
  sectionTitle: 13,
  table: 10,
  footer: 9,
} as const;

export function generateRepairPDF(record: RepairRecord): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const normalizedRemarks =
    record.remarks && record.remarks.length > 0
      ? record.remarks
      : record.remark
        ? [{ id: "legacy-remark", description: record.remark }]
        : [];

  // ─── Header ───
  doc.setFontSize(PDF_FONT_SIZE.title);
  doc.text("ใบรายงานการซ่อม", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(PDF_FONT_SIZE.subtitle);
  doc.text("Repair Report", pageWidth / 2, 26, { align: "center" });

  doc.setDrawColor(44, 62, 80);
  doc.setLineWidth(0.5);
  doc.line(15, 30, pageWidth - 15, 30);

  // ─── Info section ───
  doc.setFontSize(PDF_FONT_SIZE.body);
  const startY = 38;
  const col1X = 18;
  const col2X = pageWidth / 2 + 5;
  const lineH = 7;

  const leftFields: [string, string][] = [
    ["Invoice No.", record.invoiceNumber],
    ["Client", record.client],
    ["Phone", record.phone],
    ["Driver", record.driver],
    ["Date", formatThaiDateTime(record.repairReportDate)],
    ["Brand", record.brand],
    ["Model", record.vehicleModel],
  ];

  const rightFields: [string, string][] = [
    ["Vehicle No.", record.vehicleNumber],
    ["License Plate", record.licensePlate],
    ["VIN", record.vehicleIdentificationNumber],
    ["Serial No.", record.serialNumber],
    ["Mile No.", record.mileNumber],
    ["Job No.", record.jobNumber],
  ];

  leftFields.forEach(([label, value], i) => {
    doc.setFont(DEFAULT_EXPORT_FONT, "bold");
    doc.text(`${label}:`, col1X, startY + i * lineH);
    doc.setFont(DEFAULT_EXPORT_FONT, "normal");
    doc.text(value || "-", col1X + 35, startY + i * lineH);
  });

  rightFields.forEach(([label, value], i) => {
    doc.setFont(DEFAULT_EXPORT_FONT, "bold");
    doc.text(`${label}:`, col2X, startY + i * lineH);
    doc.setFont(DEFAULT_EXPORT_FONT, "normal");
    doc.text(value || "-", col2X + 35, startY + i * lineH);
  });

  // ─── Photo ───
  const infoEndY = startY + Math.max(leftFields.length, rightFields.length) * lineH + 5;


  if (record.photo) {
    try {
      const base64Data = extractBase64(record.photo);
      if (base64Data) {
        doc.addImage("data:image/jpeg;base64," + base64Data, "JPEG", col2X + 50, startY - 3, 35, 28);
      }
    } catch (err) {
      console.error("Photo could not be embedded:", err);
    }
  }

  // ─── Repair items table ───
  doc.setDrawColor(44, 62, 80);
  doc.line(15, infoEndY, pageWidth - 15, infoEndY);

  doc.setFontSize(PDF_FONT_SIZE.sectionTitle);
  doc.setFont(DEFAULT_EXPORT_FONT, "bold");
  doc.text("Repair Items (แรงงาน/การซ่อม)", 18, infoEndY + 8);

  const itemTableBody = record.repairItems.map((item, idx) => [
    (idx + 1).toString(),
    item.description,
  ]);

  // const itemsTotal = record.repairItems.reduce((s, i) => s + i.totalPrice, 0);

  autoTable(doc, {
    startY: infoEndY + 12,
    head: [["#", "Description"]],
    body: itemTableBody,
    foot: [
      [
        "",
        "Subtotal",
        // itemsTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [236, 240, 241], textColor: [44, 62, 80], fontStyle: "bold" },
    styles: { fontSize: PDF_FONT_SIZE.table, cellPadding: 3 },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: 176 },
    },
    margin: { left: 15, right: 15 },
  });

  // ─── Repair Parts Table ───
  const partsTableStartY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(PDF_FONT_SIZE.sectionTitle);
  doc.setFont(DEFAULT_EXPORT_FONT, "bold");
  doc.text("Parts (อะไหล่/วัสดุ)", 18, partsTableStartY);

  const partTableBody = record.repairParts.map((part, idx) => [
    (idx + 1).toString(),
    part.partName,
    part.quantity.toString(),
    part.unit || "-",
    part.unitPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
    part.totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
  ]);

  // const partsTotal = record.repairParts.reduce((s, p) => s + p.totalPrice, 0);
  // const grandTotal = itemsTotal + partsTotal;

  autoTable(doc, {
    startY: partsTableStartY + 4,
    head: [["#", "Part Name", "Qty", "Unit", "Unit Price", "Total"]],
    body: partTableBody,
    foot: [
      [
        "",
        "",
        "",
        "",
        "Grand Total",
        // grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [236, 240, 241], textColor: [44, 62, 80], fontStyle: "bold" },
    styles: { fontSize: PDF_FONT_SIZE.table, cellPadding: 3 },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      2: { halign: "center", cellWidth: 18 },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "right", cellWidth: 28 },
      5: { halign: "right", cellWidth: 28 },
    },
    margin: { left: 15, right: 15 },
  });

  if (normalizedRemarks.length > 0) {
    const remarksTableStartY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(PDF_FONT_SIZE.sectionTitle);
    doc.setFont(DEFAULT_EXPORT_FONT, "bold");
    doc.text("Remarks (หมายเหตุ)", 18, remarksTableStartY);

    autoTable(doc, {
      startY: remarksTableStartY + 4,
      head: [["#", "Remark"]],
      body: normalizedRemarks.map((remark, idx) => [
        (idx + 1).toString(),
        remark.description || "-",
      ]),
      theme: "grid",
      headStyles: { fillColor: [84, 110, 122], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: PDF_FONT_SIZE.table, cellPadding: 3 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 168 },
      },
      margin: { left: 15, right: 15 },
    });
  }

  // ─── Footer ───
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(PDF_FONT_SIZE.footer);
  doc.setFont(DEFAULT_EXPORT_FONT, "normal");
  doc.setTextColor(150);
  doc.text(
    `Generated on ${new Date().toLocaleString("th-TH")} — Repair Record System`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // ─── Save ───
  doc.save(`repair_report_${record.invoiceNumber || "draft"}.pdf`);
}
function extractBase64(dataUrl: string): string {
  if (!dataUrl) return "";
  if (dataUrl.startsWith("data:")) {
    return dataUrl.split(",")[1] || "";
  }
  return dataUrl;
}
/**
 * Generates a dummy PDF for testing/demonstration without real data.
 */
export function generateDummyPDF(): void {
  const dummyRecord: RepairRecord = {
    invoiceNumber: "INV-2026-0001",
    client: "บริษัท ทดสอบ จำกัด",
    phone: "081-234-5678",
    driver: "นายสมชาย พนักงานขับรถ",
    repairReportDate: "2026-03-07T10:30",
    brand: "Toyota",
    vehicleModel: "Hilux Revo",
    vehicleNumber: "VH-12345",
    licensePlate: "กข 1234 กรุงเทพ",
    vehicleIdentificationNumber: "JTFHY12R3X0123456",
    serialNumber: "SN-987654",
    mileNumber: "85,230",
    jobNumber: "JOB-2026-042",
    photo: "",
    status: "pending",
    repairItems: [
      {
        id: "1",
        description: "เปลี่ยนน้ำมันเครื่อง",
        // quantity: 1,
        // unitPrice: 2500,
        // totalPrice: 2500,
      },
      {
        id: "2",
        description: "ผ้าเบรกหน้า",
        // quantity: 2,
        // unitPrice: 1800,
        // totalPrice: 3600,
      },
      {
        id: "3",
        description: "กรองอากาศ",
        // quantity: 1,
        // unitPrice: 450,
        // totalPrice: 450,
      },
      {
        id: "4",
        description: "ค่าแรงช่าง",
        // quantity: 3,
        // unitPrice: 800,
        // totalPrice: 2400,
      },
    ],
    repairParts: [
      {
        id: "p1",
        partName: "Oil Filter",
        quantity: 1,
        unit: "ชิ้น",
        unitPrice: 350,
        totalPrice: 350,
      },
      {
        id: "p2",
        partName: "Brake Pads (Front)",
        quantity: 1,
        unit: "ชุด",
        unitPrice: 2200,
        totalPrice: 2200,
      },
      {
        id: "p3",
        partName: "Air Filter",
        quantity: 1,
        unit: "ชิ้น",
        unitPrice: 450,
        totalPrice: 450,
      },
      {
        id: "p4",
        partName: "Coolant",
        quantity: 2,
        unit: "ลิตร",
        unitPrice: 400,
        totalPrice: 800,
      },
    ],
    remarks: [
      {
        id: "r1",
        description: "ลูกค้าแจ้งให้ตรวจสอบเสียงดังบริเวณล้อหน้า",
      },
      {
        id: "r2",
        description: "แนะนำให้กลับมาตรวจเช็กซ้ำหลังใช้งาน 1 สัปดาห์",
      },
    ],
    remark: "ลูกค้าแจ้งให้ตรวจสอบเสียงดังบริเวณล้อหน้า\nแนะนำให้กลับมาตรวจเช็กซ้ำหลังใช้งาน 1 สัปดาห์",
  };

  generateRepairPDF(dummyRecord);
}

export function generateRepairPDFFromHTML(htmlElement: HTMLElement): void {
  const render = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageElements = Array.from(htmlElement.querySelectorAll<HTMLElement>(".pdf-page"));
    const targets = pageElements.length > 0 ? pageElements : [htmlElement];

    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      const targetWidth = target.offsetWidth;
      const targetHeight = target.offsetHeight;

      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        width: targetWidth,
        height: targetHeight,
        windowWidth: targetWidth,
        windowHeight: targetHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          const root = clonedDoc.getElementById("repair-pdf-template");
          if (root) {
            root.style.margin = "0";
          }
        },
      });

      if (i > 0) {
        doc.addPage();
      }

      const imgData = canvas.toDataURL("image/png");
      const canvasAspectRatio = canvas.width / canvas.height;
      const pageAspectRatio = pageWidth / pageHeight;

      let renderWidth = pageWidth;
      let renderHeight = pageHeight;

      if (canvasAspectRatio > pageAspectRatio) {
        renderHeight = pageWidth / canvasAspectRatio;
      } else {
        renderWidth = pageHeight * canvasAspectRatio;
      }

      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      doc.addImage(imgData, "PNG", x, y, renderWidth, renderHeight, undefined, "FAST");
    }

    doc.save(`repair_report_${Date.now()}.pdf`);
  };

  void render();
}

import type { RepairRecord } from "../types/RepairRecord";

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
    "Invoice No.",
    "Client",
    "Phone",
    "PCR",
    "Date",
    "Brand",
    "Model",
    "Vehicle No.",
    "License Plate",
    "VIN",
    "Serial No.",
    "Mile No.",
    "Job No.",
    "Status",
    "Repair Items Count",
    "Parts Count",
    "Created Date",
  ];

  // Prepare data rows
  const rows = records.map((record) => [
    record.invoiceNumber,
    record.client,
    record.phone,
    record.pcr,
    record.repairReportDate,
    record.brand,
    record.vehicleModel,
    record.vehicleNumber,
    record.licensePlate,
    record.vehicleIdentificationNumber,
    record.serialNumber,
    record.mileNumber,
    record.jobNumber,
    record.status,
    record.repairItems.length,
    record.repairParts.length,
    record.createdAt ? new Date(record.createdAt).toLocaleString("th-TH") : "-",
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
 * Export records to Excel format using simple HTML table approach
 * (For better Excel support, consider using xlsx library)
 */
export function exportToExcel(records: RepairRecord[]): void {
  if (records.length === 0) {
    alert("ไม่มีข้อมูลให้ export");
    return;
  }

  // Create HTML table
  let html = `
    <table border="1">
      <thead>
        <tr style="background-color: #2c3e50; color: white; font-weight: bold;">
          <th>Invoice No.</th>
          <th>Client</th>
          <th>Phone</th>
          <th>PCR</th>
          <th>Date</th>
          <th>Brand</th>
          <th>Model</th>
          <th>Vehicle No.</th>
          <th>License Plate</th>
          <th>VIN</th>
          <th>Serial No.</th>
          <th>Mile No.</th>
          <th>Job No.</th>
          <th>Status</th>
          <th>Items</th>
          <th>Parts</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
  `;

  records.forEach((record) => {
    const statusColor = record.status === "completed" ? "#27ae60" : "#e67e22";
    html += `
      <tr>
        <td>${record.invoiceNumber}</td>
        <td>${record.client}</td>
        <td>${record.phone}</td>
        <td>${record.pcr}</td>
        <td>${record.repairReportDate}</td>
        <td>${record.brand}</td>
        <td>${record.vehicleModel}</td>
        <td>${record.vehicleNumber}</td>
        <td>${record.licensePlate}</td>
        <td>${record.vehicleIdentificationNumber}</td>
        <td>${record.serialNumber}</td>
        <td>${record.mileNumber}</td>
        <td>${record.jobNumber}</td>
        <td style="background-color: ${statusColor}; color: white; font-weight: bold;">${record.status}</td>
        <td style="text-align: center;">${record.repairItems.length}</td>
        <td style="text-align: center;">${record.repairParts.length}</td>
        <td>${record.createdAt ? new Date(record.createdAt).toLocaleString("th-TH") : "-"}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  // Create blob and download
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `repair_records_${new Date().toISOString().split("T")[0]}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

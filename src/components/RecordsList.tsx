import { useState, useEffect } from "react";
import type { RepairRecord } from "../types/RepairRecord";
import { getRepairRecords, updateRepairRecord, deleteRepairRecord } from "../services/firebaseService";
import { generateRepairPDF } from "../utils/pdfGenerator";
import { exportToCSV, exportToExcel } from "../utils/exportUtils";

interface RecordsListProps {
  onEdit: (record: RepairRecord) => void;
}

export default function RecordsList({ onEdit }: RecordsListProps) {
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [message, setMessage] = useState("");

  // Load records on mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getRepairRecords();
      setRecords(data);
    } catch (err) {
      console.error(err);
      setMessage("ไม่สามารถโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (record: RepairRecord) => {
    try {
      const newStatus = record.status === "pending" ? "completed" : "pending";
      await updateRepairRecord(record.id!, { status: newStatus });
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, status: newStatus } : r))
      );
      setMessage(`อัพเดทสถานะเป็น "${newStatus === "completed" ? "เสร็จแล้ว" : "รอดำเนินการ"}" สำเร็จ`);
    } catch (err) {
      console.error(err);
      setMessage("ไม่สามารถอัพเดทสถานะ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบรายการนี้หรือไม่?")) return;
    try {
      await deleteRepairRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setMessage("ลบรายการสำเร็จ");
    } catch (err) {
      console.error(err);
      setMessage("ไม่สามารถลบรายการ");
    }
  };

  // Filter records
const filteredRecords = records.filter((record) => {
  const matchesSearch = (
    String(record.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(record.client || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(record.vehicleNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="records-list-container">
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="records-list-container">
      <header className="list-header">
        <h1>📋 รายการการซ่อม</h1>
        <p>จำนวนทั้งหมด: {records.length}</p>
      </header>

      {/* Filters & Actions */}
      <div className="list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="ค้นหา (Invoice, Client, License Plate)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">ทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="completed">เสร็จแล้ว</option>
          </select>

          <button className="btn btn-primary" onClick={loadRecords}>
            🔄 รีโหลด
          </button>
          {/* <button className="btn btn-secondary" onClick={() => exportToCSV(filteredRecords)}>
            📥 CSV
          </button> */}
          <button className="btn btn-secondary" onClick={() => exportToExcel(filteredRecords)}>
            📥 Excel
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th>Invoice No.</th>
              <th>Client</th>
              <th>Vehicle</th>
              <th>License Plate</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ width: "280px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-row">
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              filteredRecords.map((record, idx) => (
                <tr key={record.id}>
                  <td className="center">{idx + 1}</td>
                  <td>
                    <strong>{record.invoiceNumber}</strong>
                  </td>
                  <td>{record.client}</td>
                  <td>
                    {record.brand} {record.vehicleModel}
                  </td>
                  <td>{record.licensePlate}</td>
                  <td className="center">
                    <span className={`status-badge status-${record.status}`}>
                      {record.status === "completed" ? "✓ เสร็จแล้ว" : "⏳ รอดำเนินการ"}
                    </span>
                  </td>
                  <td className="small">
                    {record.repairReportDate
                      ? new Date(record.repairReportDate).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                      : "-"}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-action toggler"
                      onClick={() => handleToggleStatus(record)}
                      title={record.status === "pending" ? "Mark complete" : "Mark pending"}
                    >
                      {record.status === "pending" ? "✓ Mark" : "↩️ Undo"}
                    </button>
                    <button
                      className="btn-action editor"
                      onClick={() => onEdit(record)}
                      title="Edit record"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-action viewer"
                      onClick={() => generateRepairPDF(record)}
                      title="View PDF"
                    >
                      📄 PDF
                    </button>
                    <button className = "btn-action viewer" onClick = {() => exportToExcel([record])}>
                      📥 Excel
                    </button>
                    <button
                      className="btn-action deleter"
                      onClick={() => handleDelete(record.id!)}
                      title="Delete record"
                    >
                      🗑️ Del
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {message && (
        <div className={`toast ${message.includes("ไม่") ? "toast-error" : "toast-success"}`}>
          {message}
        </div>
      )}
    </div>
  );
}

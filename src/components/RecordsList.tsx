import { useState, useEffect, useRef } from "react";
import type { RepairRecord } from "../types/RepairRecord";
import { getRepairRecords, updateRepairRecord, deleteRepairRecord } from "../services/firebaseService";
// import { generateRepairPDF } from "../utils/pdfGenerator";
import { generateRepairPDFFromHTML } from "../utils/pdfGenerator";
import { exportToExcel } from "../utils/exportUtils";
import RepairPDFTemplate from "../PDFTemplate/RepairPDFTemplate";
import { formatThaiDateTime } from "../utils/dateTime";

interface RecordsListProps {
  onEdit: (record: RepairRecord) => void;
}

export default function RecordsList({ onEdit }: RecordsListProps) {
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(10);
  const [message, setMessage] = useState("");
  const [pdfRecords, setPdfRecords] = useState<RepairRecord[]>([]);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);

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

  const handleExportFilteredPDF = () => {
    if (filteredRecords.length === 0) {
      setMessage("ไม่พบข้อมูลสำหรับ export PDF");
      return;
    }
    setPdfRecords(filteredRecords);
    setIsPreparingPdf(true);
  };

  const handleExportRecordPDF = (record: RepairRecord) => {
    setPdfRecords([record]);
    setIsPreparingPdf(true);
  };

  // Filter records
  const filteredRecords = records
  .filter((record) => {
    const matchesSearch = (
      String(record.jobNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(record.client || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(record.licensePlate || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;

    const recordDate = record.repairReportDate ? record.repairReportDate.slice(0, 10) : "";
    const matchesFrom = dateFrom === "" || recordDate >= dateFrom;
    const matchesTo = dateTo === "" || recordDate <= dateTo;

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });
//   .sort((a, b) => {
//     const numA = Number(a.jobNumber);
//     const numB = Number(b.jobNumber);
//     if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
//     return String(b.jobNumber || "").localeCompare(String(a.jobNumber || ""));
//   }
// );

  const isShowAll = pageSize === "all";
  const effectivePageSize = isShowAll ? Math.max(filteredRecords.length, 1) : pageSize;
  const totalPages = isShowAll ? 1 : Math.max(1, Math.ceil(filteredRecords.length / effectivePageSize));
  const startIndex = isShowAll ? 0 : (currentPage - 1) * effectivePageSize;
  const paginatedRecords = isShowAll
    ? filteredRecords
    : filteredRecords.slice(startIndex, startIndex + effectivePageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isPreparingPdf || !pdfContainerRef.current || pdfRecords.length === 0) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      generateRepairPDFFromHTML(pdfContainerRef.current! , pdfRecords);
      setIsPreparingPdf(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isPreparingPdf, pdfRecords]);

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
            placeholder="ค้นหา (Job No., Client, License Plate)"
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

          <label className="date-range-label">
            ตั้งแต่
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="filter-date"
            />
          </label>
          <label className="date-range-label">
            ถึง
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="filter-date"
            />
          </label>
          {(dateFrom || dateTo) && (
            <button className="btn btn-secondary" onClick={() => { setDateFrom(""); setDateTo(""); }}>
              ✕ ล้างวันที่
            </button>
          )}

          <button className="btn btn-primary" onClick={loadRecords}>
            🔄 รีโหลด
          </button>

          <button className="btn btn-excel" onClick={() => exportToExcel(filteredRecords)}>
            📥 Excel
          </button>
          <button className="btn btn-pdf" onClick={handleExportFilteredPDF}>
            📄 PDF
          </button>
          
        </div>
      </div>

      {/* Records Table */}
      <div className="table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th>Job no.</th>
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
              paginatedRecords.map((record, idx) => (
                <tr key={record.id}>
                  <td className="center">{startIndex + idx + 1}</td>
                  <td>
                    <strong>{record.jobNumber}</strong>
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
                    {formatThaiDateTime(record.repairReportDate)}
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
                      className="btn-action pdf-action"
                      onClick={() => handleExportRecordPDF(record)}
                      title="View PDF"
                    >
                      📄 PDF
                    </button>
                    <button className = "btn-action excel-action" onClick = {() => exportToExcel([record])}>
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

      {filteredRecords.length > 0 && (
        <div className="list-controls" style={{ marginTop: "12px" }}>
          <div className="filter-controls" style={{ marginLeft: "auto" }}>
           
            <div className="pagination">
               <label className="date-range-label">
              ต่อหน้า
              <select
                value={pageSize}
                onChange={(e) => {
                  const value = e.target.value;
                  setPageSize(value === "all" ? "all" : Number(value));
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </label>
              <button
                className="page-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={isShowAll || currentPage === 1}
              >
              ◀ ก่อนหน้า
            </button>

            <span className="small" style={{ alignSelf: "center" }}>
              หน้า {currentPage} / {totalPages}
            </span>

            <button
              className={`page-btn ${isShowAll || currentPage === totalPages ? "disabled" : ""}`}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={isShowAll || currentPage === totalPages}
            >
              ถัดไป ▶
            </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`toast ${message.includes("ไม่") ? "toast-error" : "toast-success"}`}>
          {message}
        </div>
      )}

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div ref={pdfContainerRef}>
          {pdfRecords.map((record, index) => (
            <RepairPDFTemplate
              key={record.id ?? `${record.jobNumber}-${index}`}
              form={record}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

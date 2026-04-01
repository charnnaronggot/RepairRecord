import { useState , useRef , useEffect} from "react";
import Camera from "./Camera";
import RepairItemsTable from "./RepairItemsTable";
import RepairPartsTable from "./RepairPartsTable";
import AutocompleteInput from "./AutocompleteInput";
import type { RepairRecord, RepairItem, RepairPart } from "../types/RepairRecord";
import { emptyRepairRecord } from "../types/RepairRecord";
import { addRepairRecord, updateRepairRecord , getNextJobNumber  } from "../services/firebaseService";
import { generateRepairPDFFromHTML } from "../utils/pdfGenerator";
import { clientsList, brandsList } from "../config/clientsAndBrands";
import RepairPDFTemplate from "../PDFTemplate/RepairPDFTemplate";
import { exportToExcel } from "../utils/exportUtils";
interface RepairFormProps {
  initialRecord?: RepairRecord;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function RepairForm({ initialRecord, onSave, onCancel }: RepairFormProps) {
  const [form, setForm] = useState<RepairRecord>(initialRecord || { ...emptyRepairRecord });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isEdit = !!initialRecord?.id;
  const pdfTemplateRef = useRef<HTMLDivElement | null>(null);
  const updateField = (field: keyof RepairRecord, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemsChange = (items: RepairItem[]) => {
    setForm((prev) => ({ ...prev, repairItems: items }));
  };

  const handlePartsChange = (parts: RepairPart[]) => {
    setForm((prev) => ({ ...prev, repairParts: parts }));
  };

  const handlePhotoCapture = (imageData: string) => {
    setForm((prev) => ({ ...prev, photo: imageData }));
  };

  useEffect(() => {
    if (isEdit) return;

    let mounted = true;
    getNextJobNumber()
    .then((next) => {
    if (!mounted) return;
    setForm((prev) => ({ ...prev, jobNumber: next }));
    })
    .catch((err) => {
    console.error("Failed to generate job number:", err);
    });

    return () => {
    mounted = false;
    };
    }, [isEdit]);

  const handleSave = async () => {
    
    setSaving(true);
    setMessage("");
    try {
      if (isEdit && form.id) {
        await updateRepairRecord(form.id, form);
        setMessage("แก้ไขสำเร็จ!");
      } else {
        const id = await addRepairRecord(form);
        setMessage(`บันทึกสำเร็จ! (ID: ${id})`);
        setForm({ ...emptyRepairRecord });
      }
      onSave?.();
    } catch (err) {
      console.error(err);
      setMessage("เกิดข้อผิดพลาดในการบันทึก — กรุณาตรวจสอบการเชื่อมต่อ Firebase"); 
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    if (!pdfTemplateRef.current) return;
    generateRepairPDFFromHTML(pdfTemplateRef.current);
  };

  const fields: { key: keyof RepairRecord; label: string; type?: string; placeholder?: string }[] = [
    { key: "jobNumber", label: "เลขที่งาน (Job No.)", placeholder: "JOB-XXXX" },
    { key: "client", label: "ลูกค้า (Client)", placeholder: "ชื่อลูกค้า / บริษัท" },
    { key: "phone", label: "เบอร์โทร (Phone)", placeholder: "0XX-XXX-XXXX", type: "tel" },
    { key: "driver", label: "พนักงานขับรถ", placeholder: "พนักงานขับรถ" },
    { key: "repairReportDate", label: "วันที่รายงาน (Date)", type: "date" },
    { key: "brand", label: "ยี่ห้อ (Brand)", placeholder: "e.g. Isuzu" },
    { key: "vehicleModel", label: "รุ่นรถ (Model)", placeholder: "e.g.GXZ360 " },
    { key: "vehicleNumber", label: "หมายเลขรถ (Vehicle No.)", placeholder: "Vehicle Number" },
    { key: "licensePlate", label: "ทะเบียนรถ (License Plate)", placeholder: "กข 1234 กรุงเทพ" },
    { key: "vehicleIdentificationNumber", label: "เลขตัวถัง (VIN)", placeholder: "17 characters" },
    { key: "serialNumber", label: "เลขเครื่อง (Serial Number)", placeholder: "Serial Number" },
    { key: "mileNumber", label: "เลขไมล์ (Mile)", placeholder: "e.g. 85,230" },
    { key: "invoiceNumber", label: "เลขที่ใบแจ้งซ่อม", placeholder: "INV-2026-XXXX" },
  ];

  return (
    <div className="repair-form-container">
      <header className="form-header">
        {/* <h1>{isEdit ? "✏️ แก้ไขการซ่อม" : "🔧 บันทึกการซ่อมใหม่"}</h1> */}
        {/* <p>{isEdit ? "Repair Record System - Edit" : "Repair Record System"}</p> */}
      </header>

      <form onSubmit={(e) => e.preventDefault()} >
        {/* ─── Vehicle & Client Info Grid ─── */}
        <section className="form-section" >
          <h2>ข้อมูลลูกค้า & ยานพาหนะ</h2>
          <div className="form-grid">
            {fields.map((f) => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                {f.key === "client" ? (
                  <AutocompleteInput
                    value={form[f.key] as string}
                    onChange={(value) => updateField(f.key, value)}
                    suggestions={clientsList}
                    placeholder={f.placeholder}
                    type={f.type}
                  />
                ) : f.key === "brand" ? (
                  <AutocompleteInput
                    value={form[f.key] as string}
                    onChange={(value) => updateField(f.key, value)}
                    suggestions={brandsList}
                    placeholder={f.placeholder}
                    type={f.type}
                  />
                ) : (
                <input
                  className="form-input"
                  type={f.type ?? "text"}
                  value={form[f.key] as string}
                  placeholder={f.placeholder}
                  onChange={(e) => updateField(f.key, e.target.value)}
                  readOnly={f.key === "jobNumber"}
                  disabled={f.key === "jobNumber"}
                />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Camera / Photo ─── */}
        <section className="form-section">
          <h2>รูปภาพ</h2>
          <Camera onCapture={handlePhotoCapture} currentPhoto={form.photo} />
        </section>

        {/* ─── Repair Items Table ─── */}
        <section className="form-section">
          <RepairItemsTable items={form.repairItems} onChange={handleItemsChange} />
        </section>

        {/* ─── Repair Parts Table ─── */}
        <section className="form-section">
          <RepairPartsTable parts={form.repairParts} onChange={handlePartsChange} />
        </section>

        {/* ─── Actions ─── */}
        <section className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : isEdit ? "✏️ แก้ไข" : "💾 บันทึกข้อมูล"}
          </button>
          {/* <button type="button" className="btn btn-secondary" onClick={handleGeneratePDF}>
            📄 สร้าง PDF
          </button> */}
          {/* <button type="button" className="btn btn-outline" onClick={generateDummyPDF}>
            📋 ดาวน์โหลด PDF ตัวอย่าง
          </button> */}
        <button type="button" className="btn btn-pdf" onClick={handleGeneratePDF}>
          📄 Generate PDF
        </button>
        <button type="button" className="btn btn-excel" onClick={() => exportToExcel([form])}>
          📥 Excel
        </button>
          {onCancel && (
            <button type="button" className="btn btn-cancel-outline" onClick={onCancel}>
              ❌ ยกเลิก
            </button>
          )}
        </section>

        {message && (
          <div className={`toast ${message.includes("สำเร็จ") ? "toast-success" : "toast-error"}`}>
            {message}
          </div>
        )}
      </form>

      {/* PDF Template (ซ่อนไว้: วางนอกจอ) */}
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
        <RepairPDFTemplate form={form} containerRef={pdfTemplateRef} />
      </div>


    </div>
  );
}

import type { RepairPart } from "../types/RepairRecord";
import { emptyRepairPart } from "../types/RepairRecord";
// import AutocompleteInput from "./AutocompleteInput";

interface RepairPartsTableProps {
  parts: RepairPart[];
  onChange: (parts: RepairPart[]) => void;
}

const COMMON_PART_UNITS = ["ชิ้น", "คู่", "งาน", "ครั้ง", "ชุด", "เส้น", "ลูก", "ตัว", "ลิตร" ,"kg" , "ข้าง" ,"ดวง" , "แผ่น" , "เพลา" ,"เที่ยว"];

export default function RepairPartsTable({ parts, onChange }: RepairPartsTableProps) {
  const roundTo2 = (value: number): number => Math.round(value * 100) / 100;
  const normalizeQuantity = (value: string | number): number => {
    if (value === "") return 0;

    const numericValue = typeof value === "number"
      ? value
      : Number.parseInt(value.replace(/^0+(?=\d)/, ""), 10);

    if (Number.isNaN(numericValue) || numericValue <= 0) {
      return 0;
    }

    return Math.trunc(numericValue);
  };

  const addRow = () => {
    onChange([
      ...parts,
      { ...emptyRepairPart, id: crypto.randomUUID() },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(parts.filter((part) => part.id !== id));
  };

  const updatePart = (id: string, field: keyof RepairPart, value: string | number) => {
    onChange(
      parts.map((part) => {
        if (part.id !== id) return part;
        const normalizedValue = field === "unitPrice"
          ? roundTo2(Number(value) || 0)
          : field === "quantity"
            ? normalizeQuantity(value)
            : value;
        const updated = { ...part, [field]: normalizedValue };
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = roundTo2(Number(updated.quantity) * Number(updated.unitPrice));
        }
        return updated;
      })
    );
  };

  const grandTotal = parts.reduce((sum, part) => sum + part.totalPrice, 0);

  return (
    <div className="repair-items-section">
      <div className="section-header">
        <h3>อะไหล่ / วัสดุ</h3>
        <button type="button" className="btn btn-add" onClick={addRow}>
          + เพิ่มอะไหล่
        </button>
      </div>

      <div className="table-wrapper">
        <table className="repair-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th>ชื่ออะไหล่</th>
              <th style={{ width: "80px" }}>จำนวน</th>
              <th style={{ width: "140px" }}>หน่วย</th>
              <th style={{ width: "120px" }}>ราคา/หน่วย</th>
              <th style={{ width: "120px" }}>รวม</th>
              <th style={{ width: "60px" }}></th>
            </tr>
          </thead>
          <tbody>
            {parts.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  ยังไม่มีอะไหล่ — กดปุ่ม "เพิ่มอะไหล่" เพื่อเริ่มต้น
                </td>
              </tr>
            )}
            {parts.map((part, idx) => (
              <tr key={part.id}>
                <td className="center">{idx + 1}</td>
                <td>
                  <input
                    type="text"
                    value={part.partName}
                    onChange={(e) => updatePart(part.id, "partName", e.target.value)}
                    placeholder="ชื่ออะไหล่"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={part.quantity === 0 ? "" : part.quantity}
                    onChange={(e) => updatePart(part.id, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    list="repair-part-unit-options"
                    value={part.unit}
                    onChange={(e) => updatePart(part.id, "unit", e.target.value)}
                    placeholder="เช่น ชิ้น / คู่ / งาน"
                  />
                                    {/* <AutocompleteInput
                                      value={form[f.key] as string}
                                      onChange={(value) => updateField(f.key, value)}
                                      suggestions={brandsList}
                                      placeholder={f.placeholder}
                                      type={f.type}
                                    /> */}
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={part.unitPrice === 0 ? "" : part.unitPrice}
                    onChange={(e) => updatePart(part.id, "unitPrice", Number(e.target.value))}
                  />
                </td>
                <td className="right">
                  {part.totalPrice.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="center">
                  <button
                    type="button"
                    className="btn btn-remove-sm"
                    onClick={() => removeRow(part.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {parts.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={4} className="right"><strong>รวมอะไหล่</strong></td>
                <td className="right">
                  <strong>
                    {grandTotal.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
        <datalist id="repair-part-unit-options">
          {COMMON_PART_UNITS.map((unit) => (
            <option key={unit} value={unit} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

import type { RepairPart } from "../types/RepairRecord";
import { emptyRepairPart } from "../types/RepairRecord";

interface RepairPartsTableProps {
  parts: RepairPart[];
  onChange: (parts: RepairPart[]) => void;
}

export default function RepairPartsTable({ parts, onChange }: RepairPartsTableProps) {
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
        const updated = { ...part, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
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
              {/* <th style={{ width: "80px" }}>หน่วย</th> */}
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
                    value={part.quantity}
                    onChange={(e) => updatePart(part.id, "quantity", Number(e.target.value))}
                  />
                </td>
                {/* <td>
                  <input
                    type="text"
                    value={part.unit}
                    onChange={(e) => updatePart(part.id, "unit", e.target.value)}
                  />
                </td> */}
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
                    })}
                  </strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

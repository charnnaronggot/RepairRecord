import type { RepairItem } from "../types/RepairRecord";
import { emptyRepairItem } from "../types/RepairRecord";

interface RepairItemsTableProps {
  items: RepairItem[];
  onChange: (items: RepairItem[]) => void;
}

export default function RepairItemsTable({ items, onChange }: RepairItemsTableProps) {
  const addRow = () => {
    onChange([
      ...items,
      { ...emptyRepairItem, id: crypto.randomUUID() },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof RepairItem, value: string | number) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  };

  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="repair-items-section">
      <div className="section-header">
        <h3>แรงงาน / การซ่อม</h3>
        <button type="button" className="btn btn-add" onClick={addRow}>
          + เพิ่มรายการ
        </button>
      </div>

      <div className="table-wrapper">
        <table className="repair-table width-full">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th>รายละเอียด</th>
              {/* <th style={{ width: "80px" }}>จำนวน</th>
              <th style={{ width: "80px" }}>หน่วย</th>
              <th style={{ width: "120px" }}>ราคา/หน่วย</th>
              <th style={{ width: "120px" }}>รวม</th> */}
              <th style={{ width: "60px" }}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  ยังไม่มีรายการ — กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มต้น
                </td>
              </tr>
            )}
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="center">{idx + 1}</td>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="รายละเอียดงานซ่อม / อะไหล่"
                  />
                </td>
                {/* <td>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                  />
                </td>
                <td className="right">
                  {item.totalPrice.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}
                </td> */}
                <td className="center">
                  <button
                    type="button"
                    className="btn btn-remove-sm"
                    onClick={() => removeRow(item.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={5} className="right"><strong>รวมทั้งหมด</strong></td>
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

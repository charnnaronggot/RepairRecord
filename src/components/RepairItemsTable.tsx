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

  const updateDescription = (id: string, description: string) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        return { ...item, description };
      })
    );
  };

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
              <th style={{ width: "60px" }}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-row">
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
                    onChange={(e) => updateDescription(item.id, e.target.value)}
                    placeholder="รายละเอียดงานซ่อม / อะไหล่"
                  />
                </td>
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
        </table>
      </div>
    </div>
  );
}

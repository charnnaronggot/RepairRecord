import type { RemarkItem } from "../types/RepairRecord";
import { emptyRemarkItem } from "../types/RepairRecord";

interface RemarkTableProps {
  items: RemarkItem[];
  onChange: (items: RemarkItem[]) => void;
}

export default function RemarkTable({ items, onChange }: RemarkTableProps) {
  const addRow = () => {
    onChange([
      ...items,
      { ...emptyRemarkItem, id: crypto.randomUUID() },
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
        <h3>Remark</h3>
        <button type="button" className="btn btn-add" onClick={addRow}>
          + เพิ่มหมายเหตุ
        </button>
      </div>

      <div className="table-wrapper">
        <table className="repair-table width-full">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th>หมายเหตุ</th>
              <th style={{ width: "60px" }}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-row">
                  ยังไม่มีหมายเหตุ - กดปุ่ม "เพิ่มหมายเหตุ" เพื่อเริ่มต้น
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
                    placeholder="หมายเหตุเพิ่มเติม"
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

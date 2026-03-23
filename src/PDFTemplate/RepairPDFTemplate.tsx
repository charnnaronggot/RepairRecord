import type { RefObject } from "react";
import type { RepairRecord } from "../types/RepairRecord";
import "./RepairPDFTempalte.css";
import hinoLogo from "../assets/images/hino_logo.jpg";

interface RepairPDFTemplateProps {
  form: RepairRecord;
  containerRef?: RefObject<HTMLDivElement | null>;
}

interface PdfRow {
  index: number;
  description: string;
  partName: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
}

const FIRST_PAGE_CAPACITY = 22;
const NEXT_PAGE_CAPACITY = 22;

const estimateRowUnits = (row: PdfRow): number => {
  const descriptionUnits = Math.ceil(Math.max(row.description.length, 1) / 32);
  const partUnits = Math.ceil(Math.max(row.partName.length, 1) / 32);
  return Math.max(1, descriptionUnits, partUnits);
};

const chunkRowsByCapacity = (rows: PdfRow[]): PdfRow[][] => {
  const pages: PdfRow[][] = [];
  let cursor = 0;
  let pageIndex = 0;

  while (cursor < rows.length) {
    const capacity = pageIndex === 0 ? FIRST_PAGE_CAPACITY : NEXT_PAGE_CAPACITY;
    let used = 0;
    const pageRows: PdfRow[] = [];

    while (cursor < rows.length) {
      const nextRow = rows[cursor];
      const nextUnits = estimateRowUnits(nextRow);

      if (pageRows.length > 0 && used + nextUnits > capacity) {
        break;
      }

      pageRows.push(nextRow);
      used += nextUnits;
      cursor += 1;
    }

    pages.push(pageRows);
    pageIndex += 1;
  }

  return pages;
};

export default function RepairPDFTemplate({ form, containerRef }: RepairPDFTemplateProps) {
  const totalRows = Math.max(20, form.repairItems.length, form.repairParts.length);
  const grandTotal = form.repairParts.reduce(
    (sum, part) => sum + Number(part.totalPrice || 0),
    0
  );

  const rows: PdfRow[] = Array.from({ length: totalRows }, (_, i) => {
    const item = form.repairItems?.[i];
    const part = form.repairParts?.[i];
    return {
      index: i + 1,
      description: item?.description ?? "",
      partName: part?.partName ?? "",
      quantity: part?.quantity != null ? String(part.quantity) : "",
      unitPrice: part?.unitPrice != null ? part.unitPrice.toLocaleString("th-TH") : "",
      totalPrice: part?.totalPrice != null ? part.totalPrice.toLocaleString("th-TH") : "",
    };
  });

  const pages = chunkRowsByCapacity(rows);

  return (
    <div ref={containerRef} id="repair-pdf-template" className="repair-pdf-a4">
      {pages.map((pageRows, pageIndex) => (
        <div
          key={`page-${pageIndex}`}
          className={`pdf-page ${pageIndex > 0 ? "pdf-page--continued" : ""}`}
        >
          <div className="pdf-header">
            <div className="pdf-logo pdf-logo-left">
              <img src={hinoLogo} alt="Hino logo" className="pdf-logo-image" />
              <p>PRATANPORN SERVICE</p>
            </div>

            <div className="pdf-company">
              <p className="pdf-company-name">บริษัท ประธานพรเซอร์วิซ จำกัด</p>
              <p>124/69 หมู่ 4 ถ.เลียบคลอง 10 ต.บึงสนั่น อ.ธัญบุรี จ.ปทุมธานี 12110</p>
              <h1>ใบแจ้งซ่อม</h1>
            </div>

            <div className="pdf-logo pdf-logo-right" aria-hidden="true" />
          </div>

          <div className="pdf-top-section">
            <div className="pdf-info-box">
              <div className="pdf-row">
                <div className="pdf-pair wide">
                  <span className="label">ชื่อ บริษัท/ลูกค้า</span>
                  <span className="value">{form.client || "-"}</span>
                </div>
                <div className="pdf-pair wide">
                  <span className="label">เบอร์โทร</span>
                  <span className="value">{form.phone || "-"}</span>
                </div>
              </div>

              <div className="pdf-row  pdf-row-sep">
                <div className="pdf-pair full">
                  <span className="label">พขร.</span>
                  <span className="value">{form.driver || "-"}</span>
                </div>
              </div>

              <div className="pdf-row">
                <div className="pdf-pair vehicle-brand-pair">
                  <span className="label">ยี่ห้อรถ</span>
                  <span className="value">{form.brand || "-"}</span>
                </div>
                <div className="pdf-pair vehicle-model-pair">  
                  <span className="label">รุ่นรถ</span>
                  <span className="value">{form.vehicleModel || "-"}</span>
                </div>
                <div className="pdf-pair vehicle-number-pair">
                  <span className="label">เบอร์รถ</span>
                  <span className="value">{form.vehicleNumber || "-"}</span>
                </div>
                <div className="pdf-pair vehicle-plate-pair">
                  <span className="label">ทะเบียนรถ</span>
                  <span className="value">{form.licensePlate || "-"}</span>
                </div>
              </div>

              <div className="pdf-row vin-engine-row pdf-row-sep">
                <div className="pdf-pair vin-pair vin-extend">
                  <span className="label">เลขตัวถัง</span>
                  <span className="value">{form.vehicleIdentificationNumber || "-"}</span>
                </div>
                <div className="pdf-pair engine-extend">
                  <span className="label">เลขเครื่อง</span>
                  <span className="value">{form.serialNumber || "-"}</span>
                </div>
                <div className="pdf-pair mile-extend">
                  <span className="label">เลขไมล์</span>
                  <span className="value">{form.mileNumber || "-"}</span>
                </div>

              </div>
                            <div className="pdf-job-row ">
            <div className="pdf-pair">
              <span className="label">เลข Job</span>
              <span className="value">{form.jobNumber || "-"}</span>
            </div>
            <div className="pdf-pair">
              <span className="label">วันที่ใบแจ้งซ่อม</span>
              <span className="value">{form.repairReportDate || "-"}</span>
            </div>
          </div>
            </div>

            <div className="pdf-photo-box">
              {form.photo ? (
                <img src={form.photo} alt="รูปหน้างาน" className="pdf-photo" />
              ) : (
                <div className="pdf-photo-empty">รูปภาพ</div>
              )}
            </div>
          </div>

          <table className="pdf-main-table">
            <thead>
              <tr>
                <th className="col-no">ลำดับ</th>
                <th className="col-repair">รายการซ่อม</th>
                <th className="col-parts">รายการอะไหล่</th>
                <th className="col-qty">จำนวน</th>
                <th className="col-unit-price">ราคา/หน่วย</th>
                <th className="col-total">ราคา</th>
                <th className="col-remark">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={`row-${row.index}`}>
                  <td className="col-no">{row.index}</td>
                  <td className="col-repair">{row.description}</td>
                  <td className="col-parts">{row.partName}</td>
                  <td className="col-qty">{row.quantity}</td>
                  <td className="col-unit-price">{row.unitPrice}</td>
                  <td className="col-total">{row.totalPrice}</td>
                  <td className="col-remark"></td>
                </tr>
              ))}
            </tbody>
            {pageIndex === pages.length - 1 && (
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: "right", fontWeight: 700 }}>
                    รวมราคา
                  </td>
                  <td colSpan={2} style={{ textAlign: "right", fontWeight: 700 }}>
                    {grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          <p className="pdf-signature">ลายเซ็น ............................</p>
        </div>
      ))}
    </div>
  );
}
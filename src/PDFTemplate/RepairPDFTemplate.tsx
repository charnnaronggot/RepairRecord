import type { RefObject } from "react";
import type { RepairRecord } from "../types/RepairRecord";
import "./RepairPDFTempalte.css";

interface RepairPDFTemplateProps {
  form: RepairRecord;
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function RepairPDFTemplate({ form, containerRef }: RepairPDFTemplateProps) {
  return (
    <div ref={containerRef} id="repair-pdf-template" className="repair-pdf-template">
      <div className="header">
        <div className="left">
          logo-left.png
        </div>
        <div className="center">
          <p>บริษัท ประธานพรเซอร์วิซ จำกัด</p>
          <p>41 หมู่ 7 ตำบล มะขามหลวง อ.สันป่าตอง จ.เชียงใหม่</p>
          <p>เบอโทรติดต่อ 061-8514442 055-5555555 แฟกซ์ 02-9089477</p>
          <h1>ใบแจ้งซ่อม</h1>
        </div>
        <div className="right">
          logo-right.png
        </div>
      </div>

      <div className="info-grid">
        <div className="label">ชื่อบริษัท/ลูกค้า</div>
        <div className="value">{form.client || ""}</div>

        <div className="label">ยี่ห้อรถ</div>
        <div className="value">{form.brand || ""}</div>

        <div className="label">ทะเบียน</div>
        <div className="value">{form.licensePlate || ""}</div>

        <div className="label">เลขไมล์</div>
        <div className="value">{form.mileNumber || ""}</div>

        <div className="label">เบอร์โทร</div>
        <div className="value">{form.phone || ""}</div>

        <div className="label">รุ่นรถ</div>
        <div className="value">{form.vehicleModel || ""}</div>

        <div className="label">เลขตัวถัง</div>
        <div className="value">{form.vehicleIdentificationNumber || ""}</div>

        <div className="label">เลข job</div>
        <div className="value">{form.jobNumber || ""}</div>

        <div className="label">พขร.</div>
        <div className="value">{form.driver || ""}</div>

        <div className="label">เบอร์รถ</div>
        <div className="value">{form.vehicleNumber || ""}</div>

        <div className="label">เลขเครื่อง</div>
        <div className="value">{form.serialNumber || ""}</div>

        <div className="label empty"></div>
        <div className="value empty"></div>

        <div className="label">วันที่นัดซ่อม</div>
        <div className="value wide">{form.repairReportDate || ""}</div>
      </div>

      <div className="repair-table-wrap">
        <table className="repair-table">
          <thead>
            <tr>
              <th className="col-no">ลำดับ</th>
              <th className="col-item">รายการซ่อม</th>
              <th className="col-part">รายการอะไหล่</th>
              <th className="col-amount">จำนวน</th>
              <th className="col-unit-price">ราคาต่อหน่วย</th>
              <th className="col-price">ราคา</th>
              <th className="col-remark">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 20 }, (_, i) => (
              <tr key={i}>
                <td className="col-no">{i + 1}</td>
                <td className="col-item"></td>
                <td className="col-part"></td>
                <td className="col-amount"></td>
                <td className="col-unit-price"></td>
                <td className="col-price"></td>
                <td className="col-remark"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p className="sign">ลายเซ็น..................</p>
      </div>
    </div>
  );
}
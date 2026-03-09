import type { RefObject } from "react";
import type { RepairRecord } from "../types/RepairRecord";

interface RepairPDFTemplateProps {
  form: RepairRecord;
  containerRef: RefObject<HTMLDivElement | null>;
}

export default function RepairPDFTemplate({ form, containerRef }: RepairPDFTemplateProps) {
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      
    },
    header: {
      display: 'grid',
      height: '120px',
      gridTemplateColumns: '20% 60% 20%',
      alignItems: 'center',
      gap: '12px',
    },
    headerLeft: {
    // เพิ่มถ้ามี styling พิเศษ ถ้าไม่มีก็เว้นว่างไว้
    },
    headerRight: {
      // เพิ่มถ้ามี styling พิเศษ ถ้าไม่มีก็เว้นว่างไว้
    },
    headerImg: {
      maxWidth: '100%',
      height: 'auto',
      display: 'block',
    },
    headerCenter: {
      textAlign: 'center' as const,
      lineHeight: '1.3',
    },
    headerCenterH1: {
      margin: '6px 0 0',
      fontSize: '22px',
    },
    headerCenterP: {  
      margin: '2px 0',
      fontSize: '14px',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '120px 1fr 100px 1fr 100px 1fr 100px 1fr',
      border: '1px solid #000',
      fontSize: '14px',
      marginTop: '16px',  // เพิ่ม gap จาก header
    },
    infoCell: {
      borderRight: '1px solid #000',
      borderBottom: '1px solid #000',
      padding: '6px 8px',
      minHeight: '24px',
      display: 'flex',
      alignItems: 'center',
    },
    label: {
      fontWeight: 600,
      background: '#f6f6f6',
    },
    value: {
      background: '#fff',
    },
    wide: {
      gridColumn: 'span 7',
    },
    empty: {
      border: 'none',
      background: 'none', 
    },
    repairTableWrap: {
      maxWidth: '220mm',
      margin: 'auto',
    },
    repairTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '13px',
      tableLayout: 'fixed' as const,
      border: '1px solid #000',
    },
    th: {
      border: '1px solid #000',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: '2px solid #000',
      background: '#f2f2f2',
      padding: '6px 6px',
      fontWeight: 700,
      textAlign: 'center' as const,
      wordBreak: 'break-word' as const,
      whiteSpace: 'normal' as const,
    },
    td: {
      border: '1px solid #000',
      padding: '6px 6px',
      verticalAlign: 'top' as const,
      wordBreak: 'break-word' as const,
      whiteSpace: 'normal' as const,
      overflow: 'hidden' as const,
    },
    
    colNo: {
      width: '15mm',
      textAlign: 'center' as const,
    },
    colAmount: {
      width: '15mm',
    },
    colUnitPrice: {
      width: '20mm',
    },
    colPart: {
      width: '80mm',
    },
    colPrice: {
      width: '20mm',
      // textAlign: 'right' as const,
    },
    colRemark: {
      width: '20mm',
    },
    sign: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
    },
  };

  return (
    <div ref={containerRef} id="repair-pdf-template" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          logo-left.png
        </div>
        <div style={styles.headerCenter}>
          <p style={styles.headerCenterP}>บริษัท ประธานพรเซอร์วิซ จำกัด</p>
          <p style={styles.headerCenterP}>41 หมู่ 7 ตำบล มะขามหลวง อ.สันป่าตอง จ.เชียงใหม่</p>
          <p style={styles.headerCenterP}>เบอโทรติดต่อ 061-8514442 055-5555555 แฟกซ์ 02-9089477</p>
          <h1 style={styles.headerCenterH1}>ใบแจ้งซ่อม</h1>
        </div>
        <div style={styles.headerRight}>
          logo-right.png
        </div>
      </div>

      <div style={styles.infoGrid}>
        <div style={{...styles.infoCell, ...styles.label}}>ชื่อบริษัท/ลูกค้า</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.client || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>ยี่ห้อรถ</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.brand || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>ทะเบียน</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.licensePlate || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>เลขไมล์</div>
        <div style={{...styles.infoCell, ...styles.value, borderRight: 'none'}}>{form.mileNumber || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>เบอร์โทร</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.phone || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>รุ่นรถ</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.vehicleModel || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>เลขตัวถัง</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.vehicleIdentificationNumber || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>เลข job</div>
        <div style={{...styles.infoCell, ...styles.value, borderRight: 'none'}}>{form.jobNumber || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>พขร.</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.driver || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>เบอร์รถ</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.vehicleNumber || ""}</div>

        <div style={{...styles.infoCell, ...styles.label}}>เลขเครื่อง</div>
        <div style={{...styles.infoCell, ...styles.value}}>{form.serialNumber || ""}</div>
      
        <div style={{...styles.infoCell, ...styles.empty}}></div>
        <div style={{...styles.infoCell, ...styles.value, borderRight: 'none'}}></div>

        <div style={{...styles.infoCell, ...styles.label}}>วันที่นัดซ่อม</div>
        <div style={{...styles.infoCell, ...styles.value, ...styles.wide, borderRight: 'none'}}>{form.repairReportDate || ""}</div>
      </div>

      <div style={styles.repairTableWrap}>
        <table style={styles.repairTable}>
          <thead>
            <tr>
              <th style={{...styles.th, ...styles.colNo}}>ลำดับ</th>
              <th style={styles.th}>รายการซ่อม</th>
              <th style={{...styles.th, ...styles.colPart}}>รายการอะไหล่</th>
              <th style={{...styles.th, ...styles.colAmount}}>จำนวน</th>
              <th style={{...styles.th, ...styles.colUnitPrice}}>ราคาต่อหน่วย</th>
              <th style={{...styles.th, ...styles.colPrice}}>ราคา</th>
              <th style={{...styles.th, ...styles.colRemark, borderRight: 'none'}}>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 20 }, (_, i) => {
              const item = form.repairItems?.[i];
              const part = form.repairParts?.[i];

              // ถ้าไม่มีฝั่งอะไหล่ ให้ fallback จากฝั่งงานซ่อม
              const quantity = part?.quantity;
              const unitPrice = part?.unitPrice ;
              const totalPrice = part?.totalPrice ;
              // const remark = part?.unit ?? item?.unit ?? "";

              return (
                <tr key={i}>
                  <td style={{ ...styles.td, ...styles.colNo }}>{i + 1}</td>
                  <td style={styles.td}>{item?.description ?? ""}</td>
                  <td style={{ ...styles.td, ...styles.colPart }}>{part?.partName ?? ""}</td>
                  <td style={{ ...styles.td, ...styles.colAmount }}>
                    {quantity != null ? quantity : ""}
                  </td>
                  <td style={{ ...styles.td, ...styles.colUnitPrice }}>
                    {unitPrice != null ? unitPrice.toLocaleString("th-TH") : ""}
                  </td>
                  <td style={{ ...styles.td, ...styles.colPrice }}>
                    {totalPrice != null ? totalPrice.toLocaleString("th-TH") : ""}
                  </td>
                  <td style={{ ...styles.td, ...styles.colRemark }}></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <p style={styles.sign}>ลายเซ็น..................</p>
      </div>
    </div>
  );
}
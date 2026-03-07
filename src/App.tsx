import { useState } from "react";
import RepairForm from "./components/RepairForm";
import RecordsList from "./components/RecordsList";
import type { RepairRecord } from "./types/RepairRecord";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState<"form" | "list">("form");
  const [selectedRecord, setSelectedRecord] = useState<RepairRecord | undefined>();

  const handleEdit = (record: RepairRecord) => {
    setSelectedRecord(record);
    setCurrentPage("form");
  };

  const handleFormSave = () => {
    setSelectedRecord(undefined);
    setCurrentPage("list");
  };

  const handleFormCancel = () => {
    setSelectedRecord(undefined);
    setCurrentPage("list");
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="top-nav">
        <div className="nav-container">
          <h2>🔧 ระบบบันทึกการซ่อม</h2>
          <div className="nav-buttons">
            <button
              className={`nav-btn ${currentPage === "form" ? "active" : ""}`}
              onClick={() => {
                setCurrentPage("form");
                setSelectedRecord(undefined);
              }}
            >
              ➕ เพิ่มใหม่
            </button>
            <button
              className={`nav-btn ${currentPage === "list" ? "active" : ""}`}
              onClick={() => setCurrentPage("list")}
            >
              📋 ดูรายการ
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="main-content">
        {currentPage === "form" ? (
          <RepairForm
            initialRecord={selectedRecord}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        ) : (
          <RecordsList onEdit={handleEdit} />
        )}
      </main>
    </div>
  );
}

export default App;

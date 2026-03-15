import { useEffect, useState, type FormEvent } from "react";
import RepairForm from "./components/RepairForm";
import RecordsList from "./components/RecordsList";
import type { RepairRecord } from "./types/RepairRecord";
import {
  loginWithEmailPassword,
  logoutUser,
  observeAuthState,
} from "./services/authService";
import "./App.css";

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState<"form" | "list">("form");
  const [selectedRecord, setSelectedRecord] = useState<RepairRecord | undefined>();

  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      setIsAuthenticated(Boolean(user));
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

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

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    try {
      await loginWithEmailPassword(email.trim(), password);
      setPassword("");
    } catch {
      setAuthError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentPage("form");
    setSelectedRecord(undefined);
  };

  if (authLoading) {
    return (
      <main className="main-content auth-page">
        <div className="auth-card">
          <h1>กำลังตรวจสอบสิทธิ์...</h1>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="main-content auth-page">
        <form className="auth-card" onSubmit={handleLogin}>
          <h1>เข้าสู่ระบบ</h1>
          <p className="auth-subtitle">กรุณาเข้าสู่ระบบเพื่อใช้งานระบบบันทึกการซ่อม</p>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              อีเมล
            </label>
            <input
              id="auth-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              รหัสผ่าน
            </label>
            <input
              id="auth-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {authError ? <p className="auth-error">{authError}</p> : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={authSubmitting}>
            {authSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </main>
    );
  }

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
            <button className="nav-btn" onClick={handleLogout}>
              🚪 ออกจากระบบ
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

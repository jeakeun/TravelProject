import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api/axios";
import { isAdmin } from "../utils/user";
import "./AdminPage.css";

function AdminPage() {
  const { user } = useOutletContext() || {};
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inquiry");
  const [inquiries, setInquiries] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
      return;
    }
    if (!isAdmin(user)) {
      alert("관리자만 접근할 수 있습니다.");
      navigate("/", { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !isAdmin(user)) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const [inqRes, repRes] = await Promise.all([
          api.get("/api/admin/inquiries"),
          api.get("/api/admin/reports"),
        ]);
        setInquiries(Array.isArray(inqRes.data) ? inqRes.data : []);
        setReports(Array.isArray(repRes.data) ? repRes.data : []);
      } catch (err) {
        console.error("관리자 데이터 로딩 실패:", err);
        if (err?.response?.status === 403) {
          alert("관리자 권한이 필요합니다.");
          navigate("/", { replace: true });
        }
        setInquiries([]);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, navigate]);

  const formatDate = (dt) => {
    if (!dt) return "-";
    const d = new Date(dt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const handleInquiryStatus = async (ibNum, status) => {
    try {
      await api.put(`/api/admin/inquiries/${ibNum}/status`, { status });
      setInquiries((prev) =>
        prev.map((r) => (r.ibNum === ibNum ? { ...r, ibStatus: status } : r))
      );
    } catch (err) {
      alert("처리 실패");
    }
  };

  const handleReportStatus = async (rbNum, status) => {
    try {
      await api.put(`/api/admin/reports/${rbNum}/status`, { status });
      setReports((prev) =>
        prev.map((r) => (r.rbNum === rbNum ? { ...r, rbManage: status } : r))
      );
    } catch (err) {
      alert("처리 실패");
    }
  };

  if (!user || !isAdmin(user)) return null;
  if (loading)
    return (
      <div className="admin-page">
        <div className="admin-loading">데이터 로딩 중...</div>
      </div>
    );

  return (
    <div className="admin-page">
      <h1 className="admin-title">| 관리자 페이지</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "inquiry" ? "active" : ""}`}
          onClick={() => setActiveTab("inquiry")}
        >
          1:1 문의함
        </button>
        <button
          className={`admin-tab ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          신고함
        </button>
      </div>

      {activeTab === "inquiry" && (
        <div className="admin-section">
          <h2 className="admin-section-title">1:1 문의 목록</h2>
          {inquiries.length === 0 ? (
            <p className="admin-empty">등록된 문의가 없습니다.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>내용</th>
                  <th>작성자번호</th>
                  <th>작성일</th>
                  <th>상태</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((q) => (
                  <tr key={q.ibNum}>
                    <td>{q.ibNum}</td>
                    <td className="admin-td-title">{q.ibTitle}</td>
                    <td className="admin-td-content">{q.ibContent}</td>
                    <td>{q.ibMbNum}</td>
                    <td>{formatDate(q.ibDate)}</td>
                    <td>{q.ibStatus === "Y" ? "처리완료" : "대기중"}</td>
                    <td>
                      {q.ibStatus !== "Y" && (
                        <button
                          className="admin-btn-process"
                          onClick={() => handleInquiryStatus(q.ibNum, "Y")}
                        >
                          처리완료
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "report" && (
        <div className="admin-section">
          <h2 className="admin-section-title">신고 목록</h2>
          {reports.length === 0 ? (
            <p className="admin-empty">등록된 신고가 없습니다.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>신고 내용</th>
                  <th>대상ID</th>
                  <th>대상유형</th>
                  <th>신고자번호</th>
                  <th>상태</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.rbNum}>
                    <td>{r.rbNum}</td>
                    <td className="admin-td-content">{r.rbContent}</td>
                    <td>{r.rbId}</td>
                    <td>{r.rbName}</td>
                    <td>{r.rbMbNum}</td>
                    <td>{r.rbManage === "Y" ? "처리완료" : "대기중"}</td>
                    <td>
                      {r.rbManage !== "Y" && (
                        <button
                          className="admin-btn-process"
                          onClick={() => handleReportStatus(r.rbNum, "Y")}
                        >
                          처리완료
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;

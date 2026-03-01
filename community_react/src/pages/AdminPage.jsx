import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api/axios";
import { isAdmin } from "../utils/user";
import "./AdminPage.css";

function AdminPage() {
  const { user, refreshAdminCounts } = useOutletContext() || {};
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inquiry");
  const [inquiries, setInquiries] = useState([]);
  const [reports, setReports] = useState([]);
  const [newCounts, setNewCounts] = useState({ newInquiries: 0, newReports: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [inquiryReply, setInquiryReply] = useState("");
  const [reportReply, setReportReply] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  const fetchNewCounts = useCallback(() => {
    api.get("/api/admin/notification-counts")
      .then((res) => {
        const d = res.data || {};
        setNewCounts({
          newInquiries: Number(d.newInquiries) || 0,
          newReports: Number(d.newReports) || 0,
        });
      })
      .catch(() => setNewCounts({ newInquiries: 0, newReports: 0 }));
  }, []);

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
        const [inqRes, repRes, countsRes] = await Promise.all([
          api.get("/api/admin/inquiries"),
          api.get("/api/admin/reports"),
          api.get("/api/admin/notification-counts").catch(() => ({ data: { newInquiries: 0, newReports: 0 } })),
        ]);
        setInquiries(Array.isArray(inqRes.data) ? inqRes.data : []);
        setReports(Array.isArray(repRes.data) ? repRes.data : []);
        const d = countsRes?.data || {};
        setNewCounts({
          newInquiries: Number(d.newInquiries) || 0,
          newReports: Number(d.newReports) || 0,
        });
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

  const openInquiry = (q) => {
    setExpandedInquiry(q?.ibNum === expandedInquiry ? null : q?.ibNum);
    setInquiryReply(q?.ibReply ?? "");
    setEditingInquiry(null);
    setExpandedReport(null);
  };

  const saveInquiryReply = async () => {
    if (!expandedInquiry) return;
    setSavingReply(true);
    try {
      await api.put(`/api/admin/inquiries/${expandedInquiry}/reply`, {
        reply: inquiryReply,
      });
      setInquiries((prev) =>
        prev.map((q) =>
          q.ibNum === expandedInquiry
            ? { ...q, ibReply: inquiryReply, ibStatus: "Y" }
            : q
        )
      );
      alert("답변이 저장되었습니다.");
      setExpandedInquiry(null);
      setEditingInquiry(null);
      fetchNewCounts();
      refreshAdminCounts?.();
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : (data?.error ?? data?.message ?? "저장 실패");
      alert(msg);
    } finally {
      setSavingReply(false);
    }
  };

  const openReport = (r) => {
    setExpandedReport(r?.rbNum === expandedReport ? null : r?.rbNum);
    setReportReply(r?.rbReply ?? "");
    setEditingReport(null);
    setExpandedInquiry(null);
  };

  const saveReportReply = async () => {
    if (!expandedReport) return;
    setSavingReply(true);
    try {
      await api.put(`/api/admin/reports/${expandedReport}/reply`, {
        reply: reportReply,
      });
      setReports((prev) =>
        prev.map((r) =>
          r.rbNum === expandedReport
            ? { ...r, rbReply: reportReply, rbManage: reportReply?.trim() ? "Y" : r.rbManage }
            : r
        )
      );
      alert("답변이 저장되었습니다.");
      setExpandedReport(null);
      setEditingReport(null);
      fetchNewCounts();
      refreshAdminCounts?.();
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : (data?.error ?? data?.message ?? "저장 실패");
      alert(msg);
    } finally {
      setSavingReply(false);
    }
  };

  const handleReportProcess = async (rbNum, action) => {
    try {
      const res = await api.put(`/api/admin/reports/${rbNum}/process`, { action });
      setReports((prev) =>
        prev.map((r) => (r.rbNum === rbNum ? { ...r, rbManage: action } : r))
      );
      alert(res?.data?.msg ?? "처리되었습니다.");
      setExpandedReport(null);
      fetchNewCounts();
      refreshAdminCounts?.();
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : (data?.error ?? data?.message ?? "처리 실패");
      alert(msg);
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
          <span className="admin-tab-label">1:1 문의함</span>
          <span className={`admin-tab-badge ${newCounts.newInquiries > 0 ? "has-count" : ""}`}>{newCounts.newInquiries}</span>
        </button>
        <button
          className={`admin-tab ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          <span className="admin-tab-label">신고함</span>
          <span className={`admin-tab-badge ${newCounts.newReports > 0 ? "has-count" : ""}`}>{newCounts.newReports}</span>
        </button>
      </div>

      {/* 1:1 문의 - 쪽지 형태 (확대) */}
      {activeTab === "inquiry" && (
        <div className="admin-section admin-section-inquiry">
          <h2 className="admin-section-title">1:1 문의함</h2>
          {inquiries.length === 0 ? (
            <p className="admin-empty">등록된 문의가 없습니다.</p>
          ) : (
            <div className="admin-message-list">
              {inquiries.map((q) => (
                <div
                  key={q.ibNum}
                  className={`admin-message-card ${expandedInquiry === q.ibNum ? "expanded" : ""}`}
                  onClick={() => !expandedInquiry || expandedInquiry === q.ibNum ? openInquiry(q) : null}
                >
                  <div className="admin-message-header">
                    <span className="admin-message-from">작성자 #{q.ibMbNum}</span>
                    <span className="admin-message-date">{formatDate(q.ibDate)}</span>
                    <span className={`admin-message-badge ${q.ibStatus === "Y" ? "done" : ""}`}>
                      {q.ibStatus === "Y" ? "답변완료" : "대기"}
                    </span>
                  </div>
                  <div className="admin-message-subject">{q.ibTitle}</div>
                  <div className="admin-message-preview">
                    {(q.ibContent || "").slice(0, 80)}
                    {(q.ibContent || "").length > 80 ? "..." : ""}
                  </div>

                  {expandedInquiry === q.ibNum && (
                    <div className="admin-message-detail" onClick={(e) => e.stopPropagation()}>
                      <div className="admin-message-full">{q.ibContent}</div>
                      {q.ibReply && editingInquiry !== q.ibNum ? (
                        <div className="admin-reply-view">
                          <div className="admin-reply-block">
                            <strong>관리자 답변:</strong>
                            <p>{q.ibReply}</p>
                          </div>
                          <div className="admin-reply-actions admin-reply-actions-right">
                            <button
                              type="button"
                              className="admin-btn-reply"
                              onClick={() => { setEditingInquiry(q.ibNum); setInquiryReply(q.ibReply ?? ""); }}
                            >
                              수정
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="admin-reply-form">
                          <label>{q.ibReply ? "답변 수정" : "답변 작성"}</label>
                          <textarea
                            value={inquiryReply}
                            onChange={(e) => setInquiryReply(e.target.value)}
                            placeholder="답변을 입력하세요"
                            rows={6}
                          />
                          <div className="admin-reply-actions">
                            <button
                              type="button"
                              className="admin-btn-reply"
                              onClick={saveInquiryReply}
                              disabled={savingReply}
                            >
                              {savingReply ? "저장 중..." : (q.ibReply ? "수정" : "답변 저장")}
                            </button>
                            {q.ibReply && (
                              <button
                                type="button"
                                className="admin-btn-hold"
                                onClick={() => setEditingInquiry(null)}
                              >
                                취소
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 신고함 - 글 형태 */}
      {activeTab === "report" && (
        <div className="admin-section">
          <h2 className="admin-section-title">신고함</h2>
          {reports.length === 0 ? (
            <p className="admin-empty">등록된 신고가 없습니다.</p>
          ) : (
            <div className="admin-post-list">
              {reports.map((r) => (
                <article
                  key={r.rbNum}
                  className={`admin-post-card ${expandedReport === r.rbNum ? "expanded" : ""}`}
                  onClick={() => !expandedReport || expandedReport === r.rbNum ? openReport(r) : null}
                >
                  <div className="admin-post-meta">
                    <span>신고 대상: {r.rbName} #{r.rbId}</span>
                    <span>신고자 #{r.rbMbNum}</span>
                    <span className={`admin-post-badge ${r.rbManage === "Y" ? "done" : r.rbManage === "D" ? "deleted" : r.rbManage === "H" ? "hold" : ""}`}>
                      {r.rbManage === "Y" ? "처리완료" : r.rbManage === "D" ? "삭제됨" : r.rbManage === "H" ? "보류" : "대기"}
                    </span>
                  </div>
                  <div className="admin-post-title">신고 사유</div>
                  <div className="admin-post-content">
                    {(r.rbContent || "").slice(0, 120)}
                    {(r.rbContent || "").length > 120 ? "..." : ""}
                  </div>

                  {expandedReport === r.rbNum && (
                    <div className="admin-post-detail" onClick={(e) => e.stopPropagation()}>
                      <div className="admin-post-full">{r.rbContent}</div>
                      {r.rbReply && editingReport !== r.rbNum ? (
                        <div className="admin-reply-view">
                          <div className="admin-reply-block">
                            <strong>관리자 답변:</strong>
                            <p>{r.rbReply}</p>
                          </div>
                          <div className="admin-reply-actions admin-reply-actions-right">
                            <button
                              type="button"
                              className="admin-btn-reply"
                              onClick={() => { setEditingReport(r.rbNum); setReportReply(r.rbReply ?? ""); }}
                            >
                              수정
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="admin-reply-form">
                          <label>{r.rbReply ? "답변 수정 (댓글 아님)" : "답변 작성 (댓글 아님)"}</label>
                          <textarea
                            value={reportReply}
                            onChange={(e) => setReportReply(e.target.value)}
                            placeholder="관리자 답변을 입력하세요"
                            rows={6}
                          />
                          <div className="admin-reply-actions">
                            <button
                              type="button"
                              className="admin-btn-reply"
                              onClick={saveReportReply}
                              disabled={savingReply}
                            >
                              {savingReply ? "저장 중..." : (r.rbReply ? "수정" : "답변 저장")}
                            </button>
                            {r.rbReply && (
                              <button
                                type="button"
                                className="admin-btn-hold"
                                onClick={() => setEditingReport(null)}
                              >
                                취소
                              </button>
                            )}
                            {r.rbManage !== "D" && (
                              <>
                                <button
                                  type="button"
                                  className="admin-btn-delete"
                                  onClick={() => handleReportProcess(r.rbNum, "D")}
                                >
                                  삭제
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn-hold"
                                  onClick={() => handleReportProcess(r.rbNum, "H")}
                                >
                                  보류
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn-process"
                                  onClick={() => handleReportProcess(r.rbNum, "Y")}
                                >
                                  처리완료
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api/axios";
import { isAdmin, isSubAdmin, isAdminOrSubAdmin } from "../utils/user";
import "./AdminPage.css";

function AdminPage() {
  const { user, refreshAdminCounts } = useOutletContext() || {};
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inquiry");
  const [inquiries, setInquiries] = useState([]);
  const [reports, setReports] = useState([]);
  const [members, setMembers] = useState([]);
  const [newCounts, setNewCounts] = useState({ newInquiries: 0, newReports: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [inquiryReply, setInquiryReply] = useState("");
  const [reportReply, setReportReply] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [inquiryPage, setInquiryPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [memberPage, setMemberPage] = useState(1);
  const [updatingMember, setUpdatingMember] = useState(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState("ALL");

  const INQUIRIES_PER_PAGE = 3;
  const REPORTS_PER_PAGE = 3;
  const MEMBERS_PER_PAGE = 3;

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
    if (!isAdminOrSubAdmin(user)) {
      alert("관리자만 접근할 수 있습니다.");
      navigate("/", { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !isAdminOrSubAdmin(user)) return;
    const fetch = async () => {
      setLoading(true);
      try {
        if (isSubAdmin(user)) {
          // SUB_ADMIN: 문의/신고/알림만, 회원 목록은 호출하지 않음
          const [inqRes, repRes, countsRes] = await Promise.allSettled([
            api.get("/api/admin/inquiries"),
            api.get("/api/admin/reports"),
            api.get("/api/admin/notification-counts"),
          ]);

          if (inqRes.status === "fulfilled") {
            setInquiries(Array.isArray(inqRes.value.data) ? inqRes.value.data : []);
          } else {
            setInquiries([]);
          }

          if (repRes.status === "fulfilled") {
            setReports(Array.isArray(repRes.value.data) ? repRes.value.data : []);
          } else {
            setReports([]);
          }

          const countsData =
            countsRes.status === "fulfilled" ? countsRes.value.data || {} : { newInquiries: 0, newReports: 0 };
          setNewCounts({
            newInquiries: Number(countsData.newInquiries) || 0,
            newReports: Number(countsData.newReports) || 0,
          });

          setMembers([]);
        } else {
          // ADMIN: 문의/신고/회원/알림 모두 조회
          const [inqRes, repRes, memRes, countsRes] = await Promise.allSettled([
            api.get("/api/admin/inquiries"),
            api.get("/api/admin/reports"),
            api.get("/api/admin/members"),
            api.get("/api/admin/notification-counts"),
          ]);

          if (inqRes.status === "fulfilled") {
            setInquiries(Array.isArray(inqRes.value.data) ? inqRes.value.data : []);
          } else {
            setInquiries([]);
          }

          if (repRes.status === "fulfilled") {
            setReports(Array.isArray(repRes.value.data) ? repRes.value.data : []);
          } else {
            setReports([]);
          }

          if (memRes.status === "fulfilled") {
            const data = memRes.value.data;
            setMembers(Array.isArray(data) ? data : []);
          } else {
            console.error("회원 목록 로딩 실패:", memRes.reason);
            setMembers([]);
          }

          const countsData =
            countsRes.status === "fulfilled" ? countsRes.value.data || {} : { newInquiries: 0, newReports: 0 };
          setNewCounts({
            newInquiries: Number(countsData.newInquiries) || 0,
            newReports: Number(countsData.newReports) || 0,
          });
        }
      } catch (err) {
        console.error("관리자 데이터 로딩 실패:", err);
        if (err?.response?.status === 403) {
          alert("관리자 권한이 필요합니다.");
          navigate("/", { replace: true });
        }
        setInquiries([]);
        setReports([]);
        setMembers([]);
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

  const mapStatusLabel = (status) => {
    switch (status) {
      case "BANNED_7D":
        return "1주일 정지";
      case "BANNED_30D":
        return "한달 정지";
      case "BANNED_6M":
        return "6개월 정지";
      case "BANNED_PERM":
        return "영구정지";
      default:
        return "정상";
    }
  };

  const updateMemberRole = async (mbNum, nextRole) => {
    if (!mbNum || !nextRole) return;
    if (!window.confirm(`${mbNum}번 회원의 권한을 "${nextRole}"(으)로 변경하시겠습니까?`)) return;
    try {
      await api.put(`/api/admin/members/${mbNum}/role`, { role: nextRole });
      setMembers((prev) =>
        prev.map((m) =>
          m.mbNum === mbNum ? { ...m, mbRol: nextRole } : m
        )
      );
      alert("회원 권한이 변경되었습니다.");
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : (data?.error ?? data?.message ?? "권한 변경 실패");
      alert(msg);
    }
  };

  const updateMemberStatus = async (mbNum, statusCode, label) => {
    if (!mbNum || !statusCode) return;
    if (!window.confirm(`${mbNum}번 회원을 "${label}" 상태로 변경하시겠습니까?`)) return;
    setUpdatingMember(mbNum);
    try {
      await api.put(`/api/admin/members/${mbNum}/status`, { status: statusCode });
      setMembers((prev) =>
        prev.map((m) => {
          if (m.mbNum !== mbNum) return m;
          let nextStatus = m.mbStatus;
          switch (statusCode) {
            case "BAN_7D":
              nextStatus = "BANNED_7D";
              break;
            case "BAN_30D":
              nextStatus = "BANNED_30D";
              break;
            case "BAN_6M":
              nextStatus = "BANNED_6M";
              break;
            case "BAN_PERM":
              nextStatus = "BANNED_PERM";
              break;
            case "ACTIVE":
            default:
              nextStatus = "ACTIVE";
              break;
          }
          return { ...m, mbStatus: nextStatus };
        })
      );
      alert("회원 상태가 변경되었습니다.");
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : (data?.error ?? data?.message ?? "변경 실패");
      alert(msg);
    } finally {
      setUpdatingMember(null);
    }
  };

  if (!user || !isAdminOrSubAdmin(user)) return null;
  if (loading)
    return (
      <div className="admin-page">
        <div className="admin-loading">데이터 로딩 중...</div>
      </div>
    );

  const inquiryTotalPages = Math.ceil(inquiries.length / INQUIRIES_PER_PAGE) || 1;
  const inquiryCurrentPage = Math.min(inquiryPage, inquiryTotalPages);
  const inquiriesPaginated = inquiries.slice((inquiryCurrentPage - 1) * INQUIRIES_PER_PAGE, inquiryCurrentPage * INQUIRIES_PER_PAGE);

  const reportTotalPages = Math.ceil(reports.length / REPORTS_PER_PAGE) || 1;
  const reportCurrentPage = Math.min(reportPage, reportTotalPages);
  const reportsPaginated = reports.slice((reportCurrentPage - 1) * REPORTS_PER_PAGE, reportCurrentPage * REPORTS_PER_PAGE);

  const normalizedQuery = memberQuery.trim().toLowerCase();
  const filteredMembers = members.filter((m) => {
    const statusOk =
      memberStatusFilter === "ALL" ||
      (memberStatusFilter === "ACTIVE" &&
        (!m.mbStatus || m.mbStatus === "ACTIVE")) ||
      m.mbStatus === memberStatusFilter;

    if (!statusOk) return false;

    if (!normalizedQuery) return true;

    const id = (m.mbUid || "").toLowerCase();
    const nickname = (m.mbNickname || "").toLowerCase();
    const email = (m.mbEmail || "").toLowerCase();

    return (
      id.includes(normalizedQuery) ||
      nickname.includes(normalizedQuery) ||
      email.includes(normalizedQuery)
    );
  });

  const memberTotalPages = Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE) || 1;
  const memberCurrentPage = Math.min(memberPage, memberTotalPages);
  const membersPaginated = filteredMembers.slice(
    (memberCurrentPage - 1) * MEMBERS_PER_PAGE,
    memberCurrentPage * MEMBERS_PER_PAGE
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
        {!isSubAdmin(user) && (
          <button
            className={`admin-tab ${activeTab === "member" ? "active" : ""}`}
            onClick={() => setActiveTab("member")}
          >
            <span className="admin-tab-label">회원 관리</span>
          </button>
        )}
      </div>

      {/* 1:1 문의 - 쪽지 형태 (확대) */}
      {activeTab === "inquiry" && (
        <div className="admin-section admin-section-inquiry">
          <h2 className="admin-section-title">1:1 문의함</h2>
          {inquiries.length === 0 ? (
            <p className="admin-empty">등록된 문의가 없습니다.</p>
          ) : (
            <>
              <div className="admin-message-list">
                {inquiriesPaginated.map((q) => (
                <div
                  key={q.ibNum}
                  className={`admin-message-card ${expandedInquiry === q.ibNum ? "expanded" : ""}`}
                  onClick={() => !expandedInquiry || expandedInquiry === q.ibNum ? openInquiry(q) : null}
                >
                  <div className="admin-message-header">
                    <span className="admin-message-from">{q.ibAuthorNickname ?? `작성자 #${q.ibMbNum}`}</span>
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
              {inquiryTotalPages > 1 && (
                <div className="admin-pagination">
                  <button type="button" className="admin-pagination-btn" disabled={inquiryCurrentPage <= 1} onClick={() => setInquiryPage((p) => Math.max(1, p - 1))}>이전</button>
                  <span className="admin-pagination-info">{inquiryCurrentPage} / {inquiryTotalPages}</span>
                  <button type="button" className="admin-pagination-btn" disabled={inquiryCurrentPage >= inquiryTotalPages} onClick={() => setInquiryPage((p) => Math.min(inquiryTotalPages, p + 1))}>다음</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 신고함 - 문의함과 동일한 카드 형태 */}
      {activeTab === "report" && (
        <div className="admin-section admin-section-inquiry">
          <h2 className="admin-section-title">신고함</h2>
          {reports.length === 0 ? (
            <p className="admin-empty">등록된 신고가 없습니다.</p>
          ) : (
            <>
              <div className="admin-message-list">
                {reportsPaginated.map((r) => (
                <div
                  key={r.rbNum}
                  className={`admin-message-card ${expandedReport === r.rbNum ? "expanded" : ""}`}
                  onClick={() => !expandedReport || expandedReport === r.rbNum ? openReport(r) : null}
                >
                  <div className="admin-message-header">
                    <span className="admin-message-from">{r.rbReporterNickname ?? `신고자 #${r.rbMbNum}`}</span>
                    <span className={`admin-message-badge ${r.rbManage === "Y" ? "done" : r.rbManage === "D" ? "deleted" : r.rbManage === "H" ? "hold" : ""}`}>
                      {r.rbManage === "Y" ? "처리완료" : r.rbManage === "D" ? "삭제됨" : r.rbManage === "H" ? "보류" : "대기"}
                    </span>
                  </div>
                  <div className="admin-message-subject">신고 대상: {r.rbTargetNickname ?? `${r.rbName} #${r.rbId}`}</div>
                  <div className="admin-message-preview">
                    {(r.rbContent || "").slice(0, 80)}
                    {(r.rbContent || "").length > 80 ? "..." : ""}
                  </div>

                  {expandedReport === r.rbNum && (
                    <div className="admin-message-detail" onClick={(e) => e.stopPropagation()}>
                      <div className="admin-message-full">{r.rbContent}</div>
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
                          <label>
                            {r.rbReply
                              ? "경고/정지 메모 및 답변 수정 (기능 없음)"
                              : "경고/정지 메모 및 답변 작성 (기능 없음)"}
                          </label>
                          <textarea
                            value={reportReply}
                            onChange={(e) => setReportReply(e.target.value)}
                            placeholder="예) 경고 1회, 7일 정지 예정 / 사유: 욕설\n※ 여기 적는 내용은 메모만 저장되며 실제 정지 기능은 동작하지 않습니다."
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
                </div>
              ))}
              </div>
              {reportTotalPages > 1 && (
                <div className="admin-pagination">
                  <button type="button" className="admin-pagination-btn" disabled={reportCurrentPage <= 1} onClick={() => setReportPage((p) => Math.max(1, p - 1))}>이전</button>
                  <span className="admin-pagination-info">{reportCurrentPage} / {reportTotalPages}</span>
                  <button type="button" className="admin-pagination-btn" disabled={reportCurrentPage >= reportTotalPages} onClick={() => setReportPage((p) => Math.min(reportTotalPages, p + 1))}>다음</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 회원 관리 (SUB_ADMIN 에게는 숨김) */}
      {!isSubAdmin(user) && activeTab === "member" && (
        <div className="admin-section admin-section-inquiry">
          <div className="admin-member-header">
            <h2 className="admin-section-title">회원 관리</h2>
            <div className="admin-member-filters">
              <input
                type="text"
                className="admin-member-search"
                placeholder="아이디 / 닉네임 / 이메일 검색"
                value={memberQuery}
                onChange={(e) => {
                  setMemberPage(1);
                  setMemberQuery(e.target.value);
                }}
              />
              <select
                className="admin-member-status-filter"
                value={memberStatusFilter}
                onChange={(e) => {
                  setMemberPage(1);
                  setMemberStatusFilter(e.target.value);
                }}
              >
                <option value="ALL">전체</option>
                <option value="ACTIVE">정상</option>
                <option value="BANNED_7D">1주일 정지</option>
                <option value="BANNED_30D">한달 정지</option>
                <option value="BANNED_6M">6개월 정지</option>
                <option value="BANNED_PERM">영구정지</option>
              </select>
            </div>
          </div>
          {members.length === 0 ? (
            <p className="admin-empty">등록된 회원이 없습니다.</p>
          ) : (
            <>
              <table className="admin-table admin-member-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>번호</th>
                    <th style={{ width: "120px" }}>아이디</th>
                    <th style={{ width: "120px" }}>닉네임</th>
                    <th style={{ width: "180px" }}>이메일</th>
                    <th style={{ width: "100px" }}>권한</th>
                    <th style={{ width: "80px" }}>점수</th>
                    <th style={{ width: "140px" }}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {membersPaginated.map((m) => (
                    <tr key={m.mbNum}>
                      <td>{m.mbNum}</td>
                      <td className="admin-td-title">{m.mbUid}</td>
                      <td className="admin-td-title">{m.mbNickname}</td>
                      <td className="admin-td-title">{m.mbEmail || "-"}</td>
                      <td>
                        <select
                          className="admin-member-select"
                          value={m.mbRol || "USER"}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value || value === m.mbRol) return;
                            updateMemberRole(m.mbNum, value);
                          }}
                        >
                          <option value="USER">USER</option>
                          <option value="SUB_ADMIN">SUB_ADMIN</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td>{m.mbScore}</td>
                      <td>
                        <div className="admin-member-actions">
                          <select
                            className="admin-member-select"
                            value={
                              m.mbStatus === "ACTIVE" || !m.mbStatus ? "" : m.mbStatus
                            }
                            disabled={updatingMember === m.mbNum}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!value) return;
                              let label = "";
                              switch (value) {
                                case "BAN_7D":
                                  label = "1주일 정지";
                                  break;
                                case "BAN_30D":
                                  label = "한달 정지";
                                  break;
                                case "BAN_6M":
                                  label = "6개월 정지";
                                  break;
                                case "BAN_PERM":
                                  label = "영구정지";
                                  break;
                                case "ACTIVE":
                                  label = "정지 해제";
                                  break;
                                default:
                                  break;
                              }
                              if (!label) return;
                              updateMemberStatus(m.mbNum, value, label);
                            }}
                          >
                            <option value="">
                              {m.mbStatus === "ACTIVE" || !m.mbStatus
                                ? "정상"
                                : mapStatusLabel(m.mbStatus)}
                            </option>
                            <option value="BAN_7D">1주일 정지</option>
                            <option value="BAN_30D">한달 정지</option>
                            <option value="BAN_6M">6개월 정지</option>
                            <option value="BAN_PERM">영구정지</option>
                            <option value="ACTIVE">정지 해제</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {memberTotalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    type="button"
                    className="admin-pagination-btn"
                    disabled={memberCurrentPage <= 1}
                    onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                  >
                    이전
                  </button>
                  <span className="admin-pagination-info">
                    {memberCurrentPage} / {memberTotalPages}
                  </span>
                  <button
                    type="button"
                    className="admin-pagination-btn"
                    disabled={memberCurrentPage >= memberTotalPages}
                    onClick={() => setMemberPage((p) => Math.min(memberTotalPages, p + 1))}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;

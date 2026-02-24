import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api/axios";
import "./InquiryPage.css";

function InquiryPage() {
  const { user } = useOutletContext() || {};
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myInquiries, setMyInquiries] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }
    if (!title?.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content?.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/inquiry", { title: title.trim(), content: content.trim() });
      alert("문의가 접수되었습니다.");
      setTitle("");
      setContent("");
      fetchMyInquiries();
    } catch (err) {
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : (data?.error ?? data?.message ?? "문의 접수에 실패했습니다.");
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchMyInquiries = async () => {
    try {
      const res = await api.get("/api/inquiry/my");
      setMyInquiries(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMyInquiries([]);
    }
  };

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
      return;
    }
    fetchMyInquiries();
  }, [user, navigate]);

  const formatDate = (dt) => {
    if (!dt) return "-";
    const d = new Date(dt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  if (!user) return null;

  return (
    <div className="inquiry-page">
      <h1 className="inquiry-title">| 1:1 문의</h1>
      <form className="inquiry-form" onSubmit={handleSubmit}>
        <div className="inquiry-field">
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력하세요"
            maxLength={200}
          />
        </div>
        <div className="inquiry-field">
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의 내용을 입력하세요"
            rows={12}
          />
        </div>
        <button type="submit" className="inquiry-submit" disabled={submitting}>
          {submitting ? "접수 중..." : "문의 접수"}
        </button>
      </form>

      {myInquiries.length > 0 && (
        <section className="inquiry-my-section">
          <h2 className="inquiry-my-title">내 문의 목록</h2>
          <div className="inquiry-my-list">
            {myInquiries.map((q) => (
              <div key={q.ibNum} className="inquiry-my-card">
                <div className="inquiry-my-header">
                  <span className="inquiry-my-subject">{q.ibTitle}</span>
                  <span className={`inquiry-my-badge ${q.ibStatus === "Y" ? "done" : ""}`}>
                    {q.ibStatus === "Y" ? "답변완료" : "대기"}
                  </span>
                </div>
                <div className="inquiry-my-date">{formatDate(q.ibDate)}</div>
                <div className="inquiry-my-content">{q.ibContent}</div>
                {q.ibReply && (
                  <div className="inquiry-my-reply">
                    <strong>관리자 답변:</strong>
                    <p>{q.ibReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default InquiryPage;

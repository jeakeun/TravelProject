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
    } catch (err) {
      alert(err?.response?.data?.error || "문의 접수에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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
            rows={8}
          />
        </div>
        <button type="submit" className="inquiry-submit" disabled={submitting}>
          {submitting ? "접수 중..." : "문의 접수"}
        </button>
      </form>
    </div>
  );
}

export default InquiryPage;

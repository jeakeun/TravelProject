import React, { useState } from "react";
import "./ReportModal.css";

const REPORT_CATEGORIES = [
  { value: "", label: "카테고리 선택" },
  { value: "스팸/광고", label: "스팸/광고" },
  { value: "욕설/비방", label: "욕설/비방" },
  { value: "음란물", label: "음란물" },
  { value: "개인정보 유출", label: "개인정보 유출" },
  { value: "저작권 침해", label: "저작권 침해" },
  { value: "내용이 실속이 없음", label: "내용이 실속이 없음" },
  { value: "기타", label: "기타" },
];

function ReportModal({ isOpen, onClose, onSubmit, title = "신고하기" }) {
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category?.trim()) {
      alert("신고 카테고리를 선택해주세요.");
      return;
    }
    if (!reason?.trim()) {
      alert("상세 사유를 입력해주세요.");
      return;
    }
    onSubmit({ category: category.trim(), reason: reason.trim() });
    setCategory("");
    setReason("");
    onClose();
  };

  const handleClose = () => {
    setCategory("");
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={handleClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="report-modal-title">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="report-modal-field">
            <label>신고 카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {REPORT_CATEGORIES.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="report-modal-field">
            <label>상세 사유</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="신고하시는 구체적인 이유를 작성해주세요."
              rows={5}
              required
            />
          </div>
          <div className="report-modal-actions">
            <button type="button" className="report-modal-cancel" onClick={handleClose}>
              취소
            </button>
            <button type="submit" className="report-modal-submit">
              신고 접수
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;

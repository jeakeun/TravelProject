import React, { useState } from "react";
import "./login.css";

function ChangePassword({ onClose, userId }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  // 🚩 [수정] 배포 서버 주소 설정
  const API_BASE_URL = "http://3.37.160.108:8080";

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!currentPw.trim()) {
      alert("현재 비밀번호를 입력하세요.");
      return;
    }
    if (!newPw.trim() || !newPw2.trim()) {
      alert("새 비밀번호를 입력하세요.");
      return;
    }
    if (newPw !== newPw2) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (currentPw === newPw) {
      alert("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    try {
      // 🚩 [수정] localhost -> 배포 서버 IP로 변경
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: userId,
          currentPw: currentPw.trim(),
          newPw: newPw.trim(),
        }),
      });

      const msg = await res.text();

      if (!res.ok) {
        alert(msg || "비밀번호 변경에 실패했습니다.");
        return;
      }

      alert("비밀번호가 변경되었습니다.");
      onClose?.();
    } catch (err) {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="modalStyle" onClick={onClose}>
      <div className="modalContentStyle" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>비밀번호 변경</h2>

        <form onSubmit={submitHandler}>
          <div className="modal-field">
            <label htmlFor="cp-current">현재 비밀번호</label>
            <input
              id="cp-current"
              type="password"
              placeholder="현재 비밀번호를 입력하세요."
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="modal-field">
            <label htmlFor="cp-new">새 비밀번호</label>
            <input
              id="cp-new"
              type="password"
              placeholder="새 비밀번호를 입력하세요."
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="modal-field">
            <label htmlFor="cp-new2">새 비밀번호 확인</label>
            <input
              id="cp-new2"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요."
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="modal-btn-group">
            <button type="submit" className="btn-primary">
              변경하기
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
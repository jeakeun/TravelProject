import React, { useState } from "react";
import "./login.css";

function ResetPassword({ onClose, onBackToFindPw, userId }) {
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!newPw.trim() || !newPw2.trim()) {
      alert("새 비밀번호를 입력하세요.");
      return;
    }
    if (newPw !== newPw2) {
      alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, newPw }),
      });

      if (!res.ok) {
        const msg = await res.text();
        alert(msg || "비밀번호 변경에 실패했습니다.");
        return;
      }

      alert("비밀번호가 변경되었습니다. 로그인해 주세요.");
      onClose();
    } catch (err) {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="modalStyle">
      <div className="modalContentStyle" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>비밀번호 변경</h2>

        <form onSubmit={submitHandler}>
          <div className="modal-field">
            <label>아이디</label>
            <input type="text" value={userId} readOnly />
          </div>

          <div className="modal-field">
            <label htmlFor="rp-pw">새 비밀번호</label>
            <input
              id="rp-pw"
              type="password"
              placeholder="새 비밀번호를 입력하세요."
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="rp-pw2">새 비밀번호 확인</label>
            <input
              id="rp-pw2"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요."
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
            />
          </div>

          <div className="modal-btn-group">
            <button type="button" className="link-btn" onClick={() => onBackToFindPw?.()}>
              뒤로가기
            </button>

            <button type="submit" className="btn-primary">
              변경하기
            </button>

            <button type="button" className="btn-kakao" onClick={onClose}>
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
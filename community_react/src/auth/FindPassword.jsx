import React, { useState } from "react";
import "./login.css";

function FindPassword({ onClose, onBackToLogin, onGoResetPassword }) {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    const trimmedId = id.trim();
    const trimmedEmail = email.trim();

    if (!trimmedId) {
      alert("아이디를 입력하세요.");
      return;
    }
    if (!trimmedEmail) {
      alert("이메일을 입력하세요.");
      return;
    }

    const payload = { id: trimmedId, email: trimmedEmail };

    try {
      const res = await fetch("/auth/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        alert(text || "아이디/이메일이 일치하는 계정을 찾을 수 없습니다.");
        return;
      }

      // ✅ 성공: 비밀번호 변경 팝업으로 이동
      onGoResetPassword?.(trimmedId);
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

        <h2>비밀번호 찾기</h2>

        <form onSubmit={submitHandler}>
          <div className="modal-field">
            <label htmlFor="fp-id">아이디</label>
            <input
              id="fp-id"
              type="text"
              placeholder="아이디를 입력하세요."
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="fp-email">이메일</label>
            <input
              id="fp-email"
              type="email"
              placeholder="가입한 이메일을 입력하세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="modal-btn-group">
            <button type="button" className="link-btn" onClick={() => onBackToLogin?.()}>
              로그인으로 돌아가기
            </button>

            <button type="submit" className="btn-primary">
              다음
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

export default FindPassword;
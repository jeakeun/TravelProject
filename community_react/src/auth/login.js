import { useState } from "react";
import "./login.css";

function Login({ onClose, onLogin, onOpenSignup, onOpenFindPw }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // ✅ 자동로그인

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!id.trim()) return alert("아이디를 입력하세요.");
    if (!pw.trim()) return alert("비밀번호를 입력하세요.");

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ 쿠키(리프레시 토큰) 주고받기 필수
        body: JSON.stringify({ id: id.trim(), pw: pw.trim(), rememberMe }),
      });

      if (!response.ok) {
        const message = await response.text();
        return alert(message || "로그인 실패");
      }

      const data = await response.json();
      // data 예: { member: {...}, accessToken: "..." }
      onLogin?.(data);
    } catch (error) {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="modalStyle" onClick={onClose}>
      <div className="modalContentStyle" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>로그인</h2>

        <form onSubmit={submitHandler}>
          <div className="modal-field">
            <label htmlFor="login-id">아이디</label>
            <input
              type="text"
              id="login-id"
              placeholder="아이디를 입력하세요."
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="login-pw">비밀번호</label>
            <input
              type="password"
              id="login-pw"
              placeholder="비밀번호를 입력하세요."
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>

          {/* ✅ 자동로그인 체크 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" style={{ cursor: "pointer" }}>
              자동로그인
            </label>
          </div>

          <div className="login-links">
            <button type="button" className="link-btn" onClick={() => onOpenFindPw?.()}>
              비밀번호 찾기
            </button>
            <span className="divider">|</span>
            <button type="button" className="link-btn" onClick={() => onOpenSignup?.()}>
              회원가입
            </button>
          </div>

          <div className="modal-btn-group">
            <button type="submit" className="btn-primary">로그인</button>
            <button type="button" className="btn-kakao">카카오톡으로 로그인</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
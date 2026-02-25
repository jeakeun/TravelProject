import { useState } from "react";
import "./login.css";

function Login({ onClose, onLogin, onOpenSignup, onOpenFindPw }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // 🚩 [확인] 모든 로그인 요청은 배포된 서버 IP인 3.37.160.108을 향하도록 고정합니다.
  const API_BASE_URL = "http://3.37.160.108:8080";

  const submitHandler = async (e) => {
    e.preventDefault();

    const cleanedId = id.trim();
    const cleanedPw = pw.trim();

    if (!cleanedId) return alert("아이디를 입력하세요.");
    if (!cleanedPw) return alert("비밀번호를 입력하세요.");

    try {
      // 🚩 fetch 경로에 오타나 localhost가 섞이지 않도록 API_BASE_URL을 사용합니다.
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ refreshToken 쿠키 받기/보내기
        body: JSON.stringify({
          id: cleanedId,
          pw: cleanedPw,
          rememberMe, // ✅ 자동로그인 여부
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        return alert(message || "로그인 실패");
      }

      const data = await response.json();
      // ✅ 서버 응답 형태: { member: {...}, accessToken: "..." }

      if (typeof onLogin === "function") {
        // App에서 member와 accessToken을 모두 활용할 수 있도록 data 전체 전달
        onLogin(data);
      }

      // ✅ 모달 닫기
      onClose?.();
    } catch (error) {
      console.error("로그인 에러:", error);
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
              autoComplete="username"
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
              autoComplete="current-password"
            />
          </div>

          {/* ✅ 자동로그인 */}
          <div className="remember-row">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="remember-label">
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
            <button type="submit" className="btn-primary">
              로그인
            </button>
            <button type="button" className="btn-kakao">
              카카오톡으로 로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
import { useState } from "react";
import "./signup.css";
import { signupMessages } from "../translations/signup";

function Signup({ onClose, currentLang = "KR" }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const t = signupMessages[currentLang] || signupMessages.KR;

  const fillRandom = () => {
    const rand = Math.random().toString(36).substring(2, 8);
    setId("test_" + rand);
    setPw("test_1234");
    setPw2("test_1234");
    setEmail("test_" + rand + "@test.com");
    setAgree(true);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!id.trim()) {
      alert(t.id_required);
      return;
    }
    if (!pw.trim()) {
      alert(t.pw_required);
      return;
    }
    if (pw !== pw2) {
      alert(t.pw_mismatch);
      return;
    }
    if (!email.trim()) {
      alert(t.email_required);
      return;
    }
    if (!agree) {
      alert(t.agree_required);
      return;
    }

    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw, email, agree }),
      });

      const message = await response.text();

      if (response.ok) {
        alert(message);
        onClose();
      } else {
        alert(message);
      }
    } catch (error) {
      alert(t.network_error);
    }
  };

  return (
    <div className="modalStyle">
      <div className="modalContentStyle" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>회원가입</h2>
        <form onSubmit={submitHandler}>
          <div className="modal-field">
            <label htmlFor="signup-id">아이디</label>
            <input type="text" id="signup-id"
              placeholder="아이디를 입력하세요."
              value={id} onChange={(e) => setId(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="signup-pw">비밀번호</label>
            <input type="password" id="signup-pw"
              placeholder="비밀번호를 입력하세요."
              value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="signup-pw2">비밀번호 확인</label>
            <input type="password" id="signup-pw2"
              placeholder="비밀번호를 다시 입력하세요."
              value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="signup-email">이메일</label>
            <input type="email" id="signup-email"
              placeholder="이메일을 입력하세요."
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="agree-box">
            <input type="checkbox" id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)} />
            <label htmlFor="agree">
              개인정보 처리방침에 동의합니다
              <button type="button" className="agree-link" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(true); }}>
                (약관 보기)
              </button>
            </label>
          </div>
          {showTerms && (
            <div className="termsOverlay" onClick={() => setShowTerms(false)}>
              <div className="termsModal" onClick={(e) => e.stopPropagation()}>
                <div className="termsModal-header">
                  <h3>개인정보 처리방침</h3>
                  <button type="button" className="terms-close" onClick={() => setShowTerms(false)}>&times;</button>
                </div>
                <div className="termsModal-body">
                  <p><strong>제1조 (목적)</strong><br />본 약관은 서비스 이용과 관련하여 회원의 개인정보를 보호하고, 개인정보와 관련한 회원의 권익을 보장하기 위해 적용됩니다.</p>
                  <p><strong>제2조 (수집 항목)</strong><br />회원가입 시 아이디, 비밀번호, 이메일 주소를 수집합니다. 서비스 이용 과정에서 접속 로그, 쿠키 등이 생성·수집될 수 있습니다.</p>
                  <p><strong>제3조 (이용 목적)</strong><br />수집된 정보는 회원 식별, 서비스 제공·개선, 고객 문의 처리, 부정 이용 방지 등에 사용됩니다.</p>
                  <p><strong>제4조 (보유 기간)</strong><br />회원 탈퇴 시까지 보유하며, 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관 후 파기합니다.</p>
                  <p><strong>제5조 (동의)</strong><br />회원가입 시 본 약관에 동의한 것으로 간주됩니다. 동의하지 않으시면 회원가입이 제한됩니다.</p>
                </div>
                <div className="termsModal-footer">
                  <button type="button" className="btn-primary" onClick={() => setShowTerms(false)}>확인</button>
                </div>
              </div>
            </div>
          )}
          <div className="modal-btn-group">
            <button type="submit" className="btn-primary">회원가입</button>
            <button
              type="button"
              className="btn-kakao"
              onClick={() => {
                if (window.Kakao?.Auth?.authorize) {
                  sessionStorage.setItem("kakao_signup", "true");
                  window.Kakao.Auth.authorize({
                    redirectUri: `${window.location.origin}/kakao-callback`,
                    prompt: "login",
                  });
                } else {
                  alert(t.kakao_unavailable);
                }
              }}
            >
              카카오톡으로 회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default Signup;





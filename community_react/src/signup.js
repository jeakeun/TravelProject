import { useState } from "react";
import "./signup.css";

function Signup({ onClose }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);

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
      alert("아이디를 입력하세요.");
      return;
    }
    if (!pw.trim()) {
      alert("비밀번호를 입력하세요.");
      return;
    }
    if (pw !== pw2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!email.trim()) {
      alert("이메일을 입력하세요.");
      return;
    }
    if (!agree) {
      alert("개인정보 처리방침에 동의해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/signup", {
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
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="modalStyle" onClick={onClose}>
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
            <label htmlFor="agree">개인정보 처리방침에 동의합니다</label>
          </div>
          <div className="modal-btn-group">
            <button type="submit" className="btn-primary">회원가입</button>
            <button type="button" className="btn-kakao">카카오톡으로 회원가입</button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default Signup;





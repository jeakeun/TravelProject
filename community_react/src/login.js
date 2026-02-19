import { useState } from "react";
import "./login.css";

function Login({ onClose }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

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

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw }),
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
        <h2>로그인</h2>
        <form onSubmit={submitHandler}>
          <div className="modal-field">
            <label htmlFor="login-id">아이디</label>
            <input type="text" id="login-id"
              placeholder="아이디를 입력하세요."
              value={id} onChange={(e) => setId(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="login-pw">비밀번호</label>
            <input type="password" id="login-pw"
              placeholder="비밀번호를 입력하세요."
              value={pw} onChange={(e) => setPw(e.target.value)} />
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

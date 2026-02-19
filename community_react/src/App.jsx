import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import Main from "./pages/Main";
import Board from "./pages/Board";
import Post from "./pages/Post";

// ✅ 팝업용 컴포넌트 (네가 만든 것)
import Login from "./pages/Login";
import Signup from "./pages/SignUp";

import "./App.css";

// ✅ 라우트 진입 시 팝업을 자동으로 열어주는 래퍼
function OpenLoginModal({ setShowLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    setShowLogin(true);
    // URL은 /login으로 들어왔지만, 화면은 메인으로 두고 싶으면 아래처럼 처리
    navigate("/", { replace: true });
  }, [setShowLogin, navigate]);

  return <Main />;
}

function OpenSignupModal({ setShowSignup }) {
  const navigate = useNavigate();

  useEffect(() => {
    setShowSignup(true);
    navigate("/", { replace: true });
  }, [setShowSignup, navigate]);

  return <Main />;
}

function App() {
  // ✅ 네가 만든 로그인/회원가입 상태
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <Router>
      {/* ===== 헤더 (버튼 + 팝업은 버튼 바로 밑) ===== */}
      <header className="header">
        <div className="header-left">
          <a href="/" className="logo">TravelCommunity</a>
        </div>

        <div className="header-right">
          {/* ✅ 네가 만든 버튼 */}
          <button onClick={() => setShowLogin(true)}>로그인</button>
          <button onClick={() => setShowSignup(true)}>회원가입</button>

          {/* ✅ 네가 만든 팝업 위치(버튼 바로 밑) */}
          {showLogin && <Login onClose={() => setShowLogin(false)} />}
          {showSignup && <Signup onClose={() => setShowSignup(false)} />}
        </div>
      </header>

      {/* ===== 라우터 영역 ===== */}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/board" element={<Board />} />
        <Route path="/post" element={<Post />} />

        {/* ✅ 여기! 라우터로 /login, /signup 들어와도 팝업을 열게 변경 */}
        <Route
          path="/login"
          element={<OpenLoginModal setShowLogin={setShowLogin} />}
        />
        <Route
          path="/signup"
          element={<OpenSignupModal setShowSignup={setShowSignup} />}
        />
      </Routes>
    </Router>
  );
}

export default App;

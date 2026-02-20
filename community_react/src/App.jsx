import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Outlet, useNavigate, useLocation, Navigate, BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';

// 스타일 임포트
import "./pages/Main.css";
import './Appha.css';
import "./App.css";

// 페이지 및 컴포넌트 임포트
import Main from "./pages/Main";
import MainList from './components/MainList';
import PostWrite from './components/PostWrite';
import PostDetail from './pages/PostDetail';
import FreeBoard from './pages/FreeBoard';
import RecommendMain from './components/recommend/RecommendMain';
import NewsNotice from './pages/NewsNotice'; 
import Header from './components/Header'; // ✅ Header 컴포넌트 임포트 확인

// 로그인, 회원가입 관련 임포트
import Login from './auth/login';
import Signup from './auth/signup';
import FindPassword from "./auth/FindPassword";
import ResetPassword from "./auth/ResetPassword";

/* ✅ 팝업 제어용 래퍼 함수들 */
function OpenLoginModal({ setShowLogin, setShowSignup, setShowFindPw, setShowResetPw }) {
  const navigate = useNavigate();
  useEffect(() => {
    setShowSignup(false); setShowFindPw(false); setShowResetPw(false); setShowLogin(true);
    navigate("/", { replace: true });
  }, [setShowLogin, setShowSignup, setShowFindPw, setShowResetPw, navigate]);
  return <Main />;
}

function OpenSignupModal({ setShowSignup, setShowLogin, setShowFindPw, setShowResetPw }) {
  const navigate = useNavigate();
  useEffect(() => {
    setShowLogin(false); setShowFindPw(false); setShowResetPw(false); setShowSignup(true);
    navigate("/", { replace: true });
  }, [setShowSignup, setShowLogin, setShowFindPw, setShowResetPw, navigate]);
  return <Main />;
}

function OpenFindPwModal({ setShowFindPw, setShowLogin, setShowSignup, setShowResetPw }) {
  const navigate = useNavigate();
  useEffect(() => {
    setShowLogin(false); setShowSignup(false); setShowResetPw(false); setShowFindPw(true);
    navigate("/", { replace: true });
  }, [setShowFindPw, setShowLogin, setShowSignup, setShowResetPw, navigate]);
  return <Main />;
}

/**
 * ✅ 1. GlobalLayout
 * 모든 페이지에서 공통적으로 사용할 헤더와 팝업, 레이아웃 정의
 */
function GlobalLayout({
  showLogin, setShowLogin,
  showSignup, setShowSignup,
  showFindPw, setShowFindPw,
  showResetPw, setShowResetPw,
  resetPwId, setResetPwId,
  user, onLogin, onLogout,
  currentLang, setCurrentLang
}) {
  return (
    <div className="App">
      {/* ✅ 공통 헤더: 여기에 위치해야 모든 페이지에서 언어(KR) 정보가 유지됩니다 */}
      <Header 
        user={user} 
        onLogout={onLogout} 
        currentLang={currentLang} 
        setCurrentLang={setCurrentLang} 
        setShowLogin={setShowLogin}
        setShowSignup={setShowSignup}
      />

      {/* 팝업 레이어 */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLogin={onLogin}
          onOpenSignup={() => { setShowLogin(false); setShowSignup(true); }}
          onOpenFindPw={() => { setShowLogin(false); setShowFindPw(true); }}
        />
      )}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
      {showFindPw && (
        <FindPassword
          onClose={() => setShowFindPw(false)}
          onGoResetPassword={(id) => { setResetPwId(id); setShowFindPw(false); setShowResetPw(true); }}
          onBackToLogin={() => { setShowFindPw(false); setShowLogin(true); }}
        />
      )}
      {showResetPw && (
        <ResetPassword 
          userId={resetPwId} 
          onClose={() => setShowResetPw(false)} 
          onBackToFindPw={() => { setShowResetPw(false); setShowFindPw(true); }}
        />
      )}

      {/* 본문 영역: 상단 헤더 높이만큼 Padding 부여 */}
      <main style={{ paddingTop: "70px", minHeight: "100vh" }}>
        <Outlet
          context={{
            user, setShowLogin, setShowSignup, setShowFindPw, setShowResetPw,
            onLogout, currentLang, setCurrentLang
          }}
        />
      </main>
    </div>
  );
}

/**
 * ✅ 2. CommunityContainer
 * 커뮤니티 메뉴와 게시글 리스트 필터링 로직 포함
 */
function CommunityContainer() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('자유 게시판');
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = useMemo(() => ['여행 추천 지도', '여행 추천 게시판', '여행 후기 게시판', '자유 게시판', '커뮤니티'], []);
  const menuPaths = useMemo(() => ({
    '여행 추천 지도': '/community/map',
    '여행 추천 게시판': '/community/recommend',
    '여행 후기 게시판': '/community/reviewboard',
    '자유 게시판': '/community/freeboard',
    '커뮤니티': '/community/freeboard'
  }), []);

  useEffect(() => {
    const currentPath = location.pathname;
    const foundMenu = Object.keys(menuPaths).find(key => menuPaths[key] === currentPath);
    if (foundMenu) setActiveMenu(foundMenu);
  }, [location.pathname, menuPaths]);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/posts');
      const cleanData = response.data.map(post => ({
        ...post,
        id: post.postId,
        view_count: post.viewCount || 0,
        file_url: post.fileUrl || "",
        category: post.category ? post.category.trim() : '자유 게시판'
      }));
      setPhotos(cleanData.sort((a, b) => b.postId - a.postId));
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const filteredPhotos = useMemo(() => {
    return photos.filter(post => {
      if (activeMenu === '커뮤니티' || activeMenu === '자유 게시판') return post.category === '자유 게시판';
      return post.category === activeMenu;
    });
  }, [photos, activeMenu]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>로딩 중...</div>;

  return (
    <div className="container">
      <aside className="sidebar">
        <ul>
          {menuItems.map((item) => (
            <li key={item} className={activeMenu === item ? 'active' : ''} onClick={() => navigate(menuPaths[item])}>
              {item}
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="recommend" element={<RecommendMain />} />
          <Route path="freeboard" element={<FreeBoard goToDetail={(id) => navigate(`/community/freeboard/${id}`)} />} />
          <Route path="freeboard/:id" element={<PostDetail />} />
          <Route path="photo/:id" element={<PostDetail />} />
          <Route path="write" element={<PostWrite activeMenu={activeMenu} refreshPosts={loadPosts} />} />
          <Route path="/" element={<Navigate to="freeboard" replace />} />
          
          {/* ✅ 에러 해결: MainList를 호출하고 필터링된 데이터를 전달함 */}
          <Route path="*" element={
            <MainList 
              photos={filteredPhotos} 
              activeMenu={activeMenu} 
              goToDetail={(id) => navigate(`/community/photo/${id}`)} 
            />
          } />
        </Routes>
      </main>
    </div>
  );
}

/**
 * ✅ 3. App 메인 컴포넌트
 */
function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetPwId, setResetPwId] = useState("");

  const [currentLang, setCurrentLang] = useState("KR"); // ✅ 공통 언어 상태

  // 유저 정보 불러오기 (에러 방지 JSON.parse)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogin = useCallback((data) => {
    setUser(data.member);
    localStorage.setItem("user", JSON.stringify(data.member));
    localStorage.setItem("accessToken", data.accessToken);
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          element={
            <GlobalLayout
              showLogin={showLogin} setShowLogin={setShowLogin}
              showSignup={showSignup} setShowSignup={setShowSignup}
              showFindPw={showFindPw} setShowFindPw={setShowFindPw}
              showResetPw={showResetPw} setShowResetPw={setShowResetPw}
              resetPwId={resetPwId} setResetPwId={setResetPwId}
              user={user} onLogin={handleLogin} onLogout={handleLogout}
              currentLang={currentLang} setCurrentLang={setCurrentLang}
            />
          }
        >
          {/* 메인 페이지 */}
          <Route path="/" element={<Main />} />

          {/* 팝업 연동 라우트 */}
          <Route path="/login" element={<OpenLoginModal setShowLogin={setShowLogin} setShowSignup={setShowSignup} setShowFindPw={setShowFindPw} setShowResetPw={setShowResetPw} />} />
          <Route path="/signup" element={<OpenSignupModal setShowSignup={setShowSignup} setShowLogin={setShowLogin} setShowFindPw={setShowFindPw} setShowResetPw={setShowResetPw} />} />
          <Route path="/find-password" element={<OpenFindPwModal setShowFindPw={setShowFindPw} setShowLogin={setShowLogin} setShowSignup={setShowSignup} setShowResetPw={setShowResetPw} />} />

          {/* 커뮤니티 및 공지사항 */}
          <Route path="/community/*" element={<CommunityContainer />} />
          <Route path="/newsNotice" element={<NewsNotice />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
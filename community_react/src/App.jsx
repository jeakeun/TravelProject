import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Link, Outlet, useNavigate, useLocation, Navigate, BrowserRouter as Router } from 'react-router-dom';
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

//로그인, 회원가입 임포트
import Login from './auth/login';
import Signup from './auth/signup';

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

function GlobalLayout({ showLogin, setShowLogin, showSignup, setShowSignup, user, onLogin, onLogout }) {

  return (
    <div className="App">
      {/* 팝업은 header 바깥에 렌더링 (header의 z-index 스태킹 컨텍스트에 갇히지 않도록) */}
      {showLogin && <Login onClose={() => setShowLogin(false)} onLogin={onLogin} />}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
      <main style={{ paddingTop: "70px", minHeight: "100vh" }}>
        <Outlet context={{ user, setShowLogin, setShowSignup, onLogout }} />
      </main>
    </div>
  );
}

/**
 * 2. 커뮤니티 전용 레이아웃
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
          <Route path="*" element={<MainList photos={filteredPhotos} activeMenu={activeMenu} goToDetail={(id) => navigate(`/community/photo/${id}`)} />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * 3. 최종 App 컴포넌트
 */
function App() {
  // ✅ 네가 만든 로그인/회원가입 상태
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // ✅ 유저 상태 (localStorage에서 복원)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  return (
    <Router>
      <Routes>
        {/* ===== 라우터 영역 ===== */}
        <Route element={<GlobalLayout showLogin={showLogin} setShowLogin={setShowLogin} showSignup={showSignup} setShowSignup={setShowSignup} user={user} onLogin={handleLogin} onLogout={handleLogout} />}>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<OpenLoginModal setShowLogin={setShowLogin} />} />
          <Route path="/signup" element={<OpenSignupModal setShowSignup={setShowSignup} />} />
          <Route path="/community/*" element={<CommunityContainer />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
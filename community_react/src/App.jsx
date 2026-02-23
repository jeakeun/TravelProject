import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

// 스타일 및 컴포넌트 임포트
import "./pages/Main.css";
import './Appha.css';
import "./App.css";

import Main from "./pages/Main";
import Header from "./components/Header"; 
import MainList from './components/MainList';
import PostWrite from './components/PostWrite';

import FreeBoard from './components/freeboard/FreeBoardList'; 
import FreeBoardDetail from './components/freeboard/FreeBoardDetail';
import RecommendMain from './components/recommend/RecommendMain';
import RecommendPostDetail from './components/recommend/RecommendPostDetail'; 

import ReviewBoardList from './components/reviewboard/ReviewBoardList';
import ReviewBoardDetail from './components/reviewboard/ReviewBoardDetail';

import Login from './auth/login';
import Signup from './auth/signup';

// 모든 요청에 쿠키를 포함하여 조회수 중복 방지 로직이 정상 작동하게 합니다.
axios.defaults.withCredentials = true;

function OpenLoginModal({ setShowLogin }) {
  const navigate = useNavigate();
  useEffect(() => {
    setShowLogin(true);
    navigate("/", { replace: true });
  }, [setShowLogin, navigate]);
  return <Main />;
}

function OpenSignupModal({ setShowSignup, setShowLogin, setShowFindPw, setShowResetPw }) {
  const navigate = useNavigate();
  useEffect(() => {
    setShowSignup(true);
    navigate("/", { replace: true });
  }, [setShowSignup, navigate]);
  return <Main />;
}

function GlobalLayout({ showLogin, setShowLogin, showSignup, setShowSignup, user, onLogin, onLogout, currentLang, setCurrentLang, posts }) {
  return (
    <div className="App">
      <Header 
        user={user} 
        onLogout={onLogout} 
        setShowLogin={setShowLogin} 
        setShowSignup={setShowSignup} 
        currentLang={currentLang} 
        setCurrentLang={setCurrentLang} 
      />
      
      {showLogin && <Login onClose={() => setShowLogin(false)} onLogin={onLogin} />}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
      
      <main style={{ paddingTop: "70px", minHeight: "100vh" }}>
        <Outlet context={{ user, setShowLogin, setShowSignup, onLogout, currentLang, setCurrentLang, posts }} />
      </main>
    </div>
  );
}

function CommunityContainer({ posts, loadPosts, loading }) {
  const [activeMenu, setActiveMenu] = useState('자유 게시판');
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = ['여행 추천 게시판', '여행 후기 게시판', '자유 게시판', '여행지도'];

  const menuPaths = useMemo(() => ({
    '여행 추천 게시판': '/community/recommend',
    '여행 후기 게시판': '/community/reviewboard',
    '자유 게시판': '/community/freeboard',
    '여행지도': '/community/map'
  }), []);

  const isDetailPage = useMemo(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    return (lastPart && !isNaN(lastPart)) || lastPart === 'write' || lastPart === 'edit';
  }, [location.pathname]);

  useEffect(() => {
    const foundMenu = Object.keys(menuPaths).find(key => location.pathname.startsWith(menuPaths[key]));
    if (foundMenu) setActiveMenu(foundMenu);
  }, [location.pathname, menuPaths]);

  if (loading && !isDetailPage) return <div style={{ textAlign: 'center', marginTop: '100px' }}>로딩 중...</div>;

  return (
    <div className="container">
      <aside className="sidebar">
        <ul>
          {menuItems.map(item => (
            <li key={item} className={activeMenu === item ? 'active' : ''} onClick={() => navigate(menuPaths[item])}>
              {item}
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">
        <Routes>
          {/* 🚩 [핵심 수정] 상세(:id) 경로보다 글쓰기(write) 경로를 항상 위에 배치하여 충돌 방지 */}
          
          {/* 1. 여행 추천 게시판 */}
          <Route path="recommend/write" element={<PostWrite activeMenu="여행 추천 게시판" refreshPosts={loadPosts} />} />
          <Route path="recommend/:id" element={<RecommendPostDetail />} />
          <Route path="recommend" element={<RecommendMain posts={posts} />} />

          {/* 2. 여행 후기 게시판 */}
          <Route path="reviewboard/write" element={<PostWrite activeMenu="여행 후기 게시판" refreshPosts={loadPosts} />} />
          <Route path="reviewboard/:id" element={<ReviewBoardDetail />} /> 
          <Route path="reviewboard" element={<ReviewBoardList posts={posts} />} />
          
          {/* 3. 자유 게시판 */}
          <Route path="freeboard/write" element={<PostWrite activeMenu="자유 게시판" refreshPosts={loadPosts} />} />
          <Route path="freeboard/:id" element={<FreeBoardDetail />} />
          <Route path="freeboard" element={<FreeBoard posts={posts} goToDetail={(id) => navigate(`/community/freeboard/${id}`)} />} />

          {/* 기타 경로 */}
          <Route path="map" element={<MainList photos={[]} activeMenu="여행지도" goToDetail={(id) => navigate(`/community/map/${id}`)} />} /> 
          <Route path="write" element={<PostWrite activeMenu={activeMenu} refreshPosts={loadPosts} />} />
          <Route path="/" element={<Navigate to="freeboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentLang, setCurrentLang] = useState("KR");
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const location = useLocation();

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = 'recommend'; 
      if (location.pathname.includes('freeboard')) endpoint = 'freeboard';
      else if (location.pathname.includes('reviewboard')) endpoint = 'reviewboard';

      const apiUrl = endpoint === 'recommend' 
        ? `http://localhost:8080/api/recommend/posts/all`
        : `http://localhost:8080/api/${endpoint}/posts`;

      const response = await axios.get(apiUrl);
      const cleanData = response.data.map(post => ({
        ...post,
        id: post.poNum || post.postId
      }));
      setPosts(cleanData);
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback((() => {
    setUser(null);
    localStorage.removeItem('user');
  }), []);

  return (
    <Routes>
      <Route element={
        <GlobalLayout 
          showLogin={showLogin} 
          setShowLogin={setShowLogin} 
          showSignup={showSignup} 
          setShowSignup={setShowSignup} 
          user={user} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          currentLang={currentLang} 
          setCurrentLang={setCurrentLang}
          posts={posts} 
        />
      }>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<OpenLoginModal setShowLogin={setShowLogin} />} />
        <Route path="/signup" element={<OpenSignupModal setShowSignup={setShowSignup} />} />
        <Route path="/community/*" element={<CommunityContainer posts={posts} loadPosts={loadPosts} loading={loading} />} />
      </Route>
    </Routes>
  );
}

export default App;
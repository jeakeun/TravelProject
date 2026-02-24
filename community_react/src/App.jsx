import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet, useOutletContext } from 'react-router-dom';
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

import NewsNotice from './pages/NewsNotice';
import MyPage from './pages/MyPage';
import { getUserId } from './utils/user';

import Login from './auth/login';
import Signup from './auth/signup';
import FindPassword from './auth/FindPassword';
import ResetPassword from './auth/ResetPassword';
import ChangePassword from './auth/ChangePassword';

// 모든 요청에 쿠키를 포함하여 조회수 중복 방지 로직이 정상 작동하게 합니다.
axios.defaults.withCredentials = true;

function OpenLoginModal({ openLogin }) {
  const navigate = useNavigate();
  useEffect(() => {
    openLogin?.();
    navigate("/", { replace: true });
  }, [openLogin, navigate]);
  return <Main />;
}

function OpenSignupModal({ openSignup }) {
  const navigate = useNavigate();
  useEffect(() => {
    openSignup?.();
    navigate("/", { replace: true });
  }, [openSignup, navigate]);
  return <Main />;
}

function GlobalLayout({ showLogin, setShowLogin, showSignup, setShowSignup, openLogin, openSignup, showFindPw, setShowFindPw, showResetPw, setShowResetPw, resetUserId, setResetUserId, showChangePw, setShowChangePw, user, setUser, onLogin, onLogout, currentLang, setCurrentLang, posts, openChangePassword }) {
  return (
    <div className="App">
      <Header 
        user={user} 
        onLogout={onLogout} 
        openLogin={openLogin} 
        openSignup={openSignup} 
        currentLang={currentLang} 
        setCurrentLang={setCurrentLang} 
      />
      
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLogin={onLogin}
          onOpenSignup={openSignup}
          onOpenFindPw={() => { setShowLogin(false); setShowFindPw(true); }}
        />
      )}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
      {showFindPw && (
        <FindPassword
          onClose={() => setShowFindPw(false)}
          onBackToLogin={() => { setShowFindPw(false); setShowLogin(true); }}
          onGoResetPassword={(userId) => { setShowFindPw(false); setResetUserId(userId); setShowResetPw(true); }}
        />
      )}
      {showResetPw && (
        <ResetPassword
          onClose={() => { setShowResetPw(false); setResetUserId(''); }}
          onBackToFindPw={() => { setShowResetPw(false); setShowFindPw(true); }}
          userId={resetUserId}
        />
      )}
      {showChangePw && user && (
        <ChangePassword
          onClose={() => setShowChangePw(false)}
          userId={getUserId(user)}
        />
      )}
      
      <main className="main-content">
        {/* 🚩 [수정] context에 posts 데이터를 추가하여 Main 페이지에서도 사용 가능하게 합니다. */}
        <Outlet context={{ user, setUser, setShowLogin, setShowSignup, onLogout, currentLang, setCurrentLang, posts, openChangePassword }} />
      </main>
    </div>
  );
}

function CommunityContainer({ posts, loadPosts, loading }) {
  const { user } = useOutletContext() || {};
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
  const [showFindPw, setShowFindPw] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [currentLang, setCurrentLang] = useState("KR");
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed?.member ?? parsed;
    } catch {
      return null;
    }
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

  // 자동로그인: localStorage에 user가 없을 때 refresh 쿠키로 세션 복원
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) return; // 이미 로컬에 user 있으면 스킵
    fetch("http://localhost:8080/auth/refresh", { method: "POST", credentials: "include" })
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data) => {
        if (!data?.member && !data?.accessToken) return;
        const member = data.member;
        if (member) {
          setUser(member);
          localStorage.setItem('user', JSON.stringify(member));
        }
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      })
      .catch(() => {});
  }, []);

  const handleLogin = useCallback((userData) => {
    // 로그인 응답이 { member, accessToken } 형태이면 member만 저장해 헤더에 아이디(mb_Uid) 표시
    const member = userData?.member ?? userData;
    const accessToken = userData?.accessToken;
    setUser(member);
    localStorage.setItem('user', JSON.stringify(member));
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    // refreshToken 쿠키 삭제
    fetch("http://localhost:8080/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  const openLogin = useCallback(() => {
    setShowSignup(false);
    setShowFindPw(false);
    setShowResetPw(false);
    setShowLogin(true);
  }, []);

  const openSignup = useCallback(() => {
    setShowLogin(false);
    setShowFindPw(false);
    setShowResetPw(false);
    setShowSignup(true);
  }, []);

  const openChangePassword = useCallback(() => {
    if (user) setShowChangePw(true);
  }, [user]);

  return (
    <Routes>
      <Route element={
        <GlobalLayout 
          showLogin={showLogin} 
          setShowLogin={setShowLogin} 
          showSignup={showSignup} 
          setShowSignup={setShowSignup} 
          openLogin={openLogin}
          openSignup={openSignup}
          showFindPw={showFindPw} 
          setShowFindPw={setShowFindPw} 
          showResetPw={showResetPw} 
          setShowResetPw={setShowResetPw} 
          resetUserId={resetUserId} 
          setResetUserId={setResetUserId}
          showChangePw={showChangePw}
          setShowChangePw={setShowChangePw}
          user={user}
          setUser={setUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
          posts={posts}
          openChangePassword={openChangePassword}
        />
      }>
        <Route path="/" element={<Main />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<OpenLoginModal openLogin={openLogin} />} />
        <Route path="/signup" element={<OpenSignupModal openSignup={openSignup} />} />
        <Route path="/community/*" element={<CommunityContainer posts={posts} loadPosts={loadPosts} loading={loading} />} />
        <Route path="/news/notice" element={<NewsNotice />} />
      </Route>
    </Routes>
  );
}

export default App;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

// 스타일 임포트
import "./pages/Main.css";
import './Appha.css';
import "./App.css";

// 컴포넌트 임포트
import Main from "./pages/Main";
import Header from "./components/Header"; 
import MainList from './components/MainList';
import PostWrite from './components/PostWrite';

import FreeBoard from './components/freeboard/FreeBoardList'; 
import FreeBoardDetail from './components/freeboard/FreeBoardDetail';
import RecommendMain from './components/recommend/RecommendMain';
import RecommendPostDetail from './components/recommend/RecommendPostDetail'; 

import EventBoardList from './components/eventboard/EventBoardList'; 
import EventBoardDetail from './components/eventboard/EventBoardDetail'; 
import NewsLetterList from './components/newsletter/NewsLetterList';
import NewsLetterDetail from './components/newsletter/NewsLetterDetail';

import NewsNotice from './pages/NewsNotice';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import InquiryPage from './pages/InquiryPage';
import { getUserId } from './utils/user';

import Login from './auth/login';
import Signup from './auth/signup';
import FindPassword from './auth/FindPassword';
import ResetPassword from './auth/ResetPassword';
import ChangePassword from './auth/ChangePassword';

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

function GlobalLayout({ showLogin, setShowLogin, showSignup, setShowSignup, openLogin, openSignup, showFindPw, setShowFindPw, showResetPw, setShowResetPw, resetUserId, setResetUserId, showChangePw, setShowChangePw, user, setUser, onLogin, onLogout, currentLang, setCurrentLang, posts, loadPosts, openChangePassword }) {
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
        <Outlet context={{ user, setUser, setShowLogin, setShowSignup, onLogout, currentLang, setCurrentLang, posts, loadPosts, openChangePassword }} />
      </main>
    </div>
  );
}

function CommunityContainer({ posts, loadPosts, loading }) {
  const [activeMenu, setActiveMenu] = useState('자유 게시판');
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const boardParam = queryParams.get('board');

  // 🚩 [뉴스레터 리다이렉트 포함] 뉴스레터 파라미터 감지 시 독립 경로로 강제 이동
  useEffect(() => {
    if (boardParam === 'event') {
      navigate('/news/event/write', { replace: true });
    } else if (boardParam === 'newsletter') {
      navigate('/news/newsletter/write', { replace: true });
    }
  }, [boardParam, navigate]);

  const menuItems = ['여행 추천 게시판', '자유 게시판', '여행지도'];

  const menuPaths = useMemo(() => ({
    '여행 추천 게시판': '/community/recommend',
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
          <Route path="recommend/write" element={<PostWrite activeMenu="여행 추천 게시판" boardType="recommend" refreshPosts={loadPosts} />} />
          <Route path="recommend/:id" element={<RecommendPostDetail />} />
          <Route path="recommend" element={<RecommendMain posts={posts} />} />

          <Route path="freeboard/write" element={<PostWrite activeMenu="자유 게시판" boardType="freeboard" refreshPosts={loadPosts} />} />
          <Route path="freeboard/:id" element={<FreeBoardDetail />} />
          <Route path="freeboard" element={<FreeBoard posts={posts} goToDetail={(id) => navigate(`/community/freeboard/${id}`)} />} />

          <Route path="map" element={<MainList photos={[]} activeMenu="여행지도" goToDetail={(id) => navigate(`/community/map/${id}`)} />} /> 
          
          <Route path="write" element={<PostWrite activeMenu={activeMenu} boardType={activeMenu === '여행 추천 게시판' ? 'recommend' : 'freeboard'} refreshPosts={loadPosts} />} />
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
    const path = location.pathname;
    const pathParts = path.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const isActionPage = ['write', 'edit', 'login', 'signup'].includes(lastPart) || (lastPart && !isNaN(lastPart));
    
    if (isActionPage || path === '/') {
       setLoading(false);
       return;
    }

    try {
      setLoading(true);
      let endpoint = ''; 
      if (path.includes('freeboard')) endpoint = 'freeboard';
      else if (path.includes('event')) endpoint = 'event';
      else if (path.includes('newsletter')) endpoint = 'newsletter';
      else if (path.includes('recommend')) endpoint = 'recommend';

      if (!endpoint) {
        setLoading(false);
        return;
      }

      const apiUrl = endpoint === 'recommend' 
        ? `http://localhost:8080/api/recommend/posts/all`
        : `http://localhost:8080/api/${endpoint}/posts`;

      const response = await axios.get(apiUrl);
      if (response.data && Array.isArray(response.data)) {
        const cleanData = response.data.map(post => ({
          ...post,
          id: post.poNum || post.po_num || post.postId 
        }));
        setPosts(cleanData);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(`${path} 데이터 로딩 실패:`, err);
      setPosts([]); 
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) return; 
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
          showLogin={showLogin} setShowLogin={setShowLogin} 
          showSignup={showSignup} setShowSignup={setShowSignup} 
          openLogin={openLogin} openSignup={openSignup}
          showFindPw={showFindPw} setShowFindPw={setShowFindPw} 
          showResetPw={showResetPw} setShowResetPw={setShowResetPw} 
          resetUserId={resetUserId} setResetUserId={setResetUserId}
          showChangePw={showChangePw} setShowChangePw={setShowChangePw}
          user={user} setUser={setUser}
          onLogin={handleLogin} onLogout={handleLogout}
          currentLang={currentLang} setCurrentLang={setCurrentLang}
          posts={posts} loadPosts={loadPosts} openChangePassword={openChangePassword}
        />
      }>
        <Route path="/" element={<Main />} />
        
        <Route path="/news/event" element={<EventBoardList posts={posts} />} />
        <Route path="/news/event/write" element={<PostWrite activeMenu="이벤트 게시판" boardType="event" refreshPosts={loadPosts} />} />
        <Route path="/news/event/:poNum" element={<EventBoardDetail />} />

        {/* 🚩 뉴스레터 독립 경로 및 boardType 설정 완료 */}
        <Route path="/news/newsletter" element={<NewsLetterList posts={posts} />} />
        <Route path="/news/newsletter/write" element={<PostWrite activeMenu="뉴스레터" boardType="newsletter" refreshPosts={loadPosts} />} />
        <Route path="/news/newsletter/:poNum" element={<NewsLetterDetail />} />

        <Route path="/mypage" element={<MyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<OpenLoginModal openLogin={openLogin} />} />
        <Route path="/signup" element={<OpenSignupModal openSignup={openSignup} />} />
        
        <Route path="/community/*" element={<CommunityContainer posts={posts} loadPosts={loadPosts} loading={loading} />} />
        
        <Route path="/news/notice" element={<NewsNotice />} />
        <Route path="/inquiry" element={<InquiryPage />} />
      </Route>
    </Routes>
  );
}

export default App;
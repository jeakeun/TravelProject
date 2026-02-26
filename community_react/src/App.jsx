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

// FAQ 컴포넌트 추가
import FAQList from './components/faq/FAQList';
import FAQDetail from './components/faq/FAQDetail';

import NoticeList from './components/notice/NoticeList';
import NoticeDetail from './components/notice/NoticeDetail';
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
  const [activeMenu, setActiveMenu] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const destinationMenu = useMemo(() => ({
    '국내여행': '/domestic',
    '해외여행': '/foreigncountry'
  }), []);

  const communityMenu = useMemo(() => ({
    '여행 추천 게시판': '/community/recommend',
    '자유 게시판': '/community/freeboard'
  }), []);

  const isDestinationGroup = location.pathname.startsWith('/domestic') || location.pathname.startsWith('/foreigncountry');
  const isCommunityGroup = location.pathname.startsWith('/community');

  const currentGroup = useMemo(() => {
    if (isDestinationGroup) return destinationMenu;
    if (isCommunityGroup) return communityMenu;
    return null;
  }, [isDestinationGroup, isCommunityGroup, destinationMenu, communityMenu]);

  useEffect(() => {
    if (currentGroup) {
      const foundMenu = Object.keys(currentGroup).find(key => {
        return location.pathname === currentGroup[key] || location.pathname.startsWith(currentGroup[key] + '/');
      });
      if (foundMenu) setActiveMenu(foundMenu);
    }
  }, [location.pathname, currentGroup]);

  if (!currentGroup) return <Outlet />; 
  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>로딩 중...</div>;

  return (
    <div className="container">
      <aside className="sidebar">
        <ul>
          {Object.keys(currentGroup).map(item => (
            <li 
              key={item} 
              className={activeMenu === item ? 'active' : ''} 
              onClick={() => navigate(currentGroup[item])}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">
        <Routes>
          {isDestinationGroup && (
            <>
              <Route path="/" element={
                location.pathname.startsWith('/domestic') 
                ? <MainList photos={[]} activeMenu="국내여행" goToDetail={(id) => navigate(`/community/domestic/${id}`)} />
                : <Main /> 
              } />
            </>
          )}

          {isCommunityGroup && (
            <>
              <Route path="recommend/write" element={<PostWrite activeMenu="여행 추천 게시판" boardType="recommend" refreshPosts={loadPosts} />} />
              <Route path="recommend/:id" element={<RecommendPostDetail />} />
              <Route path="recommend" element={<RecommendMain posts={posts} />} />

              <Route path="freeboard/write" element={<PostWrite activeMenu="자유 게시판" boardType="freeboard" refreshPosts={loadPosts} />} />
              <Route path="freeboard/:id" element={<FreeBoardDetail />} />
              <Route path="freeboard" element={<FreeBoard posts={posts} goToDetail={(id) => navigate(`/community/freeboard/${id}`)} />} />
              
              <Route path="write" element={<PostWrite activeMenu={activeMenu} boardType={activeMenu === '여행 추천 게시판' ? 'recommend' : 'freeboard'} refreshPosts={loadPosts} />} />
              
              <Route path="/" element={<Navigate to="freeboard" replace />} />
            </>
          )}
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
      else if (path.includes('faq')) endpoint = 'faq'; // 🚩 FAQ 엔드포인트 추가

      if (!endpoint) {
        setLoading(false);
        return;
      }

      const apiUrl = endpoint === 'recommend' 
        ? `/api/recommend/posts/all`
        : `/api/${endpoint}/posts`;

      const response = await axios.get(apiUrl);
      if (response.data && Array.isArray(response.data)) {
        const storageChange = localStorage.getItem('bookmark_changed');
        let syncData = null;
        if (storageChange) {
            try { syncData = JSON.parse(storageChange); } catch(e) {}
        }

        const cleanData = response.data.map(post => {
          const pId = post.poNum || post.po_num || post.postId;
          let isBookmarked = post.isBookmarked;
          
          if (syncData && Number(syncData.id) === Number(pId)) {
            isBookmarked = syncData.state ? 'Y' : 'N';
          }

          return {
            ...post,
            id: pId,
            isBookmarked: isBookmarked,
            authorNick: post.mbNickname || post.mb_nickname || post.mb_nick || post.mbNick || post.member?.mbNickname || post.member?.mb_nickname || `User ${post.poMbNum || post.po_mb_num}`
          };
        });
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
    const handleSync = (e) => {
      if (e.key === 'bookmark_changed') {
        const data = JSON.parse(e.newValue);
        setPosts(prev => prev.map(p => {
          if (Number(p.id) === Number(data.id)) {
            return { ...p, isBookmarked: data.state ? 'Y' : 'N' };
          }
          return p;
        }));
      }
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) return; 
    fetch("/auth/refresh", { method: "POST", credentials: "include" })
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
    fetch("/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
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
        
        <Route path="/domestic" element={<CommunityContainer posts={posts} loadPosts={loadPosts} loading={loading} />} />
        <Route path="/foreigncountry" element={<CommunityContainer posts={posts} loadPosts={loadPosts} loading={loading} />} />
        <Route path="/Domestic" element={<Navigate to="/domestic" replace />} />

        <Route path="/community/*" element={<CommunityContainer posts={posts} loadPosts={loadPosts} loading={loading} />} />

        <Route path="/news/event" element={<EventBoardList posts={posts} />} />
        <Route path="/news/event/write" element={<PostWrite activeMenu="이벤트 게시판" boardType="event" refreshPosts={loadPosts} />} />
        <Route path="/news/event/:poNum" element={<EventBoardDetail />} />

        <Route path="/news/newsletter" element={<NewsLetterList posts={posts} />} />
        <Route path="/news/newsletter/write" element={<PostWrite activeMenu="뉴스레터" boardType="newsletter" refreshPosts={loadPosts} />} />
        <Route path="/news/newsletter/:poNum" element={<NewsLetterDetail />} />

        {/* 🚩 FAQ(자주 묻는 질문) 라우트 추가 */}
        <Route path="/cscenter/faq" element={<FAQList posts={posts} />} />
        <Route path="/cscenter/faq/:poNum" element={<FAQDetail />} />

        <Route path="/mypage" element={<MyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<OpenLoginModal openLogin={openLogin} />} />
        <Route path="/signup" element={<OpenSignupModal openSignup={openSignup} />} />
        
        <Route path="/news/notice" element={<NoticeList posts={posts} />} />
        <Route path="/news/notice/:poNum" element={<NoticeDetail />} />
        <Route path="/inquiry" element={<InquiryPage />} />
      </Route>
    </Routes>
  );
}

export default App;
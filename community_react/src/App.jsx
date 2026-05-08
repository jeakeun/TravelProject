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

import NoticeList from './components/notice/NoticeList';
import NoticeDetail from './components/notice/NoticeDetail';

// FAQ 컴포넌트 임포트
import FAQList from './components/faq/FAQList';
import FAQDetail from './components/faq/FAQDetail';

import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import InquiryPage from './pages/InquiryPage';
import { getUserId } from './utils/user';

import Login from './auth/login';
import Signup from './auth/signup';
import FindPassword from './auth/FindPassword';
import ResetPassword from './auth/ResetPassword';
import ChangePassword from './auth/ChangePassword';

// API BASE URL 설정
const API_BASE_URL = "http://localhost:8080"; 

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

  const newsMenu = useMemo(() => ({
    '공지사항': '/news/notice',
    '이벤트': '/news/event',
    '뉴스레터': '/news/newsletter'
  }), []);

  const cscenterMenu = useMemo(() => ({
    '자주 묻는 질문': '/cscenter/faq',
    '1:1 문의': '/inquiry',
    '이용 가이드': '/cscenter/userguide'
  }), []);

  const isDestinationGroup = location.pathname.startsWith('/domestic') || location.pathname.startsWith('/foreigncountry');
  const isCommunityGroup = location.pathname.startsWith('/community');
  const isNewsGroup = location.pathname.startsWith('/news');
  const isCSGroup = location.pathname.startsWith('/cscenter');

  const currentGroup = useMemo(() => {
    if (isDestinationGroup) return destinationMenu;
    if (isCommunityGroup) return communityMenu;
    if (isNewsGroup) return newsMenu;
    if (isCSGroup) return cscenterMenu; 
    return null;
  }, [isDestinationGroup, isCommunityGroup, isNewsGroup, isCSGroup, destinationMenu, communityMenu, newsMenu, cscenterMenu]);

  useEffect(() => {
    if (currentGroup) {
      const foundMenu = Object.keys(currentGroup).find(key => {
        return location.pathname === currentGroup[key] || location.pathname.startsWith(currentGroup[key] + '/');
      });
      if (foundMenu) setActiveMenu(foundMenu);
    }
  }, [location.pathname, currentGroup]);

  if (!currentGroup) return <Outlet />; 
  
  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>데이터를 불러오는 중입니다...</div>;

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
            <Route path="/" element={
              location.pathname.startsWith('/domestic') 
              ? <MainList photos={[]} activeMenu="국내여행" goToDetail={(id) => navigate(`/community/domestic/${id}`)} />
              /* 🚩 [수정됨] 해외여행 경로일 때 MainList를 렌더링하도록 조건 추가 */
              : location.pathname.startsWith('/foreigncountry')
              ? <MainList photos={[]} activeMenu="해외여행" goToDetail={(id) => navigate(`/community/foreigncountry/${id}`)} />
              : <Main /> 
            } />
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

          {isNewsGroup && (
            <>
              <Route path="notice" element={<NoticeList posts={posts} goToDetail={(id) => navigate(`/news/notice/${id}`)} />} />
              <Route path="notice/:poNum" element={<NoticeDetail />} />
              <Route path="event" element={<EventBoardList posts={posts} />} />
              <Route path="event/write" element={<PostWrite activeMenu="이벤트 게시판" boardType="event" refreshPosts={loadPosts} />} />
              <Route path="event/:poNum" element={<EventBoardDetail />} />
              <Route path="newsletter" element={<NewsLetterList posts={posts} />} />
              <Route path="newsletter/write" element={<PostWrite activeMenu="뉴스레터" boardType="newsletter" refreshPosts={loadPosts} />} />
              <Route path="newsletter/:poNum" element={<NewsLetterDetail />} />
              <Route path="/" element={<Navigate to="notice" replace />} />
            </>
          )}

          {isCSGroup && (
            <>
              <Route path="faq" element={<FAQList posts={posts} goToDetail={(id) => navigate(`/cscenter/faq/${id}`)} />} />
              <Route path="faq/:id" element={<FAQDetail />} />
              <Route path="faq/write" element={<PostWrite activeMenu="자주 묻는 질문" boardType="faq" refreshPosts={loadPosts} />} />
              <Route path="userguide" element={<div className="user-guide-content" style={{padding: '20px'}}><h2>이용 가이드</h2><p></p></div>} />
              <Route path="/" element={<Navigate to="faq" replace />} />
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
  const [loading, setLoading] = useState(false); 
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

    let endpoint = ''; 
    if (path.includes('freeboard')) endpoint = 'freeboard';
    else if (path.includes('event')) endpoint = 'event';
    else if (path.includes('newsletter')) endpoint = 'newsletter';
    else if (path.includes('recommend')) endpoint = 'recommend';
    else if (path.includes('notice')) endpoint = 'notice';
    else if (path.includes('faq')) endpoint = 'faq';
    

    if (!endpoint) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const apiUrl = endpoint === 'recommend' 
        ? `${API_BASE_URL}/api/recommend` 
        : `${API_BASE_URL}/api/${endpoint}/posts`;

      const response = await axios.get(apiUrl);
      
      if (response.data && Array.isArray(response.data)) {
        const storageChange = localStorage.getItem('bookmark_changed');
        let syncData = null;
        if (storageChange) {
            try { syncData = JSON.parse(storageChange); } catch(e) {}
        }

        const cleanData = response.data.map(post => {
          const pId = post.poNum || post.po_num || post.postId || post.id;
          let isBookmarked = post.isBookmarked;
          
          if (syncData && Number(syncData.id) === Number(pId)) {
            isBookmarked = syncData.state ? 'Y' : 'N';
          }

          return {
            ...post,
            id: pId,
            isBookmarked: isBookmarked,
            authorNick: post.mbNickname || post.mb_nickname || post.mb_nick || post.mbNick || post.member?.mbNickname || post.member?.mb_nickname || `User ${post.poMbNum || post.po_mb_num || ''}`
          };
        });
        setPosts(cleanData);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(`${path} 데이터 로딩 실패:`, err.message);
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
    
    fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" })
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
    fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
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
        <Route path="/news/*" element={<CommunityContainer posts={posts} loadPosts={loadPosts} loading={loading} />} />

        {/* 🚩 고객센터(cscenter) 그룹 CommunityContainer 연결 */}
        <Route path="/cscenter/*" element={<CommunityContainer posts={posts} loadPosts={loadPosts} loading={loading} />} />

        <Route path="/mypage" element={<MyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<OpenLoginModal openLogin={openLogin} />} />
        <Route path="/signup" element={<OpenSignupModal openSignup={openSignup} />} />
        <Route path="/inquiry" element={<InquiryPage />} />
      </Route>
    </Routes>
  );
}

export default App;
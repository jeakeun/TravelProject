import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import axios from 'axios';

// 스타일 임포트
import "./pages/Main.css";
import './Appha.css';
import "./App.css";

// 컴포넌트 임포트
import Main from "./pages/Main";
import Header from "./components/Header"; 
import MainList from './components/MainList'; // MainList.js 로드
import PostWrite from './components/PostWrite';

// 네이게이션바
import NavigationBar from './pages/NavigationBar';

import FreeBoard from './components/freeboard/FreeBoardList'; 
import FreeBoardDetail from './components/freeboard/FreeBoardDetail';
import RecommendMain from './components/recommend/RecommendMain';
import RecommendPostDetail from './components/recommend/RecommendPostDetail'; 

import EventBoardList from './components/eventboard/EventBoardList'; 
import EventBoardDetail from './components/eventboard/EventBoardDetail'; 
import NewsLetterList from './components/newsletter/NewsLetterList';
import NewsLetterDetail from './components/newsletter/NewsLetterDetail';

import FAQList from './components/faq/FAQList';
import FAQDetail from './components/faq/FAQDetail';

import NoticeList from './components/notice/NoticeList';
import NoticeDetail from './components/notice/NoticeDetail';
import MyPage from './pages/MyPage';
import KakaoCallback from './pages/KakaoCallback';
import AdminPage from './pages/AdminPage';
import InquiryPage from './pages/InquiryPage';
import { getUserId, isAdmin, isAdminOrSubAdmin } from './utils/user';
import api from './api/axios';

// 🚩 RankingList 임포트 추가
import RankingList from './components/ranking/RankingList'; 

import Login from './auth/login';
import Signup from './auth/signup';
import FindPassword from './auth/FindPassword';
import ResetPassword from './auth/ResetPassword';
import ChangePassword from './auth/ChangePassword';

axios.defaults.withCredentials = true;

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

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

function GlobalLayout({ 
  showLogin, setShowLogin, showSignup, setShowSignup, openLogin, openSignup, 
  showFindPw, setShowFindPw, showResetPw, setShowResetPw, resetUserId, setResetUserId, 
  showChangePw, setShowChangePw, user, setUser, onLogin, onLogout, 
  currentLang, setCurrentLang, posts, loadPosts, openChangePassword, adminNewCounts, refreshAdminCounts 
}) {
  return (
    <div className="App">
      {/*
        GlobalLayout: 모든 페이지에서 공통으로 쓰는 "헤더/내비게이션/로그인/마이페이지/변경 비밀번호 모달" 레이어.
        Outlet으로 자식 라우트가 렌더될 때, user/refreshAdminCounts 같은 값을 전달한다.
      */}
      <Header 
        user={user} 
        onLogout={onLogout} 
        openLogin={openLogin} 
        openSignup={openSignup} 
        currentLang={currentLang} 
        setCurrentLang={setCurrentLang}
        adminNewCounts={adminNewCounts}
      />
      {/* 네비게이션바 컴포넌트 추가 */}
      <NavigationBar user={user}/>
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLogin={onLogin}
          onOpenSignup={openSignup}
          onOpenFindPw={() => { setShowLogin(false); setShowFindPw(true); }}
        />
      )}
      {showSignup && <Signup onClose={() => setShowSignup(false)} currentLang={currentLang} />}
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
        <Outlet context={{ user, setUser, setShowLogin, setShowSignup, onLogout, currentLang, setCurrentLang, posts, loadPosts, openChangePassword, refreshAdminCounts }} />
      </main>
    </div>
  );
}

function CommunityContainer({ posts, setPosts, loadPosts, loading }) {
  const [activeMenu, setActiveMenu] = useState('');
  // 🚩 [핵심 수정] 랭킹 리스트에서 클릭한 지역명을 저장할 상태 추가
  const [selectedArea, setSelectedArea] = useState('');
  
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

  const pathname = location.pathname.toLowerCase();
  const isDestinationGroup = pathname.startsWith('/domestic') || pathname.startsWith('/foreigncountry');
  const isCommunityGroup = pathname.startsWith('/community');

  const currentGroup = useMemo(() => {
    if (isDestinationGroup) return destinationMenu;
    if (isCommunityGroup) return communityMenu;
    return null;
  }, [isDestinationGroup, isCommunityGroup, destinationMenu, communityMenu]);

  useEffect(() => {
    if (currentGroup) {
      const foundMenu = Object.keys(currentGroup).find(key => {
        return pathname === currentGroup[key] || pathname.startsWith(currentGroup[key] + '/');
      });
      if (foundMenu) setActiveMenu(foundMenu);
      else setActiveMenu(Object.keys(currentGroup)[0] || '');
    }
  }, [pathname, currentGroup]);

  if (loading && !pathname.includes('/domestic') && !pathname.includes('/foreigncountry')) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>로딩 중...</div>;
  }

  if (!currentGroup) return <Outlet />; 

  return (
    <div className="container" style={{ display: 'flex', width: '100%' }}>
      <aside className="sidebar">
        <ul>
          {Object.keys(currentGroup).map(item => (
            <li 
              key={item} 
              className={activeMenu === item ? 'active' : ''} 
              onClick={() => {
                navigate(currentGroup[item]);
                setActiveMenu(item);
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content" style={{ flex: 1, padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: pathname.startsWith('/domestic') ? 'row' : 'column',
          gap: '20px',
          alignItems: 'flex-start'
        }}>
          
          <div style={{ flex: 1, width: '100%' }}>
            <Routes>
              <Route index element={
                pathname.startsWith('/domestic') 
                  ? <MainList photos={posts} setPhotos={setPosts} activeMenu="국내여행" onAreaClick={selectedArea} />
                  : <MainList photos={posts} setPhotos={setPosts} activeMenu="해외여행" goToDetail={(id) => navigate(`/community/freeboard/${id}`)} />
              } />

              <Route path="recommend" element={<RecommendMain posts={posts} />} />
              <Route path="recommend/write" element={<PostWrite activeMenu="여행 추천 게시판" boardType="recommend" refreshPosts={loadPosts} />} />
              <Route path="recommend/edit/:id" element={<PostWrite activeMenu="여행 추천 게시판" boardType="recommend" refreshPosts={loadPosts} isEdit={true} />} />
              <Route path="recommend/:id" element={<RecommendPostDetail />} />

              <Route path="freeboard" element={<FreeBoard posts={posts} goToDetail={(id) => navigate(`/community/freeboard/${id}`)} />} />
              <Route path="freeboard/write" element={<PostWrite activeMenu="자유 게시판" boardType="freeboard" refreshPosts={loadPosts} />} />
              <Route path="freeboard/edit/:id" element={<PostWrite activeMenu="자유 게시판" boardType="freeboard" refreshPosts={loadPosts} isEdit={true} />} />
              <Route path="freeboard/:id" element={<FreeBoardDetail />} />

              <Route path="write" element={<PostWrite activeMenu={activeMenu} boardType={activeMenu === '여행 추천 게시판' ? 'recommend' : 'freeboard'} refreshPosts={loadPosts} />} />

              <Route path="*" element={
                pathname.includes('/domestic') 
                  ? <MainList photos={posts} setPhotos={setPosts} activeMenu="국내여행" onAreaClick={selectedArea} />
                  : <MainList photos={posts} setPhotos={setPosts} activeMenu="해외여행" goToDetail={(id) => navigate(`/community/freeboard/${id}`)} />
              } />
            </Routes>
          </div>

          {/* 🚩 [수정] RankingList에 onAreaSelect 프롭스를 전달하여 상태를 업데이트하게 함 */}
          {pathname === '/domestic' && (
            <div className="ranking-sidebar">
              <RankingList onAreaSelect={(areaName) => setSelectedArea(areaName)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  const navigate = useNavigate(); 
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
    } catch { return null; }
  });
  const [adminNewCounts, setAdminNewCounts] = useState({ newInquiries: 0, newReports: 0 });

  const location = useLocation();

  /**
   * 관리자 알림 건수 리프레시 함수(공유)
   * - AdminPage에서 답변/처리 후 호출해 최신 건수로 갱신
   * - Header에서 `adminNewCounts`가 바뀌면 알림 패널이 표시/갱신됨
   */
  const refreshAdminCounts = useCallback(() => {
    if (!user || !isAdminOrSubAdmin(user)) return;
    api.get("/api/admin/notification-counts")
      .then((res) => {
        const d = res.data || {};
        setAdminNewCounts({
          newInquiries: Number(d.newInquiries) || 0,
          newReports: Number(d.newReports) || 0
        });
      })
      .catch(() => setAdminNewCounts({ newInquiries: 0, newReports: 0 }));
  }, [user]);

  // 🚩 수정됨: 데이터 갱신 로직 보완
  const loadPosts = useCallback(async () => {
    const path = location.pathname.toLowerCase();
    
    if (path.includes('/write') || path.includes('/edit') || path === '/domestic' || path === '/foreigncountry') {
        setLoading(false);
        return;
    }

    const pathParts = path.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const isActionPage = ['write', 'edit', 'login', 'signup'].includes(lastPart) || (lastPart && !isNaN(lastPart));
    
    if (isActionPage && path !== '/') {
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      let endpoint = ''; 
      
      if (path === '/') endpoint = 'recommend';
      else if (path.includes('freeboard')) endpoint = 'freeboard';
      else if (path.includes('event')) endpoint = 'event';
      else if (path.includes('newsletter')) endpoint = 'newsletter';
      else if (path.includes('recommend')) endpoint = 'recommend';
      else if (path.includes('faq')) endpoint = 'faq';
      else if (path.includes('notice')) endpoint = 'notice';

      if (!endpoint) {
        setLoading(false);
        return;
      }

      const apiUrl = endpoint === 'recommend' 
        ? `${API_BASE_URL}/api/recommend/posts/all`
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
          let isBookmarked = post.isBookmarked || post.is_bookmarked || post.bookmarked || 'N';
          if (syncData && Number(syncData.id) === Number(pId)) {
            isBookmarked = syncData.state ? 'Y' : 'N';
          }

          return {
            ...post,
            id: pId,
            isBookmarked: isBookmarked,
            poBoardType: endpoint,
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
      if (e.key === 'bookmark_changed' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          setPosts(prev => prev.map(p => {
            if (Number(p.id) === Number(data.id)) {
              return { ...p, isBookmarked: data.state ? 'Y' : 'N' };
            }
            return p;
          }));
        } catch(e) {}
      }
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setLoading(false);
      return;
    }

    /**
     * 앱 시작(초기 마운트) 시 자동 로그인 복구
     * - localStorage에 user가 없으면 refreshToken 쿠키로 POST `/auth/refresh`
     * - 서버가 새 accessToken + member를 내려주면 localStorage/state를 복구
     * - (쿠키가 없으면) 서버에서 401이 발생할 수 있으나, 동작 자체는 비로그인 유지로 정상 처리
     */
    const checkAuth = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const data = res.data;
        if (data?.member) {
          setUser(data.member);
          localStorage.setItem('user', JSON.stringify(data.member));
        }
        if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.warn("auth/refresh:", err.response?.status, err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!user || !isAdminOrSubAdmin(user)) {
      setAdminNewCounts({ newInquiries: 0, newReports: 0 });
      return;
    }

    /**
     * 관리자 알림(헤더 패널) 갱신
     * - ADMIN/SUB_ADMIN 로그인 시 `/api/admin/notification-counts` 호출
     * - 헤더에 "미답변 문의/미처리 신고" 건수 표시
     * - refreshAdminCounts에서 동일 엔드포인트를 재조회
     */
    api.get("/api/admin/notification-counts")
      .then((res) => {
        const d = res.data || {};
        setAdminNewCounts({
          newInquiries: Number(d.newInquiries) || 0,
          newReports: Number(d.newReports) || 0
        });
      })
      .catch(() => setAdminNewCounts({ newInquiries: 0, newReports: 0 }));
  }, [user]);

  const handleLogin = useCallback((userData) => {
    /**
     * 로그인 성공 처리(서버 → 프론트 상태 동기화)
     * - userData.member: 사용자 정보
     * - userData.accessToken: 요청 인증에 사용할 토큰
     * - state(user) + localStorage를 갱신한 뒤 로그인 모달을 닫음
     */
    const member = userData?.member ?? userData;
    const accessToken = userData?.accessToken;
    setUser(member);
    localStorage.setItem('user', JSON.stringify(member));
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    /**
     * 로그아웃 처리
     * - 프론트 state/user/localStorage 삭제
     * - refreshToken 쿠키를 서버에서 삭제하기 위해 POST `/auth/logout` 호출
     * - 실패하더라도(네트워크 등) 최소한 로컬 상태는 해제하도록 예외를 삼킴
     */
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
  }, []);

  const openLogin = useCallback(() => {
    setShowSignup(false); setShowFindPw(false); setShowResetPw(false); setShowLogin(true);
  }, []);

  const openSignup = useCallback(() => {
    setShowLogin(false); setShowFindPw(false); setShowResetPw(false); setShowSignup(true);
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
          adminNewCounts={adminNewCounts}
          refreshAdminCounts={refreshAdminCounts}
        />
      }>
        <Route path="/" element={<Main />} />
        
        <Route path="/domestic/*" element={<CommunityContainer posts={posts} setPosts={setPosts} loadPosts={loadPosts} loading={loading} />} />
        <Route path="/foreigncountry/*" element={<CommunityContainer posts={posts} setPosts={setPosts} loadPosts={loadPosts} loading={loading} />} />
        <Route path="/community/*" element={<CommunityContainer posts={posts} setPosts={setPosts} loadPosts={loadPosts} loading={loading} />} />

        <Route path="/news/event" element={<EventBoardList posts={posts} />} />
        <Route path="/news/event/write" element={<PostWrite activeMenu="이벤트 게시판" boardType="event" refreshPosts={loadPosts} />} />
        <Route path="/news/event/:poNum" element={<EventBoardDetail />} />

        <Route path="/news/newsletter" element={<NewsLetterList posts={posts} />} />
        <Route path="/news/newsletter/write" element={<PostWrite activeMenu="뉴스레터" boardType="newsletter" refreshPosts={loadPosts} />} />
        <Route path="/news/newsletter/:poNum" element={<NewsLetterDetail />} />

        <Route path="/cscenter/faq" element={<FAQList posts={posts} />} />
        <Route path="/cscenter/faq/write" element={<PostWrite activeMenu="자주 묻는 질문" boardType="faq" refreshPosts={loadPosts} />} />
        <Route path="/cscenter/faq/posts/:id" element={<FAQDetail />} />
        <Route path="/cscenter/faq/edit/:id" element={<PostWrite activeMenu="자주 묻는 질문" boardType="faq" refreshPosts={loadPosts} isEdit={true} />} />

        <Route path="/kakao-callback" element={<KakaoCallback />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<OpenLoginModal openLogin={openLogin} />} />
        <Route path="/signup" element={<OpenSignupModal openSignup={openSignup} />} />
        
        <Route path="/news/notice" element={<NoticeList posts={posts} goToDetail={(id) => navigate(`/news/notice/${id}`)} />} />
        <Route path="/news/notice/write" element={<PostWrite activeMenu="공지사항" boardType="notice" refreshPosts={loadPosts} />} />
        <Route path="/news/notice/edit/:id" element={<PostWrite activeMenu="공지사항" boardType="notice" refreshPosts={loadPosts} isEdit={true} />} />
        <Route path="/news/notice/:poNum" element={<NoticeDetail />} />
        <Route path="/inquiry" element={<InquiryPage />} />
      </Route>
    </Routes>
  );
}

export default App;
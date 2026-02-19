import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Link, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

// 스타일 임포트
import "./pages/Main.css";
import './Appha.css';

// 페이지 및 컴포넌트 임포트
import Main from "./pages/Main";
import MainList from './components/MainList';
import PostWrite from './components/PostWrite';
import PostDetail from './pages/PostDetail';
import FreeBoard from './pages/FreeBoard';
import RecommendMain from './components/recommend/RecommendMain';

// 🚩 로그인/회원가입 컴포넌트가 따로 있다면 임포트하세요. 
// 없다면 우선 빈 페이지로 연결되도록 아래에 임시 컴포넌트를 만들었습니다.
const Login = () => <div style={{padding: "100px"}}>로그인 페이지 준비 중</div>;
const Signup = () => <div style={{padding: "100px"}}>회원가입 페이지 준비 중</div>;

/**
 * 1. 전역 레이아웃 (커뮤니티 등 서브 페이지용 상단바)
 */
function GlobalLayout() {
  return (
    <div className="App">
      <header className="global-header">
        <Link to="/" className="logo">TRAVEL</Link>
        <nav>
          <Link to="/destination">여행지</Link>
          <Link to="/community/recommend">추천</Link>
          <Link to="/community/freeboard">커뮤니티</Link>
          <Link to="/ranking">랭킹</Link>
        </nav>
        <div className="user-menu">
          <span>KR ▾</span>
          <Link to="/login">로그인</Link>
          <Link to="/signup">회원가입</Link>
        </div>
      </header>
      <main style={{ paddingTop: "70px", minHeight: "100vh" }}>
        <Outlet />
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
  return (
    <Routes>
      {/* 🚩 메인 페이지는 자체 상단바를 쓰므로 GlobalLayout 밖으로 뺍니다. */}
      <Route path="/" element={<Main />} />

      {/* 🚩 나머지 페이지들은 GlobalLayout(상단바)을 적용합니다. */}
      <Route element={<GlobalLayout />}>
        <Route path="/community/*" element={<CommunityContainer />} />
        <Route path="/login" element={<Login />} />   {/* 로그인 경로 추가 */}
        <Route path="/signup" element={<Signup />} /> {/* 회원가입 경로 추가 */}
      </Route>
    </Routes>
  );
}

export default App;
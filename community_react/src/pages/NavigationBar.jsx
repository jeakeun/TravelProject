import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getRecentViews } from '../utils/recentViews';
import './NavigationBar.css';

const NavigationBar = ({ user }) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // 서랍장 표시 여부 상태
  const [isVisible, setIsVisible] = useState(true); // 네비게이션바 표시 여부 상태
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const userId = user?.mbNum || user?.mb_num || user?.id || 'guest';
    const recent = getRecentViews(5, userId);
    setRecentPosts(recent);
  }, [user, location.pathname]);

  const getDetailPath = (post) => {
    const pId = post.poNum || post.id;
    if (post.boardType === 'freeboard') return `/community/freeboard/${pId}`;
    if (post.boardType === 'recommend') return `/community/recommend/${pId}`;
    if (post.boardType === 'notice') return `/news/notice/${pId}`;
    if (post.boardType === 'event') return `/news/event/${pId}`;
    if (post.boardType === 'newsletter') return `/news/newsletter/${pId}`;
    return `/community/freeboard/${pId}`;
  };

  const navItems = [
    { id: 1, name: '인기 명소', icon: '⛰️', url: '/domestic', isExternal: false },
    { id: 2, name: '날씨 정보', icon: '🌤️', url: 'https://weather.naver.com/', isExternal: true },
    { id: 3, name: '환율 계산', icon: '💵', url: 'https://search.naver.com/search.naver?query=환율', isExternal: true },
    { id: 4, name: '여행 게시판', icon: '🗒️', url: '/community/recommend', isExternal: false },
    { id: 5, name: '고객 센터', icon: '💬', url: '/cscenter/faq', isExternal: false }
  ];

  // 🚩 네비게이션바가 숨겨진 상태일 때 보여줄 간이 버튼
  if (!isVisible) {
    return (
      <button className="side-nav-open-btn" onClick={() => setIsVisible(true)}>
        <span>펼치기</span>
        <span className="open-icon">▶</span>
      </button>
    );
  }

  return (
    <nav className="side-nav-rect">
      <div className="side-nav-title" onClick={scrollToTop}>
        TOP ▲
      </div>
      
      <ul className="side-nav-list-rect">
        {navItems.map((item) => (
          <li key={item.id} className="side-nav-item-rect">
            {item.isExternal ? (
              <a href={item.url} className="side-nav-btn-rect" target="_blank" rel="noopener noreferrer">
                <span className="icon-rect">{item.icon}</span>
                <span className="text-rect">{item.name}</span>
              </a>
            ) : (
              <Link to={item.url} className="side-nav-btn-rect">
                <span className="icon-rect">{item.icon}</span>
                <span className="text-rect">{item.name}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
      
      <div className="side-nav-footer-rect">
        <div className="recent-drawer-container">
          <button 
            className="side-nav-btn-rect drawer-toggle-btn"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          >
            <span className="icon-rect">🕒</span>
            <span className="text-rect">최근 본 글</span>
          </button>

          {isDrawerOpen && (
            <div className="recent-drawer-panel">
              <div className="drawer-header">
                <span>최근 본 게시물</span>
                <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>✖</button>
              </div>
              <ul className="drawer-list">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post, idx) => (
                    <li key={idx}>
                      <Link to={getDetailPath(post)} className="drawer-item-link" onClick={() => setIsDrawerOpen(false)}>
                        {post.poTitle || "제목 없음"}
                      </Link>
                    </li>
                  ))
                ) : (
                  <div className="drawer-empty">최근 본 글이 없습니다.</div>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* 🚩 숨김 버튼 추가 */}
        <button className="side-nav-hide-btn" onClick={() => { setIsVisible(false); setIsDrawerOpen(false); }}>
          숨기기 ◀
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getRecentViews } from '../utils/recentViews'; 
import './NavigationBar.css';

const NavigationBar = ({ user }) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const location = useLocation();
  
  // 🚩 서랍장 열림/닫힘 상태를 관리하는 스위치
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      const userId = user.mbNum || user.mb_num || user.id;
      // 서랍장이니까 넉넉하게 5개까지 가져와도 됩니다.
      const recent = getRecentViews(5, userId); 
      setRecentPosts(recent);
    } else {
      setRecentPosts([]);
    }
  }, [user, location.pathname]);

  const navItems = [
    { id: 1, name: '인기 명소', icon: '⛰️', url: '/domestic', isExternal: false },
    { id: 2, name: '날씨 정보', icon: '🌤️', url: 'https://weather.naver.com/', isExternal: true },
    { id: 3, name: '환율 계산', icon: '💵', url: 'https://search.naver.com/...', isExternal: true },
    { id: 4, name: '여행 게시판', icon: '🗒️', url: '/community/recommend', isExternal: false }, 
    { id: 5, name: '고객 센터', icon: '💬', url: '/cscenter/faq', isExternal: false }
  ];

  const getDetailPath = (post) => {
    if (post.boardType === 'freeboard') return `/community/freeboard/${post.poNum}`;
    if (post.boardType === 'recommend') return `/community/recommend/${post.poNum}`;
    if (post.boardType === 'notice') return `/news/notice/${post.poNum}`;
    return `/community/freeboard/${post.poNum}`; 
  };

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
      
      {/*  하단 서랍장 영역 시작 */}
      <div className="side-nav-footer-rect">
        <div className="recent-drawer-container">
          {/* 최근 본 글 버튼 */}
          <button 
            className="side-nav-btn-rect drawer-toggle-btn"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          >
            <span className="icon-rect">🕒</span>
            <span className="text-rect">최근 본 글</span>
          </button>

          {/* 서랍장 패널 (isDrawerOpen이 true일 때만 화면에 보임) */}
          {isDrawerOpen && (
            <div className="recent-drawer-panel">
              <div className="drawer-header">
                <span>최근 본 게시물</span>
                <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>✖</button>
              </div>
              
              {recentPosts.length > 0 ? (
                <ul className="drawer-list">
                  {recentPosts.map((post, idx) => (
                    <li key={idx}>
                      <Link 
                        to={getDetailPath(post)} 
                        onClick={() => setIsDrawerOpen(false)} // 클릭 시 서랍장 닫기
                        className="drawer-item-link"
                      >
                        {post.poTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="drawer-empty">최근 본 글이 없습니다.</div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* 🚩 하단 서랍장 영역 끝 */}
    </nav>
  );
};

export default NavigationBar;
import React from 'react';
import { Link} from "react-router-dom";
import './NavigationBar.css';

const NavigationBar = () => {

    const scrollToTop = () => {
      window.scrollTo({
        top:0,
        behavior: 'smooth' // 스크롤이 부드럽게 되도록 사용
      });
    };

    const navItems = [
    /* 1. 인기 명소: /domestic 경로 적용 */
    { id: 1, name: '인기 명소', icon: '⛰️', url: '/domestic', isExternal: false },
    /* 2. 날씨 정보: 외부 링크 (새 탭) */
    { id: 2, name: '날씨 정보', icon: '🌤️', url: 'https://weather.naver.com/', isExternal: true },
    /* 3. 환율 계산: 외부 링크 (새 탭) */
    { id: 3, name: '환율 계산', icon: '💵', url: 'https://search.naver.com/search.naver?query=환율', isExternal: true },
    /* 4. 여행 게시판: /community/recommend 경로 적용 */
    { id: 4, name: '여행 게시판', icon: '🗒️', url: '/community/recommend', isExternal: false },
    /* 5. 고객 센터: /cscenter/faq 경로 적용 */
    { id: 5, name: '고객 센터', icon: '💬', url: '/cscenter/faq', isExternal: false }
  ];


  return (
    <nav className="side-nav-rect">
      <div 
        className="side-nav-title" 
        onClick={scrollToTop}
        style={{cursor: 'pointer'}}
        >
          TOP ▲
        </div>
      <ul className="side-nav-list-rect">
        {navItems.map((item) => (
          <li key={item.id} className="side-nav-item-rect">
            {item.isExternal ? (
              /* 외부 링크를 가기위해 a태그 사용 */
              <a 
                href={item.url}
                className="side-nav-btn-rect"
                target="_blank"  /* 외부 링크를 가기위해 새 탭에서 열기 */
                rel="noopener noreferrer" /* 보안 및 성능을 위한 필수 설정 */
              >
                  <span className="icon-rect">{item.icon}</span>
                  <span className="text-rect">{item.name}</span>
              </a>
            ) : (
              /* 내부 링크는 Link를 사용해서 현재 페이지에서 부드럽게 이동 */
              <Link to={item.url} className="side-nav-btn-rect">
                <span className="icon-rect">{item.icon}</span>
                <span className="text-rect">{item.name}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
      {/* 와이어프레임 하단 사각형 3개 */}
      <div className="side-nav-footer-rect">
        <div className="square-box"></div>
        <div className="square-box"></div>
        <div className="square-box"></div>
      </div>
    </nav>
  );
};

export default NavigationBar;
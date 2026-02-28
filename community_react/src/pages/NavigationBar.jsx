import React from 'react';
import './NavigationBar.css';

const NavigationBar = () => {
  const navItems = [
    { id: 1, name: '인기 명소', icon: '⛰️' },
    { id: 2, name: '날씨 정보', icon: '🌤️' },
    { id: 3, name: '환율 계산', icon: '💵' },
    { id: 4, name: '여행 게시판', icon: '🗒️' },
    { id: 5, name: '고객 센터', icon: '💬' }
  ];

  return (
    <nav className="side-nav-rect">
      <div className="side-nav-title">MENU</div>
      <ul className="side-nav-list-rect">
        {navItems.map((item) => (
          <li key={item.id} className="side-nav-item-rect">
            <button className="side-nav-btn-rect">
              <span className="icon-rect">{item.icon}</span>
              <span className="text-rect">{item.name}</span>
            </button>
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
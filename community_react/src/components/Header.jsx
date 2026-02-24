import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNickname, isAdmin } from "../utils/user";
import ProfileImage from "./ProfileImage";

const translations = {
  KR: {
    nav_news: "새소식", nav_dest: "여행지", nav_board: "여행게시판", nav_cs: "고객센터", nav_mypage: "마이페이지", nav_admin: "관리자페이지",
    dest_domestic: "국내여행", dest_overseas: "해외여행",
    user_login: "로그인", user_signup: "회원가입",
    menu_news_title: "새소식", news_notice: "공지사항", news_event: "이벤트", news_letter: "뉴스레터",
    menu_board_title: "여행게시판", board_rec: "여행 추천게시판", board_free: "자유게시판", board_map: "여행지도",
    menu_cs_title: "고객센터", cs_faq: "자주 묻는 질문", cs_inquiry: "1:1 문의", cs_guide: "이용 가이드",
  },
  EN: {
    nav_news: "News", nav_dest: "Destination", nav_board: "Board", nav_cs: "CS", nav_mypage: "My Page", nav_admin: "Admin",
    dest_domestic: "Domestic", dest_overseas: "Overseas",
    user_login: "Login", user_signup: "Sign Up",
    menu_news_title: "News", news_notice: "Notice", news_event: "Event", news_letter: "Newsletter",
    menu_board_title: "Travel Board", board_rec: "Recommendation", board_free: "Free Board", board_map: "Travel Map",
    menu_cs_title: "Customer Center", cs_faq: "FAQ", cs_inquiry: "1:1 Inquiry", cs_guide: "Guide",
  },
  JP: {
    nav_news: "ニュース", nav_dest: "旅行先", nav_board: "掲示板", nav_cs: "サポート", nav_mypage: "マイページ", nav_admin: "管理者",
    dest_domestic: "国内", dest_overseas: "海外",
    user_login: "ログイン", user_signup: "会員登録",
    menu_news_title: "ニュース", news_notice: "お知らせ", news_event: "イベント", news_letter: "ニュースレター",
    menu_board_title: "旅行掲示板", board_rec: "おすすめ掲示板", board_free: "自由掲示板", board_map: "旅行地図",
    menu_cs_title: "カスタ머센터", cs_faq: "よくある質問", cs_inquiry: "1:1 お問い合わせ", cs_guide: "利用ガイド",
  },
  CH: {
    nav_news: "新消息", nav_dest: "目的地", nav_board: "旅游论坛", nav_cs: "客服中心", nav_mypage: "个人主页", nav_admin: "管理员",
    dest_domestic: "国内", dest_overseas: "海外",
    user_login: "登录", user_signup: "注册",
    menu_news_title: "新消息", news_notice: "公告事项", news_event: "活动详情", news_letter: "新闻邮件",
    menu_board_title: "旅游论坛", board_rec: "推荐论坛", board_free: "自由论坛", board_map: "旅游地图",
    menu_cs_title: "客服中心", cs_faq: "常见问题", cs_inquiry: "1:1 咨询", cs_guide: "使用指南",
  }
};

function Header({ user, onLogout, openLogin, openSignup, currentLang, setCurrentLang }) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const t = translations[currentLang] || translations["KR"];

  return (
    <div className="nav-area">
      <header>
        <Link to="/" className="logo">TRAVEL</Link>

        <div className="nav-and-mega">
          <div className="nav-mega-inner">
            <nav>
              <ul className="nav-list">
                <li className="nav-item"><Link to="/">{t.nav_news}</Link></li>
                <li className="nav-item"><span className="nav-item-trigger">{t.nav_dest}</span></li>
                <li className="nav-item"><Link to="/community/recommend">{t.nav_board}</Link></li>
                <li className="nav-item"><Link to="/">{t.nav_cs}</Link></li>
              </ul>
            </nav>
            <div className="mega-menu-content">
              <div className="menu-column">
                <ul>
                  <li><Link to="/news/notice">{t.news_notice}</Link></li>
                  <li><Link to="/news/event">{t.news_event}</Link></li>
                  <li><Link to="/news/newsletter">{t.news_letter}</Link></li>
                </ul>
              </div>
              <div className="menu-column">
                <ul>
                  <li>
                    <Link to="/domestic">
                      {t.dest_domestic}
                    </Link>
                  </li>
                  <li>
                    <Link to="/foreigncountry">
                      {t.dest_overseas}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="menu-column">
                <ul>
                  <li><Link to="/community/recommend">{t.board_rec}</Link></li>
                  <li><Link to="/community/freeboard">{t.board_free}</Link></li>
                  <li><Link to="/community/map">{t.board_map}</Link></li>
                </ul>
              </div>
              <div className="menu-column">
                <ul>
                  <li><Link to="/">{t.cs_faq}</Link></li>
                  <li><Link to="/inquiry">{t.cs_inquiry}</Link></li>
                  <li><Link to="/">{t.cs_guide}</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mega-menu-wrapper" aria-hidden="true"></div>
        </div>

        <div className="user-menu">
          <div
            className={`lang-selector notranslate ${isLangOpen ? 'is-open' : ''}`}
            onClick={() => setIsLangOpen(!isLangOpen)}
            onMouseEnter={() => setIsLangOpen(true)}
            onMouseLeave={() => setIsLangOpen(false)}
          >
            <span className="current-lang" translate="no">
              {currentLang} <span className="lang-arrow">▾</span>
            </span>

            {isLangOpen && (
              <ul className="lang-dropdown">
                <li className={currentLang === "KR" ? "active" : ""} onClick={() => { setCurrentLang("KR"); setIsLangOpen(false); }}>한국어 (KR)</li>
                <li className={currentLang === "EN" ? "active" : ""} onClick={() => { setCurrentLang("EN"); setIsLangOpen(false); }}>English (EN)</li>
                <li className={currentLang === "JP" ? "active" : ""} onClick={() => { setCurrentLang("JP"); setIsLangOpen(false); }}>日本語 (JP)</li>
                <li className={currentLang === "CH" ? "active" : ""} onClick={() => { setCurrentLang("CH"); setIsLangOpen(false); }}>中国语 (CH)</li>
              </ul>
            )}
          </div>

          {user ? (
            <>
              <div
                className={`user-name-wrap ${isUserMenuOpen ? 'is-open' : ''}`}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
                role="button"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <ProfileImage user={user} className="header-profile-photo" alt="프로필" />
                <span className="menu-link user-name-text">{getNickname(user)}님</span>
                <span className="user-name-arrow">▾</span>
                {isUserMenuOpen && (
                  <ul className="user-dropdown" onClick={(e) => e.stopPropagation()}>
                    <li><Link to="/mypage" onClick={() => setIsUserMenuOpen(false)} className={location.pathname === "/mypage" ? "active" : ""}>{t.nav_mypage}</Link></li>
                    {isAdmin(user) && (
                      <li><Link to="/admin" className={location.pathname.startsWith("/admin") ? "active" : ""} onClick={() => setIsUserMenuOpen(false)}>{t.nav_admin}</Link></li>
                    )}
                  </ul>
                )}
              </div>
              <span
                className="menu-link"
                style={{ cursor: "pointer" }}
                onClick={() => onLogout && onLogout()}
              >
                로그아웃
              </span>
            </>
          ) : (
            <>
              <span
                className="menu-link"
                style={{ cursor: "pointer" }}
                onClick={() => openLogin?.()}
              >
                {t.user_login}
              </span>
              <span
                className="menu-link"
                style={{ cursor: "pointer" }}
                onClick={() => openSignup?.()}
              >
                {t.user_signup}
              </span>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;
import React, { useState } from "react";
import { Link } from "react-router-dom";

const translations = {
  KR: {
    nav_news: "새소식", nav_board: "여행게시판", nav_cs: "고객센터", nav_mypage: "마이페이지", nav_admin: "관리자페이지",
    user_login: "로그인", user_signup: "회원가입",
    menu_news_title: "새소식", news_notice: "공지사항", news_event: "이벤트", news_letter: "뉴스레터",
    menu_board_title: "여행게시판", board_rec: "여행 추천게시판", board_review: "여행 후기 게시판", board_free: "자유게시판", board_qna: "여행지도", // 🚩 '질문/답변'에서 '여행지도'로 변경
    menu_cs_title: "고객센터", cs_faq: "자주 묻는 질문", cs_inquiry: "1:1 문의", cs_guide: "이용 가이드",
    promo_title: "지금 가장 인기있는 여행지", promo_desc: "실시간으로 가장 많이 검색되고 있는 여행지들을 확인해보세요.",
  },
  EN: {
    nav_news: "News", nav_board: "Board", nav_cs: "CS", nav_mypage: "My Page", nav_admin: "Admin",
    user_login: "Login", user_signup: "Sign Up",
    menu_news_title: "News", news_notice: "Notice", news_event: "Event", news_letter: "Newsletter",
    menu_board_title: "Travel Board", board_rec: "Recommendation", board_review: "Review", board_free: "Free Board", board_qna: "Travel Map",
    menu_cs_title: "Customer Center", cs_faq: "FAQ", cs_inquiry: "1:1 Inquiry", cs_guide: "Guide",
    promo_title: "Trending Now", promo_desc: "Check out the most searched destinations in real-time.",
  },
  JP: {
    nav_news: "ニュース", nav_board: "掲示板", nav_cs: "サポート", nav_mypage: "マイページ", nav_admin: "管理者",
    user_login: "ログイン", user_signup: "会員登録",
    menu_news_title: "ニュース", news_notice: "お知らせ", news_event: "イベント", news_letter: "ニュースレター",
    menu_board_title: "旅行掲示板", board_rec: "おすすめ掲示板", board_review: "レビュー掲示板", board_free: "自由掲示板", board_qna: "旅行地図",
    menu_cs_title: "カスタ머센터", cs_faq: "よくある質問", cs_inquiry: "1:1 お問い合わせ", cs_guide: "利用ガイド",
    promo_title: "今、最も人気の旅行先", promo_desc: "リアルタイムで最も検索されている旅行先を確認してください。",
  },
  CH: {
    nav_news: "新消息", nav_board: "旅游论坛", nav_cs: "客服中心", nav_mypage: "个人主页", nav_admin: "管理员",
    user_login: "登录", user_signup: "注册",
    menu_news_title: "新消息", news_notice: "公告事项", news_event: "活动详情", news_letter: "新闻邮件",
    menu_board_title: "旅游论坛", board_rec: "推荐论坛", board_review: "游记回顾", board_free: "自由论坛", board_qna: "旅游地图",
    menu_cs_title: "客服中心", cs_faq: "常见问题", cs_inquiry: "1:1 咨询", cs_guide: "使用指南",
    promo_title: "现在最热门的目的地", promo_desc: "查看实时搜索量最高的旅游目的地。",
  }
};

function Header({ user, onLogout, setShowLogin, setShowSignup, currentLang, setCurrentLang }) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = translations[currentLang] || translations["KR"];

  return (
    <div className="nav-area">
      <header>
        <Link to="/" className="logo">TRAVEL</Link>
        <nav>
          <ul className="nav-list">
            <li className="nav-item"><Link to="/">{t.nav_news}</Link></li>
            {/* 🚩 상단 여행게시판 클릭 시 기본적으로 추천게시판으로 이동하도록 수정 */}
            <li className="nav-item"><Link to="/community/recommend">{t.nav_board}</Link></li>
            <li className="nav-item"><Link to="/">{t.nav_cs}</Link></li>
            <li className="nav-item"><Link to="/">{t.nav_mypage}</Link></li>
            <li className="nav-item"><Link to="/">{t.nav_admin}</Link></li>
          </ul>
        </nav>

        <div className="user-menu">
          {/* 번역 방지 클래스(notranslate) 추가 */}
          <div className="lang-selector notranslate" onClick={() => setIsLangOpen(!isLangOpen)}>
            <span className="current-lang" translate="no">{currentLang} ▾</span>
            {isLangOpen && (
              <ul className="lang-dropdown">
                <li onClick={() => {setCurrentLang("KR"); setIsLangOpen(false);}}>한국어 (KR)</li>
                <li onClick={() => {setCurrentLang("EN"); setIsLangOpen(false);}}>English (EN)</li>
                <li onClick={() => {setCurrentLang("JP"); setIsLangOpen(false);}}>日本語 (JP)</li>
                <li onClick={() => {setCurrentLang("CH"); setIsLangOpen(false);}}>中国语 (CH)</li>
              </ul>
            )}
          </div>
          {user ? (
            <>
              <span className="menu-link">{user.mb_Uid}님</span>
              <span className="menu-link" style={{ cursor: "pointer" }} onClick={() => onLogout && onLogout()}>로그아웃</span>
            </>
          ) : (
            <>
              <span className="menu-link" style={{ cursor: "pointer" }} onClick={() => setShowLogin && setShowLogin(true)}>{t.user_login}</span>
              <span className="menu-link" style={{ cursor: "pointer" }} onClick={() => setShowSignup && setShowSignup(true)}>{t.user_signup}</span>
            </>
          )}
        </div>
      </header>

      {/* ===== 메가 메뉴 ===== */}
      <div className="mega-menu-wrapper">
        <div className="mega-menu-content">
          <div className="menu-column">
            <h3>{t.menu_news_title}</h3>
            <ul>
              <li><Link to="/newsNotice">{t.news_notice}</Link></li>
              <li><Link to="/">{t.news_event}</Link></li>
              <li><Link to="/">{t.news_letter}</Link></li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>{t.menu_board_title}</h3>
            <ul>
              {/* 🚩 요청하신 주소들로 모두 수정 완료 */}
              <li><Link to="/community/recommend">{t.board_rec}</Link></li>
              <li><Link to="/community/reviewboard">{t.board_review}</Link></li>
              <li><Link to="/community/freeboard">{t.board_free}</Link></li>
              <li><Link to="/community/map">{t.board_qna}</Link></li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>{t.menu_cs_title}</h3>
            <ul>
              <li><Link to="/">{t.cs_faq}</Link></li>
              <li><Link to="/">{t.cs_inquiry}</Link></li>
              <li><Link to="/">{t.cs_guide}</Link></li>
            </ul>
          </div>
          <div className="menu-promo">
            <h4>{t.promo_title}</h4>
            <p>{t.promo_desc}</p>
            <div className="promo-tag">
              <span>#발리</span> <span>#아이슬란드</span> <span>#교토</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
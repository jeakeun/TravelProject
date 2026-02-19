import React, { useState, useEffect } from "react";
import "./style.css"; 
import "./Main.css";
import { Link } from "react-router-dom";

function Main() {
  // 1. 상태 관리
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("KR");
  const [carouselIndex, setCarouselIndex] = useState(0); // 카러셀 순서 제어용

 // 2. 다국어 데이터 (KR, EN, JP, CH 전체 포함)
  const translations = {
    KR: {
      nav_news: "새소식", nav_board: "여행게시판", nav_cs: "고객센터", nav_mypage: "마이페이지", nav_admin: "관리자페이지",
      user_login: "로그인", user_signup: "회원가입",
      menu_news_title: "새소식", news_notice: "공지사항", news_event: "이벤트", news_letter: "뉴스레터",
      menu_board_title: "여행게시판", board_rec: "여행 추천게시판", board_review: "여행 후기 게시판", board_free: "자유게시판", board_qna: "질문/답변",
      menu_cs_title: "고객센터", cs_faq: "자주 묻는 질문", cs_inquiry: "1:1 문의", cs_guide: "이용 가이드",
      promo_title: "지금 가장 인기있는 여행지", promo_desc: "실시간으로 가장 많이 검색되고 있는 여행지들을 확인해보세요.",
      rank_main_title: "이달의 여행지 랭킹",
      dest1_name: "01. 발리, 인도네시아", dest1_desc: "신들의 섬에서 즐기는 완벽한 휴양",
      dest2_name: "02. 아이슬란드", dest2_desc: "대자연의 경이로움, 오로라 헌팅",
      dest3_name: "03. 교토, 일본", dest3_desc: "전통과 현대가 공존하는 고요한 도시"
    },
    EN: {
      nav_news: "News", nav_board: "Board", nav_cs: "CS", nav_mypage: "My Page", nav_admin: "Admin",
      user_login: "Login", user_signup: "Sign Up",
      menu_news_title: "News", news_notice: "Notice", news_event: "Event", news_letter: "Newsletter",
      menu_board_title: "Travel Board", board_rec: "Recommendation", board_review: "Review", board_free: "Free Board", board_qna: "Q&A",
      menu_cs_title: "Customer Center", cs_faq: "FAQ", cs_inquiry: "1:1 Inquiry", cs_guide: "Guide",
      promo_title: "Trending Now", promo_desc: "Check out the most searched destinations in real-time.",
      rank_main_title: "Monthly Rankings",
      dest1_name: "01. Bali, Indonesia", dest1_desc: "Perfect relaxation in the Island of the Gods",
      dest2_name: "02. Iceland", dest2_desc: "Wonder of nature, Aurora hunting",
      dest3_name: "03. Kyoto, Japan", dest3_desc: "Quiet city where tradition meets modernity"
    },
    JP: {
      nav_news: "ニュース", nav_board: "掲示板", nav_cs: "サポート", nav_mypage: "マイページ", nav_admin: "管理者",
      user_login: "ログイン", user_signup: "会員登録",
      menu_news_title: "ニュース", news_notice: "お知らせ", news_event: "イベント", news_letter: "ニュースレター",
      menu_board_title: "旅行掲示板", board_rec: "おすすめ掲示板", board_review: "レビュー掲示板", board_free: "自由掲示板", board_qna: "Q&A",
      menu_cs_title: "カスタマーセンター", cs_faq: "よくある質問", cs_inquiry: "1:1 お問い合わせ", cs_guide: "利用ガイド",
      promo_title: "今、最も人気の旅行先", promo_desc: "リアルタイムで最も検索されている旅行先を確認してください。",
      rank_main_title: "今月の旅行先ランキング",
      dest1_name: "01. バリ、インドネシア", dest1_desc: "神々の島で楽しむ完璧な休息",
      dest2_name: "02. アイスランド", dest2_desc: "大自然の驚異、オーロラハンティング",
      dest3_name: "03. 京都、日本", dest3_desc: "伝統と現代が共存する静かな都市"
    },
    CH: {
      nav_news: "新消息", nav_board: "旅游论坛", nav_cs: "客服中心", nav_mypage: "个人主页", nav_admin: "管理员",
      user_login: "登录", user_signup: "注册",
      menu_news_title: "新消息", news_notice: "公告事项", news_event: "活动详情", news_letter: "新闻邮件",
      menu_board_title: "旅游论坛", board_rec: "推荐论坛", board_review: "游记回顾", board_free: "自由论坛", board_qna: "问题解答",
      menu_cs_title: "客服中心", cs_faq: "常见问题", cs_inquiry: "1:1 咨询", cs_guide: "使用指南",
      promo_title: "现在最热门的目的地", promo_desc: "查看实时搜索量最高的旅游目的地。",
      rank_main_title: "本月目的地排名",
      dest1_name: "01. 巴厘岛，印度尼西亚", dest1_desc: "在众神之岛享受完美的休闲",
      dest2_name: "02. 冰岛", dest2_desc: "大自然的惊奇，极光狩猎",
      dest3_name: "03. 京都，日本", dest3_desc: "传统与现代共存的宁静城市"
    }
  };
  const t = translations[currentLang] || translations["KR"];

  // 3. 카러셀 로직 (버튼 클릭 시 인덱스 변경)
  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));

  // 4. 스크롤 이벤트
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 카러셀 클래스 결정 함수
  const getCarouselClass = (idx) => {
    if (idx === carouselIndex) return "carousel-item active";
    if (idx === (carouselIndex + 1) % 3) return "carousel-item next";
    return "carousel-item prev";
  };

  return (
    <div className="main-container">
      {/* ===== 헤더 ===== */}
      <header>
        <Link to="/" className="logo">TRAVEL</Link>
        <nav>
          <ul className="nav-list">
            <li className="nav-item"><Link to="/">{t.nav_news}</Link></li>
            <li className="nav-item"><Link to="/destination">{t.nav_board}</Link></li>
            <li className="nav-item"><Link to="/">{t.nav_cs}</Link></li>
            <li className="nav-item"><Link to="/">{t.nav_mypage}</Link></li>
            <li className="nav-item"><Link to="/">{t.nav_admin}</Link></li>
          </ul>
        </nav>

        <div className="user-menu">
          <div className="lang-selector" onClick={() => setIsLangOpen(!isLangOpen)}>
            <span className="current-lang">{currentLang} ▾</span>
            {isLangOpen && (
              <ul className="lang-dropdown">
                <li onClick={() => setCurrentLang("KR")}>한국어 (KR)</li>
                <li onClick={() => setCurrentLang("EN")}>English (EN)</li>
                
              </ul>
            )}
          </div>
          <Link to="/login" className="menu-link">{t.user_login}</Link>
          <Link to="/signup" className="menu-link">{t.user_signup}</Link>
        </div>
      </header>

      {/* ===== 메가 메뉴 (헤더 호버 시 보임) ===== */}
      <div className="mega-menu-wrapper">
        <div className="mega-menu-content">
          <div className="menu-column">
            <h3>{t.menu_news_title}</h3>
            <ul>
              <li><Link to="/">{t.news_notice}</Link></li>
              <li><Link to="/">{t.news_event}</Link></li>
              <li><Link to="/">{t.news_letter}</Link></li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>{t.menu_board_title}</h3>
            <ul>
              <li><Link to="/destination">{t.board_rec}</Link></li>
              <li><Link to="/">{t.board_review}</Link></li>
              <li><Link to="/">{t.board_free}</Link></li>
              <li><Link to="/">{t.board_qna}</Link></li>
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

      {/* ===== 메인 비디오 ===== */}
      <section id="main-video">
        <iframe src="https://www.youtube.com/embed/1La4QzGeaaQ?autoplay=1&mute=1&controls=0&loop=1&playlist=1La4QzGeaaQ" frameBorder="0" allow="autoplay; fullscreen" title="video"></iframe>
        <div className="scroll-down">⬇</div>
      </section>

      {/* ===== 랭킹 카러셀 ===== */}
      <section id="ranking">
        <h2>{t.rank_main_title}</h2>
        <div className="carousel-container">
          <div className="carousel-wrapper">
            <div className={getCarouselClass(0)}>
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" alt="" />
              <div className="item-info">
                <h3>{t.dest1_name}</h3>
                <p>{t.dest1_desc}</p>
              </div>
            </div>
            <div className={getCarouselClass(1)}>
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" alt="" />
              <div className="item-info">
                <h3>{t.dest2_name}</h3>
                <p>{t.dest2_desc}</p>
              </div>
            </div>
            <div className={getCarouselClass(2)}>
              <img src="https://images.unsplash.com/photo-1493558103817-58b2924bce98" alt="" />
              <div className="item-info">
                <h3>{t.dest3_name}</h3>
                <p>{t.dest3_desc}</p>
              </div>
            </div>
          </div>
          <button className="carousel-btn prev-btn" onClick={handlePrev}>❮</button>
          <button className="carousel-btn next-btn" onClick={handleNext}>❯</button>
        </div>
      </section>

      <footer>© 2026 Travel Recommendation</footer>
    </div>
  );
}

export default Main;
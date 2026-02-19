import React, { useState, useEffect } from "react";
import "./Main.css";
import { Link, useOutletContext } from "react-router-dom";
import Header from "../components/Header";

const carouselTranslations = {
  KR: {
    rank_main_title: "이달의 여행지 랭킹",
    dest1_name: "01. 발리, 인도네시아", dest1_desc: "신들의 섬에서 즐기는 완벽한 휴양",
    dest2_name: "02. 아이슬란드", dest2_desc: "대자연의 경이로움, 오로라 헌팅",
    dest3_name: "03. 교토, 일본", dest3_desc: "전통과 현대가 공존하는 고요한 도시"
  },
  EN: {
    rank_main_title: "Monthly Rankings",
    dest1_name: "01. Bali, Indonesia", dest1_desc: "Perfect relaxation in the Island of the Gods",
    dest2_name: "02. Iceland", dest2_desc: "Wonder of nature, Aurora hunting",
    dest3_name: "03. Kyoto, Japan", dest3_desc: "Quiet city where tradition meets modernity"
  },
  JP: {
    rank_main_title: "今月の旅行先ランキング",
    dest1_name: "01. バリ、インドネシア", dest1_desc: "神々の島で楽しむ完璧な休息",
    dest2_name: "02. アイスランド", dest2_desc: "大自然の驚異、オーロラハンティング",
    dest3_name: "03. 京都、日本", dest3_desc: "伝統と現代が共存する静かな都市"
  },
  CH: {
    rank_main_title: "本月目的地排名",
    dest1_name: "01. 巴厘岛，印度尼西亚", dest1_desc: "在众神之岛享受完美的休闲",
    dest2_name: "02. 冰岛", dest2_desc: "大自然的惊奇，极光狩猎",
    dest3_name: "03. 京都，日本", dest3_desc: "传统与现代共存的宁静城市"
  }
};

function Main() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const outletContext = useOutletContext() || {};
  const { user, setShowLogin, setShowSignup, onLogout, currentLang, setCurrentLang } = outletContext;

  const t = carouselTranslations[currentLang] || carouselTranslations["KR"];

  // 3. 카러셀 로직
  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));

  // 4. 스크롤 이벤트 (헤더 투명도 조절)
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCarouselClass = (idx) => {
    if (idx === carouselIndex) return "carousel-item active";
    if (idx === (carouselIndex + 1) % 3) return "carousel-item next";
    return "carousel-item prev";
  };

  return (
    <div className="main-container">
      {/* ===== 네비게이션 영역 (헤더 + 메가메뉴) ===== */}
      <Header
        user={user}
        onLogout={onLogout}
        setShowLogin={setShowLogin}
        setShowSignup={setShowSignup}
        currentLang={currentLang || "KR"}
        setCurrentLang={setCurrentLang}
      />

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
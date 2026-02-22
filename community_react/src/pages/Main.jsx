import React, { useState, useEffect, useMemo } from "react";
import "./Main.css";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
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
    dest3_name: "03. 京都，日本", dest3_desc: "传统与现代共存의 宁静城市"
  }
};

function Main() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  // 🚩 context에서 posts 데이터를 가져옵니다.
  const { user, setShowLogin, setShowSignup, onLogout, currentLang, setCurrentLang, posts = [] } = outletContext;

  const t = carouselTranslations[currentLang] || carouselTranslations["KR"];
  const SERVER_URL = "http://localhost:8080";

  // 🚩 [데이터 로직] 추천 게시판 1,2,3위 추출 (조회수 기준 정렬)
  const topThree = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    return [...posts]
      .sort((a, b) => (b.poView || 0) - (a.poView || 0))
      .slice(0, 3);
  }, [posts]);

  // 🚩 [이미지 로직] RecommendMain과 동일한 이미지 추출 함수
  const getImageUrl = (post) => {
    const defaultImg = "https://placehold.co/1200x800?text=No+Image";
    if (!post) return defaultImg;
    const { poImg, fileName, fileUrl, image, poContent } = post;
    const targetUrl = poImg || fileName || fileUrl || image;

    if (targetUrl && targetUrl !== "" && String(targetUrl) !== "null") {
      if (String(targetUrl).startsWith('http') || String(targetUrl).startsWith('data:')) return targetUrl;
      const extractedName = String(targetUrl).split(/[\\/]/).pop();
      return `${SERVER_URL}/pic/${extractedName}`;
    }
    if (poContent && typeof poContent === 'string') {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
      const match = poContent.match(imgRegex);
      if (match && match[1]) return match[1];
    }
    return defaultImg; 
  };

  // 3. 카러셀 로직
  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));

  // 4. 스크롤 이벤트 (헤더 투명도 조절)
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) { // null 체크 추가
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }
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
            {/* 🚩 실시간 데이터 1~3위 렌더링 */}
            {[0, 1, 2].map((idx) => {
              const post = topThree[idx];
              return (
                <div 
                  key={idx} 
                  className={getCarouselClass(idx)}
                  onClick={() => post && navigate(`/community/recommend/${post.poNum}`)}
                  style={{ cursor: post ? 'pointer' : 'default' }}
                >
                  <img src={getImageUrl(post)} alt={post?.poTitle || "Ranking"} />
                  <div className="item-info">
                    {/* 데이터가 있으면 실제 제목/내용 표시, 없으면 기본 번역 텍스트 표시 */}
                    <h3>{post ? `0${idx + 1}. ${post.poTitle}` : t[`dest${idx + 1}_name`]}</h3>
                    <p>
                      {post 
                        ? (post.poContent?.replace(/<[^>]*>?/gm, '').substring(0, 40) + "...") 
                        : t[`dest${idx + 1}_desc`]}
                    </p>
                  </div>
                </div>
              );
            })}
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
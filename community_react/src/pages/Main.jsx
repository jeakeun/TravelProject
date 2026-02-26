import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./Main.css";
import { useOutletContext, useNavigate } from "react-router-dom";

// 🚩 불필요한 더미 여행지 문구를 제거하고 제목만 남겼습니다.
const carouselTranslations = {
  KR: { rank_main_title: "이달의 여행지 랭킹" },
  EN: { rank_main_title: "Monthly Rankings" },
  JP: { rank_main_title: "今月の旅行先ランキング" },
  CH: { rank_main_title: "本月目的地排名" }
};

function Main() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  
  const { currentLang, posts = [] } = outletContext;

  const t = carouselTranslations[currentLang] || carouselTranslations["KR"];
  const SERVER_URL = "";

  // 🚩 [데이터 로직] DB 점수 기준 1~3위 추출
  const topThree = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    return posts.slice(0, 3);
  }, [posts]);

  // 🚩 [이미지 로직] 게시글 이미지 가져오기
  const getImageUrl = (post) => {
    const defaultImg = "https://placehold.co/1200x800?text=No+Image";
    if (!post) return defaultImg;
    
    const targetUrl = post.poImg || post.po_img || post.fileName || post.fileUrl || post.image;

    if (targetUrl && targetUrl !== "" && String(targetUrl) !== "null") {
      if (String(targetUrl).startsWith('http') || String(targetUrl).startsWith('data:')) return targetUrl;
      const firstFile = String(targetUrl).split(',')[0].trim();
      const extractedName = firstFile.split(/[\\/]/).pop();
      return `${SERVER_URL}/pic/${extractedName}`;
    }

    const content = post.poContent || post.po_content;
    if (content && typeof content === 'string') {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
      const match = content.match(imgRegex);
      if (match && match[1]) return match[1];
    }
    
    return defaultImg; 
  };

  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));

  useEffect(() => {
    const header = document.querySelector('.App .nav-area header');
    if (!header) return;
    const handleScroll = () => {
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

  const scrollToRanking = useCallback(() => {
    const el = document.getElementById("ranking");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div className="main-container">
      {/* ===== 메인 비디오 ===== */}
      <section id="main-video">
        <iframe 
          src="https://www.youtube.com/embed/1La4QzGeaaQ?autoplay=1&mute=1&controls=0&loop=1&playlist=1La4QzGeaaQ" 
          frameBorder="0" 
          allow="autoplay; fullscreen" 
          title="video"
        ></iframe>
        <button type="button" className="scroll-down" onClick={scrollToRanking} aria-label="두 번째 화면으로">
          <span className="scroll-down-arrow">⬇</span>
        </button>
      </section>

      {/* ===== 랭킹 카러셀 ===== */}
      <section id="ranking">
        <h2>{t.rank_main_title}</h2>
        <div className="carousel-outer">
          <button type="button" className="carousel-btn prev-btn" onClick={handlePrev} aria-label="이전">❮</button>
          <div className="carousel-container">
            <div className="carousel-wrapper">
              {[0, 1, 2].map((idx) => {
                const post = topThree[idx];
                // 🚩 데이터가 있을 때만 렌더링하도록 조건부 처리
                if (!post) return <div key={idx} className={getCarouselClass(idx)}></div>;

                const postId = post.poNum || post.po_num || post.postId;
                const displayTitle = post.poTitle || post.po_title;
                const displayContent = (post.poContent || post.po_content || "")
                  .replace(/<[^>]*>?/gm, '') // HTML 태그 제거
                  .substring(0, 40) + "...";

                return (
                  <div 
                    key={postId || idx} 
                    className={getCarouselClass(idx)}
                    onClick={() => navigate(`/community/recommend/${postId}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* 🚩 랭킹 배지 추가 (No.1, No.2, No.3) */}
                    <span className="rank-badge">No.{idx + 1}</span>

                    <img 
                      src={getImageUrl(post)} 
                      alt={displayTitle} 
                      onError={(e) => { e.target.src = "https://placehold.co/1200x800?text=No+Image"; }}
                    />
                    <div className="item-info">
                      <h3>0{idx + 1}. {displayTitle}</h3>
                      <p>{displayContent}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button type="button" className="carousel-btn next-btn" onClick={handleNext} aria-label="다음">❯</button>
        </div>
      </section>

      <footer>© 2026 Travel Recommendation</footer>
    </div>
  );
}

export default Main;
import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./Main.css";
import { useOutletContext, useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";

const carouselTranslations = {
  KR: {
    rank_main_title: "이달의 여행지 랭킹",
    dest1_name: "01. 여행지 정보 없음", dest1_desc: "추천 게시글이 없습니다.",
    dest2_name: "02. 여행지 정보 없음", dest2_desc: "추천 게시글이 없습니다.",
    dest3_name: "03. 여행지 정보 없음", dest3_desc: "추천 게시글이 없습니다."
  },
  EN: {
    rank_main_title: "Monthly Rankings",
    dest1_name: "01. No Info", dest1_desc: "No recommended posts.",
    dest2_name: "02. No Info", dest2_desc: "No recommended posts.",
    dest3_name: "03. No Info", dest3_desc: "No recommended posts."
  },
  JP: {
    rank_main_title: "今月の旅行先ランキング",
    dest1_name: "01. 情報なし", dest1_desc: "おすすめの投稿がありません。",
    dest2_name: "02. 정보 없음", dest2_desc: "おすすめ의 게시글이 없습니다.",
    dest3_name: "03. 정보 없음", dest3_desc: "おすすめ의 게시글이 없습니다."
  },
  CH: {
    rank_main_title: "本月目的地排名",
    dest1_name: "01. 无信息", dest1_desc: "暂无推荐帖子。",
    dest2_name: "02. 无信息", dest2_desc: "暂无推荐帖子。",
    dest3_name: "03. 无信息", dest3_desc: "暂无推荐帖子。"
  }
};

function Main() {
  const [carouselIndex, setCarouselIndex] = useState(1); // 중앙 1위
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  
  // outletContext에서 posts와 currentLang을 가져옵니다.
  const { currentLang, posts = [] } = outletContext;
  const t = carouselTranslations[currentLang] || carouselTranslations["KR"];
  const SERVER_URL = "";

  // 🚩 [데이터 로직] 서버에서 이미 계산되어 내려온 순서를 유지하며 recommend 데이터 상위 3개 추출
  const topThree = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    
    // 1. recommend 게시판 데이터만 필터링 (poBoardType이나 엔드포인트에서 구분된 데이터 기반)
    // 서버 응답 데이터 구조에 맞게 'recommend' 게시글만 필터링합니다.
    const recommendPosts = posts.filter(p => 
      p.poBoardType === 'recommend' || 
      p.boardType === 'recommend' || 
      p.category === 'recommend'
    );

    // 2. 서버에서 랭킹순으로 보내주므로 별도 sort 없이 상위 3개만 선택
    return recommendPosts.slice(0, 3);
  }, [posts]);

  // 🚩 [이미지 로직] DB 필드 대응 및 첫 번째 이미지 추출
  const getImageUrl = (post) => {
    const defaultImg = "https://placehold.co/1200x800?text=No+Image";
    if (!post) return defaultImg;
    
    // DB 컬럼명 po_img 또는 poImg 대응
    const targetUrl = post.poImg || post.po_img || post.fileName;

    if (targetUrl && targetUrl !== "" && String(targetUrl) !== "null") {
      if (String(targetUrl).startsWith('http') || String(targetUrl).startsWith('data:')) return targetUrl;
      const firstFile = String(targetUrl).split(',')[0].trim();
      const extractedName = firstFile.split(/[\\/]/).pop();
      return `${SERVER_URL}/pic/${extractedName}`;
    }
    if (post.poContent && typeof post.poContent === 'string') {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
      const match = post.poContent.match(imgRegex);
      if (match && match[1]) return match[1];
    }
    return defaultImg; 
  };

  // 카러셀 제어 로직
  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));

  // 스크롤 시 헤더 스타일 변경 이벤트
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

  const scrollToRanking = useCallback(() => {
    const el = document.getElementById("ranking");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div className="main-container">
      {/* 네이게이션바 */}
      <NavigationBar />
      {/* ===== 메인 비디오 섹션 ===== */}
      <section id="main-video">
        <iframe 
          src="https://www.youtube.com/embed/1La4QzGeaaQ?autoplay=1&mute=1&controls=0&loop=1&playlist=1La4QzGeaaQ" 
          frameBorder="0" 
          allow="autoplay; fullscreen" 
          title="video"
        ></iframe>
        <button type="button" className="scroll-down" onClick={scrollToRanking} aria-label="랭킹으로 이동">
          <span className="scroll-down-arrow">⬇</span>
        </button>
      </section>

      <section id="ranking">
        <h2>{t.rank_main_title}</h2>
        <div className="carousel-outer">
          <button type="button" className="carousel-btn prev-btn" onClick={handlePrev} aria-label="이전">❮</button>
          <div className="carousel-container">
            <div className="carousel-wrapper">
              {topThree.map((post, idx) => {
                const postId = post?.poNum || post?.po_num || post?.id;
                const displayTitle = post?.poTitle || post?.po_title || t[`dest${idx + 1}_name`];
                const rankNumber = getRankNumber(idx);

                return (
                  <div 
                    key={idx} 
                    className={getCarouselClass(idx)}
                    // 🚩 클릭 시 상세페이지로 이동: /community/recommend/:id
                    onClick={() => post && navigate(`/community/recommend/${postId}`)}
                    style={{ cursor: post ? 'pointer' : 'default' }}
                  >
                    <img 
                      src={getImageUrl(post)} 
                      alt={displayTitle} 
                      onError={(e) => { e.target.src = "https://placehold.co/1200x800?text=No+Image"; }}
                    />
                    <div className="item-info">
                      <h3>{post ? `0${rankNumber}. ${displayTitle}` : displayTitle}</h3>
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
          </div>
          <button type="button" className="carousel-btn next-btn" onClick={handleNext} aria-label="다음">❯</button>
        </div>
      </section>

      <footer>© 2026 Travel Recommendation</footer>
    </div>
  );
}

export default Main;
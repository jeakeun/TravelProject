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
    dest2_name: "02. 情報なし", dest2_desc: "おすすめの投稿がありません。",
    dest3_name: "03. 情報なし", dest3_desc: "おすすめの投稿がありません。"
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
  
  const { currentLang, posts = [] } = outletContext;
  const t = carouselTranslations[currentLang] || carouselTranslations["KR"];
  const SERVER_URL = "";

  // 🔹 topThree 순서: 2위-1위-3위
  const topThree = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    const recommendPosts = posts.filter(p => 
      p.poBoardType === 'recommend' || 
      p.boardType === 'recommend' || 
      p.category === 'recommend'
    ).slice(0, 3);

    if (recommendPosts.length === 3) {
      return [recommendPosts[1], recommendPosts[0], recommendPosts[2]]; // 2위-1위-3위
    }
    return recommendPosts;
  }, [posts]);

  const getImageUrl = (post) => {
    const defaultImg = "https://placehold.co/1200x800?text=No+Image";
    if (!post) return defaultImg;
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

  const handlePrev = () => setCarouselIndex((prev) => (prev === 0 ? 2 : prev - 1));
  const handleNext = () => setCarouselIndex((prev) => (prev === 2 ? 0 : prev + 1));

  // 🔹 CSS 클래스 배치 그대로 유지
  const getCarouselClass = (idx) => {
    if (idx === carouselIndex) return "carousel-item active";
    const prevIdx = (carouselIndex + 1) % 3;
    if (idx === prevIdx) return "carousel-item prev";
    return "carousel-item next";
  };

  // 🔹 화면 위치 기준 실제 순위 번호
  const getRankNumber = (idx) => {
    if (idx === carouselIndex) return 1; // 중앙 1위
    if (idx === (carouselIndex + 1) % 3) return 2; // 왼쪽(prev) 2위
    return 3; // 오른쪽(next) 3위
  };

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
      <NavigationBar />
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
import React from 'react';

const RecommendCard = ({ post, isMain, rank, onClick, getImageUrl, onBookmarkToggle }) => {
    if (!post) return null;

    // 🚩 자동 배포 환경을 위한 서버 URL 설정 (환경 변수 우선 사용)
    const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    // 🚩 ID 추출: poNum을 우선순위로 사용
    const postId = post.poNum || post.po_num || post.postId;

    // 🚩 [중요] 백엔드 대응: 게시판 타입 결정 (추천 게시판이므로 기본값 'recommend')
    const boardType = post.boardType || 'recommend';

    // 🚩 필드명 대응
    const displayTitle = post.poTitle || post.po_title || "제목 없음";
    
    // 🚩 닉네임 판별 로직: mbNickname 필드 최우선 적용
    const displayNick = post.mbNickname || post.mb_nickname || post.mb_nick || post.mbNick || 
                        post.member?.mbNickname || post.member?.mb_nickname || post.member?.mbNick || 
                        `User ${post.poMbNum || post.po_mb_num || "Unknown"}`;

    const displayLikes = post.poUp || post.po_up || 0;
    const displayViews = post.poView || post.po_view || 0;
    const displayComments = post.commentCount || post.co_count || 0;
    
    // 🚩 즐겨찾기 상태 판별 (다양한 백엔드 응답 형태 대응)
    const isBookmarked = 
        post.isBookmarkedByMe === true || 
        post.isBookmarked === 'Y' || 
        post.isBookmarked === true || 
        post.favorited === true;

    // 🚩 즐겨찾기 클릭 핸들러
    const handleBookmarkClick = (e) => {
        e.stopPropagation(); // 카드 상세 페이지 이동 방지
        e.preventDefault();  // 기본 동작 방지
        
        const toggleFn = onBookmarkToggle || post.onBookmarkToggle;
        
        if (typeof toggleFn === 'function') {
            toggleFn(postId, boardType); 
        } else {
            console.error("onBookmarkToggle 함수가 전달되지 않았습니다.");
        }
    };

    // 🚩 [수정] 노란 줄 방지: SERVER_URL을 실제 경로 판단 로직에 활용
    const finalImageUrl = (() => {
        const url = getImageUrl(post);
        // 기본 이미지이거나 이미 완성된 URL(http...)인 경우 그대로 반환
        if (url.includes('placehold.co') || url.startsWith('http')) return url;
        // 상대 경로인 경우 SERVER_URL과 결합 (노란 줄 제거용)
        return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    })();

    return (
        <div 
            className={isMain ? "featured-post" : "recommend-sub-card"} 
            onClick={() => onClick(postId)}
        >
            <div className={isMain ? "main-img-box" : "sub-card-img-box"}>
                <span className={`rank-badge ${!isMain ? 'small' : ''}`}>
                    No.{rank}
                </span>
                <img 
                    src={finalImageUrl} 
                    alt={displayTitle} 
                    onError={(e) => { 
                        if (e.target.src !== "https://placehold.co/600x400?text=No+Image") {
                            e.target.src = "https://placehold.co/600x400?text=No+Image"; 
                        }
                    }}
                />
            </div>

            <div className={isMain ? "featured-info" : "sub-card-body"}>
                <h2 className="card-title">{displayTitle}</h2>
                
                <div className="post-info-row">
                    <span className="post-user">{displayNick}</span>
                    <div className="post-icons">
                        <span className="stat-icon heart">❤️ {displayLikes}</span>
                        
                        {/* 🚩 별 버튼 영역 */}
                        <span 
                            className={`stat-icon bookmark ${isBookmarked ? 'active' : ''}`}
                            onClick={handleBookmarkClick}
                            title="즐겨찾기"
                            style={{ 
                                cursor: 'pointer', 
                                color: isBookmarked ? '#f1c40f' : '#ccc',
                                transition: 'all 0.2s ease',
                                fontSize: '1.2em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0 4px'
                            }}
                        >
                            {isBookmarked ? '★' : '☆'}
                        </span>
                        
                        <span className="stat-icon comment">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            {displayComments}
                        </span>
                        
                        <span className="stat-icon view">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {displayViews}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendCard;
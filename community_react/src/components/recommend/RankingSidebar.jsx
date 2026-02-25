import React from 'react';

const RankingSidebar = ({ ranking, startRank, onDetail, getImageUrl, onBookmarkToggle }) => {
    return (
        <aside className="ranking-section">
            <h3 className="ranking-title">실시간 추천 랭킹</h3>
            <div className="rank-list">
                {ranking.map((post, idx) => {
                    // 🚩 ID 추출 로직 유지
                    const postId = post.poNum || post.po_num || post.postId;
                    
                    // 🚩 즐겨찾기 상태 판별 로직 유지
                    const isBookmarked = 
                        post.isBookmarkedByMe === true || 
                        post.isBookmarked === 'Y' || 
                        post.isBookmarked === true || 
                        post.favorited === true;

                    // 🚩 [수정] 즐겨찾기 버튼 클릭 핸들러
                    const handleBookmarkClick = (e) => {
                        e.stopPropagation(); // 상세 페이지 이동 방지
                        e.preventDefault();
                        
                        // 부모(RecommendMain)로부터 전달받은 함수 실행
                        if (typeof onBookmarkToggle === 'function') {
                            onBookmarkToggle(postId, post); 
                        }
                    };

                    return (
                        <div key={postId || idx} className="rank-item" onClick={() => onDetail(postId)}>
                            <div className="rank-thumb-box">
                                <img 
                                    className="rank-thumb" 
                                    src={getImageUrl(post)} 
                                    alt="" 
                                    onError={(e) => { e.target.src = "https://placehold.co/100x100?text=No+Img"; }}
                                />
                            </div>
                            
                            <div className="rank-info">
                                <p className="rank-title">{post.poTitle || post.po_title || "제목 없음"}</p>
                                <div className="rank-meta" style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="rank-num-badge">{startRank + idx}</span>
                                    
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                        {/* 추천수(하트) */}
                                        <span className="rank-likes" style={{ fontSize: '0.9em' }}>
                                            ❤️ {post.poUp || post.po_up || 0}
                                        </span>
                                        
                                        {/* 🚩 즐겨찾기 별 버튼 (기능 연결됨) */}
                                        <span 
                                            className="rank-bookmarks" 
                                            onClick={handleBookmarkClick}
                                            style={{ 
                                                cursor: 'pointer', 
                                                marginLeft: '8px',
                                                color: isBookmarked ? '#f1c40f' : '#ccc',
                                                fontSize: '1.1em',
                                                transition: 'color 0.2s'
                                            }}
                                        >
                                            {isBookmarked ? '★' : '☆'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default RankingSidebar;
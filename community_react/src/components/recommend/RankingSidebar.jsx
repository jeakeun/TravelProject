import React from 'react';

const RankingSidebar = ({ ranking, startRank, onDetail, getImageUrl, onBookmarkToggle }) => {
    // 🚩 [수정] 환경 변수가 있으면 사용하고, 없으면 로컬 백엔드 기본 포트(8080)를 사용합니다.
    // AWS 배포 환경에서는 .env 파일의 REACT_APP_API_URL을 따라가고, 로컬에선 8080으로 자동 설정됩니다.
    const SERVER_URL = process.env.REACT_APP_API_URL || "";

    return (
        <aside className="ranking-section">
            <h3 className="ranking-title">실시간 추천 랭킹</h3>
            <div className="rank-list">
                {ranking.map((post, idx) => {
                    const postId = post.poNum || post.po_num || post.postId;
                    
                    const isBookmarked = 
                        post.isBookmarkedByMe === true || 
                        post.isBookmarked === 'Y' || 
                        post.isBookmarked === true || 
                        post.favorited === true;

                    const handleBookmarkClick = (e) => {
                        e.stopPropagation(); 
                        e.preventDefault();
                        
                        if (typeof onBookmarkToggle === 'function') {
                            onBookmarkToggle(postId, post); 
                        }
                    };

                    // 🚩 [수정] 이미지 경로 로직 최적화
                    const finalImageUrl = (() => {
                        const url = getImageUrl(post);
                        // 이미 풀 경로(http)이거나 플레이스홀더인 경우 그대로 반환
                        if (url.includes('placehold.co') || url.startsWith('http')) return url;
                        
                        // SERVER_URL이 있고 url이 /로 시작하지 않는 경우 중간에 / 추가
                        // 주소가 http://example.com/pic/... 형태가 되도록 보정
                        const separator = url.startsWith('/') ? '' : '/';
                        return `${SERVER_URL}${separator}${url}`;
                    })();

                    return (
                        <div key={postId || idx} className="rank-item" onClick={() => onDetail(postId)}>
                            <div className="rank-thumb-box">
                                <img 
                                    className="rank-thumb" 
                                    src={finalImageUrl} 
                                    alt="" 
                                    onError={(e) => { 
                                        if (e.target.src !== "https://placehold.co/100x100?text=No+Img") {
                                            e.target.src = "https://placehold.co/100x100?text=No+Img"; 
                                        }
                                    }}
                                />
                            </div>
                            
                            <div className="rank-info">
                                <p className="rank-title">{post.poTitle || post.po_title || "제목 없음"}</p>
                                <div className="rank-meta" style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="rank-num-badge">{startRank + idx}</span>
                                    
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                        <span className="rank-likes" style={{ fontSize: '0.9em' }}>
                                            ❤️ {post.poUp || post.po_up || 0}
                                        </span>
                                        
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
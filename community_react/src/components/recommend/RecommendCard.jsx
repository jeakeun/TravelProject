import React from 'react';

const RecommendCard = ({ post, isMain, rank, onClick, getImageUrl }) => {
    if (!post) return null;

    // 🚩 [유지] 데이터 구조에 따라 poNum 또는 postId 중 존재하는 값을 ID로 사용
    const postId = post.poNum || post.postId;

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
                    // 🚩 [핵심 수정] poImg 필드 하나만 보내는 대신 post 객체 전체를 전달합니다.
                    // 이를 통해 getImageUrl 내부에 새로 추가한 '본문(poContent) 이미지 추출 로직'이 작동하게 됩니다.
                    src={getImageUrl(post)} 
                    alt={post.poTitle} 
                    onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                />
            </div>

            <div className={isMain ? "featured-info" : "sub-card-body"}>
                {/* 🚩 제목만 출력 (요청사항 유지) */}
                <h2 className="card-title">{post.poTitle}</h2>
                
                {/* 🚩 내용(poContent) 출력 부분 삭제 유지 */}
                
                <div className="post-info-row">
                    <span className="post-user">User {post.poMbNum}</span>
                    <div className="post-icons">
                        <span className="stat-icon heart">❤️ {post.poUp || 0}</span>
                        
                        <span className="stat-icon comment">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            {/* 🚩 백엔드에서 넘겨준 실제 댓글 개수 표시 */}
                            {post.commentCount || 0}
                        </span>
                        
                        <span className="stat-icon view">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {post.poView || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendCard;
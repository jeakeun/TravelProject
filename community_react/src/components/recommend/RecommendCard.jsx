import React from 'react';

const RecommendCard = ({ post, isMain, rank, onClick, getImageUrl }) => {
    if (!post) return null;

    return (
        <div 
            className={isMain ? "featured-post" : "recommend-sub-card"} 
            onClick={() => onClick(post.postId)}
        >
            {/* 🚩 이미지 영역 (배지가 이 안에 갇힙니다) */}
            <div className={isMain ? "main-img-box" : "sub-card-img-box"}>
                <span className={`rank-badge ${!isMain ? 'small' : ''}`}>
                    No.{rank}
                </span>
                <img 
                    src={getImageUrl(post.fileUrl)} 
                    alt={post.title} 
                    onError={(e) => e.target.src = "https://placehold.co"}
                />
            </div>

            {/* 🚩 텍스트 영역 */}
            <div className={isMain ? "featured-info" : "sub-card-body"}>
                <h2 className="card-title">{post.title}</h2>
                
                {isMain && post.content && (
                    <p className="card-desc">{post.content.substring(0, 60)}...</p>
                )}
                
                <div className="post-info-row">
                    <span className="post-user">User {post.userId}</span>
                    <div className="post-icons">
                        <span className="stat-icon heart">❤️ {post.likes || 0}</span>
                        <span className="stat-icon comment">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            {post.commentCount || 0}
                        </span>
                        <span className="stat-icon view">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {post.viewCount || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendCard;
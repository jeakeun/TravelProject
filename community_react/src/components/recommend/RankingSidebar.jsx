import React from 'react';

const RankingSidebar = ({ ranking, startRank, onDetail, getImageUrl }) => {
    return (
        <aside className="ranking-section">
            <h3 className="ranking-title">실시간 추천 랭킹</h3>
            <div className="rank-list">
                {ranking.map((post, idx) => (
                    <div key={post.postId} className="rank-item" onClick={() => onDetail(post.postId)}>
                        <div className="rank-thumb-box">
                            <img 
                                className="rank-thumb" 
                                src={getImageUrl(post.fileUrl)} 
                                alt="" 
                                onError={(e) => e.target.src = "https://placehold.co"}
                            />
                        </div>
                        
                        <div className="rank-info">
                            {/* 🚩 1. 제목 필드 수정: post.title -> post.poTitle */}
                            <p className="rank-title">{post.poTitle}</p>
                            <div className="rank-meta">
                                <span className="rank-num-badge">{startRank + idx}</span>
                                {/* 🚩 2. 추천수 필드 수정: post.likes -> post.poUp */}
                                <span className="rank-likes">❤️ {post.poUp || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default RankingSidebar;
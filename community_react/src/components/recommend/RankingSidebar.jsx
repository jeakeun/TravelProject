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
                            {/* 🚩 4~10등 제목이 여기서 출력됩니다 */}
                            <p className="rank-title">{post.title}</p>
                            <div className="rank-meta">
                                <span className="rank-num-badge">{startRank + idx}</span>
                                <span className="rank-likes">❤️ {post.likes || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default RankingSidebar;
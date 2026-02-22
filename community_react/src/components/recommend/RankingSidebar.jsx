import React from 'react';

const RankingSidebar = ({ ranking, startRank, onDetail, getImageUrl }) => {
    return (
        <aside className="ranking-section">
            <h3 className="ranking-title">실시간 추천 랭킹</h3>
            <div className="rank-list">
                {ranking.map((post, idx) => {
                    // 🚩 [유지] 데이터 구조에 따라 poNum 또는 postId 중 존재하는 값을 사용
                    const postId = post.poNum || post.postId;
                    
                    return (
                        <div key={postId} className="rank-item" onClick={() => onDetail(postId)}>
                            <div className="rank-thumb-box">
                                <img 
                                    className="rank-thumb" 
                                    // 🚩 [핵심 수정] poImg 필드 하나만 보내는 대신 post 객체 전체를 전달합니다.
                                    // 이를 통해 본문(poContent)에 있는 Base64 이미지를 추출하는 로직이 정상 작동합니다.
                                    src={getImageUrl(post)} 
                                    alt="" 
                                    onError={(e) => { e.target.src = "https://placehold.co/100x100?text=No+Img"; }}
                                />
                            </div>
                            
                            <div className="rank-info">
                                {/* 🚩 1. 제목 필드 수정: post.poTitle 유지 */}
                                <p className="rank-title">{post.poTitle}</p>
                                <div className="rank-meta">
                                    <span className="rank-num-badge">{startRank + idx}</span>
                                    {/* 🚩 2. 추천수 필드 수정: post.poUp 유지 */}
                                    <span className="rank-likes">❤️ {post.poUp || 0}</span>
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
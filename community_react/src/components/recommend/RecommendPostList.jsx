import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecommendPostList.css'; 

const RecommendPostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. 데이터 로드 (백엔드 convertToMap의 poUp, commentCount 반영)
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/recommend/posts');
                setPosts(response.data);
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // 2. 날짜 포맷 함수
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    if (loading) return <div className="loading-text">로딩 중...</div>;

    return (
        <div className="recommend-page-root">
            <div className="bottom-list-wrapper">
                <h3 className="list-main-title">전체 추천 목록</h3>
                
                <table className="list-data-table">
                    <thead>
                        <tr>
                            <th className="th-num">번호</th>
                            <th className="th-img">여행지</th>
                            <th className="th-title">제목</th>
                            <th className="th-stats">통계</th>
                            <th className="th-author">작성자</th>
                            <th className="th-date">날짜</th>
                            <th className="th-view">조회</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <tr key={post.postId} onClick={() => navigate(`/community/recommend/${post.postId}`)}>
                                    <td className="td-num">{post.postId}</td>
                                    
                                    <td className="img-td">
                                        <img 
                                            src={post.fileUrl || "https://placehold.co"} 
                                            alt="thumb" 
                                            onError={(e) => e.target.src="https://placehold.co"}
                                        />
                                    </td>

                                    <td className="title-td">
                                        {post.poTitle}
                                    </td>
                                    
                                    {/* 🚩 수정: 상단 카드와 순서 일치 (❤️ 먼저, 💬 나중) 및 레이아웃 고정 */}
                                    <td className="stats-td">
                                        <div className="stats-container" style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
                                            {/* 추천수 (❤️) */}
                                            <div className="stat-item likes" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e74c3c' }}>
                                                <span style={{ fontSize: '14px' }}>❤️</span>
                                                <span style={{ color: '#333' }}>{post.poUp || 0}</span>
                                            </div>
                                            {/* 댓글수 (💬) */}
                                            <div className="stat-item comment" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#1890ff' }}>
                                                <span style={{ fontSize: '14px' }}>💬</span>
                                                <span style={{ color: '#333' }}>{post.commentCount || 0}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="td-author">User {post.poMbNum}</td>
                                    <td className="td-date">{formatDate(post.poDate)}</td>
                                    <td className="td-view">{post.poView}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">등록된 추천 게시글이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* 하단 페이지네이션 및 검색 영역 */}
                <div className="list-pagination-area">
                    <div className="page-buttons">
                        <button className="active">1</button>
                        <button>2</button>
                        <button>3</button>
                    </div>

                    <div className="footer-action-row">
                        <div className="search-footer">
                            <select className="search-select-box">
                                <option value="title">제목</option>
                                <option value="user">작성자</option>
                            </select>
                            <div className="search-input-wrapper">
                                <input type="text" placeholder="검색어를 입력하세요" />
                                <button className="btn-search">검색</button>
                            </div>
                        </div>
                        <button 
                            className="btn-write-footer" 
                            onClick={(e) => { e.stopPropagation(); navigate('/community/recommend/write'); }}
                        >
                            추천글 작성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendPostList;
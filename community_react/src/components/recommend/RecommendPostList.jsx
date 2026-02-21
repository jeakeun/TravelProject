import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Recommend.css'; 

const RecommendPostList = () => {
    console.log("동작 확인용 로그: 이 글자가 콘솔에 보이나요?");
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🚩 페이지네이션 상태 (디자인/기능 유지)
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    const SERVER_URL = "http://localhost:8080/pic/";

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // 🚩 확인: 반드시 /api/recommend/posts/all 주소여야 합니다.
                const response = await axios.get('http://localhost:8080/api/recommend/posts/all');
                
                // 데이터 개수 확인용 (콘솔에서 19가 찍히는지 확인하세요)
                console.log("받아온 총 게시글 수:", response.data.length);

                // 최신순 정렬 (ID 큰 숫자가 위로)
                const sortedData = [...response.data].sort((a, b) => {
                    return Number(b.postId) - Number(a.postId);
                });
                
                setPosts(sortedData);
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const getImageUrl = (post) => {
        const fileName = post.fileUrl;
        if (!fileName || fileName === "null" || fileName === "") {
            return "https://placehold.co/150x100?text=No+Image";
        }
        if (fileName.startsWith('http')) return fileName;
        return `${SERVER_URL}${fileName}`;
    };

    // 🚩 페이지네이션 계산 로직 (기능 유지)
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    
    // 현재 페이지 데이터 추출 (19개 중 1~10번, 11~19번 분리)
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    
    // 🚩 19개 데이터일 때 totalPages가 2가 되도록 확실히 계산
    const totalPages = Math.ceil(posts.length / postsPerPage);

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
                        {currentPosts.length > 0 ? (
                            currentPosts.map((post) => (
                                <tr key={post.postId} onClick={() => navigate(`/community/recommend/${post.postId}`)} style={{ cursor: 'pointer' }}>
                                    <td className="td-num">{post.postId}</td>
                                    <td className="img-td">
                                        <img 
                                            src={getImageUrl(post)} 
                                            alt="thumb" 
                                            onError={(e) => e.target.src="https://placehold.co/150x100?text=Error"}
                                        />
                                    </td>
                                    <td className="title-td">{post.poTitle}</td>
                                    <td className="stats-td">
                                        <div className="stats-container" style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
                                            <div className="stat-item likes" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e74c3c' }}>
                                                <span style={{ fontSize: '14px' }}>❤️</span>
                                                <span style={{ color: '#333' }}>{post.poUp || 0}</span>
                                            </div>
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

                <div className="list-pagination-area">
                    {/* 🚩 페이지네이션 버튼 (디자인 유지) */}
                    <div className="page-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                        {/* totalPages가 2가 되면 버튼 1, 2가 생성됩니다 */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button 
                                key={pageNum} 
                                className={currentPage === pageNum ? "active" : ""}
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    setCurrentPage(pageNum);
                                }}
                                style={{
                                    width: '38px',
                                    height: '38px',
                                    border: '1px solid #ddd',
                                    borderRadius: '50%',
                                    backgroundColor: currentPage === pageNum ? '#2c3e50' : '#fff',
                                    color: currentPage === pageNum ? '#fff' : '#333',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {pageNum}
                            </button>
                        ))}
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
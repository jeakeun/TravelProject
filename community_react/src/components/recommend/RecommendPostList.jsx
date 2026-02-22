import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Recommend.css'; 

const RecommendPostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🚩 검색을 위한 상태값 추가
    const [searchType, setSearchType] = useState("title"); // 기본값: 제목
    const [searchKeyword, setSearchKeyword] = useState("");

    // 🚩 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    const SERVER_URL = "http://localhost:8080/pic/";

    // 데이터 패칭 로직을 함수로 분리 (검색 시에도 재사용 가능)
    const fetchPosts = async (type = "", keyword = "") => {
        setLoading(true);
        try {
            // 백엔드 엔드포인트에 검색 파라미터 전달 (백엔드 구현에 따라 주소 조정 필요)
            // 예: /api/recommend/posts/all?type=title&keyword=안녕
            let url = 'http://localhost:8080/api/recommend/posts/all';
            if (keyword) {
                url += `?type=${type}&keyword=${encodeURIComponent(keyword)}`;
            }

            const response = await axios.get(url);
            
            // 최신순 정렬
            const sortedData = [...response.data].sort((a, b) => {
                return Number(b.postId) - Number(a.postId);
            });
            
            setPosts(sortedData);
            setCurrentPage(1); // 검색 시 첫 페이지로 이동
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // 검색 실행 함수
    const handleSearch = () => {
        fetchPosts(searchType, searchKeyword);
    };

    const getImageUrl = (post) => {
        const fileName = post.fileUrl;
        if (!fileName || fileName === "null" || fileName === "") {
            return "https://placehold.co/150x100?text=No+Image";
        }
        if (fileName.startsWith('http')) return fileName;
        return `${SERVER_URL}${fileName}`;
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
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
                    <div className="page-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button 
                                key={pageNum} 
                                className={currentPage === pageNum ? "active" : ""}
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    setCurrentPage(pageNum);
                                }}
                                style={{
                                    width: '38px', height: '38px', border: '1px solid #ddd', borderRadius: '50%',
                                    backgroundColor: currentPage === pageNum ? '#2c3e50' : '#fff',
                                    color: currentPage === pageNum ? '#fff' : '#333',
                                    cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    <div className="footer-action-row">
                        <div className="search-footer">
                            {/* 🚩 선택지 4가지로 수정 및 상태 연결 */}
                            <select 
                                className="search-select-box"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                            >
                                <option value="title">제목</option>
                                <option value="content">내용</option>
                                <option value="author">작성자</option>
                                <option value="title_content">제목+내용</option>
                            </select>
                            <div className="search-input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="검색어를 입력하세요" 
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button className="btn-search" onClick={handleSearch}>검색</button>
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
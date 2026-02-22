import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Recommend.css'; 

const RecommendPostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchType, setSearchType] = useState("title"); 
    const [searchKeyword, setSearchKeyword] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    // 상세 페이지와 동일한 이미지 서버 기본 경로
    const SERVER_URL = "http://localhost:8080/pic/";

    const fetchPosts = async (type = "", keyword = "") => {
        setLoading(true);
        try {
            let url = 'http://localhost:8080/api/recommend/posts/all';
            if (keyword) {
                url += `?type=${type}&keyword=${encodeURIComponent(keyword)}`;
            }

            const response = await axios.get(url);
            
            // 데이터 확인용 로그
            console.log("백엔드 수신 데이터:", response.data);

            const sortedData = [...response.data].sort((a, b) => {
                return Number(b.poNum || b.postId) - Number(a.poNum || a.postId);
            });
            
            setPosts(sortedData);
            setCurrentPage(1); 
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSearch = () => {
        fetchPosts(searchType, searchKeyword);
    };

    /**
     * 🚩 [핵심 수정] 이미지 URL 생성 로직
     * 백엔드에서 이미 풀 경로(http://...)를 보내주므로 중복 결합을 방지합니다.
     */
    const getImageUrl = (post) => {
        // 백엔드 Map 키값인 fileUrl 또는 poImg 확인
        const imgData = post.fileUrl || post.poImg; 
        
        if (!imgData || imgData === "null" || imgData === "" || String(imgData).includes("undefined")) {
            return "https://placehold.co/150x100?text=No+Image";
        }
        
        // 1. 이미 http로 시작하는 완성된 경로라면 그대로 반환
        if (String(imgData).startsWith('http')) {
            return imgData;
        }
        
        // 2. 파일명만 넘어왔을 경우에만 SERVER_URL과 결합
        return `${SERVER_URL}${imgData}`;
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
                                <tr key={post.poNum || post.postId} onClick={() => navigate(`/community/recommend/${post.poNum || post.postId}`)} style={{ cursor: 'pointer' }}>
                                    <td className="td-num">{post.poNum || post.postId}</td>
                                    <td className="img-td">
                                        <img 
                                            src={getImageUrl(post)} 
                                            alt="thumb" 
                                            onError={(e) => { 
                                                console.log("이미지 경로 오류:", e.target.src);
                                                e.target.src="https://placehold.co/150x100?text=No+Image"; 
                                            }}
                                            style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
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
                                    <td className="td-view">{post.poView || 0}</td>
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
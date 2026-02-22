import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReviewBoardDetail.css'; 

const ReviewBoardList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchType, setSearchType] = useState("title");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; 

    const SERVER_URL = "http://localhost:8080";
    const fallbackImage = "https://placehold.co/300x200?text=No+Image";

    /**
     * 🚩 [이미지 추출 로직] RecommendMain과 동일하게 적용
     * 본문(poContent)에서 이미지를 추출하여 썸네일로 사용
     */
    const getImageUrl = (post) => {
        if (!post) return fallbackImage;
        const { poImg, fileUrl, fileName, poContent } = post;
        const targetUrl = poImg || fileUrl || fileName;

        if (targetUrl && targetUrl !== "" && String(targetUrl) !== "null") {
            if (String(targetUrl).startsWith('http') || String(targetUrl).startsWith('data:')) return targetUrl;
            const extractedName = String(targetUrl).split(/[\\/]/).pop();
            return `${SERVER_URL}/pic/${extractedName}`;
        }
        
        if (poContent) {
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
            const match = poContent.match(imgRegex);
            if (match && match[1]) return match[1];
        }

        return fallbackImage;
    };

    const fetchPosts = useCallback(async (type = "", keyword = "") => {
        setLoading(true);
        try {
            // 🚩 [중요] API 주소가 정확한지 확인하세요. 
            // 보통 게시판 공통 API라면 /api/posts 등일 수 있습니다.
            let url = `${SERVER_URL}/api/reviewboard/posts`;
            
            if (keyword) {
                url += `?type=${type}&keyword=${encodeURIComponent(keyword)}`;
            }
            const response = await axios.get(url);
            
            // 데이터가 배열인지 확인 후 정렬
            const data = Array.isArray(response.data) ? response.data : [];
            const sortedData = [...data].sort((a, b) => (b.poNum || 0) - (a.poNum || 0));
            
            setPosts(sortedData);
            setCurrentPage(1); 
        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
            // 에러 시 빈 배열로 설정하여 무한 로딩 방지
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [SERVER_URL]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSearch = () => {
        fetchPosts(searchType, searchKeyword);
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage) || 1;

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    if (loading) return <div className="loading-text">리뷰를 불러오는 중...</div>;

    return (
        <div className="main-content">
            <h2 className="board-title">| 여행 후기 게시판</h2>
            
            <div className="gallery-grid">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <div 
                            key={post.poNum || post.postId} 
                            className="photo-card"
                            onClick={() => navigate(`/community/reviewboard/${post.poNum || post.postId}`)}
                        >
                            <div className="img-placeholder">
                                <img 
                                    // 🚩 수정된 이미지 로직 적용
                                    src={getImageUrl(post)} 
                                    alt={post.poTitle} 
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = fallbackImage; 
                                    }}
                                />
                            </div>
                            <div className="photo-info">
                                <p className="photo-title">
                                    {post.poTitle} 
                                    {(post.commentCount > 0) && <span className="co-count"> [{post.commentCount}]</span>}
                                </p>
                                <div className="photo-meta">
                                    <span className="post-author">User {post.poMbNum}</span>
                                    <span className="post-date">
                                        {post.poDate ? post.poDate.split('T')[0] : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data-full">등록된 후기가 없습니다.</div>
                )}
            </div>

            <div className="list-pagination-area">
                <div className="page-buttons">
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i + 1} 
                            className={currentPage === i + 1 ? 'active' : ''}
                            onClick={() => paginate(i + 1)}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: currentPage === i + 1 ? '#2c3e50' : '#fff',
                                color: currentPage === i + 1 ? '#fff' : '#2c3e50',
                                border: '1px solid #2c3e50',
                                margin: '0 4px',
                                padding: '5px 10px',
                                borderRadius: '4px'
                            }}
                        >
                            {i + 1}
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
                            <option value="title_content">제목+내용</option>
                            <option value="author">작성자</option>
                        </select>
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                placeholder="후기 검색" 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="btn-search" onClick={handleSearch}>검색</button>
                        </div>
                    </div>

                    <button className="btn-write-footer" onClick={() => navigate('/community/reviewboard/write')}>
                        후기 작성
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewBoardList;
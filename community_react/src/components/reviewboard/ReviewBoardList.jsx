import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReviewBoardDetail.css'; 

const ReviewBoardList = ({ posts = [] }) => {
    const navigate = useNavigate();
    
    const [searchType, setSearchType] = useState("title");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; 

    const SERVER_URL = "http://localhost:8080";
    const fallbackImage = "https://placehold.co/300x200?text=No+Image";

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

    const filteredPosts = useMemo(() => {
        if (!searchKeyword) return [...posts].sort((a, b) => (b.poNum || 0) - (a.poNum || 0));

        return posts
            .filter(post => {
                const keyword = searchKeyword.toLowerCase();
                if (searchType === "title") return post.poTitle?.toLowerCase().includes(keyword);
                if (searchType === "content") return post.poContent?.toLowerCase().includes(keyword);
                if (searchType === "title_content") {
                    return post.poTitle?.toLowerCase().includes(keyword) || post.poContent?.toLowerCase().includes(keyword);
                }
                if (searchType === "author") return String(post.poMbNum).includes(keyword);
                return true;
            })
            .sort((a, b) => (b.poNum || 0) - (a.poNum || 0));
    }, [posts, searchKeyword, searchType]);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

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

            {/* 🚩 수정된 페이지네이션 영역 */}
            <div className="list-pagination-area">
                <div className="page-buttons">
                    {/* 이전 버튼: 항상 노출 */}
                    <button 
                        className="prev" 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>

                    {/* 숫자 버튼: 인라인 스타일 제거 및 둥근 버튼 적용 */}
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i + 1} 
                            className={currentPage === i + 1 ? 'active' : ''}
                            onClick={() => paginate(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    {/* 다음 버튼: 항상 노출 */}
                    <button 
                        className="next" 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
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
                            />
                            <button className="btn-search">검색</button>
                        </div>
                    </div>

                    <button className="btn-write-footer" onClick={() => navigate('/community/write')}>
                        후기 작성
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewBoardList;
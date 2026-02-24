import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
// 🚩 [수정] 에러 원인이었던 잘못된 CSS 경로를 실제 존재하는 파일로 변경
import './EventBoardDetail.css'; 

const EventBoardList = ({ posts = [] }) => {
    const navigate = useNavigate();
    
    // App.js에서 주입되는 user 정보 가져오기
    const { user } = useOutletContext() || {};
    
    const [searchType, setSearchType] = useState("title");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; 

    const SERVER_URL = "http://localhost:8080";
    const fallbackImage = "https://placehold.co/300x200?text=No+Image";

    // 관리자 여부 확인 (mb_rol 필드 기준)
    const isAdmin = user && (user.mb_rol === 'ADMIN' || user.mbRol === 'ADMIN');

    const getImageUrl = (post) => {
        if (!post) return fallbackImage;
        const { po_img, poImg, fileUrl, fileName, po_content, poContent } = post;
        const targetUrl = po_img || poImg || fileUrl || fileName;

        if (targetUrl && targetUrl !== "" && String(targetUrl) !== "null") {
            if (String(targetUrl).startsWith('http') || String(targetUrl).startsWith('data:')) return targetUrl;
            const extractedName = String(targetUrl).split(/[\\/]/).pop();
            return `${SERVER_URL}/pic/${extractedName}`;
        }
        
        const content = po_content || poContent;
        if (content) {
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
            const match = content.match(imgRegex);
            if (match && match[1]) return match[1];
        }

        return fallbackImage;
    };

    const filteredPosts = useMemo(() => {
        // po_num 또는 id 기반 정렬
        const sortedPosts = [...posts].sort((a, b) => {
            const aId = a.po_num || a.poNum || a.id || 0;
            const bId = b.po_num || b.poNum || b.id || 0;
            return bId - aId;
        });
        
        if (!searchKeyword) return sortedPosts;

        return sortedPosts.filter(post => {
            const keyword = searchKeyword.toLowerCase();
            const title = (post.po_title || post.poTitle || "").toLowerCase();
            const content = (post.po_content || post.poContent || "").toLowerCase();
            const author = String(post.po_mb_num || post.poMbNum || "");

            if (searchType === "title") return title.includes(keyword);
            if (searchType === "content") return content.includes(keyword);
            if (searchType === "title_content") return title.includes(keyword) || content.includes(keyword);
            if (searchType === "author") return author.includes(keyword);
            return true;
        });
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
            <h2 className="board-title">| 이벤트 게시판</h2>
            
            <div className="gallery-grid">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <div 
                            key={post.po_num || post.poNum || post.id} 
                            className="photo-card"
                            // 🚩 상세 페이지 경로를 App.jsx 라우트 설정(/event/:poNum)에 맞게 연결
                            onClick={() => navigate(`/event/${post.po_num || post.poNum || post.id}`)}
                        >
                            <div className="img-placeholder">
                                <img 
                                    src={getImageUrl(post)} 
                                    alt={post.po_title || post.poTitle} 
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = fallbackImage; 
                                    }}
                                />
                            </div>
                            <div className="photo-info">
                                <p className="photo-title">
                                    {post.po_title || post.poTitle} 
                                </p>
                                <div className="photo-meta">
                                    <span className="post-author">관리자</span>
                                    <span className="post-date">
                                        {(post.po_date || post.poDate) ? (post.po_date || post.poDate).split('T')[0] : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data-full">등록된 이벤트가 없습니다.</div>
                )}
            </div>

            <div className="list-pagination-area">
                <div className="page-buttons">
                    <button 
                        className="prev" 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i + 1} 
                            className={currentPage === i + 1 ? 'active' : ''}
                            onClick={() => paginate(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

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
                                placeholder="이벤트 검색" 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            <button className="btn-search">검색</button>
                        </div>
                    </div>

                    {isAdmin && (
                        <button className="btn-write-footer" onClick={() => navigate('/community/write')}>
                            이벤트 작성
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventBoardList;
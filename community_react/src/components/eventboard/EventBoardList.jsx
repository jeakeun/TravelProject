import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
// 🚩 디자인 일관성을 위해 기존 스타일 파일을 유지합니다.
import './EventBoardDetail.css'; 

const EventBoardList = ({ posts = [] }) => {
    const navigate = useNavigate();
    
    // App.js에서 주입되는 user 정보 가져오기
    const { user } = useOutletContext() || {};
    
    const [searchType, setSearchType] = useState("title");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; 

    // 🚩 [수정] 자동 배포 환경을 위한 서버 URL 설정 (환경 변수 우선 사용)
    const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
    const fallbackImage = "https://placehold.co/300x200?text=No+Image";

    // 관리자 여부 확인
    const isAdmin = user && (user.mb_rol === 'ADMIN' || user.mbRol === 'ADMIN' || user.mbLevel >= 10);

    /**
     * 🚩 이미지 경로 처리 유틸리티
     */
    const getImageUrl = (post) => {
        if (!post) return fallbackImage;
        
        // 1. 우선순위: 이미지 필드 확인
        const { po_img, poImg, fileUrl, fileName, po_content, poContent } = post;
        const targetUrl = po_img || poImg || fileUrl || fileName;

        if (targetUrl && targetUrl !== "" && String(targetUrl) !== "null" && String(targetUrl) !== "undefined") {
            if (String(targetUrl).startsWith('http') || String(targetUrl).startsWith('data:')) return targetUrl;
            const extractedName = String(targetUrl).split(/[\\/]/).pop();
            // 🚩 SERVER_URL을 참조하여 배포 환경에 대응
            return `${SERVER_URL}/pic/${extractedName}`;
        }
        
        // 2. 차선책: 본문(po_content/poContent) 내 이미지 추출
        const content = po_content || poContent;
        if (content && typeof content === 'string') {
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
            const match = content.match(imgRegex);
            if (match && match[1]) {
                const src = match[1];
                // 🚩 SERVER_URL을 참조하여 배포 환경에 대응
                if (src.startsWith('/pic/')) return `${SERVER_URL}${src}`;
                return src;
            }
        }
        return fallbackImage;
    };

    // 정렬 및 검색 필터링
    const filteredPosts = useMemo(() => {
        const safePosts = Array.isArray(posts) ? posts : [];
        const sortedPosts = [...safePosts].sort((a, b) => {
            const aId = Number(a.po_num || a.poNum || a.id || 0);
            const bId = Number(b.po_num || b.poNum || b.id || 0);
            return bId - aId;
        });
        
        if (!searchKeyword.trim()) return sortedPosts;

        const keyword = searchKeyword.toLowerCase();
        return sortedPosts.filter(post => {
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
        <div className="news-container">
            <div className="main-content">
                <h2 className="board-title">| 이벤트 게시판</h2>
                
                <div className="gallery-grid">
                    {currentPosts.length > 0 ? (
                        currentPosts.map((post) => {
                            const poNum = post.po_num || post.poNum || post.id;
                            const dateValue = post.po_date || post.poDate;
                            return (
                                <div 
                                    key={poNum || Math.random()} 
                                    className="photo-card"
                                    onClick={() => navigate(`/news/event/${poNum}`)}
                                >
                                    <div className="img-placeholder">
                                        <img 
                                            src={getImageUrl(post)} 
                                            alt={post.po_title || post.poTitle} 
                                            onError={(e) => { 
                                                if (e.target.src !== fallbackImage) {
                                                    e.target.onerror = null; 
                                                    e.target.src = fallbackImage; 
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="photo-info">
                                        <p className="photo-title">
                                            {post.po_title || post.poTitle || "제목 없음"} 
                                        </p>
                                        <div className="photo-meta">
                                            <span className="post-author">관리자</span>
                                            <span className="post-date">
                                                {dateValue ? String(dateValue).split('T')[0] : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-data-full" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
                            등록된 이벤트가 없습니다.
                        </div>
                    )}
                </div>
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
                                onKeyPress={(e) => e.key === 'Enter' && setCurrentPage(1)}
                            />
                            <button className="btn-search" onClick={() => setCurrentPage(1)}>검색</button>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <button className="btn-write-footer" onClick={() => navigate('/news/event/write')}>
                        이벤트 작성
                    </button>
                )}
            </div>
        </div>
    );
};

export default EventBoardList;
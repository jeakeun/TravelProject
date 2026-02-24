import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
// 🚩 [에러 해결] 존재하지 않는 EventBoardList.css 대신 실제 프로젝트에 존재하는 EventBoardDetail.css로 연결
import './EventBoardDetail.css'; 

const EventBoardList = ({ posts = [] }) => {
    const navigate = useNavigate();
    
    // App.jsx에서 주입되는 context 가져오기
    const { user } = useOutletContext() || {};
    
    const [searchType, setSearchType] = useState("title");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; 

    const SERVER_URL = "http://localhost:8080";
    const fallbackImage = "https://placehold.co/300x200?text=No+Image";

    // 관리자 여부 확인
    const isAdmin = user && (user.mb_rol === 'ADMIN' || user.mbRol === 'ADMIN');

    // 이미지 경로 처리 유틸리티
    const getImageUrl = (post) => {
        if (!post) return fallbackImage;
        const targetUrl = post.po_img || post.poImg || post.fileUrl;

        if (targetUrl && targetUrl !== "" && String(targetUrl) !== "null") {
            if (String(targetUrl).startsWith('http') || String(targetUrl).startsWith('data:')) return targetUrl;
            const extractedName = String(targetUrl).split(/[\\/]/).pop();
            return `${SERVER_URL}/pic/${extractedName}`;
        }
        
        const content = post.po_content || post.poContent;
        if (content) {
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
            const match = content.match(imgRegex);
            if (match && match[1]) return match[1];
        }

        return fallbackImage;
    };

    // 정렬 및 검색 필터링
    const filteredPosts = useMemo(() => {
        const safePosts = Array.isArray(posts) ? posts : [];

        const sortedPosts = [...safePosts].sort((a, b) => {
            const aId = a.po_num || a.poNum || a.id || 0;
            const bId = b.po_num || b.poNum || b.id || 0;
            return bId - aId;
        });
        
        if (!searchKeyword) return sortedPosts;

        return sortedPosts.filter(post => {
            const keyword = searchKeyword.toLowerCase();
            const title = (post.po_title || post.poTitle || "").toLowerCase();
            const content = (post.po_content || post.poContent || "").toLowerCase();
            
            if (searchType === "title") return title.includes(keyword);
            if (searchType === "content") return content.includes(keyword);
            if (searchType === "title_content") return title.includes(keyword) || content.includes(keyword);
            return true;
        });
    }, [posts, searchKeyword, searchType]);

    // 페이지네이션 계산
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
        <div className="main-content page-content-area">
            <h2 className="board-title">| 이벤트 게시판</h2>
            
            <div className="gallery-grid">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => {
                        const poNum = post.po_num || post.poNum || post.id;
                        return (
                            <div 
                                key={poNum} 
                                className="photo-card"
                                onClick={() => navigate(`/news/event/${poNum}`)}
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
                        );
                    })
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
                        /* 🚩 [수정 완료] /community/write 대신 정확한 이벤트 전용 경로인 /news/event/write로 이동 */
                        <button className="btn-write-footer" onClick={() => navigate('/news/event/write')}>
                            이벤트 작성
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventBoardList;
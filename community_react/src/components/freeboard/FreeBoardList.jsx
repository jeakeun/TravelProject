import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './FreeBoardDetail.css'; 

const FreeBoardList = ({ posts = [], goToDetail }) => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState(''); 
    const [appliedSearch, setAppliedSearch] = useState(''); 
    const [searchType, setSearchType] = useState('title'); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    // 🚩 [수정] 자동 배포 환경을 위해 배포 서버 IP로 고정 설정
    const SERVER_URL = "http://localhost:8080";

    // 검색 실행 함수
    const handleSearch = () => {
        setAppliedSearch(inputValue);
        setCurrentPage(1);
    };

    /**
     * 🚩 필터링 로직
     */
    const filteredItems = useMemo(() => {
        // 🚩 SERVER_URL 참조를 유지하여 배포 환경 대응
        if (!SERVER_URL) return []; 

        const safePosts = Array.isArray(posts) ? posts : [];
        if (!appliedSearch) return safePosts;
        const term = appliedSearch.toLowerCase();
        
        return safePosts.filter(p => {
            const title = (p.poTitle || "").toLowerCase();
            const content = (p.poContent || "").toLowerCase();
            const author = `user ${p.poMbNum}`.toLowerCase();

            switch (searchType) {
                case 'title': return title.includes(term);
                case 'content': return content.includes(term);
                case 'titleContent': return title.includes(term) || content.includes(term);
                case 'author': return author.includes(term);
                default: return title.includes(term);
            }
        });
    }, [posts, appliedSearch, searchType, SERVER_URL]); 
    
    // 페이징 계산
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 날짜 포맷 함수 (기존 유지)
    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    return (
        <div className="freeboard-list-wrapper">
            <h2 className="board-title">자유 게시판</h2>
            <table className="freeboard-table">
                <thead>
                    <tr>
                        <th className="th-num">번호</th>
                        <th className="th-title">제목</th>
                        <th className="th-author">작성자</th>
                        <th className="th-view">조회수</th>
                        <th className="th-date">작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((post) => (
                            <tr key={post.poNum} onClick={() => goToDetail(post.poNum)}>
                                <td className="td-num">{post.poNum}</td>
                                <td className="td-title">
                                    {post.poTitle}
                                    {post.commentCount > 0 && <span className="freeboard-comment-count"> [{post.commentCount}]</span>}
                                </td>
                                <td className="td-author">User {post.poMbNum}</td>
                                <td className="td-view">{post.poView || 0}</td>
                                <td className="td-date">{formatDateTime(post.poDate)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="no-data">등록된 게시글이 없습니다.</td></tr>
                    )}
                </tbody>
            </table>

            {/* 🚩 하단 레이아웃 영역 */}
            <div className="list-pagination-area">
                <div className="page-buttons">
                    <button 
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
                            <option value="titleContent">제목+내용</option>
                            <option value="author">작성자</option>
                        </select>
                        
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                placeholder="검색어를 입력하세요" 
                                value={inputValue} 
                                onChange={(e) => setInputValue(e.target.value)} 
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
                            />
                            <button className="btn-search" onClick={handleSearch}>검색</button>
                        </div>
                    </div>

                    <button 
                        className="btn-write-footer" 
                        onClick={() => navigate('/community/freeboard/write')}
                    >
                        글쓰기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreeBoardList;
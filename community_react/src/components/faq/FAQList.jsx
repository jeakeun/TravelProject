import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './FAQDetail.css'; 

// 🚩 goToDetail 프롭스가 없어도 동작하도록 기본값을 설정하거나 내부에서 정의합니다.
const FAQList = ({ posts = [], goToDetail }) => {
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    const [inputValue, setInputValue] = useState(''); 
    const [appliedSearch, setAppliedSearch] = useState(''); 
    const [searchType, setSearchType] = useState('title'); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    // 🚩 추가: 부모로부터 함수를 못 받았을 경우를 대비한 내부 이동 함수
    const handleGoToDetail = (poNum) => {
        if (typeof goToDetail === 'function') {
            goToDetail(poNum); // 부모가 준 함수가 있다면 그것을 사용
        } else {
            // 부모가 함수를 안 줬다면 여기서 직접 상세페이지로 이동 (경로 확인 필요)
            navigate(`/cscenter/faq/posts/${poNum}`); 
        }
    };

    /**
     * 🚩 관리자 여부 확인
     */
    const isAdmin = useMemo(() => {
        if (!user) return false;
        const role = user.mb_rol || user.mbRol || user.mbRole || "";
        return role.toUpperCase() === 'ADMIN';
    }, [user]);

    const handleSearch = () => {
        setAppliedSearch(inputValue);
        setCurrentPage(1);
    };

    const filteredItems = useMemo(() => {
        const safePosts = Array.isArray(posts) ? posts : [];
        if (!appliedSearch) return safePosts;
        const term = appliedSearch.toLowerCase();
        
        return safePosts.filter(p => {
            const title = (p.poTitle || "").toLowerCase();
            const content = (p.poContent || "").toLowerCase();
            const author = "관리자".toLowerCase();

            switch (searchType) {
                case 'title': return title.includes(term);
                case 'content': return content.includes(term);
                case 'titleContent': return title.includes(term) || content.includes(term);
                case 'author': return author.includes(term);
                default: return title.includes(term);
            }
        });
    }, [posts, appliedSearch, searchType]);
    
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <div className="faq-list-wrapper">
            <h2 className="board-title">자주 묻는 질문</h2>
            
            <table className="freeboard-table">
                <thead>
                    <tr>
                        <th className="th-num" style={{width: '80px'}}>번호</th>
                        <th className="th-title">제목</th>
                        <th className="th-author" style={{width: '120px'}}>작성자</th>
                        <th className="th-view" style={{width: '100px'}}>조회수</th>
                        <th className="th-date" style={{width: '150px'}}>작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((post) => (
                            /* 🚩 여기 onClick에서 직접 handleGoToDetail을 호출하도록 수정했습니다. */
                            <tr key={post.poNum} onClick={() => handleGoToDetail(post.poNum)} style={{cursor: 'pointer'}}>
                                <td className="td-num">{post.poNum}</td>
                                <td className="td-title">
                                    {post.poTitle}
                                </td>
                                <td className="td-author">관리자</td>
                                <td className="td-view">{post.poView || 0}</td>
                                <td className="td-date">{formatDateTime(post.poDate)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="no-data" style={{padding: '50px 0'}}>등록된 FAQ가 없습니다.</td></tr>
                    )}
                </tbody>
            </table>

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

                    {isAdmin && (
                        <button 
                            className="btn-write-footer" 
                            onClick={() => navigate('/cscenter/faq/write')}
                        >
                            글쓰기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FAQList;
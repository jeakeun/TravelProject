import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
// 🚩 에러 해결: 동일 폴더 내의 FAQDetail.css를 임포트하도록 수정
import './FAQDetail.css'; 

const FAQList = ({ posts = [], goToDetail }) => {
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; // 상위 컴포넌트에서 유저 정보 주입
    const [inputValue, setInputValue] = useState(''); 
    const [appliedSearch, setAppliedSearch] = useState(''); 
    const [searchType, setSearchType] = useState('title'); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    // 🚩 관리자 여부 확인 (ADMIN 체크)
    const isAdmin = user && user.mbRol === 'ADMIN';

    // 🚩 AWS 자동 배포 환경 서버 URL (공지사항과 동일 유지)
    const SERVER_URL = "http://3.37.160.108:8080";

    // 검색 실행 함수
    const handleSearch = () => {
        setAppliedSearch(inputValue);
        setCurrentPage(1);
    };

    /**
     * 🚩 FAQ 전용 필터링 로직
     * FAQ 엔티티는 poNum, poTitle, poContent 형식을 사용하므로 해당 필드로 매핑
     */
    const filteredItems = useMemo(() => {
        const safePosts = Array.isArray(posts) ? posts : [];
        if (!appliedSearch) return safePosts;
        const term = appliedSearch.toLowerCase();
        
        return safePosts.filter(p => {
            const title = (p.poTitle || "").toLowerCase();
            const content = (p.poContent || "").toLowerCase();
            // FAQ의 경우 작성자는 보통 '관리자'로 표시되므로 검색 대상에서 고정값 처리 가능
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
    
    // 페이징 계산
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 날짜 포맷 함수
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
                            <tr key={post.poNum} onClick={() => goToDetail(post.poNum)} style={{cursor: 'pointer'}}>
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

            {/* 🚩 하단 레이아웃 영역: 공지사항과 완벽 통일 */}
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

                    {/* 🚩 관리자(ADMIN) 계정일 때만 글쓰기 버튼 노출 */}
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
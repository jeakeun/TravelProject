import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// 🚩 수정: 실제 파일명인 FreeBoardDetail.css로 경로 수정
import './FreeBoardDetail.css'; 

const FreeBoard = ({ posts = [], goToDetail }) => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState(''); 
    const [appliedSearch, setAppliedSearch] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const handleSearch = () => {
        setAppliedSearch(inputValue);
        setCurrentPage(1);
    };

    const filteredItems = useMemo(() => 
        posts.filter(p => (p.poTitle || "").toLowerCase().includes(appliedSearch.toLowerCase())), 
        [posts, appliedSearch]
    );
    
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="freeboard-list-wrapper">
            <h2 className="board-title">| 자유 게시판</h2>
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

            <div className="board-footer-wrapper">
                <div className="pagination">
                    <button className="nav-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>이전</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i+1} className={`page-num ${currentPage === i+1 ? 'active' : ''}`} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                    ))}
                    <button className="nav-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>다음</button>
                </div>
                <button className="write-btn" onClick={() => navigate('/community/freeboard/write')}>글쓰기</button>
            </div>

            <div className="search-container">
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="자유 게시판 내 검색" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
                    />
                    <button className="search-btn" onClick={handleSearch}>검색</button>
                </div>
            </div>
        </div>
    );
};

export default FreeBoard;
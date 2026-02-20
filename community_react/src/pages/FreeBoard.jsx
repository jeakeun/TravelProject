import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './FreeBoard.css'; 

const FreeBoard = ({ goToDetail }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]); 
    const [inputValue, setInputValue] = useState(''); 
    const [appliedSearch, setAppliedSearch] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10; 

    // 목록 진입 시 최신 데이터 로드
    useEffect(() => {
        const fetchLatestPosts = async () => {
            try {
                setLoading(true);
                const response = await api.get('http://localhost:8080/api/posts');
                // 자유 게시판 카테고리 필터링 및 최신순 정렬
                const freeData = response.data
                    .filter(p => p.category?.trim() === "자유 게시판")
                    .sort((a, b) => b.postId - a.postId);
                setPosts(freeData);
            } catch (err) {
                console.error("목록 로딩 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLatestPosts();
    }, []);

    const handleSearch = () => {
        setAppliedSearch(inputValue);
        setCurrentPage(1);
    };

    const filteredItems = useMemo(() => 
        posts.filter(p => (p.title || "").toLowerCase().includes(appliedSearch.toLowerCase())), 
        [posts, appliedSearch]
    );
    
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>데이터 로딩 중...</div>;

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
                        currentItems.map((post, index) => {
                            const virtualNum = filteredItems.length - ((currentPage - 1) * itemsPerPage + index);
                            return (
                                <tr key={post.postId} onClick={() => goToDetail(post.postId)}>
                                    <td className="td-num">{virtualNum}</td>
                                    {/* 🚩 제목 영역 수정: 제목 옆에 댓글 개수 추가 */}
                                    <td className="td-title">
                                        {post.title}
                                        {post.commentCount > 0 && (
                                            <span className="freeboard-comment-count">
                                                &nbsp;[{post.commentCount}]
                                            </span>
                                        )}
                                    </td>
                                    <td className="td-author">User {post.userId}</td>
                                    <td className="td-view">{post.viewCount || 0}</td>
                                    <td className="td-date">{formatDateTime(post.createdAt)}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="no-data">등록된 게시글이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="board-footer-wrapper">
                <div className="pagination">
                    <button className="nav-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>이전</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i+1} 
                            className={`page-num ${currentPage === i+1 ? 'active' : ''}`} 
                            onClick={() => setCurrentPage(i+1)}
                        >
                            {i+1}
                        </button>
                    ))}
                    <button className="nav-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>다음</button>
                </div>
                <button className="write-btn" onClick={() => navigate('/community/write')}>글쓰기</button>
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
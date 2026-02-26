import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from "react-router-dom"; 
import '../components/freeboard/FreeBoardDetail.css';

const NewsNotice = ({ goToDetail }) => {
    // App.jsx의 Outlet context에서 상태와 함수를 가져옵니다.
    const { 
        user, 
        onLogout, 
        currentLang, 
        setCurrentLang, 
        setShowLogin, 
        setShowSignup 
    } = useOutletContext(); 

    const isAdminUser = user && user.mb_rol === 'ADMIN'; // 변수명 충돌 방지
    const navigate = useNavigate();
    
    const [posts, setPosts] = useState([]); 
    const [inputValue, setInputValue] = useState(''); 
    const [appliedSearch, setAppliedSearch] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10; 

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchLatestPosts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/posts');
                const noticeData = response.data
                    .filter(p => p.category?.trim() === "공지사항")
                    .sort((a, b) => b.postId - a.postId);
                setPosts(noticeData);
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

    // 공통 Header Props 설정 (코드 중복 방지)
    if (loading) return (
        <div className="freeboard-list-wrapper" style={{ textAlign: 'center' }}>데이터 로딩 중...</div>
    );

    return (
        <div className="freeboard-list-wrapper">
                <h2 className="board-title">| 공지사항</h2>
                
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
                    <div className="page-buttons">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&lt;</button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i+1} 
                                className={currentPage === i+1 ? 'active' : ''} 
                                onClick={() => setCurrentPage(i+1)}
                            >
                                {i+1}
                            </button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>&gt;</button>
                    </div>

                    {isAdminUser && (
                        <button className="write-btn" onClick={() => navigate('/community/write')}>
                            글쓰기
                        </button>
                    )}
                </div>

                <div className="search-container">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="공지사항 내 검색" 
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

export default NewsNotice;
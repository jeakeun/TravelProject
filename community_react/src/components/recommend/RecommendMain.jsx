import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendCard from './RecommendCard';
import RankingSidebar from './RankingSidebar';
import './Recommend.css';

// 🚩 props로 posts를 부모(App.jsx)로부터 전달받습니다.
const RecommendMain = ({ posts = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [finalSearchTerm, setFinalSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('title');
    
    const itemsPerPage = 10;
    const navigate = useNavigate();

    // 🚩 상세 페이지 이동 (서버 PK인 postId 사용)
    const goToDetail = (id) => {
        navigate(`/community/recommend/${id}`);
    };

    const getThisMonday = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const sortedPosts = useMemo(() => {
        const monday = getThisMonday();
        const thisWeekPosts = posts.filter(post => new Date(post.poDate) >= monday);
        return [...thisWeekPosts].sort((a, b) => {
            const scoreA = (a.poView || 0); 
            const scoreB = (b.poView || 0);
            return scoreB - scoreA;
        });
    }, [posts]);

    const listData = useMemo(() => {
        return [...posts].sort((a, b) => new Date(b.poDate) - new Date(a.poDate));
    }, [posts]);

    const filteredList = useMemo(() => 
        listData.filter(p => {
            const term = finalSearchTerm.toLowerCase();
            if (!term) return true;
            if (searchCategory === 'title') return p.poTitle?.toLowerCase().includes(term);
            if (searchCategory === 'user') return `user ${p.poMbNum}`.toLowerCase().includes(term);
            if (searchCategory === 'titleContent') return p.poTitle?.toLowerCase().includes(term) || (p.poContent && p.poContent.toLowerCase().includes(term));
            return true;
        }), 
        [listData, finalSearchTerm, searchCategory]
    );

    const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
    const currentItems = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSearch = () => {
        setFinalSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    // 🚩 [이미지 경로 수정] 서버에서 준 fileUrl을 그대로 사용하도록 단순화
    const getImageUrl = (url) => {
        if (!url) return "https://placehold.co";
        // 서버 컨트롤러에서 이미 전체 경로(http://...)를 붙여서 주므로 그대로 반환합니다.
        return url; 
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="recommend-page-root">
            <div className="top-combined-section">
                <div className="main-cards-area">
                    {sortedPosts[0] && (
                        <RecommendCard post={sortedPosts[0]} isMain={true} rank={1} onClick={(id) => goToDetail(id)} getImageUrl={getImageUrl} />
                    )}
                    <div className="sub-cards-flex">
                        {sortedPosts[1] && <RecommendCard post={sortedPosts[1]} isMain={false} rank={2} onClick={(id) => goToDetail(id)} getImageUrl={getImageUrl} />}
                        {sortedPosts[2] && <RecommendCard post={sortedPosts[2]} isMain={false} rank={3} onClick={(id) => goToDetail(id)} getImageUrl={getImageUrl} />}
                    </div>
                </div>
                
                <RankingSidebar 
                    ranking={sortedPosts.slice(3, 10)} 
                    startRank={4} 
                    onDetail={(id) => goToDetail(id)} 
                    getImageUrl={getImageUrl} 
                />
            </div>

            <div className="bottom-list-wrapper">
                <div className="list-top-bar">
                    <h3 className="list-main-title">전체 추천 목록</h3>
                </div>

                <table className="list-data-table">
                    <thead>
                        <tr>
                            <th width="80">번호</th>
                            <th width="150">여행지</th>
                            <th>제목</th>
                            <th width="120">통계</th>
                            <th width="100">작성자</th>
                            <th width="180">날짜</th>
                            <th width="80">조회</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((post, idx) => (
                            // 🚩 onClick 시 post.postId(DB PK)를 넘기도록 수정
                            <tr key={post.postId} onClick={() => goToDetail(post.postId)}>
                                <td>{(filteredList.length - (currentPage-1)*itemsPerPage) - idx}</td>
                                <td className="img-td">
                                    <img 
                                        src={getImageUrl(post.fileUrl)} 
                                        alt="" 
                                        onError={(e) => e.target.src = "https://placehold.co"}
                                    />
                                </td>
                                <td className="title-td"><span className="t-text">{post.poTitle}</span></td>
                                <td className="stats-td">
                                    <div className="stats-container">
                                        <div className="stat-item comment"><span>0</span></div>
                                        <div className="stat-item likes"><span>0</span></div>
                                    </div>
                                </td>
                                <td>User {post.poMbNum}</td>
                                <td className="date-td">{formatDate(post.poDate)}</td>
                                <td>{post.poView}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="list-pagination-area">
                    <div className="page-buttons">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>이전</button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i+1} className={currentPage === i+1 ? 'active' : ''} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>다음</button>
                    </div>
                    
                    <div className="footer-action-row">
                        <div className="search-footer">
                            <select className="search-select-box" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                <option value="title">제목</option>
                                <option value="user">작성자</option>
                                <option value="titleContent">제목+내용</option>
                            </select>
                            <div className="search-input-wrapper">
                                <input type="text" placeholder="검색어 입력" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()}/>
                                <button className="btn-search" onClick={handleSearch}>검색</button>
                            </div>
                        </div>
                        <button className="btn-write-footer" onClick={() => navigate('/community/write')}>추천 글쓰기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendMain;
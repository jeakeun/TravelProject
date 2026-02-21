import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendCard from './RecommendCard';
import RankingSidebar from './RankingSidebar';
import './Recommend.css';

const RecommendMain = ({ posts = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [finalSearchTerm, setFinalSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('title');
    
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
    }, [posts]);

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
        let targetPosts = posts.filter(post => post.poDate && new Date(post.poDate) >= monday);
        if (targetPosts.length === 0) targetPosts = posts;
        return [...targetPosts].sort((a, b) => (b.poView || 0) - (a.poView || 0));
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

    const getImageUrl = (url) => {
        if (!url || url === "" || url.includes("null") || url.includes("undefined")) {
            return "https://placehold.co/600x400?text=No+Image";
        }
        return url;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const searchBtnStyle = {
        backgroundColor: '#2c3e50',
        color: '#fff',
        border: 'none',
        borderRadius: '20px', // 🚩 이전/다음 버튼 둥글게 변경
        padding: '0 20px',
        height: '34px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap'
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
                <RankingSidebar ranking={sortedPosts.slice(3, 10)} startRank={4} onDetail={(id) => goToDetail(id)} getImageUrl={getImageUrl} />
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
                        {currentItems.length > 0 ? (
                            currentItems.map((post, idx) => (
                                <tr key={post.postId} onClick={() => goToDetail(post.postId)} style={{ cursor: 'pointer' }}>
                                    <td>{(filteredList.length - (currentPage-1)*itemsPerPage) - idx}</td>
                                    <td className="img-td">
                                        <img src={getImageUrl(post.fileUrl)} alt="thumb" onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }} />
                                    </td>
                                    <td className="title-td"><span className="t-text">{post.poTitle}</span></td>
                                    <td className="stats-td">
                                        <div className="stats-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                            <div className="stat-item comment"><span>{post.commentCount || 0}</span></div>
                                            <div className="stat-item likes"><span>{post.poUp || 0}</span></div>
                                        </div>
                                    </td>
                                    <td>User {post.poMbNum}</td>
                                    <td className="date-td">{formatDate(post.poDate)}</td>
                                    <td>{post.poView || 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>게시글이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="list-pagination-area">
                    <div className="page-buttons" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '40px 0' }}>
                        <button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(p => p - 1)}
                            style={{ 
                                ...searchBtnStyle,
                                opacity: currentPage === 1 ? 0.5 : 1,
                                cursor: currentPage === 1 ? 'default' : 'pointer'
                            }}
                        >
                            이전
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i+1} 
                                onClick={() => setCurrentPage(i+1)}
                                style={{
                                    width: '34px', height: '34px', borderRadius: '50%', // 🚩 숫자 버튼도 동그랗게 변경
                                    backgroundColor: currentPage === i+1 ? '#2c3e50' : '#fff',
                                    color: currentPage === i+1 ? '#fff' : '#2c3e50',
                                    border: '1px solid #2c3e50', cursor: 'pointer', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {i+1}
                            </button>
                        ))}
                        
                        <button 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(p => p + 1)}
                            style={{ 
                                ...searchBtnStyle,
                                opacity: currentPage === totalPages ? 0.5 : 1,
                                cursor: currentPage === totalPages ? 'default' : 'pointer'
                            }}
                        >
                            다음
                        </button>
                    </div>
                    
                    <div className="footer-action-row">
                        <div className="search-footer">
                            <select className="search-select-box" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                <option value="title">제목</option>
                                <option value="user">작성자</option>
                                <option value="titleContent">제목+내용</option>
                            </select>
                            <div className="search-input-wrapper">
                                <input type="text" placeholder="검색어 입력" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
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
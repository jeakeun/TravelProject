import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecommendCard from './RecommendCard';
import RankingSidebar from './RankingSidebar';
import './Recommend.css';

const RecommendMain = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // 🚩 검색 관련 상태 분리
    const [searchTerm, setSearchTerm] = useState(''); // 입력창 값
    const [finalSearchTerm, setFinalSearchTerm] = useState(''); // 실제 검색에 반영될 값
    const [searchCategory, setSearchCategory] = useState('title'); // 검색 카테고리
    
    const itemsPerPage = 10; 
    const navigate = useNavigate();

    const IMAGE_SERVER_URL = "http://localhost:8080/pic/";

    const getThisMonday = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    useEffect(() => {
        const fetchRecommendData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/api/posts');
                const filtered = response.data.filter(p => p.category?.trim() === "여행 추천 게시판");
                setPosts(filtered);
            } catch (err) {
                console.error("데이터 로드 실패", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendData();
    }, []);

    const sortedPosts = useMemo(() => {
        const monday = getThisMonday();
        const thisWeekPosts = posts.filter(post => new Date(post.createdAt) >= monday);
        return [...thisWeekPosts].sort((a, b) => {
            const scoreA = (a.viewCount || 0) + (a.commentCount || 0) + (a.likes || 0);
            const scoreB = (b.viewCount || 0) + (b.commentCount || 0) + (b.likes || 0);
            return scoreB - scoreA;
        });
    }, [posts]);

    const listData = useMemo(() => {
        return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [posts]);

    // 🚩 검색 버튼 클릭 시에만 필터링되도록 finalSearchTerm 사용
    const filteredList = useMemo(() => 
        listData.filter(p => {
            const term = finalSearchTerm.toLowerCase();
            if (!term) return true; // 검색어가 없으면 전체 출력

            if (searchCategory === 'title') return p.title.toLowerCase().includes(term);
            if (searchCategory === 'user') return `user ${p.userId}`.toLowerCase().includes(term);
            if (searchCategory === 'titleContent') {
                return p.title.toLowerCase().includes(term) || (p.content && p.content.toLowerCase().includes(term));
            }
            if (searchCategory === 'destination') return p.title.toLowerCase().includes(term); 
            return true;
        }), 
        [listData, finalSearchTerm, searchCategory]
    );

    const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
    const currentItems = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 🚩 검색 실행 함수
    const handleSearch = () => {
        setFinalSearchTerm(searchTerm);
        setCurrentPage(1); // 검색 시 1페이지로 이동
    };

    const getImageUrl = (url) => {
        if (!url) return "https://placehold.co";
        return url.startsWith('http') ? url : `${IMAGE_SERVER_URL}${url}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    if (loading) return <div className="loading-state">데이터 로딩 중...</div>;

    return (
        <div className="recommend-page-root">
            <div className="top-combined-section">
                <div className="main-cards-area">
                    {sortedPosts[0] && (
                        <RecommendCard post={sortedPosts[0]} isMain={true} rank={1} onClick={(id) => navigate(`/community/photo/${id}`)} getImageUrl={getImageUrl} />
                    )}
                    <div className="sub-cards-flex">
                        {sortedPosts[1] && <RecommendCard post={sortedPosts[1]} isMain={false} rank={2} onClick={(id) => navigate(`/community/photo/${id}`)} getImageUrl={getImageUrl} />}
                        {sortedPosts[2] && <RecommendCard post={sortedPosts[2]} isMain={false} rank={3} onClick={(id) => navigate(`/community/photo/${id}`)} getImageUrl={getImageUrl} />}
                    </div>
                </div>
                
                <RankingSidebar 
                    ranking={sortedPosts.slice(3, 10)} 
                    startRank={4} 
                    onDetail={(id) => navigate(`/community/photo/${id}`)} 
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
                            <th width="120"></th>
                            <th width="100">작성자</th>
                            <th width="180">날짜</th>
                            <th width="80">조회</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((post, idx) => (
                            <tr key={post.postId} onClick={() => navigate(`/community/photo/${post.postId}`)}>
                                <td>{(filteredList.length - (currentPage-1)*itemsPerPage) - idx}</td>
                                <td className="img-td"><img src={getImageUrl(post.fileUrl)} alt="" /></td>
                                <td className="title-td">
                                    <span className="t-text">{post.title}</span>
                                </td>
                                
                                <td className="stats-td">
                                    <div className="stats-container">
                                        <div className="stat-item comment">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                            <span>{post.commentCount || 0}</span>
                                        </div>
                                        <div className="stat-item likes">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                            <span>{post.likes || 0}</span>
                                        </div>
                                    </div>
                                </td>

                                <td>User {post.userId}</td>
                                <td className="date-td">{formatDate(post.createdAt)}</td>
                                <td>{post.viewCount}</td>
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
                            {/* 🚩 카테고리 선택창 분리 (박스 형태) */}
                            <select 
                                className="search-select-box" 
                                value={searchCategory} 
                                onChange={(e) => setSearchCategory(e.target.value)}
                            >
                                <option value="title">제목</option>
                                <option value="user">작성자</option>
                                <option value="titleContent">제목+내용</option>
                                <option value="destination">여행지</option>
                            </select>

                            {/* 🚩 검색어 입력창 및 버튼 (캡슐 형태 유지) */}
                            <div className="search-input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="검색어 입력" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
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
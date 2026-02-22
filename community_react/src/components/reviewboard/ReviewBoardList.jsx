import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚩 에러 해결: 파일명이 ReviewBoardDetail.css 인 경우를 대비해 경로 수정
import './ReviewBoardDetail.css'; 

const ReviewBoardList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🚩 검색 및 페이지네이션 상태
    const [searchType, setSearchType] = useState("title");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; // 한 페이지에 사진 카드 6개

    const fallbackImage = "https://placehold.co/300x200?text=No+Image";

    // 1. 데이터 불러오기 함수 (axios 직접 연동)
    const fetchPosts = useCallback(async (type = "", keyword = "") => {
        setLoading(true);
        try {
            let url = 'http://localhost:8080/api/reviewboard/posts';
            if (keyword) {
                url += `?type=${type}&keyword=${encodeURIComponent(keyword)}`;
            }
            const response = await axios.get(url);
            
            // 최신순 정렬 (poNum 기준)
            const sortedData = [...response.data].sort((a, b) => b.poNum - a.poNum);
            
            setPosts(sortedData);
            setCurrentPage(1); // 검색 시 첫 페이지로 이동
        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // 2. 검색 실행
    const handleSearch = () => {
        fetchPosts(searchType, searchKeyword);
    };

    // 3. 페이지네이션 계산
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0); // 페이지 변경 시 상단으로 스크롤
    };

    if (loading) return <div className="loading-text">리뷰를 불러오는 중...</div>;

    return (
        <div className="main-content">
            <h2 className="board-title">| 여행 후기 게시판</h2>
            
            {/* 📸 갤러리 그리드 영역 (한 줄에 3개씩, 총 2줄 = 6개) */}
            <div className="gallery-grid">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <div 
                            key={post.poNum} 
                            className="photo-card"
                            onClick={() => navigate(`/community/reviewboard/${post.poNum}`)}
                        >
                            <div className="img-placeholder">
                                <img 
                                    src={post.fileUrl || fallbackImage} 
                                    alt={post.poTitle} 
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = fallbackImage; 
                                    }}
                                />
                            </div>
                            <div className="photo-info">
                                <p className="photo-title">
                                    {post.poTitle} 
                                    {post.commentCount > 0 && <span className="co-count"> [{post.commentCount}]</span>}
                                </p>
                                <div className="photo-meta">
                                    <span className="post-author">User {post.poMbNum}</span>
                                    <span className="post-date">
                                        {post.poDate ? post.poDate.split('T')[0] : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data-full">등록된 후기가 없습니다.</div>
                )}
            </div>

            {/* 🚩 하단 컨트롤 영역 (Recommend 게시판 스타일 적용) */}
            <div className="list-pagination-area">
                
                {/* 페이지네이션 숫자 버튼 */}
                <div className="page-buttons">
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i + 1} 
                            className={currentPage === i + 1 ? 'active' : ''}
                            onClick={() => paginate(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                {/* 하단 검색창 및 글쓰기 버튼 */}
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
                            <option value="author">작성자</option>
                        </select>
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                placeholder="후기 검색" 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="btn-search" onClick={handleSearch}>검색</button>
                        </div>
                    </div>

                    <button className="btn-write-footer" onClick={() => navigate('/community/reviewboard/write')}>
                        후기 작성
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewBoardList;
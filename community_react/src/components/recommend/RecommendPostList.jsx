import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import './Recommend.css'; 

// 🚩 [수정] 배포 서버 주소 설정 (포트 8080 유지)
const API_BASE_URL = "";
const SERVER_URL = `${API_BASE_URL}/pic/`;

const RecommendPostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchType, setSearchType] = useState("title"); 
    const [searchKeyword, setSearchKeyword] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    // 데이터 패칭 함수
    const fetchPosts = useCallback(async (type = "", keyword = "") => {
        setLoading(true);
        try {
            // 🚩 [수정] 주소 체계에 맞춰 경로 수정 (/api/recommend/posts/all -> /api/recommend)
            let url = `${API_BASE_URL}/api/recommend`;
            if (keyword) {
                url += `?type=${type}&keyword=${encodeURIComponent(keyword)}`;
            }
            const response = await api.get(url);

            const sortedData = [...response.data].map(p => {
                // 게시글 고유 ID
                const postId = p.poNum || p.po_num || p.postId;

                // 서버에서 받아온 상태 기준으로 표시
                const isBookmarked = p.isBookmarkedByMe === true || p.isBookmarked === 'Y' || p.favorited === true;
                const isLiked = p.isLikedByMe === true || p.isLiked === 'Y' || p.liked === true || p.poUpCheck === 'Y';

                return {
                    ...p,
                    postId, // 중복 없이 postId 사용
                    isBookmarkedByMe: isBookmarked,
                    favorited: isBookmarked,
                    isLikedByMe: isLiked
                };
            }).sort((a, b) => {
                const idA = a.postId || 0;
                const idB = b.postId || 0;
                return Number(idB) - Number(idA);
            });
            
            setPosts(sortedData);
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    }, [searchType, searchKeyword]);

    /**
     * 2. 초기 로딩
     */
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    /**
     * 3. 이미지 & 날짜 처리
     */
    const getImageUrl = (post) => {
        const imgData = post.fileUrl || post.poImg || post.po_img; 
        if (!imgData || imgData === "null" || imgData === "" || String(imgData).includes("undefined")) {
            return "https://placehold.co";
        }
        if (String(imgData).startsWith('http')) return imgData;
        const firstFile = String(imgData).split(',')[0].trim();
        const fileName = firstFile.split(/[\\/]/).pop();
        return `${SERVER_URL}${fileName}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchPosts(searchType, searchKeyword);
    };

    // 페이징 계산
    const totalPages = Math.ceil(posts.length / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    if (loading) return <div className="loading-text">로딩 중...</div>;

    return (
        <div className="recommend-page-root">
            <div className="bottom-list-wrapper">
                <h3 className="list-main-title">전체 추천 목록</h3>
                
                <table className="list-data-table">
                    <thead>
                        <tr>
                            <th className="th-num">번호</th>
                            <th className="th-img">여행지</th>
                            <th className="th-title">제목</th>
                            <th className="th-stats">통계</th>
                            <th className="th-author">작성자</th>
                            <th className="th-date">날짜</th>
                            <th className="th-view">조회</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPosts.length > 0 ? (
                            currentPosts.map((post) => {
                                const postId = post.poNum || post.po_num || post.postId;
                                // 🚩 즐겨찾기 상태 판단 로직 강화
                                const isFavorited = post.isBookmarkedByMe || post.isBookmarked === 'Y' || post.favorited;
                                
                                // 🚩 [수정] 작성자 닉네임 필드 매핑 보강
                                const authorNick = post.mbNickname || post.mb_nickname || post.mb_nick || post.mbNick || post.member?.mbNickname || post.member?.mb_nickname || post.member?.mbNick || post.member?.mb_nick || post.mb_id || `User ${post.poMbNum || post.po_mb_num}`;
                                
                                return (
                                    <tr key={postId} onClick={() => navigate(`/community/recommend/${postId}`)} style={{ cursor: 'pointer' }}>
                                        <td className="td-num">{postId}</td>
                                        <td className="img-td">
                                            <img 
                                                src={getImageUrl(post)} 
                                                alt="thumb" 
                                                onError={(e) => { e.target.src="https://placehold.co"; }}
                                                style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td className="title-td">{post.poTitle || post.po_title}</td>
                                        <td className="stats-td">
                                            <div className="stats-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                                                <div className="stat-item likes" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <span style={{ fontSize: '14px' }}>{isLiked ? '❤️' : '🤍'}</span>
                                                    <span>{post.poUp || post.po_up || 0}</span>
                                                </div>
                                                <div className="stat-item bookmark">
                                                    <span style={{ fontSize: '16px', color: isFavorited ? '#f1c40f' : '#ddd' }}>
                                                        {isFavorited ? '★' : '☆'}
                                                    </span>
                                                </div>
                                                <div className="stat-item comment" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <span style={{ fontSize: '14px' }}>💬</span>
                                                    <span>{post.commentCount || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="td-author">{authorNick}</td>
                                        <td className="td-date">{formatDate(post.poDate || post.po_date)}</td>
                                        <td className="td-view">{post.poView || post.po_view || 0}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="7" className="no-data">등록된 추천 게시글이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="list-pagination-area">
                    <div className="page-buttons">
                        <button disabled={currentPage === 1} onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(p - 1, 1)); }}>&lt;</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button key={pageNum} className={currentPage === pageNum ? "active" : ""} onClick={(e) => { e.stopPropagation(); setCurrentPage(pageNum); }}>{pageNum}</button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(p + 1, totalPages)); }}>&gt;</button>
                    </div>

                    <div className="footer-action-row">
                        <div className="search-footer">
                            <select className="search-select-box" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                <option value="title">제목</option>
                                <option value="content">내용</option>
                                <option value="author">작성자</option>
                                <option value="title_content">제목+내용</option>
                            </select>
                            <div className="search-input-wrapper">
                                <input type="text" placeholder="검색어를 입력하세요" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                <button className="btn-search" onClick={handleSearch}>검색</button>
                            </div>
                        </div>
                        <button className="btn-write-footer" onClick={(e) => { e.stopPropagation(); navigate('/community/recommend/write'); }}>추천글 작성</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendPostList;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios'; 
import './Recommend.css'; 

const RecommendPostList = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchType, setSearchType] = useState("title"); 
    const [searchKeyword, setSearchKeyword] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    const SERVER_URL = "http://localhost:8080/pic/";

    // 데이터 패칭 함수
    const fetchPosts = useCallback(async (type = "", keyword = "") => {
        setLoading(true);
        try {
            let url = 'http://localhost:8080/api/recommend/posts/all';
            if (keyword) {
                url += `?type=${type}&keyword=${encodeURIComponent(keyword)}`;
            }
            const response = await axios.get(url);
            
            // 🚩 [수정] 데이터 로드 시 로컬 스토리지의 최신 즐겨찾기 상태를 즉시 반영
            const storageChange = localStorage.getItem('bookmark_changed');
            let syncData = null;
            if (storageChange) {
                try { syncData = JSON.parse(storageChange); } catch(e) {}
            }

            const sortedData = [...response.data].map(p => {
                const pId = p.poNum || p.po_num || p.postId;
                let isBookmarked = p.isBookmarked === 'Y' || p.isBookmarked === true;
                
                // 로컬 스토리지에 더 최신 변경 내역이 있다면 그것을 우선함
                if (syncData && Number(syncData.id) === Number(pId)) {
                    isBookmarked = syncData.state;
                }

                return {
                    ...p,
                    isBookmarkedByMe: isBookmarked,
                    favorited: isBookmarked
                };
            }).sort((a, b) => {
                const idA = a.poNum || a.po_num || a.postId || 0;
                const idB = b.poNum || b.po_num || b.postId || 0;
                return Number(idB) - Number(idA);
            });
            
            setPosts(sortedData);
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 🚩 [수정] 상세 페이지에서의 즐겨찾기 변경을 감지하는 로직 보강
     */
    useEffect(() => {
        fetchPosts();

        const handleStorageChange = (e) => {
            if (e.key === 'bookmark_changed' && e.newValue) {
                try {
                    const { id, state } = JSON.parse(e.newValue);
                    setPosts(prevPosts => prevPosts.map(p => {
                        const pId = p.poNum || p.po_num || p.postId;
                        if (Number(pId) === Number(id)) {
                            return { 
                                ...p, 
                                isBookmarkedByMe: state,
                                isBookmarked: state ? 'Y' : 'N',
                                favorited: state 
                            };
                        }
                        return p;
                    }));
                } catch (err) {
                    console.error("Storage parse error", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchPosts]);

    /**
     * 🚩 [수정] 즐겨찾기 핸들러: 로컬 상태 업데이트 + Storage 트리거 발송
     */
    const handleBookmarkToggle = async (e, post) => {
        e.stopPropagation(); 
        const postId = post.poNum || post.po_num || post.postId;
        const isCurrentlyBookmarked = post.isBookmarkedByMe || post.isBookmarked === 'Y' || post.favorited;

        try {
            await api.post("/api/mypage/bookmarks", { poNum: Number(postId), boardType: "recommend" });
            
            const nextState = !isCurrentlyBookmarked;
            
            // 1. 현재 리스트 UI 즉시 업데이트
            setPosts(prevPosts => prevPosts.map(p => {
                const pId = p.poNum || p.po_num || p.postId;
                if (Number(pId) === Number(postId)) {
                    return { 
                        ...p, 
                        isBookmarkedByMe: nextState,
                        isBookmarked: nextState ? 'Y' : 'N',
                        favorited: nextState
                    };
                }
                return p;
            }));

            // 2. 상세 페이지나 다른 컴포넌트도 알 수 있도록 Storage에 기록
            localStorage.setItem('bookmark_changed', JSON.stringify({ 
                id: Number(postId), 
                state: nextState, 
                time: Date.now() 
            }));

            alert(nextState ? "게시글을 즐겨찾기에 등록했습니다." : "게시글 즐겨찾기를 취소했습니다.");
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.error;
            alert(msg || "즐겨찾기 처리 중 오류가 발생했습니다.");
        }
    };

    const getImageUrl = (post) => {
        const imgData = post.fileUrl || post.poImg || post.po_img; 
        if (!imgData || imgData === "null" || imgData === "" || String(imgData).includes("undefined")) {
            return "https://placehold.co/150x100?text=No+Image";
        }
        if (String(imgData).startsWith('http')) return imgData;
        const firstFile = String(imgData).split(',')[0].trim();
        const fileName = firstFile.split(/[\\/]/).pop();
        return `${SERVER_URL}${fileName}`;
    };

    const handleSearch = () => {
        fetchPosts(searchType, searchKeyword);
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

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
                                
                                // 🚩 [수정] 작성자 닉네임 필드 매핑 보강 (mbNickname 추가)
                                const authorNick = post.mbNickname || post.mb_nickname || post.mb_nick || post.mbNick || post.member?.mbNickname || post.member?.mb_nickname || post.member?.mbNick || post.member?.mb_nick || post.mb_id || `User ${post.poMbNum || post.po_mb_num}`;
                                
                                return (
                                    <tr key={postId} onClick={() => navigate(`/community/recommend/${postId}`)} style={{ cursor: 'pointer' }}>
                                        <td className="td-num">{postId}</td>
                                        <td className="img-td">
                                            <img 
                                                src={getImageUrl(post)} 
                                                alt="thumb" 
                                                onError={(e) => { e.target.src="https://placehold.co/150x100?text=No+Image"; }}
                                                style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td className="title-td">{post.poTitle || post.po_title}</td>
                                        <td className="stats-td">
                                            <div className="stats-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                                                <div className="stat-item likes" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#e74c3c' }}>
                                                    <span style={{ fontSize: '14px' }}>❤️</span>
                                                    <span style={{ color: '#333' }}>{post.poUp || post.po_up || 0}</span>
                                                </div>
                                                <div 
                                                    className="stat-item bookmark" 
                                                    onClick={(e) => handleBookmarkToggle(e, post)}
                                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                                >
                                                    <span style={{ fontSize: '16px', color: isFavorited ? '#f1c40f' : '#ddd' }}>
                                                        {isFavorited ? '★' : '☆'}
                                                    </span>
                                                </div>
                                                <div className="stat-item comment" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#1890ff' }}>
                                                    <span style={{ fontSize: '14px' }}>💬</span>
                                                    <span style={{ color: '#333' }}>{post.commentCount || 0}</span>
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
                            <tr>
                                <td colSpan="7" className="no-data">등록된 추천 게시글이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="list-pagination-area">
                    <div className="page-buttons">
                        <button 
                            disabled={currentPage === 1}
                            onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(p - 1, 1)); }}
                        >&lt;</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button 
                                key={pageNum} 
                                className={currentPage === pageNum ? "active" : ""}
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    setCurrentPage(pageNum);
                                }}
                            >
                                {pageNum}
                            </button>
                        ))}
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(p + 1, totalPages)); }}
                        >&gt;</button>
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
                                <option value="author">작성자</option>
                                <option value="title_content">제목+내용</option>
                            </select>
                            <div className="search-input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="검색어를 입력하세요" 
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                                />
                                <button className="btn-search" onClick={handleSearch}>검색</button>
                            </div>
                        </div>
                        <button 
                            className="btn-write-footer" 
                            onClick={(e) => { e.stopPropagation(); navigate('/community/recommend/write'); }}
                        >
                            추천글 작성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendPostList;
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecommendCard from './RecommendCard';
import RankingSidebar from './RankingSidebar';
import api from '../../api/axios'; 
import './Recommend.css';

const RecommendMain = ({ posts: initialPosts = [] }) => {
    // 🚩 로컬 상태로 posts 관리 (즐겨찾기 토글 시 즉시 반영)
    const [posts, setPosts] = useState(initialPosts);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [finalSearchTerm, setFinalSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('title');
    
    const itemsPerPage = 10;
    const navigate = useNavigate();

    // 부모로부터 받은 initialPosts가 변경될 때 로컬 상태 동기화
    useEffect(() => {
        setPosts(initialPosts);
    }, [initialPosts]);

    // 🚩 [유지] 상세 페이지에서 즐겨찾기 누르고 돌아왔을 때 즉시 반영하는 로직
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'bookmark_changed' || e.key === 'last_bookmark_update') {
                try {
                    const data = JSON.parse(e.newValue);
                    const changedId = data.id || data.poNum;
                    const state = data.state !== undefined ? data.state : data.isBookmarked;

                    setPosts(prevPosts => prevPosts.map(p => {
                        const pId = p.poNum || p.po_num;
                        if (Number(pId) === Number(changedId)) {
                            return { 
                                ...p, 
                                isBookmarked: state ? 'Y' : 'N', 
                                isBookmarkedByMe: state,
                                favorited: state
                            };
                        }
                        return p;
                    }));
                } catch (err) { console.error(err); }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // 🚩 [수정] 자동 배포 환경을 위한 서버 URL 설정 (환경 변수 우선 사용)
    const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    const goToDetail = (id) => {
        if (!id) return;
        navigate(`/community/recommend/${id}`);
    };

    /**
     * 🚩 즐겨찾기 핸들러: 서버 통신 후 로컬 상태 즉시 업데이트
     */
    const handleBookmarkToggle = async (e, post) => {
        if (e && e.stopPropagation) e.stopPropagation(); 
        const postId = post.poNum || post.po_num;
        
        // 즐겨찾기 상태 판단
        const isCurrentlyBookmarked = post.isBookmarked === 'Y' || post.isBookmarked === true || post.isBookmarkedByMe || post.favorited;

        try {
            await api.post("/api/mypage/bookmarks", { 
                poNum: Number(postId), 
                boardType: "recommend" 
            });
            
            const newState = !isCurrentlyBookmarked;
            
            if (isCurrentlyBookmarked) {
                alert("즐겨찾기가 취소되었습니다.");
            } else {
                alert("즐겨찾기에 등록되었습니다.");
            }

            // 🚩 리스트 상태 즉시 업데이트
            setPosts(prevPosts => prevPosts.map(p => {
                const pId = p.poNum || p.po_num;
                if (Number(pId) === Number(postId)) {
                    return { 
                        ...p, 
                        isBookmarked: newState ? 'Y' : 'N', 
                        isBookmarkedByMe: newState,
                        favorited: newState
                    };
                }
                return p;
            }));

            // 전역 상태 전파 (상세페이지와 공유용)
            localStorage.setItem('bookmark_changed', JSON.stringify({ id: postId, state: newState, time: Date.now() }));

        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.error;
            alert(msg || "처리 중 오류가 발생했습니다.");
        }
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
        if (!Array.isArray(posts)) return [];
        const monday = getThisMonday();
        let targetPosts = posts.filter(post => {
            const postDate = post?.poDate || post?.po_date;
            return postDate && new Date(postDate) >= monday;
        });
        if (targetPosts.length === 0) targetPosts = posts;
        
        return [...targetPosts].sort((a, b) => 
            ((b.poView || b.po_view || 0)) - ((a.poView || a.po_view || 0))
        );
    }, [posts]);

    const listData = useMemo(() => {
        if (!Array.isArray(posts)) return [];
        return [...posts].sort((a, b) => {
            const dateA = new Date(a.poDate || a.po_date || 0);
            const dateB = new Date(b.poDate || b.po_date || 0);
            return dateB - dateA;
        });
    }, [posts]);

    const filteredList = useMemo(() => 
        listData.filter(p => {
            if (!p) return false;
            const term = finalSearchTerm.toLowerCase();
            if (!term) return true;
            const title = (p.poTitle || p.po_title || "").toLowerCase();
            const content = (p.poContent || p.po_content || "").toLowerCase();
            // 🚩 [수정] 검색 시 mbNickname 필드 포함
            const authorNick = (p.mbNickname || p.mb_nickname || p.mb_nick || p.mbNick || p.member?.mbNickname || p.member?.mbNick || p.member?.mb_nickname || `user ${p.poMbNum || p.po_mb_num}`).toLowerCase();
            
            if (searchCategory === 'title') return title.includes(term);
            if (searchCategory === 'content') return content.includes(term);
            if (searchCategory === 'user') return authorNick.includes(term);
            if (searchCategory === 'titleContent') return title.includes(term) || content.includes(term);
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

    const getImageUrl = (post) => {
        const defaultImg = "https://placehold.co/600x400?text=No+Image";
        if (!post) return defaultImg;
        const { poImg, po_img, fileName, fileUrl, image, poContent, po_content } = post;
        const targetUrl = poImg || po_img || fileName || fileUrl || image;
        if (targetUrl && String(targetUrl) !== "null" && String(targetUrl).trim() !== "") {
            if (String(targetUrl).startsWith('http') || String(targetUrl).startsWith('data:')) return targetUrl;
            const extractedName = String(targetUrl).split(/[\\/]/).pop();
            return `${SERVER_URL}/pic/${extractedName}`;
        }
        const content = poContent || po_content;
        if (content && typeof content === 'string') {
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/;
            const match = content.match(imgRegex);
            if (match && match[1]) {
                const src = match[1];
                if (src.startsWith('/pic/')) return `${SERVER_URL}${src}`;
                if (src.startsWith('pic/')) return `${SERVER_URL}/${src}`;
                return src;
            }
        }
        return defaultImg; 
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "-";
            return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        } catch (e) { return "-"; }
    };

    return (
        <div className="recommend-page-root">
            <div className="top-combined-section">
                <div className="main-cards-area">
                    {sortedPosts[0] && (
                        <RecommendCard 
                            post={sortedPosts[0]} 
                            isMain={true} 
                            rank={1} 
                            onClick={(id) => goToDetail(id)} 
                            getImageUrl={getImageUrl} 
                            onBookmarkToggle={(postId) => handleBookmarkToggle(null, sortedPosts[0])}
                        />
                    )}
                    <div className="sub-cards-flex">
                        {sortedPosts[1] && (
                            <RecommendCard 
                                post={sortedPosts[1]} 
                                isMain={false} 
                                rank={2} 
                                onClick={(id) => goToDetail(id)} 
                                getImageUrl={getImageUrl} 
                                onBookmarkToggle={(postId) => handleBookmarkToggle(null, sortedPosts[1])}
                            />
                        )}
                        {sortedPosts[2] && (
                            <RecommendCard 
                                post={sortedPosts[2]} 
                                isMain={false} 
                                rank={3} 
                                onClick={(id) => goToDetail(id)} 
                                getImageUrl={getImageUrl} 
                                onBookmarkToggle={(postId) => handleBookmarkToggle(null, sortedPosts[2])}
                            />
                        )}
                    </div>
                </div>
                {/* 🚩 [수정] RankingSidebar에 onBookmarkToggle 핸들러 연결 */}
                <RankingSidebar 
                    ranking={sortedPosts.slice(3, 10)} 
                    startRank={4} 
                    onDetail={(id) => goToDetail(id)} 
                    getImageUrl={getImageUrl} 
                    onBookmarkToggle={(postId) => {
                        const targetPost = posts.find(p => (p.poNum || p.po_num) === postId);
                        if (targetPost) handleBookmarkToggle(null, targetPost);
                    }}
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
                            <th width="140">통계</th>
                            <th width="100">작성자</th>
                            <th width="180">날짜</th>
                            <th width="80">조회</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((post, idx) => {
                                const postId = post.poNum || post.po_num;
                                const isFavorited = post.isBookmarked === 'Y' || post.isBookmarked === true || post.isBookmarkedByMe || post.favorited;
                                // 🚩 [수정] 목록 출력 시 mbNickname 필드 우선 순위 적용
                                const authorNick = post.mbNickname || post.mb_nickname || post.mb_nick || post.mbNick || post.member?.mbNickname || post.member?.mb_nickname || post.member?.mbNick || `User ${post.poMbNum || post.po_mb_num}`;

                                return (
                                    <tr key={postId || idx} onClick={() => goToDetail(postId)} style={{ cursor: 'pointer' }}>
                                        <td>{(filteredList.length - (currentPage-1)*itemsPerPage) - idx}</td>
                                        <td className="img-td">
                                            <img 
                                                src={getImageUrl(post)} 
                                                alt="thumb" 
                                                onError={(e) => { 
                                                    if (e.target.src !== "https://placehold.co/600x400?text=No+Image") {
                                                        e.target.src = "https://placehold.co/600x400?text=No+Image"; 
                                                    }
                                                }} 
                                            />
                                        </td>
                                        <td className="title-td"><span className="t-text">{post.poTitle || post.po_title || "제목 없음"}</span></td>
                                        <td className="stats-td">
                                            <div className="stats-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                                                <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <span style={{ fontSize: '12px' }}>💬</span>
                                                    <span>{post.commentCount || post.co_count || 0}</span>
                                                </div>
                                                <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#e74c3c' }}>
                                                    <span style={{ fontSize: '12px' }}>❤️</span>
                                                    <span>{post.poUp || post.po_up || 0}</span>
                                                </div>
                                                <div 
                                                    className="stat-item" 
                                                    onClick={(e) => handleBookmarkToggle(e, post)}
                                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                                >
                                                    <span style={{ fontSize: '16px', color: isFavorited ? '#f1c40f' : '#ddd' }}>
                                                        {isFavorited ? '★' : '☆'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{authorNick}</td>
                                        <td className="date-td">{formatDate(post.poDate || post.po_date)}</td>
                                        <td>{post.poView || post.po_view || 0}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>게시글이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="list-pagination-area">
                    <div className="page-buttons">
                        <button className="prev-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lt;</button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i+1} className={currentPage === i+1 ? 'active' : ''} onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                        ))}
                        <button className="next-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&gt;</button>
                    </div>
                    
                    <div className="footer-action-row">
                        <div className="search-footer">
                            <select className="search-select-box" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                <option value="title">제목</option>
                                <option value="content">내용</option>
                                <option value="titleContent">제목+내용</option>
                                <option value="user">작성자</option>
                            </select>
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
                        <button className="btn-write-footer" onClick={() => navigate('/community/recommend/write')}>추천 글쓰기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendMain;
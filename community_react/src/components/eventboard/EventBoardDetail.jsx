import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
// 🚩 디자인 일관성을 위해 수정된 CSS 파일 참조
import './EventBoardDetail.css'; 

const EventBoardDetail = () => {
    const { poNum } = useParams(); 
    const navigate = useNavigate();
    
    // 상위 context 데이터
    const { user, loadPosts } = useOutletContext() || {}; 
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const isLoggedIn = !!user; 
    const SERVER_URL = "http://localhost:8080";

    const currentUserNum = user ? (user.mb_num || user.mbNum) : null; 
    const isAdmin = user ? (user.mb_rol === 'ADMIN' || user.mbRol === 'ADMIN' || user.mbLevel >= 10) : false; 
    const isNumericId = poNum && !isNaN(Number(poNum));

    const formatContent = (content) => {
        if (!content) return "";
        return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const fetchPostData = useCallback(async () => {
        if (!isNumericId) return;
        try {
            setLoading(true);
            const postRes = await axios.get(`${SERVER_URL}/api/event/posts/${poNum}?mbNum=${currentUserNum || ''}`);
            const data = postRes.data;
            const normalizedData = {
                ...data,
                po_title: data.po_title || data.poTitle || "제목 없음",
                po_content: data.po_content || data.poContent || "",
                po_view: data.po_view || data.poView || 0,
                po_up: data.po_up || data.poUp || 0,
                po_date: data.po_date || data.poDate
            };
            setPost(normalizedData);
            setIsLiked(data.isLikedByMe || data.liked || false);
        } catch (err) {
            console.error("데이터 로딩 실패:", err);
            navigate(`/news/event`); 
        } finally {
            setLoading(false);
        }
    }, [poNum, navigate, isNumericId, currentUserNum, SERVER_URL]);

    useEffect(() => { 
        if(isNumericId) fetchPostData();
    }, [isNumericId, fetchPostData]);

    const handleDeletePost = async () => {
        if (!window.confirm("정말 게시글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/event/posts/${poNum}`);
            alert("게시글이 삭제되었습니다.");
            if (loadPosts) loadPosts(); 
            navigate(`/news/event`); 
        } catch (err) {
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/event/posts/${poNum}/like`, { mbNum: currentUserNum });
            if (res.data.status === "liked" || res.data === "liked") {
                setIsLiked(true);
                setPost(prev => ({ ...prev, po_up: (prev.po_up || 0) + 1 }));
            } else {
                setIsLiked(false);
                setPost(prev => ({ ...prev, po_up: Math.max(0, (prev.po_up || 1) - 1) }));
            }
        } catch (err) { 
            alert("추천 처리 중 오류 발생"); 
        }
    };

    if (loading) return <div style={{textAlign: 'center', padding: '100px'}}>데이터 로딩 중...</div>;
    if (!post) return null;

    return (
        /* 🚩 공지사항 상세와 동일한 래퍼 클래스 사용 (여백 및 위치 통일) */
        <div className="review-detail-wrapper">
            <div className="detail-container">
                
                {/* 🚩 헤더 섹션: 공지사항과 완벽하게 동일한 구조 */}
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.po_title}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: 관리자</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.po_view}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {post.po_up}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {post.po_date ? new Date(post.po_date).toLocaleString() : ''}</span>
                    </div>
                </div>
                
                {/* 🚩 본문 섹션: 줄바꿈, 폰트 크기, 이미지 정렬 일관성 유지 */}
                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.po_content) }} />
                </div>

                {/* 🚩 하단 버튼 영역: 버튼 크기 및 좌우 배치 통일 */}
                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && (
                            <button 
                                className="btn-bookmark-action" 
                                onClick={handleLikeToggle}
                                style={{ 
                                    backgroundColor: isLiked ? '#ff4757' : '#f1f2f6', 
                                    color: isLiked ? 'white' : 'black', 
                                    marginRight: 8 
                                }}
                            >
                                {isLiked ? '❤️ 추천됨' : '🤍 추천하기'} {post.po_up}
                            </button>
                        )}
                        {isAdmin && (
                            <>
                                <button 
                                    className="btn-edit-action" 
                                    onClick={() => navigate(`/news/event/write`, { 
                                        state: { mode: 'edit', postData: post, boardType: 'event' } 
                                    })}
                                >
                                    ✏️ 수정
                                </button>
                                <button className="btn-delete-action" onClick={handleDeletePost}>🗑️ 삭제</button>
                            </>
                        )}
                    </div>
                    {/* 🚩 우측 목록으로 버튼 위치 고정 */}
                    <button className="btn-list-return" onClick={() => navigate(`/news/event`)}>
                        목록으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventBoardDetail;
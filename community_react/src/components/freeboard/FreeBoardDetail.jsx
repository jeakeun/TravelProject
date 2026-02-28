import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
// import axios from 'axios'; // 사용하지 않는 임포트 제거하여 경고 해결
import api from '../../api/axios'; 
import { getMemberNum } from '../../utils/user';
import { addRecentView } from '../../utils/recentViews'; 
import ReportModal from '../ReportModal'; 
import './FreeBoardDetail.css'; 

const FreeBoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(0); 
    const [isLiked, setIsLiked] = useState(false); 

    const [reportModal, setReportModal] = useState({ open: false, type: 'post', targetId: null });

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);

    const SERVER_URL = "";

    const formatContent = (content) => {
        if (!content) return "";
        if (SERVER_URL) {
            return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
        }
        return content;
    };

    /**
     * 🚩 [유지] DB 스키마(po_up)에 맞춰 데이터 로딩 및 상태 동기화
     */
    const fetchDetail = useCallback(async () => {
        if (id === 'write') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get(`/api/freeboard/posts/${id}`, {
                params: { mbNum: currentUserNum }
            });
            
            const data = res.data;
            setPost(data);

            // 추천수 동기화
            setLikeCount(data.poUp ?? data.po_up ?? data.poLike ?? 0);
            
            // 추천 여부 및 즐겨찾기 상태 동기화
            setIsLiked(data.isLikedByMe === true || data.isLiked === 'Y' || data.liked === true);
            setIsBookmarked(data.isBookmarkedByMe === true || data.isBookmarked === 'Y');

            addRecentView({ boardType: 'freeboard', poNum: Number(id), poTitle: data?.poTitle });
        } catch (err) {
            console.error("상세보기 로딩 에러:", err);
            alert("게시글을 불러올 수 없습니다.");
            navigate('/community/freeboard');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, currentUserNum]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    if (id === 'write') return null;
    if (loading) return <div className="loading-box">데이터 로딩 중...</div>;
    if (!post) return null;

    const isOwner = isLoggedIn && Number(post.poMbNum) === Number(currentUserNum);

    const actionButtonStyle = {
        padding: '10px 25px',
        borderRadius: '30px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.2s ease',
        fontSize: '14px'
    };

    const handleBookmark = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            await api.post(`/api/freeboard/posts/${id}/bookmark`, { mbNum: currentUserNum });
            setIsBookmarked(!isBookmarked);
            alert(!isBookmarked ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 취소되었습니다.");
        } catch (err) {
            alert("즐겨찾기 처리에 실패했습니다.");
        }
    };

    const handleLike = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await api.post(`/api/freeboard/posts/${id}/like`, {
                mbNum: currentUserNum
            });
            
            if (res.data.status === "liked") {
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
                alert("게시글을 추천했습니다.");
            } else if (res.data.status === "unliked") {
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
                alert("추천을 취소했습니다.");
            }
        } catch (err) {
            alert("추천 처리 중 오류가 발생했습니다.");
        }
    };

    const handleReportPost = () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        setReportModal({ open: true, type: 'post', targetId: id });
    };

    const handleReportSubmit = async ({ category, reason }) => {
        try {
            await api.post(`/api/freeboard/posts/${id}/report`, { 
                category, 
                reason, 
                mbNum: currentUserNum 
            });
            alert("신고가 정상적으로 접수되었습니다.");
            fetchDetail(); 
        } catch (err) {
            alert(err.response?.data?.msg || "오류가 발생했습니다.");
        } finally {
            setReportModal({ open: false, type: 'post', targetId: null });
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await api.delete(`/api/freeboard/posts/${id}`);
            alert("삭제되었습니다.");
            navigate('/community/freeboard');
        } catch (err) {
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const postAuthorNick = post.member?.mbNickname || post.mbNickname || post.mb_nickname || post.authorNick || `User ${post.poMbNum}`;

    return (
        <div className="review-detail-wrapper">
            <div className="detail-container">
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.poTitle}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: {postAuthorNick}</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.poView}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {likeCount}</span>
                        <span className="info-divider">|</span>
                        <span style={{ color: post.poReport > 0 ? '#e74c3c' : 'inherit', fontWeight: post.poReport > 0 ? 'bold' : 'normal' }}>
                            신고 {post.poReport || 0}
                        </span>
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.poDate).toLocaleString()}</span>
                    </div>
                </div>

                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: formatContent(post.poContent) }} />
                </div>
                
                <div className="detail-bottom-actions">
                    <div className="left-group" style={{ display: 'flex', gap: '10px' }}>
                        {isLoggedIn && (
                            <>
                                <button 
                                    className={`btn-like-action ${isLiked ? 'active' : ''}`} 
                                    onClick={handleLike}
                                    style={{ 
                                        ...actionButtonStyle, 
                                        background: isLiked ? '#e74c3c' : '#fff', 
                                        border: '1px solid #e74c3c', 
                                        color: isLiked ? '#fff' : '#e74c3c' 
                                    }}
                                >
                                    {isLiked ? '❤️' : '🤍'} 추천 {likeCount}
                                </button>
                                <button 
                                    className="btn-bookmark-action" 
                                    onClick={handleBookmark} 
                                    style={{ 
                                        ...actionButtonStyle, 
                                        background: isBookmarked ? '#f1c40f' : '#fff', 
                                        border: '1px solid #f1c40f',
                                        color: isBookmarked ? '#fff' : '#f1c40f' 
                                    }}
                                >
                                    {isBookmarked ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
                                </button>
                                {!isOwner && (
                                    <button 
                                        className="btn-report-action" 
                                        onClick={handleReportPost}
                                        style={{ ...actionButtonStyle, background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f' }}
                                    >
                                        🚨 신고
                                    </button>
                                )}
                            </>
                        )}
                        {isOwner && (
                            <>
                                <button 
                                    className="btn-edit-action" 
                                    /* 🚩 경로 수정: recommend -> freeboard/edit */
                                    onClick={() => navigate(`/community/freeboard/edit/${id}`, { 
                                        state: { mode: 'edit', postData: post, boardType: 'freeboard' } 
                                    })}
                                    style={{ ...actionButtonStyle, background: '#fff', border: '1px solid #3498db', color: '#3498db' }}
                                >
                                    ✏️ 수정
                                </button>
                                <button 
                                    className="btn-delete-action" 
                                    onClick={handleDelete}
                                    style={{ ...actionButtonStyle, background: '#fff', border: '1px solid #e67e22', color: '#e67e22' }}
                                >
                                    🗑️ 삭제
                                </button>
                            </>
                        )}
                    </div>
                    
                    <button 
                        className="btn-list-return" 
                        onClick={() => navigate('/community/freeboard')}
                        style={{ ...actionButtonStyle, background: '#fff', border: '1px solid #34495e', color: '#34495e' }}
                    >
                        목록으로
                    </button>
                </div>
            </div>

            <ReportModal
                isOpen={reportModal.open}
                onClose={() => setReportModal({ open: false, type: 'post', targetId: null })}
                onSubmit={handleReportSubmit}
                title="게시글 신고하기"
            />
        </div>
    );
};

export default FreeBoardDetail;
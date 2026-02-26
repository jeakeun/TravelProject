import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import { getMemberNum } from '../../utils/user';
import { addRecentView } from '../../utils/recentViews'; 
import ReportModal from '../ReportModal'; // 🚩 신고 모달 컴포넌트 임포트
import './FreeBoardDetail.css'; 

const FreeBoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(0); 
    const [isLiked, setIsLiked] = useState(false); // 🚩 추천 여부 상태 추가

    // 🚩 신고 모달 상태 추가
    const [reportModal, setReportModal] = useState({ open: false, type: 'post', targetId: null });

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);

    // 🚩 [유지] 자동 배포 환경을 위해 빈 공백 설정
    const SERVER_URL = "";

    /**
     * 🚩 본문 내 이미지 경로 처리 로직 보완
     */
    const formatContent = (content) => {
        if (!content) return "";
        if (SERVER_URL) {
            return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
        }
        return content;
    };

    const fetchDetail = useCallback(async () => {
        if (id === 'write') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(`${SERVER_URL}/api/freeboard/posts/${id}`);
            setPost(res.data);
            setLikeCount(res.data?.poLike || 0);
            setIsLiked(res.data?.isLikedByMe || false); // 추천 여부 초기화
            
            // 즐겨찾기 상태 초기화 (백엔드 필드명에 맞게 체크)
            const bookmarkStatus = res.data.isBookmarkedByMe || res.data.isBookmarked === 'Y';
            setIsBookmarked(bookmarkStatus);

            addRecentView({ boardType: 'freeboard', poNum: Number(id), poTitle: res.data?.poTitle });
        } catch (err) {
            console.error("상세보기 로딩 에러:", err);
            alert("게시글을 불러올 수 없습니다.");
            navigate('/community/freeboard');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, SERVER_URL]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    if (id === 'write') return null;
    if (loading) return <div className="loading-box">데이터 로딩 중...</div>;
    if (!post) return null;

    const isOwner = isLoggedIn && Number(post.poMbNum) === Number(currentUserNum);

    // 🚩 RecommendPostDetail과 동일한 버튼 스타일 (둥근 디자인)
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
            await api.post("/api/mypage/bookmarks", { poNum: Number(id), boardType: "freeboard" });
            setIsBookmarked(!isBookmarked);
            alert(!isBookmarked ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 취소되었습니다.");
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.error;
            alert(msg || "즐겨찾기 처리에 실패했습니다.");
        }
    };

    const handleLike = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/freeboard/posts/${id}/like`);
            // 추천/취소 상태에 따른 실시간 처리
            if (res.data.status === "liked" || !isLiked) {
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
                alert("게시글을 추천했습니다.");
            } else {
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
                alert("추천을 취소했습니다.");
            }
        } catch (err) {
            alert(err.response?.data?.msg || "이미 추천하셨거나 오류가 발생했습니다.");
        }
    };

    // 🚩 신고하기 로직 추가
    const handleReportPost = () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        setReportModal({ open: true, type: 'post', targetId: id });
    };

    const handleReportSubmit = async ({ category, reason }) => {
        try {
            await axios.post(`${SERVER_URL}/api/freeboard/posts/${id}/report`, { 
                category, 
                reason, 
                mbNum: currentUserNum 
            });
            alert("신고가 정상적으로 접수되었습니다.");
        } catch (err) {
            alert(err.response?.data?.msg || "이미 신고했거나 오류가 발생했습니다.");
        } finally {
            setReportModal({ open: false, type: 'post', targetId: null });
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/freeboard/posts/${id}`);
            alert("삭제되었습니다.");
            navigate('/community/freeboard');
        } catch (err) {
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 🚩 [수정] 작성자 닉네임 로직: 연관 관계 member 객체를 최우선으로 참조하도록 수정
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
                                {/* 🚩 추천 버튼: 하트 아이콘 및 RecommendPostDetail 스타일 적용 */}
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
                                    onClick={() => navigate(`/community/freeboard/edit/${id}`)}
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

            {/* 🚩 신고 모달 추가 */}
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
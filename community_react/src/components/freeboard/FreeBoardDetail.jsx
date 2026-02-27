import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import { getMemberNum } from '../../utils/user';
import { addRecentView } from '../../utils/recentViews'; 
import ReportModal from '../ReportModal'; 
import './FreeBoardDetail.css'; 

const FreeBoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    
    // --- 기존 상태 유지 ---
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(0); 
    const [isLiked, setIsLiked] = useState(false); 
    const [reportModal, setReportModal] = useState({ open: false, type: 'post', targetId: null });

    // --- [이식됨] 댓글 관련 상태 추가 ---
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState(""); 
    const [editId, setEditId] = useState(null);           
    const [editInput, setEditInput] = useState("");       
    const [replyTo, setReplyTo] = useState(null);         
    const [replyInput, setReplyInput] = useState(""); 

    const commentAreaRef = useRef(null);
    const replyInputRef = useRef(null);

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);
    const isAdmin = user ? (Number(user.mbLevel ?? user.mb_score ?? 0) >= 10 || user.mb_rol === 'ADMIN') : false; 
    
    const SERVER_URL = "";

    const formatContent = (content) => {
        if (!content) return "";
        if (SERVER_URL) {
            return content.replace(/src="\/pic\//g, `src="${SERVER_URL}/pic/`);
        }
        return content;
    };

    const fetchDetail = useCallback(async (isAction = false, isCommentAction = false) => {
        if (id === 'write') {
            setLoading(false);
            return;
        }

        try {
            if (!isAction) setLoading(true);
            
            // 1. 게시글 상세 정보
            const res = await axios.get(`${SERVER_URL}/api/freeboard/posts/${id}`);
            const data = res.data;
            setPost(data);
            setLikeCount(data?.poUp || data?.poLike || 0); 
            setIsLiked(data?.isLikedByMe || false); 
            
            const bookmarkStatus = data?.isBookmarkedByMe || data?.isBookmarked === 'Y';
            setIsBookmarked(bookmarkStatus);

            addRecentView({ boardType: 'freeboard', poNum: Number(id), poTitle: data?.poTitle });

            // 2. 댓글 리스트 정보
            const commentRes = await axios.get(`${SERVER_URL}/api/comment/list/${id}`);
            setComments(commentRes.data || []);

            if (isCommentAction && commentAreaRef.current) {
                commentAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (err) {
            console.error("로딩 에러:", err);
            if (!isAction) {
                alert("게시글 정보를 불러올 수 없습니다.");
                navigate('/community/freeboard');
            }
        } finally {
            if (!isAction) setLoading(false);
        }
    }, [id, navigate, SERVER_URL]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    useEffect(() => {
        if (replyTo && replyInputRef.current) replyInputRef.current.focus();
    }, [replyTo]);

    // --- 댓글 조작 함수들 (api 인스턴스 사용 권장되나 기존 axios 유지 시 withCredentials 추가) ---
    const handleAddComment = async (parentId = null) => {
        if(!isLoggedIn) return alert("로그인 후 댓글 작성이 가능합니다.");
        const content = parentId ? replyInput : commentInput;
        if (!content?.trim()) return alert("내용을 입력하세요.");
        try {
            await api.post(`/api/comment/add/${id}`, { 
                content: content.trim(), parentId: parentId, mbNum: currentUserNum 
            });
            setCommentInput(""); setReplyInput(""); setReplyTo(null);
            fetchDetail(true, true); 
        } catch (err) { alert("등록 실패"); }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editInput?.trim()) return alert("내용을 입력하세요.");
        try {
            await api.put(`/api/comment/update/${commentId}`, { content: editInput.trim() });
            setEditId(null); setEditInput("");
            fetchDetail(true, true);
        } catch (err) { alert("수정 실패"); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await api.delete(`/api/comment/delete/${commentId}`);
            fetchDetail(true, true);
        } catch (err) { alert("삭제 실패"); }
    };

    const handleCommentLike = async (commentId) => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await api.post(`/api/comment/like/${commentId}`, { mbNum: currentUserNum });
            const isLikedNow = res.data.status === "liked";
            setComments(prev => prev.map(c => 
                c.coNum === commentId ? { ...c, coLike: isLikedNow ? (c.coLike || 0) + 1 : Math.max(0, (c.coLike || 0) - 1) } : c
            ));
        } catch (err) { alert("추천 처리 중 오류가 발생했습니다."); }
    };

    const renderComments = (targetParentId = null, depth = 0) => {
        const filtered = comments.filter(c => {
            const oriNum = c.coOriNum || 0;
            return targetParentId === null ? oriNum === 0 : Number(oriNum) === Number(targetParentId);
        });
        if (targetParentId === null) filtered.sort((a, b) => b.coNum - a.coNum);
        else filtered.sort((a, b) => a.coNum - b.coNum);

        return filtered.map(comment => {
            const isCommentOwner = isLoggedIn && (Number(comment.coMbNum) === Number(currentUserNum));
            const isActiveEdit = editId === comment.coNum;
            const isActiveReply = replyTo === comment.coNum;
            const authorDisplayName = comment.coNickname || comment.mbNickname || comment.mb_nickname || "알 수 없는 사용자";

            return (
                <div key={comment.coNum}>
                    <div className="comment-unit" style={{ marginLeft: depth > 0 ? (depth * 20) + 'px' : '0', padding: '15px 20px', borderBottom: '1px solid #f0f0f0', backgroundColor: depth > 0 ? '#f9fafb' : 'transparent', borderLeft: depth > 0 ? '3px solid #ddd' : 'none' }}>
                        <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '14px' }}>{authorDisplayName}</strong>
                                <span style={{ fontSize: '12px', color: '#aaa' }}>{new Date(comment.coDate).toLocaleString()}</span>
                                <button onClick={() => handleCommentLike(comment.coNum)} style={{ background: 'none', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', color: '#555' }}>👍 {comment.coLike || 0}</button>
                            </div>
                            {!isActiveEdit && !isActiveReply && (
                                <div className="comment-btns" style={{ fontSize: '12px', color: '#888', display: 'flex', gap: '10px', cursor: 'pointer' }}>
                                    <span onClick={() => { setReplyTo(comment.coNum); setEditId(null); }}>답글</span>
                                    {isCommentOwner && (
                                        <span onClick={() => { setEditId(comment.coNum); setEditInput(comment.coContent); }}>수정</span>
                                    )}
                                    {(isCommentOwner || isAdmin) && (
                                        <span onClick={() => handleDeleteComment(comment.coNum)}>삭제</span>
                                    )}
                                    <span onClick={() => setReportModal({ open: true, type: 'comment', targetId: comment.coNum })} style={{ color: '#ff4d4f' }}>신고</span>
                                </div>
                            )}
                        </div>
                        {isActiveEdit ? (
                            <div style={{ background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                <textarea style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '60px' }} value={editInput} onChange={(e) => setEditInput(e.target.value)} />
                                <div style={{ textAlign: 'right', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                                    <button onClick={() => setEditId(null)} style={{ background: '#eee', color: '#333', border: 'none', padding: '6px 18px', borderRadius: '20px', cursor: 'pointer', marginRight: '8px' }}>취소</button>
                                    <button onClick={() => handleUpdateComment(comment.coNum)} style={{ background: '#333', color: '#fff', border: 'none', padding: '6px 18px', borderRadius: '20px', cursor: 'pointer' }}>수정</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{comment.coContent}</div>
                        )}
                        {isActiveReply && (
                            <div style={{ marginTop: '10px', padding: '15px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
                                <textarea ref={replyInputRef} style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '60px' }} placeholder={`${authorDisplayName}님께 답글 남기기`} value={replyInput} onChange={(e) => setReplyInput(e.target.value)} />
                                <div style={{ textAlign: 'right', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                                    <button onClick={() => setReplyTo(null)} style={{ background: '#eee', color: '#333', border: 'none', padding: '6px 18px', borderRadius: '20px', cursor: 'pointer', marginRight: '8px' }}>취소</button>
                                    <button onClick={() => handleAddComment(comment.coNum)} style={{ background: '#333', color: '#fff', border: 'none', padding: '6px 18px', borderRadius: '20px', cursor: 'pointer' }}>등록</button>
                                </div>
                            </div>
                        )}
                    </div>
                    {renderComments(comment.coNum, depth + 1)}
                </div>
            );
        });
    };

    // --- [수정] 401 에러 해결을 위해 api 인스턴스 사용 ---
    const handleBookmark = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await api.post(`/api/freeboard/posts/${id}/bookmark`, { 
                mbNum: currentUserNum 
            });
            const isAdded = res.data.status === "ADDED";
            setIsBookmarked(isAdded);
            alert(isAdded ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 취소되었습니다.");
        } catch (err) {
            console.error("즐겨찾기 에러:", err);
            alert("즐겨찾기 처리에 실패했습니다.");
        }
    };

    // --- [수정] 401 에러 해결을 위해 api 인스턴스 사용 ---
    const handleLike = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await api.post(`/api/freeboard/posts/${id}/like`);
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
            alert(err.response?.data?.msg || "이미 추천하셨거나 오류가 발생했습니다.");
        }
    };

    const handleReportPost = () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        setReportModal({ open: true, type: 'post', targetId: id });
    };

    const handleReportSubmit = async ({ category, reason }) => {
        const { type, targetId } = reportModal;
        try {
            if (type === 'post') {
                await api.post(`/api/freeboard/posts/${id}/report`, { category, reason, mbNum: currentUserNum });
            } else {
                await api.post(`/api/comment/report/${targetId}`, { category, reason, mbNum: currentUserNum });
            }
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
            await api.delete(`/api/freeboard/posts/${id}`);
            alert("삭제되었습니다.");
            navigate('/community/freeboard');
        } catch (err) { alert("삭제 중 오류가 발생했습니다."); }
    };

    if (id === 'write') return null;
    if (loading) return <div className="loading-box">데이터 로딩 중...</div>;
    if (!post) return null;

    const isOwner = isLoggedIn && Number(post.poMbNum) === Number(currentUserNum);
    const actionButtonStyle = {
        padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s ease', fontSize: '14px'
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
                                    style={{ ...actionButtonStyle, background: isLiked ? '#e74c3c' : '#fff', border: '1px solid #e74c3c', color: isLiked ? '#fff' : '#e74c3c' }}
                                >
                                    {isLiked ? '❤️' : '🤍'} 추천 {likeCount}
                                </button>
                                <button 
                                    className="btn-bookmark-action" onClick={handleBookmark} 
                                    style={{ ...actionButtonStyle, background: isBookmarked ? '#f1c40f' : '#fff', border: '1px solid #f1c40f', color: isBookmarked ? '#fff' : '#f1c40f' }}
                                >
                                    {isBookmarked ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
                                </button>
                                {!isOwner && (
                                    <button className="btn-report-action" onClick={handleReportPost} style={{ ...actionButtonStyle, background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f' }}>
                                        🚨 신고
                                    </button>
                                )}
                            </>
                        )}
                        {isOwner && (
                            <>
                                <button onClick={() => navigate(`/community/freeboard/edit/${id}`)} style={{ ...actionButtonStyle, background: '#fff', border: '1px solid #3498db', color: '#3498db' }}>✏️ 수정</button>
                                <button onClick={handleDelete} style={{ ...actionButtonStyle, background: '#fff', border: '1px solid #e67e22', color: '#e67e22' }}>🗑️ 삭제</button>
                            </>
                        )}
                    </div>
                    <button onClick={() => navigate('/community/freeboard')} style={{ ...actionButtonStyle, background: '#fff', border: '1px solid #34495e', color: '#34495e' }}>목록으로</button>
                </div>

                <div className="comment-area" ref={commentAreaRef} style={{ marginTop: '40px' }}>
                    <hr style={{ border: '0', height: '1px', background: '#eee', marginBottom: '20px' }} />
                    <h3 style={{ marginBottom: '20px' }}>댓글 {comments.length}</h3>
                    {isLoggedIn ? (
                        <div className="comment-write-box" style={{ marginBottom: '30px' }}>
                            <textarea 
                                style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', resize: 'none' }}
                                value={commentInput} 
                                onChange={(e) => setCommentInput(e.target.value)} 
                                placeholder="깨끗한 댓글 문화를 만들어주세요." 
                            />
                            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                <button style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '20px', cursor: 'pointer' }} onClick={() => handleAddComment(null)}>등록</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px', marginBottom: '30px' }}>로그인 후 이용 가능합니다.</div>
                    )}
                    <div className="comment-list-container">{renderComments(null)}</div>
                </div>
            </div>

            <ReportModal
                isOpen={reportModal.open}
                onClose={() => setReportModal({ open: false, type: 'post', targetId: null })}
                onSubmit={handleReportSubmit}
                title={reportModal.type === 'comment' ? '댓글 신고하기' : '게시글 신고하기'}
            />
        </div>
    );
};

export default FreeBoardDetail;
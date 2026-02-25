import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import { getMemberNum } from '../../utils/user';
import { addRecentView } from '../../utils/recentViews';
import ReportModal from '../ReportModal';
import './RecommendPostDetail.css';

// 🚩 [수정] App.js와 동일하게 배포 서버 및 포트 8080 설정 유지
const API_BASE_URL = "http://3.37.160.108:8080";
const SERVER_URL = API_BASE_URL;

const RecommendPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const [commentInput, setCommentInput] = useState(""); 
    const [editId, setEditId] = useState(null);           
    const [editInput, setEditInput] = useState("");       
    const [replyTo, setReplyTo] = useState(null);         
    const [replyInput, setReplyInput] = useState(""); 

    // 즐겨찾기 상태
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [reportModal, setReportModal] = useState({ open: false, type: 'post', targetId: null });

    const commentAreaRef = useRef(null);
    const replyInputRef = useRef(null);

    const isLoggedIn = !!user; 
    const currentUserNum = getMemberNum(user); 
    const isAdmin = user ? (Number(user.mbLevel ?? user.mb_score ?? 0) >= 10 || user.mb_rol === 'ADMIN') : false; 

    const isNumericId = id && !isNaN(Number(id)) && id !== "write";

    const fixImagePaths = (content) => {
        if (!content) return "";
        // 🚩 SERVER_URL 변수를 사용하여 이미지 경로 치환
        let fixedContent = content.replace(/src=["'](?:\/)?pic\//g, `src="${SERVER_URL}/pic/`);
        return fixedContent;
    };

    const incrementViewCount = useCallback(async () => {
        if (!isNumericId) return;
        const storageKey = `viewed_post_${id}`;
        if (!sessionStorage.getItem(storageKey)) {
            try {
                // 🚩 API 주소 체계를 App.js의 방식과 맞춤
                await axios.post(`${SERVER_URL}/api/recommend/posts/${id}/view`);
                sessionStorage.setItem(storageKey, 'true');
            } catch (err) {
                console.error("조회수 증가 실패", err);
            }
        }
    }, [id, isNumericId]);

    const fetchAllData = useCallback(async (isAction = false, isCommentAction = false) => {
        if (!isNumericId) return;
        try {
            if (!isAction) setLoading(true);
            // 🚩 App.js에서 사용하는 호출 경로와 일치하도록 유지
            const postRes = await axios.get(`${SERVER_URL}/api/recommend/posts/${id}`);
            setPost(postRes.data);
            setIsLiked(postRes.data.isLikedByMe || false);
            
            const bookmarkStatus = postRes.data.isBookmarkedByMe || postRes.data.isBookmarked === 'Y' || postRes.data.isBookmarked === true || postRes.data.favorited;
            
            const storageChange = localStorage.getItem('bookmark_changed');
            let finalBookmarkState = bookmarkStatus;
            if (storageChange) {
                try {
                    const syncData = JSON.parse(storageChange);
                    if (Number(syncData.id) === Number(id)) {
                        finalBookmarkState = syncData.state;
                    }
                } catch(e) {}
            }
            setIsBookmarked(finalBookmarkState);
            
            addRecentView({ 
                boardType: 'recommend', 
                poNum: Number(id), 
                poTitle: postRes.data?.poTitle || postRes.data?.po_title 
            });

            const commentRes = await axios.get(`${SERVER_URL}/api/comment/list/${id}`);
            setComments(commentRes.data || []);
            
            if (!isAction) setLoading(false);
            if (isCommentAction && commentAreaRef.current) {
                commentAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (err) {
            if (err.response?.status === 404) {
                alert("게시글을 찾을 수 없습니다.");
                navigate('/community/recommend');
            }
            setLoading(false);
        }
    }, [id, navigate, isNumericId]);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'bookmark_changed' && e.newValue) {
                try {
                    const { id: changedId, state } = JSON.parse(e.newValue);
                    if (Number(changedId) === Number(id)) {
                        setIsBookmarked(state);
                    }
                } catch (err) {
                    console.error("Storage parse error", err);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [id]);

    useEffect(() => { 
        if(isNumericId) {
            incrementViewCount(); 
            fetchAllData();       
        }
    }, [isNumericId, fetchAllData, incrementViewCount]);

    useEffect(() => {
        if (replyTo && replyInputRef.current) replyInputRef.current.focus();
    }, [replyTo]);

    const handleDeletePost = async () => {
        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/recommend/posts/${id}`);
            alert("게시글이 삭제되었습니다.");
            navigate('/community/recommend');
        } catch (err) { alert("삭제에 실패했습니다."); }
    };

    const handleEditPost = () => {
        navigate(`/community/recommend/write`, { state: { mode: 'edit', postData: post } });
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/recommend/posts/${id}/like`, { mbNum: currentUserNum });
            if (res.data.status === "liked") {
                setIsLiked(true);
                setPost(prev => ({ ...prev, poUp: (prev.poUp || 0) + 1 }));
                alert("게시글을 추천했습니다.");
            } else {
                setIsLiked(false);
                setPost(prev => ({ ...prev, poUp: Math.max(0, (prev.poUp || 0) - 1) }));
                alert("게시글 추천을 취소했습니다.");
            }
        } catch (err) { alert("추천 처리 중 오류가 발생했습니다."); }
    };

    const handleBookmark = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            await api.post("/api/mypage/bookmarks", { poNum: Number(id), boardType: "recommend" });
            
            const newState = !isBookmarked;
            setIsBookmarked(newState);
            
            localStorage.setItem('bookmark_changed', JSON.stringify({ 
                id: Number(id), 
                state: newState, 
                time: Date.now() 
            }));

            alert(newState ? "게시글을 즐겨찾기에 등록했습니다." : "게시글 즐겨찾기를 취소했습니다.");
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.error;
            alert(msg || "즐겨찾기 처리에 실패했습니다.");
        }
    };

    const handleCommentLike = async (commentId) => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/comment/like/${commentId}`, { mbNum: currentUserNum });
            if(res.data.status === "liked") {
                setComments(prevComments => prevComments.map(c => c.coNum === commentId ? { ...c, coLike: (c.coLike || 0) + 1 } : c));
            } else {
                setComments(prevComments => prevComments.map(c => c.coNum === commentId ? { ...c, coLike: Math.max(0, (c.coLike || 0) - 1) } : c));
            }
        } catch (err) { alert("추천 처리 중 오류가 발생했습니다."); }
    };

    const handleReportPost = () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        setReportModal({ open: true, type: 'post', targetId: id });
    };

    const handleReportSubmit = async ({ category, reason }) => {
        const { type, targetId } = reportModal;
        try {
            if (type === 'post') {
                await axios.post(`${SERVER_URL}/api/recommend/posts/${targetId}/report`, { category, reason, mbNum: currentUserNum });
            } else {
                await axios.post(`${SERVER_URL}/api/comment/report/${targetId}`, { category, reason, mbNum: currentUserNum });
            }
            setReportModal({ open: false, type: null, targetId: null });
            fetchAllData(true, type === 'comment');
            alert("신고가 정상적으로 접수되었습니다.");
        } catch (err) {
            alert(err?.response?.data || "이미 신고했거나 오류가 발생했습니다.");
            setReportModal({ open: false, type: null, targetId: null });
        }
    };

    const handleAddComment = async (parentId = null) => {
        if(!isLoggedIn) return alert("로그인 후 댓글 작성이 가능합니다.");
        const content = parentId ? replyInput : commentInput;
        if (!content?.trim()) return alert("내용을 입력하세요.");
        try {
            await axios.post(`${SERVER_URL}/api/comment/add/${id}`, { 
                content: content.trim(), parentId: parentId, mbNum: currentUserNum 
            });
            setCommentInput(""); setReplyInput(""); setReplyTo(null);
            fetchAllData(true, true); 
        } catch (err) { alert("등록 실패"); }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editInput?.trim()) return alert("내용을 입력하세요.");
        try {
            await axios.put(`${SERVER_URL}/api/comment/update/${commentId}`, { content: editInput.trim() });
            setEditId(null); setEditInput("");
            fetchAllData(true, true);
        } catch (err) { alert("수정 실패"); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/comment/delete/${commentId}`);
            fetchAllData(true, true);
        } catch (err) { alert("삭제 실패"); }
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
            const isReply = depth > 0;
            const isActiveEdit = editId === comment.coNum;
            const isActiveReply = replyTo === comment.coNum;
            
            const authorDisplayName = comment.coNickname || comment.mbNickname || comment.mb_nickname || "알 수 없는 사용자";

            return (
                <div key={comment.coNum}>
                    <div className="comment-unit" style={{ marginLeft: isReply ? (depth * 20) + 'px' : '0', padding: '15px 20px', borderBottom: '1px solid #f0f0f0', backgroundColor: isReply ? '#f9fafb' : 'transparent', borderLeft: isReply ? '3px solid #ddd' : 'none' }}>
                        <div className="comment-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '14px' }}>{authorDisplayName}</strong>
                                <span style={{ fontSize: '12px', color: '#aaa' }}>{new Date(comment.coDate).toLocaleString()}</span>
                                <button onClick={() => handleCommentLike(comment.coNum)} style={{ background: 'none', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', color: '#555' }}>👍 {comment.coLike || 0}</button>
                            </div>
                            {!isActiveEdit && !isActiveReply && (
                                <div className="comment-btns">
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
                            <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.5' }}>{comment.coContent}</div>
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

    if (!isNumericId) return null;
    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;
    if (!post) return <div style={{ padding: '100px', textAlign: 'center' }}>게시글을 찾을 수 없습니다.</div>;

    const isPostOwner = isLoggedIn && Number(post.poMbNum || post.po_mb_num) === Number(currentUserNum);
    const canManagePost = isPostOwner || isAdmin;
    
    const postAuthorNick = post.poNickname || post.mbNickname || post.mb_nickname || post.mbNick || `User ${post.poMbNum || post.po_mb_num}`;

    return (
        <div className="recommend-detail-wrapper">
            <div className="detail-container">
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.poTitle || post.po_title}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: {postAuthorNick}</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.poView || post.po_view || 0}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {post.poUp || post.po_up || 0}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.poDate || post.po_date).toLocaleString()}</span>
                    </div>
                </div>

                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: fixImagePaths(post.poContent || post.po_content) }} />
                </div>

                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && (
                            <button 
                                className={`btn-like-action ${isLiked ? 'active' : ''}`} 
                                onClick={handleLikeToggle}
                                style={{ 
                                    background: isLiked ? '#e74c3c' : '#fff', 
                                    border: '1px solid #e74c3c', 
                                    color: isLiked ? '#fff' : '#e74c3c', 
                                    padding: '10px 25px', 
                                    borderRadius: '30px', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '5px' 
                                }}
                            >
                                {isLiked ? '❤️' : '🤍'} 추천 {post.poUp || post.po_up || 0}
                            </button>
                        )}

                        {isLoggedIn && (
                            <button 
                                className={`btn-bookmark-action ${isBookmarked ? 'active' : ''}`} 
                                onClick={handleBookmark}
                                style={{ 
                                    background: isBookmarked ? '#f1c40f' : '#fff', 
                                    border: '1px solid #f1c40f', 
                                    color: isBookmarked ? '#fff' : '#f1c40f', 
                                    padding: '10px 25px', 
                                    borderRadius: '30px', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer' 
                                }}
                            >
                                {isBookmarked ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
                            </button>
                        )}

                        {!isPostOwner && (
                            <button className="btn-report-action" onClick={handleReportPost} style={{ background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
                                🚨 신고
                            </button>
                        )}

                        {isPostOwner && (
                            <button className="btn-edit-action" onClick={handleEditPost} style={{ background: '#fff', border: '1px solid #3498db', color: '#3498db', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
                                ✏️ 수정
                            </button>
                        )}

                        {canManagePost && (
                            <button className="btn-delete-action" onClick={handleDeletePost} style={{ background: '#fff', border: '1px solid #e67e22', color: '#e67e22', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
                                🗑️ 삭제
                            </button>
                        )}
                    </div>

                    <button className="btn-list-return" onClick={() => navigate('/community/recommend')}>
                        목록으로 
                    </button>
                </div>

                <hr className="section-divider" />

                <div className="comment-area" ref={commentAreaRef}>
                    <h3 className="comment-title">댓글 {comments.length}</h3>
                    {isLoggedIn ? (
                        <div className="comment-write-box">
                            <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="깨끗한 댓글 문화를 만들어주세요." />
                            <button className="btn-comment-submit" onClick={() => handleAddComment(null)}>등록</button>
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px', marginBottom: '30px' }}>로그인 후 이용 가능합니다.</div>
                    )}
                    <div className="comment-list-container">{renderComments(null)}</div>
                </div>
            </div>

            <ReportModal
                isOpen={reportModal.open}
                onClose={() => setReportModal({ open: false, type: null, targetId: null })}
                onSubmit={handleReportSubmit}
                title={reportModal.type === 'comment' ? '댓글 신고하기' : '게시글 신고하기'}
            />
        </div>
    );
};

export default RecommendPostDetail;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import { getMemberNum } from '../../utils/user';
import { addRecentView } from '../../utils/recentViews';
import ReportModal from '../ReportModal';
import './FreeBoardDetail.css';

const API_BASE_URL = "";
const SERVER_URL = API_BASE_URL;

const FreeBoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const [commentInput, setCommentInput] = useState(""); 
    const [editId, setEditId] = useState(null);           
    const [editInput, setEditInput] = useState("");       
    const [replyTo, setReplyTo] = useState(null);          
    const [replyInput, setReplyInput] = useState(""); 

    const [reportModal, setReportModal] = useState({ open: false, type: 'post', targetId: null });

    const commentAreaRef = useRef(null);

    const isLoggedIn = !!user; 
    const currentUserNum = getMemberNum(user); 
    const isAdmin = user ? (Number(user.mbLevel ?? user.mb_score ?? 0) >= 10 || user.mb_rol === 'ADMIN') : false; 
    const isNumericId = id && !isNaN(Number(id)) && id !== "write";

    const fixImagePaths = (content) => {
        /**
         * 게시글 본문(HTML)에 들어있는 이미지 경로 보정
         * - 백엔드가 `<img src="/pic/...">` 형태로 내려주면,
         *   프론트에서 현재 origin 기준으로 `/pic/` 상대 경로가 깨질 수 있음
         * - SERVER_URL/pic로 바꿔서 실제 파일 서빙 경로에 맞추기 위한 처리
         * - 만약 서버에 실제 파일이 없으면(업로드 후 삭제/경로 불일치) /pic 요청은 404가 날 수 있음
         */
        if (!content) return "";
        let fixedContent = content.replace(/src=["'](?:\/)?pic\//g, `src="${SERVER_URL}/pic/`);
        return fixedContent;
    };

    // 🚩 [수정] 이클립스 콘솔 POST 에러 방지를 위해 incrementViewCount 함수 및 호출부 제거
    // 서버의 GetMapping("/posts/{id}") 내부에서 이미 조회수를 올리고 있습니다.

    const fetchAllData = useCallback(async (isAction = false, isCommentAction = false) => {
        if (!isNumericId) return;
        try {
            if (!isAction) setLoading(true);
            const postRes = await axios.get(`${SERVER_URL}/api/freeboard/posts/${id}`, {
                params: { mbNum: currentUserNum } 
            });
            
            const data = postRes.data;
            setPost(data);
            
            const localLike = localStorage.getItem(`free_like_status_${id}`);
            if (localLike !== null) {
                setIsLiked(localLike === 'true');
            } else {
                setIsLiked(data.isLikedByMe || data.poUpCheck === 'Y' || data.isUp === 'Y');
            }
            
            const localBookmark = localStorage.getItem(`free_bookmark_status_${id}`);
            if (localBookmark !== null) {
                setIsBookmarked(localBookmark === 'true');
            } else {
                const serverBookmark = !!(data.isBookmarkedByMe || data.isBookmarked === 'Y' || data.isBookmarked === true || data.favorited);
                setIsBookmarked(serverBookmark);
            }
            
            addRecentView({ 
                boardType: 'freeboard', 
                poNum: Number(id), 
                poTitle: data?.poTitle || data?.po_title 
            }, currentUserNum);

            const commentRes = await axios.get(`${SERVER_URL}/api/comment/list/${id}`);
            setComments(commentRes.data || []);
            
            if (!isAction) setLoading(false);
            if (isCommentAction && commentAreaRef.current) {
                commentAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (err) {
            if (err.response?.status === 404) {
                alert("게시글을 찾을 수 없습니다.");
                navigate('/community/freeboard');
            }
            setLoading(false);
        }
    }, [id, isNumericId, currentUserNum, navigate]);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === `free_bookmark_status_${id}` && e.newValue !== null) {
                setIsBookmarked(e.newValue === 'true');
            }
            if (e.key === `free_like_status_${id}` && e.newValue !== null) {
                setIsLiked(e.newValue === 'true');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [id]);

    useEffect(() => { 
        if(isNumericId) {
            // 🚩 [수정] incrementViewCount() 호출 제거 (에러 방지)
            fetchAllData();       
        }
    }, [isNumericId, fetchAllData]);

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/freeboard/posts/${id}/like`, { mbNum: currentUserNum });
            const nextState = res.data.status === "liked";
            
            setIsLiked(nextState);
            setPost(prev => ({ 
                ...prev, 
                poUp: nextState ? (prev.poUp || 0) + 1 : Math.max(0, (prev.poUp || 0) - 1) 
            }));

            localStorage.setItem(`free_like_status_${id}`, nextState.toString());
            window.dispatchEvent(new Event('storage'));

            alert(nextState ? "게시글을 추천했습니다." : "게시글 추천을 취소했습니다.");
        } catch (err) { alert("추천 처리 중 오류 발생"); }
    };

    const handleBookmark = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            await api.post("/api/mypage/bookmarks", { poNum: Number(id), boardType: "freeboard" });
            const nextState = !isBookmarked;
            
            setIsBookmarked(nextState);
            
            localStorage.setItem(`free_bookmark_status_${id}`, nextState.toString());
            window.dispatchEvent(new Event('storage'));

            alert(nextState ? "즐겨찾기에 등록했습니다." : "즐겨찾기를 취소했습니다.");
        } catch (err) { alert("즐겨찾기 처리 실패"); }
    };

    const handleDeletePost = async () => {
        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/freeboard/posts/${id}`);
            alert("게시글이 삭제되었습니다.");
            navigate('/community/freeboard');
        } catch (err) { alert("삭제 실패"); }
    };

    const handleEditPost = () => {
        navigate(`/community/freeboard/write`, { state: { mode: 'edit', postData: post } });
    };

    const handleCommentLike = async (commentId) => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`${SERVER_URL}/api/comment/like/${commentId}`, { mbNum: currentUserNum });
            const isLikedNow = res.data.status === "liked";
            setComments(prev => prev.map(c => c.coNum === commentId 
                ? { ...c, coLike: isLikedNow ? (c.coLike || 0) + 1 : Math.max(0, (c.coLike || 0) - 1) } 
                : c));
        } catch (err) { alert("추천 오류"); }
    };

    const handleReportPost = () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        setReportModal({ open: true, type: 'post', targetId: id });
    };

    const handleReportSubmit = async ({ category, reason }) => {
        const { type, targetId } = reportModal;
        try {
            if (type === 'post') {
                await axios.post(`${SERVER_URL}/api/freeboard/posts/${targetId}/report`, { category, reason, mbNum: currentUserNum });
            } else {
                await axios.post(`${SERVER_URL}/api/comment/report/${targetId}`, { category, reason, mbNum: currentUserNum });
            }
            setReportModal({ open: false, type: null, targetId: null });
            fetchAllData(true, type === 'comment');
            alert("신고가 접수되었습니다.");
        } catch (err) { alert("신고 실패"); }
    };

    const handleAddComment = async (parentId = null) => {
        if(!isLoggedIn) return alert("로그인 후 이용 가능합니다.");
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
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/comment/delete/${commentId}`);
            fetchAllData(true, true);
        } catch (err) { alert("삭제 실패"); }
    };

    // --- RecommendPostDetail 디자인/로직 완전 동일 이식 ---
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
            const authorDisplayName = comment.coNickname || comment.mbNickname || "User";

            return (
                <div key={comment.coNum}>
                    <div className="comment-unit" style={{ 
                        marginLeft: isReply ? (depth * 20) + 'px' : '0', 
                        padding: '15px 20px', 
                        borderBottom: '1px solid #f0f0f0', 
                        backgroundColor: isReply ? '#f9fafb' : 'transparent', 
                        borderLeft: isReply ? '3px solid #ddd' : 'none' 
                    }}>
                        <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '14px' }}>{authorDisplayName}</strong>
                                <span style={{ fontSize: '12px', color: '#aaa' }}>{new Date(comment.coDate).toLocaleString()}</span>
                                <button onClick={() => handleCommentLike(comment.coNum)} style={{ background: 'none', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', color: '#555' }}>👍 {comment.coLike || 0}</button>
                            </div>
                            {!isActiveEdit && !isActiveReply && (
                                <div className="comment-btns" style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#888', cursor: 'pointer' }}>
                                    <span onClick={() => { setReplyTo(comment.coNum); setEditId(null); }}>답글</span>
                                    {isCommentOwner && <span onClick={() => { setEditId(comment.coNum); setEditInput(comment.coContent); }}>수정</span>}
                                    {(isCommentOwner || isAdmin) && <span onClick={() => handleDeleteComment(comment.coNum)}>삭제</span>}
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
                                <textarea style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '60px' }} placeholder={`${authorDisplayName}님께 답글 남기기`} value={replyInput} onChange={(e) => setReplyInput(e.target.value)} />
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
                        <span style={{ color: post.poReport > 0 ? '#ff4d4f' : 'inherit' }}>신고 {post.poReport || post.po_report || 0}</span>
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.poDate || post.po_date).toLocaleString()}</span>
                    </div>
                </div>

                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: fixImagePaths(post.poContent || post.po_content) }} />
                </div>

                <div className="detail-bottom-actions">
                    <div className="left-group" style={{ display: 'flex', gap: '10px' }}>
                        {isLoggedIn && (
                            <button 
                                className={`btn-like-action ${isLiked ? 'active' : ''}`} 
                                onClick={handleLikeToggle}
                                style={{ 
                                    padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s ease', fontSize: '14px',
                                    background: isLiked ? '#e74c3c' : '#fff', border: '1px solid #e74c3c', color: isLiked ? '#fff' : '#e74c3c' 
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
                                    padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
                                    background: isBookmarked ? '#f1c40f' : '#fff', border: '1px solid #f1c40f', color: isBookmarked ? '#fff' : '#f1c40f' 
                                }}
                            >
                                {isBookmarked ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
                            </button>
                        )}

                        {!isPostOwner && (
                            <button className="btn-report-action" onClick={handleReportPost} style={{ background: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>🚨 신고</button>
                        )}

                        {isPostOwner && (
                            <button className="btn-edit-action" onClick={handleEditPost} style={{ background: '#fff', border: '1px solid #3498db', color: '#3498db', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>✏️ 수정</button>
                        )}

                        {canManagePost && (
                            <button className="btn-delete-action" onClick={handleDeletePost} style={{ background: '#fff', border: '1px solid #e67e22', color: '#e67e22', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>🗑️ 삭제</button>
                        )}
                    </div>

                    <button 
                        className="btn-list-return" 
                        onClick={() => navigate('/community/freeboard')}
                        style={{ padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', background: '#fff', border: '1px solid #34495e', color: '#34495e' }}
                    >목록으로</button>
                </div>

                <hr className="section-divider" style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />

                <div className="comment-area" ref={commentAreaRef}>
                    <h3 className="comment-title" style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>댓글 {comments.length}</h3>
                    {isLoggedIn ? (
                        <div className="comment-write-box" style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                            <textarea 
                                style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '80px', fontSize: '14px' }}
                                value={commentInput} 
                                onChange={(e) => setCommentInput(e.target.value)} 
                                placeholder="깨끗한 댓글 문화를 만들어주세요." 
                            />
                            <div style={{ textAlign: 'right' }}>
                                <button 
                                    style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                                    onClick={() => handleAddComment(null)}
                                >등록</button>
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
                onClose={() => setReportModal({ open: false, type: null, targetId: null })}
                onSubmit={handleReportSubmit}
                title={reportModal.type === 'comment' ? '댓글 신고하기' : '게시글 신고하기'}
            />
        </div>
    );
};

export default FreeBoardDetail;
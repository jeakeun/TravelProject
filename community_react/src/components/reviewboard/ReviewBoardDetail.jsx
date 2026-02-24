import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import { getMemberNum } from '../../utils/user';
import { addRecentView } from '../../utils/recentViews';
import './ReviewBoardDetail.css'; 

const ReviewBoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // 🚩 App.js에서 주입하는 공통 상태 사용
    const { user, refreshPosts } = useOutletContext() || {}; 
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const [commentInput, setCommentInput] = useState(""); 
    const [editId, setEditId] = useState(null);           
    const [editInput, setEditInput] = useState("");       
    const [replyTo, setReplyTo] = useState(null);         
    const [replyInput, setReplyInput] = useState("");
    const [isBookmarked, setIsBookmarked] = useState(false);

    const commentAreaRef = useRef(null);
    const replyInputRef = useRef(null);

    const isLoggedIn = !!user; 
    // 🚩 서버 DTO 필드명에 맞춰 mb_Num 또는 mbNum 대응
    const currentUserNum = user ? (user.mb_Num || user.mbNum) : null; 
    const isAdmin = user ? user.mbLevel >= 10 : false; 

    const isNumericId = id && !isNaN(Number(id));

    // 🚩 [확장성] 현재 게시판 타입을 감지하여 API 경로를 유연하게 설정
    const getBoardType = useCallback(() => {
        const path = window.location.pathname;
        if (path.includes('recommend')) return 'recommend';
        if (path.includes('reviewboard')) return 'reviewboard';
        return 'freeboard';
    }, []);

    const boardPath = getBoardType();

    // 🚩 [수정] 404 에러 원인인 incrementViewCount 함수 제거
    // 백엔드 getDetail 메서드 내부에서 이미 조회수 증가 로직을 수행하므로 프론트엔드 호출이 불필요합니다.

    const fetchAllData = useCallback(async (isAction = false, isCommentAction = false) => {
        if (!isNumericId) return;
        try {
            if (!isAction) setLoading(true);
            // 이 요청이 발생할 때 서버 서비스 로직에서 조회수를 자동으로 1 올립니다.
            const postRes = await axios.get(`http://localhost:8080/api/${boardPath}/posts/${id}?mbNum=${currentUserNum || ''}`);
            setPost(postRes.data);
            setIsLiked(postRes.data.isLikedByMe || false);
            addRecentView({ boardType: boardPath, poNum: Number(id), poTitle: postRes.data?.poTitle });

            // 댓글 타입 매핑 (서버의 Enum이나 문자열 규격에 맞춤)
            const typeParam = boardPath.toUpperCase().replace('BOARD', '');
            const commentRes = await axios.get(`http://localhost:8080/api/comment/list/${id}?type=${typeParam}`);
            setComments(commentRes.data || []);
            
            if (!isAction) setLoading(false);
            if (isCommentAction && commentAreaRef.current) {
                commentAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (err) {
            if (err.response?.status === 404) {
                alert("게시글을 찾을 수 없습니다.");
                navigate(`/community/${boardPath}`);
            }
            setLoading(false);
        }
    }, [id, navigate, isNumericId, currentUserNum, boardPath]);

    useEffect(() => { 
        if(isNumericId) {
            // incrementViewCount(); // 🚩 제거됨
            fetchAllData();       
        }
    }, [isNumericId, fetchAllData]); // 🚩 의존성에서 incrementViewCount 제거

    useEffect(() => {
        if (replyTo && replyInputRef.current) replyInputRef.current.focus();
    }, [replyTo]);

    const handleDeletePost = async () => {
        if (!window.confirm("정말 게시글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/${boardPath}/posts/${id}`);
            alert("게시글이 삭제되었습니다.");
            if (refreshPosts) refreshPosts();
            navigate(`/community/${boardPath}`);
        } catch (err) {
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleBookmark = async () => {
        if (!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            await api.post("/api/mypage/bookmarks", { poNum: Number(id), boardType: boardPath });
            setIsBookmarked(true);
            alert("즐겨찾기에 추가되었습니다.");
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.error;
            alert(msg || "즐겨찾기 추가에 실패했습니다.");
        }
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`http://localhost:8080/api/${boardPath}/posts/${id}/like`, { mbNum: currentUserNum });
            if (res.data.status === "liked") {
                setIsLiked(true);
                setPost(prev => ({ ...prev, poUp: prev.poUp + 1 }));
            } else {
                setIsLiked(false);
                setPost(prev => ({ ...prev, poUp: Math.max(0, prev.poUp - 1) }));
            }
        } catch (err) { alert("추천 처리 중 오류 발생"); }
    };

    const handleAddComment = async (parentId = null) => {
        if(!isLoggedIn) return alert("로그인 후 댓글 작성이 가능합니다.");
        const content = parentId ? replyInput : commentInput;
        if (!content?.trim()) return alert("내용을 입력하세요.");
        try {
            const typeParam = boardPath.toUpperCase().replace('BOARD', '');
            await axios.post(`http://localhost:8080/api/comment/add/${id}`, { 
                content: content.trim(), 
                parentId: parentId,
                mbNum: currentUserNum,
                type: typeParam 
            });
            setCommentInput(""); setReplyInput(""); setReplyTo(null);
            fetchAllData(true, true); 
        } catch (err) { alert("등록 실패"); }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editInput?.trim()) return alert("내용을 입력하세요.");
        try {
            await axios.put(`http://localhost:8080/api/comment/update/${commentId}`, { content: editInput.trim() });
            setEditId(null);
            setEditInput("");
            fetchAllData(true, true);
        } catch (err) { alert("수정 실패"); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/comment/delete/${commentId}`);
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
            const isCommentOwner = isLoggedIn && comment.member && Number(comment.member.mbNum || comment.member.mb_Num) === Number(currentUserNum);
            const isReply = depth > 0;
            const isActiveEdit = editId === comment.coNum;
            const isActiveReply = replyTo === comment.coNum;

            return (
                <div key={comment.coNum}>
                    <div className="comment-unit" style={{ 
                        marginLeft: isReply ? (depth * 20) + 'px' : '0', 
                        backgroundColor: isReply ? '#f9fafb' : 'transparent' 
                    }}>
                        <div className="comment-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong>User {comment.member?.mbNum || comment.member?.mb_Num}</strong>
                                <span className="comment-date">{new Date(comment.coDate).toLocaleString()}</span>
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
                                </div>
                            )}
                        </div>

                        {isActiveEdit ? (
                            <div className="comment-edit-box">
                                <textarea value={editInput} onChange={(e) => setEditInput(e.target.value)} />
                                <button onClick={() => handleUpdateComment(comment.coNum)}>수정</button>
                                <button onClick={() => setEditId(null)}>취소</button>
                            </div>
                        ) : (
                            <div className="comment-body">{comment.coContent}</div>
                        )}

                        {isActiveReply && (
                            <div className="reply-write-box">
                                <textarea ref={replyInputRef} value={replyInput} onChange={(e) => setReplyInput(e.target.value)} placeholder="답글을 입력하세요" />
                                <button onClick={() => handleAddComment(comment.coNum)}>등록</button>
                                <button onClick={() => setReplyTo(null)}>취소</button>
                            </div>
                        )}
                    </div>
                    {renderComments(comment.coNum, depth + 1)}
                </div>
            );
        });
    };

    if (loading) return <div className="loading-box">데이터 로딩 중...</div>;
    if (!post) return <div className="loading-box">게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="review-detail-wrapper">
            <div className="detail-container">
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.poTitle}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: User {post.poMbNum}</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.poView}</span> 
                        <span className="info-divider">|</span>
                        <span>추천 {post.poUp}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.poDate).toLocaleString()}</span>
                    </div>
                </div>
                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: post.poContent }} />
                </div>
                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && (
                            <button className={`btn-like-action ${isLiked ? 'active' : ''}`} onClick={handleLikeToggle}>
                                {isLiked ? '❤️ 추천취소' : '🤍 추천'} {post.poUp}
                            </button>
                        )}
                        {isLoggedIn && (
                            <button className="btn-bookmark-action" onClick={handleBookmark} disabled={isBookmarked} style={{ marginLeft: 8 }}>
                                {isBookmarked ? '★ 즐겨찾기됨' : '☆ 즐겨찾기'}
                            </button>
                        )}
                        {(isLoggedIn && (Number(post.poMbNum) === Number(currentUserNum) || isAdmin)) && (
                            <>
                                <button className="btn-edit-action" onClick={() => navigate(`/community/write`, { state: { mode: 'edit', postData: post } })}>✏️ 수정</button>
                                <button className="btn-delete-action" onClick={handleDeletePost}>🗑️ 삭제</button>
                            </>
                        )}
                    </div>
                    <button className="btn-list-return" onClick={() => navigate(`/community/${boardPath}`)}>목록으로</button>
                </div>
                <hr className="section-divider" />
                <div className="comment-area" ref={commentAreaRef}>
                    <h3 className="comment-title">댓글 {comments.length}</h3>
                    {isLoggedIn ? (
                        <div className="comment-write-box">
                            <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="의견을 남겨주세요." />
                            <button className="btn-comment-submit" onClick={() => handleAddComment(null)}>등록</button>
                        </div>
                    ) : (
                        <div className="login-needed-msg">로그인 후 댓글 작성이 가능합니다.</div>
                    )}
                    <div className="comment-list-container">{renderComments(null)}</div>
                </div>
            </div>
        </div>
    );
};

export default ReviewBoardDetail;
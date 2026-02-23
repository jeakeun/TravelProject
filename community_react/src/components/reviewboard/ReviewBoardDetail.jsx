import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { getMemberNum } from '../../utils/user';
import './ReviewBoardDetail.css'; 

const ReviewBoardDetail = () => {
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

    const commentAreaRef = useRef(null);
    const replyInputRef = useRef(null);

    const isLoggedIn = !!user; 
    const currentUserNum = getMemberNum(user); 
    const isAdmin = user ? (Number(user.mbLevel ?? user.mb_score ?? 0) >= 10 || user.mb_rol === 'ADMIN') : false; 

    const isNumericId = id && !isNaN(Number(id));

    const incrementViewCount = useCallback(async () => {
        if (!isNumericId) return;
        const viewedReviewPosts = JSON.parse(sessionStorage.getItem('viewedReviewPosts') || '[]');
        if (!viewedReviewPosts.includes(id)) {
            try {
                await axios.post(`http://localhost:8080/api/reviewboard/posts/${id}/view`);
                viewedReviewPosts.push(id);
                sessionStorage.setItem('viewedReviewPosts', JSON.stringify(viewedReviewPosts));
            } catch (err) {
                console.error("조회수 증가 실패", err);
            }
        }
    }, [id, isNumericId]);

    const fetchAllData = useCallback(async (isAction = false, isCommentAction = false) => {
        if (!isNumericId) return;
        try {
            if (!isAction) setLoading(true);
            const postRes = await axios.get(`http://localhost:8080/api/reviewboard/posts/${id}?mbNum=${currentUserNum || ''}`);
            setPost(postRes.data);
            setIsLiked(postRes.data.isLikedByMe || false);

            const commentRes = await axios.get(`http://localhost:8080/api/comment/list/${id}?type=REVIEW`);
            setComments(commentRes.data || []);
            
            if (!isAction) setLoading(false);
            if (isCommentAction && commentAreaRef.current) {
                commentAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (err) {
            if (err.response?.status === 404) {
                alert("게시글을 찾을 수 없습니다.");
                navigate('/community/reviewboard');
            }
            setLoading(false);
        }
    }, [id, navigate, isNumericId, currentUserNum]);

    useEffect(() => { 
        if(isNumericId) {
            incrementViewCount(); 
            fetchAllData();       
        }
    }, [isNumericId, fetchAllData, incrementViewCount]);

    useEffect(() => {
        if (replyTo && replyInputRef.current) replyInputRef.current.focus();
    }, [replyTo]);

    // 🚩 [추가] 게시글 삭제 함수 구현
    const handleDeletePost = async () => {
        if (!window.confirm("정말 게시글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/reviewboard/posts/${id}`);
            alert("게시글이 삭제되었습니다.");
            navigate('/community/reviewboard');
        } catch (err) {
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`http://localhost:8080/api/reviewboard/posts/${id}/like`, { mbNum: currentUserNum });
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
            await axios.post(`http://localhost:8080/api/comment/add/${id}`, { 
                content: content.trim(), 
                parentId: parentId,
                mbNum: currentUserNum,
                type: 'REVIEW' 
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
            const isCommentOwner = isLoggedIn && comment.member && getMemberNum(comment.member) === currentUserNum;
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
                                <strong>User {getMemberNum(comment.member) ?? 'Unknown'}</strong>
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
                        {/* 🚩 타입 안정성을 위해 Number()로 감싸서 비교 */}
                        {(isLoggedIn && (Number(post.poMbNum) === Number(currentUserNum) || isAdmin)) && (
                            <>
                                <button className="btn-edit-action" onClick={() => navigate(`/community/reviewboard/write`, { state: { mode: 'edit', postData: post } })}>✏️ 수정</button>
                                <button className="btn-delete-action" onClick={handleDeletePost}>🗑️ 삭제</button>
                            </>
                        )}
                    </div>
                    <button className="btn-list-return" onClick={() => navigate('/community/reviewboard')}>목록으로</button>
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
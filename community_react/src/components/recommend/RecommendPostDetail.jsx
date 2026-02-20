import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecommendPostDetail.css';

const RecommendPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
    // 🚩 답글 포커스를 위한 Ref
    const replyInputRef = useRef(null);

    const currentUserNum = 1; 

    const fetchAllData = useCallback(async (isAction = false, isCommentAction = false) => {
        if (!id) return;
        try {
            if (!isAction) setLoading(true);
            const postRes = await axios.get(`http://localhost:8080/api/recommend/posts/${id}`);
            setPost(postRes.data);
            setIsLiked(postRes.data.isLikedByMe || false);

            const commentRes = await axios.get(`http://localhost:8080/api/comments/post/${id}`);
            setComments(commentRes.data || []);
            
            if (!isAction) setLoading(false);
            if (isCommentAction && commentAreaRef.current) {
                commentAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (err) {
            console.error("데이터 로딩 실패:", err);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // 🚩 답글 버튼 클릭 시 자동 포커스 처리
    useEffect(() => {
        if (replyTo && replyInputRef.current) {
            replyInputRef.current.focus();
        }
    }, [replyTo]);

    const handleLikeToggle = async () => {
        try {
            const res = await axios.post(`http://localhost:8080/api/recommend/posts/${id}/like`, { mbNum: currentUserNum });
            setPost(prev => ({ ...prev, poUp: res.data.currentLikes }));
            setIsLiked(!isLiked);
        } catch (err) { alert("추천 실패"); }
    };

    const handleReportPost = async () => {
        const reason = window.prompt("신고 사유를 입력해주세요:");
        if (!reason?.trim()) return;
        try {
            await axios.post(`http://localhost:8080/api/recommend/posts/${id}/report`, { 
                reason, 
                mbNum: currentUserNum 
            });
            alert("게시글 신고 완료");
            
            // 🚩 UI 즉시 반영 (신고 0 -> 1)
            setPost(prev => ({ ...prev, poReport: (prev.poReport || 0) + 1 }));
            
            // 서버 데이터와 동기화 (화면 이동 없음)
            fetchAllData(true, false);
        } catch (err) { alert("신고 실패"); }
    };

    const handleCommentSubmit = async (parentId = null) => {
        const content = parentId ? replyInput : commentInput;
        if (!content.trim()) return alert("내용을 입력하세요.");
        try {
            await axios.post(`http://localhost:8080/api/comments`, {
                content: content.trim(),
                postId: parseInt(id),
                userId: currentUserNum,
                parentId: parentId 
            });
            setCommentInput(""); setReplyInput(""); setReplyTo(null);
            fetchAllData(true, true);
        } catch (err) { alert("등록 실패"); }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editInput.trim()) return alert("수정 내용을 입력하세요.");
        try {
            await axios.post(`http://localhost:8080/api/comments`, {
                id: commentId,
                content: editInput.trim(),
                postId: parseInt(id),
                userId: currentUserNum,
                parentId: comments.find(c => c.id === commentId)?.parentId
            });
            setEditId(null); setEditInput("");
            fetchAllData(true, true);
        } catch (err) { alert("수정 실패"); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/comments/${commentId}`);
            fetchAllData(true, true);
        } catch (err) { alert("삭제 실패"); }
    };

    const roundedBtnStyle = {
        padding: '8px 20px', borderRadius: '25px', border: 'none',
        fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
        transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    const submitBtnStyle = { ...roundedBtnStyle, backgroundColor: '#333', color: '#fff' };
    const cancelBtnStyle = { ...roundedBtnStyle, backgroundColor: '#e0e0e0', color: '#333', marginRight: '8px' };

    const renderComments = (targetParentId = null, depth = 0) => {
        return comments
            .filter(c => {
                if (targetParentId === null) return !c.parentId || c.parentId === 0 || c.parentId === c.id;
                return c.parentId === targetParentId && c.parentId !== c.id;
            })
            .sort((a, b) => b.id - a.id)
            .map(comment => {
                const isOwner = comment.userId === currentUserNum;
                return (
                    <div key={comment.id} style={{ marginLeft: depth > 0 ? '45px' : '0' }}>
                        <div className="comment-unit" style={{ marginTop: '20px', borderBottom: '1px solid #f5f5f5', paddingBottom: '15px' }}>
                            <div className="comment-header">
                                <strong>
                                    {depth > 0 && <span style={{ color: '#666', marginRight: '8px' }}>ㄴ</span>}
                                    User {comment.userId}
                                </strong>
                                <span className="date">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</span>
                                <div className="comment-btns">
                                    <span onClick={() => { setReplyTo(comment.id); setReplyInput(""); setEditId(null); }}>답글</span>
                                    {isOwner && (
                                        <>
                                            <span onClick={() => { setEditId(comment.id); setEditInput(comment.content); setReplyTo(null); }}>수정</span>
                                            <span onClick={() => handleDeleteComment(comment.id)}>삭제</span>
                                        </>
                                    )}
                                    <span onClick={() => alert("신고: " + comment.id)}>신고</span>
                                </div>
                            </div>
                            {editId === comment.id ? (
                                <div className="comment-write-box" style={{ marginTop: '12px' }}>
                                    <textarea value={editInput} onChange={(e) => setEditInput(e.target.value)} />
                                    <div style={{ textAlign: 'right', marginTop: '12px' }}>
                                        <button style={cancelBtnStyle} onClick={() => setEditId(null)}>취소</button>
                                        <button style={submitBtnStyle} onClick={() => handleUpdateComment(comment.id)}>수정완료</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="comment-msg">{comment.content}</p>
                            )}
                            {replyTo === comment.id && (
                                <div className="comment-write-box" style={{ marginTop: '12px' }}>
                                    <textarea 
                                        ref={replyInputRef}
                                        value={replyInput} 
                                        onChange={(e) => setReplyInput(e.target.value)} 
                                        placeholder="답글을 남겨보세요." 
                                    />
                                    <div style={{ textAlign: 'right', marginTop: '12px' }}>
                                        <button style={cancelBtnStyle} onClick={() => setReplyTo(null)}>취소</button>
                                        <button style={submitBtnStyle} onClick={() => handleCommentSubmit(comment.id)}>답글등록</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {renderComments(comment.id, depth + 1)}
                    </div>
                );
            });
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (!post) return <div className="error">게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="recommend-detail-wrapper">
            <div className="detail-container">
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.poTitle}</h1>
                    <div className="detail-sub-info">
                        <span className="info-item">작성자: User {post.poMbNum}</span>
                        <span className="info-divider">|</span>
                        <span className="info-item">조회수: {post.poView}</span>
                        <span className="info-divider">|</span>
                        <span className="info-item">신고 누적: {post.poReport || 0}</span>
                        <span className="info-divider">|</span>
                        <span className="info-item">작성일: {post.poDate}</span>
                    </div>
                </div>

                <div className="detail-image-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(post.fileUrls && post.fileUrls.length > 0 ? post.fileUrls : [post.fileUrl || "https://placehold.co"]).map((url, idx) => (
                        <img key={idx} src={url} alt="post" style={{ width: '100%', borderRadius: '12px', objectFit: 'contain' }} onError={(e) => e.target.src="https://placehold.co"} />
                    ))}
                </div>

                <div className="detail-body-text"><p>{post.poContent}</p></div>

                <div className="detail-bottom-actions">
                    <div className="left-group">
                        <button className={`btn-like-action ${isLiked ? 'active' : ''}`} onClick={handleLikeToggle}>
                            {isLiked ? '❤️ 추천취소' : '🤍 추천'} {post.poUp || 0}
                        </button>
                        <button className="btn-report-action" onClick={handleReportPost}>🚨 게시글 신고</button>
                    </div>
                    <button className="btn-list-return" onClick={() => navigate('/community/recommend')}>목록으로 돌아가기</button>
                </div>

                <hr className="section-divider" />

                <div className="comment-area" ref={commentAreaRef}>
                    <h4 className="comment-title">댓글 {comments.length}</h4>
                    <div className="comment-write-box">
                        <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="비방이나 욕설은 삼가주세요." />
                        <div style={{ textAlign: 'right', marginTop: '12px' }}>
                            <button style={submitBtnStyle} onClick={() => handleCommentSubmit(null)}>등록</button>
                        </div>
                    </div>
                    <div className="comment-items">
                        {renderComments(null)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendPostDetail;
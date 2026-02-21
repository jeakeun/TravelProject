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

    const [selectedImg, setSelectedImg] = useState(null);

    const commentAreaRef = useRef(null);
    const replyInputRef = useRef(null);

    const isLoggedIn = true; 
    const currentUserNum = 1; 
    const isAdmin = false; 

    const isNumericId = id && !isNaN(Number(id)) && id !== "write";

    const fetchAllData = useCallback(async (isAction = false, isCommentAction = false) => {
        if (!isNumericId) return;

        try {
            if (!isAction) setLoading(true);

            if (!isAction) {
                const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
                if (!viewedPosts.includes(id)) {
                    await axios.post(`http://localhost:8080/api/recommend/posts/${id}/view`);
                    viewedPosts.push(id);
                    sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
                }
            }
            
            const postRes = await axios.get(`http://localhost:8080/api/recommend/posts/${id}`);
            setPost(postRes.data);
            setIsLiked(postRes.data.isLikedByMe || false);

            const commentRes = await axios.get(`http://localhost:8080/api/comment/list/${id}`);
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
        if(isNumericId) fetchAllData(); 
    }, [isNumericId, fetchAllData]);

    useEffect(() => {
        if (replyTo && replyInputRef.current) replyInputRef.current.focus();
    }, [replyTo]);

    const handleDeletePost = async () => {
        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/recommend/posts/${id}`);
            alert("게시글이 삭제되었습니다.");
            navigate('/community/recommend');
        } catch (err) {
            alert("삭제에 실패했습니다.");
        }
    };

    const handleEditPost = () => {
        navigate(`/community/recommend/write`, { 
            state: { mode: 'edit', postData: post } 
        });
    };

    const handleLikeToggle = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`http://localhost:8080/api/recommend/posts/${id}/like`, { mbNum: currentUserNum });
            if (res.data.status === "liked") {
                alert("게시글을 추천했습니다");
                setIsLiked(true);
                setPost(prev => ({ ...prev, poUp: prev.poUp + 1 }));
            } else {
                alert("추천이 취소되었습니다");
                setIsLiked(false);
                setPost(prev => ({ ...prev, poUp: Math.max(0, prev.poUp - 1) }));
            }
        } catch (err) { alert("추천 처리 중 오류가 발생했습니다."); }
    };

    const handleCommentLike = async (commentId) => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        try {
            const res = await axios.post(`http://localhost:8080/api/comment/like/${commentId}`, { mbNum: currentUserNum });
            if(res.data.status === "liked") {
                alert("댓글을 추천했습니다.");
                setComments(prevComments => prevComments.map(c => c.coNum === commentId ? { ...c, coLike: (c.coLike || 0) + 1 } : c));
            } else {
                alert("댓글 추천을 취소했습니다.");
                setComments(prevComments => prevComments.map(c => c.coNum === commentId ? { ...c, coLike: Math.max(0, (c.coLike || 0) - 1) } : c));
            }
        } catch (err) { alert("추천 처리 중 오류가 발생했습니다."); }
    };

    const handleReportPost = async () => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        const reportedPosts = JSON.parse(localStorage.getItem('reportedPosts') || '[]');
        if (reportedPosts.includes(`${currentUserNum}_${id}`)) {
            alert("이미 신고하신 게시글입니다.");
            return;
        }
        const reason = window.prompt("게시글 신고 사유를 입력해주세요:");
        if (!reason?.trim()) return;
        try {
            await axios.post(`http://localhost:8080/api/recommend/posts/${id}/report`, { reason, mbNum: currentUserNum });
            alert("신고가 정상적으로 접수되었습니다.");
            reportedPosts.push(`${currentUserNum}_${id}`);
            localStorage.setItem('reportedPosts', JSON.stringify(reportedPosts));
            fetchAllData(true);
        } catch (err) { alert("신고 처리 중 오류가 발생했습니다."); }
    };

    const handleAddComment = async (parentId = null) => {
        if(!isLoggedIn) return alert("로그인 후 댓글 작성이 가능합니다.");
        const content = parentId ? replyInput : commentInput;
        if (!content?.trim()) return alert("내용을 입력하세요.");
        try {
            await axios.post(`http://localhost:8080/api/comment/add/${id}`, { content: content.trim(), parentId: parentId });
            alert("댓글을 작성하였습니다."); 
            setCommentInput(""); setReplyInput(""); setReplyTo(null);
            fetchAllData(true, true); 
        } catch (err) { alert("등록 실패"); }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editInput?.trim()) return alert("내용을 입력하세요.");
        try {
            await axios.put(`http://localhost:8080/api/comment/update/${commentId}`, { content: editInput.trim() });
            alert("댓글을 수정했습니다."); 
            setEditId(null); setEditInput("");
            fetchAllData(true, true);
        } catch (err) { alert("수정 실패"); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/comment/delete/${commentId}`);
            alert("댓글을 삭제했습니다."); 
            fetchAllData(true, true);
        } catch (err) { alert("삭제 실패"); }
    };

    const handleReportComment = async (commentId) => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        const reason = window.prompt("댓글 신고 사유를 입력해주세요:");
        if (!reason?.trim()) return;
        try {
            await axios.post(`http://localhost:8080/api/comment/report/${commentId}`, { reason, mbNum: currentUserNum });
            alert("신고가 정상적으로 접수되었습니다.");
        } catch (err) { alert("이미 신고했거나 신고 처리에 실패했습니다."); }
    };

    const renderComments = (targetParentId = null, depth = 0) => {
        const filtered = comments.filter(c => {
            const oriNum = c.coOriNum || 0;
            return targetParentId === null ? oriNum === 0 : Number(oriNum) === Number(targetParentId);
        });

        if (targetParentId === null) filtered.sort((a, b) => b.coNum - a.coNum);
        else filtered.sort((a, b) => a.coNum - b.coNum);

        return filtered.map(comment => {
            const isOwner = Number(comment.member?.mbNum) === Number(currentUserNum);
            const isReply = depth > 0;
            const isActiveEdit = editId === comment.coNum;
            const isActiveReply = replyTo === comment.coNum;
            const authorDisplayName = `User ${comment.member?.mbNum}`;

            return (
                <div key={comment.coNum}>
                    <div className="comment-unit" style={{ marginLeft: isReply ? (depth * 20) + 'px' : '0', padding: '15px 20px', borderBottom: '1px solid #f0f0f0', backgroundColor: isReply ? '#f9fafb' : 'transparent', borderLeft: isReply ? '3px solid #ddd' : 'none' }}>
                        <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '14px' }}>{authorDisplayName}</strong>
                                <span style={{ fontSize: '12px', color: '#aaa' }}>{new Date(comment.coDate).toLocaleString()}</span>
                                <button onClick={() => handleCommentLike(comment.coNum)} style={{ background: 'none', border: '1px solid #eee', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', color: '#555' }}>👍 {comment.coLike || 0}</button>
                            </div>
                            {!isActiveEdit && !isActiveReply && (
                                <div style={{ fontSize: '12px', display: 'flex', gap: '10px', color: '#888', cursor: 'pointer' }}>
                                    <span onClick={() => { setReplyTo(comment.coNum); setEditId(null); }}>답글</span>
                                    {isOwner && <span onClick={() => { setEditId(comment.coNum); setEditInput(comment.coContent); }}>수정</span>}
                                    {(isOwner || isAdmin) && <span onClick={() => handleDeleteComment(comment.coNum)}>삭제</span>}
                                    <span onClick={() => handleReportComment(comment.coNum)} style={{ color: '#ff4d4f' }}>신고</span>
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

    // 🚩 [핵심 수정] Number()를 사용하여 정확한 비교 수행
    const isPostOwner = Number(post.poMbNum) === Number(currentUserNum);
    const canDeletePost = isPostOwner || isAdmin;

    return (
        <div className="recommend-detail-wrapper">
            <div className="detail-container">
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.poTitle}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: User {post.poMbNum}</span> | 
                        <span> 조회 {post.poView}</span> | 
                        <span> 추천 {post.poUp}</span> | 
                        <span> 신고누적 {post.poReport || 0}</span> | 
                        <span> 작성일 {new Date(post.poDate).toLocaleString()}</span>
                    </div>
                </div>

                <div className="detail-body-section">
                    <div className="detail-content-text" dangerouslySetInnerHTML={{ __html: post.poContent }} style={{ lineHeight: '1.8', fontSize: '17px' }} />
                </div>

                <div className="detail-actions" style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', position: 'relative', gap: '15px' }}>
                    <button onClick={handleLikeToggle} style={{ padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', border: '1px solid #ddd', background: isLiked ? '#ff4d4f' : '#fff', color: isLiked ? '#fff' : '#333' }}>
                        {isLiked ? '❤️ 추천취소' : '🤍 추천'} {post.poUp}
                    </button>
                    
                    {/* 🚩 신고 버튼 조건문 수정: 내가 쓴 글이 아닐 때만 노출 */}
                    {!isPostOwner && (
                        <button onClick={handleReportPost} style={{ padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', border: '1px solid #ddd', background: '#fff', color: '#ff4d4f' }}>🚨 신고</button>
                    )}

                    {isPostOwner && (
                        <button onClick={handleEditPost} style={{ padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', border: '1px solid #3498db', background: '#fff', color: '#3498db' }}>✏️ 수정</button>
                    )}

                    {canDeletePost && (
                        <button onClick={handleDeletePost} style={{ padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', border: '1px solid #e67e22', background: '#fff', color: '#e67e22' }}>🗑️ 삭제</button>
                    )}

                    <button onClick={() => navigate('/community/recommend')} style={{ position: 'absolute', right: '0', padding: '10px 20px', borderRadius: '25px', border: 'none', background: '#333', color: '#fff' }}>목록</button>
                </div>

                <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

                <div className="comment-section" ref={commentAreaRef}>
                    <h3 style={{ marginBottom: '20px' }}>댓글 {comments.length}</h3>
                    {isLoggedIn ? (
                        <div className="comment-write-main" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '30px' }}>
                            <textarea style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '80px' }} value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="깨끗한 댓글 문화를 만들어주세요." />
                            <div style={{ textAlign: 'right', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                                <button onClick={() => handleAddComment(null)} style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '20px', cursor: 'pointer' }}>등록</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px', marginBottom: '30px' }}>로그인 후 이용 가능합니다.</div>
                    )}
                    <div className="comment-list-container">{renderComments(null)}</div>
                </div>
            </div>

            {selectedImg && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }} onClick={() => setSelectedImg(null)}>
                    <img src={selectedImg} alt="원본" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
                </div>
            )}
        </div>
    );
};

export default RecommendPostDetail;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { getMemberNum } from '../../utils/user';
import './RecommendPostDetail.css';

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

    const [selectedImg, setSelectedImg] = useState(null);

    const commentAreaRef = useRef(null);
    const replyInputRef = useRef(null);

    // [권한 설정] mb_num/mbNum, mb_rol/mbLevel 서버 키 둘 다 대응
    const isLoggedIn = !!user; 
    const currentUserNum = getMemberNum(user); 
    const isAdmin = user ? (Number(user.mbLevel ?? user.mb_score ?? 0) >= 10 || user.mb_rol === 'ADMIN') : false; 

    const isNumericId = id && !isNaN(Number(id)) && id !== "write";

    // 🚩 이미지 서버 주소 설정
    const SERVER_URL = "http://localhost:8080";

    /**
     * 🚩 [핵심 수정] 본문 내 이미지 경로 보정 함수
     * dangerouslySetInnerHTML로 렌더링하기 전, src="/pic/..." 형태를 
     * src="http://localhost:8080/pic/..." 형태로 치환합니다.
     */
    const fixImagePaths = (content) => {
        if (!content) return "";
        // src="/pic/ 또는 src="pic/ 로 시작하는 모든 경로를 서버 주소와 결합
        return content.replace(/src=["'](?:\/)?pic\//g, `src="${SERVER_URL}/pic/`);
    };

    const incrementViewCount = useCallback(async () => {
        if (!isNumericId) return;
        const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
        if (!viewedPosts.includes(id)) {
            try {
                await axios.post(`${SERVER_URL}/api/recommend/posts/${id}/view`);
                viewedPosts.push(id);
                sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
            } catch (err) {
                console.error("조회수 증가 실패", err);
            }
        }
    }, [id, isNumericId, SERVER_URL]);

    const fetchAllData = useCallback(async (isAction = false, isCommentAction = false) => {
        if (!isNumericId) return;

        try {
            if (!isAction) setLoading(true);
            
            const postRes = await axios.get(`${SERVER_URL}/api/recommend/posts/${id}`);
            setPost(postRes.data);
            setIsLiked(postRes.data.isLikedByMe || false);

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
    }, [id, navigate, isNumericId, SERVER_URL]);

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
            const res = await axios.post(`${SERVER_URL}/api/recommend/posts/${id}/like`, { mbNum: currentUserNum });
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
            const res = await axios.post(`${SERVER_URL}/api/comment/like/${commentId}`, { mbNum: currentUserNum });
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
        if(!isLoggedIn) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }

        const reportedPosts = JSON.parse(localStorage.getItem('reportedPosts') || '[]');
        if (reportedPosts.includes(`${currentUserNum}_${id}`)) {
            alert("이미 신고하신 게시글입니다.");
            return;
        }
        const reason = window.prompt("게시글 신고 사유를 입력해주세요:");
        if (!reason?.trim()) return;
        try {
            await axios.post(`${SERVER_URL}/api/recommend/posts/${id}/report`, { reason, mbNum: currentUserNum });
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
            await axios.post(`${SERVER_URL}/api/comment/add/${id}`, { 
                content: content.trim(), 
                parentId: parentId,
                mbNum: currentUserNum 
            });
            alert("댓글을 작성하였습니다."); 
            setCommentInput(""); setReplyInput(""); setReplyTo(null);
            fetchAllData(true, true); 
        } catch (err) { alert("등록 실패"); }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editInput?.trim()) return alert("내용을 입력하세요.");
        try {
            await axios.put(`${SERVER_URL}/api/comment/update/${commentId}`, { content: editInput.trim() });
            alert("댓글을 수정했습니다."); 
            setEditId(null); setEditInput("");
            fetchAllData(true, true);
        } catch (err) { alert("수정 실패"); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${SERVER_URL}/api/comment/delete/${commentId}`);
            alert("댓글을 삭제했습니다."); 
            fetchAllData(true, true);
        } catch (err) { alert("삭제 실패"); }
    };

    const handleReportComment = async (commentId) => {
        if(!isLoggedIn) return alert("로그인이 필요한 서비스입니다.");
        const reason = window.prompt("댓글 신고 사유를 입력해주세요:");
        if (!reason?.trim()) return;
        try {
            await axios.post(`${SERVER_URL}/api/comment/report/${commentId}`, { reason, mbNum: currentUserNum });
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
            const isCommentOwner = isLoggedIn && comment.member && getMemberNum(comment.member) === currentUserNum;
            const isReply = depth > 0;
            const isActiveEdit = editId === comment.coNum;
            const isActiveReply = replyTo === comment.coNum;
            const authorDisplayName = `User ${getMemberNum(comment.member) ?? 'Unknown'}`;

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

    const isPostOwner = isLoggedIn && Number(post.poMbNum) === Number(currentUserNum);
    const canManagePost = isPostOwner || isAdmin;

    return (
        <div className="recommend-detail-wrapper">
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
                        <span>신고누적 {post.poReport || 0}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.poDate).toLocaleString()}</span>
                    </div>
                </div>

                <div className="detail-body-text">
                    {/* 🚩 [수정] 본문 출력 시 fixImagePaths 함수를 거쳐서 경로를 보정한 후 출력합니다. */}
                    <div dangerouslySetInnerHTML={{ __html: fixImagePaths(post.poContent) }} />
                </div>

                <div className="detail-bottom-actions">
                    <div className="left-group">
                        {isLoggedIn && (
                            <button className={`btn-like-action ${isLiked ? 'active' : ''}`} onClick={handleLikeToggle}>
                                {isLiked ? '❤️ 추천취소' : '🤍 추천'} {post.poUp}
                            </button>
                        )}
                        
                        {!isPostOwner && (
                            <button className="btn-report-action" onClick={handleReportPost}>
                                🚨 신고하기
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
                        목록으로 돌아가기
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

            {selectedImg && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }} onClick={() => setSelectedImg(null)}>
                    <img src={selectedImg} alt="원본" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
                </div>
            )}
        </div>
    );
};

export default RecommendPostDetail;
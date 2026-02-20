import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './PostComment.css';

const PostComment = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null); 
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);
    const isFetching = useRef(false);

    // 🚩 서버 엔티티 필드명(id, content, createdAt, userId, postId, parentId)과 100% 일치시킴
    const fetchComments = useCallback(async () => {
        if (!postId || isFetching.current) return;
        try {
            isFetching.current = true;
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/api/comments/post/${postId}`);
            setComments(response.data);
        } catch (error) {
            console.error("댓글 로딩 실패:", error);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [postId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleAddComment = async (parentId = 0) => {
        const content = parentId !== 0 ? replyText : newComment;
        if (!content.trim()) { alert("내용을 입력해주세요."); return; }
        
        try {
            // 🚩 핵심 수정: mbNum을 엔티티 필드명인 userId로 변경하여 500 에러 해결
            const commentData = {
                content: content.trim(),
                postId: Number(postId),
                userId: 1, // 서버 Entity의 userId 필드와 매칭
                parentId: parentId === 0 ? null : parentId 
            };

            await axios.post('http://localhost:8080/api/comments', commentData);
            
            setNewComment(''); 
            setReplyText(''); 
            setReplyTo(null);
            fetchComments(); 
        } catch (error) { 
            console.error("등록 에러:", error.response?.data || error.message);
            alert("댓글 등록에 실패했습니다."); 
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            try {
                await axios.delete(`http://localhost:8080/api/comments/${id}`);
                fetchComments();
            } catch (error) { alert("삭제 실패"); }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const renderComments = (parentId = null, depth = 0) => {
        let filtered = comments.filter(c => {
            const currentParentId = c.parentId;
            const currentId = c.id;
            
            if (depth === 0) {
                return !currentParentId || currentParentId === 0 || currentParentId === currentId;
            }
            return currentParentId === parentId && currentParentId !== currentId;
        });
        
        if (depth === 0) {
            filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return filtered.map(comment => (
            <div key={comment.id} className={`comment-item ${depth > 0 ? 'reply-item' : ''}`}>
                <div className="comment-header">
                    <div className="user-info">
                        {/* 🚩 mbNum 대신 엔티티 필드명인 userId 사용 */}
                        <span className="author">User {comment.userId}</span>
                        <span className="date">{formatDate(comment.createdAt)}</span>
                    </div>
                    <div className="comment-actions">
                        <button onClick={() => { setReplyTo(comment.id); setReplyText(''); }}>답글</button>
                        <button onClick={() => handleDelete(comment.id)} className="delete-btn">삭제</button>
                        <button className="report-btn" onClick={() => alert("댓글 신고 접수: " + comment.id)}>신고</button>
                    </div>
                </div>
                <div className="comment-content">{comment.content}</div>

                {replyTo === comment.id && (
                    <div className="comment-input-area reply-input-container">
                        <textarea 
                            value={replyText} 
                            onChange={(e) => setReplyText(e.target.value)} 
                            placeholder="답글을 남겨보세요." 
                            autoFocus
                        />
                        <div className="reply-button-group">
                            <button className="btn-cancel" onClick={() => setReplyTo(null)}>취소</button>
                            <button className="submit-btn" onClick={() => handleAddComment(comment.id)}>등록</button>
                        </div>
                    </div>
                )}
                <div className="nested-replies">{renderComments(comment.id, depth + 1)}</div>
            </div>
        ));
    };

    return (
        <div className="comments-wrapper">
            <h3 className="comment-count">댓글 {comments.length}</h3>
            <div className="comment-input-area main-input">
                <textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="비방이나 욕설은 삼가주세요." 
                />
                <button className="submit-btn" onClick={() => handleAddComment(0)}>등록</button>
            </div>
            
            <div className="comments-list">
                {loading && comments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                        댓글을 불러오는 중입니다...
                    </div>
                ) : (
                    renderComments(null)
                )}
            </div>
        </div>
    );
};

export default PostComment;
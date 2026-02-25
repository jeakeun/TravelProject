import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { getMemberNum } from '../../utils/user'; 
import './NoticeDetail.css'; 

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext() || {}; 
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = !!user;
    const currentUserNum = getMemberNum(user);

    const fetchDetail = useCallback(async () => {
        if (!id || id === 'undefined' || id === 'write') return;
        
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8080/api/notice/posts/${id}`, { withCredentials: true });
            setPost(res.data);
        } catch (err) {
            alert("게시글을 불러올 수 없습니다.");
            navigate('/news/notice');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const handleDelete = async () => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/news/notice/posts/${id}`);
            alert("삭제되었습니다.");
            navigate('/news/notice');
        } catch (err) {
            alert("삭제에 실패했습니다.");
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (!post) return null;

    const isOwner = isLoggedIn && Number(post.nnMbNum) === Number(currentUserNum);

    return (
        <div className="review-detail-wrapper">
            <div className="detail-container">
                
                <div className="detail-header-section">
                    <h1 className="detail-main-title">{post.nnTitle}</h1>
                    <div className="detail-sub-info">
                        <span>작성자: User {post.nnMbNum}</span> 
                        <span className="info-divider">|</span>
                        <span>조회 {post.nnView}</span> 
                        <span className="info-divider">|</span>
                        <span>작성일 {new Date(post.nnDate).toLocaleString()}</span>
                    </div>
                </div>

                <div className="detail-body-text">
                    <div dangerouslySetInnerHTML={{ __html: post.nnContent }} />
                </div>
                
                <div className="detail-bottom-actions">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {isOwner && (
                            <>
                                <button className="btn-edit-action" onClick={() => navigate(`/news/notice/edit/${id}`)}>수정</button>
                                <button className="btn-delete-action" onClick={handleDelete}>삭제</button>
                            </>
                        )}
                    </div>
                    <button className="btn-list-return" onClick={() => navigate('/news/notice')}>목록으로</button>
                </div>

            </div>
        </div>
    );
};

export default NoticeDetail;
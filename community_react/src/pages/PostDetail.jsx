import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PostDetail.css';
import PostComment from '../components/PostComment'; 

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const isFetched = useRef(false);

    useEffect(() => {
        const fetchPostDetail = async () => {
            if (isFetched.current) return;
            isFetched.current = true;

            try {
                setLoading(true);
                const response = await api.get(`http://localhost:8080/api/freeboard/posts/${id}`);
                setPost(response.data);
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
                alert("게시글을 찾을 수 없습니다.");
                navigate('/community/freeboard');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPostDetail();
    }, [id, navigate]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>데이터 로딩 중...</div>;
    if (!post) return null;

    return (
        <div className="post-detail-container" style={{ padding: '40px', maxWidth: '1000px', margin: '50px auto', background: '#fff', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div className="post-header" style={{ borderBottom: '2px solid #2c3e50', paddingBottom: '20px', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '15px' }}>{post.title}</h1>
                <div className="post-info" style={{ display: 'flex', gap: '20px', color: '#7f8c8d', fontSize: '0.9rem' }}>
                    <span>작성자: User {post.userId}</span>
                    <span>조회수: {post.viewCount}</span>
                    <span>작성일: {new Date(post.createdAt).toLocaleString()}</span>
                </div>
            </div>

            <div className="post-content" style={{ minHeight: '300px', lineHeight: '1.8', fontSize: '1.1rem', color: '#333' }}>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                {post.fileUrl && (
                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <img src={post.fileUrl} alt="첨부 이미지" style={{ maxWidth: '100%', borderRadius: '10px' }} />
                    </div>
                )}
            </div>

            <div className="post-footer" style={{ marginTop: '50px', marginBottom: '40px', textAlign: 'center' }}>
                <button onClick={() => navigate('/community/freeboard')} style={{ padding: '10px 35px', backgroundColor: '#f1f3f5', color: '#2c3e50', border: '1px solid #ddd', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                    목록으로 돌아가기
                </button>
            </div>

            {/* 🚩 핵심: postId라는 이름으로 id 값을 정확히 전달 */}
            <div className="comment-section" style={{ borderTop: '1px solid #eee', paddingTop: '30px' }}>
                <PostComment postId={id} />
            </div>
        </div>
    );
};

export default PostDetail;
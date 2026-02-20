import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PostComment from '../components/PostComment';

const PostDetail = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const location = useLocation();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const isErrorHandled = useRef(false);

    const getCategoryPath = () => {
        if (location.pathname.includes('recommend')) return 'recommend';
        if (location.pathname.includes('reviewboard')) return 'reviewboard';
        return 'freeboard';
    };

    const categoryPath = getCategoryPath();
    const backPath = `/community/${categoryPath}`;

    useEffect(() => {
        if (!id || id === 'undefined') return;

        const fetchPostDetail = async () => {
            try {
                setLoading(true);
                isErrorHandled.current = false;

                const apiUrl = `http://localhost:8080/api/${categoryPath}/posts/${id}`;
                const response = await axios.get(apiUrl, { withCredentials: true });
                
                if (response.data) {
                    setPost(response.data);
                }
            } catch (err) {
                console.error('데이터 로딩 실패:', err);
                if (!isErrorHandled.current) {
                    isErrorHandled.current = true;
                    alert('게시글을 찾을 수 없습니다.');
                    navigate(backPath, { replace: true });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
        return () => { isErrorHandled.current = false; };
    }, [id, categoryPath, backPath, navigate]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>데이터 로딩 중...</div>;
    if (!post) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString();
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '50px auto', background: '#fff', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>
                {post.poTitle || post.title}
            </h1>
            
            <div style={{ color: '#666', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px', fontSize: '0.9rem' }}>
                작성자: User {post.poMbNum || post.userId} | 조회수: {post.poView || post.viewCount || 0} | 작성일: {formatDate(post.poDate || post.createdAt)}
            </div>
            
            <div 
                dangerouslySetInnerHTML={{ __html: post.poContent || post.content }} 
                style={{ minHeight: '200px', lineHeight: '1.8', color: '#333', fontSize: '1.1rem', marginBottom: '30px' }} 
            />
            
            {/* 🚩 서버에서 생성된 전체 경로를 그대로 출력 */}
            {post.fileUrl && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <img 
                        src={post.fileUrl} 
                        alt="첨부 이미지" 
                        style={{ maxWidth: '100%', borderRadius: '10px' }} 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}
            
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                <button 
                    onClick={() => navigate(backPath)} 
                    style={{ padding: '12px 30px', backgroundColor: '#34495e', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    목록으로 돌아가기
                </button>
            </div>
            
            <PostComment postId={post.poNum || post.postId} />
        </div>
    );
};

export default PostDetail;
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PhotoDetail({ photos }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. photos가 아직 로딩되지 않았을 경우를 대비한 방어 코드
  if (!photos || photos.length === 0) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>데이터를 불러오는 중입니다...</div>;
  }

  // 2. URL의 id와 일치하는 게시글 찾기
  const photo = photos.find(p => String(p.post_id) === id);

  // 3. 해당 ID의 게시글이 없을 경우
  if (!photo) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <p>게시글을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/community')} style={{ marginTop: '20px', cursor: 'pointer' }}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="photo-detail-container" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* 🚩 요청하신 대로 11시 방향 뒤로가기 버튼은 제거되었습니다. */}
      
      {/* 이미지 섹션 */}
      <div className="detail-image-wrapper" style={{ marginBottom: '30px', textAlign: 'center' }}>
        {photo.file_url ? (
          <img 
            src={photo.file_url} 
            alt={photo.title} 
            style={{ width: '100%', maxHeight: '600px', borderRadius: '12px', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '300px', backgroundColor: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            이미지가 없습니다.
          </div>
        )}
      </div>

      {/* 정보 섹션 */}
      <div className="detail-info">
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '15px', letterSpacing: '-1px' }}>
          {photo.title}
        </h1>
        <div style={{ color: '#888', fontSize: '0.95rem', borderBottom: '1px solid #eee', paddingBottom: '20px', display: 'flex', gap: '15px' }}>
          <span>조회수 {photo.view_count || 0}</span>
          <span>추천 {photo.likes || 0}</span>
        </div>
        
        {/* 🚩 중요: PostWrite에서 저장한 HTML 태그를 그대로 보여주기 위해 dangerouslySetInnerHTML 사용 */}
        <div 
          className="detail-content" 
          style={{ marginTop: '30px', fontSize: '1.1rem', lineHeight: '1.8', color: '#333', minHeight: '200px' }}
          dangerouslySetInnerHTML={{ __html: photo.content || "내용이 없습니다." }}
        />
      </div>

      {/* 하단 목록 버튼 */}
      <div style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '40px' }}>
        <button 
          onClick={() => navigate('/community')}
          style={{ 
            padding: '12px 40px', 
            backgroundColor: '#000', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '30px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default PhotoDetail;
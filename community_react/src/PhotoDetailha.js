import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

function PhotoDetail() {
  const { id } = useParams(); // URL에서 id 추출
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    api.get(`http://localhost:8080/api/photos/${id}`)
      .then(res => setPhoto(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!photo) return <div>로딩 중...</div>;

  return (
    <div className="detail-container">
      <h1>{photo.title} 상세 보기</h1>
      <img src={photo.url} alt={photo.title} style={{ width: '100%' }} />
      <p>{photo.description || "상세 설명이 없습니다."}</p>
    </div>
  );
}
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PostWrite({ refreshPosts, activeMenu }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  
  // 🚩 기존 단일 상태에서 배열 상태로 변경하여 다중 첨부 지원
  const [imagePreviews, setImagePreviews] = useState([]); // 미리보기 URL들
  const [imageFiles, setImageFiles] = useState([]);      // 전송할 파일 객체들
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const navyBtnStyle = {
    backgroundColor: '#34495e', 
    color: '#fff', 
    padding: '12px 35px',
    borderRadius: '25px', 
    border: 'none', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease'
  };

  // 🚩 다중 이미지 처리를 위한 핸들러 (기존 로직 보완)
  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // 새 파일들을 기존 배열에 추가
      setImageFiles((prev) => [...prev, ...files]);

      // 각 파일에 대한 미리보기 생성 및 누적
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 🚩 첨부된 사진 중 특정 사진만 제거하는 기능 추가
  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const htmlContent = editorRef.current.innerHTML; 
    
    if (!title.trim() || !htmlContent.replace(/<[^>]*>?/gm, '').trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', htmlContent);

    // 🚩 다중 파일을 동일한 'image' 키로 반복 추가 (백엔드 MultipartFile[] 대응)
    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('image', file);
      });
    }

    const apiMap = {
      '여행 추천 게시판': 'recommend',
      '여행 후기 게시판': 'reviewboard',
      '자유 게시판': 'freeboard'
    };
    
    const categoryPath = apiMap[activeMenu] || 'freeboard';
    const apiUrl = `http://localhost:8080/api/${categoryPath}/posts`;

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true 
      });

      if (response.status === 200 || response.status === 201) {
        alert(`${activeMenu}에 글이 등록되었습니다!`);
        if (refreshPosts) await refreshPosts(); 
        navigate(-1); 
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert("서버 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="post-write-wrapper" style={{ padding: '0 20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '1.2rem', fontWeight: '800' }}>
        {activeMenu} 글쓰기
      </h2>

      <div style={{ background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <input 
          type="text" 
          placeholder="제목을 입력하세요" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ width: '100%', fontSize: '1.8rem', padding: '15px 0', border: 'none', borderBottom: '2px solid #d1d8e0', marginBottom: '30px', outline: 'none', fontWeight: '700' }} 
        />

        <div 
          ref={editorRef} 
          contentEditable="true" 
          style={{ minHeight: '400px', padding: '20px', border: '1px solid #d1d8e0', borderRadius: '12px', outline: 'none', fontSize: '1.1rem', lineHeight: '1.8' }}
          placeholder="내용을 입력하세요..."
        ></div>

        <div style={{ marginTop: '30px' }}>
          {/* 🚩 버튼 명칭 유지 및 다중 선택(multiple) 속성 추가 */}
          <button type="button" style={{ ...navyBtnStyle, backgroundColor: '#4b6584' }} onClick={() => fileInputRef.current.click()}>📷 사진 첨부</button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
            accept="image/*" 
            multiple 
          />
          
          {/* 🚩 여러 장의 이미지를 나열하는 미리보기 영역 */}
          {imagePreviews.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={preview} 
                    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #eee' }} 
                    alt={`미리보기 ${index + 1}`} 
                  />
                  {/* 개별 사진 삭제 버튼 (디자인 포인트) */}
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
          <button type="button" style={{ ...navyBtnStyle, backgroundColor: '#f1f4f7', color: '#4b6584', border: '1px solid #d1d8e0' }} onClick={() => navigate(-1)}>취소</button>
          <button type="button" style={navyBtnStyle} onClick={handleSubmit}>등록하기</button>
        </div>
      </div>
    </div>
  );
}

export default PostWrite;
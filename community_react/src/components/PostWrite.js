import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// 🚩 부모(Appha.js)로부터 activeMenu를 전달받습니다.
function PostWrite({ refreshPosts, activeMenu }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
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
    boxShadow: '0 4px 10px rgba(52, 73, 94, 0.2)',
    transition: 'all 0.3s ease'
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const htmlContent = editorRef.current.innerHTML;
    if (!title.trim() || !htmlContent.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', htmlContent);
    formData.append('category', activeMenu);

    if (imageFile) formData.append('image', imageFile);

    // 🚩 [핵심 수정] 게시판 종류에 따라 호출할 백엔드 컨트롤러 주소를 결정합니다.
    let apiUrl = 'http://localhost:8080/api/posts'; // 기본 (여행 추천 게시판 등)
    
    if (activeMenu === '자유 게시판') {
      apiUrl = 'http://localhost:8080/api/freeboard/posts';
    } else if (activeMenu === '여행 후기 게시판') {
      apiUrl = 'http://localhost:8080/api/reviewboard/posts';
    }

    try {
      const response = await api.post(apiUrl, formData);
      if (response.status === 200 || response.status === 201) {
        alert(`${activeMenu}에 글이 등록되었습니다!`);
        if (refreshPosts) await refreshPosts(); 
        navigate(-1); 
      }
    } catch (error) {
      console.error("저장 실패:", error);
      // 🚩 서버 에러 발생 시 상세 메시지 출력
      const errorMsg = error.response?.data || "서버 연결 상태를 확인하세요.";
      alert(`서버 저장 실패: ${errorMsg}`);
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
          style={{ 
            width: '100%', fontSize: '1.8rem', padding: '15px 0', 
            border: 'none', borderBottom: '2px solid #d1d8e0', 
            marginBottom: '30px', outline: 'none', fontWeight: '700',
            color: '#2c3e50'
          }} 
          onFocus={(e) => e.target.style.borderBottomColor = '#34495e'}
          onBlur={(e) => e.target.style.borderBottomColor = '#d1d8e0'}
        />

        <div 
          ref={editorRef} 
          contentEditable="true" 
          style={{ 
            minHeight: '400px', padding: '20px', 
            border: '1px solid #d1d8e0', borderRadius: '12px', 
            outline: 'none', fontSize: '1.1rem', lineHeight: '1.8',
            color: '#333'
          }}
        ></div>

        <div style={{ marginTop: '30px' }}>
          <button 
            style={{ ...navyBtnStyle, backgroundColor: '#4b6584' }} 
            onClick={() => fileInputRef.current.click()}
          >
            📷 사진 첨부
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />
          {imagePreview && (
            <div style={{ marginTop: '20px' }}>
              <img 
                src={imagePreview} 
                style={{ maxWidth: '300px', borderRadius: '12px', border: '1px solid #eee' }} 
                alt="미리보기" 
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
          <button 
            style={{ ...navyBtnStyle, backgroundColor: '#f1f4f7', color: '#4b6584', border: '1px solid #d1d8e0', boxShadow: 'none' }} 
            onClick={() => navigate(-1)}
          >
            취소
          </button>
          <button 
            style={navyBtnStyle} 
            onClick={handleSubmit}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostWrite;
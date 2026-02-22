import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function PostWrite({ refreshPosts, activeMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEdit = location.state?.mode === 'edit';
  const existingPost = location.state?.postData;

  const [title, setTitle] = useState('');
  const [imageFiles, setImageFiles] = useState([]);      
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEdit && existingPost) {
      // 서버에서 poTitle 또는 title 어느 쪽으로 내려오든 대응
      setTitle(existingPost.poTitle || existingPost.title || '');
      if (editorRef.current) {
        editorRef.current.innerHTML = existingPost.poContent || existingPost.content || '';
      }
    }
  }, [isEdit, existingPost]);

  const insertImageAtCursor = (base64Data) => {
    editorRef.current.focus();
    const imgHtml = `
      <div style="text-align:center; margin: 20px 0;" contenteditable="false">
        <img src="${base64Data}" style="max-width:100%; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1);" />
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, imgHtml);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          insertImageAtCursor(reader.result);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    const htmlContent = editorRef.current.innerHTML; 
    const textContent = htmlContent.replace(/<[^>]*>?/gm, '').trim();
    const hasImage = htmlContent.includes('<img');

    if (!title.trim() || (!textContent && !hasImage)) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    
    // 🚩 [핵심 수정] 백엔드 DTO 필드명 규격(po+대문자)에 맞게 변경
    formData.append('poTitle', title);
    formData.append('poContent', htmlContent);
    formData.append('poMbNum', 1); // 테스트용 번호 (로그인 연동 전)

    // 🚩 이미지 파일 키값: 서버가 @RequestParam("image")로 받는지 확인 필요
    if (imageFiles.length > 0) {
      formData.append('image', imageFiles[0]); 
    }

    const apiMap = {
      '여행 추천 게시판': 'recommend',
      '여행 후기 게시판': 'reviewboard',
      '자유 게시판': 'freeboard'
    };
    
    const categoryPath = apiMap[activeMenu] || 'freeboard';
    const apiUrl = isEdit 
      ? `http://localhost:8080/api/${categoryPath}/posts/${existingPost?.poNum || existingPost?.postId}`
      : `http://localhost:8080/api/${categoryPath}/posts`;

    try {
      const response = await axios({
        method: isEdit ? 'put' : 'post',
        url: apiUrl,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (response.status === 200 || response.status === 201) {
        alert(isEdit ? "글이 수정되었습니다!" : `${activeMenu}에 글이 등록되었습니다!`);
        if (refreshPosts) await refreshPosts(); 
        navigate(-1); 
      }
    } catch (error) {
      console.error("저장 실패:", error);
      // 서버에서 보내주는 에러 메시지를 alert에 띄워 상세 이유를 파악하도록 수정
      const errorMsg = error.response?.data?.message || error.response?.data || "데이터 형식이 맞지 않습니다.";
      alert(`저장 실패 (400): ${errorMsg}`);
    }
  };

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

  return (
    <div className="post-write-wrapper" style={{ padding: '0 20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '1.2rem', fontWeight: '800' }}>
        {activeMenu} {isEdit ? '수정하기' : '글쓰기'}
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
          style={{ 
            minHeight: '450px', 
            padding: '25px', 
            border: '1px solid #d1d8e0', 
            borderRadius: '12px', 
            outline: 'none', 
            fontSize: '1.1rem', 
            lineHeight: '1.8',
            overflowY: 'auto'
          }}
        ></div>

        <div style={{ marginTop: '30px' }}>
          <button 
            type="button" 
            style={{ ...navyBtnStyle, backgroundColor: '#4b6584' }} 
            onClick={() => fileInputRef.current.click()}
          >
            📷 사진 첨부
          </button>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '10px' }}>
            * 버튼을 누르면 커서가 위치한 곳에 사진이 첨부됩니다.
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
            accept="image/*" 
            multiple 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
          <button type="button" style={{ ...navyBtnStyle, backgroundColor: '#f1f4f7', color: '#4b6584', border: '1px solid #d1d8e0' }} onClick={() => navigate(-1)}>취소</button>
          <button type="button" style={navyBtnStyle} onClick={handleSubmit}>
            {isEdit ? '수정 완료' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostWrite;
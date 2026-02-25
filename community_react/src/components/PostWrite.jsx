import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import axios from 'axios';

function PostWrite({ user, refreshPosts, activeMenu, boardType: propsBoardType }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const boardParam = queryParams.get('board');

  const { user: contextUser, loadPosts } = useOutletContext() || {};
  const currentUser = user || contextUser;

  const isEdit = location.state?.mode === 'edit';
  const existingPost = location.state?.postData;
  const stateBoardType = location.state?.boardType;

  const [title, setTitle] = useState('');
  const [imageFiles, setImageFiles] = useState([]);      
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEdit && existingPost) {
      setTitle(existingPost.poTitle || existingPost.po_title || existingPost.title || '');
      if (editorRef.current) {
        editorRef.current.innerHTML = existingPost.poContent || existingPost.po_content || existingPost.content || '';
      }
    }
  }, [isEdit, existingPost]);

  const insertImageAtCursor = (base64Data) => {
    if (!editorRef.current) return;
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
      // 🚩 기존 파일 리스트에 추가 (누적 선택 가능)
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
    const htmlContent = editorRef.current?.innerHTML || ""; 
    const textContent = htmlContent.replace(/<[^>]*>?/gm, '').trim();
    const hasImage = htmlContent.includes('<img');

    if (!title.trim() || (!textContent && !hasImage)) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    // 🚩 FormData 구성 최적화
    const formData = new FormData();
    // mbNum, mb_num, id 등 다양한 사용자 식별자 대응
    const authorNum = currentUser?.mbNum || currentUser?.mb_num || currentUser?.id || 1;

    // 스프링 부트 컨트롤러의 DTO/파라미터 명칭과 일치시킵니다.
    formData.append('poTitle', title);
    formData.append('poContent', htmlContent);
    formData.append('poMbNum', String(authorNum));

    // 🚩 [핵심] 단일 파일('image')이 아닌 리스트('images')로 모든 파일 전송
    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('images', file); 
      });
    }

    // API 경로 결정 로직
    const apiMap = {
      '여행 추천 게시판': 'recommend',
      '여행 후기 게시판': 'reviewboard',
      '자유 게시판': 'freeboard',
      '이벤트': 'event',
      '뉴스레터': 'newsletter'
    };
    
    const path = location.pathname;
    let urlDerivedBoard = '';
    if (path.includes('/newsletter')) urlDerivedBoard = 'newsletter';
    else if (path.includes('/event')) urlDerivedBoard = 'event';
    else if (path.includes('/recommend')) urlDerivedBoard = 'recommend';
    else if (path.includes('/freeboard')) urlDerivedBoard = 'freeboard';

    let categoryPath = propsBoardType || stateBoardType || urlDerivedBoard || boardParam || apiMap[activeMenu] || 'freeboard';

    // 한글명 카테고리를 영문 API 경로로 변환
    if (categoryPath === '이벤트' || categoryPath === '이벤트 게시판') categoryPath = 'event';
    if (categoryPath === '뉴스레터') categoryPath = 'newsletter';
    if (categoryPath === '여행 추천 게시판') categoryPath = 'recommend';
    if (categoryPath === '자유 게시판') categoryPath = 'freeboard';

    const apiUrl = isEdit 
      ? `http://localhost:8080/api/${categoryPath}/posts/${existingPost?.poNum || existingPost?.po_num || existingPost?.id}`
      : `http://localhost:8080/api/${categoryPath}/posts`;

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

    try {
      const response = await axios({
        method: isEdit ? 'put' : 'post',
        url: apiUrl,
        data: formData,
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        withCredentials: true
      });

      if (response.status === 200 || response.status === 201 || String(response.data).includes("Success")) {
        alert(isEdit ? "글이 수정되었습니다!" : "글이 등록되었습니다!");
        if (refreshPosts) await refreshPosts();
        else if (loadPosts) await loadPosts();
        navigate(-1); 
      }
    } catch (error) {
      console.error("저장 실패 상세:", error.response);
      let errorMsg = "서버와 통신 중 오류가 발생했습니다.";
      if (error.response?.data) {
        errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data));
      }
      alert(`저장 실패: ${errorMsg}`);
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
        {activeMenu || (location.pathname.includes('newsletter') ? '뉴스레터' : location.pathname.includes('event') ? '이벤트 게시판' : boardParam)} {isEdit ? '수정하기' : '글쓰기'}
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
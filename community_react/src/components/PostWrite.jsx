import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

function PostWrite({ user, refreshPosts, activeMenu, boardType: propsBoardType }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  
  const queryParams = new URLSearchParams(location.search);
  const boardParam = queryParams.get('board');

  const { user: contextUser, loadPosts } = useOutletContext() || {};
  const currentUser = user || contextUser;

  const isEdit = location.pathname.includes('/edit/') || location.state?.mode === 'edit';
  const statePostData = location.state?.postData;
  const stateBoardType = location.state?.boardType;

  const [title, setTitle] = useState('');
  const [imageFiles, setImageFiles] = useState([]);      
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // 🚩 [수정] 공지사항(notice) 경로 인식을 위한 로직 추가 및 기존 로직 유지
  const getCategoryPath = useCallback(() => {
    const path = location.pathname;
    if (propsBoardType) return propsBoardType;
    if (stateBoardType) return stateBoardType;
    if (path.includes('/notice')) return 'notice'; // 공지사항 경로 추가
    if (path.includes('/newsletter')) return 'newsletter';
    if (path.includes('/event')) return 'event';
    if (path.includes('/recommend')) return 'recommend';
    if (path.includes('/freeboard')) return 'freeboard';
    if (path.includes('/faq')) return 'faq';
    if (boardParam) return boardParam;
    
    const apiMap = {
      '공지사항': 'notice',
      '이벤트': 'event',
      '이벤트 게시판': 'event',
      '뉴스레터': 'newsletter',
      '여행 추천 게시판': 'recommend',
      '자유 게시판': 'freeboard',
      '자주 묻는 질문': 'faq'
    };
    return apiMap[activeMenu] || 'freeboard';
  }, [location.pathname, propsBoardType, stateBoardType, boardParam, activeMenu]);

  // 🚩 [보완] 관리자 권한 체크 (로딩 중 멈춤 방지)
  useEffect(() => {
    if (currentUser) {
        const isAdmin = 
            currentUser.mbRol === 'ADMIN' || 
            currentUser.mb_rol === 'ADMIN' || 
            currentUser.role === 'ADMIN' || 
            currentUser.mbLevel >= 10;

        if (!isAdmin) {
            alert('관리자만 접근 가능합니다.');
            navigate(-1);
        }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchPostData = async () => {
      if (statePostData) {
        setTitle(statePostData.poTitle || statePostData.title || '');
        if (editorRef.current) {
          editorRef.current.innerHTML = statePostData.poContent || statePostData.content || '';
        }
        return;
      }

      if (isEdit && id) {
        try {
          const category = getCategoryPath();
          const response = await axios.get(`${API_BASE_URL}/api/${category}/posts/${id}`);
          const data = response.data;
          setTitle(data.poTitle || data.title || '');
          if (editorRef.current) {
            editorRef.current.innerHTML = data.poContent || data.content || '';
          }
        } catch (error) {
          console.error("기존 글 로딩 실패:", error);
        }
      }
    };

    fetchPostData();
  }, [isEdit, id, statePostData, getCategoryPath]);

  const insertImageAtCursor = (base64Data) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const imgHtml = `
      <div class="img-container" style="text-align:center; margin: 20px 0;">
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
    const htmlContent = editorRef.current?.innerHTML || ""; 
    const textContent = htmlContent.replace(/<[^>]*>?/gm, '').trim();
    const hasImage = htmlContent.includes('<img');

    if (!title.trim() || (!textContent && !hasImage)) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const rawAuthorNum = currentUser?.mbNum || currentUser?.mb_num || currentUser?.id;
    const authorNum = rawAuthorNum ? Number(rawAuthorNum) : null;

    let categoryPath = getCategoryPath();
    const correctionMap = {
      '공지사항': 'notice',
      '이벤트': 'event', '이벤트 게시판': 'event',
      '뉴스레터': 'newsletter', '여행 추천 게시판': 'recommend',
      '자유 게시판': 'freeboard', '자주 묻는 질문': 'faq'
    };
    categoryPath = correctionMap[categoryPath] || categoryPath;

    // 🚩 [수정 부분] 공지사항(notice)일 때는 JSON 전송, 그 외에는 FormData 전송
    let requestData;
    let contentType;

    if (categoryPath === 'notice') {
      // 공지사항은 백엔드 NoticePost 규격(JSON)에 맞춤
      requestData = {
        nnTitle: title,
        nnContent: htmlContent
      };
      contentType = 'application/json';
    } else {
      // 다른 게시판은 기존대로 FormData 전송
      const formData = new FormData();
      formData.append('poTitle', title);
      formData.append('poContent', htmlContent);
      formData.append('poMbNum', authorNum || 1);
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file); 
        });
      }
      requestData = formData;
      contentType = 'multipart/form-data';
    }

    const apiUrl = isEdit 
      ? `${API_BASE_URL}/api/${categoryPath}/posts/${id || statePostData?.poNum || statePostData?.id}`
      : `${API_BASE_URL}/api/${categoryPath}/posts`;

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

    try {
      const response = await axios({
        method: isEdit ? 'put' : 'post',
        url: apiUrl,
        data: requestData,
        headers: { 
          'Content-Type': contentType,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        withCredentials: true
      });

      if (response.status >= 200 && response.status < 300) {
        alert(isEdit ? "글이 수정되었습니다!" : "글이 등록되었습니다!");
        if (refreshPosts) await refreshPosts();
        if (loadPosts) await loadPosts();
        navigate(-1); 
      }
    } catch (error) {
      console.error("저장 실패 상세:", error.response);
      const errorData = error.response?.data;
      const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.message || errorData?.error || "서버 규격 오류가 발생했습니다.");
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
        {activeMenu || (location.pathname.includes('notice') ? '공지사항' : location.pathname.includes('newsletter') ? '뉴스레터' : location.pathname.includes('event') ? '이벤트 게시판' : location.pathname.includes('faq') ? '자주 묻는 질문' : boardParam)} {isEdit ? '수정하기' : '글쓰기'}
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
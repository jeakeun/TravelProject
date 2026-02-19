import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 라우팅을 위한 브라우저 라우터 임포트
import App from './App'; 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 🚩 프로젝트 전체에서 useNavigate 등의 라우팅 기능을 사용하기 위해 BrowserRouter로 감싸줍니다. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
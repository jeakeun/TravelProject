import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 🚩 추가
import App from './App'; 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // 🚩 조회수 중복 방지를 위해 StrictMode는 주석 유지
  // <React.StrictMode>
    <BrowserRouter> {/* 🚩 App을 BrowserRouter로 감싸야 라우팅 훅이 작동합니다 */}
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);
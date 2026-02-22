import React from "react";
import ReactDOM from 'react-dom/client';
import App from './App'; 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // 🚩 조회수가 2씩 오르는 현상을 해결하기 위해 StrictMode를 주석 처리합니다.
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
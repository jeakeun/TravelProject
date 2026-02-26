// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: 'http://3.37.160.108:8080', // localhost를 실제 IP로 변경!
  withCredentials: true, // ✅ refreshToken 쿠키 포함
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청마다 accessToken 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 401이면 refresh로 재발급 → 원래 요청 재시도
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // ✅ refresh/ logout 자체는 인터셉터로 재시도하지 않게 막기(무한루프 방지)
    const reqUrl = originalRequest?.url || "";
    if (reqUrl.includes("/auth/refresh") || reqUrl.includes("/auth/logout")) {
      return Promise.reject(error);
    }

    // 네가 만든 백엔드가 403을 주는 경우도 있어서 401/403 둘 다 처리하고 싶으면 여기 포함 가능
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      // refresh 중이면 큐에 대기 → 토큰 받으면 재시도
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch("http://localhost:8080/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          // refresh 실패 → 서버 쿠키 삭제 + 로컬 정리
          await fetch("http://localhost:8080/auth/logout", {
            method: "POST",
            credentials: "include",
          }).catch(() => {});

          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");

          processQueue(new Error("refresh failed"), null);
          return Promise.reject(error);
        }

        const data = await refreshRes.json(); // { member, accessToken }
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.member));

        processQueue(null, data.accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
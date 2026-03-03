import axios from "axios";

const api = axios.create({
  // 🚩 [수정] 빈 문자열로 설정하여 브라우저의 현재 도메인을 사용합니다.
  baseURL: '', 
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

    // 401/403 처리
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
        // 🚩 [수정] api.defaults.baseURL이 빈 값일 경우를 대비해 window.location.origin을 직접 사용합니다.
        // 이렇게 하면 현재 브라우저에 찍힌 http://3.37.160.108 주소를 그대로 가져옵니다.
        const host = window.location.origin;

        const refreshRes = await fetch(`${host}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          // refresh 실패 시 로그아웃 처리
          await fetch(`${host}/api/auth/logout`, {
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
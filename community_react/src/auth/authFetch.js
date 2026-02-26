export async function authFetch(url, options = {}) {
  // 🚩 [수정] 배포 서버 주소 설정
  const API_BASE_URL = "http://localhost:8080";

  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (res.status === 401) {
    // 🚩 [수정] localhost -> 배포 서버 IP로 변경
    const refresh = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refresh.ok) throw new Error("로그인 만료");

    const data = await refresh.json();
    localStorage.setItem("accessToken", data.accessToken);

    // 원래 요청 재시도
    return authFetch(url, options);
  }

  return res;
}
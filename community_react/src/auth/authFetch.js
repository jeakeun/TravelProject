export async function authFetch(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (res.status === 401) {
    const refresh = await fetch("/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!refresh.ok) throw new Error("로그인 만료");

    const data = await refresh.json();
    localStorage.setItem("accessToken", data.accessToken);

    return authFetch(url, options);
  }

  return res;
}

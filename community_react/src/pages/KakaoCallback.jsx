import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * [카카오 로그인] 카카오 동의 후 redirect 되는 URI.
 * URL의 code를 /auth/kakao에 전달 → JWT 수신 → localStorage 저장 → 메인으로 이동.
 */
function KakaoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("처리 중...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    // 카카오 로그인 취소/거부 시 error 파라미터로 리다이렉트됨
    if (errorParam) {
      setError("카카오 로그인이 취소되었거나 실패했습니다.");
      setStatus("");
      return;
    }

    if (!code) {
      setError("인증 코드를 받지 못했습니다.");
      setStatus("");
      return;
    }

    const fromSignup = sessionStorage.getItem("kakao_signup") === "true";

    const doAuth = async (signup) => {
      try {
        sessionStorage.removeItem("kakao_signup");
        const res = await fetch("/auth/kakao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code, signup }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(typeof data === "string" ? data : data?.message || "카카오 로그인에 실패했습니다.");
          setStatus("");
          return;
        }

        const member = data?.member ?? data;
        const accessToken = data?.accessToken;
        if (member && accessToken) {
          try {
            localStorage.setItem("user", JSON.stringify(member));
            localStorage.setItem("accessToken", accessToken);
          } catch (_) {}
          setStatus(signup ? "회원가입이 완료되었습니다. 메인으로 이동합니다..." : "로그인 성공! 메인으로 이동합니다...");
          window.location.href = "/";
          return;
        }

        setError("로그인 정보를 받지 못했습니다.");
        setStatus("");
      } catch (err) {
        setError("서버와 통신 중 오류가 발생했습니다.");
        setStatus("");
      }
    };

    doAuth(fromSignup);
  }, [searchParams]);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#c00", marginBottom: "1rem" }}>{error}</p>
        <button type="button" onClick={() => navigate("/", { replace: true })}>
          메인으로
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>{status}</p>
    </div>
  );
}

export default KakaoCallback;

package kr.hi.travel_community.security.jwt;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import kr.hi.travel_community.model.util.CustomUser;

@Component
public class JwtTokenProvider {
	// application.properties에 있는 secret을 가져와서 변환해서 사용
	private final Key key;
	private final long accessTokenValidity; // 토큰 유지 시간(ms)
	private final long refreshTokenValidity; // 리프레시 토큰 유지 시간(ms)

	public JwtTokenProvider(
			@Value("${jwt.secret}") String secret,
			@Value("${jwt.token-validity-in-seconds}") long accessSeconds,
			@Value("${jwt.refresh-token-validity-in-seconds}") long refreshSeconds
	) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessTokenValidity = accessSeconds * 1000;
		this.refreshTokenValidity = refreshSeconds * 1000;
	}

	// =========================
	// ✅ 기존 로직(유지)
	// =========================

	// Access Token
	public String createAccessToken(CustomUser user) {
		return createToken(user, accessTokenValidity, false);
	}

	// Refresh Token
	public String createRefreshToken(CustomUser user) {
		return createToken(user, refreshTokenValidity, true);
	}

	// 공통 토큰 생성 (CustomUser 기반)
	private String createToken(CustomUser user, long validity, boolean isRefresh) {
		long now = System.currentTimeMillis();
		Date expiry = new Date(now + validity);

		var builder = Jwts.builder()
				.setSubject(user.getUsername())
				.setIssuedAt(new Date(now))
				.setExpiration(expiry)
				.signWith(key, SignatureAlgorithm.HS256);

		if (isRefresh) {
			builder.claim("type", "refresh");
		} else {
			builder.claim("email", user.getMember().getMb_email());
			// 권한이 없을 수도 있으니 방어적으로
			String role = user.getAuthorities() == null || user.getAuthorities().isEmpty()
					? "ROLE_USER"
					: user.getAuthorities().iterator().next().getAuthority();
			builder.claim("role", role);
		}
		return builder.compact();
	}

	// =========================
	// ✅ 자동로그인(Controller에서 쓰는) 오버로드 추가
	// =========================

	/**
	 * ✅ Access Token (id 문자열로 발급)
	 * - /login, /auth/refresh에서 편하게 쓰기 위함
	 * - 기존 코드 영향 없음 (오버로드 추가)
	 */
	public String createAccessToken(String id) {
		return createTokenBySubject(id, accessTokenValidity, false);
	}

	/**
	 * ✅ Refresh Token (id 문자열로 발급)
	 */
	public String createRefreshToken(String id) {
		return createTokenBySubject(id, refreshTokenValidity, true);
	}

	/**
	 * ✅ 문자열 subject(id) 기반 토큰 생성
	 * - refresh는 type=refresh만 넣고
	 * - access는 최소 claim만 넣음(원하면 email/role도 추가 가능)
	 */
	private String createTokenBySubject(String subject, long validity, boolean isRefresh) {
		long now = System.currentTimeMillis();
		Date expiry = new Date(now + validity);

		var builder = Jwts.builder()
				.setSubject(subject)
				.setIssuedAt(new Date(now))
				.setExpiration(expiry)
				.signWith(key, SignatureAlgorithm.HS256);

		if (isRefresh) {
			builder.claim("type", "refresh");
		} else {
			// 필요한 claim만(최소)
			builder.claim("type", "access");
		}

		return builder.compact();
	}

	/**
	 * ✅ 쿠키에서 토큰 꺼내기 (refreshToken 읽을 때 사용)
	 */
	public String getTokenFromCookie(HttpServletRequest request, String cookieName) {
		if (request == null || request.getCookies() == null) return null;

		for (Cookie c : request.getCookies()) {
			if (cookieName.equals(c.getName())) {
				return c.getValue();
			}
		}
		return null;
	}

	// =========================
	// ✅ 토큰 파싱 & refresh 확인 (기존 유지)
	// =========================

	public Claims parseClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	public boolean isRefreshToken(String token) {
		return "refresh".equals(parseClaims(token).get("type"));
	}
}
package kr.hi.travel_community.security.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;

import kr.hi.travel_community.model.util.CustomUser;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenValidity;   // ms
    private final long refreshTokenValidity;  // ms

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
    // ✅ 기존 방식 (CustomUser)
    // =========================

    public String createAccessToken(CustomUser user) {
        return createToken(user, accessTokenValidity, false);
    }

    public String createRefreshToken(CustomUser user) {
        return createToken(user, refreshTokenValidity, true);
    }

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
            // ✅ 기존 로직 유지 (권한/이메일 claim)
            builder.claim("email", user.getMember().getMb_email());

            // 권한이 비어있을 가능성 방어 (기존 코드 영향 최소화)
            String role = user.getAuthorities() != null && !user.getAuthorities().isEmpty()
                    ? user.getAuthorities().iterator().next().getAuthority()
                    : "ROLE_USER";
            builder.claim("role", role);
        }

        return builder.compact();
    }

    // =========================================
    // ✅ 추가: 자동로그인/컨트롤러용 (String username)
    // =========================================

    public String createAccessToken(String username) {
        return createToken(username, accessTokenValidity, false);
    }

    public String createRefreshToken(String username) {
        return createToken(username, refreshTokenValidity, true);
    }

    // 공통 토큰 생성 (String 주체)
    private String createToken(String username, long validity, boolean isRefresh) {
        long now = System.currentTimeMillis();
        Date expiry = new Date(now + validity);

        var builder = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(now))
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256);

        if (isRefresh) {
            builder.claim("type", "refresh");
        }
        // accessToken이면 type 없음(또는 null) → JwtAuthenticationFilter 로직과 잘 맞음

        return builder.compact();
    }

    // =========================
    // 토큰 파싱 & 검증
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
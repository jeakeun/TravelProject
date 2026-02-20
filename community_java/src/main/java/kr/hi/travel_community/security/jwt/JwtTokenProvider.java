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
import kr.hi.travel_community.model.util.CustomUser;

@Component
public class JwtTokenProvider {
	//application.properties에 있는 secret을 가져와서 변환해서 사용
	private final Key key;
	private final long accessTokenValidity; //토큰 유지 시간(ms)
	private final long refreshTokenValidity; //리프레시 토큰 유지 시간(ms)

	public JwtTokenProvider(
			@Value("${jwt.secret}") String secret,
			@Value("${jwt.token-validity-in-seconds}") long accessSeconds,
			@Value("${jwt.refresh-token-validity-in-seconds}") long refreshSeconds
	) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessTokenValidity = accessSeconds * 1000;
		this.refreshTokenValidity = refreshSeconds * 1000;
	}

	// Access Token
	public String createAccessToken(CustomUser user) {
		return createToken(user, accessTokenValidity, false);
	}

	// Refresh Token
	public String createRefreshToken(CustomUser user) {
		return createToken(user, refreshTokenValidity, true);
	}

	// 공통 토큰 생성
	private String createToken(CustomUser user, long validity, boolean isRefresh) {
		//유지 시간을 이용하여 만료일을 계산
		long now = System.currentTimeMillis();
		Date expiry = new Date(now + validity);

		var builder = Jwts.builder()
				.setSubject(user.getUsername()) //토큰 소유자
				.setIssuedAt(new Date(now)) //토큰 발생시간
				.setExpiration(expiry) //토큰 만료시간
				.signWith(key, SignatureAlgorithm.HS256); //서명

		if (isRefresh) {
			builder.claim("type", "refresh");
		} else {
			builder.claim("email", user.getMember().getMb_email());
			builder.claim("role", user.getAuthorities().iterator().next().getAuthority());
		}
		return builder.compact();
	}

	// 토큰 파싱 & 검증
	public Claims parseClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	//토큰이 리프레쉬 토큰인지 알려줌
	public boolean isRefreshToken(String token) {
		return "refresh".equals(parseClaims(token).get("type"));
	}
}

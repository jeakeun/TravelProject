package kr.hi.travel_community.security.filter;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.security.jwt.JwtTokenProvider;
import kr.hi.travel_community.service.MemberDetailService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenProvider jwtTokenProvider;
	private final MemberDetailService userDetailsService;

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {
		//요청 headers에 Authorization을 추출
		String header = request.getHeader("Authorization");

		//Authorization가 없거나 유효한 토큰 정보가 아니면 인증확인을 안함
		if (header != null && header.startsWith("Bearer ")) {
			String token = header.substring(7);
			Claims claims = jwtTokenProvider.parseClaims(token);

			//토큰이 리프레쉬 토큰이면 인증 안함
			if ("refresh".equals(claims.get("type"))) {
				filterChain.doFilter(request, response);
				return;
			}

			String username = claims.getSubject();
			UserDetails userDetails =
					userDetailsService.loadUserByUsername(username);
			Authentication auth = new UsernamePasswordAuthenticationToken(
					userDetails, null, userDetails.getAuthorities()
			);
			SecurityContextHolder.getContext().setAuthentication(auth);
		}

		filterChain.doFilter(request, response);
	}
}
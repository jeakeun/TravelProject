package kr.hi.travel_community.security.filter;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.security.jwt.JwtTokenProvider;
import kr.hi.travel_community.service.MemberDetailService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberDetailService userDetailsService;

    // ✅ 추가: 인증 없이 접근해야 하는 경로는 JWT 필터 자체를 타지 않게 제외
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        // 개발/테스트에서 OPTIONS 프리플라이트는 그냥 통과시키는 게 안전
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        return path.startsWith("/auth/")
            || path.startsWith("/api/auth/")
            || path.equals("/login")
            || path.equals("/signup")
            || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 요청 headers에 Authorization을 추출
        String header = request.getHeader("Authorization");

        // Authorization가 없거나 유효한 토큰 정보가 아니면 인증확인을 안함
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            Claims claims = jwtTokenProvider.parseClaims(token);

            // 토큰이 리프레쉬 토큰이면 인증 안함
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
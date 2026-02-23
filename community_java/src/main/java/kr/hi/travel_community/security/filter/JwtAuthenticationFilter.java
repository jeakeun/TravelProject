package kr.hi.travel_community.security.filter;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
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

    // ✅ 인증 없이 접근해야 하는 경로는 JWT 필터 자체를 타지 않게 제외
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // ✅ OPTIONS 프리플라이트는 무조건 통과
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String servletPath = request.getServletPath(); // 보통 여기로 충분
        String uri = request.getRequestURI();          // 혹시 모를 케이스 대비

        return isPublicPath(servletPath) || isPublicPath(uri);
    }

    private boolean isPublicPath(String path) {
        if (path == null) return false;

        if (path.equals("/login") || path.equals("/signup") || path.equals("/error")) return true;
        if (path.startsWith("/api/auth/")) return true;

        // ✅ 인증 없이 접근하는 auth 경로만 제외 (update-email, change-password는 JWT 필요)
        return "/auth/refresh".equals(path)
            || "/auth/logout".equals(path)
            || "/auth/verify-user".equals(path)
            || "/auth/reset-password".equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // ✅ 이미 인증된 요청이면 패스 (중복 세팅 방지)
        Authentication existing = SecurityContextHolder.getContext().getAuthentication();
        if (existing != null && existing.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        // Authorization가 없거나 Bearer 형식이 아니면 그냥 통과
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            Claims claims = jwtTokenProvider.parseClaims(token);

            // ✅ refresh 토큰이면 인증 세팅 안 함 (그냥 통과)
            Object type = claims.get("type");
            if (type != null && "refresh".equals(type.toString())) {
                filterChain.doFilter(request, response);
                return;
            }

            String username = claims.getSubject();
            if (username == null || username.trim().isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // ✅ 네 MemberDetailService가 null 리턴 가능해서 방어
            if (userDetails == null) {
                filterChain.doFilter(request, response);
                return;
            }

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (ExpiredJwtException e) {
            // ✅ 만료 토큰: 인증 없이 통과 (프론트에서 /auth/refresh로 재발급 받게)
        } catch (JwtException | IllegalArgumentException e) {
            // ✅ 위변조/형식 오류: 인증 없이 통과
        } catch (Exception e) {
            // ✅ 예상 못한 오류도 인증 없이 통과 (서버 500 방지)
        }

        filterChain.doFilter(request, response);
    }
}
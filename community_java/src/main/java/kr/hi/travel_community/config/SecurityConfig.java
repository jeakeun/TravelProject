package kr.hi.travel_community.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import kr.hi.travel_community.security.filter.JwtAuthenticationFilter;
import kr.hi.travel_community.security.jwt.JwtTokenProvider;
import kr.hi.travel_community.service.MemberDetailService;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberDetailService memberDetailService;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // 1. 로그인, 회원가입, 토큰 갱신 등 인증 관련 경로 허용 (401 에러 해결 핵심)
                .requestMatchers("/auth/**").permitAll()
                
                // 2. 리액트 정적 리소스 및 기본 경로 허용
                .requestMatchers("/", "/index.html", "/static/**", "/favicon.ico", "/manifest.json", "/logo*.png").permitAll()
                
                // 3. 지도 API 및 모든 API, 이미지 경로 허용
                .requestMatchers("/api/**", "/pic/**").permitAll()
                
                // 4. 리액트 라우터의 모든 페이지 경로 허용 (새로고침 시 403/404 방지)
                .requestMatchers("/login", "/signup", "/community/**", "/news/**", "/domestic/**", "/foreigncountry/**", "/cscenter/**", "/mypage", "/admin", "/inquiry").permitAll()
                
                // 나머지 모든 요청 허용 (permitAll을 마지막에 배치)
                .anyRequest().permitAll()
            )
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtTokenProvider, memberDetailService),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 🚩 [수정됨] 배포 서버 IP와 로컬 호스트를 모두 허용 리스트에 추가했습니다.
        configuration.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://3.37.160.108"
        )); 
        
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        
        // 쿠키 및 인증 헤더 허용 (axios.withCredentials 대응)
        configuration.setAllowCredentials(true);
        
        // 브라우저에서 읽을 수 있도록 허용할 헤더 추가
        configuration.setExposedHeaders(List.of("Set-Cookie", "Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
package kr.hi.travel_community.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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
             
                // 1. 리액트 정적 리소스 허용 (JS, CSS, 이미지 등)
                .requestMatchers("/", "/index.html", "/static/**", "/favicon.ico", "/manifest.json", "/logo*.png").permitAll()
                
                // 2. 백엔드 API 및 이미지 경로 허용
                .requestMatchers("/api/**", "/pic/**").permitAll()
                
                // 3. 리액트 라우터 경로 허용 (새로고침 시 403 방지)
                .requestMatchers("/login", "/signup", "/community/**", "/news/**",
                        "/domestic", "/foreigncountry", "/").permitAll()
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
        
        // 🚩 [수정] 배포 환경의 IP 주소를 허용 리스트에 추가합니다.
        configuration.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://3.37.160.108" // 배포된 서버의 프론트엔드 접속 주소
        )); 
        
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
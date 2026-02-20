package kr.hi.travel_community.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            // 모든 API 요청과 정적 이미지 경로를 무조건 허용하도록 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**", "/pic/**", "/static/**", "/favicon.ico").permitAll()
                .anyRequest().permitAll() // 테스트를 위해 우선 모든 요청을 허용 (작동 확인 후 조정 가능)
            )
            .cors(cors -> {}); // WebConfig의 CORS 설정을 따름
        
        return http.build();
    }
}
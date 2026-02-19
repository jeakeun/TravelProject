package kr.hi.travel_community.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 1. [이미지 경로 설정] 기존 설정 유지
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프로젝트 내부의 static/pic 폴더를 /pic/** 주소로 매핑
        String path = "file:///" + System.getProperty("user.dir") + "/src/main/resources/static/pic/";
        registry.addResourceHandler("/pic/**")
                .addResourceLocations(path);
    }

    // 2. [CORS 설정] 리액트 접속 허용 기존 설정 유지
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
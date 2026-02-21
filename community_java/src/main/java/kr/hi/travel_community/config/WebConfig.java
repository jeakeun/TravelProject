package kr.hi.travel_community.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프로젝트 루트 경로 획득
        String rootPath = System.getProperty("user.dir");
        
        // 🚩 경로 끝에 반드시 슬래시(/)가 포함되도록 처리 (운영체제 호환성)
        String uploadDir = rootPath + File.separator + "uploads" + File.separator + "pic" + File.separator;
        
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 🚩 file: 프로토콜 뒤에 절대 경로를 명확히 매핑
        registry.addResourceHandler("/pic/**")
                .addResourceLocations("file:" + uploadDir)
                .setCachePeriod(0); // 개발 단계에서 캐시로 인한 이미지 안 보임 방지
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
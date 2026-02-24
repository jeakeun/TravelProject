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
        // uploads/pic 폴더를 /pic/** 으로 서빙 (user.dir 기준, 이식성 확보)
        String uploadPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "pic" + File.separator;
        
        File directory = new File(uploadPath);
        
        // 디렉토리가 없을 경우 자동으로 생성
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String resourceLocation = "file:///" + uploadPath.replace("\\", "/");

        // /pic/** 로 들어오는 모든 요청을 실제 물리적 폴더(uploads/pic)와 매핑
        registry.addResourceHandler("/pic/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(0); // 개발 환경에서 이미지 수정 시 즉시 반영을 위해 캐시 해제
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 리액트(3000포트)와의 통신을 위한 CORS 설정
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
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
        // 1. 사용자님이 지정하신 절대 경로를 기준으로 설정합니다.
        // 역슬래시(\)를 슬래시(/)로 통일하여 경로 인식을 최적화합니다.
        String uploadPath = "C:/Users/mintpark/Documents/work/travel/TravelProject/community_java/uploads/pic/";
        
        File directory = new File(uploadPath);
        
        // 디렉토리가 없을 경우 자동으로 생성
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            System.out.println("디렉토리 생성 여부: " + created);
        }

        // 2. 리소스 로케이션 형식에 맞게 "file:///" 접두사를 붙여 절대 경로를 완성합니다.
        // Windows의 경우 file:///C:/... 형식이 가장 안정적입니다.
        String resourceLocation = "file:///" + uploadPath;

        // 🚩 /pic/** 요청을 물리적 폴더로 연결
        registry.addResourceHandler("/pic/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(0); // 개발 중 이미지 즉시 반영을 위해 캐시 해제
                
        // 이클립스 콘솔에서 실제 경로 확인용 로그
        System.out.println("--- 이미지 서버 경로 설정 완료 ---");
        System.out.println("브라우저 요청 경로: http://localhost:8080/pic/파일명.jpg");
        System.out.println("물리적 매핑 경로: " + resourceLocation);
        System.out.println("--------------------------------");
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
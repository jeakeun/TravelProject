package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 🚩 [수정] 서비스 클래스에서 사용하는 경로와 일치하도록 기본값 수정
    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. 운영체제에 상관없이 경로 구분자를 슬래시(/)로 통일
        String path = uploadDir.replace("\\", "/");
        
        File directory = new File(uploadPath);
        
        // 디렉토리가 없을 경우 자동으로 생성
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            System.out.println("디렉토리 생성 여부: " + created);
        }

        // 3. 서버 시작 시 해당 폴더가 없으면 자동 생성
        File directory = new File(path);
        if (!directory.exists()) {
            if (directory.mkdirs()) {
                System.out.println("🚩 업로드 디렉토리가 생성되었습니다: " + path);
            }
        }

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
        // 리액트 및 외부 접속 허용 설정
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://*:3000" // 다른 PC의 브라우저 접속 허용
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
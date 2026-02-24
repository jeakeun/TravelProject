package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. 경로 구분자 통일 및 끝에 슬래시 확인
        String path = uploadDir.replace("\\", "/");
        if (!path.endsWith("/")) {
            path += "/";
        }
        
        // 2. 물리적 경로 설정을 위한 resourceLocation 정의 (file: 프로토콜 필수)
        String resourceLocation = "file:///" + path;
        
        // 3. 디렉토리 존재 여부 확인 및 생성 (기존 중복 코드 정리)
        File directory = new File(path);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            System.out.println("🚩 업로드 디렉토리 생성 여부: " + created + " (경로: " + path + ")");
        }

        // 4. /pic/** 요청을 실제 물리적 폴더로 연결
        registry.addResourceHandler("/pic/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(0); // 개발 중 이미지 즉시 반영을 위해 캐시 해제
                
        // 이클립스 콘솔 로그
        System.out.println("--- 이미지 서버 경로 설정 완료 ---");
        System.out.println("브라우저 요청 경로: http://localhost:8080/pic/파일명.jpg");
        System.out.println("물리적 매핑 경로: " + resourceLocation);
        System.out.println("--------------------------------");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://*:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
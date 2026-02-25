package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 1. 기존 업로드 경로 설정 유지
    @Value("${file.upload-dir:/home/uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 경로 정규화 로직 유지
        String path = uploadDir.replace("\\", "/");
        if (!path.endsWith("/")) {
            path += "/";
        }

        // 폴더 생성 로직 유지
        File directory = new File(path);
        if (!directory.exists()) {
            if (directory.mkdirs()) {
                System.out.println("🚩 [System] 업로드 디렉토리가 생성되었습니다: " + path);
            }
        }

        // 리눅스/윈도우 호환 경로 설정 유지
        String location = path.startsWith("/") ? "file:" + path : "file:///" + path;

        // ✅ 1. 외부 이미지 저장 폴더 매핑 (게시판 사진 보기)
        registry.addResourceHandler("/pic/**")
                .addResourceLocations(location)
                .setCachePeriod(3600); 

        // ✅ 2. 정적 리소스 및 리액트 빌드 파일 매핑
        // 기존 /static/ 외에 루트 경로의 자원들을 명확히 매핑하여 
        // 상세페이지 새로고침 시 발생하는 경로 인식 오류를 방지합니다.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0);

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/static/")
                .setCachePeriod(0);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 기존 CORS 허용 패턴 유지
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://3.37.160.108",
                    "http://3.37.160.108:*",
                    "https://3.37.160.108"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties에서 설정값을 읽어오되, 없으면 기본값 사용
    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. 경로 정규화 (기존 기능 유지)
        String path = uploadDir.replace("\\", "/");
        
        if (!path.endsWith("/")) {
            path += "/";
        }

        // 2. 업로드 디렉토리 생성 로직 (기존 기능 유지)
        File directory = new File(path);
        if (!directory.exists()) {
            if (directory.mkdirs()) {
                System.out.println("🚩 [System] 업로드 디렉토리가 생성되었습니다: " + path);
            }
        }

        // 3. 리눅스/윈도우 호환 경로 설정
        String location = path.startsWith("/") ? "file:" + path : "file:///" + path;

        // 🚩 외부 저장 폴더 매핑 (게시판 이미지 보기 기능)
        registry.addResourceHandler("/pic/**")
                .addResourceLocations(location)
                .setCachePeriod(3600); 

        // 🚩 [수정] 500 에러 해결을 위해 정적 리소스 핸들러를 가장 표준적인 방식으로 설정
        // 이 설정이 static 폴더 안의 index.html, favicon, js, css를 안전하게 연결합니다.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 리액트 및 실제 서버 IP 주소에서의 API 요청 허용 (인증/로그인 기능 유지)
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
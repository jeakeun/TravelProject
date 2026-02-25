package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 1. 기존 업로드 경로 설정 유지 (application.properties 값을 우선함)
    @Value("${file.upload-dir:/home/uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 경로 정규화 로직 유지
        String path = uploadDir.replace("\\", "/");
        if (!path.endsWith("/")) {
            path += "/";
        }

        // 폴더 생성 로직 유지 (서버 실행 시 폴더 없으면 생성)
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

        // ✅ 2. 리액트 정적 파일 설정
        // 자바 코드에서 /** 를 직접 매핑하면 500 에러 충돌이 날 수 있으므로,
        // 스프링 부트의 기본 정적 리소스 경로를 명확히 선언만 해줍니다.
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/static/")
                .setCachePeriod(0);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 기존 CORS 허용 패턴 유지 (백엔드 API 보안 설정)
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
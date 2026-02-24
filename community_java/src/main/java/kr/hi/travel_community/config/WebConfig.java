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
        
        // 2. 경로 끝에 슬래시가 없다면 추가
        if (!path.endsWith("/")) {
            path += "/";
        }

        // 3. 서버 시작 시 해당 폴더가 없으면 자동 생성
        File directory = new File(path);
        if (!directory.exists()) {
            if (directory.mkdirs()) {
                System.out.println("🚩 업로드 디렉토리가 생성되었습니다: " + path);
            }
        }

        // 🚩 /pic/** 요청을 물리적 외부 폴더와 연결
        // file:/// 접두사 뒤에 정제된 path를 붙여 안정성 확보
        registry.addResourceHandler("/pic/**")
                .addResourceLocations("file:///" + path)
                .setCachePeriod(3600); // 운영 환경을 고려해 약간의 캐시 허용 (개발 시엔 0 권장)
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
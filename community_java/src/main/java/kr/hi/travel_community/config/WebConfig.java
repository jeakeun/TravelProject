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
        /**
         * 🚩 [중요] 실시간 이미지 반영을 위한 설정
         * src/main/resources 대신 프로젝트 루트의 외부 폴더(uploads)를 사용합니다.
         * 이렇게 해야 유저가 올린 사진이 서버 재시작 없이 즉시 브라우저에 표시됩니다.
         */
        String rootPath = System.getProperty("user.dir");
        String uploadDir = rootPath + File.separator + "uploads" + File.separator + "pic" + File.separator;
        
        // 업로드 폴더가 없을 경우 자동 생성
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // http://localhost:8080/pic/파일명.jpg 로 접근 시 실제 파일 경로와 매칭
        registry.addResourceHandler("/pic/**")
                .addResourceLocations("file:" + uploadDir);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 리액트(3000포트)와의 데이터 통신을 위한 CORS 설정
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
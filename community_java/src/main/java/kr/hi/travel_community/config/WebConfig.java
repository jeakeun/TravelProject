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
        // 🚩 프로젝트 루트 경로를 자동으로 가져와서 절대 경로 생성
        String rootPath = System.getProperty("user.dir");
        
        // OS 환경에 상관없이 경로가 올바르게 인식되도록 설정 (마지막에 반드시 슬래시 포함)
        String uploadPath = rootPath + File.separator + "uploads" + File.separator + "pic" + File.separator;
        
        File directory = new File(uploadPath);
        
        // 디렉토리가 없을 경우 자동으로 생성
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 🚩 Spring 리소스 핸들러에서 인식할 수 있는 파일 경로 형식으로 변환
        // 윈도우의 경우 file:///C:/... 형식이 되어야 하므로 절대 경로 앞에 프로토콜 추가
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
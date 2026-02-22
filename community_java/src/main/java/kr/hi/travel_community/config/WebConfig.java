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
        // 1. 프로젝트 루트 경로 및 업로드 디렉토리 설정
        String rootPath = System.getProperty("user.dir");
        String uploadPath = rootPath + File.separator + "uploads" + File.separator + "pic" + File.separator;
        
        File directory = new File(uploadPath);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 2. 경로 변환 (Windows 환경 등에서 발생할 수 있는 경로 인식 오류 방지)
        // absolutePath를 가져오고, file: 프로토콜 사용 시 끝에 반드시 /를 붙여야 폴더로 인식함
        String absolutePath = directory.getAbsolutePath();
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath += File.separator;
        }

        // 🚩 /pic/** 요청을 실제 물리적 경로로 매핑
        registry.addResourceHandler("/pic/**")
                .addResourceLocations("file:///" + absolutePath) // 슬래시 3개(///)는 로컬 절대경로의 표준 표기법
                .setCachePeriod(0);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 기존 CORS 설정 유지
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
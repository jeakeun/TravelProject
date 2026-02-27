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
    @Value("${file.upload-dir:/home/uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. 경로 정규화 (역슬래시를 슬래시로 변경)
        String path = uploadDir.replace("\\", "/");
        
        // 2. 경로 끝에 슬래시가 누락되었다면 추가
        if (!path.endsWith("/")) {
            path += "/";
        }

        // 3. 서버 실행 시 업로드 폴더가 물리적으로 존재하는지 확인 및 생성
        File directory = new File(path);
        if (!directory.exists()) {
            if (directory.mkdirs()) {
                System.out.println("🚩 [System] 업로드 디렉토리가 생성되었습니다: " + path);
            }
        }

        // 🚩 [핵심 수정] 리눅스 환경(/home/uploads/)에 최적화된 경로 생성
        // 리눅스는 'file:' 뒤에 바로 절대경로(/)가 붙어야 하므로 file:/home/uploads/ 형식이 됩니다.
        String location = path.startsWith("/") ? "file:" + path : "file:///" + path;

        registry.addResourceHandler("/pic/**")
                .addResourceLocations(location)
                .setCachePeriod(3600); 

        System.out.println("✅ [Mapping] /pic/** URL -> " + location);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 리액트 및 실제 서버 IP 주소에서의 API 요청 허용
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://3.37.160.108",    
                    "http://3.37.160.108:*"   
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); 
    }
}
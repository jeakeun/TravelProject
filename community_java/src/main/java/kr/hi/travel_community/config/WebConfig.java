package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties에서 설정값을 읽어오되, 없으면 기본값 사용
    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadDir;

    // 🚩 [추가] 500 에러 방지 및 루트 경로(/) 접속 시 index.html 강제 연결
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 루트 접속 시 index.html로 연결
        registry.addViewController("/").setViewName("forward:/index.html");
        // 리액트 라우터 경로(새로고침 시 500 에러 방지)
        registry.addViewController("/{path:[[^\\.] ]*}").setViewName("forward:/index.html");
        registry.addViewController("/**/{path:[[^\\.] ]*}").setViewName("forward:/index.html");
    }

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

        // 🚩 리눅스/배포 환경 호환성을 위해 프로토콜 식별자 최적화
        String location = path.startsWith("/") ? "file:" + path : "file:///" + path;

        // 리액트에서 <img src="http://IP:8080/pic/파일명.jpg"> 로 접근 가능하게 매핑
        registry.addResourceHandler("/pic/**")
                .addResourceLocations(location)
                .setCachePeriod(3600); 

        // 🚩 [추가] 정적 리소스 서빙 보장 (src/main/resources/static 내부 파일들)
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 리액트 및 실제 서버 IP 주소에서의 API 요청 허용
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://3.37.160.108",    // 프론트엔드가 동작하는 실제 서버 IP
                    "http://3.37.160.108:*",  // 모든 포트 허용
                    "https://3.37.160.108"    // SSL 적용 대비
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
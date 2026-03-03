package kr.hi.travel_community.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties에서 설정값을 읽어오되, 없으면 기본값 사용
    @Value("${file.upload-dir:/home/uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. 업로드된 이미지(pic) 처리
        String path = uploadDir.replace("\\", "/");
        if (!path.endsWith("/")) {
            path += "/";
        }

        File directory = new File(path);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 🚩 리눅스 환경(/home/uploads/)에 최적화된 경로 생성
        String location = path.startsWith("/") ? "file:" + path : "file:///" + path;

        registry.addResourceHandler("/pic/**")
                .addResourceLocations(location)
                .setCachePeriod(3600); 

        // 2. [추가] 리액트 정적 파일 및 새로고침 대응 (SPA 라우팅)
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        // 존재하는 리소스거나 파일 확장자가 있는 경우는 그대로 반환
                        return (requestedResource.exists() && requestedResource.isReadable()) ? requestedResource
                                : new ClassPathResource("/static/index.html"); // 그 외엔 index.html로 리다이렉트
                    }
                });

        System.out.println("✅ [Mapping] /pic/** URL -> " + location);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://3.37.160.108",    
                    "http://3.37.160.108:*"   
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Set-Cookie")
                .allowCredentials(true)
                .maxAge(3600); 
    }
}
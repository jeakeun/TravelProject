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

    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
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

        String location = path.startsWith("/") ? "file:" + path : "file:/" + path;

        registry.addResourceHandler("/pic/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);

        // 2. 리액트 정적 파일 및 SPA 경로 설정 (핵심 수정)
        // index.html이 resources 바로 아래에 있으므로 classpath:/ 를 추가하고
        // ClassPathResource의 경로에서 static/을 제거했습니다.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/", "classpath:/")
                .setCachePeriod(0)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        
                        // 요청한 리소스가 존재하면 해당 리소스 반환
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // 요청한 리소스가 없으면 resources 바로 아래의 index.html 반환 (static/ 제거됨)
                        return new ClassPathResource("index.html");
                    }
                });
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:3000", 
                    "http://127.0.0.1:3000",
                    "http://localhost:8080",
                    "http://3.37.160.108*"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Set-Cookie")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
package kr.hi.map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
@Controller // 여기서 직접 컨트롤러 역할 수행
public class MapApplication {

    public static void main(String[] args) {
        SpringApplication.run(MapApplication.class, args);
    }

    @GetMapping("/")
    public String index() {
        // src/main/resources/templates/map.html 파일이 반드시 있어야 합니다.
        return "map"; 
    }
}
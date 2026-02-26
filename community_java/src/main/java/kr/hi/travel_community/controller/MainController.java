package kr.hi.travel_community.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
    
    @GetMapping("/")
    public String main() {
        // "index"라고만 하면 템플릿 파일을 찾지만, 
        // "forward:/index.html"은 static 폴더의 리액트 빌드 파일을 직접 보여줍니다.
        return "forward:/index.html";
    }
}
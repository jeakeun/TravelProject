package kr.hi.travel_community.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    // 리액트에서 사용하는 주요 경로들을 등록합니다.
    // "index"가 아니라 "forward:/index.html"을 리턴해야 static 폴더의 파일을 읽습니다.
    @GetMapping({"/", "/login", "/signup", "/community/**"})
    public String index() {
        // 🚩 중요: forward:/ 를 붙여야 templates가 아닌 static 폴더의 index.html로 갑니다.
        return "forward:/index.html";
    }
}
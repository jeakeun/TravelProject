package kr.hi.travel_community.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
    @GetMapping({"/", "/login", "/signup", "/community/**"})
    public String index() {
        return "index"; // resources/templates/index.html 을 찾음
    }
}
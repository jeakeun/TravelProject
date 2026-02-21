package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.service.RecommendPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class RecommendController {

    private final RecommendPostService recommendPostService;

    @GetMapping("/posts")
    public List<Map<String, Object>> getPosts() {
        return recommendPostService.getAllPosts();
    }

    @GetMapping("/posts/{id}")
    public Optional<Post> getPostDetail(@PathVariable Integer id,
                                        @RequestParam Integer memberId) {
        return recommendPostService.getPostDetail(id, memberId);
    }
}
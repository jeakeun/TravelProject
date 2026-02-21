package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.Post;
import kr.hi.travel_community.service.RecommendPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/recommend")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class RecommendController {

    private final RecommendPostService recommendPostService;

    public RecommendController(RecommendPostService recommendPostService) {
        this.recommendPostService = recommendPostService;
    }

    // 🚩 기존 유지: 상단 랭킹용 (TOP 10)
    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getAllPosts() {
        return ResponseEntity.ok(recommendPostService.getAllPosts());
    }

    // 🚩 기존 유지: 하단 전체 리스트용
    @GetMapping("/posts/all")
    public ResponseEntity<List<Map<String, Object>>> getRealAllPosts() {
        return ResponseEntity.ok(recommendPostService.getRealAllPosts()); 
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPostDetail(@PathVariable("id") Integer id) {
        Integer currentUserNum = 1; 
        Map<String, Object> postData = recommendPostService.getPostDetailWithImage(id, currentUserNum);
        return postData != null ? ResponseEntity.ok(postData) : ResponseEntity.notFound().build();
    }

    @PostMapping("/posts/{id}/view")
    public ResponseEntity<?> increaseView(@PathVariable("id") Integer id) {
        recommendPostService.increaseViewCount(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            @RequestParam("poTitle") String poTitle,
            @RequestParam("poContent") String poContent,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            Post post = new Post();
            post.setPoTitle(poTitle);
            post.setPoContent(poContent);
            post.setPoCgNum(1); 
            recommendPostService.savePost(post, images);
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // 🚩 [핵심 추가] 게시글 수정 (405 에러 해결)
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable("id") Integer id,
            @RequestParam("poTitle") String poTitle,
            @RequestParam("poContent") String poContent,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            // 서비스에 해당 게시글 업데이트 로직이 구현되어 있어야 합니다.
            // 없으면 post를 불러와서 set하고 다시 save하는 로직이 필요합니다.
            recommendPostService.updatePost(id, poTitle, poContent, images);
            return ResponseEntity.ok("Updated Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // 🚩 [핵심 추가] 게시글 삭제
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable("id") Integer id) {
        try {
            recommendPostService.deletePost(id); // 서비스에 deletePost(id)가 구현되어야 함
            return ResponseEntity.ok("Deleted Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = recommendPostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    @PostMapping("/posts/{id}/report")
    public ResponseEntity<?> reportPost(@PathVariable("id") Integer id, @RequestBody Map<String, String> reportData) {
        recommendPostService.reportPost(id);
        return ResponseEntity.ok("Reported");
    }
}
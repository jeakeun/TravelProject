package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.RecommendPost;
import kr.hi.travel_community.service.RecommendPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/recommend")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendPostService recommendPostService;

    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getAllPosts() {
        return ResponseEntity.ok(recommendPostService.getAllPosts());
    }

    /**
     * 🚩 전체 게시글 조회 (검색 기능 포함)
     * 리액트에서 보낸 type(카테고리)과 keyword(검색어)를 받습니다.
     */
    @GetMapping("/posts/all")
    public ResponseEntity<List<Map<String, Object>>> getRealAllPosts(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        
        // 검색어가 파라미터로 넘어왔을 경우 (검색 로직 실행)
        if (type != null && keyword != null && !keyword.trim().isEmpty()) {
            System.out.println("검색 요청 실행 -> 타입: " + type + ", 키워드: " + keyword);
            return ResponseEntity.ok(recommendPostService.searchPosts(type, keyword));
        }
        
        // 검색어가 없을 경우 기존처럼 전체 목록 반환
        return ResponseEntity.ok(recommendPostService.getRealAllPosts()); 
    }

    /**
     * 🚩 상세 페이지 조회 및 조회수 처리
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPostDetail(
            @PathVariable(value = "id") Integer id, 
            @RequestParam(value = "mbNum", required = false) Integer mbNum,
            HttpServletRequest request, 
            HttpServletResponse response) {
        
        // 🚩 서비스에서 쿠키를 검사하여 중복 증가를 방지합니다.
        recommendPostService.increaseViewCount(id, request, response);
        
        Integer currentUserNum = (mbNum != null) ? mbNum : 1; 
        String currentUserRole = "ADMIN"; 

        Map<String, Object> postData = recommendPostService.getPostDetailWithImage(id, currentUserNum);
        
        if (postData != null) {
            boolean isOwner = postData.get("poMbNum").equals(currentUserNum);
            boolean isAdmin = "ADMIN".equals(currentUserRole);
            
            postData.put("isOwner", isOwner);
            postData.put("isAdmin", isAdmin);
        }
        
        return postData != null ? ResponseEntity.ok(postData) : ResponseEntity.notFound().build();
    }

    // 서비스에서 자동으로 처리하므로 프론트에서 개별 호출하지 않도록 주의
    @PostMapping("/posts/{id}/view")
    public ResponseEntity<?> increaseView(@PathVariable(value = "id") Integer id) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(
            @RequestParam(value = "poTitle") String poTitle,
            @RequestParam(value = "poContent") String poContent,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            RecommendPost post = new RecommendPost();
            post.setPoTitle(poTitle);
            post.setPoContent(poContent);
            recommendPostService.savePost(post, images);
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable(value = "id") Integer id,
            @RequestParam(value = "poTitle") String poTitle,
            @RequestParam(value = "poContent") String poContent,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        try {
            recommendPostService.updatePost(id, poTitle, poContent, images);
            return ResponseEntity.ok("Updated Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable(value = "id") Integer id) {
        try {
            recommendPostService.deletePost(id);
            return ResponseEntity.ok("Deleted Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable(value = "id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = recommendPostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    @PostMapping("/posts/{id}/report")
    public ResponseEntity<?> reportPost(@PathVariable(value = "id") Integer id) {
        recommendPostService.reportPost(id);
        return ResponseEntity.ok("Reported");
    }
}
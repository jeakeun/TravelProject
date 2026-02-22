package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.ReviewPost;
import kr.hi.travel_community.service.ReviewPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/reviewboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class ReviewBoardController {

    private final ReviewPostService reviewPostService;

    /**
     * 🚩 검색 기능 통합
     * 파라미터가 없으면 전체 목록을, type과 keyword가 있으면 검색 목록을 반환합니다.
     */
    @GetMapping("/posts")
    public List<Map<String, Object>> getList(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        
        // 검색 조건이 넘어온 경우 검색 서비스 호출
        if (type != null && keyword != null && !keyword.trim().isEmpty()) {
            return reviewPostService.searchPosts(type, keyword);
        }
        
        // 기본 상태: 전체 목록 반환
        return reviewPostService.getRealAllPosts();
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        reviewPostService.increaseViewCount(id, request, response);
        
        Integer currentUserNum = (mbNum != null) ? mbNum : 1;
        Map<String, Object> postData = reviewPostService.getPostDetailWithImage(id, currentUserNum);
        
        return postData != null 
                ? ResponseEntity.ok(postData) 
                : ResponseEntity.status(404).body(Map.of("error", "게시글 없음"));
    }

    @PostMapping("/posts")
    public ResponseEntity<?> create(@RequestParam("title") String title,
                                    @RequestParam("content") String content,
                                    @RequestParam("mbNum") Integer mbNum,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            ReviewPost post = new ReviewPost();
            post.setPoTitle(title);
            post.setPoContent(content);
            post.setPoMbNum(mbNum);
            
            List<MultipartFile> images = (image != null) ? List.of(image) : Collections.emptyList();
            reviewPostService.savePost(post, images);
            
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "등록 실패: " + e.getMessage()));
        }
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Integer id,
                                    @RequestParam("title") String title,
                                    @RequestParam("content") String content,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            List<MultipartFile> images = (image != null) ? List.of(image) : null;
            reviewPostService.updatePost(id, title, content, images);
            return ResponseEntity.ok("Updated Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "수정 실패"));
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
        try {
            reviewPostService.deletePost(id);
            return ResponseEntity.ok("Deleted Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "삭제 실패"));
        }
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = reviewPostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }
}
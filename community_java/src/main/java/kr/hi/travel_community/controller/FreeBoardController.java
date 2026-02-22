package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.FreePost;
import kr.hi.travel_community.service.FreePostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/freeboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class FreeBoardController {

    private final FreePostService freePostService;

    // 🚩 게시글 리스트 조회
    @GetMapping("/posts")
    public List<Map<String, Object>> getList() {
        return freePostService.getRealAllPosts();
    }

    // 🚩 게시글 상세 조회
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        
        // ✅ 조회수 증가 (쿠키 방어 로직을 위해 request와 response를 반드시 전달)
        freePostService.increaseViewCount(id, request, response);
        
        // 상세 데이터 조회 (좋아요 상태 확인을 위해 mbNum 전달)
        Integer currentUserNum = (mbNum != null) ? mbNum : 1;
        Map<String, Object> postData = freePostService.getPostDetailWithImage(id, currentUserNum);
        
        return postData != null 
                ? ResponseEntity.ok(postData) 
                : ResponseEntity.status(404).body(Map.of("error", "게시글 없음"));
    }

    // 🚩 게시글 등록
    @PostMapping("/posts")
    public ResponseEntity<?> create(@RequestParam("title") String title,
                                    @RequestParam("content") String content,
                                    @RequestParam("mbNum") Integer mbNum,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            FreePost post = new FreePost();
            post.setPoTitle(title);
            post.setPoContent(content);
            post.setPoMbNum(mbNum); // 작성자 번호 설정
            
            List<MultipartFile> images = (image != null) ? List.of(image) : Collections.emptyList();
            freePostService.savePost(post, images);
            
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "등록 실패: " + e.getMessage()));
        }
    }

    // 🚩 게시글 수정
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Integer id,
                                    @RequestParam("title") String title,
                                    @RequestParam("content") String content,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            List<MultipartFile> images = (image != null) ? List.of(image) : null;
            freePostService.updatePost(id, title, content, images);
            return ResponseEntity.ok("Updated Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "수정 실패"));
        }
    }

    // 🚩 게시글 삭제
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
        try {
            freePostService.deletePost(id);
            return ResponseEntity.ok("Deleted Success");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "삭제 실패"));
        }
    }

    // 🚩 추천(좋아요) 기능
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = freePostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }
}
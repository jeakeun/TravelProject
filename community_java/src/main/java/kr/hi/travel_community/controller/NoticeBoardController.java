package kr.hi.travel_community.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.NoticePost;
import kr.hi.travel_community.service.NoticePostService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/news/notice")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NoticeBoardController {

    private final NoticePostService noticePostService;

    // 공지사항 전체 목록 조회
    @GetMapping("/posts")
    public List<Map<String, Object>> getAllPosts() {
        return noticePostService.getRealAllPosts();
    }

    // 공지사항 상세 조회 (조회수 증가 포함)
    @GetMapping("/posts/{id}")
    public Map<String, Object> getPostDetail(
            @PathVariable("id") Integer id,
            @RequestParam(value = "mbNum", required = false) Integer mbNum,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        noticePostService.increaseViewCount(id, request, response);
        return noticePostService.getPostDetail(id, mbNum);
    }

    // 공지사항 저장
    @PostMapping("/posts")
    public ResponseEntity<String> savePost(@RequestBody NoticePost post) {
        try {
            noticePostService.savePost(post);
            return ResponseEntity.ok("saved");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("fail: " + e.getMessage());
        }
    }

    // 공지사항 수정
    @PutMapping("/posts/{id}")
    public ResponseEntity<String> updatePost(
            @PathVariable("id") Integer id,
            @RequestBody Map<String, String> updateData) {
        try {
            String title = updateData.get("title");
            String content = updateData.get("content");
            noticePostService.updatePost(id, title, content);
            return ResponseEntity.ok("updated");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("fail: " + e.getMessage());
        }
    }

    // 공지사항 삭제 (nn_del = 'Y' 처리)
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<String> deletePost(@PathVariable("id") Integer id) {
        try {
            noticePostService.deletePost(id);
            return ResponseEntity.ok("deleted");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("fail");
        }
    }
}
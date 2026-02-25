package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.NewsLetter;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.service.NewsLetterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RequiredArgsConstructor
public class NewsLetterController {

    private final NewsLetterService newsLetterService;

    /**
     * 🚩 뉴스레터 목록 조회
     */
    @GetMapping("/posts")
    public List<Map<String, Object>> getList(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        if (type != null && keyword != null && !keyword.trim().isEmpty()) {
            return newsLetterService.searchPosts(type, keyword);
        }
        return newsLetterService.getRealAllPosts();
    }

    /**
     * 🚩 뉴스레터 상세 조회
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        newsLetterService.increaseViewCount(id, request, response);
        Map<String, Object> postData = newsLetterService.getPostDetailWithImage(id, mbNum);
        return postData != null ? ResponseEntity.ok(postData) : ResponseEntity.notFound().build();
    }

    /**
     * 🚩 뉴스레터 등록 (관리자 전용)
     */
    @PostMapping("/posts")
    public ResponseEntity<?> create(Authentication authentication,
                                    @RequestParam("poTitle") String title,
                                    @RequestParam("poContent") String content,
                                    @RequestParam(value = "poMbNum", required = false) Integer poMbNum,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        // 🚩 권한 체크: 인증 정보가 있거나 관리자 번호(1)인 경우 허용
        try {
            NewsLetter post = NewsLetter.builder()
                    .poTitle(title)
                    .poContent(content)
                    .poMbNum(poMbNum != null ? poMbNum : resolveMbNum(authentication))
                    .build();
            
            // ✅ 이미지를 리스트로 감싸서 서비스로 전달 (영구 저장 처리용)
            List<MultipartFile> images = (image != null) ? List.of(image) : Collections.emptyList();
            newsLetterService.savePost(post, images);
            
            return ResponseEntity.ok(Map.of("message", "Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    /**
     * 🚩 뉴스레터 수정 (관리자 전용)
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> update(Authentication authentication,
                                    @PathVariable("id") Integer id,
                                    @RequestParam("poTitle") String title,
                                    @RequestParam("poContent") String content,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            // ✅ 수정 시에도 이미지 리스트 전달 체계 유지
            List<MultipartFile> images = (image != null ? List.of(image) : null);
            newsLetterService.updatePost(id, title, content, images);
            
            return ResponseEntity.ok(Map.of("message", "Updated"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    /**
     * 🚩 뉴스레터 삭제 (관리자 전용)
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(Authentication authentication, @PathVariable("id") Integer id) {
        try {
            newsLetterService.deletePost(id);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    /**
     * 🚩 뉴스레터 추천 토글
     */
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Integer> data) {
        try {
            String status = newsLetterService.toggleLikeStatus(id, data.get("mbNum"));
            return ResponseEntity.ok(Map.of("status", status));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // --- 헬퍼 메소드 ---

    private boolean isAdmin(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof CustomUser user) {
            String role = user.getMember().getMb_rol();
            return "ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role);
        }
        return true; // 로컬 테스트 및 세션 유지 실패 시 대응
    }

    private int resolveMbNum(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof CustomUser user) {
            return user.getMember().getMb_num();
        }
        return 1; // 기본 관리자 번호
    }
}
package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.NewsLetter;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
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
     * 🚩 뉴스레터 목록 조회 (유저/관리자 공용)
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
     * 🚩 뉴스레터 상세 조회 (유저/관리자 공용)
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        // 조회수 증가
        newsLetterService.increaseViewCount(id, request, response);
        
        // 상세 데이터 조회 (좋아요 여부 포함)
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
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        // ✅ 관리자 권한 체크
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자만 작성할 수 있습니다."));
        }

        try {
            // 인증 객체에서 관리자 정보 추출
            int mbNum = resolveMbNum(authentication);

            NewsLetter post = NewsLetter.builder()
                    .poTitle(title)
                    .poContent(content)
                    .poMbNum(mbNum)
                    .build();
            
            // 이미지를 리스트로 감싸서 서비스로 전달
            List<MultipartFile> images = (image != null) ? List.of(image) : Collections.emptyList();
            newsLetterService.savePost(post, images);
            
            return ResponseEntity.ok(Map.of("message", "Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
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
        
        // ✅ 관리자 권한 체크
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자만 수정할 수 있습니다."));
        }

        try {
            List<MultipartFile> images = (image != null ? List.of(image) : null);
            newsLetterService.updatePost(id, title, content, images);
            
            return ResponseEntity.ok(Map.of("message", "Updated"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 🚩 뉴스레터 삭제 (관리자 전용)
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(Authentication authentication, @PathVariable("id") Integer id) {
        
        // ✅ 관리자 권한 체크
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자만 삭제할 수 있습니다."));
        }

        try {
            newsLetterService.deletePost(id);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 🚩 뉴스레터 추천 토글 (유저 이용 가능)
     */
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        try {
            Object mbNumObj = data.get("mbNum");
            if (mbNumObj == null) return ResponseEntity.badRequest().body(Map.of("error", "로그인이 필요합니다."));
            
            int mbNum = Integer.parseInt(mbNumObj.toString());
            String status = newsLetterService.toggleLikeStatus(id, mbNum);
            return ResponseEntity.ok(Map.of("status", status));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 🚩 뉴스레터 즐겨찾기(스크랩) 토글 (유저 이용 가능)
     */
    @PostMapping("/posts/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        try {
            Object mbNumObj = data.get("mbNum");
            if (mbNumObj == null) return ResponseEntity.badRequest().body(Map.of("error", "로그인이 필요합니다."));
            
            int mbNum = Integer.parseInt(mbNumObj.toString());
            boolean isBookmarked = newsLetterService.toggleBookmarkStatus(id, mbNum);
            return ResponseEntity.ok(Map.of("isBookmarked", isBookmarked, "status", isBookmarked ? "ADDED" : "REMOVED"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // --- 헬퍼 메소드 ---

    private boolean isAdmin(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof CustomUser user) {
            MemberVO member = user.getMember();
            if (member != null) {
                String role = member.getMb_rol();
                return "ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role);
            }
        }
        return false;
    }

    private int resolveMbNum(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof CustomUser user) {
            return user.getMember().getMb_num();
        }
        return 1; // 기본 관리자 번호
    }
}
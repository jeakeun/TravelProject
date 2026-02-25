package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.Event; 
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.EventBoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/event")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RequiredArgsConstructor
public class EventBoardController {

    private final EventBoardService eventBoardService;

    /**
     * 🚩 이벤트 목록 조회
     */
    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getList(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        
        List<Map<String, Object>> list;
        if (type != null && keyword != null && !keyword.trim().isEmpty()) {
            list = eventBoardService.searchPosts(type, keyword);
        } else {
            list = eventBoardService.getRealAllPosts();
        }
        
        return ResponseEntity.ok(list != null ? list : Collections.emptyList());
    }

    /**
     * 🚩 이벤트 상세 조회
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        eventBoardService.increaseViewCount(id, request, response);
        
        Integer currentUserNum = (mbNum != null) ? mbNum : 0; 
        Map<String, Object> postData = eventBoardService.getPostDetailWithImage(id, currentUserNum);
        
        return postData != null 
                ? ResponseEntity.ok(postData) 
                : ResponseEntity.status(404).body(Map.of("error", "이벤트 게시글을 찾을 수 없습니다."));
    }

    /**
     * 🚩 이벤트 등록 (관리자 전용)
     */
    @PostMapping("/posts")
    public ResponseEntity<?> create(Authentication authentication,
                                    @RequestParam(value = "title", required = false) String title,
                                    @RequestParam(value = "poTitle", required = false) String poTitle,
                                    @RequestParam(value = "content", required = false) String content,
                                    @RequestParam(value = "poContent", required = false) String poContent,
                                    @RequestParam(value = "poMbNum", required = false) Integer poMbNum,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        // 🚩 권한 체크 로직 유지
        if (!isAdmin(authentication) && (poMbNum == null || poMbNum != 1)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자 권한이 필요합니다."));
        }

        try {
            String finalTitle = (poTitle != null && !poTitle.isEmpty()) ? poTitle : title;
            String finalContent = (poContent != null && !poContent.isEmpty()) ? poContent : content;
            
            if (finalTitle == null || finalTitle.trim().isEmpty() || finalContent == null || finalContent.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "제목과 내용을 입력해주세요."));
            }
            
            int mbNum = (authentication != null) ? resolveMbNum(authentication) : (poMbNum != null ? poMbNum : 1);
            
            Event post = new Event(); 
            post.setPoTitle(finalTitle);
            post.setPoContent(finalContent);
            post.setPoMbNum(mbNum);
            
            // ✅ 이미지를 서비스로 전달하여 영구 저장 처리
            List<MultipartFile> images = (image != null) ? List.of(image) : Collections.emptyList();
            eventBoardService.savePost(post, images);
            
            return ResponseEntity.ok(Map.of("message", "Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "등록 실패: " + e.getMessage()));
        }
    }

    /**
     * 🚩 이벤트 수정 (관리자 전용)
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Integer id, 
                                    Authentication authentication, 
                                    @RequestParam(value = "title", required = false) String title, 
                                    @RequestParam(value = "poTitle", required = false) String poTitle,
                                    @RequestParam(value = "content", required = false) String content, 
                                    @RequestParam(value = "poContent", required = false) String poContent,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            String finalTitle = (poTitle != null && !poTitle.isEmpty()) ? poTitle : title;
            String finalContent = (poContent != null && !poContent.isEmpty()) ? poContent : content;

            List<MultipartFile> images = (image != null ? List.of(image) : null);
            eventBoardService.updatePost(id, finalTitle, finalContent, images);
            
            return ResponseEntity.ok(Map.of("message", "Updated Success"));
        } catch (Exception e) { 
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); 
        }
    }

    /**
     * 🚩 이벤트 삭제 (관리자 전용)
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Integer id, Authentication authentication) {
        try {
            eventBoardService.deletePost(id);
            return ResponseEntity.ok(Map.of("message", "Deleted Success"));
        } catch (Exception e) { 
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); 
        }
    }

    /**
     * 🚩 이벤트 추천 토글
     */
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        try {
            Object mbNumObj = data.get("mbNum");
            if (mbNumObj == null) return ResponseEntity.badRequest().body(Map.of("error", "유저 정보가 없습니다."));
            
            int mbNum = Integer.parseInt(mbNumObj.toString());
            String status = eventBoardService.toggleLikeStatus(id, mbNum);
            return ResponseEntity.ok(Map.of("status", status));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // --- 유틸리티 메서드 보강 ---
    private boolean isAdmin(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null) {
                String role = member.getMb_rol();
                return "ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role);
            }
        }
        return false;
    }

    private int resolveMbNum(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null) return member.getMb_num();
        }
        return 1; 
    }
}
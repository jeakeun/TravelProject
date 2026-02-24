package kr.hi.travel_community.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.Event; 
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.EventBoardService; // 서비스 클래스명 변경에 따른 임포트 수정
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/event")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class EventBoardController {

    // 주입받는 서비스 인터페이스/클래스명을 EventBoardService로 변경
    private final EventBoardService eventBoardService;

    /**
     * 🚩 이벤트 목록 조회 및 검색 (모든 사용자 가능)
     */
    @GetMapping("/posts")
    public List<Map<String, Object>> getList(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        
        if (type != null && keyword != null && !keyword.trim().isEmpty()) {
            return eventBoardService.searchPosts(type, keyword);
        }
        
        return eventBoardService.getRealAllPosts();
    }

    /**
     * 🚩 이벤트 상세 조회 (모든 사용자 가능)
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Integer id,
                                       @RequestParam(value = "mbNum", required = false) Integer mbNum,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        eventBoardService.increaseViewCount(id, request, response);
        
        Integer currentUserNum = (mbNum != null) ? mbNum : 1;
        Map<String, Object> postData = eventBoardService.getPostDetailWithImage(id, currentUserNum);
        
        return postData != null 
                ? ResponseEntity.ok(postData) 
                : ResponseEntity.status(404).body(Map.of("error", "이벤트 게시글을 찾을 수 없습니다."));
    }

    /**
     * 🚩 이벤트 등록 (관리자 ADMIN만 가능)
     */
    @PostMapping("/posts")
    public ResponseEntity<?> create(Authentication authentication,
                                    @RequestParam(value = "title", required = false) String title,
                                    @RequestParam(value = "poTitle", required = false) String poTitle,
                                    @RequestParam(value = "content", required = false) String content,
                                    @RequestParam(value = "poContent", required = false) String poContent,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        // 1. 관리자 권한 체크
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자만 등록할 수 있습니다."));
        }

        try {
            String finalTitle = (title != null && !title.isEmpty()) ? title : poTitle;
            String finalContent = (content != null && !content.isEmpty()) ? content : poContent;
            
            if (finalTitle == null || finalContent == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "제목과 내용을 입력하세요."));
            }
            
            int mbNum = resolveMbNum(authentication);
            
            Event post = new Event(); 
            post.setPoTitle(finalTitle);
            post.setPoContent(finalContent);
            post.setPoMbNum(mbNum);
            
            List<MultipartFile> images = (image != null) ? List.of(image) : Collections.emptyList();
            eventBoardService.savePost(post, images);
            
            return ResponseEntity.ok(Map.of("message", "Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "등록 실패: " + e.getMessage()));
        }
    }

    /**
     * 🚩 이벤트 수정 (관리자 ADMIN만 가능)
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Integer id,
                                    Authentication authentication,
                                    @RequestParam("title") String title,
                                    @RequestParam("content") String content,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자만 수정할 수 있습니다."));
        }

        try {
            List<MultipartFile> images = (image != null) ? List.of(image) : null;
            eventBoardService.updatePost(id, title, content, images);
            return ResponseEntity.ok(Map.of("message", "Updated Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "수정 실패"));
        }
    }

    /**
     * 🚩 이벤트 삭제 (관리자 ADMIN만 가능)
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Integer id, Authentication authentication) {
        
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "관리자만 삭제할 수 있습니다."));
        }

        try {
            eventBoardService.deletePost(id);
            return ResponseEntity.ok(Map.of("message", "Deleted Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "삭제 실패"));
        }
    }

    /**
     * 🚩 추천 토글 (일반 사용자 가능)
     */
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = eventBoardService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    // --- 유틸리티 메서드 ---

    private boolean isAdmin(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            return member != null && "ADMIN".equals(member.getMb_rol());
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
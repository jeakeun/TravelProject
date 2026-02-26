package kr.hi.travel_community.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.Notice;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.NoticeBoardService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class NoticeBoardController {

    private final NoticeBoardService noticePostService;

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

    // 공지사항 저장 (관리자만 가능)
    @PostMapping("/posts")
    public ResponseEntity<String> savePost(Authentication authentication, @RequestBody Notice post) {
        try {
            // 관리자 권한 체크
            if (!isAdmin(authentication)) {
                return ResponseEntity.status(403).body("관리자만 작성할 수 있습니다.");
            }
            
            noticePostService.savePost(post);
            return ResponseEntity.ok("saved");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("fail: " + e.getMessage());
        }
    }

    // 공지사항 수정 (관리자만 가능)
    @PutMapping("/posts/{id}")
    public ResponseEntity<String> updatePost(
            Authentication authentication,
            @PathVariable("id") Integer id,
            @RequestBody Map<String, String> updateData) {
        try {
            // 관리자 권한 체크
            if (!isAdmin(authentication)) {
                return ResponseEntity.status(403).body("관리자만 수정할 수 있습니다.");
            }

            String title = updateData.get("title");
            String content = updateData.get("content");
            noticePostService.updatePost(id, title, content);
            return ResponseEntity.ok("updated");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("fail: " + e.getMessage());
        }
    }

    // 공지사항 삭제 (관리자만 가능)
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<String> deletePost(Authentication authentication, @PathVariable("id") Integer id) {
        try {
            // 관리자 권한 체크
            if (!isAdmin(authentication)) {
                return ResponseEntity.status(403).body("관리자만 삭제할 수 있습니다.");
            }

            noticePostService.deletePost(id);
            return ResponseEntity.ok("deleted");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("fail");
        }
    }

    // 🚩 추천(좋아요) 기능 - 유저 이용 가능
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = noticePostService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    // 🚩 즐겨찾기(스크랩) 기능 - 유저 이용 가능
    @PostMapping("/posts/{id}/scrap")
    public ResponseEntity<?> toggleScrap(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        // 서비스의 toggleScrapStatus 메서드 호출
        String status = noticePostService.toggleScrapStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    /**
     * 관리자 여부 확인 공통 로직
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUser) {
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member != null && "ADMIN".equals(member.getMb_rol())) {
                return true;
            }
        }
        return false;
    }
}
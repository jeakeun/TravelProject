package kr.hi.travel_community.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.FAQ;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.FAQService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class FAQController {

    private final FAQService faqService;

    // 🚩 FAQ 전체 목록 조회 (유저/관리자 공용)
    @GetMapping("/posts")
    public List<Map<String, Object>> getAllPosts() {
        return faqService.getRealAllPosts();
    }

    // 🚩 FAQ 상세 조회 (조회수 증가 포함)
    @GetMapping("/posts/{id}")
    public Map<String, Object> getPostDetail(
            @PathVariable("id") Integer id,
            @RequestParam(value = "mbNum", required = false) Integer mbNum,
            HttpServletRequest request,
            HttpServletResponse response) {
        
        faqService.increaseViewCount(id, request, response);
        return faqService.getPostDetail(id, mbNum);
    }

    // 🚩 FAQ 저장 (관리자만 가능)
    // 보완: @ModelAttribute를 사용하여 multipart/form-data(FormData) 수신 지원
    @PostMapping("/posts")
    public ResponseEntity<String> savePost(Authentication authentication, @ModelAttribute FAQ post) {
        try {
            // ✅ 관리자 권한 체크
            if (!isAdmin(authentication)) {
                return ResponseEntity.status(403).body("관리자만 작성할 수 있습니다.");
            }
            
            // 작성자 번호(mbNum) 설정 (인증 객체에서 추출)
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            post.setPoMbNum(member.getMb_num());
            
            faqService.savePost(post);
            return ResponseEntity.ok("saved");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("fail: " + e.getMessage());
        }
    }

    // 🚩 FAQ 수정 (관리자만 가능)
    // 보완: PUT 메서드에서도 FormData를 받을 수 있도록 @ModelAttribute 적용
    @PutMapping("/posts/{id}")
    public ResponseEntity<String> updatePost(
            Authentication authentication,
            @PathVariable("id") Integer id,
            @ModelAttribute FAQ updateData) { 
        try {
            // ✅ 관리자 권한 체크
            if (!isAdmin(authentication)) {
                return ResponseEntity.status(403).body("관리자만 수정할 수 있습니다.");
            }

            // React에서 보낸 poTitle, poContent가 updateData 객체에 자동으로 담김
            String title = updateData.getPoTitle();
            String content = updateData.getPoContent();
            
            faqService.updatePost(id, title, content);
            return ResponseEntity.ok("updated");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("fail: " + e.getMessage());
        }
    }

    // 🚩 FAQ 삭제 (관리자만 가능)
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<String> deletePost(Authentication authentication, @PathVariable("id") Integer id) {
        try {
            // ✅ 관리자 권한 체크
            if (!isAdmin(authentication)) {
                return ResponseEntity.status(403).body("관리자만 삭제할 수 있습니다.");
            }

            faqService.deletePost(id);
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
        String status = faqService.toggleLikeStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    // 🚩 즐겨찾기(스크랩) 기능 - 유저 이용 가능
    @PostMapping("/posts/{id}/scrap")
    public ResponseEntity<?> toggleScrap(@PathVariable("id") Integer id, @RequestBody Map<String, Object> data) {
        Object mbNumObj = data.get("mbNum");
        int mbNum = (mbNumObj != null) ? Integer.parseInt(mbNumObj.toString()) : 1;
        String status = faqService.toggleScrapStatus(id, mbNum);
        return ResponseEntity.ok(Map.of("status", status));
    }

    /**
     * ✅ 관리자 여부 확인 공통 로직
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
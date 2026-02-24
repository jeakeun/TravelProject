package kr.hi.travel_community.controller;

import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    private boolean isAdmin(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUser))
            return false;
        MemberVO member = ((CustomUser) auth.getPrincipal()).getMember();
        return member != null && "ADMIN".equalsIgnoreCase(member.getMb_rol());
    }

    @GetMapping("/inquiries")
    public ResponseEntity<?> getInquiries(Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
        List<Map<String, Object>> list = adminService.getAllInquiries();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports(Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
        List<Map<String, Object>> list = adminService.getAllReports();
        return ResponseEntity.ok(list);
    }

    @PutMapping("/inquiries/{ibNum}/status")
    public ResponseEntity<?> updateInquiryStatus(@PathVariable Integer ibNum, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            String status = body.getOrDefault("status", "Y");
            adminService.updateInquiryStatus(ibNum, status);
            return ResponseEntity.ok(Map.of("msg", "처리 완료"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "처리 중 오류가 발생했습니다."));
        }
    }

    @PutMapping("/inquiries/{ibNum}/reply")
    public ResponseEntity<?> updateInquiryReply(@PathVariable Integer ibNum, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            String reply = body != null ? body.get("reply") : null;
            adminService.updateInquiryReply(ibNum, reply != null ? reply : "");
            return ResponseEntity.ok(Map.of("msg", "답변이 저장되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "저장 중 오류가 발생했습니다. DB에 ib_reply 컬럼이 있는지 확인하세요."));
        }
    }

    @PutMapping("/reports/{rbNum}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Integer rbNum, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            String status = body.getOrDefault("status", "Y");
            adminService.updateReportStatus(rbNum, status);
            return ResponseEntity.ok(Map.of("msg", "처리 완료"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "처리 중 오류가 발생했습니다."));
        }
    }

    @PutMapping("/reports/{rbNum}/process")
    public ResponseEntity<?> processReport(@PathVariable Integer rbNum, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            String action = body != null ? body.get("action") : null;
            if (action == null || action.isBlank()) action = "Y";
            if (!"Y".equals(action) && !"D".equals(action) && !"H".equals(action)) {
                action = "Y";
            }
            adminService.processReport(rbNum, action);
            String msg = "Y".equals(action) ? "처리 완료" : "D".equals(action) ? "해당 게시글이 삭제 처리되었습니다." : "보류 처리되었습니다.";
            return ResponseEntity.ok(Map.of("msg", msg));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "처리 중 오류가 발생했습니다."));
        }
    }

    @PutMapping("/reports/{rbNum}/reply")
    public ResponseEntity<?> updateReportReply(@PathVariable Integer rbNum, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            String reply = body != null ? body.get("reply") : null;
            adminService.updateReportReply(rbNum, reply != null ? reply : "");
            return ResponseEntity.ok(Map.of("msg", "답변이 저장되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "저장 중 오류가 발생했습니다. DB에 rb_reply 컬럼이 있는지 확인하세요."));
        }
    }
}

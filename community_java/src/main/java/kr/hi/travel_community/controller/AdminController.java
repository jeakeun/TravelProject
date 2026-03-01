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
        if (auth == null || !auth.isAuthenticated())
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
        List<Map<String, Object>> list = adminService.getAllInquiries();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports(Authentication auth) {
        if (auth == null || !auth.isAuthenticated())
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
        List<Map<String, Object>> list = adminService.getAllReports();
        return ResponseEntity.ok(list);
    }

    /** 관리자 알림용: 미답변 문의·미처리 신고 건수 (헤더/관리자페이지 상태 표시) */
    @GetMapping("/notification-counts")
    public ResponseEntity<?> getNotificationCounts(Authentication auth) {
        if (auth == null || !auth.isAuthenticated())
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
        return ResponseEntity.ok(adminService.getNewCounts());
    }

    @PutMapping("/inquiries/{ibNum}/status")
    public ResponseEntity<?> updateInquiryStatus(@PathVariable("ibNum") Integer ibNum, @RequestBody(required = false) Map<String, Object> body, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated())
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            Object statusObj = (body != null && body.containsKey("status")) ? body.get("status") : null;
            String status = statusObj != null ? String.valueOf(statusObj).trim() : "Y";
            if (status.isEmpty()) status = "Y";
            adminService.updateInquiryStatus(ibNum, status);
            return ResponseEntity.ok(Map.of("msg", "처리 완료"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", dbErrorHint(e, "ib_status")));
        }
    }

    @PutMapping("/inquiries/{ibNum}/reply")
    public ResponseEntity<?> updateInquiryReply(@PathVariable("ibNum") Integer ibNum, @RequestBody(required = false) Map<String, Object> body, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated())
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            Object replyObj = (body != null && body.containsKey("reply")) ? body.get("reply") : null;
            String reply = replyObj != null ? String.valueOf(replyObj) : "";
            adminService.updateInquiryReply(ibNum, reply);
            return ResponseEntity.ok(Map.of("msg", "답변이 저장되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", dbErrorHint(e, "ib_reply")));
        }
    }

    @PutMapping("/reports/{rbNum}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable("rbNum") Integer rbNum, @RequestBody(required = false) Map<String, Object> body, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated())
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            Object statusObj = (body != null && body.containsKey("status")) ? body.get("status") : null;
            String status = statusObj != null ? String.valueOf(statusObj).trim() : "Y";
            if (status.isEmpty()) status = "Y";
            adminService.updateReportStatus(rbNum, status);
            return ResponseEntity.ok(Map.of("msg", "처리 완료"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", dbErrorHint(e, "rb_manage")));
        }
    }

    @PutMapping("/reports/{rbNum}/process")
    public ResponseEntity<?> processReport(@PathVariable("rbNum") Integer rbNum, @RequestBody(required = false) Map<String, Object> body, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated())
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            Object actionObj = (body != null && body.containsKey("action")) ? body.get("action") : null;
            String action = actionObj != null ? String.valueOf(actionObj).trim() : "Y";
            if (!"Y".equals(action) && !"D".equals(action) && !"H".equals(action)) action = "Y";
            adminService.processReport(rbNum, action);
            String msg = "Y".equals(action) ? "처리 완료" : "D".equals(action) ? "해당 게시글이 삭제 처리되었습니다." : "보류 처리되었습니다.";
            return ResponseEntity.ok(Map.of("msg", msg));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", dbErrorHint(e, "rb_manage")));
        }
    }

    @PutMapping("/reports/{rbNum}/reply")
    public ResponseEntity<?> updateReportReply(@PathVariable("rbNum") Integer rbNum, @RequestBody(required = false) Map<String, Object> body, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated())
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
            if (!isAdmin(auth))
                return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
            Object replyObj = (body != null && body.containsKey("reply")) ? body.get("reply") : null;
            String reply = replyObj != null ? String.valueOf(replyObj) : "";
            adminService.updateReportReply(rbNum, reply);
            return ResponseEntity.ok(Map.of("msg", "답변이 저장되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", dbErrorHint(e, "rb_reply")));
        }
    }

    private String dbErrorHint(Exception e, String column) {
        String msg = "";
        Throwable t = e;
        while (t != null) {
            if (t.getMessage() != null) msg = msg + " " + t.getMessage();
            t = t.getCause();
        }
        if (msg.contains("ib_reply") || msg.contains("rb_reply") || msg.contains("rb_manage") || msg.contains("ib_status") || msg.contains("Unknown column") || msg.contains("doesn't exist"))
            return "DB 스키마가 필요합니다. 서버를 재시작하면 자동으로 컬럼이 추가됩니다. 안 되면 프로젝트 DDL.sql을 실행하세요.";
        return "처리 중 오류가 발생했습니다. 서버를 재시작한 후 다시 시도하세요.";
    }
}

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
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
        String status = body.getOrDefault("status", "Y");
        adminService.updateInquiryStatus(ibNum, status);
        return ResponseEntity.ok(Map.of("msg", "처리 완료"));
    }

    @PutMapping("/reports/{rbNum}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Integer rbNum, @RequestBody Map<String, String> body, Authentication auth) {
        if (!isAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "관리자 권한이 필요합니다."));
        String status = body.getOrDefault("status", "Y");
        adminService.updateReportStatus(rbNum, status);
        return ResponseEntity.ok(Map.of("msg", "처리 완료"));
    }
}

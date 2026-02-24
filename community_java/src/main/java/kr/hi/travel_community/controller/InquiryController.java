package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.InquiryBox;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/inquiry")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryRepository inquiryRepository;

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Map<String, String> body, Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }
        MemberVO member = ((CustomUser) auth.getPrincipal()).getMember();
        if (member == null) {
            return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
        }

        String title = body.get("title");
        String content = body.get("content");
        if (title == null || title.isBlank() || content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "제목과 내용을 입력해주세요."));
        }

        InquiryBox ib = new InquiryBox();
        ib.setIbTitle(title);
        ib.setIbContent(content);
        ib.setIbMbNum(member.getMb_num());
        ib.setIbStatus("N");
        ib.setIbDate(LocalDateTime.now());
        inquiryRepository.save(ib);
        return ResponseEntity.ok(Map.of("msg", "문의가 접수되었습니다."));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyInquiries(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }
        MemberVO member = ((CustomUser) auth.getPrincipal()).getMember();
        if (member == null) {
            return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (InquiryBox ib : inquiryRepository.findByIbMbNumOrderByIbNumDesc(member.getMb_num())) {
            Map<String, Object> m = new HashMap<>();
            m.put("ibNum", ib.getIbNum());
            m.put("ibTitle", ib.getIbTitle());
            m.put("ibContent", ib.getIbContent() != null ? ib.getIbContent() : "");
            m.put("ibReply", ib.getIbReply() != null ? ib.getIbReply() : "");
            m.put("ibDate", ib.getIbDate());
            m.put("ibStatus", ib.getIbStatus() != null ? ib.getIbStatus() : "N");
            m.put("ibSeen", ib.getIbSeen() != null ? ib.getIbSeen() : "N");
            list.add(m);
        }
        return ResponseEntity.ok(list);
    }

    @PutMapping("/my/{ibNum}/seen")
    public ResponseEntity<?> markInquirySeen(@PathVariable Integer ibNum, Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }
        MemberVO member = ((CustomUser) auth.getPrincipal()).getMember();
        if (member == null) return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
        int updated = inquiryRepository.markSeen(ibNum, member.getMb_num());
        return updated > 0 ? ResponseEntity.ok(Map.of("msg", "확인됨")) : ResponseEntity.notFound().build();
    }
}

package kr.hi.travel_community.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.service.FreePostService;
import kr.hi.travel_community.service.RecommendPostService;
import lombok.RequiredArgsConstructor;

/**
 * 마이페이지 - 내가 쓴 글 DB 연동
 * JWT 인증 후 회원 번호(mb_num)로 추천/자유 게시판 글 조회
 */
@RestController
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class MypageController {

    private final RecommendPostService recommendPostService;
    private final FreePostService freePostService;

    @GetMapping("/posts")
    public ResponseEntity<?> getMyPosts(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        CustomUser customUser = (CustomUser) authentication.getPrincipal();
        MemberVO member = customUser.getMember();
        if (member == null) {
            return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
        }

        int mbNum = member.getMb_num();
        String mbNumStr = String.valueOf(mbNum);

        List<Map<String, Object>> combined = new ArrayList<>();

        // 1. 여행 추천 게시판 글 조회
        try {
            List<Map<String, Object>> rec = recommendPostService.searchPosts("author", mbNumStr);
            for (Map<String, Object> p : rec) {
                p.put("boardType", "recommend");
                p.put("boardName", "여행 추천");
                combined.add(p);
            }
        } catch (Exception e) {
            // ignore
        }

        // 2. 자유 게시판 글 조회
        try {
            List<Map<String, Object>> freeAll = freePostService.getRealAllPosts();
            List<Map<String, Object>> free = freeAll.stream()
                    .filter(p -> mbNum == (p.get("poMbNum") != null ? ((Number) p.get("poMbNum")).intValue() : -1))
                    .peek(p -> {
                        p.put("boardType", "freeboard");
                        p.put("boardName", "자유 게시판");
                    })
                    .collect(Collectors.toList());
            combined.addAll(free);
        } catch (Exception e) {
            // ignore
        }

        // 최신순 정렬 (poDate 기준)
        combined.sort((a, b) -> {
            Object da = a.get("poDate");
            Object db = b.get("poDate");
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return String.valueOf(db).compareTo(String.valueOf(da));
        });

        return ResponseEntity.ok(combined);
    }
}
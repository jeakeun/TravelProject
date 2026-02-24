package kr.hi.travel_community.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.travel_community.entity.Bookmark;
import kr.hi.travel_community.entity.ReportBox;
import kr.hi.travel_community.entity.FreePost;
import kr.hi.travel_community.entity.RecommendPost;
import kr.hi.travel_community.entity.ReviewPost;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.repository.BookmarkRepository;
import kr.hi.travel_community.repository.FreeRepository;
import kr.hi.travel_community.repository.RecommendRepository;
import kr.hi.travel_community.repository.ReportRepository;
import kr.hi.travel_community.repository.ReviewRepository;
import kr.hi.travel_community.service.FreePostService;
import kr.hi.travel_community.service.RecommendPostService;
import kr.hi.travel_community.service.ReviewPostService;
import lombok.RequiredArgsConstructor;

/**
 * 마이페이지 - 내가 쓴 글 DB 연동
 * JWT 인증 후 회원 번호(mb_num)로 추천/후기/자유 게시판 글 조회
 */
@RestController
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class MypageController {

    private final RecommendPostService recommendPostService;
    private final ReviewPostService reviewPostService;
    private final FreePostService freePostService;
    private final BookmarkRepository bookmarkRepository;
    private final ReportRepository reportRepository;
    private final RecommendRepository recommendRepository;
    private final ReviewRepository reviewRepository;
    private final FreeRepository freeRepository;

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

        try {
            List<Map<String, Object>> review = reviewPostService.searchPosts("author", mbNumStr);
            for (Map<String, Object> p : review) {
                p.put("boardType", "reviewboard");
                p.put("boardName", "여행 후기");
                combined.add(p);
            }
        } catch (Exception e) {
            // ignore
        }

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

    @GetMapping("/bookmarks")
    public ResponseEntity<?> getBookmarks(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }
        MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
        if (member == null) {
            return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
        }

        int mbNum = member.getMb_num();
        List<Bookmark> list = bookmarkRepository.findByBmMbNumOrderByBmNumDesc(mbNum);
        List<Map<String, Object>> result = new ArrayList<>();
        int limit = 5;
        for (Bookmark b : list) {
            if (result.size() >= limit) break;
            String title = resolvePostTitle(b.getBmPoType(), b.getBmPoNum());
            Map<String, Object> m = new HashMap<>();
            m.put("bmNum", b.getBmNum());
            m.put("boardType", b.getBmPoType());
            m.put("poNum", b.getBmPoNum());
            m.put("poTitle", title != null ? title : "(삭제된 글)");
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getMyReports(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }
        MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
        if (member == null) {
            return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
        }
        int mbNum = member.getMb_num();
        List<ReportBox> list = reportRepository.findByRbMbNumOrderByRbNumDesc(mbNum);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ReportBox rb : list) {
            Map<String, Object> m = new HashMap<>();
            m.put("rbNum", rb.getRbNum());
            m.put("rbName", rb.getRbName());
            m.put("rbId", rb.getRbId());
            m.put("rbContent", rb.getRbContent());
            m.put("rbReply", rb.getRbReply());
            m.put("rbManage", rb.getRbManage());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    private String resolvePostTitle(String poType, Integer poNum) {
        if (poNum == null) return null;
        try {
            if ("recommend".equals(poType)) {
                Optional<RecommendPost> opt = recommendRepository.findByPoNumAndPoDel(poNum, "N");
                return opt.map(RecommendPost::getPoTitle).orElse(null);
            }
            if ("reviewboard".equals(poType)) {
                Optional<ReviewPost> opt = reviewRepository.findByPoNumAndPoDel(poNum, "N");
                return opt.map(ReviewPost::getPoTitle).orElse(null);
            }
            if ("freeboard".equals(poType)) {
                Optional<FreePost> opt = freeRepository.findByPoNumAndPoDel(poNum, "N");
                return opt.map(FreePost::getPoTitle).orElse(null);
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    @PostMapping("/bookmarks")
    public ResponseEntity<?> addBookmark(@RequestBody Map<String, Object> body, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }
        MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
        if (member == null) {
            return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
        }

        Object poNumObj = body.get("poNum");
        Object boardTypeObj = body.get("boardType");
        int poNum = poNumObj instanceof Number ? ((Number) poNumObj).intValue() : Integer.parseInt(String.valueOf(poNumObj));
        String boardType = boardTypeObj != null ? String.valueOf(boardTypeObj) : "recommend";
        if (!"recommend".equals(boardType) && !"reviewboard".equals(boardType) && !"freeboard".equals(boardType)) {
            boardType = "recommend";
        }

        int mbNum = member.getMb_num();
        if (bookmarkRepository.existsByBmMbNumAndBmPoNumAndBmPoType(mbNum, poNum, boardType)) {
            return ResponseEntity.ok(Map.of("msg", "이미 즐겨찾기에 추가되어 있습니다."));
        }

        Bookmark b = new Bookmark();
        b.setBmMbNum(mbNum);
        b.setBmPoNum(poNum);
        b.setBmPoType(boardType);
        bookmarkRepository.save(b);
        return ResponseEntity.ok(Map.of("msg", "즐겨찾기에 추가되었습니다."));
    }

    @DeleteMapping("/bookmarks/{bmNum}")
    @Transactional
    public ResponseEntity<?> removeBookmark(@PathVariable("bmNum") Integer bmNum, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()
                    || !(authentication.getPrincipal() instanceof CustomUser)) {
                return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
            }
            MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
            if (member == null) {
                return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
            }

            Optional<Bookmark> opt = bookmarkRepository.findById(bmNum);
            if (opt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "즐겨찾기를 찾을 수 없습니다."));
            }
            Bookmark b = opt.get();
            Integer bmMb = b.getBmMbNum();
            int mbNum = member.getMb_num();
            if (bmMb == null || bmMb.intValue() != mbNum) {
                return ResponseEntity.status(403).body(Map.of("error", "본인만 삭제할 수 있습니다."));
            }
            bookmarkRepository.delete(b);
            return ResponseEntity.ok(Map.of("msg", "삭제되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "삭제 처리 중 오류가 발생했습니다."));
        }
    }
}

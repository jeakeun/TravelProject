package kr.hi.travel_community.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.travel_community.entity.BookMark;
import kr.hi.travel_community.entity.Comment;
import kr.hi.travel_community.entity.FreePost;
import kr.hi.travel_community.entity.Member;
import kr.hi.travel_community.entity.RecommendPost;
import kr.hi.travel_community.entity.ReportBox;
import kr.hi.travel_community.entity.ReviewPost;
import kr.hi.travel_community.model.util.CustomUser;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.repository.BookMarkRepository;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.repository.FreeRepository;
import kr.hi.travel_community.repository.MemberRepository;
import kr.hi.travel_community.repository.RecommendRepository;
import kr.hi.travel_community.repository.ReportRepository;
import kr.hi.travel_community.repository.ReviewRepository;
import kr.hi.travel_community.service.FreePostService;
import kr.hi.travel_community.service.RecommendPostService;
import kr.hi.travel_community.service.ReviewPostService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/mypage")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class MypageController {

    private final RecommendPostService recommendPostService;
    private final ReviewPostService reviewPostService;
    private final FreePostService freePostService;
    private final BookMarkRepository bookmarkRepository;
    private final ReportRepository reportRepository;
    private final RecommendRepository recommendRepository;
    private final ReviewRepository reviewRepository;
    private final FreeRepository freeRepository;
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;

    /**
     * 마이페이지: 내가 쓴 글 목록
     * - 인증된 사용자 기반으로 member.mb_num을 얻고
     * - 추천/후기/자유 게시판에서 "작성자 글"을 조회해 합친 뒤 반환
     * - 프론트에서는 boardType/boardName을 기반으로 화면 렌더링
     */
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
        } catch (Exception e) {}

        try {
            List<Map<String, Object>> review = reviewPostService.searchPosts("author", mbNumStr);
            for (Map<String, Object> p : review) {
                p.put("boardType", "reviewboard");
                p.put("boardName", "여행 후기");
                combined.add(p);
            }
        } catch (Exception e) {}

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
        } catch (Exception e) {}

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

    /**
     * 마이페이지: 즐겨찾기(북마크) 미리보기
     * - BookMark 테이블에서 최근 BM을 조회
     * - bm_po_type에 따라 원문 게시물 제목(resolvePostTitle)만 채워 응답
     */
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
        // 🚩 BookMark 클래스 사용
        List<BookMark> list = bookmarkRepository.findByBmMbNumOrderByBmNumDesc(mbNum);
        List<Map<String, Object>> result = new ArrayList<>();
        int limit = 5;
        for (BookMark b : list) {
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

    /**
     * 마이페이지: 신고 내역
     * - report_box에서 rb_mb_num(신고 대상 받는 사용자)을 기준으로 조회
     * - rbTargetNickname을 별도 조회로 채워 프론트에서 닉네임 표시 가능하게 함
     */
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
            m.put("rbSeen", rb.getRbSeen() != null ? rb.getRbSeen() : "N");
            m.put("rbTargetNickname", resolveReportTargetNickname(rb));
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 마이페이지: 신고 알림 "확인됨(seen)" 처리
     * - `/api/mypage/reports/{rbNum}/seen`
     * - reportRepository.markSeen로 rb_seen을 업데이트
     */
    @PutMapping("/reports/{rbNum}/seen")
    @Transactional
    public ResponseEntity<?> markReportSeen(@PathVariable Integer rbNum, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }
        MemberVO member = ((CustomUser) authentication.getPrincipal()).getMember();
        if (member == null) return ResponseEntity.status(401).body(Map.of("error", "회원 정보를 찾을 수 없습니다."));
        int updated = reportRepository.markSeen(rbNum, member.getMb_num());
        return updated > 0 ? ResponseEntity.ok(Map.of("msg", "확인됨")) : ResponseEntity.notFound().build();
    }

    /** 신고 대상(글/댓글 작성자) 닉네임 조회 */
    private String resolveReportTargetNickname(ReportBox rb) {
        if (rb == null) return "알 수 없음";
        String rbName = rb.getRbName() != null ? rb.getRbName() : "";
        Integer rbId = rb.getRbId();
        if (rbId == null) return "알 수 없음";
        Integer targetMbNum = null;
        try {
            if ("RECOMMEND".equals(rbName)) {
                targetMbNum = recommendRepository.findByPoNumAndPoDel(rbId, "N")
                        .map(RecommendPost::getPoMbNum).orElse(null);
            } else if ("RECOMMEND_COMMENT".equals(rbName)) {
                Comment c = commentRepository.findById(rbId).orElse(null);
                targetMbNum = c != null ? c.getCoMbNum() : null;
            } else if ("REVIEW".equals(rbName) || "REVIEWBOARD".equals(rbName)) {
                targetMbNum = reviewRepository.findByPoNumAndPoDel(rbId, "N")
                        .map(ReviewPost::getPoMbNum).orElse(null);
            } else if ("FREE".equals(rbName) || "FREEBOARD".equals(rbName)) {
                targetMbNum = freeRepository.findByPoNumAndPoDel(rbId, "N")
                        .map(FreePost::getPoMbNum).orElse(null);
            }
            if (targetMbNum != null) {
                return memberRepository.findById(targetMbNum)
                        .map(Member::getMbNickname)
                        .orElse("알 수 없음");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "알 수 없음";
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
        } catch (Exception e) {}
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

    
        BookMark b = new BookMark();
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

      
            Optional<BookMark> opt = bookmarkRepository.findById(bmNum);
            if (opt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "즐겨찾기를 찾을 수 없습니다."));
            }
            BookMark b = opt.get();
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
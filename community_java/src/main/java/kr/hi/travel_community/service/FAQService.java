package kr.hi.travel_community.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.FAQ;
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.repository.MemberRepository;
import kr.hi.travel_community.repository.FAQRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FAQService {

    private final FAQRepository postRepository;
    private final MemberRepository memberRepository; 
    private final LikeMapper likeMapper; 

    /**
     * 🚩 삭제되지 않은 FAQ 전체 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        return postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                .map(this::convertToMap).collect(Collectors.toList());
    }

    /**
     * 🚩 조회수 증가 (쿠키를 이용한 중복 방지)
     */
    @Transactional
    public void increaseViewCount(Integer id, HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String cookieName = "viewed_faq_" + id;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(cookieName)) return;
            }
        }

        if (postRepository.updateViewCount(id) > 0) {
            Cookie newCookie = new Cookie(cookieName, "true");
            newCookie.setPath("/");
            newCookie.setMaxAge(60 * 60 * 24);
            newCookie.setHttpOnly(true);
            response.addCookie(newCookie);
        }
    }

    /**
     * 🚩 FAQ 상세 조회 (좋아요/스크랩 상태 포함)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPostDetail(Integer id, Integer mbNum) {
        return postRepository.findByPoNumAndPoDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            
            int likeCheck = (mbNum != null) ? likeMapper.checkLikeStatus(id, mbNum) : 0;
            map.put("isLikedByMe", likeCheck > 0);

            int scrapCheck = (mbNum != null) ? likeMapper.checkScrapStatus(id, mbNum) : 0; 
            map.put("isScrappedByMe", scrapCheck > 0);
            
            return map;
        }).orElse(null);
    }

    /**
     * 🚩 FAQ 게시글 저장
     */
    @Transactional
    public void savePost(FAQ post) {
        post.setPoDate(LocalDateTime.now());
        post.setPoView(0);
        post.setPoUp(0);
        post.setPoDel("N");
        if (post.getPoMbNum() == null) {
            post.setPoMbNum(1); // 기본 관리자 번호
        }
        postRepository.save(post);
    }

    /**
     * 🚩 FAQ 게시글 수정
     */
    @Transactional
    public void updatePost(Integer id, String title, String content) {
        FAQ post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        post.setPoTitle(title);
        post.setPoContent(content);
        postRepository.save(post);
    }

    /**
     * 🚩 FAQ 게시글 논리 삭제
     */
    @Transactional
    public void deletePost(Integer id) {
        postRepository.findByPoNumAndPoDel(id, "N").ifPresent(p -> {
            p.setPoDel("Y");
            postRepository.save(p);
        });
    }

    /**
     * 🚩 추천(좋아요) 토글
     */
    @Transactional
    public String toggleLikeStatus(Integer poNum, Integer mbNum) {
        int count = likeMapper.checkLikeStatus(poNum, mbNum);
        FAQ post = postRepository.findByPoNumAndPoDel(poNum, "N")
                .orElseThrow(() -> new RuntimeException("FAQ 게시글 없음"));

        if (count == 0) {
            likeMapper.insertLikeLog(poNum, mbNum);
            post.setPoUp((post.getPoUp() == null ? 0 : post.getPoUp()) + 1);
            postRepository.save(post);
            return "liked";
        } else {
            likeMapper.deleteLikeLog(poNum, mbNum);
            post.setPoUp(Math.max(0, (post.getPoUp() == null ? 0 : post.getPoUp()) - 1));
            postRepository.save(post);
            return "unliked";
        }
    }

    /**
     * 🚩 즐겨찾기(스크랩) 토글
     */
    @Transactional
    public String toggleScrapStatus(Integer poNum, Integer mbNum) {
        int count = likeMapper.checkScrapStatus(poNum, mbNum);
        
        if (count == 0) {
            likeMapper.insertScrapLog(poNum, mbNum);
            return "scrapped";
        } else {
            likeMapper.deleteScrapLog(poNum, mbNum);
            return "unscrapped";
        }
    }

    /**
     * 🚩 엔티티를 프론트엔드용 Map으로 변환 (닉네임 포함)
     */
    private Map<String, Object> convertToMap(FAQ p) {
        Map<String, Object> map = new HashMap<>();
        map.put("poNum", p.getPoNum());
        map.put("poTitle", p.getPoTitle());
        map.put("poContent", p.getPoContent());
        map.put("poDate", p.getPoDate() != null ? p.getPoDate().toString() : "");
        map.put("poView", p.getPoView() != null ? p.getPoView() : 0);
        map.put("poUp", p.getPoUp() != null ? p.getPoUp() : 0);
        map.put("poMbNum", p.getPoMbNum());

        // 작성자 닉네임 매핑
        String nickname = "관리자";
        try {
            Optional<?> result = memberRepository.findById(p.getPoMbNum());
            if (result.isPresent()) {
                Object obj = result.get();
                if (obj instanceof MemberVO) {
                    nickname = ((MemberVO) obj).getMb_nickname();
                }
            }
        } catch (Exception e) {
            // 기본값 유지
        }
        map.put("mbNickname", nickname);

        return map;
    }
}
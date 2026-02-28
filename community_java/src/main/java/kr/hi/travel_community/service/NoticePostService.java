package kr.hi.travel_community.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.NoticePost;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticePostService {

    private final NoticeRepository postRepository;
    private final CommentRepository commentRepository;

    /**
     * 🚩 삭제되지 않은 공지사항 전체 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        // nn_del = 'N' 데이터만 조회
        return postRepository.findByNnDelOrderByNnNumDesc("N").stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * 🚩 조회수 증가 (쿠키 이용)
     */
    @Transactional
    public void increaseViewCount(Integer id, HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String cookieName = "viewed_notice_" + id;

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
     * 🚩 공지사항 상세 조회
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPostDetail(Integer id, Integer mbNum) {
        return postRepository.findByNnNumAndNnDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            // 공지사항용 댓글 조회 (type="NOTICE")
            map.put("comments", commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(id, "NOTICE", "N"));
            return map;
        }).orElse(null);
    }

    /**
     * 🚩 게시글 저장
     */
    @Transactional
    public void savePost(NoticePost post) {
        post.setNnDate(LocalDateTime.now());
        post.setNnView(0);
        post.setNnUp(0);
        post.setNnDel("N");
        postRepository.save(post);
    }

    /**
     * 🚩 게시글 수정
     */
    @Transactional
    public void updatePost(Integer id, String title, String content) {
        NoticePost post = postRepository.findByNnNumAndNnDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        post.setNnTitle(title);
        post.setNnContent(content);
        // JPA 영속성 컨텍스트에 의해 save를 호출하지 않아도 변경 감지(Dirty Checking)로 업데이트되지만, 명시적으로 추가 가능
        postRepository.save(post);
    }

    /**
     * 🚩 게시글 논리 삭제
     */
    @Transactional
    public void deletePost(Integer id) {
        postRepository.findByNnNumAndNnDel(id, "N").ifPresent(p -> {
            p.setNnDel("Y");
            postRepository.save(p);
        });
    }

    /**
     * 🚩 엔티티를 프론트엔드용 Map으로 변환
     */
    private Map<String, Object> convertToMap(NoticePost p) {
        Map<String, Object> map = new HashMap<>();
        map.put("nnNum", p.getNnNum());
        map.put("nnTitle", p.getNnTitle());
        map.put("nnContent", p.getNnContent());
        map.put("nnDate", p.getNnDate() != null ? p.getNnDate().toString() : "");
        map.put("nnView", p.getNnView() != null ? p.getNnView() : 0);
        map.put("nnUp", p.getNnUp() != null ? p.getNnUp() : 0);
        map.put("nnMbNum", p.getNnMbNum());
        map.put("commentCount", commentRepository.countByCoPoNumAndCoPoTypeAndCoDel(p.getNnNum(), "NOTICE", "N"));
        return map;
    }
}
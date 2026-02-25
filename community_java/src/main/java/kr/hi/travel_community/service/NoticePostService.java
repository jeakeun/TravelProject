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

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        // nn_del = 'N' 데이터만 조회
        return postRepository.findByNnDelOrderByNnNumDesc("N").stream()
                .map(this::convertToMap).collect(Collectors.toList());
    }

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

    @Transactional(readOnly = true)
    public Map<String, Object> getPostDetail(Integer id, Integer mbNum) {
        return postRepository.findByNnNumAndNnDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            // 공지사항용 댓글 조회 (type="NOTICE")
            map.put("comments", commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(id, "NOTICE", "N"));
            return map;
        }).orElse(null);
    }

    @Transactional
    public void savePost(NoticePost post) {
        post.setNnDate(LocalDateTime.now());
        post.setNnView(0);
        post.setNnUp(0);
        post.setNnDel("N");
        postRepository.save(post);
    }

    @Transactional
    public void updatePost(Integer id, String title, String content) {
        NoticePost post = postRepository.findByNnNumAndNnDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        post.setNnTitle(title);
        post.setNnContent(content);
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Integer id) {
        postRepository.findByNnNumAndNnDel(id, "N").ifPresent(p -> p.setNnDel("Y"));
    }

    private Map<String, Object> convertToMap(NoticePost p) {
        Map<String, Object> map = new HashMap<>();
        // DDL 규격 nn_ 접두어 필드 매핑
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
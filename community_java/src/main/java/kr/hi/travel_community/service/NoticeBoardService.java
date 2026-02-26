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
import kr.hi.travel_community.entity.Notice;
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.repository.MemberRepository;
import kr.hi.travel_community.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeBoardService {

    private final NoticeRepository postRepository;
    private final MemberRepository memberRepository; // 🚩 닉네임 조회를 위해 추가
    private final LikeMapper likeMapper; 

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
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
            
            int likeCheck = (mbNum != null) ? likeMapper.checkLikeStatus(id, mbNum) : 0;
            map.put("isLikedByMe", likeCheck > 0);

            int scrapCheck = (mbNum != null) ? likeMapper.checkScrapStatus(id, mbNum) : 0; 
            map.put("isScrappedByMe", scrapCheck > 0);
            
            return map;
        }).orElse(null);
    }

    @Transactional
    public void savePost(Notice post) {
        post.setNnDate(LocalDateTime.now());
        post.setNnView(0);
        post.setNnUp(0);
        post.setNnDel("N");
        if (post.getNnMbNum() == null) {
            post.setNnMbNum(1); 
        }
        postRepository.save(post);
    }

    @Transactional
    public void updatePost(Integer id, String title, String content) {
        Notice post = postRepository.findByNnNumAndNnDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        post.setNnTitle(title);
        post.setNnContent(content);
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Integer id) {
        postRepository.findByNnNumAndNnDel(id, "N").ifPresent(p -> {
            p.setNnDel("Y");
            postRepository.save(p);
        });
    }

    @Transactional
    public String toggleLikeStatus(Integer nnNum, Integer mbNum) {
        int count = likeMapper.checkLikeStatus(nnNum, mbNum);
        Notice post = postRepository.findByNnNumAndNnDel(nnNum, "N")
                .orElseThrow(() -> new RuntimeException("공지사항 없음"));

        if (count == 0) {
            likeMapper.insertLikeLog(nnNum, mbNum);
            post.setNnUp((post.getNnUp() == null ? 0 : post.getNnUp()) + 1);
            postRepository.save(post);
            return "liked";
        } else {
            likeMapper.deleteLikeLog(nnNum, mbNum);
            post.setNnUp(Math.max(0, (post.getNnUp() == null ? 0 : post.getNnUp()) - 1));
            postRepository.save(post);
            return "unliked";
        }
    }

    @Transactional
    public String toggleScrapStatus(Integer nnNum, Integer mbNum) {
        int count = likeMapper.checkScrapStatus(nnNum, mbNum);
        
        if (count == 0) {
            likeMapper.insertScrapLog(nnNum, mbNum);
            return "scrapped";
        } else {
            likeMapper.deleteScrapLog(nnNum, mbNum);
            return "unscrapped";
        }
    }

    private Map<String, Object> convertToMap(Notice p) {
        Map<String, Object> map = new HashMap<>();
        map.put("nnNum", p.getNnNum());
        map.put("nnTitle", p.getNnTitle());
        map.put("nnContent", p.getNnContent());
        map.put("nnDate", p.getNnDate() != null ? p.getNnDate().toString() : "");
        map.put("nnView", p.getNnView() != null ? p.getNnView() : 0);
        map.put("nnUp", p.getNnUp() != null ? p.getNnUp() : 0);
        map.put("nnMbNum", p.getNnMbNum());

        // 🚩 작성자(관리자) 닉네임 매핑 로직 (타입 에러 방어)
        String nickname = "관리자";
        try {
            Optional<?> result = memberRepository.findById(p.getNnMbNum());
            if (result.isPresent()) {
                Object obj = result.get();
                if (obj instanceof MemberVO) {
                    nickname = ((MemberVO) obj).getMb_nickname();
                }
            }
        } catch (Exception e) {
            // 에러 시 기본값 "관리자" 유지
        }
        map.put("mbNickname", nickname);

        return map;
    }
}
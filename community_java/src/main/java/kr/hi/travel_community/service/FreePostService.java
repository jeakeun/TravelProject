package kr.hi.travel_community.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.travel_community.entity.FreePost;
import kr.hi.travel_community.entity.BookMark; // 🚩 추가: 북마크 엔티티 임포트
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.model.vo.MemberVO;
import kr.hi.travel_community.repository.BookMarkRepository;
import kr.hi.travel_community.repository.CommentRepository;
import kr.hi.travel_community.repository.FreeRepository;
import kr.hi.travel_community.repository.MemberRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FreePostService {

    private final FreeRepository postRepository;
    private final LikeMapper likeMapper;
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository; 
    private final BookMarkRepository bookMarkRepository;

    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadRoot;

    private final String SERVER_URL = "/pic/";

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        return postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public void increaseViewCount(Integer id, HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String cookieName = "viewed_free_" + id;

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
    public Map<String, Object> getPostDetailWithImage(Integer id, Integer mbNum) {
        return postRepository.findByPoNumAndPoDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            map.put("comments", commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(id, "FREE", "N"));
            map.put("isLikedByMe", mbNum != null && likeMapper.checkLikeStatus(id, mbNum) > 0);
            
            boolean isBookmarked = (mbNum != null) && bookMarkRepository.existsByBmMbNumAndBmPoNumAndBmPoType(mbNum, id, "FREE");
            map.put("isBookmarkedByMe", isBookmarked);
            
            return map;
        }).orElse(null);
    }

    /**
     * 🚩 게시글 등록
     */
    @Transactional
    public void savePost(FreePost post, List<MultipartFile> images) throws Exception {
        post.setPoDate(LocalDateTime.now());
        post.setPoView(0);
        post.setPoUp(0);
        post.setPoDel("N"); 
        
        if (post.getPoMbNum() == null || post.getPoMbNum() == 0) {
            post.setPoMbNum(1); 
        }

        handleImages(post, images);
        postRepository.save(post);
    }

    /**
     * 🚩 게시글 수정
     */
    @Transactional
    public void updatePost(Integer id, String title, String content, List<MultipartFile> images) throws Exception {
        FreePost post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        post.setPoTitle(title);
        post.setPoContent(content);
        if (images != null && !images.isEmpty()) {
            handleImages(post, images);
        }
        postRepository.save(post);
    }

    /**
     * 🚩 게시글 삭제 (논리 삭제)
     */
    @Transactional
    public void deletePost(Integer id) {
        postRepository.findByPoNumAndPoDel(id, "N").ifPresent(p -> {
            p.setPoDel("Y");
            postRepository.save(p); 
        });
    }

    /**
     * 🚩 추천 토글
     * FreeRepository에 추가된 벌크 연산 메서드를 사용하여 안전하게 처리
     */
    @Transactional
    public String toggleLikeStatus(Integer poNum, Integer mbNum) {
        if (mbNum == null) return "error_login";

        FreePost post = postRepository.findByPoNumAndPoDel(poNum, "N")
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        int count = likeMapper.checkLikeStatus(poNum, mbNum);

        if (count == 0) {
            likeMapper.insertLikeLog(poNum, mbNum);
            // 🚩 [수정] 레포지토리 벌크 연산 호출로 변경 (정합성 확보)
            postRepository.increaseLikeCount(poNum);
            return "liked";
        } else {
            likeMapper.deleteLikeLog(poNum, mbNum);
            // 🚩 [수정] 레포지토리 벌크 연산 호출로 변경
            postRepository.decreaseLikeCount(poNum);
            return "unliked";
        }
    }

    /**
     * 🚩 즐겨찾기(북마크) 토글
     * 제공받은 BookMark 엔티티와 빌더를 활용하여 실제 DB 저장/삭제 로직 구현
     */
    @Transactional
    public String toggleBookmarkStatus(Integer poNum, Integer mbNum) {
        if (mbNum == null) return "error_login";

        boolean exists = bookMarkRepository.existsByBmMbNumAndBmPoNumAndBmPoType(mbNum, poNum, "FREE");

        if (!exists) {
            // 🚩 [수정] 북마크 엔티티를 생성하여 레포지토리에 저장
            BookMark bookmark = BookMark.builder()
                    .bmMbNum(mbNum)
                    .bmPoNum(poNum)
                    .bmPoType("FREE")
                    .build();
            bookMarkRepository.save(bookmark);
            return "bookmarked";
        } else {
            // 🚩 [수정] 기존 북마크 삭제
            bookMarkRepository.deleteByBmMbNumAndBmPoNumAndBmPoType(mbNum, poNum, "FREE");
            return "unbookmarked";
        }
    }

    /**
     * 🚩 신고 처리 로직
     */
    @Transactional
    public void reportPost(Integer id, Integer mbNum, String category, String reason) {
        FreePost post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        
        Integer currentReportCount = post.getPoReport();
        post.setPoReport((currentReportCount == null ? 0 : currentReportCount) + 1);
        
        postRepository.save(post);
    }

    /**
     * 이미지 처리 공통 메서드
     */
    private void handleImages(FreePost post, List<MultipartFile> images) throws Exception {
        if (images == null || images.isEmpty()) return;

        String cleanPath = uploadRoot.replace("\\", "/");
        if (!cleanPath.endsWith("/")) cleanPath += "/";

        File dir = new File(cleanPath);
        if (!dir.exists()) dir.mkdirs();

        List<String> savedNames = new ArrayList<>();
        for (MultipartFile file : images) {
            if (file != null && !file.isEmpty()) {
                String originalFileName = file.getOriginalFilename();
                if (originalFileName == null || !originalFileName.contains(".")) continue;
                
                String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
                String fileName = UUID.randomUUID().toString() + extension;

                Path targetPath = Paths.get(cleanPath).resolve(fileName);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                savedNames.add(fileName);
            }
        }
        if (!savedNames.isEmpty()) {
            post.setFileUrl(String.join(",", savedNames));
        }
    }

    /**
     * 엔티티 -> Map 변환
     */
    private Map<String, Object> convertToMap(FreePost p) {
        Map<String, Object> map = new HashMap<>();
        map.put("poNum", p.getPoNum());
        map.put("poTitle", p.getPoTitle());
        map.put("poContent", p.getPoContent());
        map.put("poDate", p.getPoDate() != null ? p.getPoDate().toString() : "");
        map.put("poView", p.getPoView() != null ? p.getPoView() : 0);
        map.put("poUp", p.getPoUp() != null ? p.getPoUp() : 0);
        map.put("poReport", p.getPoReport() != null ? p.getPoReport() : 0);
        map.put("poMbNum", p.getPoMbNum());
        map.put("commentCount", commentRepository.countByCoPoNumAndCoPoTypeAndCoDel(p.getPoNum(), "FREE", "N"));
        
        String nickname = "알 수 없는 사용자";
        if (p.getMember() != null) {
            nickname = p.getMember().getMbNickname(); 
        } else if (p.getPoMbNum() != null) {
            try {
                memberRepository.findById(p.getPoMbNum()).ifPresent(m -> {
                    map.put("mbNickname", m.getMbNickname());
                });
                if(map.get("mbNickname") != null) nickname = (String) map.get("mbNickname");
            } catch (Exception e) {}
        }
        
        map.put("mbNickname", nickname);
        map.put("member", p.getMember());
        
        String imgPath = p.getFileUrl();
        if (imgPath != null && !imgPath.trim().isEmpty()) {
            String firstImg = imgPath.split(",")[0].trim();
            map.put("fileUrl", SERVER_URL + firstImg);
            map.put("poImg", SERVER_URL + firstImg); 
        } else {
            map.put("fileUrl", null);
            map.put("poImg", null);
        }
        return map;
    }
}
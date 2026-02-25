package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.Event; 
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.repository.EventRepository;
import kr.hi.travel_community.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.File;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventBoardService {

    private final EventRepository postRepository;
    private final LikeMapper likeMapper;
    private final CommentRepository commentRepository;
    
    // 🚩 [수정] 외부 절대 경로 사용 (application.properties 연동)
    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadRoot;

    // 🚩 [수정] 프론트엔드 호환성을 위한 상대 경로 방식 사용
    private final String SERVER_URL = "/pic/";
    
    // 이벤트 게시판 고유 타입
    private final String BOARD_TYPE = "EVENT";

    /**
     * 🚩 삭제되지 않은 모든 이벤트 게시글 조회 (최신순)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRealAllPosts() {
        return postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * 🚩 이벤트 게시판 검색 기능
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchPosts(String type, String keyword) {
        List<Event> result;

        switch (type) {
            case "title":
                result = postRepository.findByPoTitleContainingAndPoDelOrderByPoNumDesc(keyword, "N");
                break;
            case "content":
                result = postRepository.findByPoContentContainingAndPoDelOrderByPoNumDesc(keyword, "N");
                break;
            case "author":
                try {
                    Integer mbNum = Integer.parseInt(keyword);
                    result = postRepository.findByPoDelOrderByPoNumDesc("N").stream()
                            .filter(p -> p.getPoMbNum().equals(mbNum))
                            .collect(Collectors.toList());
                } catch (NumberFormatException e) {
                    result = new ArrayList<>();
                }
                break;
            default:
                result = postRepository.findByPoDelOrderByPoNumDesc("N");
        }

        return result.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * 🚩 조회수 증가 (중복 방지 쿠키 적용)
     */
    @Transactional
    public void increaseViewCount(Integer id, HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String cookieName = "viewed_event_" + id;

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
     * 🚩 게시글 상세 정보
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPostDetailWithImage(Integer id, Integer mbNum) {
        return postRepository.findByPoNumAndPoDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            
            // 댓글 조회 시 EVENT 타입으로 고정
            map.put("comments", commentRepository.findByCoPoNumAndCoPoTypeAndCoDelOrderByCoDateAsc(id, BOARD_TYPE, "N"));
            map.put("isLikedByMe", mbNum != null && mbNum > 0 && likeMapper.checkLikeStatus(id, mbNum) > 0);
            return map;
        }).orElse(null);
    }

    /**
     * 🚩 게시글 저장
     */
    @Transactional
    public void savePost(Event post, List<MultipartFile> images) throws Exception {
        post.setPoDate(LocalDateTime.now());
        post.setPoView(0);
        post.setPoUp(0);
        post.setPoDel("N");
        
        handleImages(post, images);
        postRepository.save(post);
    }

    /**
     * 🚩 게시글 수정
     */
    @Transactional
    public void updatePost(Integer id, String title, String content, List<MultipartFile> images) throws Exception {
        Event post = postRepository.findByPoNumAndPoDel(id, "N")
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        
        post.setPoTitle(title);
        post.setPoContent(content);
        
        if (images != null && !images.isEmpty()) {
            handleImages(post, images);
        }
        postRepository.save(post);
    }

    /**
     * 🚩 게시글 논리 삭제
     */
    @Transactional
    public void deletePost(Integer id) {
        postRepository.findByPoNumAndPoDel(id, "N").ifPresent(p -> p.setPoDel("Y"));
    }

    /**
     * 🚩 추천(좋아요) 토글 로직
     */
    @Transactional
    public String toggleLikeStatus(Integer poNum, Integer mbNum) {
        int count = likeMapper.checkLikeStatus(poNum, mbNum);
        Event post = postRepository.findByPoNumAndPoDel(poNum, "N")
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

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
     * 🚩 이미지 파일 물리 저장 및 엔티티 세팅
     */
    private void handleImages(Event post, List<MultipartFile> images) throws Exception {
        if (images == null || images.isEmpty()) return;
        
        // 경로 구분자 통일
        String cleanPath = uploadRoot.replace("\\", "/");
        if (!cleanPath.endsWith("/")) cleanPath += "/";
        
        File dir = new File(cleanPath);
        if (!dir.exists()) {
            dir.mkdirs(); 
        }
        
        List<String> savedNames = new ArrayList<>();
        for (MultipartFile file : images) {
            if (!file.isEmpty()) {
                // UUID를 사용하여 파일명 중복 방지 및 타임스탬프보다 안전한 명명
                String originalFileName = file.getOriginalFilename();
                String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
                String fileName = UUID.randomUUID().toString() + extension;
                
                Path targetPath = Paths.get(cleanPath).resolve(fileName);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                savedNames.add(fileName);
            }
        }
        
        if (!savedNames.isEmpty()) {
            post.setPoImg(String.join(",", savedNames));
        }
    }

    /**
     * 🚩 엔티티 데이터를 프론트엔드용 Map으로 변환
     */
    private Map<String, Object> convertToMap(Event p) {
        Map<String, Object> map = new HashMap<>();
        map.put("poNum", p.getPoNum());
        map.put("po_num", p.getPoNum()); 
        
        map.put("poTitle", p.getPoTitle());
        map.put("po_title", p.getPoTitle());
        
        map.put("poContent", p.getPoContent());
        map.put("po_content", p.getPoContent());
        
        map.put("poDate", p.getPoDate() != null ? p.getPoDate().toString() : "");
        map.put("po_date", p.getPoDate() != null ? p.getPoDate().toString() : "");
        
        map.put("poView", p.getPoView() != null ? p.getPoView() : 0);
        map.put("po_view", p.getPoView() != null ? p.getPoView() : 0);
        
        map.put("poUp", p.getPoUp() != null ? p.getPoUp() : 0);
        map.put("po_up", p.getPoUp() != null ? p.getPoUp() : 0);
        
        map.put("poMbNum", p.getPoMbNum());
        
        map.put("commentCount", commentRepository.countByCoPoNumAndCoPoTypeAndCoDel(p.getPoNum(), BOARD_TYPE, "N"));
        
        if (p.getPoImg() != null && !p.getPoImg().isEmpty()) {
            String firstImg = p.getPoImg().split(",")[0].trim();
            // 리액트에서 /pic/파일명으로 접근 가능하도록 처리
            map.put("fileUrl", SERVER_URL + firstImg);
            map.put("po_img", firstImg);
            map.put("poImg", SERVER_URL + firstImg); // 다중 명칭 지원
        } else {
            map.put("fileUrl", null);
            map.put("po_img", null);
            map.put("poImg", null);
        }
        
        return map;
    }
}
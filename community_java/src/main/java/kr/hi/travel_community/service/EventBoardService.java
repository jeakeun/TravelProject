package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.Event; 
import kr.hi.travel_community.mapper.LikeMapper;
import kr.hi.travel_community.repository.EventRepository;
import kr.hi.travel_community.repository.MemberRepository;
import kr.hi.travel_community.model.vo.MemberVO;
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
    private final MemberRepository memberRepository; // 🚩 닉네임 조회를 위해 주입
    private final LikeMapper likeMapper;
    
    // 🚩 [유지] 외부 절대 경로 사용
    @Value("${file.upload-dir:C:/travel_contents/uploads/pic/}")
    private String uploadRoot;

    // 🚩 [유지] 프론트엔드 호환성을 위한 상대 경로
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
     * 🚩 게시글 상세 정보 (이미지 포함)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPostDetailWithImage(Integer id, Integer mbNum) {
        return postRepository.findByPoNumAndPoDel(id, "N").map(p -> {
            Map<String, Object> map = convertToMap(p);
            // 🚩 이벤트 게시판은 댓글 기능을 사용하지 않으므로 comments 로직 제외
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
     * 🚩 북마크(스크랩) 토글 로직
     */
    @Transactional
    public boolean toggleBookmarkStatus(Integer poNum, Integer mbNum) {
        // 기존 LikeMapper에 스크랩 관련 메서드가 있다고 가정 (공지사항과 동일 방식)
        int count = likeMapper.checkScrapStatus(poNum, mbNum);
        if (count == 0) {
            likeMapper.insertScrapLog(poNum, mbNum);
            return true;
        } else {
            likeMapper.deleteScrapLog(poNum, mbNum);
            return false;
        }
    }

    /**
     * 🚩 이미지 파일 물리 저장 및 엔티티 세팅 (기존 로직 유지)
     */
    private void handleImages(Event post, List<MultipartFile> images) throws Exception {
        if (images == null || images.isEmpty()) return;
        
        String cleanPath = uploadRoot.replace("\\", "/");
        if (!cleanPath.endsWith("/")) cleanPath += "/";
        
        File dir = new File(cleanPath);
        if (!dir.exists()) {
            dir.mkdirs(); 
        }
        
        List<String> savedNames = new ArrayList<>();
        for (MultipartFile file : images) {
            if (!file.isEmpty()) {
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

        // 🚩 작성자(관리자) 닉네임 매핑 (방어 로직 포함)
        String nickname = "관리자";
        try {
            Optional<?> result = memberRepository.findById(p.getPoMbNum());
            if (result.isPresent()) {
                Object obj = result.get();
                if (obj instanceof MemberVO) {
                    nickname = ((MemberVO) obj).getMb_nickname();
                }
            }
        } catch (Exception e) {}
        map.put("mbNickname", nickname);
        
        if (p.getPoImg() != null && !p.getPoImg().isEmpty()) {
            String firstImg = p.getPoImg().split(",")[0].trim();
            map.put("fileUrl", SERVER_URL + firstImg);
            map.put("po_img", firstImg);
            map.put("poImg", SERVER_URL + firstImg);
        } else {
            map.put("fileUrl", null);
            map.put("po_img", null);
            map.put("poImg", null);
        }
        
        return map;
    }
}
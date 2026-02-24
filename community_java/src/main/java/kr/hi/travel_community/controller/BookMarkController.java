package kr.hi.travel_community.controller;

import kr.hi.travel_community.entity.BookMark;
import kr.hi.travel_community.service.BookMarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import jakarta.servlet.http.HttpSession; 
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmark")
public class BookMarkController {

    @Autowired
    private BookMarkService bookMarkService;

    /**
     * 🚩 즐겨찾기 토글 (등록/취소)
     */
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleBookMark(@RequestBody BookMark bookMark, HttpSession session) {
        // 세션에서 로그인한 사용자의 고유 번호(mb_num) 추출
        Integer loginUserNum = (Integer) session.getAttribute("mb_num");

        if (loginUserNum == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요한 기능입니다.");
        }

        // 보안을 위해 세션의 mb_num을 강제 주입
        bookMark.setBmMbNum(loginUserNum);

        // 서비스 호출
        boolean isAdded = bookMarkService.toggleBookMark(bookMark);
        
        return ResponseEntity.ok(Map.of(
            "status", isAdded ? "ADDED" : "REMOVED",
            "isBookmarked", isAdded
        ));
    }

    /**
     * 🚩 마이페이지용 즐겨찾기 목록 조회
     */
    @GetMapping("/my-list")
    public ResponseEntity<?> getMyBookMarkList(HttpSession session) {
        Integer loginUserNum = (Integer) session.getAttribute("mb_num");

        if (loginUserNum == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        List<BookMark> myList = bookMarkService.getMyBookMarks(loginUserNum);
        return ResponseEntity.ok(myList);
    }
}
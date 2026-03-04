package kr.hi.travel_community.controller;

import kr.hi.travel_community.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // JSON 응답을 보내는 컨트롤러임을 선언
@RequestMapping("/api/tour") // 이 컨트롤러의 모든 주소는 /api/tour로 시작함
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    // 브라우저에서 http://localhost:8080/api/tour/save-data 로 접속하면 실행됨
    @GetMapping("/save-data")
    public String saveTourData() {
        try {
            tourService.getTourDataAndSave(); // 서비스 메서드 호출
            return "✅ [성공] 공공데이터를 불러와 DB에 저장했습니다!";
        } catch (Exception e) {
            return "❌ [실패] 데이터 저장 중 오류 발생: " + e.getMessage();
        }
    }
}
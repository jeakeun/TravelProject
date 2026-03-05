package kr.hi.travel_community.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.travel_community.model.dto.ItemDto;
import kr.hi.travel_community.service.TourService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j // 로그 기록을 위한 어노테이션 추가
@RestController
@RequestMapping("/api/tour")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    /**
     * 공공데이터 저장 실행
     * 수정사항: 특정 contentTypeId(관광지, 음식점 등)를 파라미터로 받아 선택적 저장이 가능하도록 보완
     * 호출 예시 1 (전체): http://localhost:8080/api/tour/save-data
     * 호출 예시 2 (음식점만): http://localhost:8080/api/tour/save-data?contentTypeId=39
     */
    @GetMapping("/save-data")
    public String saveTourData(
            @RequestParam(value = "contentTypeId", required = false) String contentTypeId
    ) {
        try {
            log.info("📢 TourAPI(KorService2) 데이터 수집 시작 - 타입: {}", 
                     contentTypeId != null ? contentTypeId : "전체");
            
            // 서비스 호출 (서비스 코드에 contentTypeId 파라미터 처리가 추가되었다면 전달)
            tourService.getTourDataAndSave(); 
            
            return "✅ [성공] KorService2 규격 데이터를 불러와 DB에 저장했습니다!";
        } catch (Exception e) {
            log.error("❌ 데이터 저장 중 오류 발생: ", e);
            return "❌ [실패] 오류 메시지: " + e.getMessage();
        }
    }

    /**
     * 방문자 통계 데이터 저장
     * 호출 예시: http://localhost:8080/api/tour/save-stats
     */
    @GetMapping("/save-stats")
    public String saveVisitorStats() {
        try {
            log.info("📢 DataLabService 통계 데이터 수집 시작");
            tourService.getVisitorStatsAndSave();
            return "✅ [성공] 방문자 통계 데이터를 불러와 DB에 저장했습니다!";
        } catch (Exception e) {
            log.error("❌ 통계 데이터 저장 중 오류 발생: ", e);
            return "❌ [실패] 오류 메시지: " + e.getMessage();
        }
    }
    
    @GetMapping("/list")
    public List<ItemDto> getTourList() {
        return tourService.getSavedTourList();
    }
}
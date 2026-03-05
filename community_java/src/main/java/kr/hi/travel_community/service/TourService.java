package kr.hi.travel_community.service;

import java.net.URI;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import kr.hi.travel_community.mapper.TourMapper;
import kr.hi.travel_community.model.dto.ItemDto;
import kr.hi.travel_community.model.dto.TourResponseDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourMapper tourMapper;
    private final RestTemplate restTemplate;

    // 공통 서비스 키 (사용자 제공 키 적용)
    // 주의: 코드 내에서 직접 사용할 때는 '디코딩된 키'를 사용하는 것이 안전합니다.
    private final String COMMON_SERVICE_KEY = "7bc754a262db3e1a61b0337c5163a04796ab2c65e18d778fd264305dd120a86c";

    /**
     * 공통 설정: 인증키 특수문자 깨짐 및 이중 인코딩 방지
     */
    private void setSafeEncoding() {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        // NONE으로 설정하여 RestTemplate이 내부적으로 URL을 다시 인코딩하지 않도록 합니다.
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
        restTemplate.setUriTemplateHandler(factory);
    }

    /**
     * [기능 1] 관광지 리스트 조회 및 저장 (KorService2 버전 적용)
     * 변경 사항: KorService1 -> KorService2 / areaBasedList1 -> areaBasedList2
     */
    @Transactional
    public void getTourDataAndSave() {
        setSafeEncoding(); // 설정 적용
        
        // 매뉴얼 Ver 4.4에 따른 KorService2 및 areaBasedList2 호출 경로
        URI uri = UriComponentsBuilder
                .fromHttpUrl("http://apis.data.go.kr/B551011/KorService2/areaBasedList2")
                .queryParam("serviceKey", COMMON_SERVICE_KEY) 
                .queryParam("numOfRows", 100)
                .queryParam("pageNo", 1) // 페이지 번호 명시 권장
                .queryParam("_type", "json")
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "TravelApp")
                // build(true)는 이미 인코딩된 키를 보낼 때 사용하며, 
                // setSafeEncoding()과 함께 사용되어 'Unexpected errors'를 방지합니다.
                .build(true).toUri();
	        
	     // 1. API 호출 및 TourResponseDto로 변환
	        TourResponseDto response = restTemplate.getForObject(uri, TourResponseDto.class);
	        
	        // 2. 데이터가 제대로 왔는지 확인 후 DB 저장 루프 실행
	        if (response != null && response.getResponse() != null && response.getResponse().getBody() != null) {
	            List<ItemDto> items = response.getResponse().getBody().getItems().getItem();
	            
	            if (items != null && !items.isEmpty()) {
	                for (ItemDto item : items) {
	                    // Mapper를 호출하여 DB에 하나씩 INSERT
	                    tourMapper.insertTour(item);
	                }
	                System.out.println("✅ 총 " + items.size() + "개의 데이터 저장 완료!");
	            } else {
	                System.out.println("⚠️ 데이터 목록이 비어있습니다.");
	            }
	        } else {
	            System.out.println("❌ API 응답이 올바르지 않습니다.");
	        }
	        
	        
    }

    /**
     * [기능 2] 방문자 통계 (DataLabService)
     * 기존 서비스 유지 (관광공사 데이터랩 API)
     */
    @Transactional
    public void getVisitorStatsAndSave() {
        setSafeEncoding(); // 설정 적용
        
        // 날짜 파라미터는 프로젝트 목적에 맞게 2024년 혹은 2025년 등으로 조정 가능
        URI uri = UriComponentsBuilder
                .fromHttpUrl("https://apis.data.go.kr/B551011/DataLabService/locgoRegnVisitrDDList")
                .queryParam("serviceKey", COMMON_SERVICE_KEY)
                .queryParam("startYmd", "20240101")
                .queryParam("endYmd", "20240101")
                .queryParam("_type", "json")
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "TravelApp")
                .build(true).toUri();

        // StatsApiResponseDTO response = restTemplate.getForObject(uri, StatsApiResponseDTO.class);
        // if (response != null && response.getBody() != null) { ... 저장 로직 ... }
    }
    
    public List<ItemDto> getSavedTourList() {
        return tourMapper.selectTourList();
    }
}
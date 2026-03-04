package kr.hi.travel_community.service;

import kr.hi.travel_community.model.dto.*;
import kr.hi.travel_community.mapper.TourMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourMapper tourMapper;
    private final RestTemplate restTemplate;

    // 두 서비스가 공통으로 사용하는 하나의 키
    private final String COMMON_SERVICE_KEY = "7bc754a262db3e1a61b0337c5163a04796ab2c65e18d778fd264305dd120a86c";

    /**
     * 공통 설정: 인증키 특수문자 깨짐 방지
     */
    private void setSafeEncoding() {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
        restTemplate.setUriTemplateHandler(factory);
    }

    // [기능 1] 관광지 리스트 (KorService1)
    @Transactional
    public void getTourDataAndSave() {
        setSafeEncoding(); // 설정 적용
        URI uri = UriComponentsBuilder
                .fromHttpUrl("http://apis.data.go.kr/B551011/KorService1/areaBasedList1")
                .queryParam("serviceKey", COMMON_SERVICE_KEY) // 공통키 사용
                .queryParam("numOfRows", 100)
                .queryParam("_type", "json")
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "TravelApp")
                .build(true).toUri();
        
        // ... 이하 저장 로직 동일
    }

    // [기능 2] 방문자 통계 (DataLabService)
    @Transactional
    public void getVisitorStatsAndSave() {
        setSafeEncoding(); // 설정 적용
        URI uri = UriComponentsBuilder
                .fromHttpUrl("https://apis.data.go.kr/B551011/DataLabService/locgoRegnVisitrDDList")
                .queryParam("serviceKey", COMMON_SERVICE_KEY) // 공통키 사용
                .queryParam("startYmd", "20240101")
                .queryParam("endYmd", "20240101")
                .queryParam("_type", "json")
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "TravelApp")
                .build(true).toUri();

        // ... 이하 저장 로직 동일
    }
}

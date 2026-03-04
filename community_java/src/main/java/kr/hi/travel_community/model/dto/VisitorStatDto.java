package kr.hi.travel_community.model.dto;

import lombok.Data;

@Data
public class VisitorStatDto {
    private String areaCode;    // 지역코드 (예: 11)
    private String areaNm;      // 지역명 (예: 서울특별시)
    private String dayTarget;   // 기준일자 (20240101)
    private String visitorCnt;  // 방문자 수
    private String signguCode;  // 시군구 코드 (필요시)
    private String signguNm;    // 시군구 명 (필요시)
}
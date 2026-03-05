package kr.hi.travel_community.model.dto;

import lombok.Data;

@Data
public class ItemDto {
    private String title;          // 제목
    private String addr1;          // 주소
    private String addr2;          // 상세주소
    private String firstimage;     // 원본 이미지 URL
    private String firstimage2;    // 썸네일 이미지 URL
    private String contentid;      // 콘텐츠 ID (고유번호)
    private String contenttypeid;  // 콘텐츠 타입 ID
    private String mapx;           // GPS X좌표 (경도)
    private String mapy;           // GPS Y좌표 (위도)
    private String mlevel;         // 지역코드
    private String tel;            // 전화번호
    private String zipcode;        // 우편번호
}
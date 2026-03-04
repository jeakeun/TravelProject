package kr.hi.travel_community.mapper;

import org.apache.ibatis.annotations.Mapper;

import kr.hi.travel_community.model.dto.ItemDto;
import kr.hi.travel_community.model.dto.VisitorStatDto;

@Mapper
public interface TourMapper {
    // API로 가져온 데이터를 DB에 하나씩 넣는 기능
    void insertTour(ItemDto item);
    void insertVisitorStat(VisitorStatDto dto); // 방문자 통계용 (새로 추가)
}
package kr.hi.travel_community.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.hi.travel_community.model.dto.ItemDto;
import kr.hi.travel_community.model.dto.VisitorStatDto;

@Mapper
public interface TourMapper {
    // API로 가져온 데이터를 DB에 하나씩 넣는 기능
    void insertTour(ItemDto item);
    void insertVisitorStat(VisitorStatDto dto); // 방문자 통계용 (새로 추가)
    // 화면에 뿌리기 위해 새로 추가하는 select
    List<ItemDto> selectTourList();
}
package kr.hi.travel_community.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LikeMapper {
    // 추천 여부 확인
    int checkLikeStatus(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);

    // 추천 로그 추가 (li_id에 poNum이 들어감)
    void insertLikeLog(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);

    // 추천 로그 삭제
    void deleteLikeLog(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);
}
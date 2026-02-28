package kr.hi.travel_community.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LikeMapper {
    // === 추천(Like) 관련 ===
    
    // 추천 여부 확인
    int checkLikeStatus(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);

    // 추천 로그 추가 (li_id에 poNum이 들어감)
    // 🚩 [보완] void를 int로 변경하여 성공 시 1을 반환받도록 설정 (선택 사항이나 권장)
    int insertLikeLog(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);

    // 추천 로그 삭제
    int deleteLikeLog(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);

    // === 즐겨찾기(Scrap) 관련 추가 ===

    // 스크랩 여부 확인
    int checkScrapStatus(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);

    // 스크랩 로그 추가
    int insertScrapLog(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);

    // 스크랩 로그 삭제
    int deleteScrapLog(@Param("poNum") Integer poNum, @Param("mbNum") Integer mbNum);
}
package kr.hi.travel_community.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import kr.hi.travel_community.model.dto.RecommendDTO;

@Mapper
public interface RecommendPostMapper {
    int checkHistory(@Param("poNum") int poNum, @Param("mbNum") int mbNum);
    void updateViewCount(int poNum);
    void insertHistory(@Param("poNum") int poNum, @Param("mbNum") int mbNum);
    RecommendDTO getPostById(int poNum);
    List<RecommendDTO> getPostList(int cgNum);
}
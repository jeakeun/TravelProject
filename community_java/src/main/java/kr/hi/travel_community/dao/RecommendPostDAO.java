package kr.hi.travel_community.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.travel_community.model.dto.RecommendDTO;

@Mapper
public interface RecommendPostDAO {

    int checkHistory(@Param("poNum") int poNum, @Param("mbNum") int mbNum);

    void updateViewCount(@Param("poNum") int poNum);

    void insertHistory(@Param("poNum") int poNum, @Param("mbNum") int mbNum);

    RecommendDTO getPostById(@Param("poNum") int poNum);

    List<RecommendDTO> getPostList(@Param("cgNum") int cgNum);
}
package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.BookMark; // 엔티티 클래스명이 BookMark인지 확인
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookMarkRepository extends JpaRepository<BookMark, Integer> {

    // 1. 마이페이지 목록 조회 (최신순)
    List<BookMark> findByBmMbNumOrderByBmNumDesc(Integer bmMbNum);

    // 2. 토글용 존재 확인
    Optional<BookMark> findByBmMbNumAndBmPoNumAndBmPoType(Integer bmMbNum, Integer bmPoNum, String bmPoType);

    // 3. 존재 여부 확인 (필요시 사용)
    boolean existsByBmMbNumAndBmPoNumAndBmPoType(Integer bmMbNum, Integer bmPoNum, String bmPoType);
}
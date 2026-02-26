package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.BookMark; 
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

    // 3. 존재 여부 확인
    boolean existsByBmMbNumAndBmPoNumAndBmPoType(Integer bmMbNum, Integer bmPoNum, String bmPoType);

    /**
     * 🚩 [추가] 점수 계산을 위한 특정 게시글의 즐겨찾기 총 개수 조회
     * 서비스 레이어의 빨간 줄을 해결하기 위해 반드시 필요합니다.
     */
    long countByBmPoNumAndBmPoType(Integer bmPoNum, String bmPoType);
}
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

    // 3. 존재 여부 확인 (MypageController 등에서 사용)
    boolean existsByBmMbNumAndBmPoNumAndBmPoType(Integer bmMbNum, Integer bmPoNum, String bmPoType);

    /**
     * 🚩 [추가] RecommendPostService의 빨간 줄 해결을 위한 메서드
     * 서비스에서 호출하는 이름과 매개변수 순서를 일치시켰습니다.
     */
    boolean existsByBmPoNumAndBmPoTypeAndBmMbNum(Integer bmPoNum, String bmPoType, Integer bmMbNum);

    /**
     * 🚩 점수 계산을 위한 특정 게시글의 즐겨찾기 총 개수 조회
     */
    long countByBmPoNumAndBmPoType(Integer bmPoNum, String bmPoType);
}
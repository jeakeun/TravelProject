package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Event; // EventPost 대신 Event 임포트
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> { // 엔티티 타입 변경

    // 1. 삭제되지 않은 게시글 전체 조회 (최신순)
    List<Event> findByPoDelOrderByPoNumDesc(String poDel);

    // 2. 특정 게시글 상세 조회 (삭제되지 않은 상태 확인)
    Optional<Event> findByPoNumAndPoDel(Integer poNum, String poDel);

    // 3. 조회수 증가 (Native Query 활용 - 테이블명은 DB와 일치하는 event_post 유지)
    @Modifying
    @Query(value = "UPDATE event_post SET po_view = po_view + 1 WHERE po_num = :poNum", nativeQuery = true)
    int updateViewCount(@Param("poNum") Integer poNum);

    // 4. 검색 기능: 제목에 키워드 포함 + 삭제 안 된 글
    List<Event> findByPoTitleContainingAndPoDelOrderByPoNumDesc(String keyword, String poDel);

    // 5. 검색 기능: 내용에 키워드 포함 + 삭제 안 된 글
    List<Event> findByPoContentContainingAndPoDelOrderByPoNumDesc(String keyword, String poDel);

    // 6. 검색 기능: 제목 또는 내용에 키워드 포함 (JPQL 활용 - 엔티티명 Event로 수정)
    @Query("SELECT e FROM Event e WHERE (e.poTitle LIKE %:keyword% OR e.poContent LIKE %:keyword%) AND e.poDel = :poDel ORDER BY e.poNum DESC")
    List<Event> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);
}
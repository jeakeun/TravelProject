package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Event; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {

    /**
     * 🚩 1. 삭제되지 않은 게시글 전체 조회 (최신순)
     */
    List<Event> findByPoDelOrderByPoNumDesc(String poDel);

    /**
     * 🚩 1-1. 게시판 타입별 조회 (이벤트/뉴스레터 분리용)
     */
    List<Event> findByPoTypeAndPoDelOrderByPoNumDesc(String poType, String poDel);

    /**
     * 🚩 2. 특정 게시글 상세 조회 (삭제되지 않은 상태 확인)
     */
    Optional<Event> findByPoNumAndPoDel(Integer poNum, String poDel);

    /**
     * 🚩 3. 조회수 증가 (JPQL 방식)
     * Native Query의 테이블명 의존성을 없애고 엔티티 기준으로 안전하게 업데이트합니다.
     */
    @Modifying
    @Transactional
    @Query("UPDATE Event e SET e.poView = COALESCE(e.poView, 0) + 1 WHERE e.poNum = :poNum AND e.poDel = 'N'")
    int updateViewCount(@Param("poNum") Integer poNum);

    /**
     * 🚩 4. 검색 기능: 제목에 키워드 포함 + 삭제 안 된 글
     */
    List<Event> findByPoTitleContainingAndPoDelOrderByPoNumDesc(String keyword, String poDel);

    /**
     * 🚩 4-1. 타입별 검색: 제목
     */
    List<Event> findByPoTypeAndPoTitleContainingAndPoDelOrderByPoNumDesc(String poType, String keyword, String poDel);

    /**
     * 🚩 5. 검색 기능: 내용에 키워드 포함 + 삭제 안 된 글
     */
    List<Event> findByPoContentContainingAndPoDelOrderByPoNumDesc(String keyword, String poDel);

    /**
     * 🚩 5-1. 타입별 검색: 내용
     */
    List<Event> findByPoTypeAndPoContentContainingAndPoDelOrderByPoNumDesc(String poType, String keyword, String poDel);

    /**
     * 🚩 6. 검색 기능: 제목 또는 내용에 키워드 포함 (JPQL)
     */
    @Query("SELECT e FROM Event e WHERE (e.poTitle LIKE %:keyword% OR e.poContent LIKE %:keyword%) AND e.poDel = :poDel ORDER BY e.poNum DESC")
    List<Event> findByTitleOrContent(@Param("keyword") String keyword, @Param("poDel") String poDel);

    /**
     * 🚩 6-1. 타입별 검색: 제목 또는 내용 (JPQL)
     */
    @Query("SELECT e FROM Event e WHERE e.poType = :poType AND (e.poTitle LIKE %:keyword% OR e.poContent LIKE %:keyword%) AND e.poDel = :poDel ORDER BY e.poNum DESC")
    List<Event> findByPoTypeAndTitleOrContent(@Param("poType") String poType, @Param("keyword") String keyword, @Param("poDel") String poDel);
}
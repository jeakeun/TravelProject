package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Post;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {

    // 🚩 [수정] DB에 po_seq 컬럼이 없으므로 findMaxSeq... 및 findByPoCgNumAndPoSeq는 삭제합니다.
    // 상세 조회의 경우 JpaRepository가 제공하는 기본 메서드인 findById(Integer id)를 사용하면 됩니다.

    // 조회수 증가 (po_num 기준)
    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.poView = p.poView + 1 WHERE p.poNum = :id")
    void updateViewCount(@Param("id") Integer id);
}
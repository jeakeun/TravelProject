package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.NoticePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeRepository extends JpaRepository<NoticePost, Integer> {

    // DDL의 nn_num과 nn_del 컬럼에 맞춰 수정
    Optional<NoticePost> findByNnNumAndNnDel(Integer nnNum, String nnDel);

    // 공지사항 목록 조회 (삭제되지 않은 데이터를 최신순으로)
    List<NoticePost> findByNnDelOrderByNnNumDesc(String nnDel);

    @Modifying
    @Transactional
    // DDL의 nn_view, nn_num, nn_del 필드명에 맞춰 쿼리 수정
    @Query("UPDATE NoticePost p SET p.nnView = COALESCE(p.nnView, 0) + 1 WHERE p.nnNum = :id AND p.nnDel = 'N'")
    int updateViewCount(@Param("id") Integer id);
}
package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Integer> {

    // 삭제되지 않은 특정 게시글 상세 조회
    Optional<Notice> findByNnNumAndNnDel(Integer nnNum, String nnDel);

    // 공지사항 목록 조회 (삭제되지 않은 데이터를 최신순으로)
    List<Notice> findByNnDelOrderByNnNumDesc(String nnDel);

    @Modifying
    @Transactional
    @Query("UPDATE Notice p SET p.nnView = COALESCE(p.nnView, 0) + 1 WHERE p.nnNum = :id AND p.nnDel = 'N'")
    int updateViewCount(@Param("id") Integer id);
}
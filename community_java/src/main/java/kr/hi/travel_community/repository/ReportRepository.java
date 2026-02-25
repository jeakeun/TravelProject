package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.ReportBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<ReportBox, Integer> {

    long countByRbIdAndRbName(Integer rbId, String rbName);

    /** 해당 회원이 이미 해당 게시글/댓글을 신고했는지 확인 */
    boolean existsByRbIdAndRbNameAndRbMbNum(Integer rbId, String rbName, Integer rbMbNum);

    List<ReportBox> findAllByOrderByRbNumDesc();

    List<ReportBox> findByRbMbNumOrderByRbNumDesc(Integer rbMbNum);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE report_box SET rb_reply = :reply WHERE rb_num = :rbNum", nativeQuery = true)
    int updateReply(@Param("rbNum") Integer rbNum, @Param("reply") String reply);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE report_box SET rb_manage = :manage WHERE rb_num = :rbNum", nativeQuery = true)
    int updateManage(@Param("rbNum") Integer rbNum, @Param("manage") String manage);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE report_box SET rb_seen = 'Y' WHERE rb_num = :rbNum AND rb_mb_num = :mbNum", nativeQuery = true)
    int markSeen(@Param("rbNum") Integer rbNum, @Param("mbNum") Integer mbNum);
}
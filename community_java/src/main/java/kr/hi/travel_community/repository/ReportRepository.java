package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.ReportBox;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<ReportBox, Integer> {

    long countByRbIdAndRbName(Integer rbId, String rbName);

    /** 해당 회원이 이미 해당 게시글/댓글을 신고했는지 확인 */
    boolean existsByRbIdAndRbNameAndRbMbNum(Integer rbId, String rbName, Integer rbMbNum);

    List<ReportBox> findAllByOrderByRbNumDesc();

    List<ReportBox> findByRbMbNumOrderByRbNumDesc(Integer rbMbNum);
}
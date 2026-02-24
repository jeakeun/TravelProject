package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.ReportBox;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<ReportBox, Integer> {

    long countByRbIdAndRbName(Integer rbId, String rbName);

    List<ReportBox> findAllByOrderByRbNumDesc();

    List<ReportBox> findByRbMbNumOrderByRbNumDesc(Integer rbMbNum);
}
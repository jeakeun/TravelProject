package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.ReportBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<ReportBox, Integer> {

    /**
     * 🚩 신고 누적 카운팅을 위한 쿼리 메서드 추가
     * rb_id(게시글 번호)와 rb_name(구분값, 예: 'post')이 일치하는 행의 개수를 반환합니다.
     */
    long countByRbIdAndRbName(Integer rbId, String rbName);
    
}
package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.InquiryBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<InquiryBox, Integer> {

    List<InquiryBox> findAllByOrderByIbNumDesc();

    List<InquiryBox> findByIbMbNumOrderByIbNumDesc(Integer ibMbNum);
}

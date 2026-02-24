package kr.hi.travel_community.repository;

import kr.hi.travel_community.entity.InquiryBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<InquiryBox, Integer> {

    List<InquiryBox> findAllByOrderByIbNumDesc();

    List<InquiryBox> findByIbMbNumOrderByIbNumDesc(Integer ibMbNum);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE inquiry_box SET ib_reply = :reply, ib_status = 'Y' WHERE ib_num = :ibNum", nativeQuery = true)
    int updateReplyAndStatus(@Param("ibNum") Integer ibNum, @Param("reply") String reply);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE inquiry_box SET ib_status = :status WHERE ib_num = :ibNum", nativeQuery = true)
    int updateStatus(@Param("ibNum") Integer ibNum, @Param("status") String status);
}

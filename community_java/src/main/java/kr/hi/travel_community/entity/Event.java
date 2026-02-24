package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_post") // 파일명은 Event여도 DB 테이블은 event_post와 매핑
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_num")
    private Integer poNum; // 게시글 번호 (PK)

    @Column(name = "po_title", nullable = false)
    private String poTitle; // 제목

    @Column(name = "po_content", nullable = false, columnDefinition = "LONGTEXT")
    private String poContent; // 내용

    @Column(name = "po_img")
    private String poImg; // 이미지 파일명들 (콤마로 구분 저장)

    @Column(name = "po_date")
    private LocalDateTime poDate; // 작성일

    @Column(name = "po_view")
    private Integer poView; // 조회수

    @Column(name = "po_up")
    private Integer poUp; // 추천수 (좋아요)

    @Column(name = "po_down")
    private Integer poDown; // 비추천수

    @Column(name = "po_report")
    private Integer poReport; // 신고수

    @Column(name = "po_del")
    private String poDel; // 삭제 여부 ('N' 또는 'Y')

    @Column(name = "po_mb_num")
    private Integer poMbNum; // 작성자 회원 번호
}
package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_num")
    private Integer poNum;      // DB Primary Key

    // 🚩 [수정] DB 스키마에 없으므로 poSeq 필드 완전 제거

    @Column(name = "po_cg_num")
    private Integer poCgNum;    // 카테고리 ID (1: 추천, 2: 후기, 3: 자유)

    @Column(name = "po_mb_num")
    private Integer poMbNum;    // 작성자 회원 ID

    @Column(name = "po_title", nullable = false)
    private String poTitle;     // 제목

    @Column(name = "po_content", columnDefinition = "LONGTEXT", nullable = false)
    private String poContent;   // 내용

    @Column(name = "po_view")
    private Integer poView = 0; // 조회수

    @Column(name = "po_up")
    private Integer poUp = 0;   // 추천수

    @Column(name = "po_down")
    private Integer poDown = 0; // 비추천수

    @Column(name = "po_del")
    private String poDel = "N"; // 삭제 여부 'Y'/'N'

    @Column(name = "po_date")
    private LocalDateTime poDate = LocalDateTime.now(); // 작성일

    // 🚩 [참고] fileUrl이 post 테이블에 컬럼으로 없다면 @Transient 처리
    // 만약 별도의 photo 테이블에서 가져온다면 이 필드는 유지하되 DB 연동에서 제외합니다.
    @Transient
    private String fileUrl;     

    @Transient
    private Integer commentCount; // 댓글 수 (실시간 계산용)
}
package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 🚩 자주 묻는 질문(FAQ) 엔티티
 * DB의 faq_post 테이블과 매핑됩니다.
 */
@Entity
@Table(name = "faq_post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_num")
    private Integer poNum; // 게시글 번호 (PK)

    @Column(name = "po_title", nullable = false, length = 100)
    private String poTitle; // 제목

    @Column(name = "po_content", nullable = false, columnDefinition = "LONGTEXT")
    private String poContent; // 내용

    @Column(name = "po_img", length = 1000)
    private String poImg; // 이미지 파일명 (필요 시 사용)

    @Column(name = "po_date")
    private LocalDateTime poDate; // 작성일

    @Column(name = "po_view", columnDefinition = "int default 0")
    private Integer poView; // 조회수

    @Column(name = "po_up", columnDefinition = "int default 0")
    private Integer poUp; // 추천수

    @Column(name = "po_down", columnDefinition = "int default 0")
    private Integer poDown; // 비추천수 (기본 필드 유지)

    @Column(name = "po_report", columnDefinition = "int default 0")
    private Integer poReport; // 신고수 (기본 필드 유지)

    @Column(name = "po_del", length = 1, columnDefinition = "char(1) default 'N'")
    private String poDel; // 삭제 여부 ('N' 또는 'Y')

    @Column(name = "po_mb_num")
    private Integer poMbNum; // 작성자 회원 번호 (관리자)

    /**
     * 🚩 저장 전 초기값 설정
     */
    @PrePersist
    public void prePersist() {
        if (this.poView == null) this.poView = 0;
        if (this.poUp == null) this.poUp = 0;
        if (this.poDown == null) this.poDown = 0;
        if (this.poReport == null) this.poReport = 0;
        if (this.poDel == null) this.poDel = "N";
        if (this.poDate == null) this.poDate = LocalDateTime.now();
    }
}
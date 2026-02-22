package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_post")
@Data // Lombok이 Getter, Setter, toString 등을 자동으로 생성합니다.
public class ReviewPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_num")
    private Integer poNum;

    @Column(name = "po_title", nullable = false, length = 100)
    private String poTitle;

    @Column(name = "po_content", nullable = false, columnDefinition = "LONGTEXT")
    private String poContent;

    @Column(name = "po_date", nullable = false, updatable = false)
    private LocalDateTime poDate;

    @Column(name = "po_view", nullable = false)
    private Integer poView = 0;

    @Column(name = "po_up", nullable = false)
    private Integer poUp = 0;

    @Column(name = "po_down", nullable = false)
    private Integer poDown = 0;

    @Column(name = "po_report", nullable = false)
    private Integer poReport = 0;

    @Column(name = "po_del", nullable = false, length = 1)
    private String poDel = "N";

    @Column(name = "po_mb_num", nullable = false)
    private Integer poMbNum;

    // [핵심 수정] DB의 po_img 컬럼과 매핑을 일치시킵니다.
    @Column(name = "po_img", length = 100)
    private String poImg;

    @PrePersist
    public void prePersist() {
        if (this.poDate == null) this.poDate = LocalDateTime.now();
        if (this.poView == null) this.poView = 0;
        if (this.poUp == null) this.poUp = 0;
        if (this.poDown == null) this.poDown = 0;
        if (this.poReport == null) this.poReport = 0;
        if (this.poDel == null) this.poDel = "N";
    }
}
package kr.hi.travel_community.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "free_post")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "member")
public class FreePost {

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

    @Builder.Default
    @Column(name = "po_view", nullable = false)
    private Integer poView = 0;

    @Builder.Default
    @Column(name = "po_up", nullable = false)
    private Integer poUp = 0;

    @Builder.Default
    @Column(name = "po_down", nullable = false)
    private Integer poDown = 0;

    @Builder.Default
    @Column(name = "po_report", nullable = false)
    private Integer poReport = 0;

    @Builder.Default
    @Column(name = "po_del", nullable = false, length = 1)
    private String poDel = "N";

    @Column(name = "po_mb_num")
    private Integer poMbNum;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "po_mb_num", insertable = false, updatable = false)
    private Member member; 

    @Column(name = "po_img", length = 1000)
    private String fileUrl;

    /**
     * 🚩 데이터 저장 전 실행되는 로직
     * 서비스에서 깜빡하고 세팅하지 않은 기본값들을 한 번 더 검증함
     */
    @PrePersist
    public void prePersist() {
        if (this.poDate == null) {
            this.poDate = LocalDateTime.now();
        }
        if (this.poView == null) this.poView = 0;
        if (this.poUp == null) this.poUp = 0;
        if (this.poDown == null) this.poDown = 0;
        if (this.poReport == null) this.poReport = 0;
        if (this.poDel == null) this.poDel = "N";
    }

    /**
     * 🚩 데이터 수정 시 실행 (선택 사항)
     * 수정 시에도 null 값이 들어오지 않도록 방어
     */
    @PreUpdate
    public void preUpdate() {
        if (this.poView == null) this.poView = 0;
        if (this.poUp == null) this.poUp = 0;
        if (this.poReport == null) this.poReport = 0;
    }
}
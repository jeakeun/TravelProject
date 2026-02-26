package kr.hi.travel_community.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "free_post")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "member") // 🚩 중요: 무한 루프 에러 방지
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

    /**
     * 🚩 JoinColumn과 충돌하지 않도록 설정 추가
     */
    @Column(name = "po_mb_num", insertable = false, updatable = false)
    private Integer poMbNum;

    /**
     * 작성자 정보 조인
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "po_mb_num")
    private Member member; 

    @Column(name = "po_img", length = 1000)
    private String fileUrl;

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
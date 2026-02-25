package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "free_post")
@Data
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

    /**
     * 🚩 [수정] 외부 저장 파일명 보관 필드
     * 서비스 클래스에서 사용하는 변수명(fileUrl)을 유지하되, 
     * DB 컬럼명은 po_img로 매핑하고 길이를 1000자로 확장했습니다.
     */
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
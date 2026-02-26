package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "free_post")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    // 초기값 0을 필드 선언 시 할당하여 DB/JPA 양쪽에서 안전하게 관리합니다.
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

    /**
     * MemberVO의 mb_num이 int 타입이므로 Integer로 선언하여
     * null 체크와 MyBatis 연동 시 타입 불일치 에러를 방지합니다.
     */
    @Column(name = "po_mb_num", nullable = false)
    private Integer poMbNum;

    /**
     * [유지] DB 컬럼명은 po_img, 자바 필드명은 서비스와 호환되는 fileUrl
     */
    @Column(name = "po_img", length = 1000)
    private String fileUrl;

    /**
     * 저장 전 null 방지 로직 유지
     */
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
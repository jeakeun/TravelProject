package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommend_post")
@Getter 
@Setter 
@NoArgsConstructor 
public class RecommendPost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_num")
    private Integer poNum;

    @Column(name = "po_title", nullable = false, length = 100)
    private String poTitle;
    
    @Column(name = "po_content", columnDefinition = "LONGTEXT", nullable = false)
    private String poContent;
    
    /**
     * 🚩 [유지] po_img: 서버 외부 폴더에 저장된 파일명들을 보관 (최대 1000자)
     */
    @Column(name = "po_img", length = 1000)
    private String poImg;

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

    /**
     * 🚩 작성자 고유 번호 (member 테이블의 mb_num 참조)
     */
    @Column(name = "po_mb_num", nullable = false)
    private Integer poMbNum;

    /**
     * 🚩 [유지] 비즈니스 로직용 필드 (DB 저장 안 됨)
     */
    @Transient 
    private boolean isLikedByMe; 

    /**
     * 🚩 데이터 저장 전 실행되는 로직
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
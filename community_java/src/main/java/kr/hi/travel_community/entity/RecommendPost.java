package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommend_post")
@Getter // Lombok: Getter 자동 생성
@Setter // Lombok: Setter 자동 생성
@NoArgsConstructor // Lombok: 기본 생성자 자동 생성
public class RecommendPost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_num")
    private Integer poNum;

    @Column(name = "po_title", nullable = false, length = 100)
    private String poTitle;
    
    @Column(name = "po_content", columnDefinition = "LONGTEXT", nullable = false)
    private String poContent;
    
    @Column(name = "po_date")
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
     * 🚩 [핵심 수정] po_img 길이 대폭 확장
     * UUID(36자) + 확장자(4자) + 콤마(1자) = 사진당 약 41자 소요
     * 1000자로 설정하여 약 20장 이상의 사진 파일명도 안전하게 보관 가능하게 합니다.
     */
    @Column(name = "po_img", length = 1000) 
    private String poImg; 

    @Transient // DB 테이블에 저장되지 않는 필드
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
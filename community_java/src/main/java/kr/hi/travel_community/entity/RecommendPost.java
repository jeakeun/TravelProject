package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommend_post") // 추천 게시판 전용 테이블
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

    // [핵심 수정] DB의 po_img 컬럼과 매핑
    @Column(name = "po_img", length = 100)
    private String poImg; 

    @Transient // DB 테이블에 없는 필드이므로 영속성 제외
    private boolean isLikedByMe; 

    @PrePersist
    public void prePersist() {
        if (this.poView == null) this.poView = 0;
        if (this.poUp == null) this.poUp = 0;
        if (this.poDown == null) this.poDown = 0;
        if (this.poReport == null) this.poReport = 0;
        if (this.poDel == null) this.poDel = "N";
        if (this.poDate == null) this.poDate = LocalDateTime.now();
    }

    public RecommendPost() {}

    // ================= Getter & Setter =================
    
    public Integer getPoNum() { return poNum; }
    public void setPoNum(Integer poNum) { this.poNum = poNum; }

    public String getPoTitle() { return poTitle; }
    public void setPoTitle(String poTitle) { this.poTitle = poTitle; }

    public String getPoContent() { return poContent; }
    public void setPoContent(String poContent) { this.poContent = poContent; }

    public LocalDateTime getPoDate() { return poDate; }
    public void setPoDate(LocalDateTime poDate) { this.poDate = poDate; }

    public Integer getPoView() { return poView; }
    public void setPoView(Integer poView) { this.poView = poView; }

    public Integer getPoUp() { return poUp; }
    public void setPoUp(Integer poUp) { this.poUp = poUp; }

    public Integer getPoDown() { return poDown; }
    public void setPoDown(Integer poDown) { this.poDown = poDown; }

    public Integer getPoReport() { return poReport; }
    public void setPoReport(Integer poReport) { this.poReport = poReport; }

    public String getPoDel() { return poDel; }
    public void setPoDel(String poDel) { this.poDel = poDel; }

    public Integer getPoMbNum() { return poMbNum; }
    public void setPoMbNum(Integer poMbNum) { this.poMbNum = poMbNum; }

    // [수정된 Getter/Setter] 필드명 변경에 대응
    public String getPoImg() { return poImg; }
    public void setPoImg(String poImg) { this.poImg = poImg; }

    public boolean isLikedByMe() { return isLikedByMe; }
    public void setLikedByMe(boolean isLikedByMe) { this.isLikedByMe = isLikedByMe; }
}
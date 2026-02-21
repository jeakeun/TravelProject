package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "post")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer poNum;

    @Column(nullable = false)
    private String poTitle;
    
    @Column(columnDefinition = "LONGTEXT")
    private String poContent;
    
    private LocalDateTime poDate;
    
    // 초기값이 null이 되지 않도록 보장 (조회수, 추천수 등)
    private Integer poView = 0; 
    private Integer poUp = 0;   
    private Integer poDown = 0; 
    
    @Column(name = "po_report")
    private Integer poReport = 0;

    @Column(name = "po_del")
    private String poDel = "N"; 

    private Integer poCgNum;
    private Integer poMbNum;

    @Column(name = "file_url")
    private String fileUrl; 

    @Transient
    private boolean isLikedByMe; 

    // 🚩 JPA 라이프사이클 이벤트를 사용하여 데이터 저장 전 null 방지
    @PrePersist
    public void prePersist() {
        if (this.poView == null) this.poView = 0;
        if (this.poUp == null) this.poUp = 0;
        if (this.poDown == null) this.poDown = 0;
        if (this.poReport == null) this.poReport = 0;
        if (this.poDel == null) this.poDel = "N";
        if (this.poDate == null) this.poDate = LocalDateTime.now();
    }

    public Post() {}

    // Getter & Setter
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
    public Integer getPoCgNum() { return poCgNum; }
    public void setPoCgNum(Integer poCgNum) { this.poCgNum = poCgNum; }
    public Integer getPoMbNum() { return poMbNum; }
    public void setPoMbNum(Integer poMbNum) { this.poMbNum = poMbNum; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public boolean isIsLikedByMe() { return isLikedByMe; }
    public void setIsLikedByMe(boolean isLikedByMe) { this.isLikedByMe = isLikedByMe; }
}
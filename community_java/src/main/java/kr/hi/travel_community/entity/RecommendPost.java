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
     * 🚩 [추가/유지] 비즈니스 로직용 필드 (DB 저장 안 됨)
     * isLikedByMe: 현재 로그인 유저의 좋아요 여부
     * isBookmarkedByMe: 현재 로그인 유저의 즐겨찾기 여부 (추가됨)
     * score: 실시간 계산된 랭킹 점수
     */
    @Transient 
    private boolean isLikedByMe; 

    @Transient
    private boolean isBookmarkedByMe; // 🚩 즐겨찾기 여부 필드 추가

    @Transient
    private Integer score; // 랭킹 산정용 점수 필드 추가

    /**
     * 🚩 데이터 저장 전 실행되는 로직 (기본값 세팅)
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

    /**
     * 🚩 [추가] 실시간 점수 계산 로직
     * 서비스에서 호출하여 score 필드를 채울 때 사용합니다.
     * 공식: 조회수(1) + 추천(1) + 즐겨찾기(1) + 댓글(1)
     */
    public void calculateScore(long commentCount, long bookmarkCount) {
        int v = (this.poView != null) ? this.poView : 0;
        int u = (this.poUp != null) ? this.poUp : 0;
        
        // 추천 취소, 댓글 삭제, 즐겨찾기 취소는 
        // 서비스에서 넘어오는 파라미터(u, commentCount, bookmarkCount)가 
        // 이미 줄어든 상태이므로 합산만 하면 감점 효과가 발생합니다.
        this.score = v + u + (int)commentCount + (int)bookmarkCount;
    }
}
package kr.hi.travel_community.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 공지사항 게시판 엔티티
 * 클래스명을 NoticePost로 변경하여 서비스/컨트롤러 계층과 일치시켰습니다.
 */
@Entity
@Table(name = "notice_post")
@Data
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nn_num")
    private Integer nnNum;

    @Column(name = "nn_title", nullable = false, length = 100)
    private String nnTitle;

    @Column(name = "nn_content", nullable = false, columnDefinition = "LONGTEXT")
    private String nnContent;

    @Column(name = "nn_date", nullable = false, updatable = false)
    private LocalDateTime nnDate;

    @Column(name = "nn_view")
    private Integer nnView = 0;

    @Column(name = "nn_up")
    private Integer nnUp = 0;

    @Column(name = "nn_down")
    private Integer nnDown = 0;

    @Column(name = "nn_report")
    private Integer nnReport = 0;

    @Column(name = "nn_del")
    private String nnDel = "N";

    @Column(name = "nn_mb_num", nullable = false)
    private Integer nnMbNum;

    @Column(name = "file_url")
    private String fileUrl;

    // 🚩 [유지] 데이터 저장 전 기본값 설정 로직
    @PrePersist
    public void prePersist() {
        if (this.nnDate == null) this.nnDate = LocalDateTime.now();
        if (this.nnView == null) this.nnView = 0;
        if (this.nnUp == null) this.nnUp = 0;
        if (this.nnDown == null) this.nnDown = 0;
        if (this.nnReport == null) this.nnReport = 0;
        if (this.nnDel == null) this.nnDel = "N";
    }
}
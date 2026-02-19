package kr.hi.travel_community.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@Table(name = "post")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_num")
    private Integer postId; 

    @Column(name = "po_mb_num", nullable = false)
    private Integer userId; 

    @Column(name = "po_cg_num", nullable = false)
    private Integer categoryId; 

    @Column(name = "po_title", length = 100, nullable = false)
    private String title;

    @Column(name = "po_content", nullable = false)
    private String content;

    @Column(name = "po_view")
    private Integer viewCount = 0;

    @Column(name = "po_del", length = 1)
    private String status = "N";

    // 🚩 작성 시간: @CreationTimestamp로 서버 시간 자동 할당
    @CreationTimestamp
    @Column(name = "po_date", updatable = false)
    private LocalDateTime createdAt;

    // 🚩 댓글 수: @Formula를 사용하여 실시간으로 DB에서 계산
    @Formula("(SELECT count(1) FROM comment c WHERE c.co_po_num = po_num AND c.co_del = 'N')")
    private int commentCount;

    // 🚩 핵심 수정: @Transient 제거 -> DB 컬럼(po_file)으로 매핑하여 이미지 경로 저장
    // 업로드한 파일의 이름이나 경로를 DB에 보존해야 리액트에서 불러올 수 있습니다.
    @Column(name = "po_file") 
    private String fileUrl; 

    @Transient
    private String category; 
}
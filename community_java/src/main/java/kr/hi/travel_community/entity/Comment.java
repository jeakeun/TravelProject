package kr.hi.travel_community.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@Table(name = "comment")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "co_num")
    private Integer id;

    @Column(name = "co_content", nullable = false)
    private String content;

    @CreationTimestamp
    @Column(name = "co_date", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "co_like")
    private Integer likes = 0;

    @Column(name = "co_del")
    private String isDel = "N";

    @Column(name = "co_po_num", nullable = false)
    private Integer postId;

    @Column(name = "co_mb_num", nullable = false)
    private Integer userId;

    @Column(name = "co_ori_num")
    private Integer parentId;
}
package kr.hi.travel_community.model.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CommentVO {
	int co_num; 
	String co_content; 
	private LocalDateTime co_date;
	int co_like; 
	char co_del; 
	int co_ori_num; 
	int co_po_num; 
	int co_mb_num;
}

package kr.hi.travel_community.model.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReviewVO {
	int rv_num;
	String rv_content;
	int rv_up;
	int rv_down;
	char rv_del;
	int rv_view;
	private LocalDateTime rv_date;
	int rv_tv_num;
	int rv_mb_num;
}

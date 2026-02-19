package kr.hi.travel_community.model.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class LikesVO {
	int li_num;
	int li_state; 
	int li_id; 
	String li_name;
	private LocalDateTime li_time;
	int li_mb_num;
}

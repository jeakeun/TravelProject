package kr.hi.travel_community.model.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class LiveRankVO {
	int lr_num;
	private LocalDateTime lr_time;
	int lr_ori_num;
	int lr_po_num;
}

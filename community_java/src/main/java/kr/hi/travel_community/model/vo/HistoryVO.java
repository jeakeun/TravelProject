package kr.hi.travel_community.model.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class HistoryVO {
	int ht_num; 
	private LocalDateTime ht_time;
	int ht_po_num; 
	int ht_me_num;
}

package kr.hi.travel_community.model.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PostVO {
	int po_num;
	String po_title;
	String po_content;
	private LocalDateTime po_date;
	int po_veiw;
	int po_up;
	int po_down;
	char po_del;
	int po_cg_num;
	int po_mb_num;
}

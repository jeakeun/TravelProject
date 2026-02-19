package kr.hi.travel_community.model.vo;

import lombok.Data;

@Data
public class TravelVO {
	int tv_num;
	String tv_API;
	double tv_lat; 
	double tv_lng;
	public enum tv_geo_status {
	    NO_COORD,
	    READY
	};
	String tv_mapAPI;
	int tv_cg_num;
}

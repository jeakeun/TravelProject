package kr.hi.travel_community.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class VisitorResponseDto {
    private Response response;

    @Data
    public static class Response {
        private Header header;
        private Body body;
    }

    @Data
    public static class Header {
        private String resultCode;
        private String resultMsg;
    }

    @Data
    public static class Body {
        private Items items;
        private int numOfRows;
        private int pageNo;
        private int totalCount;
    }

    @Data
    public static class Items {
        private List<VisitorStatDto> item; // 위에서 만든 VisitorStatDto 리스트
    }
}
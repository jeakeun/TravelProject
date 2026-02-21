package kr.hi.travel_community.model.dto;

import java.util.Date;

public class RecommendDTO {

    private int poNum;
    private String poTitle;
    private String poContent;
    private Date poDate;
    private int poView;
    private int poMbNum;
    private int poCgNum;

    // Getter & Setter
    public int getPoNum() { return poNum; }
    public void setPoNum(int poNum) { this.poNum = poNum; }

    public String getPoTitle() { return poTitle; }
    public void setPoTitle(String poTitle) { this.poTitle = poTitle; }

    public String getPoContent() { return poContent; }
    public void setPoContent(String poContent) { this.poContent = poContent; }

    public Date getPoDate() { return poDate; }
    public void setPoDate(Date poDate) { this.poDate = poDate; }

    public int getPoView() { return poView; }
    public void setPoView(int poView) { this.poView = poView; }

    public int getPoMbNum() { return poMbNum; }
    public void setPoMbNum(int poMbNum) { this.poMbNum = poMbNum; }

    public int getPoCgNum() { return poCgNum; }
    public void setPoCgNum(int poCgNum) { this.poCgNum = poCgNum; }
}
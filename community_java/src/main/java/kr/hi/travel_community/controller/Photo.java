package kr.hi.travel_community.controller;

public class Photo {
    private Long id;
    private String title;
    private String url;

    // 기본 생성자
    public Photo() {}

    // 모든 필드를 포함한 생성자
    public Photo(Long id, String title, String url) {
        this.id = id;
        this.title = title;
        this.url = url;
    }

    // Getter와 Setter (이클립스에서 Alt + Shift + S -> Generate Getters and Setters로 자동 생성 가능)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}

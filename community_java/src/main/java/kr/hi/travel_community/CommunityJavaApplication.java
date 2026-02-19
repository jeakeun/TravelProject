package kr.hi.travel_community;

import org.mybatis.spring.annotation.MapperScan; // 🚩 추가
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("kr.hi.travel_community.dao") // 🚩 DAO 패키지 경로를 명시적으로 스캔
public class CommunityJavaApplication {
    public static void main(String[] args) {
        SpringApplication.run(CommunityJavaApplication.class, args);
    }
}

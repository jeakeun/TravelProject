package kr.hi.travel_community;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories; // 🚩 필수 추가

@SpringBootApplication
// 🚩 1. JPA 레포지토리(PostRepository 등) 구역을 확실히 정해야 MemberRepository 에러가 해결됩니다.
@EnableJpaRepositories(basePackages = "kr.hi.travel_community.repository") 
// 🚩 2. 기존 'dao'와 신규 'mapper' 두 곳을 모두 스캔하도록 { }를 써야 합니다.
@MapperScan(basePackages = {"kr.hi.travel_community.dao", "kr.hi.travel_community.mapper"}) 
public class CommunityJavaApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommunityJavaApplication.class, args);
    }

}
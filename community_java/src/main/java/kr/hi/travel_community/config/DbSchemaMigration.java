package kr.hi.travel_community.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 앱 기동 시 inquiry_box, report_box에 필요한 컬럼이 없으면 추가.
 * 컬럼 존재 여부를 먼저 확인하여 불필요한 WARN 로그 방지.
 */
@Component
@Order(2)
@Slf4j
public class DbSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public DbSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        ensureColumns();
    }

    private void ensureColumns() {
        ensureColumn("inquiry_box", "ib_reply", "TEXT NULL");
        ensureColumn("inquiry_box", "ib_seen", "CHAR(1) NULL DEFAULT 'N'");
        ensureColumn("report_box", "rb_reply", "TEXT NULL");
        ensureColumn("report_box", "rb_manage", "CHAR(1) NULL DEFAULT 'N'");
        ensureColumn("report_box", "rb_seen", "CHAR(1) NULL DEFAULT 'N'");
        ensureColumn("member", "mb_provider", "VARCHAR(20) NULL DEFAULT 'local'");
    }

    private void ensureColumn(String table, String column, String definition) {
        try {
            // 1. 해당 테이블에 해당 컬럼이 이미 존재하는지 쿼리 (INFORMATION_SCHEMA 활용)
            String checkSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                              "WHERE TABLE_SCHEMA = DATABASE() " +
                              "AND TABLE_NAME = ? " +
                              "AND COLUMN_NAME = ?";
            
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, table, column);

            // 2. 컬럼이 없을 때만(0일 때만) ALTER 실행
            if (count != null && count == 0) {
                jdbcTemplate.execute(String.format(
                    "ALTER TABLE %s ADD COLUMN %s %s", table, column, definition
                ));
                log.info("DB 마이그레이션: {}.{} 컬럼이 생성되었습니다.", table, column);
            } else {
                // 이미 존재하면 그냥 넘어감 (로그를 남기고 싶다면 info나 debug 사용)
                log.debug("DB 마이그레이션: {}.{} 컬럼이 이미 존재합니다.", table, column);
            }

        } catch (Exception e) {
            log.error("컬럼 체크 또는 추가 중 알 수 없는 오류 발생 ({}.{}): {}", table, column, e.getMessage());
        }
    }
}
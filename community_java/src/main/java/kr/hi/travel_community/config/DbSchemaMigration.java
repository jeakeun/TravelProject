package kr.hi.travel_community.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 앱 기동 시 inquiry_box, report_box에 필요한 컬럼이 없으면 추가.
 * 컬럼이 이미 있으면 Duplicate column 에러를 무시하고 진행.
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
    }

    private void ensureColumn(String table, String column, String definition) {
        try {
            jdbcTemplate.execute(String.format(
                "ALTER TABLE %s ADD COLUMN %s %s", table, column, definition
            ));
            log.info("DB 마이그레이션: {}.{} 컬럼 추가됨", table, column);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("Duplicate column name") || msg.contains("1060")) {
                log.debug("컬럼 {}.{} 은(는) 이미 존재함", table, column);
            } else if (msg.contains("doesn't exist") || msg.contains("1146")) {
                log.warn("테이블 {} 이(가) 없습니다. 프로젝트 DDL.sql을 먼저 실행하세요.", table);
            } else {
                log.warn("컬럼 추가 실패 {}.{}: {}", table, column, msg);
            }
        }
    }
}

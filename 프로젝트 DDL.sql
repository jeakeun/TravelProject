DROP DATABASE IF EXISTS travel;

CREATE DATABASE travel;

USE travel;

DROP TABLE IF EXISTS `post`;

CREATE TABLE `post` (
	`po_num`	int PRIMARY KEY AUTO_INCREMENT,
	`po_title`	varchar(100) NOT NULL,
	`po_content`	longtext NOT NULL,
	`po_date`	datetime default current_timestamp not	NULL,
	`po_view`	int	NOT NULL DEFAULT 0,
	`po_up`	int	NOT NULL DEFAULT 0,
	`po_down`	int	NOT NULL DEFAULT 0,
	`po_del`	char(1)	NOT NULL DEFAULT "N",
	`po_cg_num`	int	NOT NULL,
	`po_mb_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `comment`;

-- 5. 댓글 테이블 (🚩 핵심 수정: co_ori_num NULL 허용)
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
	`co_num`	int PRIMARY KEY AUTO_INCREMENT,
	`co_content`	text NOT NULL,
	`co_date`	datetime default current_timestamp not	NULL,
	`co_like`	int	NOT NULL DEFAULT 0,
	`co_del`	char(1)	NOT NULL DEFAULT "N",
	`co_ori_num`	int	NULL, -- 🚩 NOT NULL 제거 (NULL 허용)
	`co_po_num`	int	NOT NULL,
	`co_mb_num`	int	NOT NULL,
    FOREIGN KEY (`co_ori_num`) REFERENCES `comment` (`co_num`) ON DELETE CASCADE,
    FOREIGN KEY (`co_po_num`) REFERENCES `post` (`po_num`) ON DELETE CASCADE,
    FOREIGN KEY (`co_mb_num`) REFERENCES `member` (`mb_num`)
);

DROP TABLE IF EXISTS `photo`;

CREATE TABLE `photo` (
	`ph_num`	int PRIMARY KEY AUTO_INCREMENT,
	`ph_ori_name`	varchar(100) NOT NULL,
	`ph_name`	varchar(100) NOT NULL,
	`ph_po_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `live_rank`;

CREATE TABLE `live_rank` (
	`lr_num`	int PRIMARY KEY AUTO_INCREMENT,
	`lr_time`	datetime default current_timestamp not	NULL,
	`lr_ori_num` int NOT NULL,
	`lr_po_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `history`;

CREATE TABLE `history` (
	`ht_num`	int PRIMARY KEY AUTO_INCREMENT,
	`ht_time`	datetime default current_timestamp not	NULL,
	`ht_po_num`	int	NOT NULL,
	`ht_me_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `report_box`;

CREATE TABLE `report_box` (
	`rb_num`	int PRIMARY KEY AUTO_INCREMENT,
	`rb_content`	text NOT NULL,
	`rb_manage`	char(1)	NULL,
	`rb_id`	int	NOT NULL,
	`rb_name`	varchar(10)	NOT NULL,
	`rb_mb_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `travel`;

CREATE TABLE `travel` (
	`tv_num`	int PRIMARY KEY AUTO_INCREMENT,
	`tv_API`	varchar(100) NOT NULL,
	`tv_lat`	DOUBLE NULL,
	`tv_lng`	DOUBLE NULL,
    # NULL이면 지도 API가 실패하거나 깨짐
    # 만약에 좌표가 없으면 NO_COORD가 뜨도록 만듬
    `tv_geo_status` ENUM("NO_COORD", "READY") DEFAULT "NO_COORD",
	`tv_mapAPI`	varchar(100) NOT NULL,
	`tv_cg_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `kind`;

CREATE TABLE `kind` (
	`ki_num`	int PRIMARY KEY AUTO_INCREMENT,
	`ki_name`	varchar(10)	unique NOT NULL
);

DROP TABLE IF EXISTS `member`;

CREATE TABLE `member` (
	`mb_num`	int PRIMARY KEY AUTO_INCREMENT,
	`mb_Uid`	varchar(30)	unique NOT NULL,
	`mb_pw`		varchar(255)	NULL,
	`mb_email`	varchar(50)	NULL,
	`mb_rol`	varchar(10)	default "USER" NOT NULL,
	`mb_score`	int	NOT NULL DEFAULT 0,
	`mb_photo`	varchar(100) NULL,
	`mb_agree`	char(1)	NOT NULL DEFAULT "N"
);

DROP TABLE IF EXISTS `bookmark`;

CREATE TABLE `bookmark` (
	`bm_num`	int PRIMARY KEY AUTO_INCREMENT,
	`bm_po_num`	int	NOT NULL,
	`bm_mb_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `main_photo`;

CREATE TABLE `main_photo` (
	`mp_num`	int PRIMARY KEY AUTO_INCREMENT,
	`mp_name`	varchar(100) NOT NULL,
	`mp_tv_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `category`;

CREATE TABLE `category` (
	`cg_num`	int PRIMARY KEY AUTO_INCREMENT,
	`cg_kind`	varchar(10) unique NOT NULL,
	`cg_display`	char(1) NOT	NULL,
	`cg_bo_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `mark`;

CREATE TABLE `mark` (
	`ma_num`	int PRIMARY KEY AUTO_INCREMENT,
	`ma_score`	int	NOT NULL DEFAULT 0,
	`ma_ki_num`	int	NOT NULL,
	`ma_po_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `review`;

CREATE TABLE `review` (
	`rv_num`	int PRIMARY KEY AUTO_INCREMENT,
	`rv_content`	text NOT NULL,
	`rv_up`	int	NOT NULL DEFAULT 0,
	`rv_down`	int	NOT NULL DEFAULT 0,
	`rv_del`	char(1) NOT	NULL DEFAULT "N",
	`rv_view`	int	NOT NULL DEFAULT 0,
	`rv_date`	datetime default current_timestamp not	NULL,
	`rv_tv_num`	int	NOT NULL,
	`rv_mb_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `likes`;

CREATE TABLE `likes` (
	`li_num`	int PRIMARY KEY AUTO_INCREMENT,
	`li_state`	int	NOT NULL,
	`li_id`	int	NOT NULL,
	`li_name`	varchar(10) NOT	NULL,
	`li_time`	datetime default current_timestamp not	NULL,
	`li_mb_num`	int	NOT NULL
);

DROP TABLE IF EXISTS `board`;

CREATE TABLE `board` (
	`bo_num`	int PRIMARY KEY AUTO_INCREMENT,
	`bo_name`	varchar(100) unique NOT NULL
);


ALTER TABLE `post` ADD CONSTRAINT `FK_category_TO_post_1` FOREIGN KEY (
	`po_cg_num`
)
REFERENCES `category` (
	`cg_num`
);

ALTER TABLE `post` ADD CONSTRAINT `FK_member_TO_post_1` FOREIGN KEY (
	`po_mb_num`
)
REFERENCES `member` (
	`mb_num`
);

ALTER TABLE `comment` ADD CONSTRAINT `FK_comment_TO_comment_1` FOREIGN KEY (
	`co_ori_num`
)
REFERENCES `comment` (
	`co_num`
)
ON DELETE CASCADE;

ALTER TABLE `comment` ADD CONSTRAINT `FK_post_TO_comment_1` FOREIGN KEY (
	`co_po_num`
)
REFERENCES `post` (
	`po_num`
)
ON DELETE CASCADE;

ALTER TABLE `comment` ADD CONSTRAINT `FK_member_TO_comment_1` FOREIGN KEY (
	`co_mb_num`
)
REFERENCES `member` (
	`mb_num`
);

ALTER TABLE `photo` ADD CONSTRAINT `FK_post_TO_photo_1` FOREIGN KEY (
	`ph_po_num`
)
REFERENCES `post` (
	`po_num`
)
ON DELETE CASCADE;

ALTER TABLE `live_rank` ADD CONSTRAINT `FK_post_TO_live_rank_1` FOREIGN KEY (
	`lr_po_num`
)
REFERENCES `post` (
	`po_num`
)
ON DELETE CASCADE;

ALTER TABLE `history` ADD CONSTRAINT `FK_post_TO_history_1` FOREIGN KEY (
	`ht_po_num`
)
REFERENCES `post` (
	`po_num`
)
ON DELETE CASCADE;

ALTER TABLE `history` ADD CONSTRAINT `FK_member_TO_history_1` FOREIGN KEY (
	`ht_me_num`
)
REFERENCES `member` (
	`mb_num`
);

ALTER TABLE `report_box` ADD CONSTRAINT `FK_member_TO_report_box_1` FOREIGN KEY (
	`rb_mb_num`
)
REFERENCES `member` (
	`mb_num`
);

ALTER TABLE `travel` ADD CONSTRAINT `FK_category_TO_travel_1` FOREIGN KEY (
	`tv_cg_num`
)
REFERENCES `category` (
	`cg_num`
);

ALTER TABLE `bookmark` ADD CONSTRAINT `FK_post_TO_bookmark_1` FOREIGN KEY (
	`bm_po_num`
)
REFERENCES `post` (
	`po_num`
)
ON DELETE CASCADE;

ALTER TABLE `bookmark` ADD CONSTRAINT `FK_member_TO_bookmark_1` FOREIGN KEY (
	`bm_mb_num`
)
REFERENCES `member` (
	`mb_num`
);

ALTER TABLE `main_photo` ADD CONSTRAINT `FK_travel_TO_main_photo_1` FOREIGN KEY (
	`mp_tv_num`
)
REFERENCES `travel` (
	`tv_num`
);

ALTER TABLE `category` ADD CONSTRAINT `FK_board_TO_category_1` FOREIGN KEY (
	`cg_bo_num`
)
REFERENCES `board` (
	`bo_num`
)
ON DELETE CASCADE;

ALTER TABLE `mark` ADD CONSTRAINT `FK_kind_TO_mark_1` FOREIGN KEY (
	`ma_ki_num`
)
REFERENCES `kind` (
	`ki_num`
)
ON DELETE CASCADE;

ALTER TABLE `mark` ADD CONSTRAINT `FK_post_TO_mark_1` FOREIGN KEY (
	`ma_po_num`
)
REFERENCES `post` (
	`po_num`
)
ON DELETE CASCADE;

ALTER TABLE `review` ADD CONSTRAINT `FK_travel_TO_review_1` FOREIGN KEY (
	`rv_tv_num`
)
REFERENCES `travel` (
	`tv_num`
)
ON DELETE CASCADE;

ALTER TABLE `review` ADD CONSTRAINT `FK_member_TO_review_1` FOREIGN KEY (
	`rv_mb_num`
)
REFERENCES `member` (
	`mb_num`
);

ALTER TABLE `likes` ADD CONSTRAINT `FK_member_TO_likes_1` FOREIGN KEY (
	`li_mb_num`
)
REFERENCES `member` (
	`mb_num`
);

-- 1. 회원 데이터 생성 (컨토롤러에서 사용할 1번 유저)
INSERT INTO `member` (mb_num, mb_Uid, mb_rol) VALUES (1, 'admin', 'ADMIN');

-- 2. 게시판 종류 생성
INSERT INTO `board` (bo_name) VALUES ('전체게시판');

-- 3. 카테고리 데이터 생성 (번호를 1, 2, 3번으로 강제 지정)
INSERT INTO `category` (cg_num, cg_kind, cg_display, cg_bo_num) VALUES (1, '여행 추천 게시판', 'Y', 1);
INSERT INTO `category` (cg_num, cg_kind, cg_display, cg_bo_num) VALUES (2, '여행 후기 게시판', 'Y', 1);
INSERT INTO `category` (cg_num, cg_kind, cg_display, cg_bo_num) VALUES (3, '자유 게시판', 'Y', 1);


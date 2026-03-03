-- TravelProject DB Schema (structure only, no data)
-- Source: MySQL dump from server, cleaned to keep only table definitions
-- Charset: utf8mb4 / InnoDB

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- -----------------------------------------------------
-- Table `RankingEntity`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `RankingEntity`;
CREATE TABLE `RankingEntity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `areaNm` varchar(255) DEFAULT NULL,
  `baseDate` varchar(255) DEFAULT NULL,
  `sigunguCode` varchar(255) DEFAULT NULL,
  `vCount` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `board`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `board`;
CREATE TABLE `board` (
  `bo_num` int NOT NULL AUTO_INCREMENT,
  `bo_name` varchar(100) NOT NULL,
  PRIMARY KEY (`bo_num`),
  UNIQUE KEY `bo_name` (`bo_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookmark`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `bookmark`;
CREATE TABLE `bookmark` (
  `bm_num` int NOT NULL AUTO_INCREMENT,
  `bm_po_num` int NOT NULL,
  `bm_po_type` varchar(20) NOT NULL,
  `bm_mb_num` int NOT NULL,
  PRIMARY KEY (`bm_num`),
  KEY `bm_mb_num` (`bm_mb_num`),
  CONSTRAINT `bookmark_ibfk_1` FOREIGN KEY (`bm_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `category`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `cg_num` int NOT NULL AUTO_INCREMENT,
  `cg_kind` varchar(100) NOT NULL,
  `cg_display` char(1) NOT NULL,
  `cg_bo_num` int NOT NULL,
  PRIMARY KEY (`cg_num`),
  UNIQUE KEY `cg_kind` (`cg_kind`),
  KEY `cg_bo_num` (`cg_bo_num`),
  CONSTRAINT `category_ibfk_1` FOREIGN KEY (`cg_bo_num`) REFERENCES `board` (`bo_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `comment`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `co_num` int NOT NULL AUTO_INCREMENT,
  `co_content` text NOT NULL,
  `co_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `co_like` int NOT NULL DEFAULT '0',
  `co_del` varchar(1) DEFAULT NULL,
  `co_ori_num` int DEFAULT NULL,
  `co_po_num` int NOT NULL,
  `co_po_type` varchar(255) NOT NULL,
  `co_mb_num` int NOT NULL,
  PRIMARY KEY (`co_num`),
  KEY `co_ori_num` (`co_ori_num`),
  KEY `co_mb_num` (`co_mb_num`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`co_ori_num`) REFERENCES `comment` (`co_num`) ON DELETE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`co_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `comment_like`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `comment_like`;
CREATE TABLE `comment_like` (
  `clNum` int NOT NULL AUTO_INCREMENT,
  `co_num` int DEFAULT NULL,
  `mb_num` int DEFAULT NULL,
  PRIMARY KEY (`clNum`),
  KEY `FKow2fjqv8557owtldol3yye04g` (`co_num`),
  KEY `FKi4oakehdy57lenf0mafp9g5c2` (`mb_num`),
  CONSTRAINT `FKi4oakehdy57lenf0mafp9g5c2` FOREIGN KEY (`mb_num`) REFERENCES `member` (`mb_num`),
  CONSTRAINT `FKow2fjqv8557owtldol3yye04g` FOREIGN KEY (`co_num`) REFERENCES `comment` (`co_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `event_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `event_post`;
CREATE TABLE `event_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(255) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(1000) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` char(1) NOT NULL DEFAULT 'N',
  `po_mb_num` int NOT NULL,
  `po_type` varchar(20) NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `event_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `faq_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `faq_post`;
CREATE TABLE `faq_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_content` longtext NOT NULL,
  `po_date` datetime(6) DEFAULT NULL,
  `po_del` char(1) DEFAULT 'N',
  `po_down` int DEFAULT '0',
  `po_img` varchar(1000) DEFAULT NULL,
  `po_mb_num` int DEFAULT NULL,
  `po_report` int DEFAULT '0',
  `po_title` varchar(100) NOT NULL,
  `po_up` int DEFAULT '0',
  `po_view` int DEFAULT '0',
  PRIMARY KEY (`po_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `free_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `free_photo`;
CREATE TABLE `free_photo` (
  `ph_num` int NOT NULL AUTO_INCREMENT,
  `ph_ori_name` varchar(100) NOT NULL,
  `ph_name` varchar(255) NOT NULL,
  `ph_po_num` int NOT NULL,
  PRIMARY KEY (`ph_num`),
  KEY `ph_po_num` (`ph_po_num`),
  CONSTRAINT `free_photo_ibfk_1` FOREIGN KEY (`ph_po_num`) REFERENCES `free_post` (`po_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `free_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `free_post`;
CREATE TABLE `free_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(100) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(1000) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` varchar(1) NOT NULL,
  `po_mb_num` int NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `free_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `history`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `history`;
CREATE TABLE `history` (
  `ht_num` int NOT NULL AUTO_INCREMENT,
  `ht_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ht_po_num` int NOT NULL,
  `ht_po_type` varchar(20) NOT NULL,
  `ht_me_num` int NOT NULL,
  `htMeNum` int NOT NULL,
  `htPoNum` int NOT NULL,
  `htTime` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`ht_num`),
  KEY `ht_me_num` (`ht_me_num`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`ht_me_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `inquiry_box`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `inquiry_box`;
CREATE TABLE `inquiry_box` (
  `ib_num` int NOT NULL AUTO_INCREMENT,
  `ib_title` varchar(200) NOT NULL,
  `ib_content` text NOT NULL,
  `ib_reply` text,
  `ib_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ib_status` char(1) NOT NULL DEFAULT 'N',
  `ib_seen` char(1) NOT NULL DEFAULT 'N',
  `ib_mb_num` int NOT NULL,
  PRIMARY KEY (`ib_num`),
  KEY `ib_mb_num` (`ib_mb_num`),
  CONSTRAINT `inquiry_box_ibfk_1` FOREIGN KEY (`ib_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `kakaomap`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `kakaomap`;
CREATE TABLE `kakaomap` (
  `km_num` int NOT NULL AUTO_INCREMENT,
  `km_name` varchar(100) NOT NULL,
  `km_lat` double NOT NULL,
  `km_lng` double NOT NULL,
  `km_address` varchar(255) DEFAULT NULL,
  `km_category` varchar(50) DEFAULT NULL,
  `km_api_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`km_num`),
  UNIQUE KEY `km_api_id` (`km_api_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `kind`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `kind`;
CREATE TABLE `kind` (
  `ki_num` int NOT NULL AUTO_INCREMENT,
  `ki_name` varchar(10) NOT NULL,
  PRIMARY KEY (`ki_num`),
  UNIQUE KEY `ki_name` (`ki_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `likes`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `li_num` int NOT NULL AUTO_INCREMENT,
  `li_state` int NOT NULL,
  `li_id` int NOT NULL,
  `li_name` varchar(10) NOT NULL,
  `li_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `li_mb_num` int NOT NULL,
  PRIMARY KEY (`li_num`),
  KEY `li_mb_num` (`li_mb_num`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`li_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `live_rank`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `live_rank`;
CREATE TABLE `live_rank` (
  `lr_num` int NOT NULL AUTO_INCREMENT,
  `lr_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lr_ori_num` int NOT NULL,
  `lr_po_num` int NOT NULL,
  `lr_po_type` varchar(20) NOT NULL,
  PRIMARY KEY (`lr_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `live_rank_region`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `live_rank_region`;
CREATE TABLE `live_rank_region` (
  `lr_id` bigint NOT NULL AUTO_INCREMENT,
  `area_nm` varchar(255) NOT NULL,
  `sigungu_code` varchar(255) NOT NULL,
  `v_count` bigint NOT NULL,
  `base_date` varchar(255) NOT NULL,
  `reg_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `main_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `main_photo`;
CREATE TABLE `main_photo` (
  `mp_num` int NOT NULL AUTO_INCREMENT,
  `mp_name` varchar(100) NOT NULL,
  `mp_tv_num` int NOT NULL,
  PRIMARY KEY (`mp_num`),
  KEY `mp_tv_num` (`mp_tv_num`),
  CONSTRAINT `main_photo_ibfk_1` FOREIGN KEY (`mp_tv_num`) REFERENCES `travel` (`tv_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `mark`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `mark`;
CREATE TABLE `mark` (
  `ma_num` int NOT NULL AUTO_INCREMENT,
  `ma_score` int NOT NULL DEFAULT '0',
  `ma_ki_num` int NOT NULL,
  `ma_po_num` int NOT NULL,
  `ma_po_type` varchar(20) NOT NULL,
  PRIMARY KEY (`ma_num`),
  KEY `ma_ki_num` (`ma_ki_num`),
  CONSTRAINT `mark_ibfk_1` FOREIGN KEY (`ma_ki_num`) REFERENCES `kind` (`ki_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `member`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
  `mb_num` int NOT NULL AUTO_INCREMENT,
  `mb_uid` varchar(30) NOT NULL,
  `mb_nickname` varchar(50) NOT NULL,
  `mb_pw` varchar(255) DEFAULT NULL,
  `mb_email` varchar(50) DEFAULT NULL,
  `mb_rol` varchar(10) NOT NULL DEFAULT 'USER',
  `mb_score` int NOT NULL DEFAULT '0',
  `mb_photo` varchar(100) DEFAULT NULL,
  `mb_photo_data` longblob,
  `mb_photo_type` varchar(30) DEFAULT NULL,
  `mb_photo_ver` int DEFAULT NULL,
  `mb_agree` char(1) NOT NULL DEFAULT 'N',
  `mb_provider` varchar(20) DEFAULT 'local',
  PRIMARY KEY (`mb_num`),
  UNIQUE KEY `mb_uid` (`mb_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `newsletter_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `newsletter_photo`;
CREATE TABLE `newsletter_photo` (
  `ph_num` int NOT NULL AUTO_INCREMENT,
  `ph_ori_name` varchar(100) NOT NULL,
  `ph_name` varchar(100) NOT NULL,
  `ph_po_num` int NOT NULL,
  PRIMARY KEY (`ph_num`),
  KEY `ph_po_num` (`ph_po_num`),
  CONSTRAINT `newsletter_photo_ibfk_1` FOREIGN KEY (`ph_po_num`) REFERENCES `newsletter_post` (`po_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `newsletter_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `newsletter_post`;
CREATE TABLE `newsletter_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(255) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(1000) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` char(1) NOT NULL DEFAULT 'N',
  `po_mb_num` int NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `newsletter_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `notice_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `notice_post`;
CREATE TABLE `notice_post` (
  `nn_num` int NOT NULL AUTO_INCREMENT,
  `file_url` varchar(255) DEFAULT NULL,
  `nn_content` longtext NOT NULL,
  `nn_date` datetime(6) NOT NULL,
  `nn_del` varchar(255) DEFAULT NULL,
  `nn_down` int DEFAULT NULL,
  `nn_mb_num` int NOT NULL,
  `nn_report` int DEFAULT NULL,
  `nn_title` varchar(100) NOT NULL,
  `nn_up` int DEFAULT NULL,
  `nn_view` int DEFAULT NULL,
  PRIMARY KEY (`nn_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `recommend_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `recommend_photo`;
CREATE TABLE `recommend_photo` (
  `ph_num` int NOT NULL AUTO_INCREMENT,
  `ph_ori_name` varchar(100) NOT NULL,
  `ph_name` varchar(255) NOT NULL,
  `ph_po_num` int NOT NULL,
  PRIMARY KEY (`ph_num`),
  KEY `ph_po_num` (`ph_po_num`),
  CONSTRAINT `recommend_photo_ibfk_1` FOREIGN KEY (`ph_po_num`) REFERENCES `recommend_post` (`po_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `recommend_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `recommend_post`;
CREATE TABLE `recommend_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(100) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(1000) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` varchar(1) NOT NULL,
  `po_mb_num` int NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `recommend_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `report_box`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `report_box`;
CREATE TABLE `report_box` (
  `rb_num` int NOT NULL AUTO_INCREMENT,
  `rb_content` varchar(255) DEFAULT NULL,
  `rb_reply` text,
  `rb_manage` char(1) DEFAULT 'N',
  `rb_id` int NOT NULL,
  `rb_name` varchar(255) DEFAULT NULL,
  `rb_mb_num` int NOT NULL,
  `rb_seen` char(1) DEFAULT 'N',
  PRIMARY KEY (`rb_num`),
  KEY `rb_mb_num` (`rb_mb_num`),
  CONSTRAINT `report_box_ibfk_1` FOREIGN KEY (`rb_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `review`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `rv_num` int NOT NULL AUTO_INCREMENT,
  `rv_content` text NOT NULL,
  `rv_up` int NOT NULL DEFAULT '0',
  `rv_down` int NOT NULL DEFAULT '0',
  `rv_del` char(1) NOT NULL DEFAULT 'N',
  `rv_view` int NOT NULL DEFAULT '0',
  `rv_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rv_tv_num` int NOT NULL,
  `rv_mb_num` int NOT NULL,
  PRIMARY KEY (`rv_num`),
  KEY `rv_tv_num` (`rv_tv_num`),
  KEY `rv_mb_num` (`rv_mb_num`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`rv_tv_num`) REFERENCES `travel` (`tv_num`) ON DELETE CASCADE,
  CONSTRAINT `review_ibfk_2` FOREIGN KEY (`rv_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `review_photo`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `review_photo`;
CREATE TABLE `review_photo` (
  `ph_num` int NOT NULL AUTO_INCREMENT,
  `ph_ori_name` varchar(100) NOT NULL,
  `ph_name` varchar(255) NOT NULL,
  `ph_po_num` int NOT NULL,
  PRIMARY KEY (`ph_num`),
  KEY `ph_po_num` (`ph_po_num`),
  CONSTRAINT `review_photo_ibfk_1` FOREIGN KEY (`ph_po_num`) REFERENCES `review_post` (`po_num`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `review_post`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `review_post`;
CREATE TABLE `review_post` (
  `po_num` int NOT NULL AUTO_INCREMENT,
  `po_title` varchar(100) NOT NULL,
  `po_content` longtext NOT NULL,
  `po_img` varchar(100) DEFAULT NULL,
  `po_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `po_view` int NOT NULL DEFAULT '0',
  `po_up` int NOT NULL DEFAULT '0',
  `po_down` int NOT NULL DEFAULT '0',
  `po_report` int NOT NULL DEFAULT '0',
  `po_del` varchar(255) DEFAULT NULL,
  `po_mb_num` int NOT NULL,
  PRIMARY KEY (`po_num`),
  KEY `po_mb_num` (`po_mb_num`),
  CONSTRAINT `review_post_ibfk_1` FOREIGN KEY (`po_mb_num`) REFERENCES `member` (`mb_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `travel`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `travel`;
CREATE TABLE `travel` (
  `tv_num` int NOT NULL AUTO_INCREMENT,
  `tv_API` varchar(100) NOT NULL,
  `tv_lat` double DEFAULT NULL,
  `tv_lng` double DEFAULT NULL,
  `tv_geo_status` enum('NO_COORD','READY') DEFAULT 'NO_COORD',
  `tv_mapAPI` varchar(100) NOT NULL,
  `tv_cg_num` int NOT NULL,
  PRIMARY KEY (`tv_num`),
  KEY `tv_cg_num` (`tv_cg_num`),
  CONSTRAINT `travel_ibfk_1` FOREIGN KEY (`tv_cg_num`) REFERENCES `category` (`cg_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


SET foreign_key_checks = 1;


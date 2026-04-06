-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: quiz_master_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_option` int(11) DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attempt_id` (`attempt_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
INSERT INTO `answers` VALUES (91,99,31,1,NULL),(92,99,32,3,NULL),(93,99,33,3,NULL),(94,99,34,2,NULL),(95,99,35,3,NULL),(96,99,36,3,NULL),(97,99,37,3,NULL),(98,99,38,3,NULL),(99,99,39,3,NULL),(100,99,40,3,NULL),(101,101,31,1,NULL),(102,101,32,2,NULL),(103,101,33,3,NULL),(104,101,34,3,NULL),(105,101,35,2,NULL),(106,101,36,4,NULL),(107,101,37,3,NULL),(108,101,38,1,NULL),(109,101,39,4,NULL),(110,101,40,3,NULL),(111,109,31,1,NULL),(112,109,32,2,NULL),(113,109,33,2,NULL),(114,109,34,3,NULL),(115,109,35,2,NULL),(116,109,36,3,NULL),(117,109,37,3,NULL),(118,109,38,4,NULL),(119,109,39,2,NULL),(120,109,40,1,NULL),(121,110,31,1,NULL),(122,110,32,4,NULL),(123,110,33,1,NULL),(124,110,34,1,NULL),(125,110,35,4,NULL),(126,110,36,2,NULL),(127,110,37,2,NULL),(128,110,38,3,NULL),(129,110,39,2,NULL),(130,110,40,1,NULL),(131,111,31,1,NULL),(132,111,32,4,NULL),(133,111,33,3,NULL),(134,111,34,1,NULL),(135,111,35,4,NULL),(136,111,36,2,NULL),(137,111,37,4,NULL),(138,111,38,2,NULL),(139,111,39,3,NULL),(140,111,40,3,NULL),(141,113,31,2,NULL),(142,113,32,2,NULL),(143,113,33,3,NULL),(144,113,34,4,NULL),(145,113,35,2,NULL),(146,113,36,3,NULL),(147,113,37,2,NULL),(148,113,38,3,NULL),(149,113,39,2,NULL),(150,113,40,2,NULL),(151,114,31,1,NULL),(152,114,32,4,NULL),(153,114,33,2,NULL),(154,114,34,3,NULL),(155,114,35,1,NULL),(156,114,36,3,NULL),(157,114,37,3,NULL),(158,114,38,3,NULL),(159,114,39,2,NULL),(160,114,40,4,NULL),(161,115,31,4,NULL),(162,115,32,4,NULL),(163,115,33,3,NULL),(164,115,34,3,NULL),(165,115,35,2,NULL),(166,115,36,2,NULL),(167,115,37,3,NULL),(168,115,38,4,NULL),(169,115,39,2,NULL),(170,115,40,3,NULL),(171,116,31,4,NULL),(172,116,32,3,NULL),(173,116,33,2,NULL),(174,116,34,1,NULL),(175,116,35,2,NULL),(176,116,36,4,NULL),(177,116,37,1,NULL),(178,116,38,4,NULL),(179,116,39,2,NULL),(180,116,40,4,NULL),(181,117,31,4,NULL),(182,117,32,4,NULL),(183,117,33,2,NULL),(184,117,34,3,NULL),(185,117,35,3,NULL),(186,117,36,3,NULL),(187,117,37,2,NULL),(188,117,38,3,NULL),(189,117,39,3,NULL),(190,117,40,3,NULL),(191,118,31,1,NULL),(192,118,32,3,NULL),(193,118,33,4,NULL),(194,118,34,3,NULL),(195,118,35,2,NULL),(196,118,36,3,NULL),(197,118,37,2,NULL),(198,118,38,4,NULL),(199,118,39,2,NULL),(200,118,40,1,NULL),(201,121,45,1,NULL),(202,133,45,1,NULL),(203,134,45,1,NULL),(204,135,46,1,NULL);
/*!40000 ALTER TABLE `answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizers`
--

DROP TABLE IF EXISTS `organizers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organizers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizers`
--

LOCK TABLES `organizers` WRITE;
/*!40000 ALTER TABLE `organizers` DISABLE KEYS */;
INSERT INTO `organizers` VALUES (1,'admin@quiz.com','$2a$10$LsaZACTg2vYeQyaQYwGPj.DLRU8n66Bnr68mgjeHmKNJGilVPFlMa','2026-02-02 10:40:08');
/*!40000 ALTER TABLE `organizers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `correct_option` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `option1` varchar(255) DEFAULT NULL,
  `option2` varchar(255) DEFAULT NULL,
  `option3` varchar(255) DEFAULT NULL,
  `option4` varchar(255) DEFAULT NULL,
  `option5` varchar(255) DEFAULT NULL,
  `option6` varchar(255) DEFAULT NULL,
  `marks` int(11) DEFAULT 1,
  `negative_on` tinyint(1) DEFAULT 0,
  `negative_marks` float DEFAULT 0,
  `question_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (31,50,'What is 15% of 200?',3,'2026-02-23 05:51:06','20','25','30','35',NULL,NULL,1,0,0,NULL),(32,50,'If a train travels 60 km in 1 hour, how much distance will it cover in 3 hours?',3,'2026-02-23 05:52:54','120 km','150 km','180 km','200 km',NULL,NULL,1,0,0,NULL),(33,50,'Simplify: 25 × 4 ÷ 5 = __',3,'2026-02-23 05:54:18','10','15','20','25',NULL,NULL,1,0,0,NULL),(34,50,'The average of 10, 20, and 30 is:',2,'2026-02-23 05:55:27','15','20','25','30',NULL,NULL,1,0,0,NULL),(35,50,'A shopkeeper gives 10% discount on ₹500. What is the discount amount?',3,'2026-02-23 05:56:24','40','45','50','60',NULL,NULL,1,0,0,NULL),(36,50,'Find the missing number:',3,'2026-02-23 05:57:15','18','24','32','64',NULL,NULL,1,0,0,NULL),(37,50,'If 5 pens cost ₹50, what is the cost of 1 pen?',3,'2026-02-23 05:57:56','5','8','10','12',NULL,NULL,1,0,0,NULL),(38,50,'A number increased by 20 is 50. What is the number?',3,'2026-02-23 05:58:51','20','25','30','35',NULL,NULL,1,0,0,NULL),(39,50,'What is the simple interest on ₹1000 at 10% per annum for 1 year?',2,'2026-02-23 05:59:43','50','100','150','200',NULL,NULL,1,0,0,NULL),(40,50,'3² + 4² = ?',3,'2026-02-23 06:00:32','12','18','25','49',NULL,NULL,1,0,0,NULL),(41,51,'mana',1,'2026-02-23 06:37:23','mmmmmmmmmmmmmmmmmmmmmmm','mmmmmmm','mmmmmmmmmmmmm','mmmmmmmmmm',NULL,NULL,1,0,0,NULL),(42,51,'xddd',1,'2026-02-23 06:45:48','cddd','cccc',NULL,NULL,NULL,NULL,1,0,0,NULL),(44,51,'cc',1,'2026-02-23 06:51:43','ss','smu',NULL,NULL,NULL,NULL,3,1,0.25,NULL),(45,55,'MM',1,'2026-02-24 06:07:10','112','QQQ',',,,','MMM',NULL,NULL,3,1,0.5,NULL),(46,58,'manas3unn0e eeeeeeeeeeir4j',1,'2026-03-26 12:09:53','True','False',NULL,NULL,NULL,NULL,1,0,0,'/uploads/questions/1774526993488-849174284.png'),(47,62,'wqd21',2,'2026-03-26 12:14:46','22','w2e',NULL,NULL,NULL,NULL,1,1,0.25,'/uploads/questions/1774527286092-380967562.png'),(48,64,'hi my name  is manas',1,'2026-03-31 11:13:38','True','False',NULL,NULL,NULL,NULL,1,0,0,'/uploads/questions/1774955618857-201876705.png'),(49,65,'hi',1,'2026-04-01 05:02:40','teasing','testing',NULL,NULL,NULL,NULL,1,0,0,'/uploads/questions/1775019760762-618769660.png'),(50,65,'gi',1,'2026-04-01 05:03:04','ff','pubg',NULL,NULL,NULL,NULL,1,0,0,'/uploads/questions/1775019784404-37459495.png'),(51,66,'D',1,'2026-04-01 06:10:06','D','GG',NULL,NULL,NULL,NULL,1,0,0,'/uploads/questions/1775023806366-215589238.webp');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `score` int(11) DEFAULT 0,
  `status` enum('IN_PROGRESS','SUBMITTED','FORCE_ENDED') DEFAULT 'IN_PROGRESS',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `percentage` int(11) DEFAULT 0,
  `grade` varchar(5) DEFAULT NULL,
  `result_status` varchar(10) DEFAULT NULL,
  `disqualified` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`),
  CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
INSERT INTO `quiz_attempts` VALUES (99,50,121,8,'SUBMITTED','2026-02-23 06:01:43','2026-02-23 06:01:43',80,'A','Pass',0),(100,50,122,0,'SUBMITTED','2026-02-23 06:07:54','2026-02-23 06:07:54',0,'F','Fail',0),(101,50,123,3,'SUBMITTED','2026-02-23 09:22:39','2026-02-23 09:22:39',30,'F','Fail',0),(102,50,124,0,'IN_PROGRESS','2026-02-23 09:26:29',NULL,0,NULL,NULL,0),(103,50,125,0,'IN_PROGRESS','2026-02-23 10:03:17',NULL,0,NULL,NULL,0),(104,50,126,0,'IN_PROGRESS','2026-02-23 10:03:41',NULL,0,NULL,NULL,0),(105,50,127,0,'IN_PROGRESS','2026-02-23 10:20:48',NULL,0,NULL,NULL,0),(106,50,128,0,'IN_PROGRESS','2026-02-23 10:21:29',NULL,0,NULL,NULL,0),(107,50,129,0,'IN_PROGRESS','2026-02-23 10:29:32',NULL,0,NULL,NULL,0),(108,50,130,0,'IN_PROGRESS','2026-02-23 10:31:29',NULL,0,NULL,NULL,0),(109,50,131,3,'SUBMITTED','2026-02-23 10:41:49','2026-02-23 10:41:49',30,'F','Fail',0),(110,50,132,2,'SUBMITTED','2026-02-23 10:44:11','2026-02-23 10:44:11',20,'F','Fail',0),(111,50,133,2,'SUBMITTED','2026-02-23 11:31:58','2026-02-23 11:31:58',20,'F','Fail',0),(112,50,134,0,'IN_PROGRESS','2026-02-23 11:54:04',NULL,0,NULL,NULL,0),(113,50,135,4,'SUBMITTED','2026-02-23 11:54:29','2026-02-23 11:54:29',40,'F','Pass',0),(114,50,136,4,'SUBMITTED','2026-02-24 05:38:53','2026-02-24 05:38:53',40,'F','Pass',0),(115,50,137,4,'SUBMITTED','2026-02-24 05:44:49','2026-02-24 05:44:49',40,'F','Pass',0),(116,50,138,2,'SUBMITTED','2026-02-24 05:47:10','2026-02-24 05:47:10',20,'F','Fail',0),(117,50,139,4,'SUBMITTED','2026-02-24 05:55:29','2026-02-24 05:55:29',40,'F','Pass',0),(118,50,140,3,'SUBMITTED','2026-02-24 06:03:40','2026-02-24 06:03:40',30,'F','Fail',0),(119,50,141,0,'IN_PROGRESS','2026-02-24 06:07:52',NULL,0,NULL,NULL,0),(120,55,142,0,'SUBMITTED','2026-02-24 06:10:18','2026-02-24 06:10:18',0,'F','Fail',0),(121,55,143,3,'SUBMITTED','2026-02-24 06:54:23','2026-02-24 06:54:23',100,'A+','Pass',0),(122,55,144,0,'IN_PROGRESS','2026-02-24 07:21:29',NULL,0,NULL,NULL,0),(123,55,145,0,'IN_PROGRESS','2026-02-24 07:21:48',NULL,0,NULL,NULL,0),(124,55,146,0,'IN_PROGRESS','2026-02-24 07:30:05',NULL,0,NULL,NULL,0),(125,55,147,0,'IN_PROGRESS','2026-02-24 07:30:31',NULL,0,NULL,NULL,0),(126,55,148,0,'IN_PROGRESS','2026-02-24 07:40:01',NULL,0,NULL,NULL,0),(127,55,149,0,'IN_PROGRESS','2026-02-24 07:40:30',NULL,0,NULL,NULL,0),(128,55,150,0,'IN_PROGRESS','2026-02-24 07:40:59',NULL,0,NULL,NULL,0),(129,55,151,0,'IN_PROGRESS','2026-02-24 11:55:50',NULL,0,NULL,NULL,0),(130,55,137,0,'IN_PROGRESS','2026-02-24 11:56:36',NULL,0,NULL,NULL,0),(131,55,152,0,'IN_PROGRESS','2026-02-24 13:08:02',NULL,0,NULL,NULL,0),(132,55,153,0,'IN_PROGRESS','2026-02-24 13:08:29',NULL,0,NULL,NULL,0),(133,55,154,3,'SUBMITTED','2026-03-26 05:15:44','2026-03-26 05:15:44',100,'A+','Pass',0),(134,55,155,3,'SUBMITTED','2026-03-26 10:03:20','2026-03-26 10:03:20',100,'A+','Pass',0),(135,58,156,1,'SUBMITTED','2026-03-26 12:10:40','2026-03-26 12:10:40',100,'A+','Pass',0),(136,58,157,0,'IN_PROGRESS','2026-03-26 12:15:50',NULL,0,NULL,NULL,0),(137,58,158,0,'SUBMITTED','2026-03-26 12:16:39','2026-03-26 12:16:39',0,'F','Fail',0),(138,58,159,0,'SUBMITTED','2026-03-26 12:17:59','2026-03-26 12:17:59',0,'F','Fail',0),(139,58,160,0,'IN_PROGRESS','2026-03-26 12:19:56',NULL,0,NULL,NULL,0);
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organizer_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `time_limit` int(11) NOT NULL,
  `total_marks` int(11) NOT NULL,
  `quiz_code` varchar(6) NOT NULL,
  `shuffle_questions` tinyint(1) DEFAULT 1,
  `shuffle_options` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `show_result` tinyint(1) DEFAULT 1,
  `positive_mark` float DEFAULT 1,
  `negative_mark` float DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quiz_code` (`quiz_code`),
  KEY `organizer_id` (`organizer_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `organizers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (50,1,'Aptitude','',90,0,'WEBYUG',1,1,'2026-02-23 05:42:35',0,1,0),(51,1,'manas','.',2,0,'SDFF45',1,1,'2026-02-23 06:37:02',1,1,0),(52,1,'manas','dcmi',3,0,'ZMJFAX',1,1,'2026-02-23 09:19:39',1,1,0),(53,1,'sx','x s',3,0,'QE345G',1,1,'2026-02-23 12:52:32',1,1,0),(55,1,'MANAAS','AAAIASI',1,0,'WEBYU2',1,1,'2026-02-24 06:06:21',1,1,0),(58,1,'mm','m',1,0,'MANAS',1,1,'2026-02-24 09:46:40',1,1,0),(59,1,'m','',1,0,'G3UGWZ',1,1,'2026-02-24 11:49:57',1,1,0),(61,1,'maaanass','',1,0,'WERYUG',1,1,'2026-03-26 05:46:33',1,1,0),(62,1,'xx','',2,0,'KA9TN',1,1,'2026-03-26 12:14:13',1,1,0),(63,1,'ccdd','d3d\n212@defdc',3,0,'DOWNTO',1,1,'2026-03-30 12:33:55',1,1,0),(64,1,'vmv','vvm',1,0,'HIMANA',1,1,'2026-03-31 10:42:54',1,1,0),(65,1,'22','333',2,0,'DDA2',1,1,'2026-04-01 05:02:12',1,1,0),(66,1,'VV','S3E',3,0,'FFAD',1,1,'2026-04-01 06:09:38',1,1,0);
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `roll_number` varchar(50) DEFAULT NULL,
  `class_section` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (121,'Manas Vora','7574839057','voramanas3095@gmail.com',NULL,NULL,NULL,'2026-02-23 06:01:43'),(122,'Manas Vora','7574839057','voramanas30095@gmail.com',NULL,NULL,NULL,'2026-02-23 06:07:54'),(123,'Manas Vora','7574839057','voramanpas3095@gmail.com',NULL,NULL,NULL,'2026-02-23 09:22:39'),(124,'Manas Vora','7574839057','voramanpas3095@gmmail.com',NULL,NULL,NULL,'2026-02-23 09:26:29'),(125,'Manas Vora','7574839057','voramcanpas3095@gmmail.com',NULL,NULL,NULL,'2026-02-23 10:03:17'),(126,'Manas Vora','7574839057','voramcanbpas3095@gmmail.com',NULL,NULL,NULL,'2026-02-23 10:03:41'),(127,'Manas Vora','7574839057','voramcanbpas32095@gmmail.com',NULL,NULL,NULL,'2026-02-23 10:20:48'),(128,'Manas Vora','7574839057','vv@12',NULL,NULL,NULL,'2026-02-23 10:21:29'),(129,'Manas Vora','7574839057','xx@12',NULL,NULL,NULL,'2026-02-23 10:29:32'),(130,'Manas Vora','7574839057','ss@we',NULL,NULL,NULL,'2026-02-23 10:31:29'),(131,'Manas Vora','7574839057','mm@12',NULL,NULL,NULL,'2026-02-23 10:41:49'),(132,'Manas Vora','7574839057','12@12',NULL,NULL,NULL,'2026-02-23 10:44:11'),(133,'Manas Vora','7574839057','manas@123',NULL,NULL,NULL,'2026-02-23 11:31:58'),(134,'Manas Vora','7574839057','manas@1234',NULL,NULL,NULL,'2026-02-23 11:54:04'),(135,'Manas Vora','7574839057','manas@123343',NULL,NULL,NULL,'2026-02-23 11:54:29'),(136,'Manas Vora','7574839057','8manas@123343',NULL,NULL,NULL,'2026-02-24 05:38:53'),(137,'Manas Vora','7574839057','aa@12',NULL,NULL,NULL,'2026-02-24 05:44:49'),(138,'Manas Vora','7574839057','ab@123',NULL,NULL,NULL,'2026-02-24 05:47:10'),(139,'Manas Vora','7574839057','AAAAAAAACD!@!22',NULL,NULL,NULL,'2026-02-24 05:55:29'),(140,'Manas Vora','7574839057','MMM@123',NULL,NULL,NULL,'2026-02-24 06:03:40'),(141,'Manas Vora','7574839057','MMMMMM@1222',NULL,NULL,NULL,'2026-02-24 06:07:52'),(142,'Manas Vora','7574839057','M@12222',NULL,NULL,NULL,'2026-02-24 06:10:18'),(143,'Manas Vora','7574839057','maa@2',NULL,NULL,NULL,'2026-02-24 06:54:23'),(144,'Manas Vora','7574839057','cc@111',NULL,NULL,NULL,'2026-02-24 07:21:29'),(145,'Manas Vora','7574839057','vvv@12',NULL,NULL,NULL,'2026-02-24 07:21:48'),(146,'Manas Vora','7574839057','vv@122',NULL,NULL,NULL,'2026-02-24 07:30:05'),(147,'Manas Vora','7574839057','vvv@1222',NULL,NULL,NULL,'2026-02-24 07:30:31'),(148,'Manas Vora','7574839057','mdd@122',NULL,NULL,NULL,'2026-02-24 07:40:01'),(149,'Manas Vora','7574839057','ddd@122',NULL,NULL,NULL,'2026-02-24 07:40:30'),(150,'Manas Vora','7574839057','nn@12',NULL,NULL,NULL,'2026-02-24 07:40:59'),(151,'Manas Vora','7574839057','h@12',NULL,NULL,NULL,'2026-02-24 11:55:50'),(152,'Manas Vora','7574839057','mm@22',NULL,NULL,NULL,'2026-02-24 13:08:02'),(153,'Manas Vora','7574839057','ss@12',NULL,NULL,NULL,'2026-02-24 13:08:29'),(154,'Manas Vora','7574839057','cc@123',NULL,NULL,NULL,'2026-03-26 05:15:44'),(155,'Manas Vora','7574839057','gg2@3',NULL,NULL,NULL,'2026-03-26 10:03:20'),(156,'mmmmm','7574839057','gg@324',NULL,NULL,NULL,'2026-03-26 12:10:40'),(157,'mmmmm','7574839057','gg@3243',NULL,NULL,NULL,'2026-03-26 12:15:50'),(158,'mmmmm','7574839057','gg@32434',NULL,NULL,NULL,'2026-03-26 12:16:39'),(159,'mmmmm','7574839057','gg@324345',NULL,NULL,NULL,'2026-03-26 12:17:59'),(160,'mmmmm','7574839057','gg@3243456',NULL,NULL,NULL,'2026-03-26 12:19:56');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violations`
--

DROP TABLE IF EXISTS `violations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `violations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attempt_id` int(11) NOT NULL,
  `violation_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `attempt_id` (`attempt_id`),
  CONSTRAINT `violations_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violations`
--

LOCK TABLES `violations` WRITE;
/*!40000 ALTER TABLE `violations` DISABLE KEYS */;
/*!40000 ALTER TABLE `violations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-06 13:34:57

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 05. Mai 2023 um 00:24
-- Server-Version: 10.4.28-MariaDB
-- PHP-Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `spacerunner`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sr_score`
--

CREATE TABLE `sr_score` (
  `s_id` int(11) UNSIGNED NOT NULL,
  `s_user_id` int(11) UNSIGNED NOT NULL,
  `s_scoretype_id` int(11) UNSIGNED NOT NULL,
  `s_score` int(11) NOT NULL,
  `s_level_reached` int(11) DEFAULT NULL,
  `s_date_achieved` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sr_scoretype`
--

CREATE TABLE `sr_scoretype` (
  `st_id` int(11) UNSIGNED NOT NULL,
  `st_scoretype` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sr_user`
--

CREATE TABLE `sr_user` (
  `u_id` int(11) UNSIGNED NOT NULL,
  `u_username` varchar(30) NOT NULL,
  `u_email` varchar(50) NOT NULL,
  `u_password` varchar(255) NOT NULL,
  `u_data_id` int(11) UNSIGNED DEFAULT NULL,
  `u_user_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `u_last_login` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `sr_user`
--

INSERT INTO `sr_user` (`u_id`, `u_username`, `u_email`, `u_password`, `u_data_id`, `u_user_deleted`, `u_last_login`) VALUES
(19, 'Michi', 'michael.ruep@gmail.com', '$2y$10$8lkbH6V3zLGF04A3PJOz/.y0yvjzq.T7/6ZJyO1VObpSiZj6QMsZ2', NULL, 0, '2023-05-03 23:07:29');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sr_userdata`
--

CREATE TABLE `sr_userdata` (
  `ud_id` int(11) UNSIGNED NOT NULL,
  `ud_data` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `sr_score`
--
ALTER TABLE `sr_score`
  ADD PRIMARY KEY (`s_id`),
  ADD KEY `s_user_id` (`s_user_id`),
  ADD KEY `s_scoretype_id` (`s_scoretype_id`);

--
-- Indizes für die Tabelle `sr_scoretype`
--
ALTER TABLE `sr_scoretype`
  ADD PRIMARY KEY (`st_id`),
  ADD UNIQUE KEY `st_scoretype` (`st_scoretype`);

--
-- Indizes für die Tabelle `sr_user`
--
ALTER TABLE `sr_user`
  ADD PRIMARY KEY (`u_id`),
  ADD UNIQUE KEY `u_username` (`u_username`),
  ADD UNIQUE KEY `u_email` (`u_email`),
  ADD KEY `u_data_id` (`u_data_id`);

--
-- Indizes für die Tabelle `sr_userdata`
--
ALTER TABLE `sr_userdata`
  ADD PRIMARY KEY (`ud_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `sr_score`
--
ALTER TABLE `sr_score`
  MODIFY `s_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `sr_scoretype`
--
ALTER TABLE `sr_scoretype`
  MODIFY `st_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `sr_user`
--
ALTER TABLE `sr_user`
  MODIFY `u_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `sr_score`
--
ALTER TABLE `sr_score`
  ADD CONSTRAINT `sr_score_ibfk_1` FOREIGN KEY (`s_user_id`) REFERENCES `sr_user` (`u_id`),
  ADD CONSTRAINT `sr_score_ibfk_2` FOREIGN KEY (`s_scoretype_id`) REFERENCES `sr_scoretype` (`st_id`);

--
-- Constraints der Tabelle `sr_user`
--
ALTER TABLE `sr_user`
  ADD CONSTRAINT `sr_user_ibfk_1` FOREIGN KEY (`u_data_id`) REFERENCES `sr_userdata` (`ud_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

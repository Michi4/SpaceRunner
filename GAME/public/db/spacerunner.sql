-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 21. Apr 2023 um 15:43
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
  `score_id` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `score` int(11) NOT NULL,
  `level_reached` int(11) DEFAULT NULL,
  `date_achieved` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `sr_score`
--

INSERT INTO `sr_score` (`score_id`, `user_id`, `score`, `level_reached`, `date_achieved`) VALUES
(1, 1, 100, 5, '2023-04-10 14:45:00'),
(2, 2, 50, 3, '2023-04-09 09:30:00'),
(3, 3, 75, 4, '2023-04-08 17:30:00'),
(4, 4, 90, 6, '2023-04-07 11:15:00'),
(5, 1, 80, 4, '2023-04-06 13:00:00'),
(6, 2, 60, 5, '2023-04-05 16:00:00'),
(7, 5, 95, 7, '2023-04-04 10:30:00'),
(8, 6, 70, 4, '2023-04-03 12:15:00'),
(9, 3, 85, 6, '2023-04-02 15:45:00'),
(10, 8, 60, 3, '2023-04-01 18:30:00');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sr_user`
--

CREATE TABLE `sr_user` (
  `id` int(11) UNSIGNED NOT NULL,
  `username` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_deleted` tinyint(4) NOT NULL,
  `last_login` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `sr_user`
--

INSERT INTO `sr_user` (`id`, `username`, `email`, `password`, `user_deleted`, `last_login`) VALUES
(1, 'johndoe', 'johndoe@example.com', '$2y$10$Nf/QRILI/Ahwan6zGkLZj.Tbb3qAtIeaXSkFW2sgnqTXg6AgmPKTa', 0, '2023-04-10 14:30:00'),
(2, 'janesmith', 'janesmith@example.com', '$2y$10$dMecKxnCAFJex7x9jKVqmO1x/oVqHb.IwbXY3jUFKPNREcAQLZHB.', 0, '2023-04-09 08:15:00'),
(3, 'bobbrown', 'bobbrown@example.com', '$2y$10$qxFJPHzjcTariNXIEWP/EuKAd9yjQyDRif/E1X5fPHNqGjtrEQgcS', 1, '2023-04-08 16:45:00'),
(4, 'alicegreen', 'alicegreen@example.com', '$2y$10$3acMqxqM7Z/HQXk7sP9fOeKySgK5hp4XZHqPtiFo0BrfO7ui0qnNK', 0, '2023-04-07 10:00:00'),
(5, 'markbaker', 'markbaker@example.com', '$2y$10$GAD4FdBrmMcCZUqUCEnbvO4AYkaOiDkZ9QnnzrgHZAo6rEMjDTjc2', 0, '2023-04-10 12:00:00'),
(6, 'ashleytaylor', 'ashleytaylor@example.com', '$2y$10$Ev2Yl2WEz.NNlYNXiK0r7ucliuoYgrbN/5VCZZyiFwoYBM7choJJm', 0, '2023-04-09 13:00:00'),
(7, 'jaredmiller', 'jaredmiller@example.com', '$2y$10$mHETeFOJryK1iC86BG9a3O0nH2vR9ywU0jk2Q2QxsC7e4Sz.w1iNG', 0, '2023-04-09 16:30:00'),
(8, 'michaelking', 'michaelking@example.com', '$2y$10$7vpLPF2n4zDKOeQmhEcacOhR4gvcfMIUYFYBkiayRG6pVZQC.3pMG', 0, '2023-04-08 09:15:00'),
(9, 'samanthasmith', 'samanthasmith@example.com', '$2y$10$HK.RoK4r4jFNGVepAr5miePML2LYT4DRcAwScj/8qpfWyH.VRgQ2q', 1, '2023-04-07 11:45:00'),
(10, 'davidlee', 'davidlee@example.com', '$2y$10$6r6TTCw/IRM5jNYxsuZUZOxR4MlyRRu12ucKxUxOShNalZsTSNXf.', 0, '2023-04-06 14:00:00'),
(11, 'Michi', 'michael.ruep@gmail.com', '$2y$10$4zUaL.7U5ydqgji1zuHj1OpvHNW3PWMfLnCNtRH/bznUJgaKhp8dG', 0, '2023-04-21 01:09:01');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `sr_score`
--
ALTER TABLE `sr_score`
  ADD PRIMARY KEY (`score_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indizes für die Tabelle `sr_user`
--
ALTER TABLE `sr_user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `sr_score`
--
ALTER TABLE `sr_score`
  MODIFY `score_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT für Tabelle `sr_user`
--
ALTER TABLE `sr_user`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `sr_score`
--
ALTER TABLE `sr_score`
  ADD CONSTRAINT `sr_score_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `sr_user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

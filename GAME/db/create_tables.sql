-- SpaceRunner database schema – safe to run on first launch
-- All CREATE TABLE statements use IF NOT EXISTS

CREATE TABLE IF NOT EXISTS sr_userdata (
    ud_id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ud_data VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS sr_user (
    u_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    u_username VARCHAR(30) NOT NULL UNIQUE,
    u_email VARCHAR(254) NOT NULL UNIQUE,
    u_password VARCHAR(255) NOT NULL,
    u_data_id INT(11) UNSIGNED DEFAULT NULL,
    u_user_deleted TINYINT(1) NOT NULL DEFAULT 0,
    u_last_login DATETIME DEFAULT NULL,
    u_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_data_id) REFERENCES sr_userdata(ud_id)
);

CREATE TABLE IF NOT EXISTS sr_scoretype (
    st_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    st_scoretype VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sr_score (
    s_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    s_user_id INT(11) UNSIGNED NOT NULL,
    s_scoretype_id INT(11) UNSIGNED NOT NULL,
    s_score INT(11) NOT NULL,
    s_level_reached INT(11) UNSIGNED DEFAULT NULL,
    s_seed VARCHAR(50) DEFAULT NULL,
    s_date_achieved DATETIME NOT NULL,
    FOREIGN KEY (s_user_id) REFERENCES sr_user(u_id),
    FOREIGN KEY (s_scoretype_id) REFERENCES sr_scoretype(st_id),
    CONSTRAINT chk_score_non_negative CHECK (s_score >= 0)
);

-- Indexes for the leaderboard queries (scoreboard ordered by score, filtered by type/user)
CREATE INDEX IF NOT EXISTS idx_score_type_score ON sr_score (s_scoretype_id, s_score DESC);
CREATE INDEX IF NOT EXISTS idx_score_user ON sr_score (s_user_id);

-- Seed score types (ignore duplicates)
INSERT IGNORE INTO sr_scoretype (st_scoretype) VALUES
('hard'),
('impossible'),
('run');

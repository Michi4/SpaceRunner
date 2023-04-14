CREATE TABLE sr_user (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_deleted TINYINT(4) NOT NULL,
	last_login datetime NOT NULL
);

CREATE TABLE sr_score (
    score_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) UNSIGNED NOT NULL,
    score INT(11) NOT NULL,
    level_reached INT(11),
    date_achieved DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES sr_user(id)
);

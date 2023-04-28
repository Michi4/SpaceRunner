drop table sr_scoretype;
drop table sr_user;
drop table sr_userdata;
drop table sr_score;

CREATE TABLE sr_userdata (
    ud_id INT(11) UNSIGNED NOT NULL PRIMARY KEY,
    ud_data VARCHAR(255) NOT NULL
);

CREATE TABLE sr_user (
    u_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    u_username VARCHAR(30) NOT NULL UNIQUE,
    u_email VARCHAR(50) NOT NULL UNIQUE,
    u_password VARCHAR(255) NOT NULL,
    u_data_id INT(11) UNSIGNED,
    u_user_deleted TINYINT(1) NOT NULL DEFAULT 0,
    u_last_login DATETIME NOT NULL,
    FOREIGN KEY (u_data_id) REFERENCES sr_userdata(ud_id)
);

CREATE TABLE sr_scoretype (
    st_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    st_scoretype VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE sr_score (
    s_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    s_user_id INT(11) UNSIGNED NOT NULL,
    s_scoretype_id INT(11) UNSIGNED NOT NULL,
    s_score INT(11) NOT NULL,
    s_level_reached INT(11),
    s_date_achieved DATETIME NOT NULL,
    FOREIGN KEY (s_user_id) REFERENCES sr_user(u_id),
    FOREIGN KEY (s_scoretype_id) REFERENCES sr_scoretype(st_id)
);
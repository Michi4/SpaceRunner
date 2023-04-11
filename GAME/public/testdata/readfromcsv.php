<?php
$_db_host = "localhost";
$_db_datenbank = "spacerunner";
$_db_username = "spacerunner";
$_db_passwort = "spacerunner";

// Establish a connection to the database
$mysqli = new mysqli($_db_host, $_db_username, $_db_passwort, $_db_datenbank);

// Check for any errors in the connection
if ($mysqli->connect_error) {
die('Connect Error (' . $mysqli->connect_errno . ') '
    . $mysqli->connect_error);
}

// read sr_user data from CSV file
$user_file = fopen("medt-sr_user.csv", "r");
$user_data = array();
while (($user_row = fgetcsv($user_file)) !== FALSE) {
    // hash the password
    $user_row[3] = password_hash($user_row[3], PASSWORD_DEFAULT);
    $user_data[] = $user_row;
}
fclose($user_file);

// read sr_score data from CSV file
$score_file = fopen("medt-sr_score.csv", "r");
$score_data = array();
while (($score_row = fgetcsv($score_file)) !== FALSE) {
    $score_data[] = $score_row;
}
fclose($score_file);

// insert sr_user data into database
foreach ($user_data as $user_row) {
    $sql = "INSERT INTO sr_user (id, username, email, password, user_deleted, last_login) VALUES (" .
        $user_row[0] . ", '" . $user_row[1] . "', '" . $user_row[2] . "', '" . $user_row[3] . "', " .
        $user_row[4] . ", '" . $user_row[5] . "')";
    if ($conn->query($sql) === FALSE) {
        echo "Error inserting sr_user data: " . $conn->error . "\n";
    }
}

// insert sr_score data into database
foreach ($score_data as $score_row) {
    $sql = "INSERT INTO sr_score (score_id, user_id, score, level_reached, date_achieved) VALUES (" .
        $score_row[0] . ", " . $score_row[1] . ", " . $score_row[2] . ", " . $score_row[3] . ", '" .
        $score_row[4] . "')";
    if ($conn->query($sql) === FALSE) {
        echo "Error inserting sr_score data: " . $conn->error . "\n";
    }
}

// close database connection
$conn->close();

/*
$_db_host = "localhost";
$_db_datenbank = "spacerunner";
$_db_username = "spacerunner";
$_db_passwort = "spacerunner";

// Establish a connection to the database
$mysqli = new mysqli($_db_host, $_db_username, $_db_passwort, $_db_datenbank);

// Check for any errors in the connection
if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

// Define variables for the form data
$username = $_POST['username'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Hash the password for security

// Validate the form data using regular expressions
if (!preg_match("/^[a-zA-Z0-9_-]{3,16}$/", $username)) {
    die("Error: Invalid username");
}

if (!preg_match("/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/", $email)) {
    die("Error: Invalid email address");
}

if (!preg_match("/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/", $_POST['password'])) {
    die("Error: Invalid password");
}

// Prepare a SQL statement to insert the data into the database
$stmt = $mysqli->prepare("INSERT INTO sr_user (username, email, password, user_deleted, last_login) VALUES (?, ?, ?, 0, NOW())");

// Bind the variables to the prepared statement as parameters
$stmt->bind_param("sss", $username, $email, $password);

// Execute the prepared statement
$stmt->execute();

// Check for any errors in the execution
if ($stmt->errno) {
    echo "Error: " . $stmt->error;
} else {
    echo "User created successfully!";
}

// Close the statement and database connection
$stmt->close();
$mysqli->close();
*/
?>

<?php 



//CSV and Reading stuff
$csv_file = fopen("example_data.csv", "r");
$header = fgetcsv($csv_file);
$data = array();

while (($row = fgetcsv($csv_file)) !== FALSE) {
    $hashed_password = password_hash($row[3], PASSWORD_DEFAULT);    
    $row[3] = $hashed_password;
    
    $data[] = $row;
}
fclose($csv_file);

// Print the data for testing purposes
echo '<pre>';
print_r($data);
echo '</pre>';

// Import the data into a MySQL database using SQL commands
// (not included in this code snippet)







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
?>
*/
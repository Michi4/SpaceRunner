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

if (!preg_match("/^(?=.*[a-zA-Z0-9])(?!.*e$).{3,}$/", $_POST['password'])) {
    die("Error: Invalid password");
}

// Prepare a SQL statement to insert the data into the database
$stmt = $mysqli->prepare("INSERT INTO sr_user (u_username, u_email, u_password, u_data_id, u_user_deleted, u_last_login) VALUES (?, ?, ?, NULL, 0, NOW())");

// Bind the variables to the prepared statement as parameters
$stmt->bind_param("sss", $username, $email, $password);

// Execute the prepared statement
try{
    $stmt->execute();
}catch (mysqli_sql_exception $ex) {
    echo "Error: " . $ex;
    
$stmt->close();
$mysqli->close();
    header("Location: ./signup.html");
    exit();
}

// Check for any errors in the execution
if ($stmt->errno) {
    //echo "Error: " . $stmt->error;
    
$stmt->close();
$mysqli->close();
    header("Location: ./signup.html");
    exit();
} else {
    echo "User created successfully!";
    
$stmt->close();
$mysqli->close();
    header("Location: ./login.html");
    exit();
}

// Close the statement and database connection
?>

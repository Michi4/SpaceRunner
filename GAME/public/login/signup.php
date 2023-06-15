<?php 
// Include the config.php file
require_once '../php/config.php';

// Database connection settings
$_db_host = getenv('DB_HOST');
$_db_database = getenv('DB_DATABASE');
$_db_username = getenv('DB_USERNAME');
$_db_password = getenv('DB_PASSWORD');

// Create a new database connection
$conn = new mysqli($_db_host, $_db_username, $_db_password, $_db_database);


// Check for any errors in the connection
if ($conn->connect_error) {
    die('Connect Error (' . $conn->connect_errno . ') '
            . $conn->connect_error);
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
$stmt = $conn->prepare("INSERT INTO sr_user (u_username, u_email, u_password, u_data_id, u_user_deleted, u_last_login) VALUES (?, ?, ?, NULL, 0, NOW())");

// Bind the variables to the prepared statement as parameters
$stmt->bind_param("sss", $username, $email, $password);

// Execute the prepared statement
try{
    $stmt->execute();
}catch (mysqli_sql_exception $ex) {
    echo "Error: " . $ex;
    
$stmt->close();
$conn->close();
    header("Location: ./signup.html");
    exit();
}

// Check for any errors in the execution
if ($stmt->errno) {
    //echo "Error: " . $stmt->error;
    
$stmt->close();
$conn->close();
    header("Location: ./signup.html");
    exit();
} else {
    echo "User created successfully!";
    
$stmt->close();
$conn->close();
    header("Location: ./login.html");
    exit();
}

// Close the statement and database connection
?>

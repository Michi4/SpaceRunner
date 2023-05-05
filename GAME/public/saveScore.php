<?php
session_start(); // Start the session
if (!isset($_SESSION['user_id'])) {
    exit;
}


// MySQL database connection parameters
$_db_host = "localhost";
$_db_database = "spacerunner";
$_db_username = "spacerunner";
$_db_password = "spacerunner";

// Create a new database connection
$conn = new mysqli($_db_host, $_db_username, $_db_password, $_db_database);

// Check the database connection for errors
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}



$user_id = $_SESSION['user_id'];
$sql = "SELECT * FROM sr_user WHERE u_id = $user_id;";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) == 1) {
    $row = mysqli_fetch_assoc($result);
    echo $row["username"];
}else{
    echo "Login first!";
    sleep(5);
    header("Location: ./login/login.html");
}
/*if($_GET["user_id"] != $_SESSION['user_id']){

}*/
?>
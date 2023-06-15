<?php
session_start(); // Start the session
if (!isset($_SESSION['user_id'])) {
    exit;
}

// Include the config.php file
require_once './config.php';

// Database connection settings
$_db_host = getenv('DB_HOST');
$_db_database = getenv('DB_DATABASE');
$_db_username = getenv('DB_USERNAME');
$_db_password = getenv('DB_PASSWORD');

// Create a new database connection
$conn = new mysqli($_db_host, $_db_username, $_db_password, $_db_database);


// Check if the connection was successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


// Check if the POST request contains the required data
if (isset($_POST['difficulty'], $_POST['score'], $_POST['level'])) {
    $scoreTypeId = getScoretypeId($_POST['difficulty']);
    $score = $_POST['score'];
    $level = $_POST['level'];
    $userId = $_SESSION['user_id']; 

    // Prepare the SQL statement
    $sql = "INSERT INTO sr_score (s_user_id, s_scoretype_id, s_score, s_level_reached, s_date_achieved)
            VALUES (?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    
    // Bind the parameters to the prepared statement
    $stmt->bind_param("iiii", $userId, $scoreTypeId, $score, $level);
        
    // Execute the prepared statement
    if ($stmt->execute()) {
        echo "Score saved successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close the statement
    $stmt->close();
} else {
    echo "Error: Incomplete data";
}

// Close the database connection
$conn->close();
 
function getScoretypeId($difficulty) {
    switch ($difficulty) {
        case 'hard':
            return 1;
        case 'impossible':
            return 2;
        case 'run':
            return 3;
        default:
            return 1; // Default to hard if difficulty is not recognized
    }
}
?>

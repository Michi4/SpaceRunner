<?php
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

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the username or email and password input from the form
    $username_email = $_POST["username-email"];
    $password = $_POST["login-password"];

    // Prepare a SQL statement to retrieve the user's password hash from the database
    $stmt = $conn->prepare("SELECT u_password FROM sr_user WHERE u_username = ? OR u_email = ?");
    $stmt->bind_param("ss", $username_email, $username_email);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if a row was returned from the database
    if ($result->num_rows == 1) {
        // Get the password hash from the database
        $row = $result->fetch_assoc();
        $password_hash = $row["u_password"];

        // Verify the password hash using the password_verify() function
        if (password_verify($password, $password_hash)) {
            // Update the user's last login time in the database
            $stmt = $conn->prepare("UPDATE sr_user SET u_last_login = NOW() WHERE u_username = ? OR u_email = ?");
            $stmt->bind_param("ss", $username_email, $username_email);
            $stmt->execute();

            // Create a SQL query to retrieve data from the "sr_user" table
            $sql = "SELECT u_id, u_username FROM sr_user WHERE u_username = ? OR u_email = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $username_email, $username_email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows == 1) {
                // Fetch the single row from the result set
                $row = $result->fetch_assoc();

                // Set the cookie with name, value, expiration time and path
                setcookie('user_id', $row["u_id"], time() + (3 * 24 * 60 * 60), '/');
                
                // Start the session and set the user ID
                session_start();
                $_SESSION['user_id'] = $row["u_id"];

                // Update the user's last login time in the database
                $stmt = $conn->prepare("UPDATE sr_user SET u_last_login = NOW() WHERE u_id = ?");
                $stmt->bind_param("i", $row["u_id"]);
                $stmt->execute();

                // Redirect the user to the home page or another page
                header("Location: ../index.html");
                exit();
            } else {
                die("Something went wrong :c");
            }
        } else {
            die("Invalid password");
        }
    } else {
        die("User not found");
    }
}

// Close the database connection
$conn->close();
?>

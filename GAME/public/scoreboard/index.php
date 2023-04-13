<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet">
    <script src="scipt.js" defer></script>
</head>
<body>
  
    <h1>Scores</h1>
    
    <table id="scoreTable">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
          <th>Level Reached</th>
          <th>Date Achieved</th>
        </tr>
      </thead>
      <tbody>
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

// Create a SQL query to retrieve data from the "sr_score" table
$sql = "SELECT * FROM sr_score";

// Execute the SQL query
$result = mysqli_query($conn, $sql);

// Check if there are any rows returned by the query
if (mysqli_num_rows($result) > 0) {
    // Initialize a counter variable
    $rank = 1;
    // Loop through each row and add the data to the HTML table
    while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
        echo "<td>" . $rank . "</td>";
        echo "<td>" . $row["user_id"] . "</td>";
        echo "<td>" . $row["score"] . "</td>";
        echo "<td>" . $row["level_reached"] . "</td>";
        echo "<td>" . $row["date_achieved"] . "</td>";
        echo "</tr>";
        // Increment the counter variable
        $rank++;
    }
} else {
    echo "No results found.";
}

// Close the MySQL connection
mysqli_close($conn);

?>

    </table>      

</body>
</html>
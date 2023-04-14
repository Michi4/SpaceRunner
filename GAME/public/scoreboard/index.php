<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js" defer></script>
</head>
<body>

<h1>Scores</h1>
<?php
echo '<form method="post" action="' . htmlspecialchars($_SERVER["PHP_SELF"]) . '">';
echo "<p>Search for a specific user</p>";
echo '<input type="text" name="username" placeholder="eg. Michi">';
echo '<input type="submit" name="submit" value="Submit">  
    </form><br>';
?>
<table id="scoreTable">
    <thead>
        <tr>
            <th data-order-by="rank">Rank</th>
            <th data-order-by="username">Player</th>
            <th data-order-by="score">Score</th>
            <th data-order-by="level_reached">Level</th>
            <th data-order-by="date_achieved">Date</th>
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

        // Set the default order
        $order = "score";
        $sort_order = "DESC";
        $search_username = "%";

        // Check if a new order was requested
        if (isset($_GET['order_by'])) {
            $order = $_GET['order_by'];
        }
        if (isset($_GET['sort_order'])) {
            $sort_order = $_GET['sort_order'];
        }
        if (isset($_POST['username'])) {
            $search_username = "%" . $_POST['username'] . "%";
        }

        // Create a SQL query to retrieve data from the "sr_score" table
        $sql = "SELECT u.username, s.score, s.level_reached, s.date_achieved, 
            (SELECT COUNT(*)+1 FROM sr_score s2 WHERE s2.score > s.score) AS rank
            FROM sr_score s
            INNER JOIN sr_user u ON s.user_id = u.id
            WHERE u.username LIKE '$search_username'
            ORDER BY $order $sort_order
            LIMIT 100;
        ";
         //   echo $sort_order . "<br>";//woa bissl ass mit ganz viele verwirrer
        //echo $sql;

        // Execute the SQL query
        $result = mysqli_query($conn, $sql);

        // Check if there are any rows returned by the query
        if (mysqli_num_rows($result) > 0) {
            // Initialize a counter variable
            $rank = 1;
            // Loop through each row and add the data to the HTML table
            while ($row = mysqli_fetch_assoc($result)) {
                echo "<tr>";
                echo "<td>" . $row["rank"] . "</td>";
                echo "<td>" . $row["username"] . "</td>";
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
        
echo "<p>Sort by clicking on the wanted column</p>";
    ?>
    </tbody>
</table>

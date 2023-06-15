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
<div class="wrapper">

<a href="../index.html"><svg class="icons back" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M130 480c40.6 0 80.4-11 115.2-31.9L352 384l-224 0 0 96h2zM352 128L245.2 63.9C210.4 43 170.6 32 130 32h-2v96l224 0zM96 128l0-96H80C53.5 32 32 53.5 32 80v48h8c-22.1 0-40 17.9-40 40v16V328v16c0 22.1 17.9 40 40 40H32v48c0 26.5 21.5 48 48 48H96l0-96h8c26.2 0 49.4-12.6 64-32H456c69.3 0 135-22.7 179.2-81.6c6.4-8.5 6.4-20.3 0-28.8C591 182.7 525.3 160 456 160H168c-14.6-19.4-37.8-32-64-32l-8 0zM512 243.6v24.9c0 19.6-15.9 35.6-35.6 35.6c-2.5 0-4.4-2-4.4-4.4V212.4c0-2.5 2-4.4 4.4-4.4c19.6 0 35.6 15.9 35.6 35.6z"/></svg></a>
<a href="../login/login.html"><svg class="icons user" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M370.7 96.1C346.1 39.5 289.7 0 224 0S101.9 39.5 77.3 96.1C60.9 97.5 48 111.2 48 128v64c0 16.8 12.9 30.5 29.3 31.9C101.9 280.5 158.3 320 224 320s122.1-39.5 146.7-96.1c16.4-1.4 29.3-15.1 29.3-31.9V128c0-16.8-12.9-30.5-29.3-31.9zM336 144v16c0 53-43 96-96 96H208c-53 0-96-43-96-96V144c0-26.5 21.5-48 48-48H288c26.5 0 48 21.5 48 48zM189.3 162.7l-6-21.2c-.9-3.3-3.9-5.5-7.3-5.5s-6.4 2.2-7.3 5.5l-6 21.2-21.2 6c-3.3 .9-5.5 3.9-5.5 7.3s2.2 6.4 5.5 7.3l21.2 6 6 21.2c.9 3.3 3.9 5.5 7.3 5.5s6.4-2.2 7.3-5.5l6-21.2 21.2-6c3.3-.9 5.5-3.9 5.5-7.3s-2.2-6.4-5.5-7.3l-21.2-6zM112.7 316.5C46.7 342.6 0 407 0 482.3C0 498.7 13.3 512 29.7 512H128V448c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64l98.3 0c16.4 0 29.7-13.3 29.7-29.7c0-75.3-46.7-139.7-112.7-165.8C303.9 338.8 265.5 352 224 352s-79.9-13.2-111.3-35.5zM176 448c-8.8 0-16 7.2-16 16v48h32V464c0-8.8-7.2-16-16-16zm96 32a16 16 0 1 0 0-32 16 16 0 1 0 0 32z"/></svg></a>

    <h1>Scores</h1>
    <?php
    echo '<form method="post" action="' . htmlspecialchars($_SERVER["PHP_SELF"]) . '">';
    echo "<p>Search for a specific user</p>";
    echo '<input type="text" name="username" placeholder="eg. Michi">';
    echo '<select name="scoretype">';
    
    // Include the config.php file
    require_once '../php/config.php';

    // Database connection settings
    $_db_host = getenv('DB_HOST');
    $_db_database = getenv('DB_DATABASE');
    $_db_username = getenv('DB_USERNAME');
    $_db_password = getenv('DB_PASSWORD');

    // Create a new database connection
    $conn = new mysqli($_db_host, $_db_username, $_db_password, $_db_database);

    // Check the database connection for errors
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Fetch score types from the database
    $scoreTypesQuery = "SELECT DISTINCT st_scoretype FROM sr_scoretype;";
    $scoreTypesResult = mysqli_query($conn, $scoreTypesQuery);
    echo '<option value="">all</option>';
    
    // Loop through each score type and create an option in the dropdown
    while ($scoreTypeRow = mysqli_fetch_assoc($scoreTypesResult)) {
        $scoreType = $scoreTypeRow["st_scoretype"];
        echo '<option value="' . $scoreType . '">' . $scoreType . '</option>';
    }
    
    echo '</select>';
    echo '<input type="submit" name="submit" value="Submit">  
        </form><br>';
    ?>
    <table id="scoreTable">
        <thead>
            <tr>
                <th data-order-by="s_rank">Rank</th>
                <th data-order-by="u_username">Player</th>
                <th data-order-by="s_score">Score</th>
                <th data-order-by="s_level_reached">Level</th>
                <th data-order-by="st_scoretype">Score Type</th>
                <th data-order-by="s_date_achieved">Date</th>
            </tr>
        </thead>
        <tbody>
        <?php
            // Set the default order
            $order = "s_score";
            $sort_order = "DESC";
            $search_username = "%";
            $search_scoretype = "";

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
            if (isset($_POST['scoretype'])) {
                $search_scoretype = $_POST['scoretype'];
            }

            // Create a SQL query to retrieve data from the "sr_score" table
            $sql = "SELECT u.u_username, s.s_score, s.s_level_reached, st.st_scoretype, s.s_date_achieved, 
                    (SELECT COUNT(*)+1 FROM sr_score s2 WHERE s2.s_score > s.s_score) AS s_rank, st.st_scoretype
                    FROM sr_score s
                    INNER JOIN sr_user u ON s.s_user_id = u.u_id
                    INNER JOIN sr_scoretype st ON s.s_scoretype_id = st.st_id
                    WHERE u.u_username LIKE '$search_username'";

            if ($search_scoretype) {
                $sql .= " AND st.st_scoretype = '$search_scoretype'";
            }

            $sql .= " ORDER BY $order $sort_order LIMIT 100;";

            // Execute the SQL query
            $result = mysqli_query($conn, $sql);

            // Check if there are any rows returned by the query
            if (mysqli_num_rows($result) > 0) {
                // Loop through each row and add the data to the HTML table
                while ($row = mysqli_fetch_assoc($result)) {
                    echo "<tr>";
                    echo "<td>" . $row["s_rank"] . "</td>";
                    echo "<td>" . $row["u_username"] . "</td>";
                    echo "<td>" . $row["s_score"] . "</td>";
                    echo "<td>" . $row["s_level_reached"] . "</td>";
                    echo "<td>" . $row["st_scoretype"] . "</td>";
                    echo "<td>" . $row["s_date_achieved"] . "</td>";
                    echo "</tr>";
                }
            } else {
                echo "No results found.";
            }

            // Close the MySQL connection
            mysqli_close($conn);
            
            echo "<p>Sort by clicking on the desired column</p>";
        ?>
        </tbody>
    </table>
</div>
</body>
</html>

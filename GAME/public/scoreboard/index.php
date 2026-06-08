<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scoreboard – SpaceRunner</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js" defer></script>
</head>
<body>
    <div class="wrapper">
        <a href="../index.html" class="nav-icon-link back-link" title="Main Menu">
            <svg class="icons back" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M130 480c40.6 0 80.4-11 115.2-31.9L352 384l-224 0 0 96h2zM352 128L245.2 63.9C210.4 43 170.6 32 130 32h-2v96l224 0zM96 128l0-96H80C53.5 32 32 53.5 32 80v48h8c-22.1 0-40 17.9-40 40v16V328v16c0 22.1 17.9 40 40 40H32v48c0 26.5 21.5 48 48 48H96l0-96h8c26.2 0 49.4-12.6 64-32H456c69.3 0 135-22.7 179.2-81.6c6.4-8.5 6.4-20.3 0-28.8C591 182.7 525.3 160 456 160H168c-14.6-19.4-37.8-32-64-32l-8 0zM512 243.6v24.9c0 19.6-15.9 35.6-35.6 35.6c-2.5 0-4.4-2-4.4-4.4V212.4c0-2.5 2-4.4 4.4-4.4c19.6 0 35.6 15.9 35.6 35.6z"/></svg>
        </a>
        <a href="../login/login.html" class="nav-icon-link user-link" title="Profile/Login">
            <svg class="icons user" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M370.7 96.1C346.1 39.5 289.7 0 224 0S101.9 39.5 77.3 96.1C60.9 97.5 48 111.2 48 128v64c0 16.8 12.9 30.5 29.3 31.9C101.9 280.5 158.3 320 224 320s122.1-39.5 146.7-96.1c16.4-1.4 29.3-15.1 29.3-31.9V128c0-16.8-12.9-30.5-29.3-31.9zM336 144v16c0 53-43 96-96 96H208c-53 0-96-43-96-96V144c0-26.5 21.5-48 48-48H288c26.5 0 48 21.5 48 48zM189.3 162.7l-6-21.2c-.9-3.3-3.9-5.5-7.3-5.5s-6.4 2.2-7.3 5.5l-6 21.2-21.2 6c-3.3 .9-5.5 3.9-5.5 7.3s2.2 6.4 5.5 7.3l21.2 6 6 21.2c.9 3.3 3.9 5.5 7.3 5.5s6.4-2.2 7.3-5.5l6-21.2 21.2-6c3.3-.9 5.5-3.9 5.5-7.3s-2.2-6.4-5.5-7.3l-21.2-6zM112.7 316.5C46.7 342.6 0 407 0 482.3C0 498.7 13.3 512 29.7 512H128V448c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64l98.3 0c16.4 0 29.7-13.3 29.7-29.7c0-75.3-46.7-139.7-112.7-165.8C303.9 338.8 265.5 352 224 352s-79.9-13.2-111.3-35.5zM176 448c-8.8 0-16 7.2-16 16v48h32V464c0-8.8-7.2-16-16-16zm96 32a16 16 0 1 0 0-32 16 16 0 1 0 0 32z"/></svg>
        </a>

        <h1 class="glow-title">Leaderboards</h1>

        <div class="scoreboard-controls">
            <div class="search-box">
                <input type="text" id="username-search" placeholder="Search player username...">
                <svg viewBox="0 0 512 512" class="search-icon"><path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
            </div>
            
            <div class="tabs-container" id="difficulty-tabs">
                <button class="tab-btn active" data-type="">All</button>
                <button class="tab-btn" data-type="hard">Hard</button>
                <button class="tab-btn" data-type="impossible">Impossible</button>
                <button class="tab-btn" data-type="run">Run Mode</button>
            </div>
        </div>

        <div class="table-container">
            <table id="scoreTable">
                <thead>
                    <tr>
                        <th data-order-by="s_rank" class="sortable">Rank <span class="sort-indicator"></span></th>
                        <th data-order-by="u_username" class="sortable">Player <span class="sort-indicator"></span></th>
                        <th data-order-by="s_score" class="sortable sorted desc">Score <span class="sort-indicator"></span></th>
                        <th data-order-by="s_level_reached" class="sortable">Level <span class="sort-indicator"></span></th>
                        <th data-order-by="st_scoretype" class="sortable">Difficulty <span class="sort-indicator"></span></th>
                        <th data-order-by="s_date_achieved" class="sortable">Date <span class="sort-indicator"></span></th>
                    </tr>
                </thead>
                <tbody id="scores-body">
                    <!-- Loaded dynamically via JavaScript -->
                </tbody>
            </table>
            <div id="no-results" class="no-results" hidden>No records found.</div>
            <div id="loading-spinner" class="loading-spinner">Loading scores...</div>
        </div>
    </div>
</body>
</html>

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
    <header class="game-header">
        <div class="header-logo"><a href="/">SpaceRunner</a></div>
        <nav class="header-nav">
            <a href="/" class="nav-btn" title="Back to Main Menu">
                <svg viewBox="0 0 576 512" class="nav-svg"><path fill="currentColor" d="M575.8 255.5c0 18-15 32.1-32 32.1h-32v224c0 17.7-14.3 32-32 32H352c-17.7 0-32-14.3-32-32V384H256v128c0 17.7-14.3 32-32 32H112c-17.7 0-32-14.3-32-32V287.6H48c-18 0-32-14.1-32-32.1c0-9 3-17 10-24L265 7c6-6 15-10 23-10s17 4 23 10L565 231.5c7 7 10.8 15 10.8 24z"/></svg>
                <span>Home</span>
            </a>
            <a href="/login/login" class="nav-btn" id="login-nav-btn" title="Login/Signup">
                <svg viewBox="0 0 448 512" class="nav-svg"><path fill="currentColor" d="M224 256A128 128 0 1 0 96 128a128 128 0 0 0 128 128zm89.6 32h-16.7a174.1 174.1 0 0 1-145.8 0h-16.7A111.6 111.6 0 0 0 24 399.6v40.4A72 72 0 0 0 96 512h256a72 72 0 0 0 72-72v-40.4A111.6 111.6 0 0 0 313.6 288z"/></svg>
                <span id="nav-user-text">Login</span>
            </a>
        </nav>
    </header>

    <div class="wrapper">

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
                        <th data-order-by="s_seed" class="sortable">Seed <span class="sort-indicator"></span></th>
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

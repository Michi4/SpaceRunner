<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Leaderboard – SpaceRunner</title>
    <meta name="description" content="The SpaceRunner global leaderboard. Top scores across Hard, Impossible and Run Mode – search players, sort and copy seeds.">
    <link rel="canonical" href="https://spacerunner.websters.at/scoreboard">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#9700bd">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="SpaceRunner">
    <meta property="og:title" content="Leaderboard – SpaceRunner">
    <meta property="og:description" content="Top SpaceRunner scores across Hard, Impossible and Run Mode.">
    <meta property="og:url" content="https://spacerunner.websters.at/scoreboard">
    <meta property="og:image" content="https://spacerunner.websters.at/img/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Leaderboard – SpaceRunner">
    <meta name="twitter:description" content="Top SpaceRunner scores across Hard, Impossible and Run Mode.">
    <meta name="twitter:image" content="https://spacerunner.websters.at/img/og-image.png">
    <link rel="icon" href="img/favicon.png" type="image/png">
    <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="stylesheet" href="style.css?v=2">
    <script src="../js/common.js?v=2" defer></script>
    <script src="script.js?v=2" defer></script>
</head>
<body>
    <header class="game-header">
        <div class="header-logo"><a href="/" aria-label="SpaceRunner – home"><span class="logo-full">SpaceRunner</span><span class="logo-short" aria-hidden="true">SR</span></a></div>
        <nav class="header-nav" aria-label="Main navigation">
            <a href="/" class="nav-btn" title="Back to Main Menu">
                <svg viewBox="0 0 576 512" class="nav-svg" aria-hidden="true"><path fill="currentColor" d="M575.8 255.5c0 18-15 32.1-32 32.1h-32v224c0 17.7-14.3 32-32 32H352c-17.7 0-32-14.3-32-32V384H256v128c0 17.7-14.3 32-32 32H112c-17.7 0-32-14.3-32-32V287.6H48c-18 0-32-14.1-32-32.1c0-9 3-17 10-24L265 7c6-6 15-10 23-10s17 4 23 10L565 231.5c7 7 10.8 15 10.8 24z"/></svg>
                <span class="nav-label">Home</span>
            </a>
            <a href="/login/login" class="nav-btn" id="login-nav-btn" title="Login/Signup">
                <svg viewBox="0 0 448 512" class="nav-svg" aria-hidden="true"><path fill="currentColor" d="M224 256A128 128 0 1 0 96 128a128 128 0 0 0 128 128zm89.6 32h-16.7a174.1 174.1 0 0 1-145.8 0h-16.7A111.6 111.6 0 0 0 24 399.6v40.4A72 72 0 0 0 96 512h256a72 72 0 0 0 72-72v-40.4A111.6 111.6 0 0 0 313.6 288z"/></svg>
                <span id="nav-user-text" class="nav-label">Login</span>
            </a>
            <button class="nav-btn" title="Toggle Fullscreen" data-action="fullscreen" aria-label="Toggle fullscreen">
                <svg viewBox="0 0 448 512" class="nav-svg" aria-hidden="true"><path fill="currentColor" d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM288 64c0 17.7 14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320c-17.7 0-32 14.3-32 32zm128 288c-17.7 0-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32v-96c0-17.7-14.3-32-32-32zM32 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64v-64c0-17.7-14.3-32-32-32z"/></svg>
            </button>
        </nav>
    </header>

    <main class="wrapper">

        <h1 class="glow-title">Leaderboards</h1>

        <div class="scoreboard-controls">
            <div class="search-box">
                <label class="visually-hidden" for="username-search">Search player username</label>
                <input type="text" id="username-search" placeholder="Search player username..." autocomplete="off" spellcheck="false" maxlength="30">
                <svg viewBox="0 0 512 512" class="search-icon" aria-hidden="true"><path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
            </div>

            <div class="tabs-container" id="difficulty-tabs" role="tablist" aria-label="Difficulty filter">
                <button class="tab-btn active" data-type="" role="tab" aria-selected="true">All</button>
                <button class="tab-btn" data-type="hard" role="tab" aria-selected="false">Hard</button>
                <button class="tab-btn" data-type="impossible" role="tab" aria-selected="false">Impossible</button>
                <button class="tab-btn" data-type="run" role="tab" aria-selected="false">Run Mode</button>
            </div>
        </div>

        <div class="table-container">
            <table id="scoreTable">
                <caption class="visually-hidden">SpaceRunner global leaderboard, sortable by column</caption>
                <thead>
                    <tr>
                        <th data-order-by="s_rank" class="sortable" tabindex="0">Rank <span class="sort-indicator" aria-hidden="true"></span></th>
                        <th data-order-by="u_username" class="sortable" tabindex="0">Player <span class="sort-indicator" aria-hidden="true"></span></th>
                        <th data-order-by="s_score" class="sortable sorted desc" tabindex="0" aria-sort="descending">Score <span class="sort-indicator" aria-hidden="true"></span></th>
                        <th data-order-by="s_level_reached" class="sortable" tabindex="0">Level <span class="sort-indicator" aria-hidden="true"></span></th>
                        <th data-order-by="st_scoretype" class="sortable" tabindex="0">Difficulty <span class="sort-indicator" aria-hidden="true"></span></th>
                        <th data-order-by="s_seed" class="sortable" tabindex="0">Seed <span class="sort-indicator" aria-hidden="true"></span></th>
                        <th data-order-by="s_date_achieved" class="sortable" tabindex="0">Date <span class="sort-indicator" aria-hidden="true"></span></th>
                    </tr>
                </thead>
                <tbody id="scores-body">
                    <!-- Loaded dynamically via JavaScript -->
                </tbody>
            </table>
            <div id="no-results" class="no-results" hidden>No records found.</div>
            <div id="loading-spinner" class="loading-spinner" role="status">Loading scores...</div>
        </div>

        <footer class="site-footer">
            <nav aria-label="Footer">
                <a href="/">Home</a><span aria-hidden="true"> · </span>
                <a href="/game">Play</a><span aria-hidden="true"> · </span>
                <a href="/lobby">Multiplayer</a><span aria-hidden="true"> · </span>
                <a href="/login/login">Login</a>
            </nav>
            <small>© 2026 SpaceRunner – free browser game.</small>
        </footer>
        <noscript><p class="noscript-note">The leaderboard needs JavaScript to load scores.</p></noscript>
    </main>
</body>
</html>

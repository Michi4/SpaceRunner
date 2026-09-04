'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('username-search');
    const tabContainer = document.getElementById('difficulty-tabs');
    const scoresBody = document.getElementById('scores-body');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noResults = document.getElementById('no-results');
    const headers = document.querySelectorAll('#scoreTable th.sortable');

    let currentType = '';
    let currentSearch = '';
    let currentOrderBy = 's_score';
    let currentSortOrder = 'DESC';
    let currentPage = 1;
    let totalPages = 1;
    let totalCount = 0;
    const pager = document.getElementById('pagination');
    // Monotonic request id: overlapping fetches (search while initial load
    // is in flight) must not render out of order and clobber newer results.
    let latestRequestId = 0;

    // Fetch and render scoreboard data
    async function loadScores() {
        const requestId = ++latestRequestId;
        loadingSpinner.hidden = false;
        scoresBody.innerHTML = '';
        noResults.hidden = true;

        try {
            const url = `get_scores.php?order_by=${encodeURIComponent(currentOrderBy)}&sort_order=${encodeURIComponent(currentSortOrder)}&search=${encodeURIComponent(currentSearch)}&scoretype=${encodeURIComponent(currentType)}&page=${currentPage}`;
            const response = await fetch(url);
            const data = await response.json();

            // A newer request has started since – drop this stale response
            if (requestId !== latestRequestId) return;

            loadingSpinner.hidden = true;

            if (!data.success) {
                scoresBody.innerHTML = `<tr><td colspan="7" style="color: #ff4d4d; text-align: center;">Error loading scores: ${escapeHtml(data.error)}</td></tr>`;
                renderPager();
                return;
            }

            currentPage = Number(data.page) || 1;
            totalPages = Number(data.pages) || 1;
            totalCount = Number(data.total) || 0;

            if (data.scores.length === 0) {
                noResults.hidden = false;
                renderPager();
                return;
            }

            data.scores.forEach(row => {
                const tr = document.createElement('tr');

                // Medal logic
                let rankContent = row.rank;
                if (row.rank === 1) rankContent = '<span class="rank-badge rank-gold" title="1st Place">1</span>';
                else if (row.rank === 2) rankContent = '<span class="rank-badge rank-silver" title="2nd Place">2</span>';
                else if (row.rank === 3) rankContent = '<span class="rank-badge rank-bronze" title="3rd Place">3</span>';

                // Date formatting (relative / readable)
                const formattedDate = formatAchievedDate(row.date);

                const rankCell = document.createElement('td');
                rankCell.innerHTML = rankContent;

                const userCell = document.createElement('td');
                userCell.textContent = row.username;

                const scoreCell = document.createElement('td');
                const scoreSpan = document.createElement('span');
                scoreSpan.className = 'score-highlight';
                scoreSpan.textContent = Number(row.score).toLocaleString();
                scoreCell.appendChild(scoreSpan);

                const levelCell = document.createElement('td');
                const levelSpan = document.createElement('span');
                levelSpan.className = 'level-highlight';
                levelSpan.textContent = row.level;
                levelCell.appendChild(levelSpan);

                const typeCell = document.createElement('td');
                const typeSpan = document.createElement('span');
                typeSpan.className = 'difficulty-badge badge-' + String(row.scoretype).replace(/[^a-z]/g, '');
                typeSpan.textContent = row.scoretype;
                typeCell.appendChild(typeSpan);

                const seedCell = document.createElement('td');
                if (row.seed) {
                    const seedBtn = document.createElement('button');
                    seedBtn.type = 'button';
                    seedBtn.className = 'seed-badge';
                    seedBtn.dataset.seed = row.seed;
                    seedBtn.title = 'Click to copy and play seed';
                    seedBtn.innerHTML = ''; seedBtn.append(document.createTextNode(row.seed + ' ')); const ch = document.createElement('span'); ch.className = 'copy-hint'; ch.textContent = 'copy'; seedBtn.append(ch);
                    seedCell.appendChild(seedBtn);
                } else {
                    seedCell.textContent = '-';
                }

                const dateCell = document.createElement('td');
                const parsedDate = parseScoreDate(row.date);
                if (parsedDate) dateCell.title = formatAbsolute(parsedDate);
                dateCell.textContent = formattedDate;

                tr.append(rankCell, userCell, scoreCell, levelCell, typeCell, seedCell, dateCell);
                scoresBody.appendChild(tr);
            });

            renderPager();

        } catch (error) {
            if (requestId !== latestRequestId) return;
            loadingSpinner.hidden = true;
            scoresBody.innerHTML = `<tr><td colspan="7" style="color: #ff4d4d; text-align: center;">Network error occurred.</td></tr>`;
            console.error('Scoreboard fetch error:', error);
        }
    }

    // Relative date formatter helper.
    // The API sends ISO-8601 UTC ("...+00:00"); `new Date` applies the
    // viewer's own timezone, so relative + absolute times are locale-correct.
    function parseScoreDate(dateStr) {
        if (!dateStr) return null;
        const iso = String(dateStr).includes('T') ? String(dateStr) : String(dateStr).replace(' ', 'T') + 'Z';
        const date = new Date(iso);
        return isNaN(date.getTime()) ? null : date;
    }

    function formatAbsolute(date) {
        return date.toLocaleString(undefined, {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    function formatAchievedDate(dateStr) {
        const date = parseScoreDate(dateStr);
        if (!date) return dateStr;

        const diffMs = Date.now() - date.getTime();
        if (diffMs < 0) return formatAbsolute(date); // clock skew guard
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;

        // Older than a week: absolute date in the viewer's locale
        return formatAbsolute(date);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Debounce helper for search input
    let searchDebounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadScores();
        }, 300);
    });

    // Tab switcher events
    tabContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;

        tabContainer.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        currentType = btn.getAttribute('data-type');
        currentPage = 1;
        loadScores();
    });

    // Sort trigger shared by mouse + keyboard
    function triggerSort(th) {
        const orderBy = th.getAttribute('data-order-by');

        // Toggle directions
        if (currentOrderBy === orderBy) {
            currentSortOrder = (currentSortOrder === 'DESC') ? 'ASC' : 'DESC';
        } else {
            currentOrderBy = orderBy;
            currentSortOrder = 'DESC'; // Default to DESC on new column click
        }

        // Update header classes + aria for sorting arrows UI
        headers.forEach(h => {
            h.classList.remove('sorted', 'asc', 'desc');
            h.removeAttribute('aria-sort');
        });
        th.classList.add('sorted', currentSortOrder.toLowerCase());
        th.setAttribute('aria-sort', currentSortOrder === 'DESC' ? 'descending' : 'ascending');
        currentPage = 1;

        loadScores();
    }

    // Dynamic sort headers (click + Enter/Space for keyboard users)
    headers.forEach(th => {
        th.addEventListener('click', () => triggerSort(th));
        th.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerSort(th);
            }
        });
    });

    // Seed copy via delegation (no inline onclick → no attribute-injection XSS)
    scoresBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.seed-badge');
        if (!btn || !btn.dataset.seed) return;
        const seed = btn.dataset.seed;
        navigator.clipboard.writeText(seed).then(() => {
            showToast('Seed copied: ' + seed);
        }).catch(err => {
            console.error('Failed to copy seed: ', err);
        });
    });

    // Pagination: Prev / windowed page numbers / Next
    function goToPage(page) {
        const p = Math.max(1, Math.min(totalPages || 1, page));
        if (p === currentPage) return;
        currentPage = p;
        loadScores();
        const table = document.getElementById('scoreTable');
        if (table) table.scrollIntoView({ block: 'nearest' });
    }

    function pagerButton(label, page, opts) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-btn' + (opts && opts.active ? ' active' : '');
        btn.textContent = label;
        if (opts && opts.label) btn.setAttribute('aria-label', opts.label);
        if (opts && (opts.disabled || opts.active)) {
            btn.disabled = true;
            if (opts.active) btn.setAttribute('aria-current', 'page');
        } else {
            btn.addEventListener('click', () => goToPage(page));
        }
        return btn;
    }

    function renderPager() {
        if (!pager) return;
        pager.innerHTML = '';
        if (totalPages <= 1) {
            pager.hidden = true;
            return;
        }
        pager.hidden = false;

        pager.appendChild(pagerButton('‹ Prev', currentPage - 1, {
            label: 'Previous page', disabled: currentPage <= 1,
        }));

        // Windowed numbers: 1 … p-1 p p+1 … N
        const nums = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
        let last = 0;
        [...nums].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b).forEach(n => {
            if (n - last > 1) {
                const gap = document.createElement('span');
                gap.className = 'page-gap';
                gap.textContent = '…';
                gap.setAttribute('aria-hidden', 'true');
                pager.appendChild(gap);
            }
            pager.appendChild(pagerButton(String(n), n, {
                label: 'Page ' + n, active: n === currentPage,
            }));
            last = n;
        });

        pager.appendChild(pagerButton('Next ›', currentPage + 1, {
            label: 'Next page', disabled: currentPage >= totalPages,
        }));

        const info = document.createElement('span');
        info.className = 'page-info';
        info.textContent = `${totalCount} scores · page ${currentPage} of ${totalPages}`;
        pager.appendChild(info);
    }

    // Initial load
    loadScores();

    function showToast(message) {
        let toast = document.getElementById('scoreboard-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'scoreboard-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(151, 0, 189, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 12px 24px;
                color: white;
                font-family: 'space-mono', monospace;
                font-size: 0.9rem;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                z-index: 10000;
                transition: opacity 0.3s ease, transform 0.3s ease;
                opacity: 0;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
        }, 2500);
    }
});

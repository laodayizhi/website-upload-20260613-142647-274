(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(target) {
            if (!slides.length) {
                return;
            }

            index = (target + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        slider.addEventListener('mouseenter', stopTimer);
        slider.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var filterInput = document.querySelector('[data-card-search]');
    var filterButtons = document.querySelector('[data-filter-buttons]');
    var filterGrid = document.querySelector('.filterable-grid');

    function applyCardFilter() {
        if (!filterGrid) {
            return;
        }

        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var activeButton = filterButtons ? filterButtons.querySelector('.is-active') : null;
        var value = activeButton ? activeButton.getAttribute('data-filter-value') : 'all';
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category')
            ].join(' ').toLowerCase();
            var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchesValue = value === 'all' || text.indexOf(value.toLowerCase()) !== -1;
            card.classList.toggle('is-hidden-card', !(matchesKeyword && matchesValue));
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyCardFilter);
    }

    if (filterButtons) {
        filterButtons.addEventListener('click', function (event) {
            var button = event.target.closest('button');

            if (!button) {
                return;
            }

            filterButtons.querySelectorAll('button').forEach(function (item) {
                item.classList.remove('is-active');
            });

            button.classList.add('is-active');
            applyCardFilter();
        });
    }

    applyCardFilter();

    var searchForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-global-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var suggestions = document.querySelectorAll('[data-search-suggest]');

    function buildSearchCard(movie) {
        return [
            '<a class="movie-card" href="' + movie.link + '">',
            '<span class="poster-wrap">',
            '<img src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="badge badge-year">' + escapeHtml(movie.year) + '</span>',
            '<span class="badge badge-region">' + escapeHtml(movie.region) + '</span>',
            '</span>',
            '<span class="card-body">',
            '<strong>' + escapeHtml(movie.title) + '</strong>',
            '<span>' + escapeHtml(movie.oneLine) + '</span>',
            '<span class="card-meta">',
            '<em>' + escapeHtml(movie.type) + '</em>',
            '<em>' + escapeHtml(movie.genre) + '</em>',
            '<em>★ ' + escapeHtml(movie.rating) + '</em>',
            '</span>',
            '</span>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (item) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[item];
        });
    }

    function renderSearch() {
        if (!searchInput || !searchResults || !window.__SEARCH_MOVIES__) {
            return;
        }

        var keyword = searchInput.value.trim().toLowerCase();
        var items = window.__SEARCH_MOVIES__;

        if (keyword) {
            items = items.filter(function (movie) {
                return [movie.title, movie.region, movie.year, movie.genre, movie.tags, movie.type]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(keyword) !== -1;
            });
        }

        items = items.slice(0, 80);

        if (!items.length) {
            searchResults.innerHTML = '<div class="empty-result">没有找到匹配内容，请尝试其他关键词。</div>';
            return;
        }

        searchResults.innerHTML = items.map(buildSearchCard).join('');
    }

    if (searchForm && searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            renderSearch();
        });

        suggestions.forEach(function (button) {
            button.addEventListener('click', function () {
                searchInput.value = button.getAttribute('data-search-suggest') || '';
                renderSearch();
            });
        });

        renderSearch();
    }
}());

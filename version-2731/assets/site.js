
(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }

            index = (next + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    var filterGroups = document.querySelectorAll('[data-filter-group]');

    filterGroups.forEach(function (group) {
        var filters = {};
        var list = document.querySelector('[data-filter-list]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        group.addEventListener('click', function (event) {
            var button = event.target.closest('button[data-filter-field]');

            if (!button) {
                return;
            }

            var field = button.getAttribute('data-filter-field');
            var value = button.getAttribute('data-filter-value');
            var row = button.closest('.filter-row');

            if (row) {
                row.querySelectorAll('button').forEach(function (item) {
                    item.classList.remove('active');
                });

                button.classList.add('active');
            }

            if (field === 'all' || value === 'all') {
                if (row && row.textContent.indexOf('地区') !== -1) {
                    delete filters.region;
                }

                if (row && row.textContent.indexOf('年份') !== -1) {
                    delete filters.year;
                }
            } else {
                filters[field] = value;
            }

            cards.forEach(function (card) {
                var visible = true;

                Object.keys(filters).forEach(function (filterField) {
                    if (card.getAttribute('data-' + filterField) !== filters[filterField]) {
                        visible = false;
                    }
                });

                card.style.display = visible ? '' : 'none';
            });
        });
    });

    function attachPlayer(shell) {
        var video = shell.querySelector('video[data-src]');
        var button = shell.querySelector('[data-play-button]');
        var message = shell.querySelector('[data-player-message]');
        var hlsInstance = null;

        if (!video || !button) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function loadSource() {
            var source = video.getAttribute('data-src');

            if (!source) {
                setMessage('播放源暂不可用');
                return Promise.reject(new Error('empty source'));
            }

            if (video.getAttribute('data-loaded') === 'true') {
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                video.setAttribute('data-loaded', 'true');
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.setAttribute('data-loaded', 'true');
                return Promise.resolve();
            }

            video.src = source;
            video.setAttribute('data-loaded', 'true');
            return Promise.resolve();
        }

        function playVideo() {
            setMessage('正在载入播放源');

            loadSource().then(function () {
                shell.classList.add('playing');
                var playPromise = video.play();

                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(function () {
                        setMessage('');
                    }).catch(function () {
                        setMessage('请再次点击播放按钮');
                        shell.classList.remove('playing');
                    });
                } else {
                    setMessage('');
                }
            }).catch(function () {
                shell.classList.remove('playing');
            });
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('play', function () {
            shell.classList.add('playing');
            setMessage('');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('playing');
            }
        });
        video.addEventListener('error', function () {
            setMessage('播放加载失败，请稍后重试');
            shell.classList.remove('playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-video-shell]').forEach(attachPlayer);

    function createSearchCard(movie) {
        return [
            '<article class="movie-card">',
            '<a class="movie-poster" href="./' + movie.file + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-badge">' + movie.rating + '</span>',
            '<span class="poster-play">播放</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }

    var searchResults = document.querySelector('[data-search-results]');
    var searchInput = document.querySelector('[data-search-input]');

    if (searchResults && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();

        if (searchInput) {
            searchInput.value = query;
        }

        if (query) {
            var lower = query.toLowerCase();
            var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine].join(' ').toLowerCase().indexOf(lower) !== -1;
            }).slice(0, 120);

            if (matched.length) {
                searchResults.innerHTML = matched.map(createSearchCard).join('');
            } else {
                searchResults.innerHTML = '<div class="search-empty">没有找到匹配影片，可尝试更换关键词。</div>';
            }
        }
    }
})();

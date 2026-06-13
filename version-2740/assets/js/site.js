(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        };

        var restart = function () {
            window.clearInterval(timer);
            start();
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        showSlide(0);
        start();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var scope = panel.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-movie-card'));
        var search = panel.querySelector('.js-search');
        var typeButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
        var yearButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year]'));
        var activeType = 'all';
        var activeYear = 'all';

        var apply = function () {
            var query = search ? search.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedType = activeType === 'all' || cardType === activeType;
                var matchedYear = activeYear === 'all' || cardYear === activeYear;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedType && matchedYear));
            });
        };

        if (search) {
            search.addEventListener('input', apply);
        }

        typeButtons.forEach(function (button, index) {
            if (index === 0) {
                button.classList.add('is-active');
            }

            button.addEventListener('click', function () {
                typeButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                activeType = button.getAttribute('data-filter-type') || 'all';
                apply();
            });
        });

        yearButtons.forEach(function (button, index) {
            if (index === 0) {
                button.classList.add('is-active');
            }

            button.addEventListener('click', function () {
                yearButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                activeYear = button.getAttribute('data-filter-year') || 'all';
                apply();
            });
        });
    });
}());

function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var playButton = document.getElementById(config.buttonId);
    var source = config.source;
    var hls = null;

    if (!video || !source) {
        return;
    }

    var attachSource = function () {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    };

    var hideOverlay = function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    };

    var showOverlay = function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    };

    var playVideo = function () {
        attachSource();
        hideOverlay();
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                showOverlay();
            });
        }
    };

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    if (playButton) {
        playButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            playVideo();
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
}

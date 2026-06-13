function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getRoot() {
    return document.body.dataset.root || '';
}

function initMobileNavigation() {
    const button = document.querySelector('[data-mobile-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
        return;
    }

    button.addEventListener('click', () => {
        menu.classList.toggle('is-open');
    });
}

function initSiteSearchForms() {
    const forms = document.querySelectorAll('[data-site-search]');

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';

            if (!query) {
                return;
            }

            const action = form.getAttribute('action') || `${getRoot()}search.html`;
            window.location.href = `${action}?q=${encodeURIComponent(query)}`;
        });
    });
}

function initHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function restartTimer() {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => show(current + 1), 5500);
    }

    if (!slides.length) {
        return;
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            show(index);
            restartTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            show(current - 1);
            restartTimer();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            show(current + 1);
            restartTimer();
        });
    }

    show(0);
    restartTimer();
}

function initCategoryFilters() {
    const filterRoot = document.querySelector('[data-category-filter]');

    if (!filterRoot) {
        return;
    }

    const keywordInput = filterRoot.querySelector('[data-filter-keyword]');
    const typeSelect = filterRoot.querySelector('[data-filter-type]');
    const yearSelect = filterRoot.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const counter = document.querySelector('[data-filter-count]');

    function filterCards() {
        const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        const type = typeSelect ? typeSelect.value : '';
        const year = yearSelect ? yearSelect.value : '';
        let visible = 0;

        cards.forEach((card) => {
            const text = card.dataset.searchText || '';
            const cardType = card.dataset.type || '';
            const cardYear = card.dataset.year || '';
            const matchKeyword = !keyword || text.includes(keyword);
            const matchType = !type || cardType === type;
            const matchYear = !year || cardYear === year;
            const shouldShow = matchKeyword && matchType && matchYear;

            card.classList.toggle('hidden', !shouldShow);

            if (shouldShow) {
                visible += 1;
            }
        });

        if (counter) {
            counter.textContent = String(visible);
        }
    }

    [keywordInput, typeSelect, yearSelect].forEach((control) => {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    filterCards();
}

function createSearchCard(movie) {
    return `
        <article class="movie-card">
            <a class="movie-card-link" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
                <div class="movie-card-cover">
                    <img src="${escapeHtml(movie.coverImage)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                    <span class="movie-card-badge">${escapeHtml(movie.category)}</span>
                    <span class="movie-card-play">▶</span>
                </div>
                <div class="movie-card-body">
                    <h3>${escapeHtml(movie.title)}</h3>
                    <p>${escapeHtml(movie.description)}</p>
                    <div class="movie-card-meta">
                        <span>${escapeHtml(movie.year)}</span>
                        <span>${escapeHtml(movie.type)}</span>
                        <span>${Number(movie.views).toLocaleString()} 次观看</span>
                    </div>
                </div>
            </a>
        </article>
    `;
}

async function initSearchPage() {
    const resultsRoot = document.querySelector('[data-search-results]');

    if (!resultsRoot) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const keywordNode = document.querySelector('[data-search-keyword]');
    const countNode = document.querySelector('[data-search-count]');

    if (keywordNode) {
        keywordNode.textContent = query || '全部影片';
    }

    try {
        const response = await fetch(`${getRoot()}assets/data/search-index.json`, { cache: 'force-cache' });
        const movies = await response.json();
        const normalizedQuery = query.toLowerCase();
        const results = normalizedQuery
            ? movies.filter((movie) => movie.searchText.includes(normalizedQuery))
            : movies.slice(0, 120);

        if (countNode) {
            countNode.textContent = String(results.length);
        }

        if (!results.length) {
            resultsRoot.innerHTML = `
                <div class="search-empty">
                    <h2>未找到相关内容</h2>
                    <p>请尝试使用影片名、类型、地区、年份或标签搜索。</p>
                </div>
            `;
            return;
        }

        resultsRoot.innerHTML = results.map(createSearchCard).join('');
    } catch (error) {
        resultsRoot.innerHTML = `
            <div class="search-empty">
                <h2>搜索数据暂时无法读取</h2>
                <p>请将网站部署到静态服务器后再使用搜索功能。</p>
            </div>
        `;
    }
}

async function initHlsPlayers() {
    const players = Array.from(document.querySelectorAll('video[data-hls-src]'));

    if (!players.length) {
        return;
    }

    let Hls = null;

    try {
        const module = await import('./hls-vendor-dru42stk.js');
        Hls = module.H;
    } catch (error) {
        Hls = null;
    }

    players.forEach((video) => {
        const src = video.dataset.hlsSrc;
        const shell = video.closest('.player-shell');
        const status = shell ? shell.querySelector('[data-video-status]') : null;
        const playButton = shell ? shell.querySelector('[data-video-play]') : null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        if (!src) {
            setStatus('未配置播放源');
            return;
        }

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setStatus('播放源已就绪');
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus('网络波动，正在重试');
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus('媒体错误，正在恢复');
                    hls.recoverMediaError();
                } else {
                    setStatus('播放源加载失败');
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            setStatus('原生 HLS 已就绪');
        } else {
            video.src = src;
            setStatus('浏览器将尝试直接播放');
        }

        if (playButton) {
            playButton.addEventListener('click', async () => {
                try {
                    await video.play();
                    playButton.classList.add('hidden');
                    setStatus('正在播放');
                } catch (error) {
                    setStatus('请使用播放器控件开始播放');
                }
            });
        }

        video.addEventListener('play', () => {
            if (playButton) {
                playButton.classList.add('hidden');
            }
            setStatus('正在播放');
        });

        video.addEventListener('pause', () => {
            if (playButton) {
                playButton.classList.remove('hidden');
            }
            setStatus('已暂停');
        });
    });
}

initMobileNavigation();
initSiteSearchForms();
initHeroCarousel();
initCategoryFilters();
initSearchPage();
initHlsPlayers();

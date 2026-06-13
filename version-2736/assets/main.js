const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

const mobileButton = $('.mobile-menu-button');
const mobilePanel = $('.mobile-panel');

if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', () => {
        const opened = mobilePanel.classList.toggle('open');
        mobileButton.setAttribute('aria-expanded', String(opened));
        mobileButton.textContent = opened ? '×' : '☰';
    });
}

$$('.site-search-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = form.querySelector('input[name="q"]');
        const query = input ? input.value.trim() : '';
        const target = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
        window.location.href = target;
    });
});

const hero = $('[data-hero]');

if (hero) {
    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    const prev = $('[data-hero-prev]', hero);
    const next = $('[data-hero-next]', hero);
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, idx) => slide.classList.toggle('active', idx === current));
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));
    };

    const move = (step) => showSlide(current + step);

    const start = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => move(1), 5200);
    };

    if (prev) {
        prev.addEventListener('click', () => {
            move(-1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            move(1);
            start();
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    showSlide(0);
    start();
}

const normalize = (value) => (value || '').toString().trim().toLowerCase();

const applyFilters = (panel) => {
    const grid = panel.parentElement.querySelector('[data-filter-grid]');
    if (!grid) {
        return;
    }

    const keyword = normalize($('.filter-keyword', panel)?.value);
    const type = normalize($('.filter-type', panel)?.value);
    const year = normalize($('.filter-year', panel)?.value);
    const region = normalize($('.filter-region', panel)?.value);
    const cards = $$('[data-movie-card]', grid);
    let visible = 0;

    cards.forEach((card) => {
        const text = normalize(`${card.dataset.tags || ''} ${card.dataset.title || ''} ${card.dataset.genre || ''}`);
        const matchesKeyword = !keyword || text.includes(keyword);
        const matchesType = !type || normalize(card.dataset.type).includes(type);
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const matchesRegion = !region || normalize(card.dataset.region).includes(region);
        const show = matchesKeyword && matchesType && matchesYear && matchesRegion;
        card.hidden = !show;
        if (show) {
            visible += 1;
        }
    });

    const emptyState = panel.parentElement.querySelector('[data-empty-state]');
    if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
    }
};

$$('[data-filter-panel]').forEach((panel) => {
    $$('input, select', panel).forEach((control) => {
        control.addEventListener('input', () => applyFilters(panel));
        control.addEventListener('change', () => applyFilters(panel));
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const keywordInput = $('.filter-keyword', panel);
    if (query && keywordInput) {
        keywordInput.value = query;
    }

    applyFilters(panel);
});

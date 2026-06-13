(function () {
  var menuButton = document.querySelector('[data-mobile-menu]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      menuButton.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 360);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.parentElement;
    var items = Array.prototype.slice.call(scope.querySelectorAll('.filter-item'));
    var keyword = panel.querySelector('[data-filter-keyword]');
    var type = panel.querySelector('[data-filter-type]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var empty = scope.querySelector('[data-empty-state]');

    function value(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function matches(item, key, dataName) {
      if (!key) {
        return true;
      }
      return String(item.dataset[dataName] || '').toLowerCase() === key;
    }

    function apply() {
      var key = value(keyword);
      var selectedType = value(type);
      var selectedRegion = value(region);
      var selectedYear = value(year);
      var visible = 0;

      items.forEach(function (item) {
        var haystack = [
          item.dataset.title,
          item.dataset.genre,
          item.dataset.tags,
          item.dataset.region,
          item.dataset.type,
          item.dataset.year
        ].join(' ').toLowerCase();
        var ok = (!key || haystack.indexOf(key) !== -1) &&
          matches(item, selectedType, 'type') &&
          matches(item, selectedRegion, 'region') &&
          matches(item, selectedYear, 'year');
        item.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, type, region, year].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SEARCH_ITEMS) {
    var searchInput = searchPage.querySelector('[data-search-input]');
    var searchCategory = searchPage.querySelector('[data-search-category]');
    var searchButton = searchPage.querySelector('[data-search-button]');
    var results = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (searchInput) {
      searchInput.value = initial;
    }

    function renderItem(item) {
      return '<a class="movie-card" href="' + item.detailUrl + '">' +
        '<span class="card-cover">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="card-year">' + escapeHtml(item.year) + '</span>' +
        '<span class="card-play" aria-hidden="true">▶</span>' +
        '</span>' +
        '<span class="card-body">' +
        '<span class="card-category">' + escapeHtml(item.category) + '</span>' +
        '<strong>' + escapeHtml(item.title) + '</strong>' +
        '<em>' + escapeHtml(item.oneLine) + '</em>' +
        '</span>' +
        '</a>';
    }

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function runSearch() {
      var key = (searchInput ? searchInput.value : '').trim().toLowerCase();
      var cat = (searchCategory ? searchCategory.value : '').trim();
      var matched = window.SEARCH_ITEMS.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        return (!key || haystack.indexOf(key) !== -1) && (!cat || item.category === cat);
      }).slice(0, 120);

      if (!results) {
        return;
      }

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        return;
      }

      results.innerHTML = matched.map(renderItem).join('');
    }

    if (searchButton) {
      searchButton.addEventListener('click', runSearch);
    }
    if (searchInput) {
      searchInput.addEventListener('input', runSearch);
    }
    if (searchCategory) {
      searchCategory.addEventListener('change', runSearch);
    }
    runSearch();
  }
})();

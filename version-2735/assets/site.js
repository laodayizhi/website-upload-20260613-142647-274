(function () {
  'use strict';

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function toggleHidden(element) {
    if (!element) {
      return;
    }
    element.hidden = !element.hidden;
  }

  function initHeader() {
    var searchToggle = $('.search-toggle');
    var searchPanel = $('.header-search');
    var menuToggle = $('.menu-toggle');
    var mobileNav = $('.mobile-nav');

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener('click', function () {
        toggleHidden(searchPanel);
        if (!searchPanel.hidden) {
          var input = $('input', searchPanel);
          if (input) {
            input.focus();
          }
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        toggleHidden(mobileNav);
      });
    }
  }

  function initHero() {
    var root = $('[data-hero]');
    if (!root) {
      return;
    }

    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });

    root.addEventListener('mouseenter', stopTimer);
    root.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initLocalFilters() {
    var panel = $('[data-filter-panel]');
    var list = $('[data-filter-list]');
    if (!panel || !list) {
      return;
    }

    var keywordInput = $('[data-filter-keyword]', panel);
    var typeSelect = $('[data-filter-type]', panel);
    var yearSelect = $('[data-filter-year]', panel);
    var resetButton = $('[data-filter-reset]', panel);
    var emptyState = $('[data-empty-state]');
    var cards = $all('.movie-card', list);

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var visible = matchesKeyword && matchesType && matchesYear;
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilter();
      });
    }
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function attachPlayer(shell) {
    var video = $('video', shell);
    var button = $('[data-player-start]', shell);
    var source = shell.getAttribute('data-src');
    var started = false;

    if (!video || !button || !source) {
      return;
    }

    function playNative() {
      video.src = source;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function startPlayer() {
      if (started) {
        playNative();
        return;
      }
      started = true;
      button.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        playNative();
        return;
      }

      loadHlsLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
              promise.catch(function () {});
            }
          });
        } else {
          playNative();
        }
      });
    }

    button.addEventListener('click', startPlayer);
    video.addEventListener('click', function () {
      if (!started) {
        startPlayer();
      }
    });
  }

  function initPlayers() {
    $all('[data-player]').forEach(attachPlayer);
  }

  function movieCardMarkup(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-overlay">立即观看</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var data = window.MOVIE_SEARCH_DATA || [];
    var form = $('[data-search-page-form]');
    var input = $('[data-search-input]');
    var category = $('[data-search-category]');
    var year = $('[data-search-year]');
    var summary = $('[data-search-summary]');
    var results = $('[data-search-results]');

    if (!form || !input || !summary || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function search() {
      var query = normalize(input.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var matched = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.category,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' '));
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okCategory = !categoryValue || normalize(movie.categorySlug) === categoryValue;
        var okYear = !yearValue || normalize(movie.year) === yearValue;
        return okQuery && okCategory && okYear;
      }).slice(0, 120);

      if (!query && !categoryValue && !yearValue) {
        matched = data.slice(0, 48);
      }

      summary.textContent = '找到 ' + matched.length + ' 条结果' + (matched.length === 120 ? '（最多显示 120 条，请继续细化关键词）' : '');
      results.innerHTML = matched.map(movieCardMarkup).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      search();
    });

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', search);
        control.addEventListener('change', search);
      }
    });

    search();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initLocalFilters();
    initPlayers();
    initSearchPage();
  });
})();

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        startTimer();
      });
    });

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    startTimer();
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function setupCategoryFilters() {
    var toolbar = document.querySelector("[data-filter-toolbar]");
    var grid = document.querySelector("[data-filter-grid]");
    var status = document.querySelector("[data-filter-status]");
    if (!toolbar || !grid) {
      return;
    }

    var textInput = toolbar.querySelector("[data-filter-text]");
    var yearSelect = toolbar.querySelector("[data-filter-year]");
    var regionSelect = toolbar.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

    function cardText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
    }

    function applyFilters() {
      var query = (textInput && textInput.value || "").trim().toLowerCase();
      var year = yearSelect && yearSelect.value || "";
      var region = regionSelect && regionSelect.value || "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var matchesText = !query || cardText(card).indexOf(query) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var matchesRegion = !region || card.getAttribute("data-region") === region;
        var visible = matchesText && matchesYear && matchesRegion;
        card.classList.toggle("is-filter-hidden", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (status) {
        status.textContent = "当前显示 " + visibleCount + " 部影片";
      }
    }

    [textInput, yearSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupHeaderSearch();
    setupCategoryFilters();
  });
})();

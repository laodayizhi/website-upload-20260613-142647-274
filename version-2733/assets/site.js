(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-button");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function() {
      nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
        slide.setAttribute("aria-hidden", i === current ? "false" : "true");
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
      });
    });
    window.setInterval(function() {
      show(current + 1);
    }, 5200);
  }

  function filterCards(value) {
    var query = (value || "").trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
    var shown = 0;
    cards.forEach(function(card) {
      var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      var match = !query || text.indexOf(query) !== -1;
      card.style.display = match ? "" : "none";
      if (match) {
        shown += 1;
      }
    });
    var empty = document.querySelector(".empty-state");
    if (empty) {
      empty.classList.toggle("is-visible", shown === 0);
    }
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-filter]"));
    if (!inputs.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    inputs.forEach(function(input) {
      if (q && !input.value) {
        input.value = q;
      }
      input.addEventListener("input", function() {
        filterCards(input.value);
      });
    });
    if (q) {
      filterCards(q);
    }
  }

  function initPlayer() {
    var video = document.querySelector("video[data-stream]");
    if (!video) {
      return;
    }
    var trigger = document.querySelector(".play-trigger");
    var cover = document.querySelector(".player-cover");
    var stream = video.getAttribute("data-stream");
    function bind() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = stream;
      }
      video.setAttribute("data-ready", "1");
    }
    function start() {
      bind();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function() {});
      }
    }
    if (trigger) {
      trigger.addEventListener("click", start);
    }
    if (cover && cover !== trigger) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function() {
      if (video.getAttribute("data-ready") !== "1") {
        start();
      }
    });
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();

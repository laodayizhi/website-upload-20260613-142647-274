(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\" data-movie-card>" +
        "<a href=\"movies/movie-" + movie.id + ".html\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
          "<div class=\"poster-wrap\">" +
            "<img src=\"./" + movie.image_num + ".jpg\" alt=\"" + escapeHtml(movie.title) + " 海报\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>" +
          "</div>" +
          "<div class=\"movie-card-body\">" +
            "<div class=\"movie-card-meta\">" +
              "<span>" + escapeHtml(movie.region) + "</span>" +
              "<span>" + escapeHtml(movie.year) + "</span>" +
            "</div>" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p>" + escapeHtml(movie.one_line) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
          "</div>" +
        "</a>" +
      "</article>";
  }

  function scoreMovie(movie, queryParts) {
    var text = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.category_name,
      movie.one_line,
      (movie.tags || []).join(" ")
    ].join(" ").toLowerCase();

    var score = 0;
    queryParts.forEach(function (part) {
      if (!part) {
        return;
      }
      if (String(movie.title).toLowerCase().indexOf(part) !== -1) {
        score += 8;
      }
      if (text.indexOf(part) !== -1) {
        score += 2;
      }
    });
    return score;
  }

  ready(function () {
    var movies = window.SITE_MOVIES || [];
    var results = document.querySelector("[data-search-results]");
    var meta = document.querySelector("[data-search-meta]");
    var form = document.querySelector("[data-search-page-form]");
    var input = form && form.querySelector("input[name='q']");
    var query = getQuery();

    if (input) {
      input.value = query;
    }

    if (!results) {
      return;
    }

    if (!query) {
      var initial = movies.slice(0, 48);
      results.innerHTML = initial.map(movieCard).join("");
      if (meta) {
        meta.textContent = "可输入片名、类型、标签、地区或年份进行搜索，当前展示前 48 部影片。";
      }
      return;
    }

    var queryParts = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = movies
      .map(function (movie) {
        return {
          movie: movie,
          score: scoreMovie(movie, queryParts)
        };
      })
      .filter(function (item) {
        return item.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || b.movie.views - a.movie.views;
      })
      .slice(0, 240)
      .map(function (item) {
        return item.movie;
      });

    if (meta) {
      meta.innerHTML = "关键词：<strong>" + escapeHtml(query) + "</strong>，找到 " + matched.length + " 个结果";
    }

    if (!matched.length) {
      results.innerHTML = "<div class=\"prose-card\"><h2>未找到相关内容</h2><p>请尝试使用其他关键词搜索。</p></div>";
      return;
    }

    results.innerHTML = matched.map(movieCard).join("");
  });
})();

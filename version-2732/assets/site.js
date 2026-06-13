(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero-carousel]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        restart();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterItems(input) {
        var scopeId = input.getAttribute("data-filter-scope");
        var scope = scopeId ? document.getElementById(scopeId) : document;

        if (!scope) {
            return;
        }

        var query = normalize(input.value);
        var items = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-item]"));

        items.forEach(function (item) {
            var text = [
                item.getAttribute("data-title"),
                item.getAttribute("data-region"),
                item.getAttribute("data-genre"),
                item.getAttribute("data-tags"),
                item.textContent
            ].join(" ");

            item.classList.toggle("is-hidden", query && normalize(text).indexOf(query) === -1);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function (input) {
        input.addEventListener("input", function () {
            filterItems(input);
        });

        if (input.id === "site-search-input") {
            var params = new URLSearchParams(window.location.search);
            var value = params.get("q");

            if (value) {
                input.value = value;
                filterItems(input);
            }
        }
    });
})();

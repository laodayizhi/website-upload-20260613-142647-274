function startMoviePlayer(videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var loaded = false;
    var pending = false;
    var hlsPlayer = null;

    if (!video || !url) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsPlayer.loadSource(url);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (pending) {
                    video.play().catch(function () {});
                }
            });
            return;
        }

        video.src = url;
    }

    function playVideo() {
        pending = true;
        loadVideo();

        if (button) {
            button.classList.add("is-hidden");
        }

        video.play().catch(function () {});
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}

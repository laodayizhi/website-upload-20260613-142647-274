function createMoviePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var ready = false;

    if (!video || !button || !streamUrl) {
        return;
    }

    function attach() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function play() {
        attach();
        button.classList.add('is-hidden');
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', play);

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

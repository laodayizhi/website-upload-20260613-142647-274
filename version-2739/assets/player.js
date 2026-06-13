import { H as Hls } from './hls-vendor-dru42stk.js';

(function () {
  function attach(video) {
    var stream = video.dataset.stream;
    var shell = video.closest('.video-shell');
    var button = shell ? shell.querySelector('[data-play-button]') : null;
    var errorBox = shell ? shell.querySelector('[data-player-error]') : null;
    var hls = null;

    function showError() {
      if (errorBox) {
        errorBox.hidden = false;
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function start() {
      var play = video.play();
      if (play && typeof play.then === 'function') {
        play.then(hideButton).catch(showError);
      } else {
        hideButton();
      }
    }

    if (!stream) {
      showError();
      return;
    }

    video.crossOrigin = 'anonymous';

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          showError();
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else {
      showError();
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', hideButton);
    video.addEventListener('error', showError);

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(attach);
})();

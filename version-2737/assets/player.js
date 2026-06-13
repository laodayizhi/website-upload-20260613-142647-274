(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var playButton = document.querySelector("[data-play-button]");
    var message = document.querySelector("[data-player-message]");

    if (!video || !playButton) {
      return;
    }

    var source = video.getAttribute("data-hls");
    var hlsInstance = null;
    var hasStarted = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
          playButton.classList.remove("is-hidden");
        });
      }
    }

    function startPlayer() {
      if (!source) {
        setMessage("未找到视频播放源。");
        return;
      }

      playButton.classList.add("is-hidden");
      setMessage("正在加载视频...");

      if (hasStarted) {
        playVideo();
        return;
      }
      hasStarted = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        setMessage("正在使用浏览器原生 HLS 播放。");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage("视频已就绪，开始播放。");
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage("视频加载失败，请刷新页面或稍后重试。");
            playButton.classList.remove("is-hidden");
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            hasStarted = false;
          }
        });
        return;
      }

      video.src = source;
      setMessage("当前浏览器可能不支持 HLS，已尝试直接载入播放源。");
      playVideo();
    }

    playButton.addEventListener("click", startPlayer);
    video.addEventListener("play", function () {
      playButton.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        playButton.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      playButton.classList.remove("is-hidden");
      setMessage("播放结束，可重新点击播放。");
    });
  });
})();

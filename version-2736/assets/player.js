import { H as Hls } from './hls-vendor.js';

export function setupPlayer(videoId, sourceUrl) {
    const video = document.getElementById(videoId);
    if (!video || !sourceUrl) {
        return;
    }

    const shell = video.closest('.video-player-shell');
    const cover = shell ? shell.querySelector('.player-cover') : null;
    let hls = null;
    let attached = false;

    const attachSource = () => {
        if (attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            attached = true;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            attached = true;
            return;
        }

        video.src = sourceUrl;
        attached = true;
    };

    const startPlayback = () => {
        attachSource();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.controls = true;
        const playRequest = video.play();
        if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(() => {
                video.controls = true;
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    };

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', () => {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('error', () => {
        if (hls) {
            hls.destroy();
            hls = null;
            attached = false;
        }
    });
}

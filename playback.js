// The native player can start playback before YouTube mounts its watch-page wrapper.
(() => {
  let videoId = null;
  let segments = [];

  let overlay;
  let drawnDuration;

  function clearMarkers() {
    overlay?.remove();
    overlay = null;
  }

  function drawMarkers(player, duration) {
    const bar = player.querySelector(".ytp-progress-bar");
    if (!bar || (overlay?.parentNode === bar && duration === drawnDuration)) return;
    clearMarkers();
    overlay = document.createElement("div");
    overlay.className = "focus-segments";
    overlay.setAttribute("aria-hidden", "true");
    for (const {range: [start, end], category} of segments) {
      if (start >= duration) continue;
      const marker = document.createElement("span");
      marker.dataset.category = category;
      marker.style.left = (100 * start / duration) + "%";
      marker.style.width = (100 * (Math.min(end, duration) - start) / duration) + "%";
      overlay.append(marker);
    }
    drawnDuration = duration;
    bar.append(overlay);
  }

  document.addEventListener("yt-navigate-start", clearMarkers);
  function skip(video) {
    if (!videoId || !segments.length || location.pathname !== "/watch" ||
        new URLSearchParams(location.search).get("v") !== videoId) return;
    const player = video.closest("#movie_player");
    const watch = player?.closest("ytd-watch-flexy:not([hidden])");
    const playingId = player?.getVideoData?.()?.video_id || watch?.getAttribute("video-id");
    if (playingId !== videoId ||
        player.matches(".ad-showing, .ad-interrupting") || !Number.isFinite(video.duration)) return;
    drawMarkers(player, video.duration);
    let end = video.currentTime;
    for (const {range: [start, stop]} of segments) {
      if (start > end) break;
      end = Math.max(end, stop);
    }
    end = Math.min(end, video.duration);
    if (end > video.currentTime) video.currentTime = end;
  }

  document.addEventListener("focus-youtube-segments", ({detail}) => {
    if (!detail || !Array.isArray(detail.segments)) return;
    clearMarkers();
    videoId = detail.id;
    segments = detail.segments;
    const video = document.querySelector("#movie_player video");
    if (video) skip(video);
  });
  for (const event of ["playing", "loadedmetadata", "seeking", "seeked", "timeupdate", "durationchange"]) {
    document.addEventListener(event, ({target}) => {
      if (target instanceof HTMLVideoElement) skip(target);
    }, true);
  }
})();

// The native player can start playback before YouTube mounts its watch-page wrapper.
(() => {
  let videoId = null;
  let segments = [];

  let overlays = [];
  let drawnDuration;
  let drawnBar;
  let frame;
  let fills = [];

  const categoryNames = {
    sponsor: "Sponsor", selfpromo: "Self-promotion", intro: "Intro", outro: "Outro",
    interaction: "Interaction reminder", preview: "Preview", hook: "Hook"
  };
  let previewCategory;
  let previewPill;

  function previewPointer(event) {
    previewCategory = null;
    if (event.type !== "pointerleave") {
      const bar = drawnBar.getBoundingClientRect();
      const time = (event.clientX - bar.left) / bar.width * drawnDuration;
      previewCategory = segments.findLast(({range: [start, end]}) => time >= start && time < end)?.category;
    }
    updatePreviewLabel();
  }

  function updatePreviewLabel() {
    const player = drawnBar?.closest("#movie_player");
    const anchor = previewCategory && !player?.matches(".ad-showing, .ad-interrupting")
      ? player?.querySelector(".ytp-tooltip.ytp-preview .ytp-tooltip-text-wrapper, .ytp-tooltip:has(.ytp-tooltip-duration) .ytp-tooltip-text-wrapper")
      : null;
    if (!anchor) {
      previewPill?.remove();
      previewPill = null;
      return;
    }

    // The time and chapter can overflow the thumbnail wrapper or sit beside it.
    const tooltip = anchor.closest(".ytp-tooltip");
    const row = tooltip.querySelector(".ytp-tooltip-progress-bar-pill") || anchor;
    const rowRect = row.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    let bottom = Math.max(rowRect.bottom, tooltip.getBoundingClientRect().bottom);
    for (const element of tooltip.querySelectorAll(".ytp-tooltip-text, .ytp-tooltip-duration, .ytp-tooltip-title, .ytp-tooltip-progress-bar-pill")) {
      bottom = Math.max(bottom, element.getBoundingClientRect().bottom);
    }
    if (!previewPill) {
      previewPill = document.createElement("span");
      previewPill.className = "focus-preview-category";
      player.append(previewPill);
    }
    // Read the element painting the chapter name, which can have its own font.
    const title = Array.from(row.querySelectorAll("*")).reverse().find(element =>
      !element.children.length && element.textContent.trim() && element.getClientRects().length
    ) || row;
    const typography = getComputedStyle(title);
    for (const property of ["font-family", "font-size", "font-weight", "font-style", "line-height",
      "letter-spacing", "font-variation-settings", "color", "text-shadow", "-webkit-font-smoothing"]) {
      const value = typography.getPropertyValue(property);
      if (previewPill.style.getPropertyValue(property) !== value)
        previewPill.style.setProperty(property, value);
    }
    const background = getComputedStyle(row).backgroundColor;
    // Some player layouts paint the pill on a pseudo-element.
    const fill = background === "rgba(0, 0, 0, 0)"
      ? getComputedStyle(row, "::before").backgroundColor : background;
    previewPill.style.backgroundColor = fill === "rgba(0, 0, 0, 0)" ? "" : fill;
    const label = categoryNames[previewCategory];
    if (previewPill.textContent !== label) previewPill.textContent = label;
    previewPill.style.left = (rowRect.left + rowRect.width / 2 - playerRect.left) + "px";
    previewPill.style.top = (bottom - playerRect.top + 3) + "px";
  }

  // YouTube can animate a chapter's fill with transforms, even while paused.
  // ResizeObserver alone doesn't report those intermediate bounds.
  function matchFillHeights() {
    const bounds = fills.map((fill, i) => {
      if (!fill) return null;
      const track = overlays[i].getBoundingClientRect();
      const red = fill.getBoundingClientRect();
      if (!track.height) return null;
      return {
        top: (red.top - track.top) / track.height * 100 + "%",
        height: red.height / track.height * 100 + "%"
      };
    });
    bounds.forEach((rect, i) => {
      if (!rect) return;
      const style = overlays[i].style;
      if (style.getPropertyValue("--marker-top") !== rect.top)
        style.setProperty("--marker-top", rect.top);
      if (style.getPropertyValue("--marker-height") !== rect.height)
        style.setProperty("--marker-height", rect.height);
    });
    if (previewCategory) updatePreviewLabel();
    frame = requestAnimationFrame(matchFillHeights);
  }

  const resize = new ResizeObserver(positionMarkers);

  function clearMarkers() {
    drawnBar?.removeEventListener("pointermove", previewPointer);
    drawnBar?.removeEventListener("pointerleave", previewPointer);
    previewCategory = null;
    updatePreviewLabel();
    cancelAnimationFrame(frame);
    fills = [];
    resize.disconnect();
    for (const overlay of overlays) overlay.remove();
    overlays = [];
    drawnBar = null;
  }

  function positionMarkers() {
    if (!drawnBar) return;
    const bar = drawnBar.getBoundingClientRect();
    for (const overlay of overlays) {
      const track = overlay.getBoundingClientRect();
      if (!track.width) continue;
      for (const [i, marker] of Array.from(overlay.children).entries()) {
        const [start, end] = segments[i].range;
        const offset = bar.left - track.left;
        const left = Math.max(0, offset + start / drawnDuration * bar.width);
        const right = Math.min(track.width, offset + end / drawnDuration * bar.width);
        marker.style.left = (100 * left / track.width) + "%";
        marker.style.width = (100 * Math.max(0, right - left) / track.width) + "%";
      }
    }
  }

  function drawMarkers(player, duration) {
    const bar = player.querySelector(".ytp-progress-bar");
    if (!bar || duration <= 0) return;
    // Each chapter animates its own progress list when the pointer enters it.
    const tracks = Array.from(bar.querySelectorAll(".ytp-progress-list"));
    if (!tracks.length) tracks.push(bar);
    if (bar === drawnBar && drawnDuration === duration && tracks.length === overlays.length &&
        tracks.every((track, i) => overlays[i].parentNode === track)) return;
    clearMarkers();
    drawnBar = bar;
    drawnDuration = duration;
    for (const track of tracks) {
      const overlay = document.createElement("div");
      overlay.className = "focus-segments";
      overlay.setAttribute("aria-hidden", "true");
      for (const {category} of segments) {
        const marker = document.createElement("span");
        marker.dataset.category = category;
        overlay.append(marker);
      }
      fills.push(track.querySelector(".ytp-play-progress"));
      track.append(overlay);
      overlays.push(overlay);
      resize.observe(track);
    }
    bar.addEventListener("pointermove", previewPointer);
    bar.addEventListener("pointerleave", previewPointer);
    matchFillHeights();
    resize.observe(bar);
    positionMarkers();
  }

  let scrubPlayer;
  let scrubPointer;
  let scrubReleasedAt = -Infinity;
  let manualSeek;
  let finishedPlayer;
  let finishedVideo;

  function clearFinishedSkip() {
    finishedPlayer?.removeAttribute("data-focus-skip-ended");
    finishedPlayer = null;
    finishedVideo = null;
  }

  document.addEventListener("pointerdown", event => {
    scrubPlayer = event.target.closest?.(".ytp-progress-bar, .ytp-progress-bar-container, .ytp-scrubber-container")?.closest("#movie_player");
    scrubPointer = event.pointerId;
    scrubReleasedAt = -Infinity;
  }, true);
  for (const type of ["pointerup", "pointercancel"]) {
    window.addEventListener(type, event => {
      if (event.pointerId !== scrubPointer) return;
      scrubPointer = null;
      // The player's final seek may arrive after the pointer has been released.
      scrubReleasedAt = performance.now();
    }, true);
  }

  document.addEventListener("yt-navigate-start", () => {
    clearMarkers();
    clearFinishedSkip();
    scrubPlayer = null;
    manualSeek = null;
  });
  function skip(video, event) {
    const player = video.closest("#movie_player");
    if (video === finishedVideo) {
      if (event === "play") {
        clearFinishedSkip();
        video.currentTime = 0;
        return;
      }
      if (event === "seeking" || event === "loadedmetadata") clearFinishedSkip();
      else return;
    }
    const scrubbing = player && player === scrubPlayer &&
      (scrubPointer != null || performance.now() - scrubReleasedAt < 500);
    if (scrubbing && (video.seeking || event === "seeking" || event === "seeked")) {
      manualSeek = {video, id: new URLSearchParams(location.search).get("v"), time: video.currentTime};
    }
    if (!videoId || !segments.length || location.pathname !== "/watch" ||
        new URLSearchParams(location.search).get("v") !== videoId) return;
    const watch = player?.closest("ytd-watch-flexy:not([hidden])");
    const playingId = player?.getVideoData?.()?.video_id || watch?.getAttribute("video-id");
    if (playingId !== videoId ||
        player.matches(".ad-showing, .ad-interrupting") || !Number.isFinite(video.duration)) return;
    drawMarkers(player, video.duration);
    if (scrubbing && scrubPointer != null) return;
    const now = video.currentTime;
    if (manualSeek && (manualSeek.video !== video || manualSeek.id !== videoId ||
        !segments.some(({range: [start, stop]}) =>
          start <= manualSeek.time && manualSeek.time < stop && start <= now && now < stop))) {
      manualSeek = null;
    }
    let end = now;
    for (const {range: [start, stop]} of segments) {
      if (start > end) break;
      if (manualSeek && start <= manualSeek.time && manualSeek.time < stop) continue;
      end = Math.max(end, stop);
    }
    end = Math.min(end, video.duration);
    if (end > now) {
      scrubPlayer = null;
      manualSeek = null;
      // Seeking to the exact media endpoint can leave YouTube buffering forever.
      if (video.duration - end <= 0.1) {
        finishedPlayer = player;
        finishedVideo = video;
        player.setAttribute("data-focus-skip-ended", "");
        video.pause();
        return;
      }
      video.currentTime = end;
    }
  }

  document.addEventListener("focus-youtube-segments", ({detail}) => {
    if (!detail || !Array.isArray(detail.segments)) return;
    clearMarkers();
    if (videoId !== detail.id) clearFinishedSkip();
    videoId = detail.id;
    segments = detail.segments;
    const video = document.querySelector("#movie_player video");
    if (video) skip(video);
  });
  for (const event of ["play", "playing", "loadedmetadata", "seeking", "seeked", "timeupdate", "durationchange"]) {
    document.addEventListener(event, ({target}) => {
      if (target instanceof HTMLVideoElement) skip(target, event);
    }, true);
  }
})();

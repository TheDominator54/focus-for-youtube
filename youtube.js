(() => {
  let videoId = null;
  let generation = 0;

  // Stop the hover signals that start YouTube's inline player. Leave link
  // activation, keyboard navigation and context menus to the native anchors.
  const videoCard = ":is(ytd-browse, ytd-search) :is(ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, yt-lockup-view-model)";
  function suppressCardHover(event) {
    if (event.target instanceof Element && event.target.closest(videoCard)) {
      event.stopImmediatePropagation();
    }
  }
  for (const type of ["pointerover", "pointerenter", "pointermove", "mouseover", "mouseenter", "mousemove"]) {
    window.addEventListener(type, suppressCardHover, {capture: true, passive: true});
  }

  function activeId() {
    return location.pathname === "/watch" ? new URLSearchParams(location.search).get("v") : null;
  }

  function disableUpNext() {
    const toggle = document.querySelector('ytd-watch-flexy:not([hidden]) #movie_player .ytp-autonav-toggle-button[aria-checked="true"]');
    toggle?.click();
  }

  function navigate() {
    const path = location.pathname;
    if (path.startsWith("/shorts/")) {
      location.replace("/");
      return;
    }
    // Bare channel URLs should land on the channel's video grid.
    if (/^\/(?:@[^/]+|(?:channel|c|user)\/[^/]+)\/?$/.test(path)) {
      location.replace(path.replace(/\/$/, "") + "/videos" + location.search + location.hash);
      return;
    }
    const id = activeId();
    if (id !== videoId) {
      videoId = id;
      const request = ++generation;
      if (id) chrome.runtime.sendMessage({videoId: id}).then(result => {
        if (request !== generation || id !== activeId()) return;
        document.dispatchEvent(new CustomEvent("focus-youtube-segments", {detail: {id, segments: result ?? []}}));
      }).catch(() => {});
    }
    if (id) disableUpNext();
  }

  document.addEventListener("yt-navigate-finish", navigate);
  window.addEventListener("pageshow", navigate);
  window.addEventListener("popstate", navigate);
  for (const event of ["playing", "loadedmetadata"]) {
    document.addEventListener(event, ({target}) => {
      if (!(target instanceof HTMLVideoElement)) return;
      navigate();
    }, true);
  }
  navigate();
})();

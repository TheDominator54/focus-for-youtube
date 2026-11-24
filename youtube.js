(() => {
  let videoId = null;
  let generation = 0;

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

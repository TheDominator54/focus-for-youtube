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

  const channelCard = "ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-video-renderer, yt-lockup-view-model";
  function filterMembership(card) {
    const text = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    let restricted = false;
    while (text.nextNode()) {
      if (/^members[\s-]+only$/i.test(text.currentNode.data.trim()) &&
          !text.currentNode.parentElement.closest("a, h3, #video-title, [role=heading], [hidden]")) {
        restricted = true;
        break;
      }
    }
    card.toggleAttribute("data-focus-members-only", restricted);
  }

  const membershipObserver = new MutationObserver(records => {
    const cards = new Set();
    for (const record of records) {
      const target = record.target.nodeType === Node.TEXT_NODE ? record.target.parentElement : record.target;
      const card = target?.closest?.(channelCard);
      if (card) cards.add(card.closest("ytd-rich-item-renderer") || card);
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(channelCard)) cards.add(node);
        for (const child of node.querySelectorAll(channelCard)) cards.add(child);
      }
    }
    for (const card of cards) filterMembership(card.closest("ytd-rich-item-renderer") || card);
  });

  let filteringChannel = false;
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
    const channel = /^\/(?:@[^/]+|(?:channel|c|user)\/[^/]+)(?:\/|$)/.test(path);
    if (channel !== filteringChannel) {
      filteringChannel = channel;
      membershipObserver.disconnect();
      if (channel) {
        membershipObserver.observe(document, {subtree: true, childList: true, characterData: true});
        document.querySelectorAll(channelCard).forEach(card => filterMembership(card.closest("ytd-rich-item-renderer") || card));
      } else {
        document.querySelectorAll("[data-focus-members-only]").forEach(card => card.removeAttribute("data-focus-members-only"));
      }
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

const categories = ["sponsor", "selfpromo", "hook", "intro", "interaction", "outro", "preview"];

async function segmentsFor(id) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(id));
  const prefix = Array.from(new Uint8Array(digest).slice(0, 3), byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 5);
  const url = new URL("https://sponsor.ajay.app/api/skipSegments/" + prefix);
  url.searchParams.set("categories", JSON.stringify(categories));
  url.searchParams.set("actionTypes", '["skip"]');
  const response = await fetch(url, {credentials: "omit", signal: AbortSignal.timeout(8000)});
  if (!response.ok) return [];
  const matches = (await response.json()).find(entry => entry.videoID === id);
  return (matches?.segments ?? [])
    .filter(entry => categories.includes(entry.category) && entry.actionType === "skip")
    .map(({segment, category}) => ({range: segment, category}))
    .filter(({range}) => Array.isArray(range) && range.length === 2 && range.every(Number.isFinite)
      && range[0] >= 0 && range[1] > range[0])
    .sort((a, b) => a.range[0] - b.range[0]);
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.origin !== "https://www.youtube.com" || !/^[\w-]{11}$/.test(message?.videoId ?? "")) return;
  segmentsFor(message.videoId).then(respond, () => respond([]));
  return true;
});

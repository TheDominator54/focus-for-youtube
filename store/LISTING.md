# Chrome Web Store submission

## Listing copy

**Name** — Focus for YouTube

**Summary** — A six-column video feed, an edge-to-edge player, and quiet sponsor skipping.

**Description**

Open YouTube to six videos across. Click a thumbnail to fill the tab with the native player. Scroll down for the title, channel, and description, or use browser Back to return to browsing.

Focus hides the header and search box, sidebars, Shorts, playlists, Mixes, upcoming videos, comments, end-screen suggestions, and AI summaries on search results. You can still open search results from a URL and use the native playback controls. The layout also applies to Subscriptions and channel video grids.

When SponsorBlock contributors have marked a segment, Focus colors the timeline and automatically skips the configured categories. This includes sponsor reads, self-promotion, intros, outros, hooks, previews, and reminders to like or subscribe. These preferences are built in. Uses SponsorBlock data from https://sponsor.ajay.app/.

## Dashboard fields

- **Single purpose** — Simplify browsing and watching videos on desktop YouTube.
- **YouTube access** — Content scripts filter cards, restyle desktop pages, identify the current video, and control its playback. The main-world script checks the active native player's video ID before applying timestamps.
- **SponsorBlock host access** — The service worker fetches community timestamps using a five-character video-ID hash prefix and matches the response locally. The response is JSON data. All executable code ships in the ZIP.
- **Privacy practices** — Disclose browsing activity used for segment lookup and transferred to SponsorBlock. Describe the hash prefix, local match, and recipient consistently with the privacy policy. Review the dashboard certifications against the submitted version.
- **Homepage** — https://github.com/TheDominator54/focus-for-youtube
- **Privacy policy** — https://github.com/TheDominator54/focus-for-youtube/blob/main/PRIVACY.md
- **Support** — https://github.com/TheDominator54/focus-for-youtube/issues

## Reviewer walkthrough

1. Visit YouTube Home in a profile with recommendations, or open a public channel's Videos tab in a fresh profile. Confirm six columns. Click an ordinary video, scroll to the details, and use Back.
2. Open the reference video around 9:10. At the time of release, a green sponsor marker spans about 9:14–11:09. Playback should jump to its end. Community timestamps can change. [Reference video](https://www.youtube.com/watch?v=86dSixZOtFo&t=550s)
3. Open YouTube search results for “hi”. Regular video results remain visible and AI summary panels are hidden. [Reference search](https://www.youtube.com/results?search_query=hi)

## Upload files

Build the extension ZIP with `python3 scripts/package.py` or download the versioned ZIP from GitHub Releases. Use the 128 px manifest icon and the three 1280 × 800 screenshots below, in order. They show the public NASA Goddard channel in a clean browser profile.

1. [Six-column channel video grid](screenshots/01-channel-grid.png)
2. [Full-tab native player](screenshots/02-player.png)
3. [Channel and description below the player](screenshots/03-video-details.png)

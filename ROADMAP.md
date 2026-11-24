# Publishing Focus for YouTube

The first public release should deliver the experience already in v0.1.6. Keep its fixed defaults and defer an options page. Start with a clean-profile test of the current build, then package the tested files for Chrome Web Store review.

The developer account is already set up. The maintainer has tested the main experience. The first packaged candidate is v0.1.7.

## 1. Confirm the everyday experience

- [ ] Test with the four original extensions disabled. On a signed-in Home feed, scroll through several loads. Check that rows stay six across, every card opens a playable video, and Back restores the feed position. Repeat the grid check on Subscriptions and channel video pages.
- [ ] Open a video from Home and from a direct link. Check the full-width player, vertical scrolling to the description, keyboard controls, fullscreen, and replay. Finish a video and confirm the recommendation cards disappear. Repeat with a narrower window and check for sideways scrolling.
- [ ] Search for a query that displays an AI summary with the extension disabled. Enable the extension, reload, and confirm the summary disappears while the same video result remains accessible.
- [ ] Verify the green timeline marker and automatic skip on the Kara and Nate test video. The observed sponsor range was 9:14–11:09. Test a second video without registered segments, switch quickly between the two, and block the SponsorBlock request once to confirm ordinary playback continues. [Reference video](https://www.youtube.com/watch?v=86dSixZOtFo&t=550s)

Keep screenshots and the tested Chrome version with the release notes. The signed-in feed and live end screen deserve particular attention because earlier checks used fixtures for those cases.

## 2. Prepare the publisher and disclosures

- [ ] Choose the publisher name and support email. Register or verify the developer account, complete the one-time registration payment if needed, and enable two-step verification. This can run alongside testing. [Developer registration](https://developer.chrome.com/docs/webstore/register/) · [Account setup](https://developer.chrome.com/docs/webstore/set-up-account/)
- [ ] Publish a privacy policy at a stable public URL. Describe the actual request: the worker sends the first five hexadecimal characters of a SHA-256 hash of the video ID and the requested segment categories to SponsorBlock. It omits credentials and matches the full video ID locally. The receiving service can see the connection IP. Recheck this description against the release ZIP. [Chrome privacy disclosures](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy/)
- [ ] Credit SponsorBlock and its contributors using the project's attribution template. The API and database are offered under CC BY-NC-SA 4.0 unless separately authorized. Plan for a noncommercial launch and revisit permissions before monetization. [SponsorBlock terms and attribution template](https://sponsor.ajay.app/database)

## 3. Build the store package and listing

- [ ] Add an original icon, including a 128 × 128 PNG declared in the manifest. Capture the six-column Home feed and full-tab player in a clean profile. Use a third screenshot for the green sponsor marker or the details below the player. Export store screenshots at 1280 × 800 or 640 × 400 and check them for personal information. [Store image specifications](https://developer.chrome.com/docs/webstore/images/)
- [ ] Describe what installation changes, especially the hidden search box, navigation, Shorts, and comments. Suggested single-purpose statement: “Focus for YouTube simplifies browsing and watching videos on desktop YouTube.” Explain YouTube site access and the separate host permission for SponsorBlock lookups in the dashboard. [Privacy practices form](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy/)
- [ ] Assign a release version and archive that source revision. Build a ZIP with the manifest at its root, the three JavaScript files, stylesheet, icons, and applicable notices. Extract that exact ZIP into a fresh directory, load it unpacked, and repeat the Home → Watch → Back and sponsor checks. [Package preparation](https://developer.chrome.com/docs/webstore/prepare/)

## 4. Submit, publish, and verify

- [ ] Upload the ZIP as a new item. Complete the listing, privacy fields, distribution choices, and reviewer instructions. Give reviewers the tagged video link and the expected skip time so they can reproduce the feature quickly.
- [ ] Submit for review with deferred publishing if you want to choose the launch day. Schedule the public announcement after approval. [Chrome Web Store publishing workflow](https://developer.chrome.com/docs/webstore/publish/)
- [ ] Publish and install from the public listing in a fresh Chrome profile. Verify the icon, permission prompt, Home grid, watch page, and sponsor skip. Keep the shipped ZIP and its source revision together. Route reports to the support email and use the same checks for updates when YouTube changes its layout.

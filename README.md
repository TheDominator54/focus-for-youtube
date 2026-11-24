# Focus for YouTube

Focus turns desktop YouTube into a six-column video feed. Open a video and the native player fills the tab. Scroll down for the title, channel, and description.

The extension hides the masthead (including search), sidebar, Shorts, playlists, Mixes, scheduled videos, comments, end-screen recommendations, and search-result summaries. It also simplifies channel video pages and Subscriptions. Direct YouTube search URLs still work. The first release uses fixed settings.

Community timestamps from SponsorBlock appear on the seek bar. Focus automatically skips sponsors, self-promotion, intros, outros, hooks, previews, and interaction reminders when timestamps are available. [Data credits](NOTICE.md)

## Install the test release

1. Download the extension ZIP from [GitHub Releases](https://github.com/TheDominator54/focus-for-youtube/releases) and extract it.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select the extracted folder containing `manifest.json`. Refresh existing YouTube tabs. If you use other YouTube layout or segment-skipping extensions, disable them while testing Focus.

## Develop and package

Load this repository as an unpacked extension. Edit the CSS for layout, or the JavaScript for navigation, playback, and segment lookup. After edits, reload the extension and refresh the tab. Build the store ZIP with `python3 scripts/package.py`. The script writes to `dist/` and uses the files declared in the manifest plus the attribution notice.

## Support

Report the page type, Chrome version, extension version, and steps to reproduce. For skipping issues, include the public video URL and approximate timestamp. Crop account details from screenshots. [Open an issue](https://github.com/TheDominator54/focus-for-youtube/issues)

[Privacy policy](PRIVACY.md) · [Publishing roadmap](ROADMAP.md) · [Store listing and reviewer notes](store/LISTING.md)

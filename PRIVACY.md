# Focus for YouTube privacy policy

Effective November 24, 2026, for version 0.1.7.

Focus runs on desktop pages at www.youtube.com. It reads the page layout and playback state to filter the feed, simplify the player, and skip registered segments. It reads the video ID from the current watch URL. The extension keeps the current segment list in memory. It has no account system, analytics, advertising, or persistent watch-history storage.

## Requests to SponsorBlock

For a watch page, Focus hashes the video ID with SHA-256 and sends the first five hexadecimal characters to sponsor.ajay.app, together with the segment categories and action type requested. SponsorBlock returns records for that prefix, and Focus selects the exact match locally. This query can narrow the set of videos being watched. The request omits credentials, and the service receives normal connection information, including the IP address. SponsorBlock operates the receiving server. [SponsorBlock](https://sponsor.ajay.app/)

YouTube continues to serve its own pages, media, and account features. Removing the extension stops its SponsorBlock requests.

For questions about this policy, contact the maintainer through the project's public issue tracker. Include only information you are comfortable sharing publicly. [Contact the maintainer](https://github.com/TheDominator54/focus-for-youtube/issues)

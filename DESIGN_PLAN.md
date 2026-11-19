# Travel Now — initial design plan

Recorded November 19, 2026.

## Product idea

An editable trip itinerary that becomes a beautiful, shareable HTML slide deck for friends and family. The JSON trip is the source of truth; content stays separate from presentation. Changing a style must never change an activity.

The core journey is: create a trip, enter destinations and dates, plan each day, choose a cozy style, preview slides, export HTML and JSON, and import the JSON later to make edits.

## Initial style library

Every style is available for any destination; these are visual inspirations rather than restrictions.

| Destination | Style 1 | Style 2 | Style 3 |
| --- | --- | --- | --- |
| Japan | Sakura & Washi | Kyoto Tea House | Rainy Tokyo Café |
| Korea | Hanok Morning | Seoul Café | Jeju Retreat |
| US | National Park Cabin | Coastal Cottage | Autumn Road Trip |
| China | Bamboo & Ink | Courtyard Tea | Lantern Evening |
| France | Parisian Notebook | Provence Cottage | Alpine Chalet |
| Spain | Terracotta Courtyard | Mediterranean Siesta | Barcelona Sketchbook |
| Germany | Black Forest Cabin | Bavarian Guesthouse | Riverside Bookshop |
| Southeast Asia | Tropical Hideaway | Old Town Café | Monsoon Journal |
| Europe | Rail Travel Journal | Village Bakery | Lakeside Retreat |

Each style defines paper, ink, and accent colors. Three layout families supply ruled journal pages, classic serif typography with arched imagery, and contemporary typography with rectangular imagery. Future iterations can expand destination-specific textures and typography.

## Trip data

- Trip ID, title, destination, inclusive start/end dates, travelers, timezone, cover image, description, and style ID.
- Activities: unique ID, date, optional start/end time, name, place, category, status, public notes, private notes, map URL, photo, and optional estimated cost/currency.
- Categories: Explore, Food & drink, Stay, Transport, Free time.
- Statuses: Confirmed, Tentative, Optional.
- Versioned JSON format, with strict validation before replacing a trip. Preserve stable IDs when importing.
- Optional future booking details: reservation links, confirmation numbers, attachments, and explicit sharing visibility.

Trip and activity times should be understood in the trip's timezone. The prototype supports same-day activity times; future transport entries should support different departure/arrival timezones and overnight events.

## Place discovery and photos

The intended production experience is keyword search, location confirmation, map linking, and selecting a relevant photo. Confirmation prevents similarly named places from being mistaken for one another.

The prototype generates Google Maps search URLs, offers a small Kyoto suggestion list, accepts a custom map URL, and provides starter photos or local photo uploads. It does not claim to resolve verified Google Places or automatically retrieve place photos. Production place lookup should use an appropriate API, keep provider keys on the server, obey attribution/caching requirements, and handle missing photos gracefully.

Reference: [Google Maps URL guide](https://developers.google.com/maps/documentation/urls/get-started). Search links use `api=1` and an encoded `query`; opening a search does not require an API key.

## Presentation and reuse

- Trip cover plus daily itinerary slides; split busy days into multiple slides.
- Responsive reading, slide controls, keyboard navigation, and browser print/PDF.
- Self-contained HTML with embedded images, CSS, and navigation. Viewing works offline; opening map links requires internet.
- JSON backup contains all editable content and images, including private notes.
- ZIP bundle contains the HTML, JSON, and a short README.
- Private notes are always excluded from HTML. Costs are hidden unless explicitly included. Warn clearly that JSON/ZIP backups contain private information.
- Re-import JSON to edit the trip or change its style without re-entering information.

## Prototype scope (implemented)

1. A responsive browser-based trip studio with an editable example Kyoto trip.
2. Trip details and date bounds, 27 theme presets, and cover selection/upload.
3. Activity creation, editing, deletion with undo, duplication, moving between dates, and drag/button reordering.
4. Public/private notes, optional costs and times, categories and statuses.
5. Local autosave with explicit failure messaging if storage is unavailable or full.
6. Live slide thumbnail and full preview, shareable HTML, editable JSON, and ZIP export.
7. Validated JSON import with confirmation before replacement.
8. One current trip per browser profile; new-trip flow prompts for backup and supports undo.

## Suggested next additions

1. Multiple saved trips and a mobile Today view.
2. Authenticated shared links with owner/editor/viewer permissions.
3. Activity votes and comments; simultaneous editing after the sharing model is established.
4. Trip overview, activity highlight, accommodation, and practical-information slide types.
5. Rainy-day alternatives and a packing checklist.
6. Verified place search, route grouping, and estimated travel time between activities.
7. Booking attachments with safe sharing defaults.
8. Version history and conflict-safe cloud synchronization.

## Implementation approach

Use dependency-free HTML, CSS, and JavaScript ES modules for this prototype. Pure trip validation and slide generation modules are covered by Node's test runner. A small Node server provides local preview, and a build script copies static assets into `dist/`. No accounts, database, analytics, runtime secrets, or paid integrations are required.

The initial visual direction is an editorial travel journal: forest green accents, soft paper colors, serif headings, spacious activity cards, destination photography, and a persistent day navigation sidebar. All 27 presets affect slide rendering; the editor retains consistent navigation styling.

## Known prototype boundaries

No live collaboration, cloud trip storage, real-time Google place/photo lookup, route computation, booking integrations, or live shared links. Autosave is local to the current browser and origin. Public application hosting is separate from sharing an individual trip: visiting the site does not publish a user's itinerary. Photos are compressed on upload; localStorage quotas still limit large itineraries, so downloadable backups are important. Imported JSON is limited to 25 MB, dates to 90 days, and activities to 500. Travel data is illustrative and is not a recommendation or verified opening-hours information.

## Hosting decision

The user selected free, public GitHub Pages hosting instead of OpenAI hosting. The public `tchLin/travel-now` repository holds source on `main` and static output on `gh-pages`. The app uses relative asset paths so it works at `/travel-now/`. Publication runs checks and builds locally, then pushes static output without force-pushing. No OpenAI deployment is used.

## UX and Chinese-language revision

The initial Kyoto default made the product feel destination-specific, and “Look & feel” obscured theme selection. The revised first visit starts with a blank destination, a visual introduction to the three planning stages, and a setup form. Kyoto is an explicitly selected example. Existing saved trips are preserved.

A visible “Choose a theme” control and “Themes & styles” section expose all 27 themes before destination filtering. The initial guide automatically started for new trips and had a “Start here” button; the arrival revision below replaces that behavior. The guide points to real controls for trip details, activities, themes, preview, and export. Styled menus replace native select/datalist popups and support keyboard interaction.

English, Simplified Chinese, and Traditional Chinese are available through a persistent language switcher. Translation covers setup, the editor, dialogs, themes, guidance, validation messages, dates, slide labels, and export instructions. User-authored trip content is not translated automatically. JSON includes the selected language; version 1 files without a language field remain supported. A development-only DOM test library exercises these interactions without adding runtime dependencies to the public site.


## Arrival, place details, and original artwork revision

- Ask whether guidance is wanted on arrival. Accepting begins the tour once a trip is ready; declining keeps it out of the way for that tab session. Remove “Start here.” The invitation and tour support keyboard focus and all three languages.
- Generate map searches from the exact entered keyword. The old automatic country suffix could turn 高雄美術館 into a search biased toward the sample Japan trip. A search remains a search, not a verified place match. Prefer a saved custom link, then explicit place ID/coordinates, then the keyword. Place the custom-link field immediately after the preview/check link.
- Add optional opening hours, source URL, and date checked. Import multilingual text, schema.org JSON-LD, or HTML/JSON/text files locally. Reject ambiguous multiple-venue schedules; never execute imported markup. Preserve hours in editable JSON and display them on slides with their source and manual/imported status. Automatic live retrieval needs a future provider/backend integration and is not part of this static release.
- Supply 180 original cozy activity illustrations: 20 for each of the nine destination groups. Filter visually by region and activity category. Use allowlisted SVGs in the editor and PNG companions for self-contained exports. Keep starter photos and uploads available.
- Cover the invitation, exact map queries/link precedence, custom-field order and persistence, hours parsing/rendering, illustration counts/filters/portability, and language behavior with unit/DOM tests. Exercise real static HTTP endpoints including every SVG/PNG, project-prefix routing, MIME types, HEAD, missing paths, forbidden traversal, and unsupported methods.

See [README](README.md) for usage and integration constraints, and [artwork documentation](docs/ACTIVITY_ART.md) for scenes and regeneration.

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

No live collaboration, cloud trip storage, real-time Google place/photo lookup, route computation, booking integrations, or live shared links. Autosave is local to the current browser and origin. Private application hosting is separate from shareable exported HTML. Photos are compressed on upload; localStorage quotas still limit large itineraries, so downloadable backups are important. Imported JSON is limited to 25 MB, dates to 90 days, and activities to 500. Travel data is illustrative and is not a recommendation or verified opening-hours information.

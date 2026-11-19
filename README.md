# Travel Now

A cozy trip studio for turning family and friend itineraries into portable HTML slide decks.

**Live app:** <https://tchlin.github.io/travel-now/>

## Run locally

Requires Node.js 20 or later. No runtime dependencies or API keys are needed. Install the development-only test dependency before running tests or publishing:

```sh
npm ci
```

```sh
npm run dev
```

Open <http://127.0.0.1:5173>. ES modules need an HTTP server; opening the editor's `index.html` directly is not supported. Exported HTML slides can be opened directly and work offline.

```sh
npm run check
npm test
npm run build
```

## Free public hosting on GitHub Pages

The public repository is <https://github.com/tchLin/travel-now>. GitHub Pages serves the built site from the root of the `gh-pages` branch. No OpenAI hosting, paid hosting plan, custom domain, backend, or API key is required.

To publish an update after pushing your source changes to `main`:

```sh
npm run deploy
```

This checks, tests, and builds the app, then creates a temporary checkout and pushes `dist/` to `gh-pages`. It preserves the branch's history and never force-pushes. GitHub Pages must be configured once to deploy from `gh-pages` at `/`. The build includes `.nojekyll`. Authentication uses your existing Git SSH/HTTPS setup.

The source repository and app are public. Each visitor's edited itinerary remains in their own browser until they download or share an export.

## Try it

1. Choose English, 简体中文, or 繁體中文 in the header. Start with a blank destination and create your trip, or explicitly open the Kyoto example.
2. Add an activity, enter a place keyword, and check the generated Maps search link. Confirm the name/address, then paste a direct share link in the field immediately below it.
3. Add optional opening hours from text, JSON-LD, or an HTML/JSON/text file. Choose from 180 cozy illustrations, filter by region/activity, or upload your own photo.
4. Change dates, drag activities to reorder, or use the accessible Move up/Move down buttons. Edit an activity's date to move it to another day.
5. Use **Choose a theme** or **Themes & styles** to see all 27 presets. Filter by destination if desired.
6. Preview your slides and open **Export & share**.
7. Download self-contained HTML, a JSON backup, or a ZIP with both. Import the JSON to keep editing later.

The setup screen visually introduces the three main stages. On arrival, a dialog asks whether you want guidance. Accept to see a five-step guide covering details, activities, themes, preview, and export; for a new trip it waits until setup is complete. Decline or dismiss to continue on your own. The choice lasts for this tab session, and there is no Start here button. Styled dropdowns support pointer input, arrow keys, Enter, Escape, and type-to-select; editable suggestions also accept custom text.

The language preference is remembered on this device. Both Chinese interfaces include guidance, themes, menus, validation messages, dates, and export labels/instructions. Existing trip titles and notes are preserved as written. JSON stores a `language` field; older files without it remain supported.

## Privacy and persistence

- Changes autosave in this browser's localStorage. There is one current trip per origin; this is not cloud synchronization.
- Private notes are omitted from HTML slides. Costs are hidden unless selected in export settings.
- JSON/ZIP backups include private notes and costs. Keep these private; share the HTML with your group.
- Uploaded photos are resized locally and embedded in exports. No uploaded photos or trip data are sent to a server by the application.
- Keyword map links use the exact entered place without appending the trip country. A custom link takes priority; supported place IDs/coordinates imported with a trip can provide more precise links. Search results still require checking the place name/address. There is no live Google Places lookup.
- Opening-hours imports run locally and never execute pasted HTML. Hours retain an optional source and date checked, appear in slides, and remain editable in JSON. They are not live verified. This static app does not fetch or scrape arbitrary venue URLs.
- If storage fills, an explicit warning asks you to download a backup. Do not rely on localStorage as your only copy.
- Imported JSON accepts only known fields and supported image/link formats. Limits: 90 days, 500 activities, 25 MB per JSON file. Activity times must fall within the same day.

## Source layout

- `app/app.js`: browser editor, dialogs, autosave, import/export interactions.
- `app/trip.js`: versioned trip schema, validation, themes, example data, map links.
- `app/export.js`: portable slide renderer, photo embedding, ZIP generation.
- `app/styles.css`: responsive editor styles.
- `app/i18n.js`: English, Simplified Chinese, and Traditional Chinese interface strings.
- `app/dropdowns.js`: accessible styled select and suggestion menus.
- `app/guidance.js` and `app/guidance.css`: optional arrival prompt and session preference.
- `app/places.js`: exact keyword links and custom/place-ID/coordinate link precedence.
- `app/opening-hours.js` and `app/hours-view.js`: safe hours imports, validation, and rendering.
- `app/activity-art.js`: localized, filterable catalog of 180 original illustrations.
- `app/assets/`: original SVG illustrations, PNG export companions, starter photography, and favicon.
- `scripts/`: local server, static build, and GitHub Pages publishing.
- `tests/`: validation, escaping/privacy, date, pagination, theme and ZIP tests, plus DOM coverage for setup, dropdowns, guidance, languages, map editing, hours, and illustration selection. Real HTTP tests check static endpoints, all 360 illustration files, MIME types, HEAD, errors, and project subpaths. Tests bind a local loopback port. DOM tests do not replace visual browser QA.
- `DESIGN_PLAN.md`: original product design and phased scope.

## Original activity illustrations

There are 20 cozy scenes for each of Japan, Korea, US, China, France, Spain, Germany, Southeast Asia, and Europe. The picker uses original SVG assets; portable HTML/JSON exports embed their PNG companions for offline use. Arbitrary SVG uploads/imports remain disallowed. See [artwork coverage and regeneration](docs/ACTIVITY_ART.md).

## Opening-hours scope

Paste hours or import plain text, schema.org opening-hours JSON-LD, or HTML containing that JSON-LD. Multiple venue schedules are rejected to avoid importing the wrong place. Record the official source and date checked yourself; import time is not a verification date.

Automatic retrieval is a future integration: [Google Place Details](https://developers.google.com/maps/documentation/places/web-service/place-details) offers hours, subject to [billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) and [data policies](https://developers.google.com/maps/documentation/places/web-service/policies). Arbitrary URL scraping from a static page is limited by [browser CORS rules](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

## Starter image credits

Photos are bundled from Unsplash for the prototype and are visual inspiration rather than verified place photos:

- Kyoto street: <https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e>
- Japanese lunch: <https://images.unsplash.com/photo-1519984388953-d2406bc725e1>
- Kyoto sunset: <https://images.unsplash.com/photo-1512692723619-8b3e68365c9c>

## Next steps

Multiple saved trips, authenticated group sharing, votes/comments, production place lookup, and additional slide types. See the design plan for the full roadmap. This prototype has no account system or shared cloud trip database.

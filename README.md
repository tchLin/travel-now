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
2. Add an activity, enter a place keyword, and check the generated Maps search link.
3. Change dates, drag activities to reorder, or use the accessible Move up/Move down buttons. Edit an activity's date to move it to another day.
4. Use **Choose a theme** or **Themes & styles** to see all 27 presets. Filter by destination if desired.
5. Preview your slides and open **Export & share**.
6. Download self-contained HTML, a JSON backup, or a ZIP with both. Import the JSON to keep editing later.

The setup screen visually introduces the three main stages. Creating a trip starts a five-step guide that highlights details, activities, themes, preview, and export. Dismiss it anytime or reopen it with **Start here**. Styled dropdowns support pointer input, arrow keys, Enter, Escape, and type-to-select; editable suggestions also accept custom text.

The language preference is remembered on this device. Both Chinese interfaces include guidance, themes, menus, validation messages, dates, and export labels/instructions. Existing trip titles and notes are preserved as written. JSON stores a `language` field; older files without it remain supported.

## Privacy and persistence

- Changes autosave in this browser's localStorage. There is one current trip per origin; this is not cloud synchronization.
- Private notes are omitted from HTML slides. Costs are hidden unless selected in export settings.
- JSON/ZIP backups include private notes and costs. Keep these private; share the HTML with your group.
- Uploaded photos are resized locally and embedded in exports. No uploaded photos or trip data are sent to a server by the application.
- Map links open Google Maps when clicked. There is no Google API integration or verified automatic place/photo lookup in this prototype.
- If storage fills, an explicit warning asks you to download a backup. Do not rely on localStorage as your only copy.
- Imported JSON accepts only known fields and supported image/link formats. Limits: 90 days, 500 activities, 25 MB per JSON file. Activity times must fall within the same day.

## Source layout

- `app/app.js`: browser editor, dialogs, autosave, import/export interactions.
- `app/trip.js`: versioned trip schema, validation, themes, example data, map links.
- `app/export.js`: portable slide renderer, photo embedding, ZIP generation.
- `app/styles.css`: responsive editor styles.
- `app/i18n.js`: English, Simplified Chinese, and Traditional Chinese interface strings.
- `app/dropdowns.js`: accessible styled select and suggestion menus.
- `app/assets/`: bundled starter photography and favicon.
- `scripts/`: local server, static build, and GitHub Pages publishing.
- `tests/`: validation, escaping/privacy, date, pagination, theme and ZIP tests, plus DOM interaction coverage for setup, dropdowns, guidance, and language switching. DOM tests do not replace visual browser QA.
- `DESIGN_PLAN.md`: original product design and phased scope.

## Starter image credits

Photos are bundled from Unsplash for the prototype and are visual inspiration rather than verified place photos:

- Kyoto street: <https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e>
- Japanese lunch: <https://images.unsplash.com/photo-1519984388953-d2406bc725e1>
- Kyoto sunset: <https://images.unsplash.com/photo-1512692723619-8b3e68365c9c>

## Next steps

Multiple saved trips, authenticated group sharing, votes/comments, production place lookup, and additional slide types. See the design plan for the full roadmap. This prototype has no account system or shared cloud trip database.

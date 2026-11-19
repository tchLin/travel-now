# Travel Now

A cozy trip studio for turning family and friend itineraries into portable HTML slide decks.

## Run locally

Requires Node.js 20 or later. No dependencies or API keys are needed.

```sh
npm run dev
```

Open <http://127.0.0.1:5173>. ES modules need an HTTP server; opening the editor's `index.html` directly is not supported. Exported HTML slides can be opened directly and work offline.

```sh
npm run check
npm test
npm run build
```

Deploy `dist/` to a static host. `.openai/hosting.json` records the associated private Sites deployment.

## Try it

1. Explore the editable Kyoto sample itinerary.
2. Add an activity, enter a place keyword, and check the generated Maps search link.
3. Change dates, drag activities to reorder, or use the accessible Move up/Move down buttons. Edit an activity's date to move it to another day.
4. Select one of 27 presets under **Look & feel**.
5. Preview your slides and open **Export & share**.
6. Download self-contained HTML, a JSON backup, or a ZIP with both. Import the JSON to keep editing later.

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
- `app/assets/`: bundled starter photography and favicon.
- `scripts/`: local server and static build.
- `tests/`: validation, escaping/privacy, date, pagination, theme and ZIP tests.
- `DESIGN_PLAN.md`: original product design and phased scope.

## Starter image credits

Photos are bundled from Unsplash for the prototype and are visual inspiration rather than verified place photos:

- Kyoto street: <https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e>
- Japanese lunch: <https://images.unsplash.com/photo-1519984388953-d2406bc725e1>
- Kyoto sunset: <https://images.unsplash.com/photo-1512692723619-8b3e68365c9c>

## Next steps

Multiple saved trips, authenticated group sharing, votes/comments, production place lookup, and additional slide types. See the design plan for the full roadmap. This prototype has no account system or shared cloud trip database.

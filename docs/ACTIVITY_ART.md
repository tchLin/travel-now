# Original activity illustration library

The library contains **180 original illustrated activity cards: 20 for each of nine destination groups**. Every card is available as an editable SVG and a 640 × 480 PNG companion. These are original code-native drawings, not stock photos, generated depictions of actual businesses, or verified destination photographs.

The visual language follows Travel Now's simple SVG graphics: warm paper, muted regional palettes, rounded shapes, fine outlines, soft landscape silhouettes, and small architectural/food details. Each activity uses a distinct composition. Regions differ in geometry as well as color, including roof forms, window treatments, timber framing, shophouses, food, bakery products, trees, and accessories.

## Coverage

Each of Japan, Korea, US, China, France, Spain, Germany, Southeast Asia, and Europe has these 20 activities:

1. Café / tea break
2. Breakfast
3. Food market
4. Museum / gallery
5. Heritage visit
6. Park picnic
7. Garden
8. Old-town walk
9. Train journey
10. Cycling
11. Beach break
12. Boat / ferry
13. Hiking
14. Spa / hot springs
15. Resort / guesthouse
16. Bakery
17. Dinner
18. Shopping / local crafts
19. Music evening
20. Sunset

Catalog titles are specific to the regional drawing and are available in English, Simplified Chinese, and Traditional Chinese. Broad regional inspiration is not a claim that every destination within a region has the same architecture, cuisine, or customs.

## Files and regeneration

- `app/activity-art.js`: closed asset catalog, translated labels, filters, and destination aliases.
- `app/assets/activities/<region>/<activity>.svg`: original editable drawings.
- `app/assets/activities/<region>/<activity>.png`: checked-in raster companions for portable exports.
- `scripts/generate-activity-art.mjs`: deterministic SVG authoring code.
- `scripts/render-activity-art.mjs`: optional PNG regeneration using `rsvg-convert` from librsvg; `RSVG_CONVERT` can specify its executable path.

```sh
node scripts/generate-activity-art.mjs
node scripts/render-activity-art.mjs
node --test tests/activity-art.test.mjs
```

Neither librsvg nor image generation services are needed to run the published app. All drawings and raster companions are already bundled.

## Integration and security

Use `filterActivityArt(region, category)` to narrow the library and `activityArtLabel(item, language)` for visible labels. `artworkRegionForDestination` accepts catalog IDs, canonical destination names, and the Simplified/Traditional Chinese names; an unknown destination yields `all` so users can choose any inspiration.

`getActivityArt(idOrPath)` resolves **only exact catalog IDs or file paths**. Keep arbitrary SVG uploads, `data:image/svg+xml`, SVG URLs, query strings, and path traversal rejected. For self-contained HTML/JSON, resolve the trusted catalog item and embed its `rasterSrc` PNG bytes as a `data:image/png;base64,...` value. This avoids accepting executable SVG markup or requiring browser-side SVG rendering during export.

## Validation and visual review

Automated tests verify the 180-item count, 20 distinct activities per region, all labels, region/category filtering, exact path allowlisting, safe static SVG elements, absence of scripts/events/external content, unique geometry after removing titles/colors, and PNG signatures/dimensions/import-size limits.

Representative contact sheets were rendered with librsvg and visually inspected. The Japan sheet covers every composition; the region comparison covers heritage architecture, breakfast, and music across all nine destination groups.

- [All 20 Japan compositions](activity-art-japan-preview.png)
- [Nine-region comparison](activity-art-regions-preview.png)

These reusable vector assets were authored directly in JavaScript/SVG. No raster image-generation tool or external image source was used for this library.

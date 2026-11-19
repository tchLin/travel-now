import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { activityArt, artworkRegions, getActivityArt, activityArtLabel, artworkRegionForDestination, filterActivityArt } from '../app/activity-art.js';

test('the illustration catalog includes 20 distinct activities for each of nine destinations', () => {
  assert.equal(artworkRegions.length, 9);
  assert.equal(activityArt.length, 180);
  assert.equal(new Set(activityArt.map(item => item.id)).size, 180);
  for (const region of artworkRegions) {
    const selected = filterActivityArt(region.id);
    assert.equal(selected.length, 20);
    assert.equal(new Set(selected.map(item => item.activity)).size, 20);
    for (const locale of ['en', 'zh-CN', 'zh-TW']) {
      assert.ok(region.labels[locale]);
      for (const item of selected) assert.ok(activityArtLabel(item, locale).trim());
    }
  }
});

test('regional aliases and activity categories select the expected illustrations', () => {
  for (const region of artworkRegions) {
    for (const alias of [region.name, region.id, ...Object.values(region.labels)]) {
      assert.equal(artworkRegionForDestination(alias), region.id);
      assert.equal(filterActivityArt(alias).length, 20);
    }
    const food = filterActivityArt(region.id, 'Food & drink');
    assert.equal(food.length, 5);
    assert.ok(food.every(item => item.category === 'Food & drink'));
  }
  assert.equal(artworkRegionForDestination('USA'), 'us');
  assert.equal(artworkRegionForDestination('South Korea'), 'korea');
  assert.equal(artworkRegionForDestination('South east Asia'), 'southeast-asia');
  assert.equal(artworkRegionForDestination('An unlisted destination'), 'all');
});

test('asset lookup is an exact catalog allowlist, not an SVG URL parser', () => {
  const item = activityArt[0];
  assert.equal(getActivityArt(item.id), item);
  assert.equal(getActivityArt(item.src), item);
  assert.equal(getActivityArt(item.rasterSrc), item);
  for (const value of ['assets/activities/japan/../../private.svg','assets/activities/japan/cafe.svg?x=1','https://example.org/cafe.svg','data:image/svg+xml,<svg/>','assets/activities/japan/nonexistent.svg','__proto__',null]) assert.equal(getActivityArt(value), null);
});

test('all bundled SVGs are distinct static drawings with no executable or external content', async () => {
  const hashes = new Set();
  const geometryHashes = new Set();
  for (const item of activityArt) {
    const svg = await readFile(new URL(`../app/${item.src}`, import.meta.url), 'utf8');
    assert.match(svg, /<svg[^>]+viewBox="0 0 640 480"/);
    assert.match(svg, /<title id="title">/);
    assert.doesNotMatch(svg, /<(?:script|foreignObject|image|use|style|a|animate|set|iframe|object|embed|feImage)(?:\s|>)/i);
    assert.doesNotMatch(svg, /\bon\w+\s*=|(?:href|src)\s*=|url\s*\(|<!DOCTYPE|<!ENTITY/i);
    const withoutNamespace = svg.replace('http://www.w3.org/2000/svg','');
    assert.doesNotMatch(withoutNamespace, /https?:|javascript:|data:/i);
    hashes.add(createHash('sha256').update(svg).digest('hex'));
    const geometry = svg.replace(/#[0-9a-f]{6}/gi,'#COLOR').replace(/<title[^>]*>.*?<\/title>/s,'');
    geometryHashes.add(createHash('sha256').update(geometry).digest('hex'));
  }
  assert.equal(hashes.size, 180);
  assert.equal(geometryHashes.size, 180, 'regional cards must not be simple recolors');
});

test('all 180 illustrations have small 640×480 PNG companions for self-contained export', async () => {
  for (const item of activityArt) {
    const png = await readFile(new URL(`../app/${item.rasterSrc}`, import.meta.url));
    assert.equal(png.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16),640);
    assert.equal(png.readUInt32BE(20),480);
    assert.ok(png.length < 1500000, `${item.id} must fit the image import limit`);
  }
});

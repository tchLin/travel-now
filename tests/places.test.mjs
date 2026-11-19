import test from 'node:test';
import assert from 'node:assert/strict';
import { mapsUrl, safeMapUrl, validPlaceId, validCoordinates, mapLinkInfo, activityMapUrl } from '../app/places.js';

test('museum search uses the exact entered keyword and never appends a saved trip country', () => {
  const url = new URL(mapsUrl('高雄美術館', 'Japan'));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.pathname, '/maps/search/');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('query'), '高雄美術館');
  assert.equal(url.searchParams.has('query_place_id'), false);
  assert.equal(mapLinkInfo({ place:'高雄美術館' }).kind, 'search');
});

test('Chinese, punctuation, accents, and literal query characters survive URL encoding', () => {
  for (const query of ['高雄市立美術館 高雄市鼓山區美術館路80號', 'Tea & coffee / café', '店名?x=1#東京', '  Seoul museum  ']) {
    const url = new URL(mapsUrl(query));
    assert.equal(url.searchParams.get('query'), query.trim());
    assert.deepEqual([...url.searchParams.keys()], ['api','query']);
  }
});

test('explicit street address adds context, while no automatic context is invented', () => {
  const url = new URL(mapsUrl('City Museum', { address:'10 Museum Road, City' }));
  assert.equal(url.searchParams.get('query'), 'City Museum, 10 Museum Road, City');
  assert.equal(new URL(mapsUrl('Museum, Kyoto')).searchParams.get('query'), 'Museum, Kyoto');
});

test('a supplied direct map link always overrides a fuzzy text search', () => {
  const direct = 'https://maps.app.goo.gl/exampleMuseumLink?g_st=ic';
  const activity = { place:'高雄美術館', mapUrl:direct, googlePlaceId:'DifferentId' };
  assert.equal(activityMapUrl(activity), direct);
  assert.deepEqual(mapLinkInfo(activity), { url:direct, kind:'saved', label:'Open saved map link' });
  assert.equal(activityMapUrl({ title:'Museum', mapUrl:'https://www.google.com/maps?cid=1234567890' }), 'https://www.google.com/maps?cid=1234567890');
});

test('explicit opaque Place IDs and coordinates are supported without a fake lookup', () => {
  const id = 'ChIJ3S-JXmauEmsRUcIaWtf4MzE';
  const url = new URL(mapsUrl('Museum', { placeId:id }));
  assert.equal(url.searchParams.get('query_place_id'), id);
  assert.equal(url.searchParams.get('query'), 'Museum');
  assert.equal(mapLinkInfo({ place:'Museum', googlePlaceId:id }).kind, 'place-id');
  const coordinateUrl = new URL(mapsUrl('', { coordinates:{ latitude:22.656, longitude:120.287 } }));
  assert.equal(coordinateUrl.searchParams.get('query'),'22.656,120.287');
  assert.equal(mapLinkInfo({coordinates:{latitude:0,longitude:0}}).kind,'coordinates');
  assert.equal(validPlaceId('  EicxMyBNYXJrZXQgU3Q= '),'EicxMyBNYXJrZXQgU3Q=');
  assert.equal(validPlaceId('bad id<script>'),'');
});

test('unsafe links, credentials, malformed coordinates, and blank/overlong queries do not become targets', () => {
  for(const url of ['javascript:alert(1)','data:text/html,hi','file:///etc/passwd','https://user:password@example.com/path','not a URL']) assert.equal(safeMapUrl(url),'');
  for(const value of [{latitude:91,longitude:0},{latitude:0,longitude:-181},{latitude:'22.6',longitude:120},{latitude:NaN,longitude:0},null]) assert.equal(validCoordinates(value),null);
  assert.equal(mapsUrl('  '),'');
  assert.equal(mapsUrl('高'.repeat(400)),'');
  assert.equal(mapLinkInfo({}).kind,'empty');
  assert.equal(mapLinkInfo({mapUrl:'javascript:alert(1)',place:'Museum'}).kind,'search');
  assert.equal(new URL(mapsUrl('Museum',{placeId:'bad id'})).searchParams.has('query_place_id'),false);
});

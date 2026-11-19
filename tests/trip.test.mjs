import test from 'node:test';
import assert from 'node:assert/strict';
import { demoTrip, validateTrip, themes, destinations, datesBetween, mapsUrl, publicTrip, slidesFor, safeImage } from '../app/trip.js';
import { renderDeck, zipFiles } from '../app/export.js';

test('all 27 styles are destination-neutral, with nine palettes per layout', () => {
  assert.equal(themes.length, 27);
  assert.equal(new Set(themes.map(t => t.id)).size, 27);
  for (const layout of ['journal','serif','modern']) assert.equal(themes.filter(t => t.layout === layout).length, 9);
  assert.ok(themes.every(t=>!('destination' in t)));
  assert.equal(new Set(themes.map(t=>t.name)).size,27);
});
test('the example trip survives a JSON round trip without losing fields', () => {
  const original = demoTrip();
  assert.deepEqual(validateTrip(JSON.parse(JSON.stringify(original))), original);
});
test('inclusive dates work across leap days and daylight saving changes', () => {
  assert.deepEqual(datesBetween('2028-02-28','2028-03-01'), ['2028-02-28','2028-02-29','2028-03-01']);
  assert.equal(datesBetween('2027-03-13','2027-03-15').length,3);
  assert.equal(datesBetween('2027-01-01','2027-03-31').length,90);
  assert.equal(datesBetween('2027-01-01','2027-04-01').length,0);
});
test('invalid imports fail before replacing the saved trip', () => {
  const original = demoTrip();
  for (const change of [
    t => t.schemaVersion = 2,
    t => t.endDate = '2027-02-30',
    t => t.endDate = '2027-03-01',
    t => t.activities[0].date = '2027-04-01',
    t => t.activities[0].startTime = '25:00',
    t => t.activities[0].endTime = '08:00',
    t => t.activities[1].id = t.activities[0].id,
    t => t.activities[0].mapUrl = 'javascript:alert(1)',
    t => t.activities[0].image = 'https://tracker.example/photo.jpg',
    t => t.activities[0].cost = -1,
    t => t.activities[0].title = '',
    t => t.timezone = 'Not/AZone',
  ]) { const trip=structuredClone(original); change(trip); assert.throws(() => validateTrip(trip)); }
  assert.deepEqual(original, demoTrip());
});
test('sharing removes private notes and hides costs by default without changing the editable trip', () => {
  const trip = demoTrip(); trip.activities[0].privateNotes = 'SECRET-BOOKING-731'; trip.activities[0].cost = 1234;
  assert.equal('privateNotes' in publicTrip(trip).activities[0],false);
  assert.equal(publicTrip(trip).activities[0].cost,null);
  assert.equal(publicTrip(trip,{includeCosts:true}).activities[0].cost,1234);
  assert.equal(trip.activities[0].privateNotes,'SECRET-BOOKING-731');
  assert.ok(!renderDeck(trip,{includeCosts:true}).includes('SECRET-BOOKING-731'));
  assert.ok(!renderDeck(trip).includes('Estimated cost:'));
  assert.ok(renderDeck(trip,{includeCosts:true}).includes('Estimated cost: 1234'));
});
test('HTML escapes imported content and never injects unsafe links or images', () => {
  const trip=demoTrip();trip.title='</title><script>alert(1)</script>';trip.activities[0].notes='<img src=x onerror=alert(2)>';trip.activities[0].mapUrl='javascript:alert(3)';trip.coverImage='data:image/svg+xml,<svg onload=alert(4)>';
  const html=renderDeck(trip);
  assert.ok(!html.includes('<script>alert(1)'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(2)&gt;'));
  assert.ok(!html.includes('javascript:'));
  assert.ok(!html.includes('data:image/svg+xml'));
  assert.equal(safeImage('assets/../../secret'), '');
});
test('slides split busy days into groups of three and preserve empty days', () => {
  const trip=demoTrip(), original=trip.activities[0];
  for(let i=0;i<4;i++)trip.activities.push({...original,id:`extra-${i}`});
  const slides=slidesFor(trip), firstDay=slides.filter(s=>s.date===trip.startDate);
  assert.deepEqual(firstDay.map(s=>s.activities.length),[3,3,1]);
  trip.activities=[];
  assert.equal(slidesFor(trip).length,6);
  assert.match(renderDeck(trip),/room for spontaneity/);
});
test('map searches preserve special characters through URL encoding', () => {
  const url=new URL(mapsUrl('Tea & coffee / café','日本'));
  assert.equal(url.searchParams.get('api'),'1');
  assert.equal(url.searchParams.get('query'),'Tea & coffee / café');
});
test('ZIP contains UTF-8 HTML and JSON entries with valid stored bytes', async () => {
  const files={'trip.html':'<h1>日本 & café</h1>','trip.json':JSON.stringify(demoTrip())};
  const data=new Uint8Array(await zipFiles(files).arrayBuffer());
  const view=new DataView(data.buffer);let offset=0;
  for(const [name,contents] of Object.entries(files)){
    assert.equal(view.getUint32(offset,true),0x04034b50);
    const size=view.getUint32(offset+18,true),n=view.getUint16(offset+26,true);
    assert.equal(new TextDecoder().decode(data.slice(offset+30,offset+30+n)),name);
    assert.equal(new TextDecoder().decode(data.slice(offset+30+n,offset+30+n+size)),contents);
    offset+=30+n+size;
  }
  assert.equal(view.getUint32(offset,true),0x02014b50);
  assert.equal(view.getUint32(data.length-22,true),0x06054b50);
});

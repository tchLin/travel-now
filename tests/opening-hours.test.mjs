import test from 'node:test';
import assert from 'node:assert/strict';
import { importHours, normalizeHours } from '../app/opening-hours.js';

test('manual multilingual hours preserve exactly what the user entered and source metadata',()=>{
  const text='週二至週日 09:30–17:30\n週一休館；國定假日請確認官網。';
  assert.deepEqual(importHours(text,{sourceUrl:'https://museum.example/hours',checkedAt:'2026-11-19'}),{text,sourceUrl:'https://museum.example/hours',checkedAt:'2026-11-19',kind:'manual'});
  assert.equal(normalizeHours(null),null);assert.equal(importHours('   '),null);
});
test('schema specifications preserve split periods and overnight hours',()=>{
  const result=importHours(JSON.stringify({openingHoursSpecification:[
    {dayOfWeek:['Monday','Tuesday'],opens:'09:00',closes:'12:00'},
    {dayOfWeek:['Monday','Tuesday'],opens:'14:00:00',closes:'18:00:00'},
    {dayOfWeek:'https://schema.org/Friday',opens:'21:00',closes:'02:00'},
  ]}));
  assert.equal(result.kind,'imported');
  assert.equal(result.text,'Monday, Tuesday: 09:00–12:00\nMonday, Tuesday: 14:00–18:00\nFriday: 21:00–02:00 (next day)');
});
test('closed and 24-hour conventions are explicit without inferring unspecified days',()=>{
  const result=importHours(JSON.stringify({openingHoursSpecification:[
    {dayOfWeek:'Monday'},
    {dayOfWeek:'Tuesday',opens:'00:00',closes:'00:00'},
    {dayOfWeek:'Wednesday',opens:'00:00',closes:'23:59'},
    {dayOfWeek:'Thursday',opens:'00:00',closes:'24:00'},
    {opens:'10:00',closes:'12:00'},
  ]}));
  assert.equal(result.text,'Monday: Closed\nTuesday: Closed\nWednesday: Open 24 hours\nThursday: Open 24 hours\nDays not specified: 10:00–12:00');
});
test('date-bounded schedules retain their validity range and Chinese formatting',()=>{
  const value={openingHoursSpecification:{dayOfWeek:['Saturday','Sunday'],opens:'10:00',closes:'16:00',validFrom:'2026-12-01',validThrough:'2027-01-10'}};
  assert.equal(importHours(JSON.stringify(value),{language:'zh-TW'}).text,'週六, 週日: 10:00–16:00 [起 2026-12-01 · 至 2027-01-10]');
  assert.match(importHours(JSON.stringify(value),{language:'zh-CN'}).text,/周六/);
});
test('compact schema text and JSON-LD inside pasted HTML can be imported without execution',()=>{
  const json={'@context':'https://schema.org','@type':'Museum',openingHours:['Tu-Su 09:30-17:30','Mo closed']};
  const html=`<html><script>globalThis.hoursAttack=true</script><script type="application/ld+json">${JSON.stringify({'@graph':[json]})}</script><img src="https://tracker.example/pixel"></html>`;
  assert.equal(importHours(html).text,'Tu-Su 09:30-17:30\nMo closed');
  assert.equal(globalThis.hoursAttack,undefined);
  assert.throws(()=>importHours('<script>alert(1)</script>'),/No JSON-LD/);
});
test('multiple venues cannot silently blend into one destination’s hours',()=>{
  assert.throws(()=>importHours(JSON.stringify({'@graph':[{name:'Museum',openingHours:'Tu-Su 09:00-17:00'},{name:'Nearby café',openingHours:'Mo-Su 07:00-21:00'}]})),/multiple places/);
});
test('invalid dates, time ranges, URLs, types, oversized input, and fake verification fail safely',()=>{
  for(const sourceUrl of ['javascript:alert(1)','data:text/html,bad','https://user:password@example.com','not a URL'])assert.throws(()=>importHours('Monday 9–5',{sourceUrl}),/source/);
  for(const checkedAt of ['2026-02-30','2026-13-01','19/11/2026'])assert.throws(()=>importHours('Monday 9–5',{checkedAt}),/date/);
  assert.throws(()=>normalizeHours({text:'Hours',kind:'verified'}),/not live verified/);
  assert.throws(()=>normalizeHours({text:5}),/text/);
  assert.throws(()=>importHours('x'.repeat(100001)),/100 KB/);
  assert.throws(()=>importHours('高'.repeat(40000)),/100 KB/);
  assert.throws(()=>importHours('{bad json'),/could not be read/);
  assert.throws(()=>importHours(JSON.stringify({openingHoursSpecification:{}})),/Invalid openingHoursSpecification/);
  assert.throws(()=>importHours(JSON.stringify({openingHoursSpecification:{dayOfWeek:'MoonDay',opens:'09:00',closes:'17:00'}})),/unsupported day/);
  assert.throws(()=>importHours(JSON.stringify({openingHoursSpecification:{dayOfWeek:'Monday',opens:'27:00',closes:'17:00'}})),/invalid time/);
  assert.throws(()=>importHours(JSON.stringify({openingHoursSpecification:{dayOfWeek:'Monday',opens:'09:00',closes:'09:00'}})),/ambiguous/);
  assert.throws(()=>importHours(JSON.stringify({openingHoursSpecification:{dayOfWeek:'Monday',opens:'09:00',closes:'17:00',validFrom:'2026-12-01',validThrough:'2026-01-01'}})),/reversed/);
  assert.throws(()=>importHours(JSON.stringify({openingHoursSpecification:{dayOfWeek:'Monday',opens:'09:00',closes:'17:00',validFrom:'2026-02-30'}})),/invalid validity/);
});
test('imported markup remains inert text and cannot add prototype properties',()=>{
  const hours=importHours('{"__proto__":{"polluted":true},"openingHours":"<img src=x onerror=alert(1)>"}');
  assert.equal(hours.text,'<img src=x onerror=alert(1)>');
  assert.equal({}.polluted,undefined);
  assert.deepEqual(Object.keys(hours),['text','sourceUrl','checkedAt','kind']);
});

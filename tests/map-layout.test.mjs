import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { demoTrip } from '../app/trip.js';

test('custom map link follows lookup and survives saving/reopening an activity', async () => {
  const window = new Window({ url:'https://example.com/travel-now/', settings:{ enableJavaScriptEvaluation:false, enableCSSFileLoading:false, enableIframePageLoading:false } });
  for (const name of ['document','localStorage','location','Event','KeyboardEvent','NodeFilter','FormData','innerHeight','innerWidth']) globalThis[name]=window[name];
  globalThis.addEventListener=window.addEventListener.bind(window);
  globalThis.setTimeout=window.setTimeout.bind(window);
  globalThis.clearTimeout=window.clearTimeout.bind(window);
  window.document.body.innerHTML='<div id="app"></div><dialog id="dialog"></dialog><div id="toast"></div><input type="file" id="import-file">';
  const trip=demoTrip();
  const originalLink='https://www.google.com/maps/search/?api=1&query=Kaohsiung+Museum+of+Fine+Arts';
  trip.activities[0].mapUrl=originalLink;
  localStorage.setItem('travel-now:trip:v1',JSON.stringify(trip));
  try {
    await import('../app/app.js');
    document.querySelector('[data-guidance-choice="decline"]')?.click();
    document.querySelector('[data-action="edit"][data-id="a1"]').click();
    const form=document.querySelector('#activity-form');
    const lookup=form.querySelector('#map-preview');
    const field=form.querySelector('#custom-map-input');
    const date=form.querySelector('[name="date"]');
    assert.equal(form.querySelectorAll('[name="mapUrl"]').length,1);
    assert.ok(lookup.compareDocumentPosition(field)&window.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.ok(field.compareDocumentPosition(date)&window.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.equal(field.value,originalLink);
    assert.equal(lookup.href,originalLink);
    assert.equal(lookup.dataset.kind,'saved');
    assert.match(field.parentElement.textContent,/saved link takes priority/i);
    const replacement='https://maps.app.goo.gl/exampleMuseum';
    field.value='';form.elements.place.value='高雄美術館';
    form.elements.place.dispatchEvent(new Event('input',{bubbles:true}));
    assert.equal(new URL(lookup.href).searchParams.get('query'),'高雄美術館');
    assert.equal(lookup.dataset.kind,'search');
    field.value=replacement;
    field.dispatchEvent(new Event('input',{bubbles:true}));
    assert.equal(lookup.href,replacement);
    assert.equal(lookup.dataset.kind,'saved');
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    assert.equal(JSON.parse(localStorage.getItem('travel-now:trip:v1')).activities[0].mapUrl,replacement);
    document.querySelector('[data-action="edit"][data-id="a1"]').click();
    assert.equal(document.querySelector('#custom-map-input').value,replacement);
  } finally { await window.happyDOM.abort();window.close(); }
});

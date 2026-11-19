import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setImmediate } from 'node:timers/promises';
import { Window } from 'happy-dom';
import { demoTrip, validateTrip, safeImage } from '../app/trip.js';
import { activityArt, getActivityArt } from '../app/activity-art.js';
import { renderDeck, portableTrip } from '../app/export.js';
import { translate } from '../app/i18n.js';

test('declining guidance, importing hours, and selecting artwork persist through editing and exports',async()=>{
  const window=new Window({url:'https://example.com/travel-now/',settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false,enableIframePageLoading:false}});
  for(const name of ['document','localStorage','location','Event','KeyboardEvent','NodeFilter','FormData','innerHeight','innerWidth'])globalThis[name]=window[name];
  globalThis.addEventListener=window.addEventListener.bind(window);globalThis.setTimeout=window.setTimeout.bind(window);globalThis.clearTimeout=window.clearTimeout.bind(window);
  document.body.innerHTML='<div id="app"></div><dialog id="dialog"></dialog><div id="toast"></div><input id="import-file" type="file">';
  const $=s=>document.querySelector(s),trip=demoTrip();
  localStorage.setItem('travel-now:trip:v1',JSON.stringify(trip));
  try{
    await import('../app/app.js');
    assert.equal($('[data-action="guide"]'),null);
    $('[data-guidance-choice="decline"]').click();assert.equal($('#tour-panel'),null);
    $('[data-action="edit"][data-id="a1"]').click();
    assert.equal($('#art-gallery').children.length,20);
    $('#art-region-filter').value='france';$('#art-region-filter').dispatchEvent(new Event('change',{bubbles:true}));
    assert.equal($('#art-gallery').children.length,20);
    $('#art-category-filter').value='Stay';$('#art-category-filter').dispatchEvent(new Event('change',{bubbles:true}));
    assert.ok($('#art-gallery').children.length>=1);
    const art=$('#art-gallery [data-action="pick-photo"]'),src=art.dataset.src;art.click();
    const form=$('#activity-form');assert.equal(form.elements.image.value,src);
    $('#art-category-filter').value='all';$('#art-category-filter').dispatchEvent(new Event('change',{bubbles:true}));
    assert.equal(form.elements.image.value,src);assert.ok($('#selected-photo-preview img').src.endsWith(src));
    form.elements.hoursSourceUrl.value='https://example.com/official-hours';form.elements.hoursCheckedAt.value='2026-11-19';
    $('#hours-import-content').value=JSON.stringify({openingHoursSpecification:[{dayOfWeek:'Monday',opens:'10:00',closes:'18:00'}]});
    $('[data-action="import-hours"]').click();
    assert.equal(form.elements.hoursKind.value,'imported');assert.match(form.elements.hoursText.value,/Monday: 10:00–18:00/);
    form.elements.hoursText.value='Replace these hours from the file';
    const hoursFile={size:180,text:async()=>'<script type="application/ld+json">{"openingHoursSpecification":{"dayOfWeek":"Monday","opens":"10:00","closes":"18:00"}}</script>'};
    Object.defineProperty($('#hours-import-file'),'files',{value:[hoursFile],configurable:true});
    $('#hours-import-file').dispatchEvent(new Event('change',{bubbles:true}));
    await setImmediate();
    assert.match(form.elements.hoursText.value,/Monday: 10:00–18:00/);
    assert.equal(form.elements.hoursKind.value,'imported');
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    const saved=validateTrip(JSON.parse(localStorage.getItem('travel-now:trip:v1'))),a=saved.activities[0];
    assert.equal(a.image,src);assert.equal(a.openingHours.kind,'imported');assert.equal(a.openingHours.checkedAt,'2026-11-19');
    assert.match($('.hours-note').textContent,/not live verified/);
    const html=renderDeck(saved);assert.match(html,/Monday: 10:00–18:00/);assert.match(html,/https:\/\/example.com\/official-hours/);
    $('[data-action="edit"][data-id="a1"]').click();
    assert.equal($('#activity-form').elements.image.value,src);assert.equal($('#activity-form').elements.hoursKind.value,'imported');
    $('#activity-form').elements.hoursText.value='<img src=x onerror=alert(1)> Saturday 12:00–16:00';
    $('#activity-form').elements.hoursText.dispatchEvent(new Event('input',{bubbles:true}));
    assert.equal($('#activity-form').elements.hoursKind.value,'manual');
    $('#activity-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    const edited=JSON.parse(localStorage.getItem('travel-now:trip:v1'));
    assert.ok(!renderDeck(edited).includes('<img src=x onerror='));assert.match(renderDeck(edited),/&lt;img src=x/);
    assert.equal($('#tour-panel'),null);
    for(const language of ['zh-CN','zh-TW']) {
      $('[name="language"]').value=language;
      $('[name="language"]').dispatchEvent(new Event('change',{bubbles:true}));
      assert.ok($('.hours-note').textContent.includes(translate('Manually entered · not live verified',language)));
      $('[data-action="edit"][data-id="a1"]').click();
      assert.equal($('.hours-editor>summary').textContent,translate('Opening hours (optional)',language));
      assert.equal($('.hours-file-label span').textContent,translate('Choose an hours file',language));
      assert.equal($('.illustration-library>summary').textContent,translate('180 cozy activity illustrations',language));
      assert.equal($('#map-preview').textContent.trim(),translate('Search Google Maps',language));
      assert.match($('#art-gallery button').getAttribute('aria-label'),/[\u3400-\u9fff]/);
      $('#hours-import-content').value='';
      $('[data-action="import-hours"]').click();
      assert.equal($('#hours-feedback').textContent,translate('Paste opening hours before importing.',language));
      const unchangedHours=$('#activity-form').elements.hoursText.value;
      Object.defineProperty($('#hours-import-file'),'files',{value:[{size:100001,text:()=>{throw new Error('oversize input must not be read');}}]});
      $('#hours-import-file').dispatchEvent(new Event('change',{bubbles:true}));
      await setImmediate();
      assert.equal($('#hours-feedback').textContent,translate('Paste opening hours or a JSON/HTML file smaller than 100 KB.',language));
      assert.equal($('#activity-form').elements.hoursText.value,unchangedHours);
      $('[data-action="close"]').click();
      assert.ok(renderDeck(edited,{language}).includes(translate('Opening hours',language)));
    }
  }finally{await window.happyDOM.abort();window.close();}
});

test('catalog images become portable PNGs and survive JSON re-import',async()=>{
  const originalFetch=globalThis.fetch,originalReader=globalThis.FileReader;
  const requested=[];
  globalThis.fetch=async path=>{requested.push(path);return new Response(await readFile(`app/${path}`),{headers:{'Content-Type':path.endsWith('.png')?'image/png':'image/jpeg'}});};
  globalThis.FileReader=class{async readAsDataURL(blob){try{this.result=`data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;this.onload?.();}catch(error){this.onerror?.(error);}}};
  try{
    const trip=demoTrip(),art=activityArt[0];trip.coverImage=art.src;trip.activities=trip.activities.slice(0,1);trip.activities[0].image=art.src;
    assert.equal(safeImage(art.src),art.src);assert.equal(safeImage('assets/activities/japan/not-in-catalog.svg'),'');
    assert.equal(safeImage('data:image/svg+xml;base64,PHN2Zz4='),'');
    const portable=await portableTrip(trip);
    assert.equal(requested.length,1);assert.equal(requested[0],getActivityArt(art.src).rasterSrc);
    assert.match(portable.coverImage,/^data:image\/png;base64,/);assert.equal(portable.coverImage,portable.activities[0].image);
    assert.deepEqual(validateTrip(JSON.parse(JSON.stringify(portable))),portable);
    const html=renderDeck(portable);assert.ok(!html.includes('assets/activities/'));assert.ok(!html.includes('data:image/svg+xml'));
  }finally{globalThis.fetch=originalFetch;globalThis.FileReader=originalReader;}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { Window } from 'happy-dom';
import { demoTrip } from '../app/trip.js';

test('accepted arrival guidance resumes on Details after importing a trip', async()=>{
  const window=new Window({url:'https://example.com/travel-now/',settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false,enableIframePageLoading:false}});
  for(const name of ['document','localStorage','location','Event','KeyboardEvent','NodeFilter','FormData','innerHeight','innerWidth'])globalThis[name]=window[name];
  globalThis.addEventListener=window.addEventListener.bind(window);
  globalThis.setTimeout=window.setTimeout.bind(window);
  globalThis.clearTimeout=window.clearTimeout.bind(window);
  document.body.innerHTML='<div id="app"></div><dialog id="dialog"></dialog><div id="toast"></div><input id="import-file" type="file">';
  const $=s=>document.querySelector(s);
  try {
    await import('../app/app.js');
    $('[data-guidance-choice="accept"]').click();
    assert.equal($('#tour-panel'),null);
    const imported=demoTrip();imported.language='zh-TW';
    const file={size:1000,text:async()=>JSON.stringify(imported)};
    Object.defineProperty($('#import-file'),'files',{value:[file]});
    $('#import-file').dispatchEvent(new Event('change',{bubbles:true}));
    await setImmediate();
    assert.ok($('#confirm-import'));
    $('#confirm-import').click();
    assert.equal($('#dialog').open,false);
    assert.equal(document.documentElement.lang,'zh-TW');
    assert.ok($('#details-form'),'the first guide step must display the Details form');
    assert.match($('#tour-title').textContent,/基本資訊/);
    assert.equal(document.activeElement,$('#tour-panel [data-action="tour-next"]'));
    $('[data-action="tour-close"]').click();
    $('#details-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    assert.equal($('#tour-panel'),null,'the accepted tour starts only once');
  } finally {await window.happyDOM.abort();window.close();}
});

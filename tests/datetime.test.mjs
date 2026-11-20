import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { demoTrip, timeLabel, themes, themeLayouts } from '../app/trip.js';
import { renderDeck } from '../app/export.js';

test('clock labels distinguish midnight and noon without shifting the activity timezone',()=>{
  assert.equal(timeLabel('00:00','en'),'12:00 AM');assert.equal(timeLabel('12:00','en'),'12:00 PM');
  assert.equal(timeLabel('09:05','en'),'9:05 AM');assert.equal(timeLabel('23:59','en'),'11:59 PM');
  for(const language of ['zh-CN','zh-TW'])for(const value of ['00:00','09:05','12:00','23:59'])assert.equal(timeLabel(value,language),value);
  for(const value of ['',null,'24:00','12:60'])assert.equal(timeLabel(value),'');
});

test('preview date and time groups stay intact in all layout families and languages',()=>{
  for(const language of ['en','zh-CN','zh-TW'])for(const layout of themeLayouts)for(const width of [320,1100]){
    const window=new Window({settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false}});window.happyDOM.setViewport({width,height:844});
    try {
      const trip=demoTrip();trip.language=language;trip.themeId=themes.find(theme=>theme.layout===layout.id).id;
      trip.activities[0].startTime='00:00';trip.activities[0].endTime='12:00';
      window.document.write(renderDeck(trip));const $=selector=>window.document.querySelector(selector);
      const heading=$('.day-heading h2 time');assert.equal(heading.dateTime,trip.startDate);
      assert.equal(heading.textContent,language==='en'?'Mar 22':'3月22日');assert.match($('.day-weekday').textContent,/2027/);
      assert.equal(window.getComputedStyle(heading).whiteSpace,'nowrap');
      const clock=$('.activity-clock');assert.equal(clock.querySelector('br'),null);
      assert.deepEqual([...clock.querySelectorAll('time')].map(time=>time.textContent),[timeLabel('00:00',language),timeLabel('12:00',language)]);
      assert.equal(clock.querySelector('time').dateTime,'2027-03-22T00:00');
      for(const element of window.document.querySelectorAll('.date-range time,.date-range-end,.activity-clock time,.clock-end'))assert.equal(window.getComputedStyle(element).whiteSpace,'nowrap');
      assert.match($('.timezone-note').textContent,/Asia\/Tokyo/);
    }finally{window.close();}
  }
});

test('cover dates include both years across New Year and avoid duplicate single-day dates',()=>{
  const window=new Window({settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false}});
  try {
    const trip=demoTrip();trip.activities=[];trip.startDate='2027-12-31';trip.endDate='2028-01-01';
    for(const language of ['en','zh-CN','zh-TW']){
      window.document.body.innerHTML=renderDeck(trip,{language});
      const times=[...window.document.querySelectorAll('.cover .date-range time')];
      assert.equal(times.length,2);assert.match(times[0].textContent,/2027/);assert.match(times[1].textContent,/2028/);
      assert.deepEqual(times.map(time=>time.dateTime),[trip.startDate,trip.endDate]);
    }
    trip.startDate=trip.endDate='2028-02-29';window.document.body.innerHTML=renderDeck(trip);
    assert.equal(window.document.querySelectorAll('.cover .date-range time').length,1);
    assert.equal(window.document.querySelector('.date-range').textContent,'Feb 29, 2028');
  }finally{window.close();}
});

test('new time inputs start at midnight, retain edits, and can be cleared back to Anytime',async()=>{
  const window=new Window({url:'https://example.com/travel-now/',settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false,enableIframePageLoading:false}});
  for(const name of ['document','localStorage','location','Event','KeyboardEvent','NodeFilter','FormData','innerHeight','innerWidth'])globalThis[name]=window[name];
  globalThis.addEventListener=window.addEventListener.bind(window);globalThis.setTimeout=window.setTimeout.bind(window);globalThis.clearTimeout=window.clearTimeout.bind(window);
  document.body.innerHTML='<div id="app"></div><dialog id="dialog"></dialog><div id="toast"></div><input id="import-file" type="file">';
  localStorage.setItem('travel-now:trip:v1',JSON.stringify(demoTrip()));const $=selector=>document.querySelector(selector);
  try {
    await import('../app/app.js');$('[data-guidance-choice="decline"]').click();$('[data-action="add"]').click();
    let form=$('#activity-form');assert.equal(form.elements.startTime.value,'00:00');assert.equal(form.elements.endTime.value,'');
    form.elements.endTime.dispatchEvent(new window.PointerEvent('pointerdown',{bubbles:true,pointerType:'touch'}));assert.equal(form.elements.endTime.value,'00:00');
    form.elements.startTime.value='09:30';form.elements.endTime.value='10:15';form.elements.startTime.dispatchEvent(new window.FocusEvent('focusin',{bubbles:true}));assert.equal(form.elements.startTime.value,'09:30');
    form.elements.title.value='Breakfast';const id=form.dataset.id;form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    $(`[data-action="edit"][data-id="${id}"]`).click();form=$('#activity-form');assert.equal(form.elements.startTime.value,'09:30');assert.equal(form.elements.endTime.value,'10:15');
    $('[data-action="clear-time"][data-field="startTime"]').click();assert.equal(form.elements.startTime.value,'');assert.equal(form.elements.endTime.value,'');
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    const saved=JSON.parse(localStorage.getItem('travel-now:trip:v1'));assert.equal(saved.activities.find(a=>a.id===id).startTime,'');assert.match(renderDeck(saved),/Anytime/);
    $(`[data-action="edit"][data-id="${id}"]`).click();form=$('#activity-form');assert.equal(form.elements.startTime.value,'');form.elements.startTime.dispatchEvent(new window.FocusEvent('focusin',{bubbles:true}));assert.equal(form.elements.startTime.value,'00:00');
  }finally{await window.happyDOM.abort();window.close();}
});

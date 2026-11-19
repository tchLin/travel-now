import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { demoTrip } from '../app/trip.js';
import { translate, localizeUI } from '../app/i18n.js';

test('language round trips, direct deletion, and destination-neutral themes work together',async t=>{
  const window=new Window({url:'https://example.com/travel-now/',settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false,enableIframePageLoading:false}});
  for(const name of ['document','localStorage','location','Event','KeyboardEvent','NodeFilter','FormData','innerHeight','innerWidth'])globalThis[name]=window[name];
  globalThis.addEventListener=window.addEventListener.bind(window);globalThis.setTimeout=window.setTimeout.bind(window);globalThis.clearTimeout=window.clearTimeout.bind(window);
  document.body.innerHTML='<div id="app"></div><dialog id="dialog"></dialog><div id="toast"></div><input id="import-file" type="file">';
  const $=s=>document.querySelector(s),click=action=>$(`[data-action="${action}"]`).click();
  const language=locale=>{const control=$('[name="language"]');control.value=locale;control.dispatchEvent(new Event('change',{bubbles:true}));};
  const saved=()=>JSON.parse(localStorage.getItem('travel-now:trip:v1'));
  // Older releases persisted localized example text; an English preference must recover it.
  const legacy=demoTrip();legacy.language='zh-TW';
  for(const field of ['title','tagline','travelers'])legacy[field]=translate(legacy[field],'zh-TW');
  for(const activity of legacy.activities)for(const field of ['title','place','notes'])activity[field]=translate(activity[field],'zh-TW');
  localStorage.setItem('travel-now:trip:v1',JSON.stringify(legacy));localStorage.setItem('travel-now:language','en');
  try {
    await import('../app/app.js');$('[data-guidance-choice="decline"]').click();
    await t.test('old translated sample and all three language views return cleanly to English',()=>{
      assert.equal($('.page-heading h1').textContent,demoTrip().title);
      assert.doesNotMatch($('#app').textContent,/\p{Script=Han}/u);
      for(const locale of ['zh-CN','zh-TW','en']){
        language(locale);assert.equal($('.page-heading h1').textContent,translate(demoTrip().title,locale));
        assert.equal($('.activity-body h3').textContent,translate(demoTrip().activities[0].title,locale));
        assert.equal($('[data-action="delete"]').textContent,translate('Delete activity',locale));
        assert.equal(saved().language,locale);
      }
      assert.doesNotMatch($('#app').textContent,/\p{Script=Han}/u);
      assert.doesNotMatch($('#mini-frame').srcdoc,/\p{Script=Han}/u);
    });
    await t.test('existing dialog labels, accessible attributes, and menus relocalize without stale Chinese',()=>{
      language('zh-TW');click('edit');
      const title=$('#activity-form [name="title"]');title.value='使用者自己寫的標題';
      language('en');assert.equal(title.value,'使用者自己寫的標題');
      assert.equal($('#activity-form [name="title"]').placeholder,'A slow morning together');
      assert.equal($('#activity-form [name="category"]').parentElement.querySelector('[role="combobox"]').textContent,'Explore');
      assert.equal($('.illustration-library summary').textContent,'Cozy activity illustrations');
      assert.doesNotMatch($('.illustration-library').textContent,/\p{Script=Han}/u);
      const select=$('#activity-form [name="category"]'),control=select.parentElement.querySelector('[role="combobox"]');control.click();
      [...select.parentElement.querySelectorAll('[role="option"]')].find(option=>option.textContent==='Stay').click();
      assert.equal(control.textContent,'Stay');assert.equal(select.value,'Stay');click('close');
    });
    await t.test('user-written Chinese stays intact when switching languages',()=>{
      click('edit');const form=$('#activity-form');form.elements.title.value='高雄美術館';form.elements.notes.value='我自己的備註';form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      language('zh-CN');language('zh-TW');language('en');
      assert.equal($('.activity-body h3').textContent,'高雄美術館');assert.equal($('.activity-body>p').textContent,'我自己的備註');
      assert.equal(saved().activities[0].title,'高雄美術館');
    });
    await t.test('delete from itinerary removes exactly that activity and Undo restores all data',()=>{
      const before=saved(),button=$('.activity-card[data-id="a1"] [data-action="delete"]');
      assert.equal($('#dialog').open,false);button.click();
      assert.equal(saved().activities.length,before.activities.length-1);assert.equal($('.activity-card[data-id="a1"]'),null);
      assert.equal($('#dialog').open,false);assert.equal(document.activeElement,$('[data-action="undo"]'));
      click('undo');assert.deepEqual(saved().activities,before.activities);assert.ok($('.activity-card[data-id="a1"]'));
    });
    await t.test('themes filter by layout without countries, while saved theme IDs remain compatible',()=>{
      const activities=saved().activities;click('styles');
      assert.equal(document.querySelectorAll('.theme-card').length,27);
      assert.doesNotMatch($('.styles-section').textContent,/Japan|Korea|France|Germany|China|Spain|Europe|Kyoto|Seoul|Paris/);
      assert.equal($('[data-action="region"]'),null);
      for(const layout of ['journal','serif','modern']){
        $(`[data-layout="${layout}"]`).click();assert.equal(document.querySelectorAll('.theme-card').length,9);
        const card=$('.theme-card'),id=card.dataset.id;card.click();assert.equal(saved().themeId,id);assert.deepEqual(saved().activities,activities);
      }
      $('[data-layout="All styles"]').click();language('zh-TW');language('en');
      assert.doesNotMatch($('.styles-section').textContent,/\p{Script=Han}/u);
      click('home');click('add');assert.equal($('#art-region-filter').options.length,10);assert.equal($('#art-region-filter').value,'japan');click('close');
    });
    await t.test('localization is reversible and protects user content',()=>{
      const root=document.createElement('div');root.innerHTML='<p>Saved on this device</p><input placeholder="Activity name" aria-label="Destination"><p data-user-content>我的筆記</p>';
      for(const locale of ['zh-CN','zh-TW','en']){localizeUI(root,locale);assert.equal(root.querySelector('p').textContent,translate('Saved on this device',locale));assert.equal(root.querySelector('input').placeholder,translate('Activity name',locale));assert.equal(root.querySelector('[data-user-content]').textContent,'我的筆記');}
    });
  }finally{await window.happyDOM.abort();window.close();}
});

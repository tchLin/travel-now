import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { newTrip, themes, validateTrip, demoTrip } from '../app/trip.js';
import { renderDeck } from '../app/export.js';
import { translate, translatedKeys } from '../app/i18n.js';

test('onboarding, menus, tour, translations, and saved content work together', async t => {
  const window = new Window({ url:'https://example.com/travel-now/', settings:{ enableJavaScriptEvaluation:false, enableCSSFileLoading:false, enableIframePageLoading:false } });
  for (const name of ['document','localStorage','location','Event','KeyboardEvent','NodeFilter','FormData','innerHeight','innerWidth']) globalThis[name]=window[name];
  globalThis.addEventListener=window.addEventListener.bind(window);
  globalThis.setTimeout=window.setTimeout.bind(window);
  globalThis.clearTimeout=window.clearTimeout.bind(window);
  window.document.body.innerHTML='<div id="app"></div><dialog id="dialog"></dialog><div id="toast"></div><input type="file" id="import-file">';
  const $=s=>document.querySelector(s), click=action=>$(`[data-action="${action}"]`).click();
  const chooseLanguage=language=>{const field=$('[name="language"]');field.value=language;field.dispatchEvent(new Event('change',{bubbles:true}));};
  try {
    await import('../app/app.js');
    assert.equal($('[data-action="guide"]'),null);
    $('[data-guidance-choice="accept"]').click();
    await t.test('first visit starts with a destination-free form and all 27 styles',()=>{
      assert.ok($('#setup-form'));
      assert.equal($('#setup-form [name="destination"]').value,'');
      assert.equal($('#setup-form [name="themeId"]').options.length,27);
      assert.equal($('.activity-card'),null);
      const dest=$('[name="destination"]');dest.click();
      assert.equal(dest.getAttribute('aria-expanded'),'true');
      const item=[...dest.parentElement.querySelectorAll('[role="option"]')].find(el=>el.textContent==='France');item.click();
      assert.equal(dest.value,'France');assert.equal(dest.getAttribute('aria-expanded'),'false');
    });
    await t.test('language changes preserve an unfinished setup form',()=>{
      $('#setup-form [name="title"]').value='Next';
      chooseLanguage('zh-CN');
      assert.equal(document.documentElement.lang,'zh-CN');
      assert.equal($('#setup-form [name="title"]').value,'Next');
      assert.equal($('#setup-form [name="destination"]').value,'France');
      assert.match($('.welcome-intro').textContent,/规划一场/);
    });
    await t.test('creating a trip starts an actionable five-step guide',()=>{
      $('#setup-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      assert.ok($('#tour-panel'));assert.match($('#tour-title').textContent,/基本信息/);
      assert.equal($('.page-heading h1').textContent,'Next');
      click('tour-next');assert.ok($('[data-tour="activities"]'));
      click('tour-next');assert.equal(document.querySelectorAll('.theme-card').length,27);
      click('tour-next');assert.ok($('[data-tour="preview"]'));
      click('tour-next');assert.ok($('[data-tour="export"]'));
      click('tour-next');assert.equal($('#tour-panel'),null);
    });
    await t.test('activity dropdown supports keyboard selection and canonical form values',()=>{
      click('add');const select=$('#activity-form [name="category"]'), control=select.parentElement.querySelector('[role="combobox"]');
      control.click();control.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
      control.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
      assert.equal(select.value,'Food & drink');assert.equal(control.textContent,'美食饮品');
      assert.equal(new FormData($('#activity-form')).get('category'),'Food & drink');
      $('#activity-form [name="title"]').value='My own words';$('#activity-form [name="notes"]').value='Next';
      $('#activity-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      assert.match($('.activity-body').textContent,/My own words/);
    });
    await t.test('Traditional Chinese translates UI without rewriting trip content',()=>{
      chooseLanguage('zh-TW');
      assert.equal(document.documentElement.lang,'zh-TW');
      assert.equal($('.page-heading h1').textContent,'Next');
      assert.equal($('.activity-body>p').textContent,'Next');
      assert.match($('.category').textContent,/美食飲品/);
      assert.match($('[data-action="share"]').textContent,/匯出與分享/);
      click('styles');assert.equal(document.querySelectorAll('.theme-card').length,27);
      assert.ok(!$('.theme-grid').textContent.includes('Kyoto Tea House'));
      assert.match($('.theme-grid').textContent,/京都茶屋/);
      const stored=JSON.parse(localStorage.getItem('travel-now:trip:v1'));
      assert.equal(stored.destination,'France');assert.equal(stored.language,'zh-TW');assert.equal(stored.activities[0].notes,'Next');
    });
    await t.test('new-trip setup can be cancelled without losing an existing trip',()=>{
      click('new');click('confirm-new');assert.equal($('#setup-form [name="destination"]').value,'');
      click('cancel-create');assert.equal($('.page-heading h1').textContent,'Next');
    });
    await t.test('Chinese destination suggestions insert the displayed name and remain optional',()=>{
      click('new');click('confirm-new');const field=$('#setup-form [name="destination"]');field.click();
      [...field.parentElement.querySelectorAll('[role="option"]')].find(el=>el.textContent==='德國').click();
      assert.equal(field.value,'德國');
      field.value='My custom destination';field.dispatchEvent(new Event('input',{bubbles:true}));
      assert.equal(field.getAttribute('aria-expanded'),'false');
      click('cancel-create');assert.equal($('.page-heading h1').textContent,'Next');
    });
  } finally { await window.happyDOM.abort();window.close(); }
});

test('Chinese exports translate labels and dates while preserving user content and privacy',()=>{
  for(const language of ['zh-CN','zh-TW']){
    const trip=demoTrip();trip.language=language;trip.title='Next';trip.activities[0].privateNotes='PRIVATE-123';
    const html=renderDeck(trip);
    assert.match(html,new RegExp(`<html lang="${language}">`));assert.match(html,/<h1>Next<\/h1>/);
    assert.ok(html.includes(translate('Next',language)));assert.ok(html.includes(translate('Food & drink',language)));
    assert.ok(!html.includes('Monday'));assert.ok(!html.includes('PRIVATE-123'));
    assert.equal(validateTrip(JSON.parse(JSON.stringify(trip))).language,language);
  }
});
test('all registered interface strings and theme names have both Chinese translations',()=>{
  for(const language of ['zh-CN','zh-TW']){
    for(const key of translatedKeys())assert.notEqual(translate(key,language),key,`${language}: ${key}`);
    for(const theme of themes)assert.notEqual(translate(theme.name,language),theme.name);
  }
  assert.equal(newTrip().destination,'');
  assert.equal(newTrip().activities.length,0);
});

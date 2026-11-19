import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { demoTrip, themes, themeLayouts } from '../app/trip.js';
import { translate } from '../app/i18n.js';

test('phone navigation reveals the requested panel and makes theme selection visible',async t=>{
  const window=new Window({url:'https://example.com/travel-now/',settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false,enableIframePageLoading:false}});
  window.happyDOM.setViewport({width:390,height:844});
  for(const name of ['document','localStorage','location','Event','KeyboardEvent','NodeFilter','FormData','innerHeight','innerWidth'])globalThis[name]=window[name];
  globalThis.addEventListener=window.addEventListener.bind(window);globalThis.setTimeout=window.setTimeout.bind(window);globalThis.clearTimeout=window.clearTimeout.bind(window);
  document.head.innerHTML='<style>'+await readFile(new URL('../app/styles.css',import.meta.url),'utf8')+'</style>';
  document.body.innerHTML='<div id="app"></div><dialog id="dialog"></dialog><div id="toast"></div><input id="import-file" type="file">';
  localStorage.setItem('travel-now:trip:v1',JSON.stringify(demoTrip()));
  const $=selector=>document.querySelector(selector), style=selector=>window.getComputedStyle($(selector));
  const scrolls=[];window.HTMLElement.prototype.scrollIntoView=function(options){scrolls.push({id:this.id,options});};
  const tap=element=>{assert.ok(element);for(const type of ['pointerdown','pointerup'])element.dispatchEvent(new window.PointerEvent(type,{pointerType:'touch',pointerId:1,isPrimary:true,bubbles:true}));element.click();};
  try {
    await import('../app/app.js');tap($('[data-guidance-choice="decline"]'));
    await t.test('phone widths hide repeated chrome while retaining direct navigation and tools',()=>{
      for(const width of [320,390,430]){
        window.happyDOM.setViewport({width,height:844});
        for(const locale of ['en','zh-CN','zh-TW']){
          const select=$('.topbar [name="language"]');select.value=locale;select.dispatchEvent(new Event('change',{bubbles:true}));
          for(const selector of ['.sidebar','.breadcrumb','.hero-banner','.theme-toolbar','.top-actions>.language-picker','.top-actions>[data-action="import"]'])assert.equal(style(selector).display,'none',`${width}/${locale}: ${selector}`);
          assert.equal(style('.section-tabs').display,'grid');assert.equal(style('.section-tabs').position,'sticky');
          assert.notEqual(style('.mobile-tools-button').display,'none');assert.notEqual(style('.mobile-days').display,'none');
          assert.equal($('.section-tabs [data-tab="styles"]').textContent,translate('Themes & styles',locale));
        }
      }
      window.happyDOM.setViewport({width:1280,height:900});tap($('[data-action="home"]'));assert.notEqual(style('.sidebar').display,'none');assert.notEqual(style('.hero-banner').display,'none');assert.equal(style('.mobile-days').display,'none');
      window.happyDOM.setViewport({width:390,height:844});tap($('[data-action="home"]'));
    });
    await t.test('the theme tab and existing Choose a theme button scroll and focus the theme panel',()=>{
      for(const selector of ['.section-tabs [data-tab="styles"]','[data-action="styles"]']){
        tap($(selector));assert.ok($('.styles-section'));assert.equal($('#tab-styles').getAttribute('aria-selected'),'true');assert.equal(document.activeElement,$('#editor-panel'));assert.equal(scrolls.at(-1).id,'editor-panel');assert.equal(scrolls.at(-1).options.block,'start');assert.equal($('.mobile-days'),null);
      }
      assert.equal(document.querySelectorAll('.theme-card').length,27);
      assert.equal(new Set([...document.querySelectorAll('.theme-demo')].map(el=>[...el.classList].find(c=>c.startsWith('demo-')))).size,6);
    });
    await t.test('every layout saves, shows its selection, and appears in full preview',()=>{
      for(const layout of themeLayouts){
        tap($(`[data-layout="${layout.id}"]`));const theme=themes.find(item=>item.layout===layout.id);
        tap($(`[data-action="theme"][data-id="${theme.id}"]`));
        assert.equal(JSON.parse(localStorage.getItem('travel-now:trip:v1')).themeId,theme.id);
        assert.equal($('.theme-selection strong').textContent,translate(theme.name,'zh-TW'));
        assert.equal($(`[data-id="${theme.id}"]`).getAttribute('aria-pressed'),'true');
        tap($('.theme-selection [data-action="preview"]'));
        assert.ok($('#full-frame').srcdoc.includes(`class="slide cover-slide ${layout.id}"`));assert.ok($('#full-frame').srcdoc.includes(`--paper:${theme.background}`));
        tap($('#dialog [data-action="close"]'));
      }
    });
    await t.test('More exposes language, import, new trip, cover, and preview without losing state',()=>{
      tap($('.mobile-tools-button'));
      for(const action of ['import','new','cover','preview'])assert.ok($(`#dialog [data-action="${action}"]`));
      const selected=JSON.parse(localStorage.getItem('travel-now:trip:v1')).themeId;
      const language=$('#dialog [name="language"]');language.value='en';language.dispatchEvent(new Event('change',{bubbles:true}));assert.equal($('#dialog').open,true);assert.equal($('.mobile-tools-content [data-action="import"]').textContent,'Import trip');
      let opened=false;$('#import-file').click=()=>{opened=true;};tap($('#dialog [data-action="import"]'));assert.ok(opened);assert.equal($('#dialog').open,false);
      assert.equal(JSON.parse(localStorage.getItem('travel-now:trip:v1')).themeId,selected);
      tap($('#tab-itinerary'));const date=demoTrip().activities[3].date;tap($(`.mobile-days [data-date="${date}"]`));assert.equal($('.activity-card').dataset.id,'a4');assert.equal(scrolls.at(-1).id,'editor-panel');
      tap($('#tab-details'));assert.ok($('#details-form'));assert.ok($('.details-section [data-action="cover"]'));
    });
  }finally{await window.happyDOM.abort();window.close();}
});

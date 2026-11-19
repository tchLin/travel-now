import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { demoTrip, themes, themeLayouts } from '../app/trip.js';
import { activityArt } from '../app/activity-art.js';
import { renderDeck } from '../app/export.js';

test('compact slide layouts preserve image, text-only, empty, and continued days across every theme',()=>{
  const window=new Window({settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false}});
  try {
    for(const theme of themes){
      const trip=demoTrip();trip.themeId=theme.id;
      trip.activities=Array.from({length:4},(_,i)=>({...trip.activities[0],id:`activity-${i}`,title:`Visit ${i}`,notes:i===1?'':'User notes',image:i===1?'':i===0?activityArt[0].src:'assets/japan.jpg'}));
      trip.activities[0].openingHours={text:'Monday 10:00–18:00',sourceUrl:'https://example.com/hours',checkedAt:'2026-11-19',kind:'manual'};
      window.document.body.innerHTML=renderDeck(trip);
      const days=[...window.document.querySelectorAll('.slide-day')],first=days[0];
      const cards=[...first.querySelectorAll('article')];assert.equal(cards.length,3);
      assert.ok(cards[0].querySelector(':scope > img.day-image.illustrated'));
      assert.equal(cards[0].querySelector('.activity-copy img'),null,'image has its own layout column');
      assert.match(cards[0].querySelector('.activity-copy').textContent,/Visit 0.*User notes.*Monday 10:00–18:00/s);
      assert.equal(cards[1].querySelector('img'),null);assert.equal(cards[1].querySelector('p'),null,'blank notes create no empty paragraph');
      assert.ok(cards[1].classList.contains('text-only'));
      assert.ok(days[1].classList.contains('single-activity'));assert.equal(days[1].querySelector('h3').textContent,'Visit 3');
      assert.ok(days.at(-1).textContent.includes('room for spontaneity'));
      assert.equal(window.document.querySelectorAll('.day-image').length,3);
      for(const day of days){assert.ok(day.querySelector(':scope > .timezone-note'));assert.ok(day.querySelector(':scope > footer'));}
    }
  }finally{window.close();}
});


test('six layout families have distinct desktop compositions and stack on narrow phones',()=>{
  const signatures=new Set();
  for(const layout of themeLayouts){
    for(const width of [1100,320,390]){
      const window=new Window({settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false}});
      window.happyDOM.setViewport({width,height:900});
      try {
        const trip=demoTrip();trip.themeId=themes.find(theme=>theme.layout===layout.id).id;
        window.document.write(renderDeck(trip));
        const $=selector=>window.document.querySelector(selector),css=selector=>window.getComputedStyle($(selector));
        if(width===1100){
          signatures.add(JSON.stringify(['.cover','.day-layout','.day-activities','.day-activities article'].map(selector=>{const style=css(selector);return [style.display,style.gridTemplateColumns,style.gridTemplateAreas,style.flexDirection];})));
        }else{
          assert.equal(css('.day-layout').display,'block',layout.id);
          assert.equal(css('.day-activities').gridTemplateColumns.replace(/\s/g,''),'minmax(0,1fr)',layout.id);
          assert.equal(css('.day-activities article').display,'flex',layout.id);
          assert.equal(css('.day-activities article').flexDirection,'column',layout.id);
          assert.equal(css('.day-image').order,'0',layout.id);
          assert.equal(css('.activity-copy').order,'2',layout.id);
        }
        assert.equal($('.day-activities article h3').textContent,trip.activities[0].title);
      } finally {window.close();}
    }
  }
  assert.equal(signatures.size,6,'the families must differ structurally, not just by color or border shape');
});

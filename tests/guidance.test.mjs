import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { createArrivalGuidance, guidanceMessages, guidanceSessionKey } from '../app/guidance.js';

function fixture(options = {}) {
  const window = new Window({ url:'https://example.com/travel-now/' });
  const document = window.document;
  document.body.innerHTML = '<form id="setup-form"><input name="destination"></form><button data-tour="activities">Add activity</button>';
  const guidance = createArrivalGuidance({ document, storage:window.sessionStorage, ...options });
  return { window, document, guidance, close:async()=>{guidance.destroy();await window.happyDOM.abort();window.close();} };
}

test('arrival invitation asks once per session and decline survives rerender/reload', async () => {
  const f = fixture();
  try {
    assert.equal(f.guidance.offer(),true);
    assert.equal(f.document.querySelector('#arrival-guidance').open,true);
    assert.equal(f.guidance.offer(),false);
    f.document.querySelector('[data-guidance-choice="decline"]').click();
    assert.equal(f.guidance.state,'declined');
    assert.equal(f.guidance.offer(),false);
    assert.equal(f.document.querySelector('#arrival-guidance'),null);
    const reloaded=createArrivalGuidance({document:f.document,storage:f.window.sessionStorage});
    assert.equal(reloaded.offer(),false);
    reloaded.destroy();
  } finally { await f.close(); }
});

test('acceptance defers guidance until trip is ready, then starts exactly once', async () => {
  let ready=false, starts=0;
  const f=fixture({isReady:()=>ready,onStart:()=>starts++});
  try {
    f.guidance.offer();f.document.querySelector('[data-guidance-choice="accept"]').click();
    assert.equal(f.guidance.state,'accepted');assert.equal(starts,0);
    assert.equal(f.guidance.resumeIfReady(),false);
    ready=true;
    assert.equal(f.guidance.resumeIfReady(),true);assert.equal(starts,1);
    assert.equal(f.guidance.resumeIfReady(),false);assert.equal(starts,1);
    assert.equal(f.window.sessionStorage.getItem(guidanceSessionKey),'started');
  } finally { await f.close(); }
});

test('a returning user with a saved trip can accept an immediate tour', async () => {
  let starts=0;const f=fixture({isReady:()=>true,onStart:()=>starts++});
  try { f.guidance.offer();f.document.querySelector('[data-guidance-choice="accept"]').click();assert.equal(starts,1);assert.equal(f.document.querySelector('#arrival-guidance'),null); }
  finally { await f.close(); }
});

test('Escape declines and restores focus; keyboard focus wraps within the prompt', async () => {
  const f=fixture();
  try {
    const field=f.document.querySelector('input');field.focus();f.guidance.offer();
    const accept=f.document.querySelector('[data-guidance-choice="accept"]'),decline=f.document.querySelector('[data-guidance-choice="decline"]');
    assert.equal(f.document.activeElement,accept);
    accept.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(f.document.activeElement,decline);
    decline.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));assert.equal(f.document.activeElement,accept);
    accept.dispatchEvent(new f.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert.equal(f.guidance.state,'declined');assert.equal(f.document.activeElement,field);
  } finally { await f.close(); }
});

test('both Chinese prompts translate through safe text nodes', async () => {
  for(const index of [0,1]) {
    const f=fixture({translate:message=>guidanceMessages[message]?.[index] || message});
    try { f.guidance.offer();assert.equal(f.document.querySelector('#arrival-guidance-title').textContent,guidanceMessages['Would you like a quick tour?'][index]);assert.ok(!f.document.querySelector('#arrival-guidance').textContent.includes('Yes, guide me')); }
    finally { await f.close(); }
  }
});

test('unavailable session storage does not break guidance or repeat prompts', async () => {
  const storage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
  const f=fixture({storage});
  try { assert.equal(f.guidance.offer(),true);f.document.querySelector('[data-guidance-choice="decline"]').click();assert.equal(f.guidance.offer(),false); }
  finally { await f.close(); }
});

test('a new session asks again and an existing modal is not disturbed', async () => {
  const f=fixture();
  try {
    const other=f.document.createElement('dialog');f.document.body.append(other);other.showModal();
    assert.equal(f.guidance.offer(),false);assert.equal(other.open,true);other.close();other.remove();
    assert.equal(f.guidance.offer(),true);
    assert.equal(f.document.querySelectorAll('dialog[open]').length,1);
  } finally { await f.close(); }
});

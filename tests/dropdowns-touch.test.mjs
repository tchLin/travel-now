import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

// Reproduce a phone gesture, including loss of input focus before a delayed click.
// No synthetic mouse click is required to complete a tap.
test('destination and select menus accept taps once, but never scrolling gestures', async t => {
  const window=new Window();
  globalThis.document=window.document;globalThis.Event=window.Event;globalThis.innerHeight=800;
  const {enhanceDropdowns,closeDropdowns}=await import('../app/dropdowns.js');
  const pointer=(element,type,extra={})=>element.dispatchEvent(new window.PointerEvent(type,{bubbles:true,cancelable:true,pointerId:1,isPrimary:true,pointerType:'touch',clientX:20,clientY:20,...extra}));
  const setup=(editable=true)=>{
    closeDropdowns();
    document.body.innerHTML=editable?'<label>Destination<input name="destination" list="places"><datalist id="places"><option value="France">法國</option><option value="Japan">日本</option></datalist></label>':'<label>Style<select name="theme"><option value="tea">Tea house</option><option value="garden">Garden</option></select></label>';
    enhanceDropdowns();
    const field=document.querySelector(editable?'input':'select'),control=document.querySelector('[role="combobox"]');
    control.focus();control.click();
    return {field,control,item:document.querySelectorAll('[role="option"]')[1],menu:document.querySelector('[role="listbox"]')};
  };
  try {
    await t.test('touch release selects a destination despite blur; delayed click does not repeat events',()=>{
      const {field,control,item,menu}=setup();let changes=0,inputs=0;
      field.addEventListener('change',()=>changes++);field.addEventListener('input',()=>inputs++);
      const prevented=!pointer(item,'pointerdown');assert.equal(prevented,false,'touch can still scroll');
      control.dispatchEvent(new window.FocusEvent('focusout',{bubbles:true,relatedTarget:null}));
      assert.equal(menu.hidden,false);
      pointer(item,'pointerup');
      assert.equal(field.value,'日本');assert.equal(menu.hidden,true);assert.equal(document.activeElement,control);
      item.click();assert.equal(changes,1);assert.equal(inputs,1);assert.equal(control.getAttribute('aria-expanded'),'false');
    });
    await t.test('a swipe or canceled touch never chooses the place underneath',()=>{
      for(const cancel of [false,true]){
        const {field,item}=setup();pointer(item,'pointerdown');
        if(cancel)pointer(item,'pointercancel');else pointer(item,'pointermove',{clientY:70});
        pointer(item,'pointerup',{clientY:cancel?20:70});item.click();assert.equal(field.value,'');
      }
    });
    await t.test('touch selects canonical select values, and subsequent mouse clicks work',()=>{
      const {field,item}=setup(false);pointer(item,'pointerdown');pointer(item,'pointerup');item.click();assert.equal(field.value,'garden');
      const next=setup();pointer(next.item,'pointerdown',{pointerType:'mouse'});pointer(next.item,'pointerup',{pointerType:'mouse'});next.item.click();assert.equal(next.field.value,'日本');
    });
    await t.test('keyboard and custom destination entry remain available',()=>{
      const {field,control}=setup();control.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));control.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));assert.equal(field.value,'法國');
      field.value='高雄';field.dispatchEvent(new Event('input',{bubbles:true}));assert.equal(field.value,'高雄');assert.equal(control.getAttribute('aria-expanded'),'false');
    });
  }finally{closeDropdowns();await window.happyDOM.abort();window.close();}
});

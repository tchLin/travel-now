// Custom menus keep the open dropdown consistent across desktop browsers.
let active;
export function closeDropdowns() { active?.(); }
document.addEventListener('click', event => { if (!event.target.closest('.dropdown')) closeDropdowns(); });
export function enhanceDropdowns(root = document) {
  for (const field of root.querySelectorAll('select, input[list]')) {
    if (field.closest('.dropdown')) continue;
    const editable = field.tagName === 'INPUT';
    const list = editable ? root.querySelector(`#${field.getAttribute('list')}`) : field;
    if (!list) continue;
    const choices = [...list.querySelectorAll('option')].map(o => ({ value: o.value, label: o.textContent || o.value }));
    const label = field.closest('label')?.firstChild?.textContent.trim() || field.name;
    const wrapper = document.createElement('div'); wrapper.className = 'dropdown';
    field.before(wrapper); wrapper.append(field);
    const control = editable ? field : document.createElement('button');
    if (!editable) { field.hidden = true; control.type = 'button'; control.className = 'dropdown-trigger'; wrapper.append(control); }
    else { field.removeAttribute('list'); field.autocomplete = 'off'; list.remove(); }
    const menu = document.createElement('div'); menu.className = 'dropdown-menu'; menu.id = `menu-${crypto.randomUUID()}`; menu.role = 'listbox'; menu.hidden = true; menu.setAttribute('aria-label', label); wrapper.append(menu);
    control.setAttribute('role', 'combobox'); control.setAttribute('aria-label', label); control.setAttribute('aria-haspopup', 'listbox'); control.setAttribute('aria-controls', menu.id); control.setAttribute('aria-expanded', 'false');
    if (editable) control.setAttribute('aria-autocomplete', 'list');
    let shown = choices, cursor = -1, prefix = '', prefixTimer;
    const close = () => { menu.hidden = true; control.setAttribute('aria-expanded', 'false'); control.removeAttribute('aria-activedescendant'); wrapper.classList.remove('is-open'); cursor = -1; if (active === close) active = null; };
    const sync = () => { if (!editable) control.textContent = choices.find(o => o.value === field.value)?.label || choices[0]?.label || ''; };
    function draw() {
      menu.replaceChildren();
      shown.forEach((choice, i) => {
        const item = document.createElement('div'); item.className = 'dropdown-option'; item.id = `${menu.id}-${i}`; item.role = 'option'; item.textContent = choice.label;
        item.setAttribute('aria-selected', String(choice.value === field.value)); item.classList.toggle('highlighted', i === cursor);
        item.addEventListener('pointerdown', event => event.preventDefault());
        item.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); choose(i); });
        menu.append(item);
      });
      if (cursor >= 0 && shown[cursor]) { control.setAttribute('aria-activedescendant', `${menu.id}-${cursor}`); menu.children[cursor].scrollIntoView({ block: 'nearest' }); }
      else control.removeAttribute('aria-activedescendant');
    }
    function open(filter = false) {
      if (active !== close) active?.(); active = close;
      shown = filter ? choices.filter(o => o.label.toLocaleLowerCase().includes(field.value.toLocaleLowerCase())) : choices;
      if (!shown.length) { close(); return; }
      cursor = editable ? -1 : shown.findIndex(o => o.value === field.value);
      menu.hidden = false; control.setAttribute('aria-expanded', 'true'); wrapper.classList.add('is-open');
      const rect = control.getBoundingClientRect(), bottom = field.closest('dialog')?.getBoundingClientRect().bottom ?? innerHeight;
      wrapper.classList.toggle('opens-up', bottom - rect.bottom < 200 && rect.top > 260);
      draw();
    }
    function choose(index) {
      if (!shown[index]) return;
      field.value = editable ? shown[index].label : shown[index].value; sync(); close(); control.focus();
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      close();
    }
    control.addEventListener('click', event => { if (!editable) { event.preventDefault(); event.stopPropagation(); } menu.hidden ? open() : close(); });
    if (editable) control.addEventListener('input', () => open(true));
    control.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); event.stopPropagation(); close(); return; }
      if (event.key === 'Tab') { close(); return; }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) && (!editable || ['ArrowDown', 'ArrowUp'].includes(event.key) || !menu.hidden)) {
        event.preventDefault(); if (menu.hidden) open();
        cursor = event.key === 'Home' ? 0 : event.key === 'End' ? shown.length - 1 : Math.max(0, Math.min(shown.length - 1, cursor + (event.key === 'ArrowDown' ? 1 : -1))); draw();
      } else if (event.key === 'Enter' || (!editable && event.key === ' ')) {
        if (!editable || !menu.hidden) { event.preventDefault(); menu.hidden ? open() : cursor < 0 ? close() : choose(cursor); }
      } else if (!editable && event.key.length === 1) {
        event.preventDefault(); clearTimeout(prefixTimer); prefix += event.key.toLocaleLowerCase(); prefixTimer = setTimeout(() => { prefix = ''; }, 700);
        if (menu.hidden) open(); const found = shown.findIndex(o => o.label.toLocaleLowerCase().startsWith(prefix)); if (found >= 0) { cursor = found; draw(); }
      }
    });
    wrapper.addEventListener('focusout', event => { if (!wrapper.contains(event.relatedTarget)) close(); });
    field.addEventListener('change', sync); sync();
  }
}

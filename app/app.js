import { themes, destinations, categories, statuses, uid, demoTrip, newTrip, validateTrip, datesBetween, dateLabel as formatDate, themeFor, mapsUrl, escapeHTML as e, safeImage, safeUrl, slidesFor } from './trip.js';
import { renderDeck, portableTrip, zipFiles } from './export.js';
import { translate, localizeUI, languages } from './i18n.js';
import { enhanceDropdowns, closeDropdowns } from './dropdowns.js';
const $ = selector => document.querySelector(selector);
const key = 'travel-now:trip:v1';
let language = 'en', creating = false, tourStep = -1;
try { language = localStorage.getItem('travel-now:language') || 'en'; } catch {}
if (!languages.includes(language)) language = 'en';
const t = text => translate(text, language);
const dateLabel = (date, options) => formatDate(date, options, language);
let trip = newTrip(), tab = 'itinerary', selectedDay = trip.startDate, themeRegion = 'All destinations', saveState = 'Saved on this device', selectedSlide = 0, toastTimer, dragId, undoTrip;
try { const stored = localStorage.getItem(key); if (stored) trip = validateTrip(JSON.parse(stored)); if(!localStorage.getItem('travel-now:language'))language=trip.language || 'en'; } catch { saveState = 'Could not load saved trip. Import a backup to recover it.'; }
selectedDay = trip.startDate;
const paths = {
  sun: '<path d="M5 15a7 7 0 0 1 14 0M3 18h18M7 22h10M12 1v3M3 5l2 2M21 5l-2 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M8 15h2M14 15h2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 1-4c-2-1-1-3 1-3h2a3 3 0 0 0 3-3 9 9 0 0 0-9-8Z"/><path d="M7 9h.01M11 6h.01M16 8h.01M6 14h.01"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  group: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-2-4"/>',
  leaf: '<path d="M20 3C10 3 3 5 4 13c1 7 11 8 14 1 2-4 2-8 2-11ZM3 22 15 10"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  coffee: '<path d="M4 8h12v8a5 5 0 0 1-10 0V8M16 8h2a3 3 0 0 1 0 6h-2M8 2v2M12 2v2M3 22h16"/>',
  grip: '<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.pin}</svg>`;
const btn = (action, label, type = '', extra = '') => `<button type="button" data-action="${action}" class="${type}" ${extra}>${label}</button>`;
const options = (values, selected) => values.map(v => `<option value="${e(v)}" ${v === selected ? 'selected' : ''}>${e(v)}</option>`).join('');
function languageControl() {
  return `<label class="language-picker"><span class="sr-only">Language / 语言 / 語言</span><select name="language" aria-label="Language / 语言 / 語言">${[['en','English'],['zh-CN','简体中文'],['zh-TW','繁體中文']].map(([value,label])=>`<option value="${value}" ${value===language?'selected':''}>${label}</option>`).join('')}</select></label>`;
}
function defaultCurrency(destination) {
  const canonical=destinations.find(d=>[d,translate(d,'zh-CN'),translate(d,'zh-TW')].includes(destination)) || destination;
  return ({ Japan:'JPY', Korea:'KRW', US:'USD', China:'CNY', France:'EUR', Spain:'EUR', Germany:'EUR', Europe:'EUR', 'Southeast Asia':'THB' })[canonical] || 'USD';
}
function renderWelcome() {
  const draft = newTrip();
  document.title = `${t('Where to next?')} · Travel Now`;
  $('#app').innerHTML = `<header class="topbar"><a class="brand" href="#" data-action="home">${icon('sun')}<span>travel<span class="brand-light">now</span></span></a><div class="top-actions">${languageControl()}${btn('import',`${icon('upload')} Import trip`,'quiet')}</div></header><main class="welcome-page"><div class="welcome-intro"><span class="overline">GOOD PLACES. BETTER COMPANY.</span><h1>Plan a trip that feels like you.</h1><p>Choose a destination, add your favorite places, and turn it all into beautiful slides to share.</p></div><div class="feature-path"><article>${icon('palette')}<h2>1. Make it yours</h2><p>Pick dates, a destination, and one of 27 cozy themes.</p></article><article>${icon('calendar')}<h2>2. Plan the good stuff</h2><p>Add activities, photos, notes, and map links day by day.</p></article><article>${icon('play')}<h2>3. Share the adventure</h2><p>Preview your slides, export HTML, and keep an editable backup.</p></article></div><section class="setup-card"><div><span class="overline">THE START OF SOMETHING GOOD</span><h2>Where to next?</h2></div><form id="setup-form"><div class="form-grid">${field('Trip name','title',t(draft.title),'text','required maxlength="120"')}${field('Destination','destination','','text','required maxlength="120" list="setup-destinations" placeholder="Choose a destination or type your own"')}<datalist id="setup-destinations">${options(destinations,'')}</datalist>${field('Start date','startDate',draft.startDate,'date','required')}${field('End date','endDate',draft.endDate,'date','required')}${field('Who’s coming?','travelers','','text','maxlength="250" placeholder="Alex, Jamie, and you"')}${field('Timezone','timezone',draft.timezone,'text','required list="setup-timezones"')}<datalist id="setup-timezones">${options([...new Set([draft.timezone,'UTC','Asia/Shanghai','Asia/Taipei','Asia/Hong_Kong','Asia/Tokyo','Asia/Seoul','America/New_York','America/Los_Angeles','Europe/Paris','Europe/Madrid','Europe/Berlin','Asia/Bangkok','Europe/London'])],'')}</datalist><label class="span-two">Choose a theme (27 styles)<select name="themeId">${themes.map(theme=>`<option value="${theme.id}" ${theme.id===draft.themeId?'selected':''}>${e(theme.destination)} · ${e(theme.name)}</option>`).join('')}</select></label></div><p class="form-hint">Your browser timezone is a starting point. Set the timezone of your destination.</p><p class="form-error" role="alert"></p><div class="setup-actions"><button type="submit" class="primary">Create my trip</button>${trip.destination?btn('cancel-create','Back to my trip','quiet'):btn('demo','Explore the Kyoto example','quiet')}</div></form></section></main>`;
  localizeUI($('#app'),language); enhanceDropdowns($('#app'));
}
function changeLanguage(next) {
  if (!languages.includes(next)) return;
  // Preserve unsaved text when changing interface language.
  const form = $('#setup-form') || $('#details-form');
  const values = form ? Object.fromEntries(new FormData(form)) : null;
  if(form?.id==='setup-form' && values.title===t('Our next little adventure'))values.title=translate('Our next little adventure',next);
  language = next;
  try { localStorage.setItem('travel-now:language',language); } catch {}
  if (trip.destination) { trip.language=language; save(); }
  render();
  if (values) { const current=$(`#${form.id}`); if(current) for(const [name,value] of Object.entries(values)){const control=current.elements.namedItem(name);if(control){control.value=value;if(control.tagName==='SELECT')control.dispatchEvent(new Event('change',{bubbles:true}));}} }
}
const tourSteps = [
  ['details','details','Start with the essentials','Set your destination, dates, travelers, and timezone here. You can change these any time.'],
  ['activities','itinerary','Build each day','Add a place or activity. Include optional times, a photo, notes, and a map link. Drag cards or use Move up and Move down to reorder.'],
  ['themes','styles','Find your style','Browse all 27 themes or filter by destination. Click a card to apply it. Themes change the slides without changing your itinerary.'],
  ['preview','itinerary','See the whole story','Preview the cover and daily slides. Busy days split into multiple pages automatically.'],
  ['export','itinerary','Share it, or keep editing','Send the HTML slides to friends. Save JSON to import and edit later, or download both as a ZIP. Private notes stay out of shared slides.'],
];
function startTour() { tourStep=0;showTourStep(); }
function showTourStep() { tab=tourSteps[tourStep][1];render();const anchor=$(`[data-tour="${tourSteps[tourStep][0]}"]`);anchor?.scrollIntoView({block:'center',behavior:'instant'});paintTour();$('#tour-panel [data-action="tour-next"]')?.focus({preventScroll:true}); }
function stopTour(focus=true) { tourStep=-1;$('#tour-panel')?.remove();$('#tour-highlight')?.remove();if(focus)$('[data-action="guide"]')?.focus({preventScroll:true}); }
function paintTour() {
  $('#tour-panel')?.remove();$('#tour-highlight')?.remove();
  if(tourStep<0)return;
  const [target,,title,description]=tourSteps[tourStep], anchor=$(`[data-tour="${target}"]`);
  if(!anchor)return;
  const panel=document.createElement('section');panel.id='tour-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-labelledby','tour-title');
  panel.innerHTML=`<div class="tour-top"><span>${e(t('A quick tour'))} · ${e(t(`${tourStep+1} of ${tourSteps.length}`))}</span>${btn('tour-close',icon('close'),'icon-button',`aria-label="${e(t('Skip tour'))}"`)}</div><h2 id="tour-title">${e(t(title))}</h2><p>${e(t(description))}</p><div class="tour-footer">${btn('tour-back',t('Back'),'quiet',tourStep===0?'disabled':'')}${btn('tour-next',t(tourStep===tourSteps.length-1?'Got it':'Next'),'primary')}</div>`;
  document.body.append(panel);
  const highlight=document.createElement('div');highlight.id='tour-highlight';document.body.append(highlight);
  positionTour();
}
function positionTour() {
  if(tourStep<0)return;
  const panel=$('#tour-panel'),highlight=$('#tour-highlight'),anchor=$(`[data-tour="${tourSteps[tourStep][0]}"]`);
  if(!panel||!highlight||!anchor)return;
  const rect=anchor.getBoundingClientRect(), box=panel.getBoundingClientRect();
  panel.style.left=`${Math.max(12,Math.min(innerWidth-box.width-12,rect.left))}px`;
  const top=rect.bottom+12+box.height<=innerHeight-12?rect.bottom+12:rect.top-box.height-12;
  panel.style.top=`${Math.max(12,Math.min(innerHeight-box.height-12,top))}px`;
  highlight.style.cssText=`left:${rect.left-4}px;top:${rect.top-4}px;width:${rect.width+8}px;height:${rect.height+8}px`;
}
addEventListener('resize',positionTour);
addEventListener('scroll',positionTour,{passive:true});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&tourStep>=0){event.preventDefault();stopTour();}});
function notify(message) { $('#toast').textContent = t(message); $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4500); }
function save() {
  try { localStorage.setItem(key, JSON.stringify(trip)); saveState = 'Saved on this device'; }
  catch { saveState = 'Not saved — download a JSON backup'; notify('Device storage is full or unavailable. Download JSON to keep your changes.'); }
}
function commit(next, message) { try { const valid = validateTrip(next); undoTrip = trip.destination ? structuredClone(trip) : undefined; trip = valid; save(); render(); if (message) notify(message); return true; } catch (err) { notify(err.message); return false; } }
function render() {
  closeDropdowns();
  document.documentElement.lang = language;
  if (creating || !trip.destination) { renderWelcome(); return; }
  const days = datesBetween(trip.startDate, trip.endDate), theme = themeFor(trip.themeId);
  if (!days.includes(selectedDay)) selectedDay = days[0];
  const items = trip.activities.filter(a => a.date === selectedDay);
  document.title = `${trip.title} · Travel Now`;
  $('#app').innerHTML = `<header class="topbar"><a class="brand" href="#" data-action="home">${icon('sun')}<span>travel<span class="brand-light">now</span><i>®</i></span></a><span class="studio-label">YOUR LITTLE TRIP STUDIO</span><div class="top-actions">${languageControl()}${btn('guide','Start here','quiet guide-launch')}${btn('new',icon('plus'),'quiet','aria-label="New trip"')}<span class="save-state">${icon('check')}${e(saveState)}</span>${btn('import', `${icon('upload')}<span>Import trip</span>`, 'quiet')}${btn('share', `${icon('download')}<span>Export & share</span>`, 'primary','data-tour="export"')}</div></header>
  <div class="workspace"><aside class="sidebar"><div class="side-top"><span class="overline">THE GOOD KIND OF PLANNING</span><h2>Let’s go somewhere.</h2>${btn('new', `${icon('plus')} New trip`, 'new-trip')}</div><div class="current-trip"><span class="tiny-label">YOUR TRIP</span><strong>${e(trip.title)}</strong><span>${e(trip.destination)} · ${days.length} ${days.length === 1 ? 'day' : 'days'}</span></div><nav aria-label="Trip sections">${[['itinerary','calendar','Itinerary'],['styles','palette','Themes & styles'],['details','settings','Trip details']].map(([id, ic, label]) => `<button data-action="tab" data-tab="${id}" class="nav-item ${tab === id ? 'active' : ''}" ${tab === id ? 'aria-current="page"' : ''}>${icon(ic)}${label}${id === 'styles' ? '<span class="count">27</span>' : ''}</button>`).join('')}</nav><div class="days-nav"><span class="tiny-label">THE DAYS AHEAD</span>${days.map((date, i) => `<button data-action="day" data-date="${date}" class="day-item ${date === selectedDay && tab === 'itinerary' ? 'active' : ''}"><span class="day-number">${String(i+1).padStart(2,'0')}</span><span><strong>${dateLabel(date, { weekday: 'long' })}</strong><small>${dateLabel(date)}</small></span><span class="day-count">${trip.activities.filter(a => a.date === date).length}</span></button>`).join('')}</div><div class="sidebar-bottom">${icon('leaf')}<p>Less planning.<br><em>More being there.</em></p><span>Made for your favorite people.</span></div></aside>
  <main><div class="breadcrumb">Trip studio <span>/</span> ${e(trip.destination)} <span>/</span> ${tab === 'styles' ? 'Themes & styles' : tab === 'details' ? 'Trip details' : 'Your itinerary'}</div><div class="page-heading"><div><div class="overline">GOOD PLACES. BETTER COMPANY.</div><h1>${e(trip.title)}</h1><div class="trip-meta"><span>${icon('calendar')}${dateLabel(trip.startDate)} – ${dateLabel(trip.endDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span><span>${icon('group')}${e(trip.travelers || t('Your favorite people'))}</span></div></div>${btn('preview', `${icon('play')} Preview slides`, 'outline','data-tour="preview"')}</div>
  ${trip.id === 'kyoto-demo' ? `<div class="example-notice"><span>This is the Kyoto example, not a destination requirement.</span>${btn('new','Start your own trip','text-button')}</div>` : ''}
  <div class="hero-banner" ${safeImage(trip.coverImage) ? `style="background-image:linear-gradient(90deg,#1a271bbd,#1a271b15),url('${safeImage(trip.coverImage)}')"` : ''}><div><span class="hero-tag">A TRIP TO LOOK FORWARD TO</span><h2>A little lost.<br>A lot together.</h2><p>${e(trip.tagline || 'Make room for the moments in between.')}</p></div><span class="postmark">${icon('sun')}<span>${e(trip.destination)}<small>${new Date(trip.startDate).getUTCFullYear()}</small></span></span>${btn('cover', `${icon('palette')} Change cover`, 'cover-button')}</div>
  <div class="theme-toolbar"><span>${icon('palette')}<span>Theme</span><strong>${e(theme.name)}</strong></span>${btn('styles','Choose a theme','outline','data-tour="themes"')}</div>
  <div class="section-tabs" role="tablist" aria-label="Editor sections">${[['itinerary','Itinerary'],['styles','Themes & styles'],['details','Trip details']].map(([id,label]) => `<button role="tab" data-tour="${id}" aria-selected="${tab === id}" data-action="tab" data-tab="${id}" class="${tab === id ? 'selected' : ''}">${label}</button>`).join('')}<span>${trip.activities.length} little adventures planned</span></div>
  ${tab === 'itinerary' ? `<div class="editor-grid"><section class="itinerary"><div class="section-heading"><div><span class="overline">DAY ${String(days.indexOf(selectedDay)+1).padStart(2,'0')}</span><h2>${dateLabel(selectedDay, { weekday:'long', month:'long', day:'numeric' })}</h2><p>A little structure, a little spontaneity.</p></div>${btn('add', `${icon('plus')} Add activity`, 'primary','data-tour="activities"')}</div><div class="activity-list">${items.length ? items.map((a,i) => activityCard(a,i,items.length)).join('') : `<div class="empty-state">${icon('sun')}<h3>A day full of possibility.</h3><p>Add a place, a meal, or a moment to look forward to.</p>${btn('add', 'Plan your first activity', 'outline')}</div>`}</div>${btn('add', `${icon('plus')} Leave room for one more thing`, 'add-more')}<div class="itinerary-foot"><span>Drag to reorder · All times in ${e(trip.timezone)}</span>${undoTrip ? btn('undo','Undo last change','text-button') : ''}</div></section>${previewPanel(theme)}</div>` : tab === 'styles' ? stylesPanel() : detailsPanel()}
  <footer class="app-footer"><span>Every good trip starts with a little daydream.</span><span>TRAVEL NOW · PROTOTYPE</span></footer></main></div>`;
  localizeUI($('#app'), language);
  enhanceDropdowns($('#app'));
  if (tab === 'itinerary') updatePreview();
  paintTour();
}
function activityCard(a, i, count) {
  return `<article class="activity-card" draggable="true" data-id="${e(a.id)}"><div class="activity-time"><span>${e(a.startTime || 'Anytime')}</span><span class="timeline-dot"></span></div><div class="activity-body"><div class="activity-top"><span class="category category-${a.category === 'Food & drink' ? 'food' : a.category === 'Free time' ? 'free' : 'explore'}">${icon(a.category === 'Food & drink' ? 'coffee' : a.category === 'Free time' ? 'leaf' : 'pin')}${e(a.category)}</span><span class="status ${a.status.toLowerCase()}">${e(a.status)}</span></div><h3>${e(a.title)}</h3><a class="place-link" href="${e(safeUrl(a.mapUrl) || mapsUrl(a.place || a.title, trip.destination))}" target="_blank" rel="noopener noreferrer">${icon('pin')}${e(a.place || a.title)}</a><p>${e(a.notes)}</p><div class="card-bottom">${btn('edit','Edit activity','text-button',`data-id="${e(a.id)}"`)}<div class="card-tools">${btn('move-up','Move up','small-button',`data-id="${e(a.id)}" ${i === 0 ? 'disabled' : ''}`)}${btn('move-down','Move down','small-button',`data-id="${e(a.id)}" ${i === count-1 ? 'disabled' : ''}`)}${btn('duplicate','Duplicate','small-button',`data-id="${e(a.id)}"`)}<span title="Drag to reorder">${icon('grip')}</span></div></div></div>${safeImage(a.image) ? `<img class="activity-photo" src="${e(a.image)}" alt="${e(a.category)} inspiration" loading="lazy">` : ''}</article>`;
}
function previewPanel(theme) {
  return `<aside class="preview-panel"><div class="preview-heading"><span class="tiny-label">THE BIG PICTURE</span><span class="live-label">Live preview</span></div><div class="mini-preview"><iframe id="mini-frame" title="Live slide preview" sandbox=""></iframe></div><div class="preview-controls">${btn('prev-slide','Previous','small-button')}<span id="slide-count"></span>${btn('next-slide','Next','small-button')}</div><div class="theme-summary"><span class="theme-swatch" style="background:${theme.background};border-color:${theme.ink}"></span><div><strong>${e(theme.name)}</strong><small>Your trip, with a little atmosphere.</small></div>${btn('styles','Change','text-button')}</div><div class="preview-note">${icon('leaf')}<p>Your plans become a beautiful little story.<br>Ready to share whenever you are.</p></div>${btn('preview', `${icon('play')} Open full preview`, 'outline full-width')}</aside>`;
}
function updatePreview() {
  const slides = slidesFor(trip); selectedSlide = Math.max(0, Math.min(selectedSlide, slides.length - 1));
  let html = renderDeck(trip, { language });
  html = html.replace('</head>', `<style>body{background:transparent}.slide{display:none;width:100%;min-height:680px;margin:0;border-radius:0}#slide-${selectedSlide}{display:block}.deck-nav{display:none}</style><base href="${e(location.href)}"></head>`);
  $('#mini-frame').srcdoc = html; $('#slide-count').textContent = `${selectedSlide + 1} / ${slides.length}`;
}
function stylesPanel() {
  return `<section class="styles-section"><div class="section-heading"><div><span class="overline">SET THE MOOD</span><h2>Somewhere lovely. Something you.</h2><p>27 cozy styles. Pick a feeling, wherever you’re going.</p></div></div><div class="region-tabs">${['All destinations',...destinations].map(r => btn('region',e(r),r === themeRegion ? 'active' : '',`data-region="${e(r)}"`)).join('')}</div><div class="theme-grid">${themes.filter(t => themeRegion === 'All destinations' || t.destination === themeRegion).map(t => `<button data-action="theme" data-id="${t.id}" class="theme-card ${t.id === trip.themeId ? 'chosen' : ''}" aria-pressed="${t.id === trip.themeId}"><div class="theme-art ${t.layout}" style="--theme-bg:${t.background};--theme-ink:${t.ink};--theme-accent:${t.accent}"><div class="theme-art-copy"><span>A LITTLE ADVENTURE</span><strong>Somewhere<br>with you.</strong><small>A few days to remember</small></div><div class="theme-art-shape">${icon('sun')}</div></div><div class="theme-caption"><div><strong>${e(t.name)}</strong><small>${e(t.destination)} · ${t.layout === 'serif' ? 'Soft & timeless' : t.layout === 'journal' ? 'A handwritten feeling' : 'Calm & contemporary'}</small></div>${t.id === trip.themeId ? icon('check') : '<span class="choose-circle"></span>'}</div></button>`).join('')}</div><p class="muted">Styles only change the presentation. Your places, dates, and memories stay yours.</p></section>`;
}
function field(label, name, value, type = 'text', attrs = '') { return `<label>${label}<input name="${name}" type="${type}" value="${e(value)}" ${attrs}></label>`; }
function detailsPanel() {
  return `<section class="details-section"><div><span class="overline">THE START OF SOMETHING GOOD</span><h2>Make it your trip.</h2><p class="muted">A few details to bring everyone along.</p></div><form id="details-form"><div class="form-grid">${field('Trip name','title',trip.title,'text','required maxlength="120"')}${field('Destination','destination',trip.destination,'text','required maxlength="120" list="destinations"')}<datalist id="destinations">${options(destinations,'')}</datalist>${field('Start date','startDate',trip.startDate,'date','required')}${field('End date','endDate',trip.endDate,'date','required')}${field('Who’s coming?','travelers',trip.travelers,'text','maxlength="250" placeholder="Alex, Jamie, and you"')}${field('Timezone','timezone',trip.timezone,'text','required list="timezones"')}<datalist id="timezones">${options(['UTC','Asia/Taipei','Asia/Hong_Kong','Asia/Tokyo','Asia/Seoul','America/New_York','America/Los_Angeles','Asia/Shanghai','Europe/Paris','Europe/Madrid','Europe/Berlin','Asia/Bangkok','Europe/London'],'')}</datalist><label class="span-two">A little description<textarea name="tagline" maxlength="500" rows="3">${e(trip.tagline)}</textarea></label></div><p class="form-hint">Trips can be up to 90 days. Move activities before shortening dates that contain plans.</p><p class="form-error" role="alert"></p><button class="primary" type="submit">Save trip details</button></form></section>`;
}
function showDialog(html, className = '') { const d = $('#dialog'); d.className = className; d.innerHTML = html; localizeUI(d, language); enhanceDropdowns(d); d.showModal(); stopTour(false); }
const dialogHead = (label, title) => `<div class="dialog-heading"><div><span class="overline">${label}</span><h2>${title}</h2></div>${btn('close',icon('close'),'icon-button','aria-label="Close dialog"')}</div>`;
function activityDialog(id) {
  const a = trip.activities.find(a => a.id === id) || { id: uid(), title:'', place:'', date: selectedDay, startTime:'', endTime:'', category:'Explore', status:'Tentative', notes:'', privateNotes:'', image:'', mapUrl:'', cost:null, currency:defaultCurrency(trip.destination) };
  showDialog(`${dialogHead(id ? 'MAKE IT YOURS' : 'SOMETHING TO LOOK FORWARD TO', id ? 'Edit this little adventure' : 'Add a little adventure')}<form id="activity-form" data-id="${e(a.id)}"><div class="form-grid">${field('Activity name','title',a.title,'text','required maxlength="160" placeholder="A slow morning together"')}<label>Category<select name="category">${options(categories,a.category)}</select></label><label class="span-two">Place or destination<input name="place" id="place-input" value="${e(a.place)}" maxlength="250" list="places" placeholder="Enter a place, address, or keyword"><datalist id="places" data-user-content>${options([...new Set(trip.activities.map(a => a.place).filter(Boolean))],'')}</datalist><span class="form-hint">Creates a Google Maps search link. Check the location in Maps before traveling.</span></label><a id="map-preview" class="map-preview span-two" target="_blank" rel="noopener noreferrer" href="${e(mapsUrl(a.place || trip.destination,trip.destination))}">${icon('pin')} Check location in Google Maps</a>${field('Date','date',a.date,'date',`required min="${trip.startDate}" max="${trip.endDate}"`)}<label>Plan status<select name="status">${options(statuses,a.status)}</select></label>${field('Start time (optional)','startTime',a.startTime,'time')}${field('End time (optional)','endTime',a.endTime,'time')}<label class="span-two">Notes for everyone<textarea name="notes" rows="3" maxlength="3000" placeholder="Meeting spot, a must-try dish, or a little reminder…">${e(a.notes)}</textarea></label>${field('Estimated cost (optional)','cost',a.cost ?? '','number','min="0" max="100000000" step="0.01"')}<label>Currency<select name="currency">${options(['JPY','KRW','USD','CNY','EUR','THB','SGD','GBP'],a.currency)}</select></label><label class="span-two">Custom map link (optional)<input type="url" name="mapUrl" value="${e(a.mapUrl)}" placeholder="https://www.google.com/maps/…"></label><label class="span-two">Private notes<textarea name="privateNotes" rows="2" maxlength="3000" placeholder="Booking reference or anything just for you">${e(a.privateNotes)}</textarea><span class="form-hint">Excluded from shared HTML. Included in your editable JSON backup.</span></label><div class="span-two"><label>Activity photo</label>${photoPicker(a.image)}<input type="hidden" name="image" value="${e(a.image)}"></div></div><p class="form-error" role="alert"></p><div class="dialog-actions">${id ? btn('delete','Delete activity','danger',`data-id="${e(id)}"`) : '<span></span>'}<div>${btn('close','Cancel','quiet')}<button type="submit" class="primary">${id ? 'Save changes' : 'Add to itinerary'}</button></div></div></form>`);
}
function photoPicker(selected) {
  return `<div class="photo-picker">${[['','No photo'],['assets/japan.jpg','Kyoto streets'],['assets/food.jpg','Japanese lunch'],['assets/temple.jpg','Kyoto sunset']].map(([src,label]) => `<button type="button" data-action="pick-photo" data-src="${src}" aria-label="${label}" class="photo-option ${selected === src ? 'chosen' : ''}">${src ? `<img src="${src}" alt="${label}">` : '<span>No photo</span>'}</button>`).join('')}<label class="upload-photo">${icon('upload')}<span>Upload photo</span><input type="file" id="photo-upload" accept="image/jpeg,image/png,image/webp" hidden></label></div><p class="form-hint" id="photo-hint">Starter photos are inspiration, not verified place photos. Upload JPG, PNG, or WebP (up to 10 MB).</p>`;
}
function shareDialog() {
  showDialog(`${dialogHead('GOOD MEMORIES ARE BETTER SHARED','Ready to bring everyone along?')}<p class="muted">Your plans, wrapped up beautifully. No account needed to open the slides.</p><label class="check-label"><input type="checkbox" id="include-costs"> Include estimated costs in shared slides</label><div class="export-options">${btn('export-html',`${icon('play')}<span><strong>Shareable HTML slides</strong><small>One file, photos included. Opens offline in a browser.</small></span>`, 'export-option')}${btn('export-json',`${icon('settings')}<span><strong>Editable JSON backup</strong><small>Your complete trip, photos, style, and private notes.</small></span>`, 'export-option')}${btn('export-zip',`${icon('download')}<span><strong>Download the whole trip</strong><small>A ZIP with HTML slides, editable JSON, and instructions.</small></span>`, 'export-option')}</div><div class="privacy-note">${icon('leaf')}<p><strong>A little privacy check</strong><br>Private notes never appear in HTML slides. JSON and ZIP backups contain private notes, so keep them for yourself.</p></div><p class="form-hint">Send the HTML file to your group. Live links, comments, and collaborative editing are planned for a future version.</p><p class="form-error" role="alert"></p>`,'share-dialog');
}
function previewDialog() {
  showDialog(`${dialogHead('YOUR TRIP, AS A LITTLE STORY','A preview of good things ahead')}<iframe id="full-frame" title="Full trip slide presentation" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-modals"></iframe>`,'preview-dialog');
  $('#full-frame').srcdoc = renderDeck(trip, { language }).replace('</head>',`<base href="${e(location.href)}"></head>`);
}
function download(blob, filename) { const url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=filename; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),30000); }
async function exportTrip(format, button) {
  button.disabled = true; const name = trip.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'our-trip';
  try {
    const portable = await portableTrip({...trip,language}), html = renderDeck(portable,{includeCosts:$('#include-costs')?.checked, language}), json=JSON.stringify(portable,null,2);
    if (format !== 'html' && new Blob([json]).size > 25 * 1024 * 1024) throw new Error('This backup exceeds the 25 MB import limit. Remove a few photos before exporting JSON or ZIP.');
    if(format==='html') download(new Blob([html],{type:'text/html'}),`${name}.html`);
    if(format==='json') download(new Blob([json],{type:'application/json'}),`${name}.json`);
    if(format==='zip') download(zipFiles({[`${name}.html`]:html,[`${name}.json`]:json,'READ-ME.txt':`TRAVEL NOW\n\n${t('Open the HTML file in a browser. Photos work offline; map links need internet. Use Previous/Next or arrow keys to navigate. Print / PDF opens printing.')}\n\n${t('Import the JSON file in Travel Now to edit again. JSON contains private notes and costs; keep it private.')}\n`}),`${name}.zip`);
    notify('Your trip is ready to download.');
  } catch(err) { $('#dialog .form-error').textContent = t(err.message || 'Export failed. Please try again.'); }
  finally { button.disabled=false; }
}
function moveActivity(id, direction) { const next=structuredClone(trip), a=next.activities.find(a=>a.id===id), list=next.activities.filter(x=>x.date===a.date), other=list[list.indexOf(a)+direction]; if(!other)return; const i=next.activities.indexOf(a), j=next.activities.indexOf(other); [next.activities[i],next.activities[j]]=[next.activities[j],next.activities[i]]; commit(next,'Activity order updated.'); }
document.addEventListener('click', event => {
  const b=event.target.closest('[data-action]'); if(!b)return; const action=b.dataset.action; event.preventDefault();
  if(action==='close') $('#dialog').close();
  if(action==='tab'){tab=b.dataset.tab;render();}
  if(action==='home'){tab='itinerary';render();}
  if(action==='day'){selectedDay=b.dataset.date;tab='itinerary';render();}
  if(action==='styles'){tab='styles';render();}
  if(action==='region'){themeRegion=b.dataset.region;render();}
  if(action==='theme'){commit({...trip,themeId:b.dataset.id},'A fresh look. Same lovely plans.');}
  if(action==='add')activityDialog();
  if(action==='edit')activityDialog(b.dataset.id);
  if(action==='duplicate'){const next=structuredClone(trip),i=next.activities.findIndex(a=>a.id===b.dataset.id);next.activities.splice(i+1,0,{...structuredClone(next.activities[i]),id:uid()});commit(next,'Activity duplicated.');}
  if(action==='delete'){const next={...trip,activities:trip.activities.filter(a=>a.id!==b.dataset.id)};if(commit(next,'Activity removed. You can undo this change.'))$('#dialog').close();}
  if(action==='undo'&&undoTrip){const previous=undoTrip;undoTrip=structuredClone(trip);trip=previous;save();render();notify('Last change undone.');}
  if(action==='move-up'||action==='move-down')moveActivity(b.dataset.id,action==='move-up'?-1:1);
  if(action==='prev-slide'||action==='next-slide'){selectedSlide+=action==='prev-slide'?-1:1;updatePreview();}
  if(action==='share')shareDialog();
  if(action==='preview')previewDialog();
  if(action.startsWith('export-'))exportTrip(action.slice(7),b);
  if(action==='import')$('#import-file').click();
  if(action==='new')showDialog(`${dialogHead('A FRESH PAGE','Where to next?')}<p>Starting a new trip replaces the trip on this device. Download a JSON backup first if you’d like to keep it.</p><div class="dialog-actions">${btn('share','Back up current trip','outline')}${btn('confirm-new','Start a new trip','primary')}</div>`);
  if(action==='confirm-new'){creating=true;render();$('#dialog').close();}
  if(action==='cancel-create'){creating=false;render();}
  if(action==='demo'){const example=demoTrip();example.language=language;for(const field of ['title','tagline','travelers'])example[field]=t(example[field]);for(const a of example.activities)for(const field of ['title','place','notes'])a[field]=t(a[field]);creating=false;commit(example,'Your trip is ready. Here is a quick tour.');startTour();}
  if(action==='guide')startTour();
  if(action==='tour-next'){if(tourStep===tourSteps.length-1)stopTour();else{tourStep++;showTourStep();}}
  if(action==='tour-back'){tourStep=Math.max(0,tourStep-1);showTourStep();}
  if(action==='tour-close')stopTour();
  if(action==='cover')showDialog(`${dialogHead('SET THE SCENE','Choose your cover photo')}<form id="cover-form">${photoPicker(trip.coverImage)}<input type="hidden" name="image" value="${e(trip.coverImage)}"><div class="dialog-actions"><span></span><button type="submit" class="primary">Save cover</button></div></form>`);
  if(action==='pick-photo'){const form=b.closest('form');form.elements.image.value=b.dataset.src;form.querySelectorAll('.photo-option').forEach(el=>el.classList.toggle('chosen',el===b));$('#photo-hint').textContent=t(b.dataset.src?'Starter photo selected.':'No photo selected.');}
});
document.addEventListener('submit', event => {
  const form=event.target; if(!['activity-form','details-form','cover-form','setup-form'].includes(form.id))return;event.preventDefault();const data=Object.fromEntries(new FormData(form));
  try {
    if(form.id==='setup-form'){const next={...newTrip(),...data,language,tagline:t('Good places. Better company.')};validateTrip(next);creating=false;tab='itinerary';if(commit(next,'Your trip is ready. Here is a quick tour.'))startTour();}
    if(form.id==='activity-form') {
      const activity={...data,id:form.dataset.id,cost:data.cost===''?null:Number(data.cost)}, next=structuredClone(trip),index=next.activities.findIndex(a=>a.id===activity.id);
      if(index===-1)next.activities.push(activity);else next.activities[index]=activity;
      validateTrip(next);selectedDay=activity.date;commit(next,'A little adventure saved.');$('#dialog').close();
    }
    if(form.id==='details-form'){const next={...trip,...data};validateTrip(next);commit(next,'Trip details saved.');}
    if(form.id==='cover-form'){if(commit({...trip,coverImage:data.image},'Your new cover is ready.'))$('#dialog').close();}
  } catch(err){form.querySelector('.form-error').textContent=t(err.message);}
});
document.addEventListener('invalid',event=>{if(event.target.setCustomValidity)event.target.setCustomValidity(t('Please check this field.'));},true);
document.addEventListener('input',event=>{event.target.setCustomValidity?.('');if(event.target.id==='place-input')$('#map-preview').href=mapsUrl(event.target.value,trip.destination);});
document.addEventListener('change',async event=>{
  if(event.target.name==='language'){changeLanguage(event.target.value);return;}
  if(event.target.id==='photo-upload') {
    const file=event.target.files[0];if(!file)return;
    try{if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw new Error('Choose a JPG, PNG, or WebP under 10 MB.');const bitmap=await createImageBitmap(file),scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const src=canvas.toDataURL('image/jpeg',0.8);if(src.length>1500000)throw new Error('This photo is too large. Try a smaller image.');event.target.closest('form').elements.image.value=src;$('#photo-hint').textContent=t(`${file.name} is ready. Save to apply it.`);document.querySelectorAll('.photo-option').forEach(el=>el.classList.remove('chosen'));}catch(err){notify(err.message);}
  }
  if(event.target.id==='import-file') {
    const file=event.target.files[0];event.target.value='';if(!file)return;
    try{if(file.size>25*1024*1024)throw new Error('Choose a JSON file smaller than 25 MB.');const imported=validateTrip(JSON.parse(await file.text()));showDialog(`${dialogHead('WELCOME BACK TO YOUR ADVENTURE','Import this trip?')}<p><strong data-user-content>${e(imported.title)}</strong><br>${dateLabel(imported.startDate)} – ${dateLabel(imported.endDate)} · ${imported.activities.length} activities</p><p class="muted">This replaces the current trip on this device. You can undo the import from the itinerary.</p><div class="dialog-actions">${btn('close','Cancel','quiet')}<button class="primary" id="confirm-import">Import trip</button></div>`);$('#confirm-import').onclick=()=>{creating=false;language=imported.language;try{localStorage.setItem('travel-now:language',language);}catch{}if(commit(imported,'Your trip is ready to edit.')){selectedDay=trip.startDate;tab='itinerary';render();$('#dialog').close();}};}catch(err){notify(err instanceof SyntaxError?'This file is not valid JSON.':err.message);}
  }
});
document.addEventListener('dragstart',event=>{const card=event.target.closest('.activity-card');if(card){dragId=card.dataset.id;event.dataTransfer.setData('text/plain',dragId);event.dataTransfer.effectAllowed='move';card.classList.add('dragging');}});
document.addEventListener('dragover',event=>{if(event.target.closest('.activity-card'))event.preventDefault();});
document.addEventListener('drop',event=>{const card=event.target.closest('.activity-card');if(!card||!dragId||card.dataset.id===dragId)return;event.preventDefault();const next=structuredClone(trip),from=next.activities.findIndex(a=>a.id===dragId),to=next.activities.findIndex(a=>a.id===card.dataset.id);if(from<0||to<0)return;const [item]=next.activities.splice(from,1);next.activities.splice(to,0,item);commit(next,'Activity order updated.');dragId=null;});
document.addEventListener('dragend',()=>{dragId=null;document.querySelectorAll('.dragging').forEach(el=>el.classList.remove('dragging'));});
$('#dialog').addEventListener('click',event=>{if(event.target===$('#dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
render();

import { getActivityArt } from './activity-art.js';
import { renderHours } from './hours-view.js';
import { activityMapUrl, mapLinkInfo } from './places.js';
import { translate } from './i18n.js';
import { themeFor, escapeHTML as e, safeImage, safeUrl, mapsUrl, datesBetween, dateLabel, slidesFor, publicTrip } from './trip.js';
export const deckCSS = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#252b25;color:var(--ink);font:16px/1.55 Arial,sans-serif}button,a{touch-action:manipulation}button:focus-visible,a:focus-visible{outline:3px solid #e6b760;outline-offset:4px}
.slide{position:relative;background:var(--paper);width:min(1100px,100%);margin:20px auto;padding:36px 40px;overflow-wrap:anywhere;scroll-margin:16px;border-radius:12px}.slide h1,.slide h2,.slide h3{font-family:Georgia,serif;font-weight:400;line-height:1.15;margin:0}.slide h1{font-size:clamp(36px,5.5vw,64px)}.slide h2{font-size:34px;margin:8px 0 22px}.slide h3{font-size:26px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0}.cover{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:30px;align-items:center}.cover-image{width:100%;height:390px;object-fit:cover;border-radius:100px 100px 12px 12px}.cover .description{font-size:18px;margin:18px 0}.cover .meta{border-top:1px solid var(--accent);padding-top:16px;font-size:15px}.slide-footer{font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-top:22px;padding-top:12px;border-top:1px solid color-mix(in srgb,var(--accent) 35%,transparent);display:flex;justify-content:space-between;gap:16px}.day-activities{display:grid;gap:16px}.slide-day article{display:grid;grid-template-columns:64px minmax(0,1fr);gap:14px;padding-top:16px;border-top:1px solid var(--accent);align-items:start;break-inside:avoid}.slide-day article.has-image{grid-template-columns:64px minmax(0,1fr) minmax(220px,30%)}.activity-copy{min-width:0}.slide-day article p{margin:8px 0;white-space:pre-wrap}.slide-day time{font-size:14px;font-weight:600;color:var(--ink);line-height:1.7}.slide-day a{color:var(--ink);font-size:14px}.badge{font-size:12px;background:color-mix(in srgb,var(--accent) 12%,transparent);padding:3px 9px;border-radius:20px;display:inline-block;margin:9px 4px 4px 0}.day-image{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px}.day-image.illustrated,.cover-image.illustrated{object-fit:contain;background:#ffffff45}.single-activity article.has-image{grid-template-columns:64px minmax(0,1fr) minmax(260px,43%)}.cover-art{height:320px;border-radius:100px 100px 12px 12px;display:grid;place-items:center;background:linear-gradient(145deg,var(--accent),var(--paper));font-size:100px}.timezone-note{font-size:12px;margin:18px 0 0;opacity:.8}.deck-nav{position:sticky;bottom:16px;background:#fffef6;color:#384234;box-shadow:0 4px 30px #0002;width:max-content;max-width:95%;margin:0 auto 16px;padding:8px;border-radius:40px;display:flex;gap:8px;align-items:center}.hours-note{margin:10px 0;padding:10px 12px;border-left:2px solid var(--accent);font-size:14px;background:#ffffff35;border-radius:0 8px 8px 0}.hours-note .hours-text{white-space:pre-wrap}.hours-note .hours-meta{font-size:12px;opacity:.8}.deck-nav button{border:0;background:transparent;color:inherit;padding:10px 18px;cursor:pointer;font-size:14px}.deck-nav span{font-size:13px}.modern h1,.modern h2,.modern h3{font-family:Arial,sans-serif;font-weight:600;letter-spacing:-1px}.modern .cover-image{border-radius:12px}.journal{background-image:repeating-linear-gradient(0deg,transparent,transparent 31px,#00000005 32px)}.journal .cover-image{border:6px solid #ffffffaa;border-radius:8px}
@media(max-width:700px){.slide{padding:24px 20px;margin:0 auto 12px;border-radius:0}.cover{grid-template-columns:1fr;gap:18px}.cover-image,.cover-art{height:auto;aspect-ratio:4/3;max-height:360px}.slide h2{font-size:28px;margin-bottom:16px}.slide h3{font-size:24px}.slide-day article,.slide-day article.has-image,.single-activity article.has-image{grid-template-columns:minmax(0,1fr);gap:10px}.slide-day time{display:flex;gap:6px}.slide-day time br{display:none}.day-image{grid-row:2;aspect-ratio:4/3;max-height:340px}.slide-day article.has-image .activity-copy{grid-row:3}.deck-nav{gap:3px;bottom:8px}.deck-nav button{padding:10px 9px;min-height:44px}.slide-footer{font-size:11px;letter-spacing:.5px;margin-top:18px}.day-activities{gap:20px}}
@media print{@page{size:landscape;margin:8mm}body{background:white}.slide{break-after:page;page-break-after:always;margin:0;width:100%;padding:20px}.slide:last-of-type{break-after:auto}.slide-day article{break-inside:avoid}.cover-image{height:340px}.deck-nav{display:none}a{color:inherit}}
`;
export function slideMarkup(trip, slide, index, total, language = trip.language || 'en') {
  const t = text => e(translate(text, language));
  const dateText = (date, options) => dateLabel(date, options, language);
  const theme = themeFor(trip.themeId);
  const footer = `<footer class="slide-footer"><span>${t('Travel Now · Made for making memories')}</span><span>${index + 1} / ${total}</span></footer>`;
  if (slide.type === 'cover') return `<section id="slide-${index}" class="slide ${theme.layout}"><div class="cover"><div><p class="eyebrow">${t(`A little adventure in ${trip.destination}`)}</p><h1>${e(trip.title)}</h1><p class="description">${e(trip.tagline)}</p><p class="meta">${e(dateText(trip.startDate))} – ${e(dateText(trip.endDate, { month: 'short', day: 'numeric', year: 'numeric' }))}<br>${e(trip.travelers || translate('Good places. Better company.',language))}</p></div>${safeImage(trip.coverImage) ? `<img class="cover-image${getActivityArt(trip.coverImage) ? ' illustrated' : ''}" src="${e(trip.coverImage)}" alt="${t('Trip cover')}">` : '<div class="cover-art" aria-hidden="true">☀</div>'}</div>${footer}</section>`;
  const day = datesBetween(trip.startDate, trip.endDate).indexOf(slide.date) + 1;
  return `<section id="slide-${index}" class="slide slide-day ${slide.activities.length===1 ? 'single-activity' : ''} ${theme.layout}"><p class="eyebrow">${t(`Day ${day}`)}${slide.part > 1 ? ` · ${t('continued')}` : ''} / ${e(trip.destination)}</p><h2>${e(dateText(slide.date, { weekday: 'long', month: 'long', day: 'numeric' }))}</h2><div class="day-activities">${slide.activities.length ? slide.activities.map(a => `<article class="${safeImage(a.image) ? 'has-image' : 'text-only'}"><time>${e(a.startTime || translate('Anytime',language))}${a.endTime ? `<br>– ${e(a.endTime)}` : ''}</time><div class="activity-copy"><h3>${e(a.title)}</h3><span class="badge">${t(a.category)}</span><span class="badge">${t(a.status)}</span>${a.notes ? `<p>${e(a.notes)}</p>` : ''}${renderHours(a.openingHours,language)}${(a.place || a.mapUrl || a.googlePlaceId || a.coordinates) && activityMapUrl(a) ? `<a href="${e(activityMapUrl(a))}" target="_blank" rel="noopener noreferrer">${e(a.place || a.title)} · ${t(mapLinkInfo(a).label)}</a>` : ''}${a.cost != null ? `<p>${t('Estimated cost:')} ${e(a.cost)} ${e(a.currency)}</p>` : ''}</div>${safeImage(a.image) ? `<img class="day-image${getActivityArt(a.image) ? ' illustrated' : ''}" alt="${t('Activity inspiration')}" src="${e(a.image)}">` : ''}</article>`).join('') : `<p>${t('A little room for spontaneity. This day is yours to fill.')}</p>`}</div><p class="timezone-note">${t(`All times: ${trip.timezone}`)}</p>${footer}</section>`;
}
export function renderDeck(trip, options = {}) {
  const language = options.language || trip.language || 'en', t = text => e(translate(text,language));
  const shared = publicTrip(trip, options), theme = themeFor(shared.themeId), slides = slidesFor(shared);
  return `<!doctype html><html lang="${e(language)}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${e(shared.title)} · Travel Now</title><style>:root{--paper:${theme.background};--ink:${theme.ink};--accent:${theme.accent}}${deckCSS}</style></head><body>${slides.map((s, i) => slideMarkup(shared, s, i, slides.length, language)).join('')}<nav class="deck-nav" aria-label="${t('Slide controls')}"><button id="previous" aria-label="${t('Previous slide')}">${t('Previous')}</button><span id="counter" aria-live="polite">1 / ${slides.length}</span><button id="next" aria-label="${t('Next slide')}">${t('Next')}</button><button id="print">${t('Print / PDF')}</button></nav><script>
const slides=[...document.querySelectorAll('.slide')];let page=0;
function go(n){page=Math.max(0,Math.min(slides.length-1,n));slides[page].scrollIntoView({behavior:'smooth'});update()}
function update(){document.querySelector('#counter').textContent=(page+1)+' / '+slides.length;document.querySelector('#previous').disabled=page===0;document.querySelector('#next').disabled=page===slides.length-1}
document.querySelector('#previous').onclick=()=>go(page-1);document.querySelector('#next').onclick=()=>go(page+1);document.querySelector('#print').onclick=()=>window.print();document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(page+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(page-1)}});
let ticking=false;addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{page=slides.reduce((best,s,i)=>Math.abs(s.getBoundingClientRect().top)<Math.abs(slides[best].getBoundingClientRect().top)?i:best,0);update();ticking=false})}});update();
</script></body></html>`;
}
export async function portableTrip(trip) {
  const copy = structuredClone(trip), cache = new Map();
  async function embed(src) {
    if (!src || src.startsWith('data:')) return src;
    if (!cache.has(src)) cache.set(src, (async () => {
      const artwork=getActivityArt(src);
      const response = await fetch(artwork?.rasterSrc || src);
      if (!response.ok) throw new Error('A photo could not be loaded. Please retry the export.');
      const blob = await response.blob();
      return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
    })());
    return cache.get(src);
  }
  copy.coverImage = await embed(copy.coverImage);
  for (const activity of copy.activities) activity.image = await embed(activity.image);
  return copy;
}
// ZIP "store" format keeps the export dependency-free and works offline.
export function zipFiles(files) {
  const enc = new TextEncoder(), chunks = [], central = []; let offset = 0;
  const table = Array.from({ length: 256 }, (_, n) => { for (let j = 0; j < 8; j++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
  for (const [name, text] of Object.entries(files)) {
    const filename = enc.encode(name), data = enc.encode(text); let crc = 0xffffffff;
    for (const byte of data) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = new Uint8Array(30 + filename.length), h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, filename.length, true); header.set(filename, 30);
    const entry = new Uint8Array(46 + filename.length), c = new DataView(entry.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, filename.length, true); c.setUint32(42, offset, true); entry.set(filename, 46);
    chunks.push(header, data); central.push(entry); offset += header.length + data.length;
  }
  const end = new Uint8Array(22), v = new DataView(end.buffer), size = central.reduce((n,c) => n+c.length, 0);
  v.setUint32(0, 0x06054b50, true); v.setUint16(8, central.length, true); v.setUint16(10, central.length, true); v.setUint32(12, size, true); v.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end], { type: 'application/zip' });
}

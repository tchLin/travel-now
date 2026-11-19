import { getActivityArt } from './activity-art.js';
import { renderHours } from './hours-view.js';
import { activityMapUrl, mapLinkInfo } from './places.js';
import { translate } from './i18n.js';
import { themeFor, escapeHTML as e, safeImage, safeUrl, mapsUrl, datesBetween, dateLabel, slidesFor, publicTrip } from './trip.js';
export const deckCSS = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#252b25;color:var(--ink);font:16px/1.6 Arial,sans-serif}button,a{touch-action:manipulation}button:focus-visible,a:focus-visible{outline:3px solid #e6b760;outline-offset:4px}
.slide{position:relative;background:var(--paper);min-height:660px;width:min(1100px,100%);margin:28px auto;padding:64px;overflow-wrap:anywhere;scroll-margin:20px;border-radius:4px}.slide h1,.slide h2,.slide h3{font-family:Georgia,serif;font-weight:400;line-height:1.1;margin:0}.slide h1{font-size:clamp(38px,6vw,76px);max-width:600px}.slide h2{font-size:44px;margin:16px 0 30px}.slide h3{font-size:24px}.eyebrow{font-size:13px;text-transform:uppercase;letter-spacing:3px;font-weight:600}.cover{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center}.cover-image{width:100%;height:490px;object-fit:cover;border-radius:180px 180px 5px 5px}.cover .description{font-size:18px;max-width:410px;margin:24px 0}.cover .meta{border-top:1px solid var(--accent);padding-top:20px}.slide-footer{font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-top:32px;display:flex;justify-content:space-between;gap:16px}.slide-day article{display:grid;grid-template-columns:85px 1fr;gap:20px;padding:22px 0;border-top:1px solid var(--accent)}.slide-day article p{margin:8px 0;white-space:pre-wrap}.slide-day time{font-size:14px;font-weight:600}.slide-day a{color:var(--ink);font-size:14px}.badge{font-size:12px;border:1px solid var(--accent);padding:2px 9px;border-radius:20px;display:inline-block;margin:8px 4px 0 0}.day-image{width:120px;height:90px;object-fit:cover;float:right;margin:0 0 10px 20px;border-radius:4px}.cover-art{height:420px;border:1px solid var(--accent);border-radius:200px 200px 0 0;display:grid;place-items:center;background:linear-gradient(145deg,var(--accent),var(--paper));font-size:100px}.deck-nav{position:sticky;bottom:16px;background:#fffef6;color:#384234;box-shadow:0 4px 30px #0002;width:max-content;max-width:95%;margin:0 auto 16px;padding:8px;border-radius:40px;display:flex;gap:8px;align-items:center}.hours-note{margin:12px 0;padding:12px 14px;border:1px solid var(--accent);border-radius:7px;font-size:14px}.hours-note .hours-text{white-space:pre-wrap}.hours-note .hours-meta{font-size:12px;opacity:.8}.deck-nav button{border:0;background:transparent;color:inherit;padding:10px 18px;cursor:pointer;font-size:14px}.deck-nav span{font-size:13px}.modern h1,.modern h2,.modern h3{font-family:Arial,sans-serif;font-weight:600;letter-spacing:-1.5px}.modern .cover-image{border-radius:8px}.journal{background-image:repeating-linear-gradient(0deg,transparent,transparent 31px,#00000005 32px)}.journal .cover-image{border:10px solid #ffffffaa;border-radius:2px;transform:rotate(2deg)}
@media(max-width:650px){.slide{padding:30px 24px;margin:0 auto 16px;min-height:0}.cover{grid-template-columns:1fr;gap:24px}.cover-image,.cover-art{height:300px}.slide h2{font-size:32px}.slide-day article{grid-template-columns:60px 1fr;gap:12px}.day-image{width:80px;height:70px}.deck-nav button{padding:8px 10px}.slide-footer{font-size:11px}}
@media print{@page{size:landscape;margin:8mm}body{background:white}.slide{break-after:page;page-break-after:always;margin:0;min-height:0;width:100%;padding:30px}.slide:last-of-type{break-after:auto}.cover-image{height:420px}.deck-nav{display:none}a{color:inherit}}
`;
export function slideMarkup(trip, slide, index, total, language = trip.language || 'en') {
  const t = text => e(translate(text, language));
  const dateText = (date, options) => dateLabel(date, options, language);
  const theme = themeFor(trip.themeId);
  const footer = `<footer class="slide-footer"><span>${t('Travel Now · Made for making memories')}</span><span>${index + 1} / ${total}</span></footer>`;
  if (slide.type === 'cover') return `<section id="slide-${index}" class="slide ${theme.layout}"><div class="cover"><div><p class="eyebrow">${t(`A little adventure in ${trip.destination}`)}</p><h1>${e(trip.title)}</h1><p class="description">${e(trip.tagline)}</p><p class="meta">${e(dateText(trip.startDate))} – ${e(dateText(trip.endDate, { month: 'short', day: 'numeric', year: 'numeric' }))}<br>${e(trip.travelers || translate('Good places. Better company.',language))}</p></div>${safeImage(trip.coverImage) ? `<img class="cover-image" src="${e(trip.coverImage)}" alt="${t('Trip cover')}">` : '<div class="cover-art" aria-hidden="true">☀</div>'}</div>${footer}</section>`;
  const day = datesBetween(trip.startDate, trip.endDate).indexOf(slide.date) + 1;
  return `<section id="slide-${index}" class="slide slide-day ${theme.layout}"><p class="eyebrow">${t(`Day ${day}`)}${slide.part > 1 ? ` · ${t('continued')}` : ''} / ${e(trip.destination)}</p><h2>${e(dateText(slide.date, { weekday: 'long', month: 'long', day: 'numeric' }))}</h2>${slide.activities.length ? slide.activities.map(a => `<article><time>${e(a.startTime || translate('Anytime',language))}${a.endTime ? `<br>– ${e(a.endTime)}` : ''}</time><div>${safeImage(a.image) ? `<img class="day-image" alt="${t('Activity inspiration')}" src="${e(a.image)}">` : ''}<h3>${e(a.title)}</h3><span class="badge">${t(a.category)}</span><span class="badge">${t(a.status)}</span><p>${e(a.notes)}</p>${renderHours(a.openingHours,language)}${(a.place || a.mapUrl || a.googlePlaceId || a.coordinates) && activityMapUrl(a) ? `<a href="${e(activityMapUrl(a))}" target="_blank" rel="noopener noreferrer">${e(a.place || a.title)} · ${t(mapLinkInfo(a).label)}</a>` : ''}${a.cost != null ? `<p>${t('Estimated cost:')} ${e(a.cost)} ${e(a.currency)}</p>` : ''}</div></article>`).join('') : `<p>${t('A little room for spontaneity. This day is yours to fill.')}</p>`}<p style="font-size:12px">${t(`All times: ${trip.timezone}`)}</p>${footer}</section>`;
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

import { getActivityArt } from './activity-art.js';
import { normalizeHours } from './opening-hours.js';
import { safeMapUrl, validPlaceId, validCoordinates } from './places.js';
export const destinations = ['Japan', 'Korea', 'US', 'China', 'France', 'Spain', 'Germany', 'Southeast Asia', 'Europe'];
const names = [
  ['Sakura & Washi', 'Kyoto Tea House', 'Rainy Tokyo Café'],
  ['Hanok Morning', 'Seoul Café', 'Jeju Retreat'],
  ['National Park Cabin', 'Coastal Cottage', 'Autumn Road Trip'],
  ['Bamboo & Ink', 'Courtyard Tea', 'Lantern Evening'],
  ['Parisian Notebook', 'Provence Cottage', 'Alpine Chalet'],
  ['Terracotta Courtyard', 'Mediterranean Siesta', 'Barcelona Sketchbook'],
  ['Black Forest Cabin', 'Bavarian Guesthouse', 'Riverside Bookshop'],
  ['Tropical Hideaway', 'Old Town Café', 'Monsoon Journal'],
  ['Rail Travel Journal', 'Village Bakery', 'Lakeside Retreat'],
];
const palettes = [
  ['#f7e8e5','#7f414f','#e3b4b4'], ['#f2eee2','#47563f','#bdc5a7'], ['#e5eaef','#344d65','#a5b8cc'],
  ['#f0e7dc','#6b4e38','#d2bca2'], ['#f4e8de','#824c38','#e1b39c'], ['#e8eddc','#456356','#a8c3a9'],
  ['#e5e9df','#3d5541','#b6c3a0'], ['#e6eff0','#39616a','#b0d0d3'], ['#f5e4d2','#8a4d29','#d9a977'],
  ['#e9ede4','#3f554c','#aabcaa'], ['#efe9dc','#77603b','#cfbf91'], ['#f3dfd5','#8c3f34','#dca388'],
  ['#f1e8df','#665044','#c6b39b'], ['#eee8f2','#695277','#c5b1d4'], ['#e6eced','#415c61','#a6bec3'],
  ['#f5e3d8','#954c36','#dfa58c'], ['#e4eef0','#33606d','#abcbd1'], ['#f3edda','#826329','#dcc177'],
  ['#e2e9df','#395943','#a6b89d'], ['#f1e8dd','#72543c','#c8b499'], ['#ece5df','#654e42','#c8b7a7'],
  ['#e6edde','#41604a','#abc49b'], ['#f2e6d7','#80603b','#d2b78d'], ['#e2eae7','#3d5e59','#a0bbb1'],
  ['#eae8df','#565d48','#bbc2a4'], ['#f3e7d9','#80573e','#d8b592'], ['#e2ebed','#3d606b','#a2c0ca'],
];
export const themes = names.flatMap((group, i) => group.map((name, j) => ({ id: `theme-${i * 3 + j}`, name, destination: destinations[i], background: palettes[i * 3 + j][0], ink: palettes[i * 3 + j][1], accent: palettes[i * 3 + j][2], layout: ['journal', 'serif', 'modern'][j] })));
export const categories = ['Explore', 'Food & drink', 'Stay', 'Transport', 'Free time'];
export const statuses = ['Confirmed', 'Tentative', 'Optional'];
export const uid = () => globalThis.crypto.randomUUID();
export const themeFor = id => themes.find(t => t.id === id) || themes[1];
export function datesBetween(start, end) {
  const a = Date.parse(start + 'T12:00:00Z'), b = Date.parse(end + 'T12:00:00Z');
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a || (b - a) / 86400000 > 89) return [];
  return Array.from({ length: Math.round((b - a) / 86400000) + 1 }, (_, i) => new Date(a + i * 86400000).toISOString().slice(0, 10));
}
export function dateLabel(date, options = { month: 'short', day: 'numeric' }, language = 'en') {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, { ...options, timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
}
export { mapsUrl } from './places.js';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function safeUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function safeImage(value) {
  return typeof value === 'string' && (getActivityArt(value)?.src === value || getActivityArt(value)?.rasterSrc === value || /^assets\/(japan|food|temple)\.jpg$/.test(value) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) ? value : '';
}
const dateValid = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d)) && new Date(d).toISOString().slice(0,10) === d;
function string(value, name, max = 500, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error(`Check ${name}: ${required ? 'a non-empty' : 'a'} text value of up to ${max} characters is required.`);
  return value;
}
export function validateTrip(input) {
  if (!input || input.schemaVersion !== 1) throw new Error('This file needs Travel Now schemaVersion 1.');
  if (input.language && !['en','zh-CN','zh-TW'].includes(input.language)) throw new Error('Choose a supported language.');
  if (!dateValid(input.startDate) || !dateValid(input.endDate) || !datesBetween(input.startDate, input.endDate).length) throw new Error('Choose a valid trip date range of 1–90 days.');
  if (!themes.some(t => t.id === input.themeId)) throw new Error('Choose one of the 27 supported styles.');
  if (!Array.isArray(input.activities) || input.activities.length > 500) throw new Error('A trip can contain up to 500 activities.');
  const image = (v) => { if (v && (!safeImage(v) || v.length > 1500000)) throw new Error('Use a supported photo under 1.5 MB.'); return v || ''; };
  const ids = new Set();
  const trip = {
    schemaVersion: 1, language: input.language || 'en', id: string(input.id, 'trip ID', 100, true), title: string(input.title, 'trip title', 120, true),
    destination: string(input.destination, 'destination', 120, true), startDate: input.startDate, endDate: input.endDate,
    travelers: string(input.travelers ?? '', 'travelers', 250), tagline: string(input.tagline ?? '', 'trip description', 500),
    timezone: string(input.timezone ?? 'Asia/Tokyo', 'timezone', 80, true), themeId: input.themeId,
    coverImage: image(input.coverImage), activities: input.activities.map(a => {
      if (!a || !dateValid(a.date) || a.date < input.startDate || a.date > input.endDate) throw new Error('Every activity must fall within the trip dates.');
      if (ids.has(a.id)) throw new Error('Each activity needs a unique ID.');
      ids.add(a.id);
      if (!categories.includes(a.category) || !statuses.includes(a.status)) throw new Error('An activity has an unsupported category or status.');
      for (const time of [a.startTime ?? '', a.endTime ?? '']) if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Activity times must use HH:MM.');
      if (a.endTime && (!a.startTime || a.endTime < a.startTime)) throw new Error('An activity end time must follow its start time on the same day.');
      if (a.mapUrl && !safeMapUrl(a.mapUrl)) throw new Error('Map links must start with https:// or http://.');
      if(a.googlePlaceId && (!validPlaceId(a.googlePlaceId) || a.googlePlaceId.length > 512)) throw new Error('Enter a valid Google Place ID.');
      if(a.coordinates && !validCoordinates(a.coordinates)) throw new Error('Enter valid latitude and longitude.');
      if(a.placeAddress != null) string(a.placeAddress,'place address',250);
      const openingHours=normalizeHours(a.openingHours);
      const cost = a.cost === '' || a.cost == null ? null : a.cost;
      if (cost !== null && (typeof cost !== 'number' || !Number.isFinite(cost) || cost < 0 || cost > 100000000)) throw new Error('Costs must be positive numbers.');
      return { id: string(a.id, 'activity ID', 100, true), title: string(a.title, 'activity title', 160, true), place: string(a.place ?? '', 'place', 250), date: a.date, startTime: a.startTime || '', endTime: a.endTime || '', category: a.category, status: a.status, notes: string(a.notes ?? '', 'activity notes', 3000), privateNotes: string(a.privateNotes ?? '', 'private notes', 3000), mapUrl: a.mapUrl || '', ...(openingHours ? {openingHours} : {}), ...(a.googlePlaceId ? {googlePlaceId:validPlaceId(a.googlePlaceId)} : {}), ...(a.coordinates ? {coordinates:validCoordinates(a.coordinates)} : {}), ...(a.placeAddress ? {placeAddress:a.placeAddress} : {}), image: image(a.image), cost, currency: string(a.currency ?? 'JPY', 'currency', 3, true) };
    }),
  };
  try { new Intl.DateTimeFormat('en', { timeZone: trip.timezone }); } catch { throw new Error('Enter a valid timezone, such as Asia/Tokyo or Europe/Paris.'); }
  return trip;
}
export function publicTrip(trip, { includeCosts = false } = {}) {
  const copy = structuredClone(trip);
  copy.activities = copy.activities.map(({ privateNotes, ...a }) => ({ ...a, ...(includeCosts ? {} : { cost: null }) }));
  return copy;
}
export function slidesFor(trip) {
  const slides = [{ type: 'cover' }];
  for (const date of datesBetween(trip.startDate, trip.endDate)) {
    const items = trip.activities.filter(a => a.date === date);
    if (!items.length) slides.push({ type: 'day', date, activities: [], part: 1 });
    else for (let i = 0; i < items.length; i += 3) slides.push({ type: 'day', date, activities: items.slice(i, i + 3), part: i / 3 + 1 });
  }
  return slides;
}
export function newTrip() {
  const now = new Date(), date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  return { schemaVersion: 1, language: 'en', id: uid(), title: 'Our next little adventure', destination: '', startDate: date, endDate: date, travelers: '', tagline: 'Good places. Better company.', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', themeId: 'theme-24', coverImage: '', activities: [] };
}
export function demoTrip() {
  const base = { startTime: '', endTime: '', status: 'Confirmed', privateNotes: '', cost: null, currency: 'JPY', image: '', mapUrl: '' };
  return {
    schemaVersion: 1, language: 'en', id: 'kyoto-demo', title: 'A little Kyoto escape', destination: 'Japan', startDate: '2027-03-22', endDate: '2027-03-26', travelers: 'Alex, Jamie, Sam & you', tagline: 'Slow mornings, hidden tea houses, and a little getting lost together.', timezone: 'Asia/Tokyo', themeId: 'theme-1', coverImage: 'assets/japan.jpg',
    activities: [
      { ...base, id: 'a1', title: 'A quiet morning in Higashiyama', place: 'Higashiyama, Kyoto', date: '2027-03-22', startTime: '09:00', endTime: '11:00', category: 'Explore', notes: 'Wander the little lanes of Ninenzaka. Take it slow and leave room for a coffee stop.', image: 'assets/japan.jpg' },
      { ...base, id: 'a2', title: 'A taste of Nishiki Market', place: 'Nishiki Market, Kyoto', date: '2027-03-22', startTime: '12:30', category: 'Food & drink', notes: 'Meet at the west entrance. Pick a few things to share and follow whatever smells good.', cost: 2500, image: 'assets/food.jpg' },
      { ...base, id: 'a3', title: 'Tea, with nowhere to rush', place: 'Gion, Kyoto', date: '2027-03-22', startTime: '15:00', category: 'Free time', status: 'Optional', notes: 'Find a cozy tea house, write a postcard, and watch the afternoon go by.' },
      { ...base, id: 'a4', title: 'Under the bamboo canopy', place: 'Arashiyama Bamboo Forest, Kyoto', date: '2027-03-23', startTime: '08:00', category: 'Explore', notes: 'An early start for a peaceful walk. Bring a light layer.' },
      { ...base, id: 'a5', title: 'Follow the vermilion gates', place: 'Fushimi Inari Taisha, Kyoto', date: '2027-03-24', startTime: '09:00', category: 'Explore', notes: 'Walk as far up the hillside as we feel like. Comfortable shoes recommended.' },
      { ...base, id: 'a6', title: 'A day with the deer', place: 'Nara Park, Nara', date: '2027-03-25', startTime: '10:00', category: 'Explore', status: 'Tentative', notes: 'A relaxed day trip to Nara. Decide on the train together the evening before.' },
      { ...base, id: 'a7', title: 'One last coffee', place: 'Kyoto Station, Kyoto', date: '2027-03-26', startTime: '10:00', category: 'Food & drink', notes: 'Swap favorite moments and plan the next little escape.' },
    ],
  };
}

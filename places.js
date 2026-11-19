// Google Maps URL contract:
// https://developers.google.com/maps/documentation/urls/get-started
// A text query is a search, not a verified match. Never silently add a trip's
// destination: an activity can be in a different city/country than the trip.
const MAPS_SEARCH_ENDPOINT = 'https://www.google.com/maps/search/';
const MAX_MAPS_URL_LENGTH = 2048;

export function safeMapUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    return url.href;
  } catch { return ''; }
}

export function validPlaceId(value) {
  // Place IDs are opaque and do not have a fixed prefix or length. This accepts
  // URL-safe identifiers without inferring or manufacturing one from a name.
  return typeof value === 'string' && /^[A-Za-z0-9_=-]+$/.test(value.trim()) ? value.trim() : '';
}

export function validCoordinates(value) {
  if (!value || typeof value !== 'object') return null;
  const { latitude, longitude } = value;
  return typeof latitude === 'number' && Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
    typeof longitude === 'number' && Number.isFinite(longitude) && Math.abs(longitude) <= 180
    ? { latitude, longitude } : null;
}

export function mapsUrl(place, options = {}) {
  // Old callers passed destination as the second argument. Ignore that string
  // rather than biasing the query. Only explicitly named options add context.
  const settings = options && typeof options === 'object' ? options : {};
  const name = typeof place === 'string' ? place.trim() : '';
  const address = typeof settings.address === 'string' ? settings.address.trim() : '';
  const coordinates = validCoordinates(settings.coordinates);
  const placeId = validPlaceId(settings.placeId);
  const query = coordinates ? `${coordinates.latitude},${coordinates.longitude}` : [name, address].filter(Boolean).join(', ');
  if (!query) return '';
  const url = new URL(MAPS_SEARCH_ENDPOINT);
  url.searchParams.set('api', '1');
  url.searchParams.set('query', query);
  if (placeId) url.searchParams.set('query_place_id', placeId);
  // Truncating an overlong name could point at a different place. Return no
  // target instead; callers can ask for a shorter query or a direct map link.
  return url.href.length <= MAX_MAPS_URL_LENGTH ? url.href : '';
}

export function mapLinkInfo(activity = {}) {
  const supplied = safeMapUrl(activity.mapUrl);
  if (supplied) return { url: supplied, kind: 'saved', label: 'Open saved map link' };
  const coordinates = validCoordinates(activity.coordinates);
  const placeId = validPlaceId(activity.googlePlaceId);
  const url = mapsUrl(activity.place || activity.title || '', { address: activity.placeAddress, placeId, coordinates });
  if (!url) return { url: '', kind: 'empty', label: 'Enter a place to search' };
  if (placeId) return { url, kind: 'place-id', label: 'Open place in Google Maps' };
  if (coordinates) return { url, kind: 'coordinates', label: 'Open coordinates in Google Maps' };
  return { url, kind: 'search', label: 'Search Google Maps' };
}

export const activityMapUrl = activity => mapLinkInfo(activity).url;

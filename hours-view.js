import { normalizeHours } from './opening-hours.js';
import { translate } from './i18n.js';
const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function renderHours(value, language='en', { collapsible=false }={}) {
  const hours=normalizeHours(value);if(!hours)return '';
  const t=text=>escape(translate(text,language));
  const heading=t('Opening hours');
  const body=`<p class="hours-text" data-user-content>${escape(hours.text)}</p><p class="hours-meta">${t(hours.kind==='imported'?'Imported hours · not live verified':'Manually entered · not live verified')}${hours.checkedAt?` · ${t('Checked on')} ${escape(hours.checkedAt)}`:''}</p>${hours.sourceUrl?`<a href="${escape(hours.sourceUrl)}" target="_blank" rel="noopener noreferrer">${t('Hours source')}</a>`:''}`;
  return collapsible?`<details class="hours-note"><summary>${heading}</summary>${body}</details>`:`<aside class="hours-note"><strong>${heading}</strong>${body}</aside>`;
}

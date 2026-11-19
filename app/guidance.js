export const guidanceSessionKey = 'travel-now:arrival-guidance:v1';

export const guidanceMessages = {
  'A little help getting started?': ['需要一点入门指引吗？', '需要一點入門指引嗎？'],
  'Would you like a quick tour?': ['想先看一下快速导览吗？', '想先看一下快速導覽嗎？'],
  'We can show you how to plan your days, choose a theme, preview your slides, and share your trip.': ['我们可以带你了解如何安排每日行程、选择主题、预览幻灯片及分享旅行。', '我們可以帶你了解如何安排每日行程、選擇主題、預覽投影片及分享旅行。'],
  'For a new trip, the tour begins after you finish the setup form.': ['如果是新行程，导览会在填写完基本信息后开始。', '如果是新行程，導覽會在填寫完基本資訊後開始。'],
  'Yes, guide me': ['好，带我了解', '好，帶我了解'],
  'No thanks': ['不用了，谢谢', '不用了，謝謝'],
};

/**
 * One invitation per tab session, independently of editor renders.
 * Acceptance can wait for a valid trip; resumeIfReady() never starts twice.
 * Storage is optional: a blocked sessionStorage falls back to in-memory state.
 */
export function createArrivalGuidance({
  document = globalThis.document,
  storage,
  translate = text => text,
  isReady = () => false,
  onStart = () => {},
  onChoice = () => {},
} = {}) {
  let sessionState = null, dialog = null, restoreFocus = null, disposed = false;
  try {
    const stored = storage?.getItem(guidanceSessionKey);
    if (['accepted', 'declined', 'started'].includes(stored)) sessionState = stored;
  } catch { /* Private browsing may disable sessionStorage. */ }

  function remember(value) {
    sessionState = value;
    try { storage?.setItem(guidanceSessionKey, value); } catch { /* In-memory state still prevents repeated invitations. */ }
  }

  function dismiss() {
    if (!dialog) return;
    if (dialog.open) dialog.close();
    dialog.remove();
    dialog = null;
    const fallback = document.querySelector('#setup-form [name="destination"], [data-tour="activities"], [data-tour="details"]');
    const target = restoreFocus?.isConnected && restoreFocus !== document.body ? restoreFocus : fallback;
    target?.focus({ preventScroll: true });
    restoreFocus = null;
  }

  function resumeIfReady() {
    if (disposed || sessionState !== 'accepted' || !isReady()) return false;
    remember('started');
    dismiss();
    onStart();
    return true;
  }

  function choose(accepted) {
    remember(accepted ? 'accepted' : 'declined');
    dismiss();
    onChoice(accepted);
    if (accepted) resumeIfReady();
  }

  function updateLanguage(nextTranslate = translate) {
    translate = nextTranslate;
    if (!dialog) return;
    for (const element of dialog.querySelectorAll('[data-guidance-message]')) {
      element.textContent = translate(element.dataset.guidanceMessage);
    }
  }

  function offer() {
    if (disposed) return false;
    if (sessionState) { resumeIfReady(); return false; }
    if (dialog?.isConnected) return false;
    // Never replace or stack over an activity/import dialog.
    if (document.querySelector('dialog[open]')) return false;
    restoreFocus = document.activeElement;
    dialog = document.createElement('dialog');
    dialog.id = 'arrival-guidance';
    dialog.className = 'arrival-guidance';
    dialog.setAttribute('aria-labelledby', 'arrival-guidance-title');
    dialog.setAttribute('aria-describedby', 'arrival-guidance-description arrival-guidance-note');
    const intro = document.createElement('p'); intro.className = 'overline';
    const title = document.createElement('h2'); title.id = 'arrival-guidance-title';
    const description = document.createElement('p'); description.id = 'arrival-guidance-description'; description.className = 'muted';
    const note = document.createElement('p'); note.id = 'arrival-guidance-note'; note.className = 'form-hint';
    const actions = document.createElement('div'); actions.className = 'dialog-actions';
    const decline = document.createElement('button'); decline.type = 'button'; decline.className = 'quiet'; decline.dataset.guidanceChoice = 'decline';
    const accept = document.createElement('button'); accept.type = 'button'; accept.className = 'primary'; accept.dataset.guidanceChoice = 'accept';
    for (const [element, message] of [
      [intro, 'A little help getting started?'],
      [title, 'Would you like a quick tour?'],
      [description, 'We can show you how to plan your days, choose a theme, preview your slides, and share your trip.'],
      [note, 'For a new trip, the tour begins after you finish the setup form.'],
      [decline, 'No thanks'], [accept, 'Yes, guide me'],
    ]) element.dataset.guidanceMessage = message;
    actions.append(decline, accept);
    dialog.append(intro, title, description, note, actions);
    decline.addEventListener('click', () => choose(false));
    accept.addEventListener('click', () => choose(true));
    dialog.addEventListener('cancel', event => { event.preventDefault(); choose(false); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); choose(false); }
      if (event.key === 'Tab') {
        // Native dialog makes the page inert; explicitly wrap these two choices.
        if (event.shiftKey && document.activeElement === decline) { event.preventDefault(); accept.focus(); }
        else if (!event.shiftKey && document.activeElement === accept) { event.preventDefault(); decline.focus(); }
      }
    });
    document.body.append(dialog);
    updateLanguage();
    dialog.showModal();
    accept.focus();
    return true;
  }

  function destroy() { dismiss(); disposed = true; }
  return { offer, resumeIfReady, updateLanguage, destroy, get state() { return sessionState; } };
}

import { StorageKeys } from '../settings.js';
import { renderQuickLists, clearHistory } from './favorites.js';

const HISTORY_KEY = StorageKeys?.HISTORY || 'NAV_HISTORY_V1';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

function getHistoryList() {
  return document.getElementById('history-list');
}

function getClearButton() {
  return document.getElementById('history-clear') || document.getElementById('btnHistoryClear');
}

function refreshHistoryUI() {
  try {
    renderQuickLists();
  } catch (err) {
    console.warn('[SVN] failed to render history list', err);
  }
}

function bindClearButton(btn) {
  if (!btn || btn.dataset.svnHistoryBound === '1') return;
  btn.dataset.svnHistoryBound = '1';
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const shouldClear = btn.dataset.confirm === 'skip' || confirm('履歴を全消去しますか？');
    if (!shouldClear) return;
    clearHistory();
  });
}

function hydrateHistoryList(list) {
  if (!list || list.dataset.svnHistoryHydrated === '1') return;
  list.dataset.svnHistoryHydrated = '1';
  refreshHistoryUI();
}

window.addEventListener('storage', (e) => {
  if (!e || (e.key && e.key !== HISTORY_KEY)) return;
  refreshHistoryUI();
});

window.addEventListener('search:history:invalidate', refreshHistoryUI);

ready(() => {
  const list = getHistoryList();
  hydrateHistoryList(list);
  bindClearButton(getClearButton());
});
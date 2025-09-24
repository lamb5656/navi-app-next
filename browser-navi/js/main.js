import { ensureMaplibre } from './libs/maplibre-loader.js';
import { MapController } from './map.js';
import { NavigationController } from './nav.js';
import { bindUI } from './ui.js';
import { renderQuickLists, clearHistory } from './ui/favorites.js';

const btnHC = document.getElementById('history-clear');
if (btnHC) {
  btnHC.addEventListener('click', () => {
    if (confirm('履歴を全消去しますか？')) clearHistory();
  });
}

// --- 追加: 検索UIの最低限の配線（UI実装に依存せず動く保険） ---
function wireSearchShortcut() {
  const addrEl =
    document.getElementById('addr') ||
    document.getElementById('search') ||
    document.querySelector('#search-input, [data-addr-input], input[name="addr"]');
  const btnSearch =
    document.getElementById('btn-search') ||
    document.getElementById('btnSearch') ||
    document.querySelector('[data-search-btn], button.search');

  const fire = () => {
    const q = (addrEl && typeof addrEl.value === 'string' ? addrEl.value : '').trim();
    window.dispatchEvent(new CustomEvent('search:submit', { detail: { query: q } }));
  };

  if (btnSearch) btnSearch.addEventListener('click', fire);
  if (addrEl) {
    let composing = false;
    addrEl.addEventListener('compositionstart', () => (composing = true));
    addrEl.addEventListener('compositionend', () => (composing = false));
    addrEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !composing) {
        e.preventDefault();
        fire();
      }
    });
  }
}
// ----------------------------------------------------------------------

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
}

(async function boot() {
  try {
    await ensureMaplibre();

    const mapCtrl = new MapController();
    if (typeof mapCtrl.init === 'function') {
      await mapCtrl.init();
    }

    const navCtrl = new NavigationController(mapCtrl);

    const ready = (fn) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn, { once: true });
      } else {
        fn();
      }
    };
    ready(() => {
      try {
        bindUI(mapCtrl, navCtrl);
        wireSearchShortcut(); // ← 追加：UI配線の保険

        window.mapCtrl = mapCtrl;
        window.navCtrl = navCtrl;
      } catch (e) {
        console.error('[SVN] bindUI failed', e);
      }
    });

    if ('geolocation' in navigator && typeof navCtrl.setHereInitial === 'function') {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const here = [pos.coords.longitude, pos.coords.latitude];
          navCtrl.setHereInitial(here);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  } catch (e) {
    console.error(e);
    try {
      const t = document.getElementById('toast') || document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      t.textContent = '初期化に失敗しました。再読み込みしてみてください';
      document.body.appendChild(t);
      t.style.opacity = '1';
      setTimeout(() => (t.style.opacity = '0'), 3500);
    } catch {}
  }
})();

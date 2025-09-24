const $ = (s) => document.querySelector(s);

const drawer = $('#drawer');
const backdrop = $('#drawer-backdrop');
const menuBtn = $('#menu-btn');
const closeBtn = $('#drawer-close');
const favBtn = $('#fav-toggle');

function openDrawer() {
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  if (backdrop) backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  if (backdrop) backdrop.hidden = true;
  document.body.style.overflow = '';
}

menuBtn?.addEventListener('click', openDrawer);
closeBtn?.addEventListener('click', closeDrawer);
backdrop?.addEventListener('click', closeDrawer);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

// ★ボタンの見た目だけトグル（実データの保存は ui/favorites.js に任せる）
favBtn?.addEventListener('click', () => {
  const pressed = favBtn.getAttribute('aria-pressed') === 'true';
  favBtn.setAttribute('aria-pressed', String(!pressed));
});

// 履歴消去（ui/history.js があればそちらで上書きされる想定）
$('#btnHistoryClear')?.addEventListener('click', () => {
  try { localStorage.removeItem('svnav_history'); } catch {}
  const list = $('#history-list'); if (list) list.innerHTML = '';
});

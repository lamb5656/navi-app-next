// js/ui/shell.js
// 最小UI制御（メニュー/検索ボタン/トーストなど）

const $ = (s) => document.querySelector(s);

const drawer = $('#drawer');
const backdrop = $('#drawer-backdrop');
const menuBtn = $('#menu-btn');
const closeBtn = $('#drawer-close');
const favBtn = $('#fav-toggle');
const searchInput = $('#search');
const btnSearch = $('#btnSearch');
const toastEl = $('#toast');

function openDrawer(){
  drawer?.classList.add('open');
  drawer?.setAttribute('aria-hidden','false');
  if (backdrop) backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeDrawer(){
  drawer?.classList.remove('open');
  drawer?.setAttribute('aria-hidden','true');
  if (backdrop) backdrop.hidden = true;
  document.body.style.overflow = '';
}

menuBtn?.addEventListener('click', openDrawer);
closeBtn?.addEventListener('click', closeDrawer);
backdrop?.addEventListener('click', closeDrawer);
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

// ★ボタン見た目だけのトグル（実処理は ui/favorites.js に委譲想定）
favBtn?.addEventListener('click', () => {
  const pressed = favBtn.getAttribute('aria-pressed') === 'true';
  favBtn.setAttribute('aria-pressed', String(!pressed));
});

function toast(msg){
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.style.opacity = '1';
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(()=>{ toastEl.style.opacity = '0'; }, 2200);
}

// 検索ボタン → 入力にフォーカスを戻してから Enter を発火
// 一部実装が「activeElement が input か」を見るため、その対策にゃ
btnSearch?.addEventListener('click', () => {
  if(!searchInput) return;
  const q = (searchInput.value || '').trim();
  if(!q){
    toast('住所や施設名を入力してください');
    searchInput.focus();
    return;
  }
  // ここがポイント：まず入力欄にフォーカスを戻す
  searchInput.focus();

  // Enterをkeydown/keyupの順で投げる（isTrustedはfalseでも多くの実装で可）
  const kd = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
  const ku = new KeyboardEvent('keyup',   { key: 'Enter', code: 'Enter', bubbles: true });
  searchInput.dispatchEvent(kd);
  setTimeout(() => searchInput.dispatchEvent(ku), 0);

  // 予備：カスタムイベントでも通知（必要なら ui/search.js 側で拾える）
  window.dispatchEvent(new CustomEvent('search:submit', { detail: { query: q } }));
});

// 履歴消去（ui/history.js が上書き実装を持っていればそちらが使われる）
$('#btnHistoryClear')?.addEventListener('click', () => {
  try { localStorage.removeItem('svnav_history'); } catch {}
  const list = $('#history-list'); if (list) list.innerHTML = '';
});

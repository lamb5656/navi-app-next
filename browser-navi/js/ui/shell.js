// UIの最低限制御だけ（既存の search/favorites/history があればそれらが主導）

const $ = (s) => document.querySelector(s);

const drawer = $('#drawer');
const backdrop = $('#drawer-backdrop');
const menuBtn = $('#menu-btn');
const closeBtn = $('#drawer-close');
const favBtn = $('#fav-toggle');
const searchInput = $('#search');
const btnSearch = $('#btnSearch');
const toastEl = $('#toast');

function openDrawer(){ drawer?.classList.add('open'); drawer?.setAttribute('aria-hidden','false'); backdrop && (backdrop.hidden=false); document.body.style.overflow='hidden'; }
function closeDrawer(){ drawer?.classList.remove('open'); drawer?.setAttribute('aria-hidden','true'); backdrop && (backdrop.hidden=true); document.body.style.overflow=''; }

menuBtn?.addEventListener('click', openDrawer);
closeBtn?.addEventListener('click', closeDrawer);
backdrop?.addEventListener('click', closeDrawer);
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

// ★ボタンの見た目だけトグル（実データ保存は ui/favorites.js に任せる）
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

// 検索ボタン → Enter押下と同等のイベントを発火
btnSearch?.addEventListener('click', () => {
  if(!searchInput) return;
  const q = (searchInput.value || '').trim();
  if(!q){ toast('目的地を入力してにゃ'); searchInput.focus(); return; }
  // 既存の search.js が Enter を拾う想定
  const ev = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
  searchInput.dispatchEvent(ev);
});

// 履歴消去（ui/history.js があれば上書きされる想定）
$('#btnHistoryClear')?.addEventListener('click', () => {
  try { localStorage.removeItem('svnav_history'); } catch {}
  const list = $('#history-list'); if (list) list.innerHTML = '';
});

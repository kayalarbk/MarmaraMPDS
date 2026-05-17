import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAEby7m7ij-SPjmO0CMvF0ypuAL1_IXW4c",
  authDomain: "marmarampds2026.firebaseapp.com",
  projectId: "marmarampds2026",
  storageBucket: "marmarampds2026.firebasestorage.app",
  messagingSenderId: "493280174451",
  appId: "1:493280174451:web:6172ed6dc279afb19ae506"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async function() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  const container = document.getElementById('project-content');

  let p = null;

  if (projectId) {
    try {
      const snap = await getDoc(doc(db, 'projects', projectId));
      if (snap.exists()) p = { id: snap.id, ...snap.data() };
    } catch (err) {
      console.warn('Firestore fetch başarısız, statik fallback deneniyor:', err);
      if (typeof PROJECTS !== 'undefined' && PROJECTS[projectId]) {
        p = PROJECTS[projectId];
      }
    }
  }

  if (!p) {
    container.innerHTML = `
      <div class="reveal in" style="text-align:center;padding:4rem 1rem">
        <span class="section-label">// 404</span>
        <h2 class="section-title">Proje Bulunamadı</h2>
        <p class="section-sub" style="margin:1rem auto 2rem">Aradığın proje Proje Havuzu'nda mevcut değil. Tüm projeleri görmek için Proje Havuzu'na dönebilirsin.</p>
        <a href="index.html#projects" class="btn-primary">← Proje Havuzu'na Dön</a>
      </div>
    `;
    return;
  }

  const teamHtml = p.team && p.team.length > 0 ? p.team.map(m => `
    <div class="detail-team-member">
      <div class="detail-avatar"><div class="avatar-placeholder">${m.initials}</div></div>
      <div class="detail-team-info">
        <div class="detail-team-name">${m.name}</div>
        <div class="detail-team-role">${m.role}</div>
      </div>
      <div class="detail-team-status">✓ Dolu</div>
    </div>
  `).join('') : '<div class="detail-empty-team">Henüz ekip üyesi yok — ilk katılan sen olabilirsin!</div>';

  const rolesHtml = (p.openRoles || []).map(r => `
    <div class="detail-role-card">
      <div class="detail-role-header">
        <div class="detail-role-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <div class="detail-role-title">${r.title}</div>
        <span class="detail-role-tag">Açık</span>
      </div>
      <p class="detail-role-desc">${r.desc}</p>
      <a href="index.html#apply" class="detail-role-btn" data-role="${r.title}" data-project="${p.title}">
        Bu Role Başvur →
      </a>
    </div>
  `).join('');

  const goalsHtml = (p.goals || []).map(g => `<li>${g}</li>`).join('');
  const tagsHtml = (p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('');

  container.innerHTML = `
    <a href="index.html#projects" class="detail-back-link">← Proje Havuzu</a>

    <div class="detail-header reveal in">
      <div class="detail-status-row">
        <div class="project-status ${p.status}"><span class="status-dot"></span> ${p.statusLabel}</div>
      </div>
      <h1 class="detail-title">${p.title}</h1>
      <p class="detail-lead">${p.description}</p>
      <div class="project-tags" style="margin-top:1.5rem">${tagsHtml}</div>
    </div>

    <div class="detail-grid">
      <div class="detail-main reveal in">
        <div class="detail-block">
          <div class="detail-block-label">// Proje Hakkında</div>
          <p class="detail-block-text">${p.longDescription}</p>
        </div>

        <div class="detail-block">
          <div class="detail-block-label">// Hedefler</div>
          <ul class="detail-goals">${goalsHtml}</ul>
        </div>

        <div class="detail-block">
          <div class="detail-block-label">// Açık Roller (${(p.openRoles || []).length})</div>
          <div class="detail-roles">${rolesHtml}</div>
        </div>
      </div>

      <aside class="detail-sidebar reveal in">
        <div class="detail-sidebar-block">
          <div class="detail-block-label">// Mevcut Ekip</div>
          <div class="detail-team-list">${teamHtml}</div>
        </div>

        <div class="detail-sidebar-block detail-cta-block">
          <div class="detail-cta-title">İlgini çekti mi?</div>
          <p class="detail-cta-text">Bu projede yer almak istediğin rol için Aramıza Katıl formunu doldurabilirsiniz.</p>
          <a href="index.html#apply" class="btn-primary" style="display:block;text-align:center;margin-top:1rem">Aramıza Katıl →</a>
        </div>
      </aside>
    </div>
  `;

  document.querySelectorAll('.detail-role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      const proj = btn.getAttribute('data-project');
      sessionStorage.setItem('mpds_apply_context', `${proj} - ${role}`);
    });
  });
})();

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('mpds-theme', next);
}
window.toggleTheme = toggleTheme;

function toggleMenu() {
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('mobile-menu').classList.toggle('open');
}
window.toggleMenu = toggleMenu;

function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobile-menu').classList.remove('open');
}
window.closeMenu = closeMenu;

// ── Ann & FAQ nav ──
let _annData = [];
let _annFromCal = false;
let _calDate = new Date();

function _loadAnnData() {
  if (!_annData.length && typeof ANNOUNCEMENTS !== 'undefined') _annData = ANNOUNCEMENTS;
}

function toggleAnnDropdown() {
  const wrap = document.getElementById('ann-nav-wrap');
  const faqWrap = document.getElementById('faq-nav-wrap');
  if (faqWrap) faqWrap.classList.remove('open');
  wrap.classList.toggle('open');
  if (wrap.classList.contains('open')) { _loadAnnData(); _renderAnnList('hepsi'); _renderCalendar(); }
}
window.toggleAnnDropdown = toggleAnnDropdown;

function switchAnnTab(btn, tab) {
  document.querySelectorAll('.ann-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ann-pane').forEach(p => p.style.display = 'none');
  document.getElementById('ann-pane-' + tab).style.display = '';
  if (tab === 'takvim') _renderCalendar();
}
window.switchAnnTab = switchAnnTab;

function filterAnnouncements(q) {
  const lower = q.toLowerCase().trim();
  document.querySelectorAll('#ann-list .ann-item').forEach(item => {
    item.style.display = (!lower || item.textContent.toLowerCase().includes(lower)) ? '' : 'none';
  });
}
window.filterAnnouncements = filterAnnouncements;

function _renderAnnList(filter) {
  _loadAnnData();
  const list = document.getElementById('ann-list');
  if (!list) return;
  const filtered = filter === 'hepsi' ? _annData : _annData.filter(a => a.type === filter);
  if (!filtered.length) { list.innerHTML = '<p style="color:var(--muted);padding:1rem 0">Bu kategoride duyuru yok.</p>'; return; }
  list.innerHTML = filtered.map(a => `
    <div class="ann-item" onclick="openAnn('${a.id}')">
      <div class="ann-meta">
        <span class="ann-type ann-type-${a.type || ''}">${a.typeLabel || a.type || ''}</span>
        <span class="ann-date">${a.date || ''}</span>
      </div>
      <div class="ann-title">${a.title}</div>
      <p class="ann-summary">${a.summary || ''}</p>
    </div>
  `).join('');
}

function openAnn(id, fromCal) {
  _loadAnnData();
  const a = _annData.find(x => x.id === id);
  if (!a) return;
  _annFromCal = !!fromCal;
  document.getElementById('ann-modal-content').innerHTML = `
    <div class="ann-modal-head">
      <span class="ann-type ann-type-${a.type || ''}">${a.typeLabel || a.type || ''}</span>
      <span class="ann-date">${_fmtDate(a.date || '')}</span>
    </div>
    <h2 class="ann-modal-title">${a.title}</h2>
    <p class="ann-modal-body">${(a.content || '').replace(/\n/g, '<br>')}</p>
  `;
  document.getElementById('ann-nav-wrap')?.classList.remove('open');
  document.getElementById('ann-modal-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openAnn = openAnn;

function closeAnnModal(e) {
  if (e) {
    e.preventDefault(); e.stopPropagation();
    if (e.target !== document.getElementById('ann-modal-overlay') &&
        !e.currentTarget.classList.contains('modal-close')) return;
  }
  document.getElementById('ann-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  if (_annFromCal) {
    _annFromCal = false;
    setTimeout(() => {
      const w = document.getElementById('ann-nav-wrap');
      if (w) { w.classList.add('open'); const t = document.querySelector('.ann-tab[data-tab="takvim"]'); if (t) switchAnnTab(t, 'takvim'); }
    }, 0);
  }
}
window.closeAnnModal = closeAnnModal;

function _fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function _renderCalendar() {
  _loadAnnData();
  const cal = document.getElementById('ann-calendar');
  if (!cal) return;
  const y = _calDate.getFullYear(), m = _calDate.getMonth();
  const mNames = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const firstDay = new Date(y, m, 1).getDay();
  const adj = firstDay === 0 ? 6 : firstDay - 1;
  const days = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const evDays = {};
  _annData.forEach(a => {
    if (!a.date) return;
    const d = new Date(a.date);
    if (d.getFullYear() === y && d.getMonth() === m) { const day = d.getDate(); if (!evDays[day]) evDays[day] = []; evDays[day].push(a); }
  });
  let html = `<div class="cal-header"><button class="cal-nav" type="button" onclick="changeMonth(event,-1)">‹</button><span class="cal-title">${mNames[m]} ${y}</span><button class="cal-nav" type="button" onclick="changeMonth(event,1)">›</button></div><div class="cal-grid"><div class="cal-day-label">Pt</div><div class="cal-day-label">Sa</div><div class="cal-day-label">Ça</div><div class="cal-day-label">Pe</div><div class="cal-day-label">Cu</div><div class="cal-day-label">Ct</div><div class="cal-day-label">Pz</div>`;
  for (let i = 0; i < adj; i++) html += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= days; d++) {
    const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
    const evs = evDays[d] || [];
    const ids = evs.map(e => e.id).join(',');
    html += `<div class="cal-cell${isToday ? ' today' : ''}${evs.length ? ' has-event' : ''}" ${evs.length ? `onclick="openCalEvent(event,'${ids}')"` : ''}>${d}${evs.length ? '<span class="cal-dot"></span>' : ''}</div>`;
  }
  html += `</div>`;
  cal.innerHTML = html;
  const upList = document.getElementById('ann-upcoming');
  if (upList) {
    const now = new Date();
    const upcoming = _annData.filter(a => a.date && new Date(a.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
    const mo = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    upList.innerHTML = upcoming.length ? upcoming.map(a => `<div class="ann-upcoming-item" onclick="openAnn('${a.id}')"><div class="ann-upcoming-date"><span class="ann-upcoming-day">${new Date(a.date).getDate()}</span><span class="ann-upcoming-month">${mo[new Date(a.date).getMonth()]}</span></div><div class="ann-upcoming-info"><div class="ann-upcoming-title">${a.title}</div><span class="ann-type ann-type-${a.type}">${a.typeLabel || a.type}</span></div></div>`).join('') : '<div class="ann-empty">Yaklaşan etkinlik yok</div>';
  }
}

function changeMonth(e, dir) { e.stopPropagation(); _calDate.setMonth(_calDate.getMonth() + dir); _renderCalendar(); }
window.changeMonth = changeMonth;

function openCalEvent(e, ids) { e.stopPropagation(); openAnn(ids.split(',')[0], true); }
window.openCalEvent = openCalEvent;

function toggleFaqDropdown() {
  const faqWrap = document.getElementById('faq-nav-wrap');
  const annWrap = document.getElementById('ann-nav-wrap');
  if (annWrap) annWrap.classList.remove('open');
  faqWrap.classList.toggle('open');
}
window.toggleFaqDropdown = toggleFaqDropdown;

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-dropdown .faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}
window.toggleFaq = toggleFaq;

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.getElementById('ann-modal-overlay')?.classList.remove('open');
  document.getElementById('ann-nav-wrap')?.classList.remove('open');
  document.getElementById('faq-nav-wrap')?.classList.remove('open');
  document.body.style.overflow = '';
});

document.addEventListener('click', e => {
  const annWrap = document.getElementById('ann-nav-wrap');
  if (annWrap && !annWrap.contains(e.target)) annWrap.classList.remove('open');
  const faqWrap = document.getElementById('faq-nav-wrap');
  if (faqWrap && !faqWrap.contains(e.target)) faqWrap.classList.remove('open');
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#ann-pane-duyurular .ann-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#ann-pane-duyurular .ann-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _renderAnnList(btn.dataset.type);
    });
  });
});

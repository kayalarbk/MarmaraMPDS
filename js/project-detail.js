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
          <p class="detail-cta-text">Bu projede yer almak için Aramıza Katıl formunu doldur. Hangi role başvurduğunu mesaj kısmında belirtmen yeterli.</p>
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

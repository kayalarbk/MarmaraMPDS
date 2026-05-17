// ============================================================
//  script-firebase.js  —  MPDS sitesi Firebase entegrasyonu
//
//  index.html'de mevcut <script> taglerini şunlarla değiştirin:
//
//  <script type="module" src="js/script-firebase.js"></script>
//
//  NOT: projects-data.js ve announcements-data.js artık
//  gerekli değil. Veriler Firestore'dan gelecek.
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore,
  collection, doc,
  getDocs, addDoc, setDoc, getDoc,
  query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAEby7m7ij-SPjmO0CMvF0ypuAL1_IXW4c",
  authDomain: "marmarampds2026.firebaseapp.com",
  projectId: "marmarampds2026",
  storageBucket: "marmarampds2026.firebasestorage.app",
  messagingSenderId: "493280174451",
  appId: "1:493280174451:web:6172ed6dc279afb19ae506"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ============================================================
//  GLOBAL STATE (Firestore'dan yüklenir)
// ============================================================
let PROJECTS_DATA = {};     // { [id]: projectObj }
let ANNOUNCEMENTS_DATA = []; // [ announcementObj ]
let MEMBERS_DATA = {};       // { [id]: memberObj }

// ============================================================
//  FORMSPREE (başvuru formu için hâlâ kullanılıyor)
//  Alternatif: Firestore'a kaydetmek için submitForm içini değiştirin
// ============================================================
const FORMSPREE_ID = 'mdabnzvy';

// EmailJS — set these after creating a free account at emailjs.com
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

// ============================================================
//  THEME SYNC
// ============================================================
function getFingerprint() {
  const raw = navigator.userAgent + screen.width + screen.height + navigator.language;
  let h = 0;
  for (let i = 0; i < raw.length; i++) { h = ((h << 5) - h) + raw.charCodeAt(i); h |= 0; }
  return 'fp_' + Math.abs(h).toString(36);
}

async function syncThemeToFirestore(theme) {
  try {
    await setDoc(doc(db, 'userPreferences', getFingerprint()),
      { theme, updatedAt: new Date().toISOString() }, { merge: true });
  } catch {}
}

async function loadThemeFromFirestore() {
  try {
    const snap = await getDoc(doc(db, 'userPreferences', getFingerprint()));
    if (snap.exists()) {
      const t = snap.data().theme;
      if (t) { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('mpds-theme', t); }
    }
  } catch {}
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('mpds-theme', next);
  syncThemeToFirestore(next);
}
window.toggleTheme = toggleTheme;

// ============================================================
//  SKELETON LOADERS
// ============================================================
function showSkeletons() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = Array(4).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-line short"></div>
      <div class="skeleton-line medium" style="margin-bottom:1.25rem"></div>
      <div class="skeleton-line tall"></div>
      <div class="skeleton-line short" style="margin-top:.75rem"></div>
    </div>`).join('');
}

// ============================================================
//  SEARCH FILTERS
// ============================================================
function filterProjects(q) {
  const lower = q.toLowerCase().trim();
  document.querySelectorAll('#projects-grid .project-card').forEach(card => {
    if (card.classList.contains('project-add')) { card.style.display = ''; return; }
    card.style.display = (!lower || card.textContent.toLowerCase().includes(lower)) ? '' : 'none';
  });
}
window.filterProjects = filterProjects;

function filterAnnouncements(q) {
  const lower = q.toLowerCase().trim();
  document.querySelectorAll('#ann-list .ann-item').forEach(item => {
    item.style.display = (!lower || item.textContent.toLowerCase().includes(lower)) ? '' : 'none';
  });
}
window.filterAnnouncements = filterAnnouncements;

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Kayıtlı tema
  const savedTheme = localStorage.getItem('mpds-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  // Firestore tema senkronizasyonu (non-blocking)
  loadThemeFromFirestore();

  // Skeleton göster
  showSkeletons();

  // Başvuru pozisyon context
  const ctx = sessionStorage.getItem('mpds_apply_context');
  if (ctx) {
    const posEl = document.getElementById('f-position');
    const grpEl = document.getElementById('apply-context-group');
    if (posEl) posEl.value = ctx;
    if (grpEl) grpEl.style.display = 'block';
  }

  const clearBtn = document.getElementById('position-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      sessionStorage.removeItem('mpds_apply_context');
      document.getElementById('f-position').value = '';
      document.getElementById('apply-context-group').style.display = 'none';
    });
  }

  const whyEl = document.getElementById('f-why');
  if (whyEl) {
    whyEl.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submitForm();
    });
  }

  // Firebase'den veri yükle
  await Promise.all([
    loadProjectsFromFirestore(),
    loadAnnouncementsFromFirestore(),
    loadMembersFromFirestore()
  ]);

  // Render
  renderProjectCards();
  renderAnnList('hepsi');
  renderTeamSection();

  // Duyuru filtreleri
  document.querySelectorAll('#ann-pane-duyurular .ann-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#ann-pane-duyurular .ann-filter')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAnnList(btn.dataset.type);
    });
  });
});

// ============================================================
//  FIRESTORE LOADERS
// ============================================================
async function loadProjectsFromFirestore() {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    PROJECTS_DATA = {};
    snap.forEach(d => { PROJECTS_DATA[d.id] = { id: d.id, ...d.data() }; });
  } catch (err) {
    console.warn('Projeler yüklenemedi, PROJECTS fallback kullanılıyor:', err);
    if (typeof PROJECTS !== 'undefined') PROJECTS_DATA = PROJECTS;
  }
}

async function loadAnnouncementsFromFirestore() {
  try {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    ANNOUNCEMENTS_DATA = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Duyurular yüklenemedi, ANNOUNCEMENTS fallback kullanılıyor:', err);
    if (typeof ANNOUNCEMENTS !== 'undefined') ANNOUNCEMENTS_DATA = ANNOUNCEMENTS;
  }
}

async function loadMembersFromFirestore() {
  try {
    const q = query(collection(db, 'members'), orderBy('order'));
    const snap = await getDocs(q);
    MEMBERS_DATA = {};
    snap.forEach(d => { MEMBERS_DATA[d.id] = { id: d.id, ...d.data() }; });
  } catch (err) {
    console.warn('Üyeler yüklenemedi:', err);
  }
}

// ============================================================
//  BAŞVURU FORMU — Firestore'a kaydet (Formspree yerine)
// ============================================================
async function submitForm() {
  const name     = document.getElementById('f-name').value.trim();
  const surname  = document.getElementById('f-surname').value.trim();
  const email    = document.getElementById('f-email').value.trim();
  const why      = document.getElementById('f-why').value.trim();
  const position = document.getElementById('f-position')?.value.trim() || '';

  if (!name || !email || !why) {
    showToast('Lütfen zorunlu alanları doldurun.', true);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Geçerli bir e-posta adresi girin.', true);
    return;
  }

  const skills = [...document.querySelectorAll('.checkbox-grid input:checked')]
    .map(cb => cb.value).join(', ');

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Gönderiliyor...';

  try {
    // Firestore'a kaydet
    await addDoc(collection(db, 'applications'), {
      ad: name,
      soyad: surname,
      email,
      pozisyon: position || null,
      yetenekler: skills,
      neden: why,
      submittedAt: new Date().toISOString(),
      status: 'beklemede'
    });

    showToast('Başvurunuz başarıyla gönderildi! En kısa sürede dönüş yapacağız.', false);

    // Admin e-posta bildirimi (EmailJS yapılandırıldıysa gönder)
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: `${name} ${surname}`.trim(),
          from_email: email,
          position: position || 'Belirtilmedi',
          skills: skills || 'Belirtilmedi',
          message: why,
          reply_to: email
        });
      } catch (emailErr) {
        console.warn('EmailJS bildirimi gönderilemedi:', emailErr);
      }
    }

    ['f-name', 'f-surname', 'f-email', 'f-why'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.querySelectorAll('.checkbox-grid input').forEach(cb => cb.checked = false);
    sessionStorage.removeItem('mpds_apply_context');
    const posEl = document.getElementById('f-position');
    if (posEl) posEl.value = '';
    const grpEl = document.getElementById('apply-context-group');
    if (grpEl) grpEl.style.display = 'none';

  } catch (err) {
    console.error(err);
    showToast('Bir hata oluştu. Lütfen tekrar deneyin.', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Başvuruyu Gönder →';
  }
}
window.submitForm = submitForm;

// ============================================================
//  PROJECT CARDS (Firestore verisinden render)
// ============================================================
function renderProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (!Object.keys(PROJECTS_DATA).length) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">Projeler yükleniyor…</p>';
    return;
  }

  const cardsHtml = Object.values(PROJECTS_DATA)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .map(p => {
    const tagsHtml    = (p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('');
    const openChips   = (p.openRoles || []).map(r => `<span class="role-chip needed">${r.title}</span>`).join('');
    const filledChips = (p.team || []).map(m => `<span class="role-chip filled">✓ ${m.role}</span>`).join('');
    const roleLabel   = p.status === 'mentor-ariyor' ? 'Mevcut Ekip:' : 'Aranan Roller:';
    const ctaText     = (p.openRoles || []).length > 0 ? 'Detayları gör &amp; başvur' : 'Detayları gör';
    const rolesSection = (openChips || filledChips) ? `
      <div class="project-roles">
        <div class="role-label">${roleLabel}</div>
        <div class="role-list">${openChips}${filledChips}</div>
      </div>` : '';

    return `<a href="project.html?id=${p.id}" class="project-card ${p.cardSize || 'medium'} reveal project-link-wrapper">
      <div class="project-header">
        <div class="project-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">${p.iconSvg || ''}</svg>
        </div>
        <div class="project-status ${p.status}"><span class="status-dot"></span> ${p.statusLabel || ''}</div>
      </div>
      <div class="project-name">${p.title}</div>
      <p class="project-desc">${p.description}</p>
      ${rolesSection}
      <div class="project-tags">${tagsHtml}</div>
      <div class="project-card-cta">
        <span class="project-cta-text">${ctaText}</span>
        <span class="project-cta-arrow">→</span>
      </div>
    </a>`;
  }).join('');

  const addCard = `<a href="javascript:void(0)" onclick="openProjectModal()" class="project-card small project-add reveal project-link-wrapper">
    <div class="project-add-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>
    </div>
    <div class="project-name">Senin Projen Burada Olabilir</div>
    <p class="project-desc">Bir fikrin var ama ekip mi, mentor mu, danışman hoca mı arıyorsun? Projeni MPDS havuzuna ekle.</p>
    <div class="project-card-cta">
      <span class="project-cta-text" style="color:var(--cyan)">Projeni Ekle</span>
      <span class="project-cta-arrow" style="color:var(--cyan)">→</span>
    </div>
  </a>`;

  grid.innerHTML = cardsHtml + addCard;

  grid.querySelectorAll('.reveal').forEach((el, i) => {
    el.dataset.delay = (i % 3) * 80;
    observer.observe(el);
  });

  // Filtre butonları
  document.querySelectorAll('.pool-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pool-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const statusMap = {
        'Tüm Projeler': null,
        'Ekip Arıyor': 'ekip-ariyor',
        'Mentor Arıyor': 'mentor-ariyor',
        'Fikir Aşamasında': 'fikir-asamasi'
      };
      const target = statusMap[btn.textContent.trim()] ?? null;
      document.querySelectorAll('#projects-grid .project-card').forEach(card => {
        if (!target || card.classList.contains('project-add')) { card.style.display = ''; return; }
        const statusEl = card.querySelector('.project-status');
        card.style.display = (statusEl && statusEl.classList.contains(target)) ? '' : 'none';
      });
    });
  });
}

// ============================================================
//  TEAM SECTION — Firestore'dan render
// ============================================================
const FOUNDER_ROLES = ['Başkan', 'Başkan Yardımcısı', 'Kulüp Sekreteri'];

function renderTeamSection() {
  const grid = document.querySelector('.team-grid');
  if (!grid || !Object.keys(MEMBERS_DATA).length) return;

  const sorted = Object.values(MEMBERS_DATA)
    .filter(m => m.isFounder === true || FOUNDER_ROLES.includes(m.role))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  grid.innerHTML = sorted.map((m, i) => {
    const featured = i === Math.floor(sorted.length / 2) ? 'member-card-featured' : '';
    const skillHtml = (m.skills || []).map(s => `<span class="skill-chip">${s}</span>`).join('');
    return `
    <div class="member-card ${featured} reveal" onclick="openMemberModal('${m.id}')">
      <div class="avatar-wrap">
        <img src="${m.avatarPath || ''}" alt="${m.name}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="avatar-placeholder" style="display:none">${m.initials || ''}</div>
      </div>
      <div class="member-name">${m.name}</div>
      <div class="member-role">${m.role}</div>
      <p class="member-bio">${m.bio}</p>
      <div class="member-links" onclick="event.stopPropagation()">
        <a href="mailto:${m.email}" class="icon-btn" title="E-posta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </a>
      </div>
    </div>`;
  }).join('');

  // Observer'ı yeni elementlere uygula
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================================
//  MEMBER MODAL (Firestore verisiyle)
// ============================================================
function openMemberModal(id) {
  const m = MEMBERS_DATA[id];
  if (!m) return;
  const skillHtml = (m.skills || []).map(s => `<span class="skill-chip">${s}</span>`).join('');
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-avatar"><div class="avatar-placeholder">${m.initials || ''}</div></div>
    <div class="modal-name">${m.name}</div>
    <div class="modal-role">${m.role}</div>
    <div class="modal-section">
      <div class="modal-section-label">Hakkında</div>
      <p class="modal-bio">${m.bio}</p>
    </div>
    <div class="modal-section">
      <div class="modal-section-label">Uzmanlık Alanları</div>
      <div class="skill-chips">${skillHtml}</div>
    </div>
    <div class="modal-links">
      <a href="mailto:${m.email}" class="modal-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        E-posta
      </a>
    </div>
  `;
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openModal = openMemberModal; // index.html onclick="openModal('m1')" için

function closeModal(e) {
  if (e && e.target !== document.getElementById('overlay') &&
      !e.currentTarget.classList.contains('modal-close')) return;
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}
window.closeModal = closeModal;

// ============================================================
//  ANNOUNCEMENTS (Firestore verisinden)
// ============================================================
function renderAnnList(filter) {
  const list = document.getElementById('ann-list');
  if (!list) return;

  const filtered = filter === 'hepsi'
    ? ANNOUNCEMENTS_DATA
    : ANNOUNCEMENTS_DATA.filter(a => a.type === filter);

  if (!filtered.length) {
    list.innerHTML = '<p style="color:var(--muted);padding:1rem 0">Bu kategoride duyuru yok.</p>';
    return;
  }

  list.innerHTML = filtered.map(a => `
    <div class="ann-item reveal" onclick="openAnn('${a.id}')">
      <div class="ann-meta">
        <span class="ann-type ann-type-${a.type || ''}">${a.typeLabel || a.type || ''}</span>
        <span class="ann-date">${a.date || ''}</span>
      </div>
      <div class="ann-title">${a.title}</div>
      <p class="ann-summary">${a.summary || ''}</p>
    </div>
  `).join('');

  list.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
window.renderAnnList = renderAnnList;

let _annOpenedFromCalendar = false;

function openAnn(id, fromCalendar) {
  const a = ANNOUNCEMENTS_DATA.find(x => x.id === id);
  if (!a) return;
  _annOpenedFromCalendar = !!fromCalendar;
  document.getElementById('ann-modal-content').innerHTML = `
    <div class="ann-modal-head">
      <span class="ann-type ann-type-${a.type || ''}">${a.typeLabel || a.type || ''}</span>
      <span class="ann-date">${formatAnnDate(a.date || '')}</span>
    </div>
    <h2 class="ann-modal-title">${a.title}</h2>
    <p class="ann-modal-body">${(a.content || '').replace(/\n/g, '<br>')}</p>
  `;
  document.getElementById('ann-nav-wrap')?.classList.remove('open');
  history.pushState({ annOpen: true }, '');
  document.getElementById('ann-modal-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openAnn = openAnn;

// ============================================================
//  PROJECT MODAL (kullanıcı tarafından proje ekleme — Firestore)
// ============================================================
let pmRoleCount = 0;

function openProjectModal() {
  ['pm-title', 'pm-desc', 'pm-long-desc', 'pm-tags', 'pm-name', 'pm-surname', 'pm-email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const statusEl = document.getElementById('pm-status');
  if (statusEl) statusEl.value = 'ekip-ariyor';
  const rolesList = document.getElementById('pm-roles-list');
  if (rolesList) rolesList.innerHTML = '';
  pmRoleCount = 0;
  const addRoleBtn = document.getElementById('pm-add-role-btn');
  if (addRoleBtn) addRoleBtn.disabled = false;
  pmGoStep1();
  document.getElementById('project-modal-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openProjectModal = openProjectModal;

function closeProjectModal(e) {
  if (e && e.target !== document.getElementById('project-modal-overlay')) return;
  document.getElementById('project-modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
window.closeProjectModal = closeProjectModal;

function pmGoStep1() {
  document.getElementById('pm-page-1').style.display = '';
  document.getElementById('pm-page-2').style.display = 'none';
  document.getElementById('pm-step-1').classList.add('active');
  document.getElementById('pm-step-2').classList.remove('active');
}
window.pmGoStep1 = pmGoStep1;

function pmGoStep2() {
  const title    = document.getElementById('pm-title')?.value.trim();
  const desc     = document.getElementById('pm-desc')?.value.trim();
  const longDesc = document.getElementById('pm-long-desc')?.value.trim();
  if (!title || !desc || !longDesc) {
    showToast('Lütfen zorunlu alanları doldurun.', true);
    return;
  }
  document.getElementById('pm-page-1').style.display = 'none';
  document.getElementById('pm-page-2').style.display = '';
  document.getElementById('pm-step-1').classList.remove('active');
  document.getElementById('pm-step-2').classList.add('active');
}
window.pmGoStep2 = pmGoStep2;

function pmAddRole() {
  if (pmRoleCount >= 5) return;
  pmRoleCount++;
  const list = document.getElementById('pm-roles-list');
  const row = document.createElement('div');
  row.className = 'pm-role-row';
  row.innerHTML = `
    <div class="pm-role-fields">
      <input type="text" class="form-input pm-role-title" placeholder="Rol başlığı"/>
      <input type="text" class="form-input pm-role-desc" placeholder="Rol açıklaması"/>
    </div>
    <button class="pm-remove-role-btn" onclick="pmRemoveRole(this)" title="Rolü kaldır">×</button>
  `;
  list.appendChild(row);
  if (pmRoleCount >= 5) document.getElementById('pm-add-role-btn').disabled = true;
}
window.pmAddRole = pmAddRole;

function pmRemoveRole(btn) {
  btn.closest('.pm-role-row').remove();
  pmRoleCount--;
  const addRoleBtn = document.getElementById('pm-add-role-btn');
  if (addRoleBtn) addRoleBtn.disabled = false;
}
window.pmRemoveRole = pmRemoveRole;

async function submitProject() {
  const title    = document.getElementById('pm-title')?.value.trim();
  const desc     = document.getElementById('pm-desc')?.value.trim();
  const longDesc = document.getElementById('pm-long-desc')?.value.trim();
  const status   = document.getElementById('pm-status')?.value || 'ekip-ariyor';
  const tagsRaw  = document.getElementById('pm-tags')?.value || '';
  const name     = document.getElementById('pm-name')?.value.trim();
  const surname  = document.getElementById('pm-surname')?.value.trim();
  const email    = document.getElementById('pm-email')?.value.trim();

  if (!title || !desc || !longDesc || !name || !surname || !email) {
    pmGoStep1();
    showToast('Lütfen zorunlu alanları doldurun.', true);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    pmGoStep1();
    showToast('Geçerli bir e-posta adresi girin.', true);
    return;
  }

  const statusLabels = {
    'ekip-ariyor': 'Ekip Arıyor',
    'mentor-ariyor': 'Mentor Arıyor',
    'fikir-asamasi': 'Fikir Aşaması'
  };

  const openRoles = [];
  document.querySelectorAll('.pm-role-row').forEach(row => {
    const roleTitle = row.querySelector('.pm-role-title').value.trim();
    const roleDesc  = row.querySelector('.pm-role-desc').value.trim();
    if (roleTitle) openRoles.push({ title: roleTitle, desc: roleDesc });
  });

  const btn = document.querySelector('#project-modal-box .pm-action-btn:last-child');
  if (btn) { btn.disabled = true; btn.textContent = 'Gönderiliyor...'; }

  try {
    // Firestore'daki 'project_submissions' koleksiyonuna gönder
    // (Admin onayladıktan sonra 'projects' koleksiyonuna taşıyacak)
    await addDoc(collection(db, 'project_submissions'), {
      title,
      description: desc,
      longDescription: longDesc,
      status,
      statusLabel: statusLabels[status] || status,
      tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
      openRoles,
      submittedBy: { name, surname, email },
      submittedAt: new Date().toISOString(),
      approved: false
    });

    showToast('Projen başarıyla gönderildi! İnceleme sonrası yayına alınacak.', false);
    document.getElementById('project-modal-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  } catch (err) {
    console.error(err);
    showToast('Bir hata oluştu, lütfen tekrar deneyin.', true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Gönder'; }
  }
}
window.submitProject = submitProject;

// ============================================================
//  SCROLL OBSERVER & TOAST (orijinal koddan korundu)
// ============================================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('in'), parseInt(delay));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.dataset.delay = (i % 4) * 60;
  observer.observe(el);
});

function showToast(msg, isError) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast-msg' + (isError ? ' toast-error' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 4000);
}
window.showToast = showToast;

// Modal kapatma için orijinal event listener'lar
document.addEventListener('DOMContentLoaded', () => {
  const modalBox = document.getElementById('modal-box');
  if (modalBox) modalBox.addEventListener('click', e => e.stopPropagation());
  const projectModalBox = document.getElementById('project-modal-box');
  if (projectModalBox) projectModalBox.addEventListener('click', e => e.stopPropagation());
});

// ============================================================
//  NAV — Hamburger
// ============================================================
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

// ============================================================
//  ANN DROPDOWN
// ============================================================
function toggleAnnDropdown() {
  const wrap = document.getElementById('ann-nav-wrap');
  const faqWrap = document.getElementById('faq-nav-wrap');
  if (faqWrap) { faqWrap.classList.remove('open'); }
  const willOpen = !wrap.classList.contains('open');
  wrap.classList.toggle('open');
  document.body.style.overflow = willOpen ? 'hidden' : '';
  if (willOpen) {
    renderAnnList('hepsi');
    renderCalendar();
  }
}
window.toggleAnnDropdown = toggleAnnDropdown;

function switchAnnTab(btn, tab) {
  document.querySelectorAll('.ann-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ann-pane').forEach(p => p.style.display = 'none');
  document.getElementById('ann-pane-' + tab).style.display = '';
  if (tab === 'takvim') renderCalendar();
}
window.switchAnnTab = switchAnnTab;

function closeAnnModal(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target !== document.getElementById('ann-modal-overlay') &&
        !e.currentTarget.classList.contains('modal-close')) return;
  }
  document.getElementById('ann-modal-overlay').classList.remove('open');
  history.replaceState(null, '', window.location.pathname + window.location.search);
  document.body.style.overflow = '';
  if (_annOpenedFromCalendar) {
    _annOpenedFromCalendar = false;
    setTimeout(() => {
      const annWrap = document.getElementById('ann-nav-wrap');
      if (annWrap) {
        annWrap.classList.add('open');
        const calTab = document.querySelector('.ann-tab[data-tab="takvim"]');
        if (calTab) switchAnnTab(calTab, 'takvim');
      }
    }, 0);
  }
}
window.closeAnnModal = closeAnnModal;

// ============================================================
//  FAQ DROPDOWN
// ============================================================
function toggleFaqDropdown() {
  const faqWrap = document.getElementById('faq-nav-wrap');
  const annWrap = document.getElementById('ann-nav-wrap');
  if (annWrap) { annWrap.classList.remove('open'); }
  const willOpen = !faqWrap.classList.contains('open');
  faqWrap.classList.toggle('open');
  document.body.style.overflow = willOpen ? 'hidden' : '';
}
window.toggleFaqDropdown = toggleFaqDropdown;

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-dropdown .faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}
window.toggleFaq = toggleFaq;

// ============================================================
//  CALENDAR (ANNOUNCEMENTS_DATA kullanır)
// ============================================================
let calendarDate = new Date();

function formatAnnDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderCalendar() {
  const cal = document.getElementById('ann-calendar');
  if (!cal) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
    'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventDays = {};
  ANNOUNCEMENTS_DATA.forEach(a => {
    if (!a.date) return;
    const d = new Date(a.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventDays[day]) eventDays[day] = [];
      eventDays[day].push(a);
    }
  });

  let html = `
    <div class="cal-header">
      <button class="cal-nav" type="button" onclick="changeMonth(event,-1)">‹</button>
      <span class="cal-title">${monthNames[month]} ${year}</span>
      <button class="cal-nav" type="button" onclick="changeMonth(event,1)">›</button>
    </div>
    <div class="cal-grid">
      <div class="cal-day-label">Pt</div><div class="cal-day-label">Sa</div>
      <div class="cal-day-label">Ça</div><div class="cal-day-label">Pe</div>
      <div class="cal-day-label">Cu</div><div class="cal-day-label">Ct</div>
      <div class="cal-day-label">Pz</div>
  `;

  for (let i = 0; i < adjustedFirst; i++) html += `<div class="cal-cell empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const events = eventDays[d] || [];
    const hasEvent = events.length > 0;
    const eventIds = events.map(e => e.id).join(',');
    html += `<div class="cal-cell${isToday ? ' today' : ''}${hasEvent ? ' has-event' : ''}"
      ${hasEvent ? `onclick="openCalEvent(event,'${eventIds}')"` : ''}>
      ${d}${hasEvent ? `<span class="cal-dot"></span>` : ''}
    </div>`;
  }

  html += `</div>`;
  cal.innerHTML = html;
  renderUpcomingEvents();
}
window.renderCalendar = renderCalendar;

function changeMonth(e, dir) {
  e.stopPropagation();
  calendarDate.setMonth(calendarDate.getMonth() + dir);
  renderCalendar();
}
window.changeMonth = changeMonth;

function renderUpcomingEvents() {
  const list = document.getElementById('ann-upcoming');
  if (!list) return;
  const now = new Date();
  const upcoming = ANNOUNCEMENTS_DATA
    .filter(a => a.date && new Date(a.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  if (!upcoming.length) {
    list.innerHTML = `<div class="ann-empty">Yaklaşan etkinlik yok</div>`;
    return;
  }
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  list.innerHTML = upcoming.map(a => `
    <div class="ann-upcoming-item" onclick="openAnn('${a.id}')">
      <div class="ann-upcoming-date">
        <span class="ann-upcoming-day">${new Date(a.date).getDate()}</span>
        <span class="ann-upcoming-month">${months[new Date(a.date).getMonth()]}</span>
      </div>
      <div class="ann-upcoming-info">
        <div class="ann-upcoming-title">${a.title}</div>
        <span class="ann-type ann-type-${a.type}">${a.typeLabel || a.type}</span>
      </div>
    </div>
  `).join('');
}

function openCalEvent(e, ids) {
  e.stopPropagation();
  const idList = ids.split(',');
  openAnn(idList[0], true);
}
window.openCalEvent = openCalEvent;

// ============================================================
//  KLAVYE & DIŞARI TIKLAMA
// ============================================================
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.getElementById('overlay')?.classList.remove('open');
  document.getElementById('project-modal-overlay')?.classList.remove('open');
  document.getElementById('ann-modal-overlay')?.classList.remove('open');
  document.getElementById('ann-nav-wrap')?.classList.remove('open');
  document.getElementById('faq-nav-wrap')?.classList.remove('open');
  document.body.style.overflow = '';
});

function handleOutsideClose(e) {
  const annWrap = document.getElementById('ann-nav-wrap');
  const faqWrap = document.getElementById('faq-nav-wrap');
  if (annWrap && !annWrap.contains(e.target)) { annWrap.classList.remove('open'); }
  if (faqWrap && !faqWrap.contains(e.target)) { faqWrap.classList.remove('open'); }
  if ((!annWrap || !annWrap.classList.contains('open')) &&
      (!faqWrap || !faqWrap.classList.contains('open'))) {
    document.body.style.overflow = '';
  }
}
document.addEventListener('click', handleOutsideClose);
document.addEventListener('touchstart', handleOutsideClose, { passive: true });

window.addEventListener('popstate', () => {
  const overlay = document.getElementById('ann-modal-overlay');
  if (overlay?.classList.contains('open')) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    const annWrap = document.getElementById('ann-nav-wrap');
    if (annWrap) annWrap.classList.add('open');
    renderAnnList('hepsi');
  }
});

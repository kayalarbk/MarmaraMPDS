// ============================================================
//  MPDS — Firebase Migration Script
//  Bu dosyayı tarayıcı konsolunda VEYA Node.js ile çalıştırın.
//  Mevcut JS verilerini Firestore'a ilk kez yükler.
// ============================================================

// 1) firebase-config.js dosyanızdaki config'i buraya yapıştırın:
const firebaseConfig = {
  apiKey: "AIzaSyAEby7m7ij-SPjmO0CMvF0ypuAL1_IXW4c",
  authDomain: "marmarampds2026.firebaseapp.com",
  projectId: "marmarampds2026",
  storageBucket: "marmarampds2026.firebasestorage.app",
  messagingSenderId: "493280174451",
  appId: "1:493280174451:web:6172ed6dc279afb19ae506",
  measurementId: "G-NV4F7FQSG1"
};

// ============================================================
//  MEVCUT VERİLER (projects-data.js + announcements-data.js
//  + script.js içindeki members objesi)
// ============================================================

const SEED_MEMBERS = [
  {
    id: 'm1',
    initials: 'BK',
    name: 'BARIŞ KAYA',
    role: 'Başkan',
    bio: "MPDS'in kurucu başkanı. Kulübün genel vizyonunu, stratejik yönünü ve dış temsilini üstleniyor. Web altyapısı ve arayüz geliştirmeden sorumlu.",
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'UI/UX'],
    email: 'kayalarbk2004@gmail.com',
    avatarPath: 'assets/team/baris-kaya.png',
    order: 2
  },
  {
    id: 'm2',
    initials: 'FY',
    name: 'FURKAN YILMAZ',
    role: 'Başkan Yardımcısı',
    bio: "Başkan yardımcısı olarak proje süreçlerini ve ekip koordinasyonunu yönetiyor. Backend altyapısı ve veri sistemleri tarafında çalışıyor.",
    skills: ['Node.js', 'Python', 'PostgreSQL', 'REST API', 'Docker'],
    email: 'frknyilm4z@gmail.com',
    avatarPath: 'assets/team/furkan-yilmaz.jpg',
    order: 1
  },
  {
    id: 'm3',
    initials: 'SO',
    name: 'SALİH OĞUZ',
    role: 'Kulüp Sekreteri',
    bio: "Kulüp sekreteryasını yürütüyor; etkinlik organizasyonu, üye kayıtları ve hoca-öğrenci iletişim süreçlerinden sorumlu.",
    skills: ['Etkinlik Yönetimi', 'Topluluk', 'İletişim', 'Akademik İşler'],
    email: 'salih@marmarampds.com',
    avatarPath: 'assets/team/salih-oguz.jpg',
    order: 3
  }
];

const SEED_PROJECTS = [
  {
    id: 'otonom-drone',
    title: 'Otonom Drone Platformu',
    status: 'ekip-ariyor',
    statusLabel: 'Ekip Arıyor',
    cardSize: 'featured',
    iconSvg: '<path d="M12 2L8 6H4v4l-2 2 2 2v4h4l4 4 4-4h4v-4l2-2-2-2V6h-4l-4-4z"/><circle cx="12" cy="12" r="3"/>',
    description: 'MAVLink protokolü ve ArduPilot tabanlı, gerçek zamanlı görev planlama ve otonom navigasyon yetkinliklerine sahip çok rotorlu drone platformu. TEKNOFEST 2026 hedefli.',
    longDescription: "MPDS'in amiral gemisi projesi olan Otonom Drone Platformu, kampüs içi gözetleme, haritalama ve paket teslimatı senaryolarını test etmek üzere tasarlanmış çok rotorlu bir İHA sistemidir. ArduPilot ve Pixhawk tabanlı uçuş kontrol sistemi üzerine inşa edilen platform; gerçek zamanlı telemetri, kara istasyonu entegrasyonu ve otonom görev planlama modülleri içermektedir.",
    tags: ['ArduPilot', 'MAVLink', 'Pixhawk', 'C++', 'Python', 'ROS', 'Gömülü Sistem'],
    goals: [
      'Otonom kalkış, navigasyon ve iniş görevlerini tamamlayabilen stabil bir platform geliştirmek',
      'TEKNOFEST 2026 İHA kategorisine eksiksiz teknik dosyayla başvurmak',
      'Açık kaynak ArduPilot ekosistemine katkı sağlayacak modüller üretmek'
    ],
    team: [
      { initials: 'BK', name: 'Barış Kaya', role: 'Proje Lideri', filled: true },
      { initials: 'FY', name: 'Furkan Yılmaz', role: 'Sistem Mimarisi', filled: true },
      { initials: 'SO', name: 'Salih Oğuz', role: 'Operasyon & Test', filled: true }
    ],
    openRoles: [
      { title: 'Gömülü Yazılım Geliştirici', desc: 'C/C++ ile Pixhawk üzerinde düşük seviye firmware geliştirme ve MAVLink protokol entegrasyonu yapabilecek geliştirici' },
      { title: 'ROS Geliştirici', desc: "Robot Operating System üzerinde otonom navigasyon ve görev planlama node'ları yazabilecek geliştirici" },
      { title: 'Donanım & Elektronik', desc: 'PCB tasarımı, sensör entegrasyonu ve güç elektroniği konularında deneyimli, drone donanım assembly yapabilecek üye' },
      { title: 'Görüntü İşleme', desc: 'OpenCV veya YOLO tabanlı nesne tespiti ve gerçek zamanlı kamera akışı işleyebilecek Python/C++ geliştirici' }
    ]
  },
  {
    id: 'akilli-kampus',
    title: 'Akıllı Kampüs Asistanı',
    status: 'ekip-ariyor',
    statusLabel: 'Ekip Arıyor',
    cardSize: 'featured',
    iconSvg: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    description: 'Marmara öğrencileri için ders programı, kafeterya menüsü, etkinlik takvimi ve kütüphane doluluğunu tek arayüzde sunan mobil uygulama.',
    longDescription: 'Akıllı Kampüs Asistanı, Marmara Üniversitesi öğrencilerinin günlük üniversite hayatını tek bir uygulamada toplayan kapsamlı bir mobil çözümdür.',
    tags: ['React Native', 'Node.js', 'PostgreSQL', 'REST API', 'Figma'],
    goals: [
      'Marmara öğrencilerinin günlük kampüs rutinini tek uygulamada toplamak',
      'Açık akademik verilere mobil erişim sağlamak',
      'TEKNOFEST 2026 Eğitim Teknolojileri kategorisine başvurmak'
    ],
    team: [
      { initials: 'AK', name: 'Ahmet Kaya', role: 'Proje Sahibi', filled: true },
      { initials: 'ZD', name: 'Zeynep Demir', role: 'Backend Developer', filled: true }
    ],
    openRoles: [
      { title: 'Mobile Developer', desc: 'React Native deneyimi olan, iOS/Android UI implementasyonu yapabilecek geliştirici' },
      { title: 'UI/UX Designer', desc: 'Figma ile prototip ve kullanıcı akışı tasarlayabilecek tasarımcı' },
      { title: 'Backend Developer', desc: 'Node.js + PostgreSQL ile API tasarımı yapabilecek bir geliştirici daha' }
    ]
  },
  {
    id: 'iot-sera',
    title: 'IoT Sera İzleme Sistemi',
    status: 'mentor-ariyor',
    statusLabel: 'Mentor Arıyor',
    cardSize: 'medium',
    iconSvg: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>',
    description: 'STM32 ve LoRa kullanılarak tasarlanmış, sıcaklık-nem-toprak nemi okuyabilen bir prototip.',
    longDescription: 'Tarımsal üretimde kullanılabilecek düşük maliyetli, uzun menzilli (LoRa) ve düşük güç tüketimli bir sera izleme sistemi.',
    tags: ['STM32', 'LoRa', 'Embedded C', 'Sensör', 'Tarım Teknolojisi'],
    goals: [
      'Düşük maliyetli sera izleme prototipi geliştirmek',
      'TÜBİTAK 2209-A için bilimsel makale altyapısı hazırlamak',
      'Mentor desteğiyle prototipi saha testi seviyesine çıkarmak'
    ],
    team: [
      { initials: 'MT', name: 'Mehmet Tunç', role: 'Donanım Tasarımı', filled: true },
      { initials: 'EK', name: 'Elif Kara', role: 'Firmware (Embedded)', filled: true }
    ],
    openRoles: [
      { title: 'Akademik Danışman', desc: 'Gömülü sistemler veya tarım teknolojileri alanında çalışan bir öğretim üyesi' },
      { title: 'Embedded Mentor', desc: 'STM32 ve LoRa konusunda deneyimli, kod inceleme ve mimari önerileri sunabilecek kıdemli üye' }
    ]
  },
  {
    id: 'ai-ders-asistani',
    title: 'Yapay Zeka Destekli Ders Notu Asistanı',
    status: 'fikir-asamasi',
    statusLabel: 'Fikir Aşaması',
    cardSize: 'small',
    iconSvg: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6l-1 3H9l-1-3c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z"/>',
    description: 'PDF ders notlarından özet ve quiz üretebilen bir AI asistanı.',
    longDescription: 'Öğrencilerin yüklediği PDF ders notlarından otomatik özet, anahtar kavram listesi ve quiz üretebilen bir yapay zeka asistanı.',
    tags: ['LLM', 'Python', 'RAG', 'Vector DB', 'NLP'],
    goals: [
      'Türkçe ders notlarına özel optimize edilmiş bir özet/quiz aracı geliştirmek',
      'Açık kaynak yayınlanarak topluluk katkısına açmak',
      "Eğitim teknolojileri alanında MPDS'in ilk amiral gemisi projesi olmak"
    ],
    team: [],
    openRoles: [
      { title: 'Proje Sahibi / Lider', desc: 'Projeyi sahiplenecek, teknoloji yığını kararını verecek ve ekibi yönetecek bir kurucu' },
      { title: 'ML/NLP Geliştirici', desc: "LLM'lerle çalışma deneyimi olan veya öğrenmeye istekli bir geliştirici" },
      { title: 'Backend Developer', desc: 'Python + FastAPI ile RAG pipeline kurabilecek bir geliştirici' },
      { title: 'Frontend Developer', desc: 'PDF yükleme ve sohbet arayüzü tasarlayabilecek bir geliştirici' }
    ]
  },
  {
    id: 'turkce-nlp',
    title: 'Açık Kaynak Türkçe NLP Kütüphanesi',
    status: 'ekip-ariyor',
    statusLabel: 'Ekip Arıyor',
    cardSize: 'small',
    iconSvg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    description: 'Türkçe metin işleme için modüler, hafif ve eğitim odaklı bir kütüphane.',
    longDescription: 'Türkçe doğal dil işleme için modüler ve eğitim odaklı bir Python kütüphanesi.',
    tags: ['Python', 'NLP', 'Open Source', 'Linguistics', 'Education'],
    goals: [
      'Türkçe NLP için modern ve modüler bir kütüphane sunmak',
      'Detaylı Türkçe dokümantasyonla öğrenciye eğitim kaynağı olmak',
      'GitHub üzerinde aktif bir açık kaynak topluluğu kurmak'
    ],
    team: [
      { initials: 'OS', name: 'Onur Sarı', role: 'Proje Sahibi', filled: true }
    ],
    openRoles: [
      { title: 'Python Geliştirici', desc: 'Tokenization ve morfoloji modüllerini geliştirecek katkıcılar' },
      { title: 'Dilbilim Danışmanı', desc: 'Türk Dili veya Dilbilim bölümünden lisans/yüksek lisans öğrencisi' },
      { title: 'Test & Dokümantasyon', desc: 'Test yazımı ve dokümantasyon hazırlama ile katkı sağlayacak biri' }
    ]
  }
];

const SEED_ANNOUNCEMENTS = [
  {
    id: 'teknofest-basvuru',
    title: 'TEKNOFEST 2026 Başvuruları Açıldı',
    date: '2026-05-10',
    type: 'haber',
    typeLabel: 'Haber',
    summary: 'TEKNOFEST 2026 İHA ve Eğitim Teknolojileri kategorisi başvuruları başladı.',
    content: "TEKNOFEST 2026 başvuru portalı resmi olarak açılmıştır. MPDS bünyesindeki Otonom Drone ve Akıllı Kampüs Asistanı projeleri ilgili kategorilere başvuru yapmayı planlıyor. Başvuru son tarihi 15 Haziran 2026."
  },
  {
    id: 'yeni-uye-toplantisi',
    title: 'Mayıs Ayı Yeni Üye Toplantısı',
    date: '2026-05-20',
    type: 'etkinlik',
    typeLabel: 'Etkinlik',
    summary: "20 Mayıs Çarşamba günü saat 18:00'de Marmara Üniversitesi Teknoloji Fakültesi B101'de yeni üye tanışma toplantısı düzenlenecek.",
    content: "MPDS olarak her ay düzenlediğimiz yeni üye toplantısının Mayıs ayı etkinliği 20 Mayıs 2026 Çarşamba günü saat 18:00'de Teknoloji Fakültesi B101 nolu derslikte gerçekleşecek."
  },
  {
    id: 'drone-prototip',
    title: 'Otonom Drone Prototipi İlk Uçuş Testi',
    date: '2026-05-05',
    type: 'proje',
    typeLabel: 'Proje',
    summary: 'Otonom Drone Platformu ekibi, ArduPilot tabanlı prototiplerinin ilk kapalı alan uçuş testini başarıyla tamamladı.',
    content: "Otonom Drone Platformu ekibi, yaklaşık 3 aylık çalışmanın ardından ArduPilot tabanlı prototiplerini kapalı alanda ilk uçuşa çıkarmayı başardı."
  },
  {
    id: 'tubitak-2209',
    title: 'TÜBİTAK 2209-A Başvuru Rehberi Yayınlandı',
    date: '2026-04-28',
    type: 'haber',
    typeLabel: 'Haber',
    summary: 'IoT Sera projesinin TÜBİTAK 2209-A başvurusu için hazırladığı rehber döküman tüm MPDS üyeleriyle paylaşıldı.',
    content: "IoT Sera İzleme Sistemi ekibinin TÜBİTAK 2209-A başvurusu için hazırladığı süreç rehberi, tüm MPDS üyeleri için faydalı olabileceği düşünülerek paylaşılmıştır."
  },
  {
    id: 'teknofest-son-tarih',
    title: 'TEKNOFEST 2026 — Başvuru Son Tarihi',
    date: '2026-06-30',
    type: 'etkinlik',
    typeLabel: 'Etkinlik',
    summary: 'TEKNOFEST 2026 İHA ve Robotik kategorileri için başvuru son tarihi.',
    content: "TEKNOFEST 2026 başvuruları için son tarih 30 Haziran 2026. Otonom Drone ve diğer ilgili projelerimiz bu kategoriye başvuracak."
  },
  {
    id: 'tubitak-donem',
    title: 'TÜBİTAK 2209-A — Başvuru Dönemi',
    date: '2026-07-15',
    type: 'etkinlik',
    typeLabel: 'Etkinlik',
    summary: 'TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri başvuru dönemi açılıyor.',
    content: "TÜBİTAK 2209-A programı kapsamında proje başvuruları Temmuz ayında açılacak."
  }
];

// ============================================================
//  MIGRATION FONKSİYONU — Tarayıcı konsolunda çalıştırın
// ============================================================
async function runMigration() {
  // Firebase SDK'nın yüklü olduğunu varsayıyoruz
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
  const { getFirestore, doc, setDoc, collection, writeBatch } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('🚀 Migration başlıyor...');

  // --- Üyeler ---
  const memberBatch = writeBatch(db);
  for (const member of SEED_MEMBERS) {
    const ref = doc(db, 'members', member.id);
    memberBatch.set(ref, member);
  }
  await memberBatch.commit();
  console.log(`✅ ${SEED_MEMBERS.length} üye aktarıldı`);

  // --- Projeler ---
  const projectBatch = writeBatch(db);
  for (const project of SEED_PROJECTS) {
    const ref = doc(db, 'projects', project.id);
    projectBatch.set(ref, project);
  }
  await projectBatch.commit();
  console.log(`✅ ${SEED_PROJECTS.length} proje aktarıldı`);

  // --- Duyurular ---
  const annBatch = writeBatch(db);
  for (const ann of SEED_ANNOUNCEMENTS) {
    const ref = doc(db, 'announcements', ann.id);
    annBatch.set(ref, ann);
  }
  await annBatch.commit();
  console.log(`✅ ${SEED_ANNOUNCEMENTS.length} duyuru aktarıldı`);

  console.log('🎉 Migration tamamlandı!');
}

// Tarayıcı konsolunda: runMigration()

const PROJECTS = {

  'otonom-drone': {
    title: 'Otonom Drone Platformu',
    status: 'ekip-ariyor',
    statusLabel: 'Ekip Arıyor',
    cardSize: 'featured',
    iconSvg: '<path d="M12 2L8 6H4v4l-2 2 2 2v4h4l4 4 4-4h4v-4l2-2-2-2V6h-4l-4-4z"/><circle cx="12" cy="12" r="3"/>',
    description: 'MAVLink protokolü ve ArduPilot tabanlı, gerçek zamanlı görev planlama ve otonom navigasyon yetkinliklerine sahip çok rotorlu drone platformu. TEKNOFEST 2026 hedefli.',
    longDescription: 'MPDS\'in amiral gemisi projesi olan Otonom Drone Platformu, kampüs içi gözetleme, haritalama ve paket teslimatı senaryolarını test etmek üzere tasarlanmış çok rotorlu bir İHA sistemidir. ArduPilot ve Pixhawk tabanlı uçuş kontrol sistemi üzerine inşa edilen platform; gerçek zamanlı telemetri, kara istasyonu entegrasyonu ve otonom görev planlama modülleri içermektedir. Proje, donanım-yazılım ko-tasarımı pratiği kazandırmayı ve ekip üyelerini TEKNOFEST İHA yarışması sürecine hazırlamayı hedeflemektedir.',
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
      { title: 'ROS Geliştirici', desc: 'Robot Operating System üzerinde otonom navigasyon ve görev planlama node\'ları yazabilecek geliştirici' },
      { title: 'Donanım & Elektronik', desc: 'PCB tasarımı, sensör entegrasyonu ve güç elektroniği konularında deneyimli, drone donanım assembly yapabilecek üye' },
      { title: 'Görüntü İşleme', desc: 'OpenCV veya YOLO tabanlı nesne tespiti ve gerçek zamanlı kamera akışı işleyebilecek Python/C++ geliştirici' }
    ]
  },

  'akilli-kampus': {
    title: 'Akıllı Kampüs Asistanı',
    status: 'ekip-ariyor',
    statusLabel: 'Ekip Arıyor',
    cardSize: 'featured',
    iconSvg: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    description: 'Marmara öğrencileri için ders programı, kafeterya menüsü, etkinlik takvimi ve kütüphane doluluğunu tek arayüzde sunan mobil uygulama. Akademik veri entegrasyonu ile.',
    longDescription: 'Akıllı Kampüs Asistanı, Marmara Üniversitesi öğrencilerinin günlük üniversite hayatını tek bir uygulamada toplayan kapsamlı bir mobil çözümdür. Ders programı senkronizasyonu, gerçek zamanlı kafeterya menüsü, kütüphane doluluk takibi ve kampüs etkinlik bildirimleri sunar. Backend tarafında Marmara üniversitesinin açık verileriyle entegre çalışacak, frontend tarafında ise iOS ve Android için React Native kullanılacak.',
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

  'iot-sera': {
    title: 'IoT Sera İzleme Sistemi',
    status: 'mentor-ariyor',
    statusLabel: 'Mentor Arıyor',
    cardSize: 'medium',
    iconSvg: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>',
    description: 'STM32 ve LoRa kullanılarak tasarlanmış, sıcaklık-nem-toprak nemi okuyabilen bir prototip. Akademik danışman ve gömülü sistem mentoru aranıyor.',
    longDescription: 'Tarımsal üretimde kullanılabilecek düşük maliyetli, uzun menzilli (LoRa) ve düşük güç tüketimli bir sera izleme sistemi. STM32 mikrodenetleyicisi üzerinde geliştirilen prototipte sıcaklık, nem ve toprak nemi sensörleri bulunmakta. Şu anda donanım ve temel firmware hazır, ancak akademik bir danışmanın geri bildirimine ve gömülü sistem mentoruna ihtiyaç duyuyoruz.',
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

  'ai-ders-asistani': {
    title: 'Yapay Zeka Destekli Ders Notu Asistanı',
    status: 'fikir-asamasi',
    statusLabel: 'Fikir Aşaması',
    cardSize: 'small',
    iconSvg: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6l-1 3H9l-1-3c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z"/>',
    description: 'PDF ders notlarından özet ve quiz üretebilen bir AI asistanı. Henüz fikir aşamasında — kurucu ekip ve teknoloji seçimi tartışmaya açık.',
    longDescription: 'Öğrencilerin yüklediği PDF ders notlarından otomatik özet, anahtar kavram listesi ve quiz üretebilen bir yapay zeka asistanı. RAG (Retrieval-Augmented Generation) mimarisi düşünülüyor. Şu an proje sadece bir fikir — kurucu ekip arıyor ve teknoloji yığını da müzakereye açık. Local LLM mi, API mi tercih edileceği, hangi vector database\'in kullanılacağı gibi temel kararlar henüz verilmedi.',
    tags: ['LLM', 'Python', 'RAG', 'Vector DB', 'NLP'],
    goals: [
      'Türkçe ders notlarına özel optimize edilmiş bir özet/quiz aracı geliştirmek',
      'Açık kaynak yayınlanarak topluluk katkısına açmak',
      'Eğitim teknolojileri alanında MPDS\'in ilk amiral gemisi projesi olmak'
    ],
    team: [],
    openRoles: [
      { title: 'Proje Sahibi / Lider', desc: 'Projeyi sahiplenecek, teknoloji yığını kararını verecek ve ekibi yönetecek bir kurucu' },
      { title: 'ML/NLP Geliştirici', desc: 'LLM\'lerle çalışma deneyimi olan veya öğrenmeye istekli bir geliştirici' },
      { title: 'Backend Developer', desc: 'Python + FastAPI ile RAG pipeline kurabilecek bir geliştirici' },
      { title: 'Frontend Developer', desc: 'PDF yükleme ve sohbet arayüzü tasarlayabilecek bir geliştirici' }
    ]
  },

  'turkce-nlp': {
    title: 'Açık Kaynak Türkçe NLP Kütüphanesi',
    status: 'ekip-ariyor',
    statusLabel: 'Ekip Arıyor',
    cardSize: 'small',
    iconSvg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    description: 'Türkçe metin işleme için modüler, hafif ve eğitim odaklı bir kütüphane. Açık kaynak katkı yapmak isteyenler aranıyor.',
    longDescription: 'Türkçe doğal dil işleme için modüler ve eğitim odaklı bir Python kütüphanesi. Tokenization, lemmatization, POS tagging gibi temel NLP görevlerini Türkçe morfolojisini gözeterek sunmayı hedefliyor. Mevcut çözümlerin (Zemberek vb.) güzel yanlarını alıp daha modern bir API ve daha iyi dokümantasyon sunmayı amaçlıyor. Açık kaynak olarak GitHub üzerinde geliştirilecek.',
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

};

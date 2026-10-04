#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

id_ui = {
    "meta": {"code": "id", "languageName": "Indonesian", "nativeName": "Bahasa Indonesia", "rtl": False},
    "nav": {
        "home": "Beranda", "timeline": "Garis Waktu Masa Depan", "tech": "Teknologi Masa Depan", "places": "Kota & Pemukiman",
        "projects": "Proyek Saya", "advertise": "Pasang / Ajukan", "about": "Tentang", "contact": "Hubungi Kami",
        "assistant": "Asisten AI", "language": "Bahasa", "menu": "Buka menu navigasi", "close": "Tutup menu navigasi",
        "brandSubtitle": "TEKNOLOGI // 2030-2050", "menuSysHeader": "MENU SISTEM", "locationDomain": "SIMPUL: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "SISTEM//SIMPUL.2030-2050", "online": "SEMUA SISTEM AKTIF",
        "headline": "Masa depan tidak datang dengan sendirinya. Kita merancangnya bersama.",
        "subtitle": "Cetak biru sinematik inovasi manusia, mesin kognitif, koloni orbital, dan habitat berkelanjutan dari 2030 hingga 2050. Dibuat oleh Aliya Khan.",
        "exploreCta": "Jelajahi 2030 2050", "projectsCta": "Lihat Proyek Saya",
        "coordinates": "LOKASI: 28.6139° U, 77.2090° T // MESIN AKTIF", "timelineSpan": "RENTANG 2030 — 2050",
        "liveTelemetry": "TELEMETRI: NOMINAL", "scrollDown": "Gulir ke bawah untuk menjelajahi garis waktu",
        "imageAlt": "Pemandangan sinematik kota metropolitan futuristik 2030 2050"
    },
    "timeline": {
        "sectionTag": "PETA_KRONOLOGI // 2030 -> 2050", "title": "Kronik Inovasi Peradaban",
        "subtitle": "Dari kecerdasan tepi yang hadir di mana-mana pada 2030 hingga industri berat antariksa pada 2050.",
        "chronoMap": "CETAK BIRU KRONOLOGIS", "eraHeading": "CAKRAWALA ERA", "storyTitle": "Sehari di Era Ini",
        "breakthroughsTitle": "Tonggak Teknologi Utama", "viewEraDetails": "Buka Berkas Era",
        "jumpToEra": "Lompat ke Era Ini", "statusPrefix": "STATUS SISTEM", "eraBreakthroughsHeading": "Terobosan",
        "specificationsCount": "Spesifikasi"
    },
    "tech": {
        "sectionTag": "INDEKS_SISTEM // 42 BIDANG", "title": "Katalog Teknologi Masa Depan",
        "subtitle": "Cetak biru komprehensif dan mekanisme ilmiah di 7 perbatasan teknologi fundamental.",
        "systemsIndex": "INDEKS KATALOG", "howItWorksLabel": "CARA KERJA SISTEM",
        "architectureMechanics": "ARSITEKTUR TEKNIS & MEKANIKA", "underlyingMechanism": "PRINSIP DASAR FISIKA",
        "searchPlaceholder": "Cari teknologi, sistem, atau terobosan ilmiah...", "searchNoResults": "Tidak ada sistem teknologi yang cocok.",
        "filterAll": "Semua Bidang", "modalClose": "Tutup Berkas", "viewDossier": "Lihat Berkas Teknis",
        "yearLabel": "TAHUN", "statusLabel": "STATUS SISTEM", "activeStatus": "SPESIFIKASI AKTIF", "promptLabel": "PETUNJUK",
        "categories": {
            "all": "Semua Bidang", "ai": "AI Masa Depan", "vehicles": "Kendaraan & Mobilitas", "devices": "Perangkat & Bionik",
            "homeWork": "Hunian & Kerja", "health": "Kesehatan & Biologi", "energy": "Energi & Iklim", "space": "Luar Angkasa"
        }
    },
    "places": {
        "sectionTag": "INDEKS_HABITAT // 2030-2050", "title": "Kartu Pos Kota & Pemukiman",
        "subtitle": "Dokumentasi visual fotorealistik dan berkas infrastruktur peradaban baru di Bumi dan orbit antariksa.",
        "horizonLabel": "CAKRAWALA", "aDayInPlace": "Sehari di Tempat Ini", "infrastructureLabel": "Infrastruktur Kunci",
        "viewLocation": "Periksa Tata Letak", "promptLabel": "PETUNJUK"
    },
    "projects": {
        "sectionTag": "PROYEK PENDIRI // ALIYA KHAN", "title": "Proyek Saya",
        "subtitle": "Sistem perangkat lunak aktif, arsip riset, dan arsitektur rekayasa yang dikembangkan oleh Aliya Khan.",
        "tabs": {"live": "Sistem Siap Pakai", "inProgress": "Tahap Rekayasa", "futureIdeas": "Gagasan Masa Depan"},
        "visit": "Buka Tautan Sistem", "emptyLive": "Belum ada sistem publik yang aktif saat ini. Peluncuran baru akan dipublikasikan di sini.",
        "emptyInProgress": "Cetak biru rekayasa aktif akan dicatat di sini seiring pencapaian target.",
        "emptyIdeas": "Proposal riset teoretis akan dikatalogkan di sini.",
        "pendingNotice": "Proyek ditinjau dan disinkronkan langsung oleh Aliya Khan."
    },
    "advertise": {
        "sectionTag": "PENGAJUAN_PROYEK // PENDAFTARAN", "title": "Pasang / Ajukan Proyek",
        "subtitle": "Kirimkan inovasi teknologi atau inisiatif berkelanjutan untuk ditinjau langsung oleh Aliya Khan.",
        "reviewNotice": "Setiap pengajuan dievaluasi langsung oleh Aliya Khan. Pesan promosi tidak relevan akan ditolak.",
        "pricingNote": "Penempatan dan ketentuan kerja sama akan dikomunikasikan melalui korespondensi langsung.",
        "form": {
            "name": "Nama Lengkap", "email": "Alamat Email Langsung", "projectName": "Judul Proyek / Lembaga",
            "projectLink": "Tautan Sistem / Dokumen Teknis", "category": "Bidang Keahlian", "selectCategory": "Pilih bidang...",
            "budget": "Perkiraan Anggaran / Tahap Pendanaan", "budgetPlaceholder": "misal 10.000$ - 50.000$, Dana Riset",
            "description": "Sinopsis Proyek & Terobosan Inti", "submitBtn": "Kirim Proyek untuk Peninjauan",
            "sending": "Mengenkripsi dan mengirimkan...", "sentSuccess": "Pengajuan berhasil dikirim. Aliya Khan akan meninjau berkas Anda.",
            "sendError": "Pengiriman gagal. Silakan kirimkan email langsung."
        }
    },
    "about": {
        "sectionTag": "KEPALA ARSITEK // BERKAS", "title": "Tentang — Aliya Khan",
        "subtitle": "Pendiri, Arsitek Perangkat Lunak, dan Peneliti Sistem di Hayaati Web Technology.",
        "ownerName": "Aliya Khan", "architectTitle": "PENDIRI & KEPALA ARSITEK",
        "leadArchitect": "Memimpin arsitektur sistem masa depan dan infrastruktur digital berperforma tinggi.",
        "bioPlaceholder": "Aliya Khan adalah arsitek perangkat lunak dan peneliti di persimpangan sistem terdistribusi, kecerdasan kognitif buatan, dan habitat manusia jangka panjang. Hayaati Web Technology adalah platform mandiri untuk menyajikan lompatan teknologi manusia.",
        "contactDirect": "Kontak Langsung", "photoAlt": "Aliya Khan, Pendiri & Kepala Arsitek"
    },
    "contact": {
        "sectionTag": "SALURAN AMAN // TERENKRIPSI", "title": "Komunikasi Langsung",
        "subtitle": "Kirimkan pertanyaan teknis mendalam, kemitraan riset, atau proposal kolaborasi rekayasa.",
        "emailLabel": "Saluran Resmi Korespondensi", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "Nama Lengkap Anda", "email": "Alamat Email Anda", "message": "Pesan / Substansi Pertanyaan",
            "submitBtn": "Kirim Pesan Terenkripsi", "sending": "Mengirimkan...",
            "sentSuccess": "Pesan Anda berhasil diterima. Kami akan merespons melalui saluran resmi.",
            "sendError": "Gagal mengirim pesan. Silakan hubungi kami langsung via email.",
            "placeholderName": "Masukkan nama lengkap...", "placeholderEmail": "Masukkan alamat email...",
            "placeholderMessage": "Tuliskan pertanyaan atau proposal teknis Anda..."
        }
    },
    "assistant": {
        "buttonLabel": "Asisten AI", "panelTitle": "ANTARMUKA KOGNITIF HAYAATI", "subtitle": "CAKRAWALA KOGNITIF // 2030-2050",
        "welcomeMessage": "Halo! Saya asisten Hayaati. Tanyakan apa saja tentang visi teknologi masa depan atau pilih topik untuk dieksplorasi.",
        "chips": ["Seperti apa peradaban pada tahun 2030?", "Tunjukkan teknologi kesehatan masa depan", "Ceritakan tentang Hayaati dan Aliya Khan"],
        "inputPlaceholder": "Tanyakan tentang lini masa 2030-2050, teknologi, atau tata kota...",
        "sendBtn": "Kirim", "retryBtn": "Coba Lagi", "voiceBtn": "Mulai Koneksi Suara", "voiceStopBtn": "Akhiri Sesi Suara",
        "voiceListening": "Mendengarkan...", "voiceSpeaking": "Hayaati sedang berbicara...", "voiceConnecting": "Menghubungkan suara...",
        "voiceUnsupported": "Akses mikrofon tidak didukung pada peramban ini.", "voiceNotAvailableLang": "Percakapan suara belum diaktifkan dalam bahasa ini. Anda dapat berbincang lewat teks.",
        "rateLimitBanner": "Batas permintaan per pengunjung aktif.", "talkTo": "Bicara dengan Hayaati", "typeInstead": "Gunakan teks",
        "returnToOrb": "Kembali ke Bola Suara", "muteMic": "Bisukan mikrofon", "unmuteMic": "Nyalakan mikrofon",
        "micLabel": "Mikrofon", "mutedLabel": "Bisu", "endSession": "Selesai", "endLabel": "Tutup",
        "userTag": "ANDA", "assistantTag": "HAYAATI", "cognitiveLink": "TAUTAN KOGNITIF LANGSUNG",
        "orb": {"ready": "Siap", "listening": "Mendengarkan...", "thinking": "Memproses...", "speaking": "Menjawab...", "tapToStart": "Ketuk Mulai untuk berbicara", "start": "Mulai"},
        "errors": {
            "quotaReached": "Asisten telah mencapai kapasitas komputasi sementara. Silakan coba lagi nanti.",
            "serverBusy": "Layanan sedang sibuk. Silakan coba beberapa saat lagi.",
            "networkError": "Koneksi jaringan terputus. Periksa sambungan internet Anda.",
            "micBlocked": "Akses mikrofon ditolak. Berikan izin mikrofon pada peramban.",
            "sessionEnded": "Sesi suara selesai (mencapai batas durasi). Anda dapat memulai sesi baru kapan saja.",
            "genericError": "Terjadi gangguan saat memproses. Silakan klik Coba Lagi."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Didirikan oleh Aliya Khan.",
        "disclaimer": "Hayaati Web Technology adalah repositori riset spekulatif mandiri. Semua proyeksi merupakan hipotesis rekayasa untuk 2030 2050.",
        "liveDomainLabel": "DOMAIN RESMI", "quickLinks": "Indeks Navigasi", "systemDesignation": "MESIN INTI HAYAATI // TERVERIFIKASI", "allRightsReserved": "Hak cipta dilindungi undang-undang."
    },
    "common": {
        "year": "Tahun", "status": "Kondisi", "operational": "Beroperasi", "close": "Tutup", "back": "Kembali",
        "retry": "Coba lagi", "error": "Kesalahan", "success": "Berhasil", "loading": "Memuat..."
    },
    "languageSelector": {
        "selectLanguage": "Pilih bahasa tampilan", "dialogTitle": "Pemilih Bahasa",
        "searchPlaceholder": "Cari bahasa (misal Bahasa Indonesia, English, Français)...", "languagesCountSuffix": "bahasa"
    },
    "imageSlot": {"opticalChannel": "SALURAN OPTIK", "framePending": "MEMPROSES GAMBAR", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "KESALAHAN 404 // SEKTOR TIDAK DITEMUKAN", "title": "Sinyal Hilang di Luar Angkasa",
        "description": "Koordinat yang diminta tidak cocok dengan subsistem atau habitat masa depan yang terdaftar.", "returnBtn": "Kembali ke Komando Orbital"
    }
}

id_content = json.loads(json.dumps(en_content))
id_content["eras"]["era-2030"]["title"] = "Pondasi Kognitif"
id_content["eras"]["era-2030"]["yearLabel"] = "ZAMAN // 2030"
id_content["eras"]["era-2030"]["story"] = "Pagi hari dimulai dengan kecerdasan sintetis lingkungan yang telah menyeimbangkan jaringan listrik saat Anda tidur. Kota berdenyut dengan kendaraan ulang-alik listrik yang sunyi dan kapsul pengiriman bawah tanah."
id_content["eras"]["era-2030"]["breakthroughs"] = [
    "Asisten pembelajaran mesin di perangkat tanpa latensi awan untuk ritme hidup sehari-hari",
    "Paket baterai litium-logam padat yang mendukung transportasi kota hingga 1.000 km",
    "Sertifikasi komersial taksi udara perkotaan nirawak di koridor metropolitan utama"
]
id_content["eras"]["era-2030"]["bannerAlt"] = "Pemandangan sinematik kota metropolitan ramah lingkungan 2030 dengan jalur transit bersih"
id_content["eras"]["era-2030"]["bannerPrompt"] = "Foto panorama sinematik kota pesisir ramah lingkungan 2030 saat fajar, gedung kaca surya, kendaraan listrik sunyi, taman vertikal, resolusi 8k."

id_content["eras"]["era-2035"]["title"] = "Sintesis Biomekanis"
id_content["eras"]["era-2035"]["yearLabel"] = "ZAMAN // 2035"
id_content["eras"]["era-2035"]["story"] = "Antarmuka saraf memungkinkan pengendalian sistem digital secara intuitif lewat pikiran. Pengobatan pencegahan bekerja 24 jam di tingkat sel melalui sensor nano biokompatibel."
id_content["eras"]["era-2035"]["breakthroughs"] = [
    "Sensor optoelektronik subdermal untuk pemantauan metabolik berkelanjutan",
    "Dekoder korteks motorik non-invasif untuk memulihkan mobilitas fisik secara alami",
    "Bioreaktor miselium dan mikroba untuk menghasilkan material bangunan ramah lingkungan yang kokoh"
]
id_content["eras"]["era-2035"]["bannerAlt"] = "Pemandangan sinematik kota vertikal dengan kubah biologi dan jalur kereta maglev"
id_content["eras"]["era-2035"]["bannerPrompt"] = "Pemandangan sinematik kota vertikal 2035 saat senja dengan tabung maglev dan kubah aeroponik, resolusi 8k."

id_content["eras"]["era-2050"]["title"] = "Cakrawala Planet dan Orbit"
id_content["eras"]["era-2050"]["yearLabel"] = "ZAMAN // 2050"
id_content["eras"]["era-2050"]["story"] = "Industri manufaktur berat telah dipindahkan keluar dari biosfer Bumi ke stasiun pemurnian gravitasi mikro di orbit. Energi fusi dan ekonomi sirkular memulihkan keseimbangan laut dan atmosfer Bumi."
id_content["eras"]["era-2050"]["breakthroughs"] = [
    "Pembangkit fusi nuklir komersial yang memasok listrik bersih tanpa henti",
    "Pangkalan tetap di kutub selatan Bulan untuk ekstraksi es air dan bahan bakar roket",
    "Fasilitas biologi sintetis skala planet untuk menyerap miliaran ton karbon dioksida atmosfer"
]
id_content["eras"]["era-2050"]["bannerAlt"] = "Pemandangan Bumi dari orbit rendah melewati stasiun luar angkasa dan modul pemukiman"
id_content["eras"]["era-2050"]["bannerPrompt"] = "Tampilan megah Bumi dari orbit luar angkasa dengan dok transfer antariksa, lengkungan biru Bumi, kegelapan ruang angkasa, resolusi 8k."

for k, card in en_content["timelineCards"].items():
    id_content["timelineCards"][k]["title"] = f"Proyek // {k.upper()}"
    id_content["timelineCards"][k]["description"] = f"Spesifikasi rekayasa mutakhir bebas emisi untuk periode 2030-2050."
    id_content["timelineCards"][k]["breakthrough"] = f"Penerapan hukum fisika mutakhir dan efisiensi sumber daya total."
    id_content["timelineCards"][k]["alt"] = f"Visualisasi teknis {k}"
    id_content["timelineCards"][k]["prompt"] = f"Fotografi arsitektur sinematik, {k}, resolusi 8k."

for k, card in en_content["techCards"].items():
    id_content["techCards"][k]["title"] = f"Teknologi // {k.upper()}"
    id_content["techCards"][k]["description"] = f"Subsistem terdepan {k.upper()} yang dirancang untuk operasi berkelanjutan dan mandiri."
    id_content["techCards"][k]["howItWorks"] = f"Bekerja berdasarkan hukum fisika mutakhir tanpa emisi lingkungan."
    id_content["techCards"][k]["alt"] = f"Konsep rekayasa {k}"
    id_content["techCards"][k]["prompt"] = f"Fotografi konsep industri, {k}, resolusi 8k."

for k, place in en_content["places"].items():
    id_content["places"][k]["title"] = f"Pemukiman // {k.upper()}"
    id_content["places"][k]["location"] = f"Habitat Internasional {k.upper()}"
    id_content["places"][k]["story"] = f"Warga hidup selaras dengan alam didukung ekosistem siklus tertutup ramah lingkungan."
    id_content["places"][k]["infrastructureTags"] = ["Jaringan Cerdas", "Transportasi Bersih", "Energi Fusi", "Biosfer"]
    id_content["places"][k]["alt"] = f"Pemandangan fotorealistik {k}"
    id_content["places"][k]["prompt"] = f"Pemandangan lanskap masa depan, {k}, resolusi 8k."

id_content["projects"]["pendingNotice"] = "Proyek ditinjau dan disinkronkan langsung oleh Aliya Khan."
id_content["projects"]["emptyLive"] = "Belum ada sistem publik yang aktif saat ini. Peluncuran baru akan dipublikasikan di sini."
id_content["projects"]["emptyInProgress"] = "Cetak biru rekayasa aktif akan dicatat di sini seiring pencapaian target."
id_content["projects"]["emptyIdeas"] = "Proposal riset teoretis akan dikatalogkan di sini."

os.makedirs('locales/id', exist_ok=True)
with open('locales/id/ui.json', 'w', encoding='utf-8') as f:
    json.dump(id_ui, f, ensure_ascii=False, indent=2)
with open('locales/id/content.json', 'w', encoding='utf-8') as f:
    json.dump(id_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Indonesian (id) locales.")

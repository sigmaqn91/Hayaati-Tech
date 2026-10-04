#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

tr_ui = {
    "meta": {"code": "tr", "languageName": "Turkish", "nativeName": "Türkçe", "rtl": False},
    "nav": {
        "home": "Ana Sayfa", "timeline": "Gelecek Zaman Çizelgesi", "tech": "Geleceğin Teknolojisi", "places": "Şehirler ve Alanlar",
        "projects": "Projelerim", "advertise": "Yayınla / Başvur", "about": "Hakkında", "contact": "İletişim",
        "assistant": "Yapay Zeka Asistanı", "language": "Dil", "menu": "Gezinme menüsünü aç", "close": "Gezinme menüsünü kapat",
        "brandSubtitle": "TEKNOLOJİ // 2030-2050", "menuSysHeader": "SİSTEM MENÜSÜ", "locationDomain": "ERİŞİM NOKTASI: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "SİSTEM//DÜĞÜM.2030-2050", "online": "SİSTEMLER ÇEVRİMİÇİ",
        "headline": "Gelecek kendiliğinden gelmez. Onu birlikte inşa ediyoruz.",
        "subtitle": "2030'dan 2050'ye insan inovasyonunun, bilişsel makinelerin, yörünge kolonilerinin ve sürdürülebilir yaşam alanlarının sinematik vizyonu. Aliya Khan tarafından tasarlandı.",
        "exploreCta": "2030 2050'yi Keşfet", "projectsCta": "Projeleri İncele",
        "coordinates": "KONUM: 28.6139° K, 77.2090° D // MOTOR AKTİF", "timelineSpan": "UFUK 2030 — 2050",
        "liveTelemetry": "TELEMETRİ: NORMAL", "scrollDown": "Zaman çizelgesini keşfetmek için aşağı kaydırın",
        "imageAlt": "2030 2050 fütüristik metropolün sinematik görünümü"
    },
    "timeline": {
        "sectionTag": "ZAMAN_HARİTASI // 2030 -> 2050", "title": "İnsan İnovasyonunun Kronolojisi",
        "subtitle": "2030'un her yere yayılan uç zekasından 2050'nin gezegenler arası ağır sanayisine.",
        "chronoMap": "KRONOLOJİK TASLAK", "eraHeading": "DÖNEM UFKU", "storyTitle": "Bu Dönemde Bir Gün",
        "breakthroughsTitle": "Önemli Teknolojik Kilometre Taşları", "viewEraDetails": "Dönem Dosyasını İncele",
        "jumpToEra": "Bu Döneme Git", "statusPrefix": "DURUM", "eraBreakthroughsHeading": "Atılımlar",
        "specificationsCount": "Teknik Özellikler"
    },
    "tech": {
        "sectionTag": "SİSTEM_İNDEKSİ // 42 ÖNCÜ ALAN", "title": "Gelecek Teknolojileri Kataloğu",
        "subtitle": "7 temel teknolojik alanda kapsamlı sistem planları ve bilimsel çalışma mekanizmaları.",
        "systemsIndex": "KATALOG İNDEKSİ", "howItWorksLabel": "NASIL ÇALIŞIR",
        "architectureMechanics": "TEKNİK MİMARİ VE MEKANİK", "underlyingMechanism": "TEMEL FİZİK İLKESİ",
        "searchPlaceholder": "Teknolojileri, sistemleri veya buluşları arayın...", "searchNoResults": "Aramanızla eşleşen teknoloji bulunamadı.",
        "filterAll": "Tüm Alanlar", "modalClose": "Dosyayı Kapat", "viewDossier": "Teknik Dosyayı Görüntüle",
        "yearLabel": "YIL", "statusLabel": "DURUM", "activeStatus": "AKTİF ÖZELLİK", "promptLabel": "İSTEM",
        "categories": {
            "all": "Tüm Alanlar", "ai": "Geleceğin Yapay Zekası", "vehicles": "Ulaşım ve Mobilite", "devices": "Cihazlar ve Biyonik",
            "homeWork": "Ev ve Çalışma Alanı", "health": "Sağlık ve Biyoloji", "energy": "Enerji ve İklim", "space": "Derin Uzay"
        }
    },
    "places": {
        "sectionTag": "YAŞAM_ALANI_İNDEKSİ // 2030-2050", "title": "Şehirler ve Yerleşim Kartpostalları",
        "subtitle": "Dünya ve yörüngedeki yeni insan yerleşimlerinin fotogerçekçi görselleri ve altyapı raporları.",
        "horizonLabel": "UFUK", "aDayInPlace": "Bu Alanda Bir Gün", "infrastructureLabel": "Kritik Altyapı",
        "viewLocation": "Yerleşim Planını İncele", "promptLabel": "İSTEM"
    },
    "projects": {
        "sectionTag": "KURUCU PROJELERİ // ALIYA KHAN", "title": "Projelerim",
        "subtitle": "Aliya Khan tarafından geliştirilen aktif yazılım sistemleri, araştırma arşivleri ve mimari tasarımlar.",
        "tabs": {"live": "Canlı Sistemler", "inProgress": "Geliştirme Aşamasında", "futureIdeas": "Gelecek Fikirleri"},
        "visit": "Sistem Bağlantısını Aç", "emptyLive": "Şu anda yayında olan bir sistem bulunmuyor. Yeni projeler yakında burada listelenecek.",
        "emptyInProgress": "Aşamalar tamamlandıkça mühendislik taslakları burada yer alacaktır.",
        "emptyIdeas": "Teorik araştırma önerileri burada kataloglanacaktır.",
        "pendingNotice": "Projeler doğrudan Aliya Khan tarafından incelenir ve senkronize edilir."
    },
    "advertise": {
        "sectionTag": "PROJE_BAŞVURUSU // LİSTELEME", "title": "Proje Yayınla / Başvur",
        "subtitle": "Yenilikçi teknolojilerinizi veya sürdürülebilir girişimlerinizi Aliya Khan'ın incelemesine sunun.",
        "reviewNotice": "Tüm başvurular Aliya Khan tarafından bizzat değerlendirilir. İstenmeyen ticari iletiler reddedilir.",
        "pricingNote": "Yerleşim detayları ve iş birliği koşulları doğrudan iletişim yoluyla paylaşılacaktır.",
        "form": {
            "name": "Ad Soyad", "email": "İletişim E-posta Adresi", "projectName": "Proje / Şirket Adı",
            "projectLink": "Sistem veya Teknik Belge Bağlantısı", "category": "Teknoloji Alanı", "selectCategory": "Kategori seçin...",
            "budget": "Tahmini Bütçe / Finansman Aşaması", "budgetPlaceholder": "örn. 10.000$ - 50.000$, Araştırma Fonu",
            "description": "Proje Özeti ve Temel İnovasyon", "submitBtn": "Projeyi İncelemeye Gönder",
            "sending": "Şifreleniyor ve gönderiliyor...", "sentSuccess": "Başvurunuz başarıyla iletildi. Aliya Khan dosyanızı inceleyecektir.",
            "sendError": "İletim hatası oluştu. Lütfen doğrudan e-posta gönderin."
        }
    },
    "about": {
        "sectionTag": "BAŞ MİMAR // DOSYA", "title": "Hakkında — Aliya Khan",
        "subtitle": "Hayaati Web Technology Kurucusu, Yazılım Mimarı ve Sistem Araştırmacısı.",
        "ownerName": "Aliya Khan", "architectTitle": "KURUCU VE BAŞ MİMAR",
        "leadArchitect": "Geleceğin sistemleri ve yüksek performanslı dijital altyapıların mimari tasarımına öncülük ediyor.",
        "bioPlaceholder": "Aliya Khan, dağıtık sistemler, yapay zeka ve uzun vadeli insan yaşam alanları kesişiminde çalışan bir yazılım mimarı ve araştırmacıdır. Hayaati Web Technology, mühendislik vizyonuyla teknolojik gelişimi sunan bağımsız bir araştırma platformudur.",
        "contactDirect": "Doğrudan İletişim", "photoAlt": "Aliya Khan, Kurucu ve Baş Mimar"
    },
    "contact": {
        "sectionTag": "GÜVENLİ İLETİŞİM KANALI", "title": "Doğrudan İletişim",
        "subtitle": "Teknik sorularınızı, araştırma ortaklığı önerilerinizi veya proje iş birliklerinizi iletin.",
        "emailLabel": "Resmi İletişim Kanalı", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "Adınız Soyadınız", "email": "E-posta Adresiniz", "message": "Mesajınız / Başvuru İçeriği",
            "submitBtn": "Şifreli Mesaj Gönder", "sending": "Gönderiliyor...",
            "sentSuccess": "Mesajınız başarıyla iletildi. Resmi kanal üzerinden dönüş yapılacaktır.",
            "sendError": "Gönderim başarısız oldu. Lütfen doğrudan e-posta adresimize yazın.",
            "placeholderName": "Adınızı girin...", "placeholderEmail": "E-posta adresinizi girin...",
            "placeholderMessage": "Sorunuzu veya iş birliği önerinizi buraya yazın..."
        }
    },
    "assistant": {
        "buttonLabel": "Yapay Zeka Asistanı", "panelTitle": "HAYAATI BİLİŞSEL ARAYÜZÜ", "subtitle": "BİLİŞSEL UFUK // 2030-2050",
        "welcomeMessage": "Merhaba! Ben Hayaati asistanı. Geleceğin teknolojileri hakkında soru sorabilir veya keşfetmek için bir konu seçebilirsiniz.",
        "chips": ["2030 yılı nasıl görünecek?", "Geleceğin sağlık teknolojilerini göster", "Hayaati ve Aliya Khan hakkında bilgi ver"],
        "inputPlaceholder": "2030-2050 zaman çizelgesi, teknoloji veya şehirler hakkında soru sorun...",
        "sendBtn": "Gönder", "retryBtn": "Yeniden Dene", "voiceBtn": "Sesli Bağlantı Başlat", "voiceStopBtn": "Sesli Oturumu Sonlandır",
        "voiceListening": "Dinleniyor...", "voiceSpeaking": "Hayaati konuşuyor...", "voiceConnecting": "Ses bağlantısı kuruluyor...",
        "voiceUnsupported": "Bu tarayıcıda mikrofon erişimi desteklenmiyor.", "voiceNotAvailableLang": "Bu dilde sesli sohbet henüz aktif değil. Metin ile sohbet edebilirsiniz.",
        "rateLimitBanner": "Ziyaretçi başına istek sınırı aktiftir.", "talkTo": "Hayaati ile Konuş", "typeInstead": "Metinle Yaz",
        "returnToOrb": "Ses Küresine Dön", "muteMic": "Mikrofonu Kapat", "unmuteMic": "Mikrofonu Aç",
        "micLabel": "Mikrofon", "mutedLabel": "Sessiz", "endSession": "Oturumu Bitir", "endLabel": "Son",
        "userTag": "SİZ", "assistantTag": "HAYAATI", "cognitiveLink": "DOĞRUDAN BİLİŞSEL BAĞLANTI",
        "orb": {"ready": "Hazır", "listening": "Dinliyor...", "thinking": "Düşünüyor...", "speaking": "Konuşuyor...", "tapToStart": "Konuşmak için Başlat'a dokunun", "start": "Başlat"},
        "errors": {
            "quotaReached": "Asistan geçici hesaplama sınırına ulaştı. Lütfen daha sonra tekrar deneyin.",
            "serverBusy": "Sistemler şu anda yoğun. Lütfen birazdan tekrar deneyin.",
            "networkError": "Ağ bağlantısı kesildi. İnternet bağlantınızı kontrol edin.",
            "micBlocked": "Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofona izin verin.",
            "sessionEnded": "Sesli oturum azami süreye ulaştığı için sonlandırıldı. Yeni bir oturum başlatabilirsiniz.",
            "genericError": "Bir sorun oluştu. Lütfen Yeniden Dene'ye tıklayın."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Aliya Khan tarafından kuruldu.",
        "disclaimer": "Hayaati Web Technology bağımsız bir spekülatif araştırma arşividir. Tüm öngörüler 2030 2050 dönemi için mühendislik hipotezleridir.",
        "liveDomainLabel": "RESMİ ETKİ ALANI", "quickLinks": "Gezinme İndeksi", "systemDesignation": "HAYAATI ÇEKİRDEK MOTOR // DOĞRULANDI", "allRightsReserved": "Tüm hakları saklıdır."
    },
    "common": {
        "year": "Yıl", "status": "Durum", "operational": "Faal", "close": "Kapat", "back": "Geri",
        "retry": "Yeniden Dene", "error": "Hata", "success": "Başarılı", "loading": "Yükleniyor..."
    },
    "languageSelector": {
        "selectLanguage": "Uluslararası dil seçin", "dialogTitle": "Dil Seçici",
        "searchPlaceholder": "Dilleri filtreleyin (örn. Türkçe, English, Français)...", "languagesCountSuffix": "Dil"
    },
    "imageSlot": {"opticalChannel": "OPTİK KANAL", "framePending": "GÖRSEL HAZIRLANIYOR", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "HATA 404 // SEKTÖR BULUNAMADI", "title": "Derin Uzayda Sinyal Kayboldu",
        "description": "Talep edilen koordinatlar bilinen herhangi bir gelecek sistemi veya yerleşimle eşleşmiyor.", "returnBtn": "Yörünge Komutasına Dön"
    }
}

tr_content = json.loads(json.dumps(en_content))
tr_content["eras"]["era-2030"]["title"] = "Bilişsel Temel"
tr_content["eras"]["era-2030"]["yearLabel"] = "DÖNEM // 2030"
tr_content["eras"]["era-2030"]["story"] = "Sabahlar, siz uyurken enerji şebekelerini dengeleyen ortam yapay zekasıyla başlar. Şehir, sessiz elektrikli servisler ve yer altı özel tünellerindeki teslimat kapsülleriyle akıcı bir şekilde işler."
tr_content["eras"]["era-2030"]["breakthroughs"] = [
    "Bulut gecikmesi olmadan günlük yaşam ritmini optimize eden cihaz içi ortam yapay zeka asistanları",
    "Şehir içi ulaşımı 1.000 km kesintisiz destekleyen katı hal lityum-metal batarya paketleri",
    "Önemli kentsel hava koridorlarında otonom hava taksilerinin resmi ticari sertifikasyonu"
]
tr_content["eras"]["era-2030"]["bannerAlt"] = "Temiz ulaşım koridorlarına sahip sürdürülebilir 2030 metropolünün sinematik görünümü"
tr_content["eras"]["era-2030"]["bannerPrompt"] = "Şafak vaktinde sürdürülebilir bir sahil metropolünün sinematik panoraması, güneş enerjili cam kuleler, elektrikli servisler, dikey bahçeler, 8k çözünürlük."

tr_content["eras"]["era-2035"]["title"] = "Biyomekanik Sentez"
tr_content["eras"]["era-2035"]["yearLabel"] = "DÖNEM // 2035"
tr_content["eras"]["era-2035"]["story"] = "Nöral arayüzler, düşünce gücüyle dijital sistemleri zahmetsizce yönlendirmeyi sağlar. Koruyucu tıp, biyouyumlu nano sensörler aracılığıyla hücresel düzeyde 7/24 çalışır."
tr_content["eras"]["era-2035"]["breakthroughs"] = [
    "Sürekli metabolik izleme sağlayan deri altı optoelektronik sensörler",
    "Fiziksel hareket kabiliyetini geri kazandıran invaziv olmayan motor korteks çözücüler",
    "Geri dönüştürülebilir ultra dayanıklı yapı malzemeleri üreten endüstriyel miselyum biyoreaktörleri"
]
tr_content["eras"]["era-2035"]["bannerAlt"] = "Biyo-kubbeler ve manyetik raylı hatlar içeren dikey şehrin sinematik görünümü"
tr_content["eras"]["era-2035"]["bannerPrompt"] = "Alacakaranlıkta maglev tüpleri ve aeroponik seraları olan dikey şehir panoraması, 8k çözünürlük."

tr_content["eras"]["era-2050"]["title"] = "Gezegensel ve Yörüngesel Ufuk"
tr_content["eras"]["era-2050"]["yearLabel"] = "DÖNEM // 2050"
tr_content["eras"]["era-2050"]["story"] = "Ağır sanayi üretimi Dünya biyosferinden yörüngedeki mikro yerçekimi rafinerilerine taşındı. Ticari füzyon enerjisi ve kapalı döngü ekonomiler okyanus ve atmosfer dengesini yeniden sağladı."
tr_content["eras"]["era-2050"]["breakthroughs"] = [
    "Sürekli temiz temel yük elektriği sağlayan ticari manyetik hapsetmeli nükleer füzyon santralleri",
    "Ay güney kutbunda su buzu çıkarma ve uzay yakıtı üretimi için kalıcı üsler",
    "Milyarlarca ton atmosferik karbonu bağlamak üzere tasarlanmış gezegensel sentetik biyoloji tesisleri"
]
tr_content["eras"]["era-2050"]["bannerAlt"] = "Yörünge istasyonları ve yaşam modülleri arasından Dünya'ya bakış"
tr_content["eras"]["era-2050"]["bannerPrompt"] = "Alçak Dünya yörüngesindeki uzay transfer istasyonundan Dünya'nın sinematik görünümü, mavi yerküre eğrisi, derin uzay boşluğu, 8k."

for k, card in en_content["timelineCards"].items():
    tr_content["timelineCards"][k]["title"] = f"Proje // {k.upper()}"
    tr_content["timelineCards"][k]["description"] = f"2030-2050 dönemi için sıfır emisyonlu gelişmiş mühendislik özellikleri ve tasarımı."
    tr_content["timelineCards"][k]["breakthrough"] = f"Gelişmiş fizik ilkeleri ve üstün kaynak verimliliği."
    tr_content["timelineCards"][k]["alt"] = f"{k} teknik görselleştirmesi"
    tr_content["timelineCards"][k]["prompt"] = f"Sinematik mimari fotoğrafçılık, {k}, 8k çözünürlük."

for k, card in en_content["techCards"].items():
    tr_content["techCards"][k]["title"] = f"Teknoloji // {k.upper()}"
    tr_content["techCards"][k]["description"] = f"Sürdürülebilir ve otonom uzun süreli operasyonlar için tasarlanmış öncü alt sistem {k.upper()}."
    tr_content["techCards"][k]["howItWorks"] = f"Sıfır karbon ayak izine sahip yenilikçi fizik ve algoritmik prensipler üzerine kurulmuştur."
    tr_content["techCards"][k]["alt"] = f"{k} konsept tasarımı"
    tr_content["techCards"][k]["prompt"] = f"Endüstriyel tasarım fotoğrafı, {k}, 8k çözünürlük."

for k, place in en_content["places"].items():
    tr_content["places"][k]["title"] = f"Yerleşim // {k.upper()}"
    tr_content["places"][k]["location"] = f"Uluslararası Habitat {k.upper()}"
    tr_content["places"][k]["story"] = f"Sakinler sıfır atıklı kapalı döngü sistemlerle doğayla tam uyum içinde yaşamaktadır."
    tr_content["places"][k]["infrastructureTags"] = ["Akıllı Şebeke", "Temiz Ulaşım", "Füzyon Enerjisi", "Biyosistemler"]
    tr_content["places"][k]["alt"] = f"{k} gerçekçi görüntüsü"
    tr_content["places"][k]["prompt"] = f"Sinematik şehir manzarası, {k}, 8k çözünürlük."

tr_content["projects"]["pendingNotice"] = "Projeler doğrudan Aliya Khan tarafından incelenir ve senkronize edilir."
tr_content["projects"]["emptyLive"] = "Şu anda yayında olan bir sistem bulunmuyor. Yeni projeler yakında burada listelenecek."
tr_content["projects"]["emptyInProgress"] = "Aşamalar tamamlandıkça mühendislik taslakları burada yer alacaktır."
tr_content["projects"]["emptyIdeas"] = "Teorik araştırma önerileri burada kataloglanacaktır."

os.makedirs('locales/tr', exist_ok=True)
with open('locales/tr/ui.json', 'w', encoding='utf-8') as f:
    json.dump(tr_ui, f, ensure_ascii=False, indent=2)
with open('locales/tr/content.json', 'w', encoding='utf-8') as f:
    json.dump(tr_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Turkish (tr) locales.")

#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

# Batch 6 Languages: nl (Dutch), pl (Polish), fa (Persian), th (Thai), sw (Swahili)

BATCH6_CONFIGS = {
    "nl": {
        "name": "Dutch",
        "native": "Nederlands",
        "rtl": False,
        "nav": {
            "home": "Startpagina", "timeline": "Tijdlijn van de Toekomst", "tech": "Toekomstige Technologie", "places": "Steden & Habitats",
            "projects": "Mijn Projecten", "advertise": "Adverteren / Aanmelden", "about": "Over Mij", "contact": "Contact Opnemen",
            "assistant": "AI-Assistent", "language": "Taal", "menu": "Navigatiemenu openen", "close": "Navigatiemenu sluiten",
            "brandSubtitle": "TECHNOLOGIE // 2030-2050", "menuSysHeader": "SYSTEEMMENU", "locationDomain": "KNOOPPUNT: WWW.HAYAATIWEB.SITE"
        },
        "hero": {
            "systemStatus": "SYSTEEM//NODE.2030-2050", "online": "ALLE SYSTEMEN ONLINE",
            "headline": "De toekomst ontstaat niet zomaar. Wij bouwen haar samen.",
            "subtitle": "Een filmische blauwdruk van menselijke innovatie, cognitieve machines, orbitale kolonies en duurzame habitats van 2030 tot 2050. Gebouwd door Aliya Khan.",
            "exploreCta": "Verken 2030 2050", "projectsCta": "Bekijk Mijn Projecten",
            "coordinates": "LOCATIE: 28.6139° N, 77.2090° O // MOTOR ACTIEF", "timelineSpan": "TIJDSLIJN 2030 — 2050",
            "liveTelemetry": "TELEMETRIE: NOMINAAL", "scrollDown": "Scroll naar beneden om de tijdlijn te verkennen",
            "imageAlt": "Filmische weergave van een futuristische metropool 2030 2050"
        },
        "timeline": {
            "sectionTag": "CHRONO_KAART // 2030 -> 2050", "title": "Kroniek van Menselijke Innovatie",
            "subtitle": "Van alomtegenwoordige edge-intelligentie in 2030 tot orbitale zware industrie in 2050.",
            "chronoMap": "CHRONOLOGISCHE BLAUWDRUK", "eraHeading": "TIJDPERK HORIZON", "storyTitle": "Een Dag in Dit Tijdperk",
            "breakthroughsTitle": "Belangrijke Technologische Mijlpalen", "viewEraDetails": "Open Tijdperkdossier",
            "jumpToEra": "Spring naar Dit Tijdperk", "statusPrefix": "SYSTEEMSTATUS", "eraBreakthroughsHeading": "Doorbraken",
            "specificationsCount": "Specificaties"
        },
        "tech": {
            "sectionTag": "SYSTEEM_INDEX // 42 FRONTIERS", "title": "Catalogus van Toekomstige Technologie",
            "subtitle": "Uitgebreide systeemblauwrukken en wetenschappelijke mechanismen over 7 fundamentele technologische grenzen.",
            "systemsIndex": "CATALOGUSINDEX", "howItWorksLabel": "HOE HET WERKT",
            "architectureMechanics": "TECHNISCHE ARCHITECTUUR & MECHANICA", "underlyingMechanism": "FUNDAMENTEEL FYSISCH PRINCIPE",
            "searchPlaceholder": "Zoek technologieën, systemen of doorbraken...", "searchNoResults": "Geen technologieën gevonden die overeenkomen.",
            "filterAll": "Alle Categorieën", "modalClose": "Dossier Sluiten", "viewDossier": "Bekijk Technisch Dossier",
            "yearLabel": "JAAR", "statusLabel": "SYSTEEMSTATUS", "activeStatus": "ACTIEF SYSTEEM", "promptLabel": "INVOEROPDRACHT",
            "categories": {
                "all": "Alle Categorieën", "ai": "Toekomstige AI", "vehicles": "Voertuigen & Mobiliteit", "devices": "Apparaten & Bionica",
                "homeWork": "Wonen & Werken", "health": "Gezondheid & Bio", "energy": "Energie & Klimaat", "space": "Diepe Ruimte"
            }
        },
        "places": {
            "sectionTag": "HABITAT_OVERZICHT // 2030-2050", "title": "Steden & Habitat Briefkaarten",
            "subtitle": "Fotorealistische visualisaties en infrastructuurdossiers van opkomende menselijke nederzettingen op Aarde en in een baan om de aarde.",
            "horizonLabel": "TIJDSHORIZON", "aDayInPlace": "Een Dag in Deze Habitat", "infrastructureLabel": "Kritieke Infrastructuur",
            "viewLocation": "Verken Habitatdossier", "promptLabel": "INVOEROPDRACHT"
        },
        "projects": {
            "sectionTag": "OPRICHTER_PROJECTEN // ALIYA KHAN", "title": "Mijn Projecten",
            "subtitle": "Actieve softwaresystemen, onderzoeksarchieven en architectonische ontwerpen gebouwd door Aliya Khan.",
            "tabs": {"live": "Live Systemen", "inProgress": "In Ontwikkeling", "futureIdeas": "Toekomstige Ideeën"},
            "visit": "Systeem Openen", "emptyLive": "Momenteel geen live systemen. Nieuwe implementaties worden binnenkort getoond.",
            "emptyInProgress": "Technische ontwerpen verschijnen hier naarmate de fasen worden voltooid.",
            "emptyIdeas": "Theoretische onderzoeksvoorstellen worden hier gecatalogiseerd.",
            "pendingNotice": "Projecten worden direct geëvalueerd en gesynchroniseerd door Aliya Khan."
        },
        "advertise": {
            "sectionTag": "PROJECT_INDIENING // NOTERING", "title": "Adverteer / Meld Uw Project Aan",
            "subtitle": "Dien uw baanbrekende technologie of duurzame initiatief in ter beoordeling door Aliya Khan.",
            "reviewNotice": "Alle inzendingen worden persoonlijk beoordeeld door Aliya Khan. Commerciële spam wordt afgewezen.",
            "pricingNote": "Plaatsingsdetails en samenwerkingsvoorwaarden worden rechtstreeks via e-mail gecommuniceerd.",
            "form": {
                "name": "Uw Volledige Naam", "email": "Zakelijk E-mailadres", "projectName": "Project- of Bedrijfsnaam",
                "projectLink": "Systeem- of Whitepaper-URL", "category": "Technologiedomein", "selectCategory": "Selecteer een domein...",
                "budget": "Geschat Budgetbereik", "budgetPlaceholder": "bijv. € 5.000 - € 25.000",
                "description": "Technisch Overzicht & Relevantie voor de Toekomst",
                "submitBtn": "Dossier Verzenden ter Beoordeling", "sending": "Dossier Wordt Verzonden...",
                "sentSuccess": "Dossier succesvol verzonden naar Aliya Khan. U ontvangt spoedig bericht.",
                "sendError": "Verzending mislukt. Controleer uw verbinding of probeer het opnieuw."
            }
        },
        "about": {
            "sectionTag": "ARCHITECTEN_DOSSIER // SYSTEEMPROFIEK", "title": "Over Aliya Khan",
            "subtitle": "Oprichter, hoofdontwerper en systeemarchitect van Hayaati Web Technology.",
            "ownerName": "Aliya Khan", "architectTitle": "Oprichter & Hoofdontwerper",
            "leadArchitect": "HOOFDARCHITECT // HAYAATI WEB TECHNOLOGY",
            "bioPlaceholder": "Aliya Khan ontwerpt en bouwt software en infrastructurele toekomstvisies voor de overgang van 2030 naar 2050.",
            "contactDirect": "Rechtstreeks Kanaal: Hayaati.Technology@gmail.com",
            "photoAlt": "Aliya Khan — Oprichter en Hoofdontwerper van Hayaati Web Technology"
        },
        "contact": {
            "sectionTag": "DIRECT_KANAAL // COMMUNICATIE", "title": "Contact & Samenwerking",
            "subtitle": "Neem rechtstreeks contact op met Aliya Khan voor onderzoek, architectuuradvies of strategische samenwerking.",
            "emailLabel": "OFFICIEEL E-MAILKANAAL", "directEmail": "Hayaati.Technology@gmail.com",
            "form": {
                "name": "Uw Naam", "email": "Uw E-mailadres", "message": "Uw Bericht of Voorstel",
                "submitBtn": "Bericht Verzenden", "sending": "Verzenden...",
                "sentSuccess": "Bericht succesvol verzonden naar Aliya Khan.", "sendError": "Verzenden mislukt. Probeer het opnieuw.",
                "placeholderName": "bijv. Dr. Elena Vance", "placeholderEmail": "elena@frontiertech.org",
                "placeholderMessage": "Beschrijf uw onderzoek, samenwerkingsidee of vraag..."
            }
        },
        "assistant": {
            "buttonLabel": "Praat met Hayaati", "panelTitle": "HAYAATI COGNITIEVE KERN",
            "subtitle": "Kwantum Holografische Neurale Interface // Stem & Tekst",
            "welcomeMessage": "Systeemverbinding tot stand gebracht. Ik ben Hayaati, uw cognitieve gids voor de tijdlijn 2030-2050.",
            "chips": ["Hoe ziet 2030 eruit?", "Toon toekomstige gezondheidstechnologie", "Vertel me over Hayaati & Aliya Khan"],
            "inputPlaceholder": "Stel een vraag over de technologie van 2030–2050...", "sendBtn": "Verzenden",
            "retryBtn": "Opnieuw Proberen", "voiceBtn": "Spraak Inschakelen", "voiceStopBtn": "Spraak Stoppen",
            "voiceListening": "Luisteren...", "voiceSpeaking": "Spreken...", "voiceConnecting": "Verbinden...",
            "voiceUnsupported": "Spraakinvoer niet ondersteund in deze browser.",
            "voiceNotAvailableLang": "Spraak niet beschikbaar voor deze taal.",
            "rateLimitBanner": "Frequentielimiet bereikt. Even wachten a.u.b.",
            "talkTo": "Spreek met Hayaati", "typeInstead": "Of typ hieronder", "returnToOrb": "Terug naar Kern",
            "muteMic": "Microfoon Dempen", "unmuteMic": "Microfoon Inschakelen", "micLabel": "Microfoon",
            "mutedLabel": "Gedempt", "endSession": "Sessie Beëindigen", "endLabel": "Einde",
            "userTag": "GEBRUIKER", "assistantTag": "HAYAATI", "cognitiveLink": "COGNITIEVE VERBINDING ACTIEF",
            "orb": {
                "ready": "STAND-BY", "listening": "LUISTEREN", "thinking": "VERWERKEN",
                "speaking": "SPREKEN", "tapToStart": "Tik om te Praten", "start": "Starten"
            },
            "errors": {
                "quotaReached": "Dagelijks gespreksquotum bereikt. Kom morgen terug.",
                "serverBusy": "De cognitieve kern is bezet. Even geduld a.u.b.",
                "networkError": "Netwerkfout. Controleer uw verbinding.",
                "micBlocked": "Microfoontoegang geblokkeerd door browser.",
                "sessionEnded": "Sessie beëindigd.", "genericError": "Er is een onverwachte fout opgetreden."
            },
            "voiceErrors": {
                "unsupported": "Spraakherkenning wordt niet ondersteund.",
                "insecure": "HTTPS is vereist voor spraaktoegang.",
                "denied": "Microfoontoestemming geweigerd.",
                "noDevice": "Geen microfoon gedetecteerd.",
                "micFailed": "Microfooninitialisatie mislukt.",
                "rateLimit": "Spraakfrequentielimiet bereikt.",
                "providerQuota": "Spraakquotum overschreden.",
                "noKey": "Spraakservice niet geconfigureerd.",
                "modelFailed": "Spraakmodel mislukt.",
                "network": "Netwerkfout tijdens spraaksynthese.",
                "serverError": "Spraakserverfout."
            }
        },
        "footer": {
            "copyright": "© 2026-2050 Hayaati Web Technology. Alle rechten voorbehouden.",
            "disclaimer": "Onderzoeks- en architectuurblauwdruk voor speculatieve en opkomende technologieën.",
            "liveDomainLabel": "LIVE DOMEIN", "quickLinks": "SNELKOPPELINGEN",
            "systemDesignation": "SYSTEEMAANDUIDING: HAYAATI-CORE-V5", "allRightsReserved": "Alle rechten voorbehouden."
        },
        "common": {
            "year": "Jaar", "status": "Toestand", "operational": "Operationeel", "close": "Sluiten",
            "back": "Terug", "retry": "Opnieuw", "error": "Fout", "success": "Succes", "loading": "Laden..."
        },
        "languageSelector": {
            "selectLanguage": "Selecteer Internationale Taal", "dialogTitle": "Taalkeuze",
            "searchPlaceholder": "Filter talen (bijv. Nederlands, English)...", "languagesCountSuffix": "Talen"
        },
        "imageSlot": {"opticalChannel": "OPTISCH KANAAL", "framePending": "FRAME WORDT GELADEN", "sysDim": "SYS//800x500"},
        "notFound": {
            "errorTag": "FOUT 404 // SECTOR NIET GEVONDEN", "title": "Signaal Verloren in de Diepe Ruimte",
            "description": "De opgevraagde coördinaten komen niet overeen met een bekend toekomstig systeem.", "returnBtn": "Terug naar Orbitale Basis"
        },
        "eras": {
            "era-2030": {
                "title": "Het Cognitieve Fundament", "yearLabel": "TIJDPERK // 2030",
                "story": "De ochtenden beginnen met omgevings-AI die energienetten balanceert terwijl u slaapt. De stad functioneert vloeiend met stille elektrische shuttles en ondergrondse leveringscapsules.",
                "breakthroughs": [
                    "Omgevings-AI-assistenten op apparaten die het dagelijkse levensritme optimaliseren zonder cloudlatentie",
                    "Vastestof lithium-metaal accupakketten die stedelijk transport 1.000 km ononderbroken ondersteunen",
                    "Officiële commerciële certificering van autonome luchttaxi's in grote stedelijke luchtcorridors"
                ],
                "bannerAlt": "Filmische weergave van een duurzame metropool in 2030 met schone transportcorridors",
                "bannerPrompt": "Filmisch panorama van een duurzame kustmetropool bij zonsopgang, torens van zonneglas, elektrische shuttles, verticale tuinen, 8k-resolutie."
            },
            "era-2035": {
                "title": "Biomechanische Synthese", "yearLabel": "TIJDPERK // 2035",
                "story": "Neurale interfaces maken moeiteloze besturing van digitale systemen met gedachten mogelijk. Preventieve geneeskunde werkt 24/7 op cellulair niveau via biocompatibele nanosensoren.",
                "breakthroughs": [
                    "Subcutane opto-elektronische sensoren voor continue metabole monitoring",
                    "Niet-invasieve motorische cortexdecoders die fysieke mobiliteit herstellen",
                    "Industriële mycelium-bioreactoren die recyclebare, ultra-sterke bouwmaterialen produceren"
                ],
                "bannerAlt": "Filmische weergave van een verticale stad met biokoepels en magneetzweeflijnen",
                "bannerPrompt": "Panorama van een verticale stad in de schemering met magneetzweefbuizen en aeroponische kassen, 8k-resolutie."
            },
            "era-2050": {
                "title": "Planetaire & Orbitale Horizon", "yearLabel": "TIJDPERK // 2050",
                "story": "Zware industriële productie is verplaatst van de biosfeer van de Aarde naar raffinaderijen in microzwaartekracht. Commerciële fusie-energie en kringloopeconomieën herstellen de balans van oceaan en atmosfeer.",
                "breakthroughs": [
                    "Commerciële magnetische opsluiting kernfusiecentrales die continue schone basislaststroom leveren",
                    "Permanente bases op de zuidpool van de maan voor waterijswinning en brandstofproductie",
                    "Planetaire synthetische biologiefaciliteiten ontworpen om miljarden tonnen atmosferische koolstof vast te leggen"
                ],
                "bannerAlt": "Uitzicht op de Aarde vanuit orbitale stations en leefmodules",
                "bannerPrompt": "Filmisch uitzicht op de Aarde vanuit een ruimtetransferstation in een lage baan om de aarde, blauwe aardbolkromming, diepe ruimte, 8k."
            }
        }
    },
    "pl": {
        "name": "Polish",
        "native": "Polski",
        "rtl": False,
        "nav": {
            "home": "Strona Główna", "timeline": "Oś Czasu Przyszłości", "tech": "Technologia Przyszłości", "places": "Miasta i Siedliska",
            "projects": "Moje Projekty", "advertise": "Ogłoś / Zgłoś", "about": "O Mnie", "contact": "Kontakt",
            "assistant": "Asystent AI", "language": "Język", "menu": "Otwórz menu nawigacji", "close": "Zamknij menu nawigacji",
            "brandSubtitle": "TECHNOLOGIA // 2030-2050", "menuSysHeader": "MENU SYSTEMOWE", "locationDomain": "WĘZEŁ: WWW.HAYAATIWEB.SITE"
        },
        "hero": {
            "systemStatus": "SYSTEM//WĘZEŁ.2030-2050", "online": "WSZYSTKIE SYSTEMY ONLINE",
            "headline": "Przyszłość nie nadchodzi sama. Budujemy ją wspólnie.",
            "subtitle": "Kinowy plan ludzkiej innowacji, maszyn kognitywnych, kolonii orbitalnych i zrównoważonych siedlisk w latach 2030–2050. Stworzony przez Aliya Khan.",
            "exploreCta": "Odkryj 2030 2050", "projectsCta": "Zobacz Projekty",
            "coordinates": "LOKALIZACJA: 28.6139° N, 77.2090° E // SILNIK AKTYWNY", "timelineSpan": "HORYZONT 2030 — 2050",
            "liveTelemetry": "TELEMETRIA: NOMINALNA", "scrollDown": "Przewiń w dół, aby odkryć oś czasu",
            "imageAlt": "Kinowy widok futurystycznej metropolii 2030 2050"
        },
        "timeline": {
            "sectionTag": "MAPA_CZASU // 2030 -> 2050", "title": "Kronika Ludzkich Innowacji",
            "subtitle": "Od wszechobecnej inteligencji brzegowej w 2030 r. do przemysłu orbitalnego w 2050 r.",
            "chronoMap": "CHRONOLOGICZNY PLAN", "eraHeading": "HORYZONT ERY", "storyTitle": "Dzień w Tej Erze",
            "breakthroughsTitle": "Kluczowe Przełomy Technologiczne", "viewEraDetails": "Otwórz Akta Ery",
            "jumpToEra": "Przejdź do Tej Ery", "statusPrefix": "STATUS SYSTEMU", "eraBreakthroughsHeading": "Przełomy",
            "specificationsCount": "Specyfikacje"
        },
        "tech": {
            "sectionTag": "INDEKS_SYSTEMÓW // 42 PIONY", "title": "Katalog Technologii Przyszłości",
            "subtitle": "Kompleksowe plany systemowe i mechanizmy naukowe w 7 fundamentalnych granicach technologicznych.",
            "systemsIndex": "INDEKS KATALOGU", "howItWorksLabel": "JAK TO DZIAŁA",
            "architectureMechanics": "ARCHITEKTURA TECHNICZNA I MECHANIKA", "underlyingMechanism": "PODSTAWOWA ZASADA FIZYCZNA",
            "searchPlaceholder": "Szukaj technologii, systemów lub przełomów...", "searchNoResults": "Brak pasujących technologii.",
            "filterAll": "Wszystkie Kategorie", "modalClose": "Zamknij Akta", "viewDossier": "Zobacz Akta Techniczne",
            "yearLabel": "ROK", "statusLabel": "STAN SYSTEMU", "activeStatus": "SYSTEM AKTYWNY", "promptLabel": "POLECENIE GRAFICZNE",
            "categories": {
                "all": "Wszystkie Kategorie", "ai": "Przyszła AI", "vehicles": "Pojazdy i Mobilność", "devices": "Urządzenia i Bionika",
                "homeWork": "Dom i Praca", "health": "Zdrowie i Bio", "energy": "Energia i Klimat", "space": "Głęboki Kosmos"
            }
        },
        "places": {
            "sectionTag": "INDEKS_SIEDLISK // 2030-2050", "title": "Miasta i Siedliska Przyszłości",
            "subtitle": "Fotorealistyczne wizualizacje i raporty infrastrukturalne nowych osiedli ludzkich na Ziemi i orbicie.",
            "horizonLabel": "HORYZONT", "aDayInPlace": "Dzień w Tym Siedlisku", "infrastructureLabel": "Kluczowa Infrastruktura",
            "viewLocation": "Zbadaj Plan Siedliska", "promptLabel": "POLECENIE GRAFICZNE"
        },
        "projects": {
            "sectionTag": "PROJEKTY_AUTORSKIE // ALIYA KHAN", "title": "Moje Projekty",
            "subtitle": "Aktywne systemy oprogramowania, archiwa badawcze i projekty architektoniczne stworzone przez Aliya Khan.",
            "tabs": {"live": "Systemy Aktywne", "inProgress": "W Trakcie Rozwoju", "futureIdeas": "Koncepcje Przyszłości"},
            "visit": "Otwórz System", "emptyLive": "Brak aktywnych systemów. Nowe wdrożenia pojawią się wkrótce.",
            "emptyInProgress": "Projekty inżynieryjne pojawią się tutaj po ukończeniu kolejnych etapów.",
            "emptyIdeas": "Teoretyczne propozycje badawcze zostaną tutaj skatalogowane.",
            "pendingNotice": "Projekty są bezpośrednio weryfikowane i synchronizowane przez Aliya Khan."
        },
        "advertise": {
            "sectionTag": "ZGŁOSZENIE_PROJEKTU // WPIS", "title": "Ogłoś / Zgłoś Swój Projekt",
            "subtitle": "Zgłoś swoją pionierską technologię lub zrównoważoną inicjatywę do oceny przez Aliya Khan.",
            "reviewNotice": "Wszystkie zgłoszenia są osobiście oceniane przez Aliya Khan. Spam komercyjny jest odrzucany.",
            "pricingNote": "Szczegóły dotyczące umieszczenia i warunki współpracy będą przekazane bezpośrednio drogą mailową.",
            "form": {
                "name": "Imię i Nazwisko", "email": "Firmowy Adres E-mail", "projectName": "Nazwa Projektu / Firmy",
                "projectLink": "Link do Systemu lub Dokumentacji", "category": "Dziedzina Technologiczna", "selectCategory": "Wybierz dziedzinę...",
                "budget": "Szacowany Budżet", "budgetPlaceholder": "np. 20 000 zł - 100 000 zł",
                "description": "Opis Techniczny i Znaczenie dla Przyszłości",
                "submitBtn": "Prześlij Zgłoszenie do Oceny", "sending": "Wysyłanie Zgłoszenia...",
                "sentSuccess": "Zgłoszenie pomyślnie wysłane do Aliya Khan. Otrzymasz odpowiedź wkrótce.",
                "sendError": "Wysyłanie nie powiodło się. Sprawdź połączenie lub spróbuj ponownie."
            }
        },
        "about": {
            "sectionTag": "AKTA_ARCHITEKTA // PROFIL", "title": "O Mnie — Aliya Khan",
            "subtitle": "Założycielka, główna projektantka i architekt systemów Hayaati Web Technology.",
            "ownerName": "Aliya Khan", "architectTitle": "Założycielka i Główna Architekt",
            "leadArchitect": "GŁÓWNY ARCHITEKT // HAYAATI WEB TECHNOLOGY",
            "bioPlaceholder": "Aliya Khan projektuje i tworzy oprogramowanie oraz wizje infrastrukturalne na lata 2030–2050.",
            "contactDirect": "Bezpośredni Kanał: Hayaati.Technology@gmail.com",
            "photoAlt": "Aliya Khan — Założycielka i Główna Architekt Hayaati Web Technology"
        },
        "contact": {
            "sectionTag": "KANAŁ_BEZPOŚREDNI // KONTAKT", "title": "Kontakt i Współpraca",
            "subtitle": "Skontaktuj się bezpośrednio z Aliya Khan w sprawie badań, konsultacji lub współpracy strategicznej.",
            "emailLabel": "OFICJALNY KANAŁ E-MAIL", "directEmail": "Hayaati.Technology@gmail.com",
            "form": {
                "name": "Twoje Imię", "email": "Twój Adres E-mail", "message": "Wiadomość lub Propozycja",
                "submitBtn": "Wyślij Wiadomość", "sending": "Wysyłanie...",
                "sentSuccess": "Wiadomość pomyślnie wysłana do Aliya Khan.", "sendError": "Błąd wysyłania. Spróbuj ponownie.",
                "placeholderName": "np. dr Jan Kowalski", "placeholderEmail": "jan@nauka.pl",
                "placeholderMessage": "Opisz swoje badania, pomysł na współpracę lub zapytanie..."
            }
        },
        "assistant": {
            "buttonLabel": "Porozmawiaj z Hayaati", "panelTitle": "RDZEŃ KOGNITYWNY HAYAATI",
            "subtitle": "Kwantowy Holograficzny Interfejs Neuronowy // Głos i Tekst",
            "welcomeMessage": "Połączenie systemowe nawiązane. Jestem Hayaati, Twój przewodnik po latach 2030–2050.",
            "chips": ["Jak będzie wyglądać 2030 rok?", "Pokaż technologie medyczne przyszłości", "Opowiedz o Hayaati i Aliya Khan"],
            "inputPlaceholder": "Zadaj pytanie o technologie 2030–2050...", "sendBtn": "Wyślij",
            "retryBtn": "Ponów", "voiceBtn": "Aktywuj Głos", "voiceStopBtn": "Zatrzymaj Głos",
            "voiceListening": "Słucham...", "voiceSpeaking": "Mówię...", "voiceConnecting": "Łączenie...",
            "voiceUnsupported": "Wprowadzanie głosowe nie jest obsługiwane w tej przeglądarce.",
            "voiceNotAvailableLang": "Głos niedostępny dla tego języka.",
            "rateLimitBanner": "Osiągnięto limit zapytań. Proszę chwilę poczekać.",
            "talkTo": "Mów do Hayaati", "typeInstead": "Lub pisz poniżej", "returnToOrb": "Powrót do Rdzenia",
            "muteMic": "Wycisz Mikrofon", "unmuteMic": "Włącz Mikrofon", "micLabel": "Mikrofon",
            "mutedLabel": "Wyciszony", "endSession": "Zakończ Sesję", "endLabel": "Koniec",
            "userTag": "UŻYTKOWNIK", "assistantTag": "HAYAATI", "cognitiveLink": "ŁĄCZE KOGNITYWNE AKTYWNE",
            "orb": {
                "ready": "GOTOWY", "listening": "SŁUCHANIE", "thinking": "PRZETWARZANIE",
                "speaking": "MÓWIENIE", "tapToStart": "Dotknij, aby Mówić", "start": "Rozpocznij"
            },
            "errors": {
                "quotaReached": "Dzienny limit rozmów wyczerpany. Zapraszamy jutro.",
                "serverBusy": "Rdzeń kognitywny jest przeciążony. Proszę czekać.",
                "networkError": "Błąd sieci. Sprawdź połączenie.",
                "micBlocked": "Dostęp do mikrofonu został zablokowany.",
                "sessionEnded": "Sesja zakończona.", "genericError": "Wystąpił nieoczekiwany błąd."
            },
            "voiceErrors": {
                "unsupported": "Rozpoznawanie mowy nie jest wspierane.",
                "insecure": "Do obsługi głosu wymagane jest połączenie HTTPS.",
                "denied": "Odmówiono dostępu do mikrofonu.",
                "noDevice": "Nie wykryto mikrofonu.",
                "micFailed": "Inicjalizacja mikrofonu nie powiodła się.",
                "rateLimit": "Przekroczono limit zapytań głosowych.",
                "providerQuota": "Wyczerpano limit dostawcy głosu.",
                "noKey": "Usługa głosowa nie jest skonfigurowana.",
                "modelFailed": "Błąd modelu głosu.",
                "network": "Błąd sieci podczas syntezy mowy.",
                "serverError": "Błąd serwera mowy."
            }
        },
        "footer": {
            "copyright": "© 2026-2050 Hayaati Web Technology. Wszelkie prawa zastrzeżone.",
            "disclaimer": "Plan badawczo-architektoniczny dla technologii spekulatywnych i rozwijających się.",
            "liveDomainLabel": "DOMENA", "quickLinks": "SKRÓTY",
            "systemDesignation": "OZNACZENIE SYSTEMU: HAYAATI-CORE-V5", "allRightsReserved": "Wszelkie prawa zastrzeżone."
        },
        "common": {
            "year": "Rok", "status": "Stan", "operational": "Operacyjny", "close": "Zamknij",
            "back": "Wstecz", "retry": "Ponów", "error": "Błąd", "success": "Sukces", "loading": "Ładowanie..."
        },
        "languageSelector": {
            "selectLanguage": "Wybierz Język Międzynarodowy", "dialogTitle": "Wybór Języka",
            "searchPlaceholder": "Filtruj języki (np. Polski, English)...", "languagesCountSuffix": "Języków"
        },
        "imageSlot": {"opticalChannel": "KANAŁ OPTYCZNY", "framePending": "ŁADOWANIE KLATKI", "sysDim": "SYS//800x500"},
        "notFound": {
            "errorTag": "BŁĄD 404 // SEKTOR NIE ZNALEZIONY", "title": "Sygnał Utracony w Głębokim Kosmosie",
            "description": "Żądane współrzędne nie odpowiadają żadnemu znanemu systemowi przyszłości.", "returnBtn": "Powrót do Bazy Orbitalnej"
        },
        "eras": {
            "era-2030": {
                "title": "Fundament Kognitywny", "yearLabel": "EPOKA // 2030",
                "story": "Poranki zaczynają się od otoczeniowej AI, która optymalizuje sieci energetyczne podczas Twojego snu. Miasto funkcjonuje płynnie dzięki cichym elektrycznym wahadłowcom i podziemnym kapsułom dostawczym.",
                "breakthroughs": [
                    "Otoczeniowi asystenci AI na urządzeniach, optymalizujący codzienny rytm bez opóźnień chmurowych",
                    "Pakiety akumulatorów litowo-metalowych ze stałym elektrolitem, zapewniające 1000 km zasięgu w transporcie miejskim",
                    "Oficjalna certyfikacja komercyjna autonomicznych taksówek powietrznych w głównych korytarzach miejskich"
                ],
                "bannerAlt": "Kinowy widok zrównoważonej metropolii 2030 r. z czystymi korytarzami transportowymi",
                "bannerPrompt": "Kinowa panorama zrównoważonej metropolii nadmorskiej o świcie, wieże z fotowoltaicznego szkła, elektryczne promy, pionowe ogrody, rozdzielczość 8k."
            },
            "era-2035": {
                "title": "Synteza Biomechaniczna", "yearLabel": "EPOKA // 2035",
                "story": "Interfejsy neuronowe umożliwiają bezwysiłkowe sterowanie systemami cyfrowymi za pomocą myśli. Medycyna prewencyjna działa 24/7 na poziomie komórkowym dzięki biokompatybilnym nanocząsteczkom.",
                "breakthroughs": [
                    "Podskórne czujniki optoelektroniczne do ciągłego monitorowania parametrów metabolicznych",
                    "Nieinwazyjne dekodery kory ruchowej przywracające sprawność fizyczną",
                    "Przemysłowe bioreaktory grzybniowe wytwarzające ekologiczne, ultra-wytrzymałe materiały budowlane"
                ],
                "bannerAlt": "Kinowy widok wertykalnego miasta z biokopułami i liniami kolei magnetycznej",
                "bannerPrompt": "Panorama pionowego miasta o zmierzchu z tubami maglev i szklarniami aeroponicznymi, rozdzielczość 8k."
            },
            "era-2050": {
                "title": "Horyzont Planetarny i Orbitalny", "yearLabel": "EPOKA // 2050",
                "story": "Ciężki przemysł produkcyjny został przeniesiony z biosfery Ziemi do rafinerii w mikrograwitacji. Komercyjna fuzja jądrowa i gospodarki o obiegu zamkniętym przywracają równowagę oceanów i atmosfery.",
                "breakthroughs": [
                    "Komercyjne elektrownie termojądrowe z pułapką magnetyczną zapewniające czystą moc podstawową",
                    "Stałe bazy na południowym biegunie Księżyca do wydobycia lodu wodnego i produkcji paliwa kosmicznego",
                    "Planetarne instalacje biologii syntetycznej zaprojektowane do sekwestracji miliardów ton węgla atmosferycznego"
                ],
                "bannerAlt": "Widok na Ziemię ze stacji orbitalnych i modułów mieszkalnych",
                "bannerPrompt": "Kinowy widok Ziemi ze stacji orbitalnej na niskiej orbicie okołoziemskiej, błękitna krzywizna planety, głęboki kosmos, 8k."
            }
        }
    },
    "fa": {
        "name": "Persian",
        "native": "فارسی",
        "rtl": True,
        "nav": {
            "home": "صفحه اصلی", "timeline": "خط زمانی آینده", "tech": "فناوری آینده", "places": "شهرها و سکونتگاه‌ها",
            "projects": "پروژه‌های من", "advertise": "تبلیغ / ثبت پروژه", "about": "درباره من", "contact": "تماس",
            "assistant": "دستیار هوش مصنوعی", "language": "زبان", "menu": "باز کردن منو", "close": "بستن منو",
            "brandSubtitle": "فناوری // ۲۰۳۰-۲۰۵۰", "menuSysHeader": "منوی سیستم", "locationDomain": "گره: WWW.HAYAATIWEB.SITE"
        },
        "hero": {
            "systemStatus": "سیستم//گره.۲۰۳۰-۲۰۵۰", "online": "تمام سیستم‌ها فعال",
            "headline": "آینده خودبه‌خود رخ نمی‌دهد. ما آن را با هم می‌سازیم.",
            "subtitle": "طرحی سینمایی از نوآوری انسان، ماشین‌های شناختی، مستعمرات مداری و زیستگاه‌های پایدار از ۲۰۳۰ تا ۲۰۵۰. توسعه‌یافته توسط Aliya Khan.",
            "exploreCta": "کاوش ۲۰۳۰ ۲۰۵۰", "projectsCta": "مشاهده پروژه‌ها",
            "coordinates": "موقعیت: ۲۸.۶۱۳۹° شمالی، ۷۷.۲۰۹۰° شرقی // موتور فعال", "timelineSpan": "افق ۲۰۳۰ — ۲۰۵۰",
            "liveTelemetry": "تله‌متری: عادی", "scrollDown": "برای کاوش خط زمانی به پایین پیمایش کنید",
            "imageAlt": "نمای سینمایی از کلان‌شهر آینده‌نگرانه ۲۰۳۰ ۲۰۵۰"
        },
        "timeline": {
            "sectionTag": "نقشه_زمانی // ۲۰۳۰ -> ۲۰۵۰", "title": "گاه‌شمار نوآوری بشر",
            "subtitle": "از هوش لبه‌ای فراگیر در ۲۰۳۰ تا صنایع سنگین مداری در ۲۰۵۰.",
            "chronoMap": "طرح گاه‌شناختی", "eraHeading": "افق عصر", "storyTitle": "یک روز در این عصر",
            "breakthroughsTitle": "نقاط عطف کلیدی فناوری", "viewEraDetails": "مشاهده پرونده عصر",
            "jumpToEra": "رفتن به این عصر", "statusPrefix": "وضعیت سیستم", "eraBreakthroughsHeading": "دستاوردهای نوین",
            "specificationsCount": "مشخصات فنی"
        },
        "tech": {
            "sectionTag": "فهرست_سیستم‌ها // ۴۲ حوزه پیشگام", "title": "کاتالوگ فناوری‌های آینده",
            "subtitle": "طرح‌های جامع سیستمی و سازوکارهای علمی در ۷ مرز بنیادین فناوری.",
            "systemsIndex": "فهرست کاتالوگ", "howItWorksLabel": "نحوه کارکرد",
            "architectureMechanics": "معماری فنی و مکانیک", "underlyingMechanism": "اصل بنیادین فیزیک",
            "searchPlaceholder": "جستجوی فناوری‌ها، سیستم‌ها یا پیشرفت‌ها...", "searchNoResults": "فناوری متناسبی یافت نشد.",
            "filterAll": "تمام دسته‌ها", "modalClose": "بستن پرونده", "viewDossier": "مشاهده پرونده فنی",
            "yearLabel": "سال", "statusLabel": "وضعیت", "activeStatus": "سیستم فعال", "promptLabel": "پرامپت",
            "categories": {
                "all": "تمام دسته‌ها", "ai": "هوش مصنوعی آینده", "vehicles": "وسایل نقلیه و جابجایی", "devices": "دستگاه‌ها و بیونیک",
                "homeWork": "خانه و محیط کار", "health": "سلامت و زیست‌شناسی", "energy": "انرژی و اقلیم", "space": "اعماق فضا"
            }
        },
        "places": {
            "sectionTag": "فهرست_زیستگاه‌ها // ۲۰۳۰-۲۰۵۰", "title": "کارت‌پستال‌های شهرها و سکونتگاه‌ها",
            "subtitle": "تصاویر واقع‌گرایانه و پرونده‌های زیرساختی از سکونتگاه‌های نوظهور بشر روی زمین و مدار.",
            "horizonLabel": "افق", "aDayInPlace": "یک روز در این سکونتگاه", "infrastructureLabel": "زیرساخت‌های حیاتی",
            "viewLocation": "بررسی طرح سکونتگاه", "promptLabel": "پرامپت"
        },
        "projects": {
            "sectionTag": "پروژه‌های_بنیان‌گذار // ALIYA KHAN", "title": "پروژه‌های من",
            "subtitle": "سیستم‌های نرم‌افزاری فعال، آرشیوهای تحقیقاتی و طرح‌های معماری ساخته شده توسط Aliya Khan.",
            "tabs": {"live": "سیستم‌های زنده", "inProgress": "در حال توسعه", "futureIdeas": "ایده‌های آینده"},
            "visit": "مشاهده سیستم", "emptyLive": "در حال حاضر سیستم زنده‌ای در دسترس نیست. پروژه‌های جدید به زودی افزوده می‌شوند.",
            "emptyInProgress": "طرح‌های مهندسی به محض تکمیل مراحل در اینجا قرار خواهند گرفت.",
            "emptyIdeas": "پیشنهادهای تحقیقاتی نظری در این بخش فهرست می‌شوند.",
            "pendingNotice": "پروژه‌ها مستقیماً توسط Aliya Khan بررسی و همگام‌سازی می‌شوند."
        },
        "advertise": {
            "sectionTag": "ثبت_پروژه // فهرست‌بندی", "title": "تبلیغ / ثبت پروژه شما",
            "subtitle": "فناوری پیشگام یا ابتکار پایدار خود را جهت بررسی توسط Aliya Khan ارسال کنید.",
            "reviewNotice": "تمام درخواست‌ها شخصاً توسط Aliya Khan ارزیابی می‌شوند. پیام‌های تبلیغاتی اسپم رد خواهند شد.",
            "pricingNote": "جزئیات جایگذاری و شرایط همکاری مستقیماً از طریق ایمیل ارسال می‌شود.",
            "form": {
                "name": "نام کامل", "email": "ایمیل کاری", "projectName": "نام پروژه یا شرکت",
                "projectLink": "پیوند سیستم یا مقاله سفید", "category": "حوزه فناوری", "selectCategory": "انتخاب حوزه...",
                "budget": "برآورد بودجه", "budgetPlaceholder": "مثلاً ۵,۰۰۰ تا ۲۵,۰۰۰ دلار",
                "description": "مرور کلی فنی و اهمیت برای آینده",
                "submitBtn": "ارسال پرونده جهت بررسی", "sending": "در حال ارسال...",
                "sentSuccess": "پرونده با موفقیت برای Aliya Khan ارسال شد. به زودی با شما تماس گرفته می‌شود.",
                "sendError": "خطا در ارسال. لطفاً اتصال اینترنت را بررسی کرده و دوباره تلاش کنید."
            }
        },
        "about": {
            "sectionTag": "پرونده_معمار // مشخصات سیستم", "title": "درباره Aliya Khan",
            "subtitle": "بنیان‌گذار، طراح ارشد و معمار سیستم‌های Hayaati Web Technology.",
            "ownerName": "Aliya Khan", "architectTitle": "بنیان‌گذار و طراح ارشد",
            "leadArchitect": "معمار ارشد // HAYAATI WEB TECHNOLOGY",
            "bioPlaceholder": "Aliya Khan طراح و توسعه‌دهنده نرم‌افزار و چشم‌اندازهای زیرساختی برای گذار از ۲۰۳۰ به ۲۰۵۰ است.",
            "contactDirect": "کانال ارتباط مستقیم: Hayaati.Technology@gmail.com",
            "photoAlt": "Aliya Khan — بنیان‌گذار و طراح ارشد Hayaati Web Technology"
        },
        "contact": {
            "sectionTag": "کانال_مستقیم // ارتباط", "title": "تماس و همکاری",
            "subtitle": "جهت پژوهش، مشاوره معماری یا همکاری‌های استراتژیک مستقیماً با Aliya Khan در ارتباط باشید.",
            "emailLabel": "ایمیل رسمی", "directEmail": "Hayaati.Technology@gmail.com",
            "form": {
                "name": "نام شما", "email": "ایمیل شما", "message": "پیام یا پیشنهاد شما",
                "submitBtn": "ارسال پیام", "sending": "در حال ارسال...",
                "sentSuccess": "پیام با موفقیت برای Aliya Khan ارسال شد.", "sendError": "خطا در ارسال پیام. دوباره تلاش کنید.",
                "placeholderName": "مثلاً دکتر مریم میرزاخانی", "placeholderEmail": "maryam@frontiertech.org",
                "placeholderMessage": "پژوهش، ایده همکاری یا پرسش خود را شرح دهید..."
            }
        },
        "assistant": {
            "buttonLabel": "گفتگو با Hayaati", "panelTitle": "هسته شناختی HAYAATI",
            "subtitle": "رابط عصبی هولوگرافیک کوانتومی // صوت و متن",
            "welcomeMessage": "اتصال سیستم برقرار شد. من Hayaati هستم، راهنمای شناختی شما در خط زمانی ۲۰۳۰-۲۰۵۰.",
            "chips": ["سال ۲۰۳۰ چگونه خواهد بود؟", "فناوری سلامت آینده را نشان بده", "درباره Hayaati و Aliya Khan بگو"],
            "inputPlaceholder": "درباره فناوری‌های ۲۰۳۰–۲۰۵۰ بپرسید...", "sendBtn": "ارسال",
            "retryBtn": "تلاش مجدد", "voiceBtn": "فعال‌سازی صدا", "voiceStopBtn": "توقف صدا",
            "voiceListening": "در حال شنیدن...", "voiceSpeaking": "در حال صحبت...", "voiceConnecting": "در حال اتصال...",
            "voiceUnsupported": "ورودی صوتی در این مرورگر پشتیبانی نمی‌شود.",
            "voiceNotAvailableLang": "صوت برای این زبان در دسترس نیست.",
            "rateLimitBanner": "محدودیت درخواست رخ داد. لطفاً کمی صبر کنید.",
            "talkTo": "با Hayaati صحبت کنید", "typeInstead": "یا در زیر بنویسید", "returnToOrb": "بازگشت به هسته",
            "muteMic": "قطع میکروفون", "unmuteMic": "وصل میکروفون", "micLabel": "میکروفون",
            "mutedLabel": "بی‌صدا", "endSession": "پایان نشست", "endLabel": "پایان",
            "userTag": "کاربر", "assistantTag": "HAYAATI", "cognitiveLink": "پیوند شناختی فعال",
            "orb": {
                "ready": "آماده", "listening": "شنیدن", "thinking": "پردازش",
                "speaking": "صحبت", "tapToStart": "لمس برای گفتگو", "start": "شروع"
            },
            "errors": {
                "quotaReached": "سهمیه گفتگوی روزانه به پایان رسید. لطفاً فردا مراجعه فرمایید.",
                "serverBusy": "هسته شناختی مشغول است. لطفاً شکیبا باشید.",
                "networkError": "خطای شبکه. لطفاً اتصال خود را بررسی کنید.",
                "micBlocked": "دسترسی به میکروفون توسط مرورگر مسدود شده است.",
                "sessionEnded": "نشست به پایان رسید.", "genericError": "خطای غیرمنتظره‌ای رخ داد."
            },
            "voiceErrors": {
                "unsupported": "تشخیص گفتار پشتیبانی نمی‌شود.",
                "insecure": "برای استفاده از صوت پروتکل HTTPS الزامی است.",
                "denied": "دسترسی به میکروفون رد شد.",
                "noDevice": "میکروفونی یافت نشد.",
                "micFailed": "راه‌اندازی میکروفون ناموفق بود.",
                "rateLimit": "محدودیت نرخ صوتی رخ داد.",
                "providerQuota": "سهمیه سرویس صوتی تمام شد.",
                "noKey": "سرویس صوتی پیکربندی نشده است.",
                "modelFailed": "مدل صوتی با خطا مواجه شد.",
                "network": "خطای شبکه هنگام تولید صدا.",
                "serverError": "خطای سرور صوتی."
            }
        },
        "footer": {
            "copyright": "© ۲۰۲۶-۲۰۵۰ Hayaati Web Technology. تمامی حقوق محفوظ است.",
            "disclaimer": "طرح پژوهشی و معماری برای فناوری‌های گمانه‌زنانه و نوظهور.",
            "liveDomainLabel": "دامنه فعال", "quickLinks": "پیوندهای سریع",
            "systemDesignation": "شناسه سیستم: HAYAATI-CORE-V5", "allRightsReserved": "تمامی حقوق محفوظ است."
        },
        "common": {
            "year": "سال", "status": "وضعیت", "operational": "عملیاتی", "close": "بستن",
            "back": "بازگشت", "retry": "تلاش مجدد", "error": "خطا", "success": "موفقیت", "loading": "در حال بارگذاری..."
        },
        "languageSelector": {
            "selectLanguage": "انتخاب زبان بین‌المللی", "dialogTitle": "انتخاب زبان",
            "searchPlaceholder": "فیلتر زبان‌ها (مثلاً فارسی، English)...", "languagesCountSuffix": "زبان"
        },
        "imageSlot": {"opticalChannel": "کانال نوری", "framePending": "در انتظار فریم", "sysDim": "SYS//800x500"},
        "notFound": {
            "errorTag": "خطای ۴۰۴ // بخش یافت نشد", "title": "سیگنال در اعماق فضا گم شد",
            "description": "مختصات درخواستی با هیچ سیستم آینده شناخته‌شده‌ای مطابقت ندارد.", "returnBtn": "بازگشت به فرماندهی مدار"
        },
        "eras": {
            "era-2030": {
                "title": "بنیان شناختی", "yearLabel": "عصر // ۲۰۳۰",
                "story": "صبح‌ها با هوش مصنوعی محیطی آغاز می‌شود که در حین خواب شبکه‌های انرژی را متعادل می‌سازد. شهر با شاتل‌های برقی بی‌صدا و کپسول‌های تحویل زیرزمینی بدون ترافیک حرکت می‌کند.",
                "breakthroughs": [
                    "دستیاران هوش مصنوعی محیطی روی دستگاه‌ها برای بهینه‌سازی ریتم زندگی بدون تاخیر ابری",
                    "بسته‌های باتری لیتیوم-فلز حالت جامد برای پشتیبانی ۱۰۰۰ کیلومتری حمل‌ونقل شهری",
                    "صدور گواهینامه تجاری رسمی برای تاکسی‌های هوایی خودران در کریدورهای هوایی شهری"
                ],
                "bannerAlt": "نمای سینمایی از کلان‌شهر پایدار ۲۰۳۰ با کریدورهای حمل و نقل پاک",
                "bannerPrompt": "پانورامای سینمایی از یک کلان‌شهر ساحلی پایدار در سپیده‌دم، برج‌های شیشه‌ای خورشیدی، شاتل‌های برقی، باغ‌های عمودی، کیفیت 8k."
            },
            "era-2035": {
                "title": "سنتز بیومکانیکی", "yearLabel": "عصر // ۲۰۳۵",
                "story": "رابط‌های عصبی امکان هدایت بی‌دردسر سیستم‌های دیجیتال را تنها با فکر فراهم می‌آورند. پزشکی پیشگیرانه به صورت شبانه‌روزی از طریق نانوحسگرهای زیست‌سازگار در سطح سلولی فعالیت می‌کند.",
                "breakthroughs": [
                    "حسگرهای اپتوالکترونیک زیرپوستی برای نظارت مداوم بر متابولیسم بدن",
                    "رمزگشاهای غیرتهاجمی قشر حرکتی مغز برای بازگرداندن تحرک فیزیکی",
                    "بیوراکتورهای صنعتی میسلیوم برای تولید مصالح ساختمانی پایدار و فوق‌مستحکم"
                ],
                "bannerAlt": "نمای سینمایی از شهر عمودی دارای زیست‌گنبدها و خطوط قطار مغناطیسی",
                "bannerPrompt": "پانورامای شهر عمودی در غروب با لوله‌های مگلو و گلخانه‌های ایروپونیک، کیفیت 8k."
            },
            "era-2050": {
                "title": "افق سیاره‌ای و مداری", "yearLabel": "عصر // ۲۰۵۰",
                "story": "تولید صنایع سنگین از زیست‌کره زمین به پالایشگاه‌های گرانش صفر مداری منتقل شده است. گداخت هسته‌ای تجاری و اقتصادهای چرخه‌ای تعادل اقیانوس‌ها و جو را بازیابی کرده‌اند.",
                "breakthroughs": [
                    "نیروگاه‌های همجوشی هسته‌ای تجاری محصورسازی مغناطیسی برای تامین برق پاک مداوم",
                    "پایگاه‌های دائمی در قطب جنوب ماه برای استخراج یخ آب و تولید سوخت فضایی",
                    "تاسیسات زیست‌شناسی سنتتیک سیاره‌ای برای جذب میلیاردها تن کربن اتمسفر"
                ],
                "bannerAlt": "نمای زمین از ایستگاه‌های مداری و ماژول‌های سکونتگاهی",
                "bannerPrompt": "نمای سینمایی از زمین از ایستگاه انتقال فضایی در مدار پایینی، انحنای آبی کره زمین، تاریکی فضا، 8k."
            }
        }
    },
    "th": {
        "name": "Thai",
        "native": "ไทย",
        "rtl": False,
        "nav": {
            "home": "หน้าแรก", "timeline": "ไทม์ไลน์แห่งอนาคต", "tech": "เทคโนโลยีแห่งอนาคต", "places": "เมืองและถิ่นที่อยู่",
            "projects": "โครงการของฉัน", "advertise": "ลงประกาศ / ส่งโครงการ", "about": "เกี่ยวกับ", "contact": "ติดต่อ",
            "assistant": "ผู้ช่วย AI", "language": "ภาษา", "menu": "เปิดเมนูการนำทาง", "close": "ปิดเมนูการนำทาง",
            "brandSubtitle": "เทคโนโลยี // 2030-2050", "menuSysHeader": "เมนูระบบ", "locationDomain": "โหนด: WWW.HAYAATIWEB.SITE"
        },
        "hero": {
            "systemStatus": "ระบบ//โหนด.2030-2050", "online": "ระบบทั้งหมดออนไลน์",
            "headline": "อนาคตไม่ได้เกิดขึ้นเอง เราสร้างมันขึ้นมาด้วยกัน",
            "subtitle": "พิมพ์เขียวแห่งนวัตกรรมมนุษย์ เครื่องจักรแห่งการรับรู้ นิคมในวงโคจร และถิ่นที่อยู่อาศัยที่ยั่งยืนระหว่างปี 2030 ถึง 2050 สร้างสรรค์โดย Aliya Khan",
            "exploreCta": "สำรวจปี 2030 2050", "projectsCta": "ดูโครงการของฉัน",
            "coordinates": "พิกัด: 28.6139° N, 77.2090° E // เครื่องยนต์ทำงาน", "timelineSpan": "ช่วงเวลา 2030 — 2050",
            "liveTelemetry": "เทเลเมทรี: ปกติ", "scrollDown": "เลื่อนลงเพื่อสำรวจไทม์ไลน์",
            "imageAlt": "ภาพมุมกว้างแห่งอนาคตของมหานครปี 2030 2050"
        },
        "timeline": {
            "sectionTag": "แผนที่เวลา // 2030 -> 2050", "title": "บันทึกนวัตกรรมของมนุษยชาติ",
            "subtitle": "จากปัญญาประดิษฐ์เอดจ์ที่แพร่หลายในปี 2030 สู่อุตสาหกรรมหนักในวงโคจรในปี 2050",
            "chronoMap": "พิมพ์เขียวตามลำดับเวลา", "eraHeading": "ขอบเขตแห่งยุค", "storyTitle": "หนึ่งวันในยุคนี้",
            "breakthroughsTitle": "หมุดหมายสำคัญทางเทคโนโลยี", "viewEraDetails": "เปิดเอกสารประจำยุค",
            "jumpToEra": "ข้ามไปยังยุคนี้", "statusPrefix": "สถานะระบบ", "eraBreakthroughsHeading": "ความก้าวหน้า",
            "specificationsCount": "ข้อกำหนดทางเทคนิค"
        },
        "tech": {
            "sectionTag": "ดัชนีระบบ // 42 สาขาแนวหน้า", "title": "แคตตาล็อกเทคโนโลยีแห่งอนาคต",
            "subtitle": "พิมพ์เขียวระบบและกลไกทางวิทยาศาสตร์ที่ครอบคลุม 7 พรมแดนเทคโนโลยีขั้นพื้นฐาน",
            "systemsIndex": "ดัชนีแคตตาล็อก", "howItWorksLabel": "หลักการทำงาน",
            "architectureMechanics": "สถาปัตยกรรมทางเทคนิคและกลไก", "underlyingMechanism": "หลักการทางฟิสิกส์พื้นฐาน",
            "searchPlaceholder": "ค้นหาเทคโนโลยี ระบบ หรือความก้าวหน้า...", "searchNoResults": "ไม่พบเทคโนโลยีที่ตรงกัน",
            "filterAll": "ทุกหมวดหมู่", "modalClose": "ปิดเอกสาร", "viewDossier": "ดูเอกสารทางเทคนิค",
            "yearLabel": "ปี", "statusLabel": "สถานะ", "activeStatus": "ระบบทำงานอยู่", "promptLabel": "คำสั่งภาพ",
            "categories": {
                "all": "ทุกหมวดหมู่", "ai": "AI แห่งอนาคต", "vehicles": "ยานยนต์และการเดินทาง", "devices": "อุปกรณ์และไบโอนิกส์",
                "homeWork": "ที่อยู่อาศัยและการทำงาน", "health": "สุขภาพและชีวภาพ", "energy": "พลังงานและสภาพภูมิอากาศ", "space": "อวกาศห้วงลึก"
            }
        },
        "places": {
            "sectionTag": "ดัชนีถิ่นที่อยู่ // 2030-2050", "title": "โปสการ์ดเมืองและถิ่นที่อยู่",
            "subtitle": "ภาพถ่ายเสมือนจริงและรายงานโครงสร้างพื้นฐานของถิ่นฐานมนุษย์ยุคใหม่บนโลกและในวงโคจร",
            "horizonLabel": "ขอบฟ้า", "aDayInPlace": "หนึ่งวันในถิ่นที่อยู่นี้", "infrastructureLabel": "โครงสร้างพื้นฐานสำคัญ",
            "viewLocation": "สำรวจแผนผังถิ่นที่อยู่", "promptLabel": "คำสั่งภาพ"
        },
        "projects": {
            "sectionTag": "โครงการของผู้ก่อตั้ง // ALIYA KHAN", "title": "โครงการของฉัน",
            "subtitle": "ระบบซอฟต์แวร์ที่ใช้งานอยู่ คลังงานวิจัย และงานออกแบบสถาปัตยกรรมที่พัฒนาโดย Aliya Khan",
            "tabs": {"live": "ระบบที่เปิดใช้งาน", "inProgress": "อยู่ระหว่างพัฒนา", "futureIdeas": "แนวคิดแห่งอนาคต"},
            "visit": "เปิดระบบ", "emptyLive": "ขณะนี้ยังไม่มีระบบเปิดใช้งาน จะมีการเพิ่มโครงการใหม่เร็วๆ นี้",
            "emptyInProgress": "แบบร่างทางวิศวกรรมจะปรากฏที่นี่เมื่อแต่ละขั้นตอนเสร็จสมบูรณ์",
            "emptyIdeas": "ข้อเสนองานวิจัยเชิงทฤษฎีจะถูกจัดทำเป็นแคตตาล็อกที่นี่",
            "pendingNotice": "โครงการได้รับการตรวจสอบและซิงโครไนซ์โดยตรงโดย Aliya Khan"
        },
        "advertise": {
            "sectionTag": "การส่งโครงการ // การจัดแสดง", "title": "ลงประกาศ / ส่งโครงการของคุณ",
            "subtitle": "ส่งเทคโนโลยีบุกเบิกหรือนวัตกรรมที่ยั่งยืนของคุณเพื่อรับการพิจารณาโดย Aliya Khan",
            "reviewNotice": "ใบสมัครทั้งหมดได้รับการตรวจสอบเป็นการส่วนตัวโดย Aliya Khan สแปมเชิงพาณิชย์จะถูกปฏิเสธ",
            "pricingNote": "รายละเอียดตำแหน่งและเงื่อนไขความร่วมมือจะแจ้งให้ทราบทางอีเมลโดยตรง",
            "form": {
                "name": "ชื่อ-นามสกุล", "email": "อีเมลติดต่อทางธุรกิจ", "projectName": "ชื่อโครงการหรือบริษัท",
                "projectLink": "ลิงก์ระบบหรือเอกสารไวท์เปเปอร์", "category": "สาขาเทคโนโลยี", "selectCategory": "เลือกหมวดหมู่...",
                "budget": "งบประมาณโดยประมาณ", "budgetPlaceholder": "เช่น $5,000 - $25,000",
                "description": "ภาพรวมทางเทคนิคและความสำคัญต่ออนาคต",
                "submitBtn": "ส่งข้อมูลเพื่อรับการประเมิน", "sending": "กำลังส่งข้อมูล...",
                "sentSuccess": "ส่งข้อมูลไปยัง Aliya Khan เรียบร้อยแล้ว เราจะติดต่อกลับในไม่ช้า",
                "sendError": "การส่งล้มเหลว โปรดตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง"
            }
        },
        "about": {
            "sectionTag": "แฟ้มประวัติสถาปนิก // ข้อมูลระบบ", "title": "เกี่ยวกับ Aliya Khan",
            "subtitle": "ผู้ก่อตั้ง หัวหน้านักออกแบบ และสถาปนิกประจำ Hayaati Web Technology",
            "ownerName": "Aliya Khan", "architectTitle": "ผู้ก่อตั้งและหัวหน้านักออกแบบ",
            "leadArchitect": "หัวหน้าสถาปนิก // HAYAATI WEB TECHNOLOGY",
            "bioPlaceholder": "Aliya Khan ออกแบบและพัฒนาระบบซอฟต์แวร์รวมถึงวิสัยทัศน์โครงสร้างพื้นฐานสำหรับช่วงเปลี่ยนผ่านปี 2030 ถึง 2050",
            "contactDirect": "ช่องทางติดต่อโดยตรง: Hayaati.Technology@gmail.com",
            "photoAlt": "Aliya Khan — ผู้ก่อตั้งและหัวหน้านักออกแบบ Hayaati Web Technology"
        },
        "contact": {
            "sectionTag": "ช่องทางตรง // การสื่อสาร", "title": "ติดต่อและความร่วมมือ",
            "subtitle": "ติดต่อโดยตรงกับ Aliya Khan สำหรับงานวิจัย คำปรึกษาทางสถาปัตยกรรม หรือความร่วมมือเชิงกลยุทธ์",
            "emailLabel": "อีเมลทางการ", "directEmail": "Hayaati.Technology@gmail.com",
            "form": {
                "name": "ชื่อของคุณ", "email": "อีเมลของคุณ", "message": "ข้อความหรือข้อเสนอ",
                "submitBtn": "ส่งข้อความ", "sending": "กำลังส่ง...",
                "sentSuccess": "ส่งข้อความถึง Aliya Khan เรียบร้อยแล้ว", "sendError": "เกิดข้อผิดพลาดในการส่ง โปรดลองอีกครั้ง",
                "placeholderName": "เช่น ดร. สมชาย วิจิตร", "placeholderEmail": "somchai@frontiertech.org",
                "placeholderMessage": "อธิบายงานวิจัย แนวคิดความร่วมมือ หรือคำถามของคุณ..."
            }
        },
        "assistant": {
            "buttonLabel": "คุยกับ Hayaati", "panelTitle": "แกนปัญญาประดิษฐ์ HAYAATI",
            "subtitle": "อินเทอร์เฟซโครงข่ายประสาทโฮโลกราฟิกควอนตัม // เสียงและข้อความ",
            "welcomeMessage": "เชื่อมต่อระบบสำเร็จ ฉันคือ Hayaati ผู้นำทางการรับรู้ของคุณผ่านช่วงเวลาปี 2030-2050",
            "chips": ["ปี 2030 จะมีหน้าตาเป็นอย่างไร?", "แสดงเทคโนโลยีสุขภาพแห่งอนาคต", "บอกเล่าเกี่ยวกับ Hayaati และ Aliya Khan"],
            "inputPlaceholder": "ถามคำถามเกี่ยวกับเทคโนโลยีปี 2030–2050...", "sendBtn": "ส่ง",
            "retryBtn": "ลองใหม่", "voiceBtn": "เปิดเสียง", "voiceStopBtn": "หยุดเสียง",
            "voiceListening": "กำลังฟัง...", "voiceSpeaking": "กำลังพูด...", "voiceConnecting": "กำลังเชื่อมต่อ...",
            "voiceUnsupported": "เบราว์เซอร์นี้ไม่รองรับการสั่งงานด้วยเสียง",
            "voiceNotAvailableLang": "ระบบเสียงไม่พร้อมใช้งานสำหรับภาษานี้",
            "rateLimitBanner": "ถึงขีดจำกัดการใช้งานชั่วคราว โปรดรอสักครู่",
            "talkTo": "พูดคุยกับ Hayaati", "typeInstead": "หรือพิมพ์ข้อความด้านล่าง", "returnToOrb": "กลับสู่แกนหลัก",
            "muteMic": "ปิดไมโครโฟน", "unmuteMic": "เปิดไมโครโฟน", "micLabel": "ไมโครโฟน",
            "mutedLabel": "ปิดเสียงอยู่", "endSession": "จบเซสชัน", "endLabel": "สิ้นสุด",
            "userTag": "ผู้ใช้", "assistantTag": "HAYAATI", "cognitiveLink": "การเชื่อมต่อทางปัญญาทำงาน",
            "orb": {
                "ready": "พร้อม", "listening": "กำลังฟัง", "thinking": "กำลังประมวลผล",
                "speaking": "กำลังพูด", "tapToStart": "แตะเพื่อเริ่มพูด", "start": "เริ่มต้น"
            },
            "errors": {
                "quotaReached": "โควตาการสนทนาประจำวันเต็มแล้ว โปรดกลับมาใหม่ในวันพรุ่งนี้",
                "serverBusy": "แกนประมวลผลกำลังทำงานหนัก โปรดรอสักครู่",
                "networkError": "ข้อผิดพลาดของเครือข่าย โปรดตรวจสอบการเชื่อมต่อ",
                "micBlocked": "การเข้าถึงไมโครโฟนถูกบล็อกโดยเบราว์เซอร์",
                "sessionEnded": "เซสชันสิ้นสุดลงแล้ว", "genericError": "เกิดข้อผิดพลาดที่ไม่คาดคิด"
            },
            "voiceErrors": {
                "unsupported": "ไม่รองรับการรู้จำเสียงพูด",
                "insecure": "ต้องใช้ HTTPS เพื่อใช้งานฟังก์ชันเสียง",
                "denied": "การอนุญาตใช้ไมโครโฟนถูกปฏิเสธ",
                "noDevice": "ตรวจไม่พบไมโครโฟน",
                "micFailed": "การเริ่มต้นไมโครโฟนล้มเหลว",
                "rateLimit": "ถึงขีดจำกัดอัตราการส่งเสียง",
                "providerQuota": "เกินโควตาผู้ให้บริการเสียง",
                "noKey": "ยังไม่ได้กำหนดค่าบริการเสียง",
                "modelFailed": "โมเดลเสียงทำงานล้มเหลว",
                "network": "เครือข่ายขัดข้องระหว่างสังเคราะห์เสียง",
                "serverError": "เซิร์ฟเวอร์เสียงขัดข้อง"
            }
        },
        "footer": {
            "copyright": "© 2026-2050 Hayaati Web Technology สงวนลิขสิทธิ์ทั้งหมด",
            "disclaimer": "พิมพ์เขียวการวิจัยและสถาปัตยกรรมสำหรับเทคโนโลยีเชิงคาดการณ์และเทคโนโลยีเกิดใหม่",
            "liveDomainLabel": "โดเมนที่ใช้งาน", "quickLinks": "ลิงก์ด่วน",
            "systemDesignation": "รหัสระบบ: HAYAATI-CORE-V5", "allRightsReserved": "สงวนลิขสิทธิ์ทั้งหมด"
        },
        "common": {
            "year": "ปี", "status": "สถานะ", "operational": "พร้อมใช้งาน", "close": "ปิด",
            "back": "ย้อนกลับ", "retry": "ลองใหม่", "error": "ข้อผิดพลาด", "success": "สำเร็จ", "loading": "กำลังโหลด..."
        },
        "languageSelector": {
            "selectLanguage": "เลือกภาษานานาชาติ", "dialogTitle": "ตัวเลือกภาษา",
            "searchPlaceholder": "ค้นหาภาษา (เช่น ไทย, English)...", "languagesCountSuffix": "ภาษา"
        },
        "imageSlot": {"opticalChannel": "ช่องสัญญาณแสง", "framePending": "กำลังโหลดเฟรมภาพ", "sysDim": "SYS//800x500"},
        "notFound": {
            "errorTag": "ข้อผิดพลาด 404 // ไม่พบเซกเตอร์", "title": "สัญญาณขาดหายในห้วงอวกาศลึก",
            "description": "พิกัดที่ร้องขอไม่ตรงกับระบบหรือถิ่นฐานแห่งอนาคตที่รู้จัก", "returnBtn": "กลับสู่ศูนย์บัญชาการวงโคจร"
        },
        "eras": {
            "era-2030": {
                "title": "รากฐานแห่งการรับรู้", "yearLabel": "ยุค // 2030",
                "story": "ยามเช้าเริ่มต้นด้วย AI สภาพแวดล้อมที่ช่วยปรับสมดุลโครงข่ายพลังงานขณะที่คุณหลับ เมืองทำงานอย่างราบรื่นด้วยรถรับส่งไฟฟ้าไร้เสียงและแคปซูลส่งของใต้ดิน",
                "breakthroughs": [
                    "ผู้ช่วย AI ประจำอุปกรณ์ที่ปรับจังหวะชีวิตประจำวันโดยไม่ต้องพึ่งพาคลาวด์",
                    "แบตเตอรี่ลิเธียมเมทัลโซลิดสเตตที่รองรับการเดินทางในเมืองได้ 1,000 กม. ต่อเนื่อง",
                    "การรับรองเชิงพาณิชย์อย่างเป็นทางการสำหรับแท็กซี่บินได้ไร้คนขับในเส้นทางบินหลักของเมือง"
                ],
                "bannerAlt": "ภาพมุมกว้างของมหานครที่ยั่งยืนในปี 2030 พร้อมเส้นทางคมนาคมสะอาด",
                "bannerPrompt": "ภาพพาโนรามาของมหานครชายฝั่งที่ยั่งยืนยามรุ่งอรุณ อาคารกระจกโซลาร์เซลล์ รถรับส่งไฟฟ้า สวนแนวตั้ง ความละเอียด 8k"
            },
            "era-2035": {
                "title": "การสังเคราะห์ชีวกลศาสตร์", "yearLabel": "ยุค // 2035",
                "story": "อินเทอร์เฟซประสาทช่วยให้ควบคุมระบบดิจิทัลได้อย่างง่ายดายด้วยความคิด การแพทย์เชิงป้องกันทำงานตลอด 24 ชั่วโมงในระดับเซลล์ผ่านนาโนเซนเซอร์ที่เข้ากันได้กับร่างกาย",
                "breakthroughs": [
                    "เซนเซอร์ออปโตอิเล็กทรอนิกส์ใต้ผิวหนังสำหรับการตรวจวัดการเผาผลาญอย่างต่อเนื่อง",
                    "ตัวถอดรหัสเปลือกสมองส่วนสั่งการแบบไม่ลุกลามที่ช่วยฟื้นฟูการเคลื่อนไหวของร่างกาย",
                    "ไบโอรีแอคเตอร์เส้นใยเห็ดราเชิงอุตสาหกรรมที่ผลิตวัสดุก่อสร้างความแข็งแรงสูงที่รีไซเคิลได้"
                ],
                "bannerAlt": "ภาพมุมกว้างของเมืองแนวตั้งที่มีไบโอโดมและเส้นทางรถไฟแม่เหล็ก",
                "bannerPrompt": "ทิวทัศน์เมืองแนวตั้งยามพลบค่ำพร้อมท่อแมกเลฟและเรือนกระจกแอโรโพนิกส์ ความละเอียด 8k"
            },
            "era-2050": {
                "title": "ขอบเขตระดับดาวเคราะห์และวงโคจร", "yearLabel": "ยุค // 2050",
                "story": "การผลิตทางอุตสาหกรรมหนักได้ย้ายจากชีวมณฑลของโลกไปยังโรงกลั่นในสภาวะแรงโน้มถ่วงต่ำในวงโคจร พลังงานฟิวชันเชิงพาณิชย์และเศรษฐกิจหมุนเวียนได้ฟื้นฟูความสมดุลของมหาสมุทรและชั้นบรรยากาศ",
                "breakthroughs": [
                    "โรงไฟฟ้าฟิวชันกักเก็บแม่เหล็กเชิงพาณิชย์ที่จ่ายพลังงานสะอาดต่อเนื่องตลอดเวลา",
                    "ฐานถาวรบริเวณขั้วใต้ของดวงจันทร์สำหรับการขุดน้ำแข็งและผลิตเชื้อเพลิงอวกาศ",
                    "โรงงานชีววิทยาสังเคราะห์ระดับดาวเคราะห์ที่ออกแบบมาเพื่อดักจับคาร์บอนในชั้นบรรยากาศหลายพันล้านตัน"
                ],
                "bannerAlt": "ทิวทัศน์ของโลกจากสถานีในวงโคจรและโมดูลที่อยู่อาศัย",
                "bannerPrompt": "ภาพถ่ายโลกจากสถานีขนส่งอวกาศในวงโคจรต่ำ เส้นโค้งสีน้ำเงินของโลก อวกาศห้วงลึก ความละเอียด 8k"
            }
        }
    },
    "sw": {
        "name": "Swahili",
        "native": "Kiswahili",
        "rtl": False,
        "nav": {
            "home": "Nyumbani", "timeline": "Mstari wa Wakati wa Baadaye", "tech": "Teknolojia ya Baadaye", "places": "Miji na Makazi",
            "projects": "Miradi Yangu", "advertise": "Tangaza / Wasilisha", "about": "Kuhusu Mimi", "contact": "Wasiliana",
            "assistant": "Msaidizi wa AI", "language": "Lugha", "menu": "Fungua menyu", "close": "Funga menyu",
            "brandSubtitle": "TEKNOLOJIA // 2030-2050", "menuSysHeader": "MENYU YA MFUMO", "locationDomain": "SEVA: WWW.HAYAATIWEB.SITE"
        },
        "hero": {
            "systemStatus": "MFUMO//NODE.2030-2050", "online": "MIFUMO YOTE IKO HEWANI",
            "headline": "Wakati ujao haufiki tu. Tunaujenga kwa pamoja.",
            "subtitle": "Mwongozo wa sinema wa uvumbuzi wa binadamu, mashine za utambuzi, makoloni ya anga za juu, na makazi endelevu kutoka 2030 hadi 2050. Imejengwa na Aliya Khan.",
            "exploreCta": "Gundua 2030 2050", "projectsCta": "Tazama Miradi Yangu",
            "coordinates": "MAHALI: 28.6139° N, 77.2090° E // INJINI INAFANYA KAZI", "timelineSpan": "UPEO WA 2030 — 2050",
            "liveTelemetry": "TEKNOLOJIA YA KIPIMO: SAWA", "scrollDown": "Sogeza chini ili kuchunguza mstari wa wakati",
            "imageAlt": "Mwonekano wa jiji kuu la siku zijazo la 2030 2050"
        },
        "timeline": {
            "sectionTag": "RAMANI_YA_WAKATI // 2030 -> 2050", "title": "Historia ya Uvumbuzi wa Binadamu",
            "subtitle": "Kutoka akili bandia ya vifaa vya 2030 hadi viwanda vizito vya anga za juu mnamo 2050.",
            "chronoMap": "RAMANI YA MPANGILIO WA WAKATI", "eraHeading": "UPEO WA ENZI", "storyTitle": "Siku Moja Katika Enzi Hii",
            "breakthroughsTitle": "Mafanikio Muhimu ya Kiteknolojia", "viewEraDetails": "Fungua Faili ya Enzi",
            "jumpToEra": "Rukia Enzi Hii", "statusPrefix": "HALI YA MFUMO", "eraBreakthroughsHeading": "Mageuzi",
            "specificationsCount": "Vipimo vya Kiufundi"
        },
        "tech": {
            "sectionTag": "ORODHA_YA_MIFUMO // NYANJA 42", "title": "Katalogi ya Teknolojia ya Baadaye",
            "subtitle": "Mipango kamili ya mifumo na kanuni za kisayansi katika nyanja 7 za msingi za kiteknolojia.",
            "systemsIndex": "ORODHA YA KATALOGI", "howItWorksLabel": "JINSI INAVYOFANYA KAZI",
            "architectureMechanics": "MIUNDOMBINU YA KIUFUNDI NA UTENDAJI", "underlyingMechanism": "KANUNI YA MSINGI YA FIZIKIA",
            "searchPlaceholder": "Tafuta teknolojia, mifumo, au uvumbuzi...", "searchNoResults": "Hakuna teknolojia inayolingana.",
            "filterAll": "Kategoria Zote", "modalClose": "Funga Faili", "viewDossier": "Tazama Faili ya Kiufundi",
            "yearLabel": "MWAKA", "statusLabel": "HALI", "activeStatus": "MFUMO UNAOFANYA KAZI", "promptLabel": "MAELEKEZO YA PICHA",
            "categories": {
                "all": "Kategoria Zote", "ai": "AI ya Baadaye", "vehicles": "Usafiri na Uhamaji", "devices": "Vifaa na Bioniki",
                "homeWork": "Makazi na Kazi", "health": "Afya na Biolojia", "energy": "Nishati na Hali ya Hewa", "space": "Anga za Juu"
            }
        },
        "places": {
            "sectionTag": "ORODHA_YA_MAKAZI // 2030-2050", "title": "Miji na Postikadi za Makazi",
            "subtitle": "Picha halisi na ripoti za miundombinu ya makazi mapya ya binadamu Duniani na angani.",
            "horizonLabel": "UPEO", "aDayInPlace": "Siku Moja Katika Makazi Haya", "infrastructureLabel": "Miundombinu Muhimu",
            "viewLocation": "Chunguza Mpango wa Makazi", "promptLabel": "MAELEKEZO YA PICHA"
        },
        "projects": {
            "sectionTag": "MIRADI_YA_MWANZILISHI // ALIYA KHAN", "title": "Miradi Yangu",
            "subtitle": "Mifumo ya programu inayofanya kazi, nyaraka za utafiti, na miundo ya usanifu iliyojengwa na Aliya Khan.",
            "tabs": {"live": "Mifumo Iliyo Hewani", "inProgress": "Inayoendelea", "futureIdeas": "Mawazo ya Baadaye"},
            "visit": "Fungua Mfumo", "emptyLive": "Hakuna mfumo hewani kwa sasa. Miradi mipya itaongezwa hivi karibuni.",
            "emptyInProgress": "Michoro ya kiufundi itaonekana hapa hatua zikikamilika.",
            "emptyIdeas": "Mapendekezo ya kinadharia yataorodheshwa hapa.",
            "pendingNotice": "Miradi inakaguliwa na kusawazishwa moja kwa moja na Aliya Khan."
        },
        "advertise": {
            "sectionTag": "UWASILISHAJI_WA_MRADI // ORODHA", "title": "Tangaza / Wasilisha Mradi Wako",
            "subtitle": "Wasilisha teknolojia yako ya kisasa au mpango endelevu ili ukaguliwe na Aliya Khan.",
            "reviewNotice": "Maombi yote yanakaguliwa kibinafsi na Aliya Khan. Ujumbe wa kibiashara usiohitajika utakataliwa.",
            "pricingNote": "Maelezo ya uwekaji na masharti ya ushirikiano yatatolewa moja kwa moja kupitia barua pepe.",
            "form": {
                "name": "Jina Kamili", "email": "Barua Pepe ya Kikazi", "projectName": "Jina la Mradi au Kampuni",
                "projectLink": "Kiungo cha Mfumo au Ripoti Rasmi", "category": "Nyanja ya Teknolojia", "selectCategory": "Chagua nyanja...",
                "budget": "Makadirio ya Bajeti", "budgetPlaceholder": "mfano: $5,000 - $25,000",
                "description": "Muhtasari wa Kiufundi na Umuhimu wake kwa Baadaye",
                "submitBtn": "Wasilisha Faili kwa Ukaguzi", "sending": "Inawasilisha...",
                "sentSuccess": "Faili imewasilishwa kwa Aliya Khan. Utajibiwa hivi karibuni.",
                "sendError": "Imeshindwa kutuma. Tafadhali angalia mtandao wako na ujaribu tena."
            }
        },
        "about": {
            "sectionTag": "FAILI_LA_MSANIFU // MAELEZO YA MFUMO", "title": "Kuhusu Aliya Khan",
            "subtitle": "Mwanzilishi, mbunifu mkuu na msanifu mifumo wa Hayaati Web Technology.",
            "ownerName": "Aliya Khan", "architectTitle": "Mwanzilishi na Mbunifu Mkuu",
            "leadArchitect": "MSANIFU MKUU // HAYAATI WEB TECHNOLOGY",
            "bioPlaceholder": "Aliya Khan anabuni na kujenga programu pamoja na miundombinu ya siku zijazo kwa mpito wa 2030 hadi 2050.",
            "contactDirect": "Mawasiliano ya Moja kwa Moja: Hayaati.Technology@gmail.com",
            "photoAlt": "Aliya Khan — Mwanzilishi na Mbunifu Mkuu wa Hayaati Web Technology"
        },
        "contact": {
            "sectionTag": "MAWASILIANO_YA_MOJA_KWA_MOJA // IDHINI", "title": "Mawasiliano na Ushirikiano",
            "subtitle": "Wasiliana moja kwa moja na Aliya Khan kwa utafiti, ushauri wa usanifu, au ushirikiano wa kimkakati.",
            "emailLabel": "BARUA PEPE RASMI", "directEmail": "Hayaati.Technology@gmail.com",
            "form": {
                "name": "Jina Lako", "email": "Barua Pepe Yako", "message": "Ujumbe au Pendekezo Lako",
                "submitBtn": "Tuma Ujumbe", "sending": "Inatuma...",
                "sentSuccess": "Ujumbe umetumwa kwa mafanikio kwa Aliya Khan.", "sendError": "Imeshindwa kutuma ujumbe. Jaribu tena.",
                "placeholderName": "mfano: Dkt. Juma Bakari", "placeholderEmail": "juma@frontiertech.org",
                "placeholderMessage": "Eleza utafiti wako, wazo la ushirikiano, au swali..."
            }
        },
        "assistant": {
            "buttonLabel": "Zungumza na Hayaati", "panelTitle": "KITOVU CHA UTAMBUZI CHA HAYAATI",
            "subtitle": "Muunganisho wa Mishipa ya K квантum // Sauti na Maandishi",
            "welcomeMessage": "Muunganisho wa mfumo umekamilika. Mimi ni Hayaati, kiongozi wako katika mstari wa wakati wa 2030-2050.",
            "chips": ["Mwaka wa 2030 utakuwaje?", "Nionyeshe teknolojia ya afya ya baadaye", "Nieleze kuhusu Hayaati na Aliya Khan"],
            "inputPlaceholder": "Uliza kuhusu teknolojia ya 2030–2050...", "sendBtn": "Tuma",
            "retryBtn": "Jaribu Tena", "voiceBtn": "Washa Sauti", "voiceStopBtn": "Zima Sauti",
            "voiceListening": "Inasikiliza...", "voiceSpeaking": "Inazungumza...", "voiceConnecting": "Inaunganisha...",
            "voiceUnsupported": "Uingizaji wa sauti hautumiki kwenye kivinjari hiki.",
            "voiceNotAvailableLang": "Sauti haipatikani kwa lugha hii.",
            "rateLimitBanner": "Kikomo cha maombi kimefikiwa. Tafadhali subiri kidogo.",
            "talkTo": "Ongea na Hayaati", "typeInstead": "Au andika hapa chini", "returnToOrb": "Rudi Kwenye Kitovu",
            "muteMic": "Zima Kipaza Sauti", "unmuteMic": "Washa Kipaza Sauti", "micLabel": "Kipaza Sauti",
            "mutedLabel": "Imezimwa", "endSession": "Maliza Kipindi", "endLabel": "Mwisho",
            "userTag": "MTUMIAJI", "assistantTag": "HAYAATI", "cognitiveLink": "MUUNGANISHO WA UTAMBUZI UNAFANYA KAZI",
            "orb": {
                "ready": "TAYARI", "listening": "INASIKILIZA", "thinking": "INAFIKIRIA",
                "speaking": "INAZUNGUMZA", "tapToStart": "Gusa Ili Kuongea", "start": "Anza"
            },
            "errors": {
                "quotaReached": "Kiwango cha mazungumzo ya siku kimefikiwa. Karibu tena kesho.",
                "serverBusy": "Kitovu cha utambuzi kiko bize. Tafadhali subiri.",
                "networkError": "Hitilafu ya mtandao. Tafadhali angalia muunganisho wako.",
                "micBlocked": "Ruhusa ya kipaza sauti imezuiwa na kivinjari.",
                "sessionEnded": "Kipindi kimemalizika.", "genericError": "Hitilafu isiyotarajiwa imetokea."
            },
            "voiceErrors": {
                "unsupported": "Utambuzi wa sauti hautumiki.",
                "insecure": "HTTPS inahitajika kwa matumizi ya sauti.",
                "denied": "Ruhusa ya kipaza sauti imekataliwa.",
                "noDevice": "Hakuna kipaza sauti kilichopatikana.",
                "micFailed": "Kuanzisha kipaza sauti kumeshindikana.",
                "rateLimit": "Kikomo cha maombi ya sauti kimefikiwa.",
                "providerQuota": "Kiwango cha mtoa huduma kimezidiwa.",
                "noKey": "Huduma ya sauti haijawekwa mipangilio.",
                "modelFailed": "Mfumo wa sauti umeshindwa kufanya kazi.",
                "network": "Hitilafu ya mtandao wakati wa kutoa sauti.",
                "serverError": "Hitilafu ya seva ya sauti."
            }
        },
        "footer": {
            "copyright": "© 2026-2050 Hayaati Web Technology. Haki zote zimehifadhiwa.",
            "disclaimer": "Mwongozo wa utafiti na usanifu wa teknolojia za siku zijazo.",
            "liveDomainLabel": "DOMEINI HAI", "quickLinks": "VIUNGO VYA HARAKA",
            "systemDesignation": "JINA LA MFUMO: HAYAATI-CORE-V5", "allRightsReserved": "Haki zote zimehifadhiwa."
        },
        "common": {
            "year": "Mwaka", "status": "Hali", "operational": "Inafanya Kazi", "close": "Funga",
            "back": "Rudi", "retry": "Jaribu Tena", "error": "Hitilafu", "success": "Imefanikiwa", "loading": "Inapakia..."
        },
        "languageSelector": {
            "selectLanguage": "Chagua Lugha ya Kimataifa", "dialogTitle": "Chaguo la Lugha",
            "searchPlaceholder": "Chuja lugha (mfano Kiswahili, English)...", "languagesCountSuffix": "Lugha"
        },
        "imageSlot": {"opticalChannel": "NJIA YA PICHA", "framePending": "PICHA INASUBIRIWA", "sysDim": "SYS//800x500"},
        "notFound": {
            "errorTag": "HITILAFU 404 // ENEO HALIKUPATIKANA", "title": "Mawimbi Yamepotea Angani",
            "description": "Viwianishi vilivyoombwa havilingani na mfumo wowote unaojulikana.", "returnBtn": "Rudi Kituo Kikuu cha Anga"
        },
        "eras": {
            "era-2030": {
                "title": "Msingi wa Utambuzi", "yearLabel": "ENZI // 2030",
                "story": "Asubuhi huanza na AI ya mazingira inayoweka usawa kwenye gridi za nishati unapolala. Jiji linafanya kazi kwa utulivu na magari ya umeme na mifumo ya chini ya ardhi ya kupeleka mizigo.",
                "breakthroughs": [
                    "Wasaidizi wa AI ya mazingira kwenye vifaa wanaoboresha mdundo wa maisha bila kuchelewa kwa wingu",
                    "Betri imara za lithiamu-chuma zinazowezesha usafiri wa mijini kwa kilomita 1,000 bila kusimama",
                    "Uthibitisho rasmi wa kibiashara wa teksi za angani zinazojiendesha kwenye njia kuu za anga za mijini"
                ],
                "bannerAlt": "Mwonekano wa jiji kuu endelevu la 2030 lenye mifumo safi ya usafirishaji",
                "bannerPrompt": "Mwonekano mpana wa jiji endelevu la pwani wakati wa mapambazuko, minara ya vioo vya jua, usafiri wa umeme, bustani wima, ubora wa 8k."
            },
            "era-2035": {
                "title": "Muungano wa Kibayolojia na Mitambo", "yearLabel": "ENZI // 2035",
                "story": "Mifumo ya mishipa ya fahamu inawezesha kuongoza mifumo ya kidijitali bila shida kwa kutumia fikra tu. Tiba ya kuzuia inafanya kazi masaa 24/7 katika kiwango cha chembechembe kupitia vihisi vya nano.",
                "breakthroughs": [
                    "Vihisi vya ngozi vya macho na umeme kwa ufuatiliaji endelevu wa kimetaboliki",
                    "Mifumo ya kutafsiri mawimbi ya ubongo isiyoingilia mwili inayorejesha uwezo wa kutembea",
                    "Mifumo ya kibaolojia ya viwandani inayozalisha vifaa vya ujenzi vinavyoweza kutumika tena na imara sana"
                ],
                "bannerAlt": "Mwonekano wa jiji wima lenye makazi ya kibaolojia na njia za treni za sumaku",
                "bannerPrompt": "Mandhari ya jiji wima wakati wa machweo yenye mirija ya treni ya sumaku na bustani za angani, ubora wa 8k."
            },
            "era-2050": {
                "title": "Upeo wa Sayari na Anga za Juu", "yearLabel": "ENZI // 2050",
                "story": "Uzalishaji wa viwanda vizito umehamishwa kutoka kwenye mazingira ya Dunia hadi kwenye viwanda vya angani bila mvuto. Nishati safi ya muungano wa atomi na uchumi mzunguko umerejesha uwiano wa bahari na anga.",
                "breakthroughs": [
                    "Viwanda vya kibiashara vya nishati ya muungano wa atomi vinavyotoa umeme safi usiokatika",
                    "Vituo vya kudumu kwenye ncha ya kusini ya Mwezi kwa uchimbaji wa barafu ya maji na nishati ya angani",
                    "Vituo vya biolojia ya usanisi vilivyoundwa kufyonza mabilioni ya tani za kaboni angani"
                ],
                "bannerAlt": "Mwonekano wa Dunia kutoka vituo vya anga za juu na makazi ya angani",
                "bannerPrompt": "Mwonekano wa sinema wa Dunia kutoka kituo cha anga za juu katika obiti ya chini, mviringo wa bluu wa sayari, anga ya giza, ubora wa 8k."
            }
        }
    }
}

print("[BATCH 6] Processing 5 languages: nl, pl, fa, th, sw...")

for code, conf in BATCH6_CONFIGS.items():
    # 1. Build UI schema
    ui_data = {
        "meta": {
            "code": code,
            "languageName": conf["name"],
            "nativeName": conf["native"],
            "rtl": conf["rtl"]
        },
        "nav": conf["nav"],
        "hero": conf["hero"],
        "timeline": conf["timeline"],
        "tech": conf["tech"],
        "places": conf["places"],
        "projects": conf["projects"],
        "advertise": conf["advertise"],
        "about": conf["about"],
        "contact": conf["contact"],
        "assistant": conf["assistant"],
        "footer": conf["footer"],
        "common": conf["common"],
        "languageSelector": conf["languageSelector"],
        "imageSlot": conf["imageSlot"],
        "notFound": conf["notFound"]
    }

    # 2. Build Content schema
    content_data = json.loads(json.dumps(en_content))
    
    # Overwrite eras with high quality translations
    for era_key, era_val in conf["eras"].items():
        content_data["eras"][era_key]["title"] = era_val["title"]
        content_data["eras"][era_key]["yearLabel"] = era_val["yearLabel"]
        content_data["eras"][era_key]["story"] = era_val["story"]
        content_data["eras"][era_key]["breakthroughs"] = era_val["breakthroughs"]
        content_data["eras"][era_key]["bannerAlt"] = era_val["bannerAlt"]
        content_data["eras"][era_key]["bannerPrompt"] = era_val["bannerPrompt"]

    # Localized loops for timelineCards, techCards, places
    for k, card in en_content["timelineCards"].items():
        if code == "nl":
            content_data["timelineCards"][k]["title"] = f"Project // {k.upper()}"
            content_data["timelineCards"][k]["description"] = "Geavanceerde emissievrije technische specificaties voor de periode 2030-2050."
            content_data["timelineCards"][k]["breakthrough"] = "Geavanceerde fysische principes en maximale hulpbronefficiëntie."
            content_data["timelineCards"][k]["alt"] = f"Technische visualisatie van {k}"
            content_data["timelineCards"][k]["prompt"] = f"Filmische architectuurfotografie, {k}, 8k-resolutie."
        elif code == "pl":
            content_data["timelineCards"][k]["title"] = f"Projekt // {k.upper()}"
            content_data["timelineCards"][k]["description"] = "Zaawansowane bezemisyjne specyfikacje inżynieryjne na lata 2030-2050."
            content_data["timelineCards"][k]["breakthrough"] = "Zastosowanie zaawansowanych zasad fizyki i najwyższej efektywności zasobów."
            content_data["timelineCards"][k]["alt"] = f"Wizualizacja techniczna {k}"
            content_data["timelineCards"][k]["prompt"] = f"Kinowa fotografia architektury, {k}, rozdzielczość 8k."
        elif code == "fa":
            content_data["timelineCards"][k]["title"] = f"طرح // {k.upper()}"
            content_data["timelineCards"][k]["description"] = "مشخصات مهندسی پیشرفته بدون آلایندگی برای دوره ۲۰۳۰-۲۰۵۰."
            content_data["timelineCards"][k]["breakthrough"] = "اصول فیزیک نوین و حداکثر بهره‌وری منابع طبیعی."
            content_data["timelineCards"][k]["alt"] = f"تجسم فنی {k}"
            content_data["timelineCards"][k]["prompt"] = f"عکاسی معماری سینمایی، {k}، کیفیت 8k."
        elif code == "th":
            content_data["timelineCards"][k]["title"] = f"โครงการ // {k.upper()}"
            content_data["timelineCards"][k]["description"] = "ข้อกำหนดทางวิศวกรรมขั้นสูงที่ไร้มลพิษสำหรับช่วงปี 2030-2050"
            content_data["timelineCards"][k]["breakthrough"] = "หลักการทางฟิสิกส์ขั้นสูงและประสิทธิภาพการใช้ทรัพยากรระดับสูงสุด"
            content_data["timelineCards"][k]["alt"] = f"ภาพจำลองทางเทคนิค {k}"
            content_data["timelineCards"][k]["prompt"] = f"การถ่ายภาพสถาปัตยกรรมแบบภาพยนตร์, {k}, ความละเอียด 8k"
        elif code == "sw":
            content_data["timelineCards"][k]["title"] = f"Mradi // {k.upper()}"
            content_data["timelineCards"][k]["description"] = "Vipimo vya juu vya uhandisi visivyo na uchafuzi kwa kipindi cha 2030-2050."
            content_data["timelineCards"][k]["breakthrough"] = "Kanuni za juu za fizikia na ufanisi mkubwa wa rasilimali."
            content_data["timelineCards"][k]["alt"] = f"Mwonekano wa kiufundi wa {k}"
            content_data["timelineCards"][k]["prompt"] = f"Picha ya sinema ya usanifu, {k}, ubora wa 8k."

    for k, card in en_content["techCards"].items():
        if code == "nl":
            content_data["techCards"][k]["title"] = f"Technologie // {k.upper()}"
            content_data["techCards"][k]["description"] = f"Toonaangevend subsysteem {k.upper()} ontworpen voor duurzame en autonome langetermijnoperaties."
            content_data["techCards"][k]["howItWorks"] = "Gebouwd op innovatieve fysische principes met een netto-nul ecologische voetafdruk."
            content_data["techCards"][k]["alt"] = f"Conceptueel ontwerp van {k}"
            content_data["techCards"][k]["prompt"] = f"Industriële ontwerpfotografie, {k}, 8k-resolutie."
        elif code == "pl":
            content_data["techCards"][k]["title"] = f"Technologia // {k.upper()}"
            content_data["techCards"][k]["description"] = f"Wiodący podsystem {k.upper()} zaprojektowany do zrównoważonych i autonomicznych operacji."
            content_data["techCards"][k]["howItWorks"] = "Oparty na innowacyjnych prawach fizyki przy zerowej emisji środowiskowej."
            content_data["techCards"][k]["alt"] = f"Projekt koncepcyjny {k}"
            content_data["techCards"][k]["prompt"] = f"Fotografia wzornictwa przemysłowego, {k}, rozdzielczość 8k."
        elif code == "fa":
            content_data["techCards"][k]["title"] = f"فناوری // {k.upper()}"
            content_data["techCards"][k]["description"] = f"زیرسیستم پیشگام {k.upper()} طراحی‌شده برای عملیات پایدار و خودمختار."
            content_data["techCards"][k]["howItWorks"] = "مبتنی بر اصول فیزیکی نوین بدون هیچ‌گونه ردپای زیست‌محیطی."
            content_data["techCards"][k]["alt"] = f"طراحی مفهومی {k}"
            content_data["techCards"][k]["prompt"] = f"عکاسی طراحی صنعتی، {k}، کیفیت 8k."
        elif code == "th":
            content_data["techCards"][k]["title"] = f"เทคโนโลยี // {k.upper()}"
            content_data["techCards"][k]["description"] = f"ระบบย่อยแนวหน้า {k.upper()} ที่ออกแบบมาเพื่อการทำงานที่ยั่งยืนและเป็นอิสระในระยะยาว"
            content_data["techCards"][k]["howItWorks"] = "สร้างขึ้นจากหลักการทางฟิสิกส์สมัยใหม่โดยไร้การปล่อยคาร์บอน"
            content_data["techCards"][k]["alt"] = f"การออกแบบแนวคิด {k}"
            content_data["techCards"][k]["prompt"] = f"ภาพถ่ายการออกแบบอุตสาหกรรม, {k}, ความละเอียด 8k"
        elif code == "sw":
            content_data["techCards"][k]["title"] = f"Teknolojia // {k.upper()}"
            content_data["techCards"][k]["description"] = f"Mfumo mdogo wa hali ya juu {k.upper()} ulioundwa kwa ajili ya operesheni endelevu na za kujitegemea."
            content_data["techCards"][k]["howItWorks"] = "Imejengwa juu ya kanuni za kisasa za fizikia bila kutoa uchafuzi wa mazingira."
            content_data["techCards"][k]["alt"] = f"Muundo wa dhana wa {k}"
            content_data["techCards"][k]["prompt"] = f"Picha ya muundo wa viwandani, {k}, ubora wa 8k."

    for k, place in en_content["places"].items():
        if code == "nl":
            content_data["places"][k]["title"] = f"Habitat // {k.upper()}"
            content_data["places"][k]["location"] = f"Internationale Habitat {k.upper()}"
            content_data["places"][k]["story"] = "Bewoners leven in harmonie met de natuur dankzij kringloopsystemen zonder afval."
            content_data["places"][k]["infrastructureTags"] = ["Slim Netwerk", "Schoon Vervoer", "Fusie-energie", "Biosystemen"]
            content_data["places"][k]["alt"] = f"Fotorealistisch beeld van {k}"
            content_data["places"][k]["prompt"] = f"Filmisch stadslandschap, {k}, 8k-resolutie."
        elif code == "pl":
            content_data["places"][k]["title"] = f"Siedlisko // {k.upper()}"
            content_data["places"][k]["location"] = f"Międzynarodowe Siedlisko {k.upper()}"
            content_data["places"][k]["story"] = "Mieszkańcy żyją w harmonii z naturą dzięki bezodpadowym obiegom zamkniętym."
            content_data["places"][k]["infrastructureTags"] = ["Inteligentna Sieć", "Czysty Transport", "Energia Termojądrowa", "Biosystemy"]
            content_data["places"][k]["alt"] = f"Fotorealistyczny widok {k}"
            content_data["places"][k]["prompt"] = f"Kinowy krajobraz miejski, {k}, rozdzielczość 8k."
        elif code == "fa":
            content_data["places"][k]["title"] = f"سکونتگاه // {k.upper()}"
            content_data["places"][k]["location"] = f"زیستگاه بین‌المللی {k.upper()}"
            content_data["places"][k]["story"] = "ساکنان با سیستم‌های مدار بسته بدون پسماند در هماهنگی کامل با طبیعت زندگی می‌کنند."
            content_data["places"][k]["infrastructureTags"] = ["شبکه هوشمند", "حمل‌ونقل پاک", "انرژی گداخت", "زیست‌سامانه‌ها"]
            content_data["places"][k]["alt"] = f"نمای واقع‌گرایانه {k}"
            content_data["places"][k]["prompt"] = f"چشم‌انداز سینمایی شهر، {k}، کیفیت 8k."
        elif code == "th":
            content_data["places"][k]["title"] = f"ถิ่นที่อยู่ // {k.upper()}"
            content_data["places"][k]["location"] = f"ถิ่นที่อยู่นานาชาติ {k.upper()}"
            content_data["places"][k]["story"] = "ผู้อยู่อาศัยใช้ชีวิตอย่างกลมกลืนกับธรรมชาติด้วยระบบวงจรปิดที่ไร้ขยะ"
            content_data["places"][k]["infrastructureTags"] = ["โครงข่ายอัจฉริยะ", "การขนส่งสะอาด", "พลังงานฟิวชัน", "ระบบชีวภาพ"]
            content_data["places"][k]["alt"] = f"ภาพเสมือนจริงของ {k}"
            content_data["places"][k]["prompt"] = f"ทัศนียภาพเมืองแห่งอนาคต, {k}, ความละเอียด 8k"
        elif code == "sw":
            content_data["places"][k]["title"] = f"Makazi // {k.upper()}"
            content_data["places"][k]["location"] = f"Makazi ya Kimataifa ya {k.upper()}"
            content_data["places"][k]["story"] = "Wakazi wanaishi kwa amani na asili kupitia mifumo ya mzunguko usio na taka."
            content_data["places"][k]["infrastructureTags"] = ["Gridi Mahiri", "Usafiri Safi", "Nishati ya Muungano", "Mifumo ya Baiolojia"]
            content_data["places"][k]["alt"] = f"Mwonekano halisi wa {k}"
            content_data["places"][k]["prompt"] = f"Mandhari ya sinema ya jiji, {k}, ubora wa 8k."

    # Write localized projects notices
    content_data["projects"]["pendingNotice"] = conf["projects"]["pendingNotice"]
    content_data["projects"]["emptyLive"] = conf["projects"]["emptyLive"]
    content_data["projects"]["emptyInProgress"] = conf["projects"]["emptyInProgress"]
    content_data["projects"]["emptyIdeas"] = conf["projects"]["emptyIdeas"]

    # Ensure directories
    out_dir = f'locales/{code}'
    os.makedirs(out_dir, exist_ok=True)
    
    with open(f'{out_dir}/ui.json', 'w', encoding='utf-8') as f:
        json.dump(ui_data, f, ensure_ascii=False, indent=2)
        
    with open(f'{out_dir}/content.json', 'w', encoding='utf-8') as f:
        json.dump(content_data, f, ensure_ascii=False, indent=2)

    print(f"  [CREATED] locales/{code} (ui.json & content.json)")

print("[BATCH 6 SUCCESS] All 5 languages generated successfully.")

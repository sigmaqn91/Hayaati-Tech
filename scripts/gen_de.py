#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

de_ui = {
    "meta": {"code": "de", "languageName": "German", "nativeName": "Deutsch", "rtl": False},
    "nav": {
        "home": "Startseite", "timeline": "Zukunfts-Zeitleiste", "tech": "Zukunftstechnologie", "places": "Städte & Orte",
        "projects": "Meine Projekte", "advertise": "Inserieren / Listen", "about": "Über mich", "contact": "Kontakt",
        "assistant": "KI-Assistent", "language": "Sprache", "menu": "Navigationsmenü öffnen", "close": "Navigationsmenü schließen",
        "brandSubtitle": "TECHNOLOGIE // 2030-2050", "menuSysHeader": "SYSTEM-MENÜ", "locationDomain": "STANDORT: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "SYSTEM//KNOTEN.2030-2050", "online": "SYSTEME ONLINE",
        "headline": "Die Zukunft kommt nicht von allein. Wir gestalten sie gemeinsam.",
        "subtitle": "Ein filmischer Entwurf menschlicher Innovation, kognitiver Maschinen, orbitaler Kolonien und nachhaltiger Lebensräume von 2030 bis 2050. Entwickelt von Aliya Khan.",
        "exploreCta": "2030 2050 Entdecken", "projectsCta": "Meine Projekte ansehen",
        "coordinates": "GEO: 28.6139° N, 77.2090° O // MOTOR AKTIV", "timelineSpan": "HORIZONT 2030 — 2050",
        "liveTelemetry": "TELEMETRIE: NOMINAL", "scrollDown": "Scrollen, um die Zeitleiste zu erkunden",
        "imageAlt": "Filmische Vision einer futuristischen Metropole 2030 2050"
    },
    "timeline": {
        "sectionTag": "CHRONO_KARTE // 2030 -> 2050", "title": "Chronologie Menschlicher Innovation",
        "subtitle": "Von allgegenwärtiger Edge-Intelligenz im Jahr 2030 bis zur interplanetaren Schwerindustrie im Jahr 2050.",
        "chronoMap": "CHRONOLOGISCHER ENTWURF", "eraHeading": "EPOCHEN-HORIZONT", "storyTitle": "Ein Tag in dieser Epoche",
        "breakthroughsTitle": "Bedeutende Technologische Meilensteine", "viewEraDetails": "Epochendossier ansehen",
        "jumpToEra": "Zur Epoche springen", "statusPrefix": "ZUSTAND", "eraBreakthroughsHeading": "Durchbrüche",
        "specificationsCount": "Spezifikationen"
    },
    "tech": {
        "sectionTag": "SYSTEM_INDEX // 42 PIONIERE", "title": "Zukunftstechnologie-Katalog",
        "subtitle": "Umfassende Blaupausen und Mechanismen in 7 grundlegenden technologischen Pionierfeldern.",
        "systemsIndex": "KATALOG-INDEX", "howItWorksLabel": "WIE ES FUNKTIONIERT",
        "architectureMechanics": "TECHNISCHE ARCHITEKTUR & MECHANIK", "underlyingMechanism": "GRUNDLEGENDES PHYSIKALISCHES PRINZIP",
        "searchPlaceholder": "Technologien, Systeme oder Durchbrüche suchen...", "searchNoResults": "Keine passenden Technologien gefunden.",
        "filterAll": "Alle Bereiche", "modalClose": "Dossier schließen", "viewDossier": "Technisches Dossier anzeigen",
        "yearLabel": "JAHR", "statusLabel": "ZUSTAND", "activeStatus": "AKTIVE SPEZIFIKATION", "promptLabel": "EINGABEBEFEHL",
        "categories": {
            "all": "Alle Bereiche", "ai": "Zukunfts-KI", "vehicles": "Fahrzeuge & Transit", "devices": "Geräte & Bionik",
            "homeWork": "Wohnen & Arbeiten", "health": "Gesundheit & Biologie", "energy": "Energie & Klima", "space": "Tiefer Weltraum"
        }
    },
    "places": {
        "sectionTag": "HABITAT-INDEX // 2030-2050", "title": "Postkarten aus Städten & Orten",
        "subtitle": "Fotorealistische Postkarten und Infrastrukturdossiers zukünftiger irdischer und orbitaler Siedlungen.",
        "horizonLabel": "HORIZONT", "aDayInPlace": "Ein Tag an diesem Ort", "infrastructureLabel": "Wichtige Infrastruktur",
        "viewLocation": "Habitat ansehen", "promptLabel": "EINGABEBEFEHL"
    },
    "projects": {
        "sectionTag": "GRÜNDER_PROJEKTE // ALIYA KHAN", "title": "Meine Projekte",
        "subtitle": "Aktive Softwaresysteme, Forschungsarchive und Architekturentwürfe von Aliya Khan.",
        "tabs": {"live": "Live-Systeme", "inProgress": "In Entwicklung", "futureIdeas": "Zukunftskonzepte"},
        "visit": "Systemlink öffnen", "emptyLive": "Derzeit sind keine Live-Systeme gelistet. Neue Projekte werden hier veröffentlicht.",
        "emptyInProgress": "Aktive Projekte werden hier gelistet, sobald Meilensteine erreicht sind.",
        "emptyIdeas": "Forschungsvorschläge und Konzepte werden hier katalogisiert.",
        "pendingNotice": "Projekte werden direkt von Aliya Khan geprüft und synchronisiert."
    },
    "advertise": {
        "sectionTag": "PROJEKT_EINREICHUNG // LISTING", "title": "Projekt Inserieren / Einreichen",
        "subtitle": "Reichen Sie innovative Technologien oder nachhaltige Vorhaben zur persönlichen Prüfung durch Aliya Khan ein.",
        "reviewNotice": "Alle Einreichungen werden von Aliya Khan persönlich geprüft. Spam wird abgelehnt.",
        "pricingNote": "Details zu Platzierung und Bedingungen werden per direkter Korrespondenz mitgeteilt.",
        "form": {
            "name": "Vollständiger Name", "email": "Direkte Kontakt-E-Mail", "projectName": "Titel des Projekts / Unternehmens",
            "projectLink": "System- / Whitepaper-Link", "category": "Fachbereich", "selectCategory": "Kategorie auswählen...",
            "budget": "Geschätztes Budget / Finanzierungsstufe", "budgetPlaceholder": "z.B. 10.000€-50.000€, Forschungsstipendium",
            "description": "Projektsynopse & Technischer Durchbruch", "submitBtn": "Projekt zur Prüfung einreichen",
            "sending": "Verschlüsseln und Senden...", "sentSuccess": "Einreichung erfolgreich übertragen. Aliya Khan wird Ihr Dossier prüfen.",
            "sendError": "Übertragungsfehler. Bitte senden Sie eine direkte E-Mail."
        }
    },
    "about": {
        "sectionTag": "CHEFARCHITEKTIN // DOSSIER", "title": "Über — Aliya Khan",
        "subtitle": "Gründerin, Softwarearchitektin und Systemforscherin bei Hayaati Web Technology.",
        "ownerName": "Aliya Khan", "architectTitle": "GRÜNDERIN & CHEFARCHITEKTIN",
        "leadArchitect": "Führend in der Architektur zukünftiger Systeme und hochperformanter digitaler Infrastruktur.",
        "bioPlaceholder": "Aliya Khan ist Softwarearchitektin und Forscherin an der Schnittstelle von verteilten Systemen, künstlicher Intelligenz und langfristigen menschlichen Habitaten. Hayaati Web Technology ist eine unabhängige Plattform zur Visualisierung technologischer Meilensteine.",
        "contactDirect": "Direktkontakt", "photoAlt": "Aliya Khan, Gründerin & Chefarchitektin"
    },
    "contact": {
        "sectionTag": "ÜBERTRAGUNGSKANAL // SICHER", "title": "Direkte Kommunikation",
        "subtitle": "Senden Sie direkte technische Anfragen, Partnerschaftsvorschläge oder Projektanfragen.",
        "emailLabel": "Offizieller Übertragungskanal", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "Vollständiger Name", "email": "E-Mail-Adresse", "message": "Nachricht / Übertragungsinhalt",
            "submitBtn": "Verschlüsselte Nachricht senden", "sending": "Wird übertragen...",
            "sentSuccess": "Nachricht erfolgreich übertragen. Wir antworten über den offiziellen Kanal.",
            "sendError": "Übertragung fehlgeschlagen. Bitte senden Sie eine direkte E-Mail.",
            "placeholderName": "Geben Sie Ihren Namen ein...", "placeholderEmail": "Geben Sie Ihre E-Mail-Adresse ein...",
            "placeholderMessage": "Verfassen Sie Ihre Anfrage oder Nachricht..."
        }
    },
    "assistant": {
        "buttonLabel": "KI-Assistent", "panelTitle": "HAYAATI KOGNITIVE SCHNITTSTELLE", "subtitle": "KOGNITIVER HORIZONT // 2030-2050",
        "welcomeMessage": "Hallo! Ich bin der Hayaati-Assistent. Fragen Sie mich alles über Zukunftstechnologien oder teilen Sie mir mit, was Sie erkunden möchten.",
        "chips": ["Wie wird das Jahr 2030 aussehen?", "Zeige mir Zukunftstechnologien im Gesundheitswesen", "Erzähle mir von Hayaati und Aliya Khan"],
        "inputPlaceholder": "Fragen Sie nach der Zeitleiste 2030-2050, Technik oder Orten...",
        "sendBtn": "Senden", "retryBtn": "Wiederholen", "voiceBtn": "Sprachverbindung starten", "voiceStopBtn": "Sprachverbindung beenden",
        "voiceListening": "Höre zu...", "voiceSpeaking": "Hayaati spricht...", "voiceConnecting": "Sprachverbindung wird aufgebaut...",
        "voiceUnsupported": "Mikrofonzugriff wird in diesem Browser nicht unterstützt.", "voiceNotAvailableLang": "Sprachkonversation ist in dieser Sprache noch nicht verfügbar. Sie können per Text chatten.",
        "rateLimitBanner": "Ratenbegrenzung pro Besucher aktiv.", "talkTo": "Mit Hayaati sprechen", "typeInstead": "Stattdessen tippen",
        "returnToOrb": "Zurück zum Sprach-Orb", "muteMic": "Mikrofon stummschalten", "unmuteMic": "Mikrofon aktivieren",
        "micLabel": "Mikrofon", "mutedLabel": "Stumm", "endSession": "Sitzung beenden", "endLabel": "Ende",
        "userTag": "SIE", "assistantTag": "HAYAATI", "cognitiveLink": "DIREKTE KOGNITIVE VERBINDUNG",
        "orb": {"ready": "Bereit", "listening": "Hört zu...", "thinking": "Denkt nach...", "speaking": "Spricht...", "tapToStart": "Tippen Sie auf Start zum Sprechen", "start": "Aktivieren"},
        "errors": {
            "quotaReached": "Der Assistent hat sein Rechenlimit erreicht. Bitte versuchen Sie es später erneut. Sie können weiterhin die Seite lesen.",
            "serverBusy": "Der Dienst ist vorübergehend ausgelastet. Bitte versuchen Sie es gleich erneut.",
            "networkError": "Netzwerkverbindung unterbrochen. Bitte Internetverbindung prüfen.",
            "micBlocked": "Mikrofonzugriff verweigert. Bitte Mikrofon im Browser erlauben.",
            "sessionEnded": "Sprachsitzung beendet (maximale Dauer erreicht). Sie können eine neue Sitzung starten.",
            "genericError": "Ein Fehler ist aufgetreten. Bitte klicken Sie auf Wiederholen."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Gegründet von Aliya Khan.",
        "disclaimer": "Hayaati Web Technology ist ein unabhängiges spekulatives Forschungsarchiv. Alle Projektionen stellen Ingenieurshypothesen für 2030 2050 dar.",
        "liveDomainLabel": "OFFIZIELLE DOMAIN", "quickLinks": "Navigationsindex", "systemDesignation": "HAYAATI KERN-ENGINE // VERIFIZIERT", "allRightsReserved": "Alle Rechte vorbehalten."
    },
    "common": {
        "year": "Jahr", "status": "Zustand", "operational": "Betriebsbereit", "close": "Schließen", "back": "Zurück",
        "retry": "Wiederholen", "error": "Fehler", "success": "Erfolg", "loading": "Lädt..."
    },
    "languageSelector": {
        "selectLanguage": "Internationale Sprache auswählen", "dialogTitle": "Sprachauswahl",
        "searchPlaceholder": "Sprachen filtern (z.B. Deutsch, English, Français)...", "languagesCountSuffix": "Sprachen"
    },
    "imageSlot": {"opticalChannel": "OPTISCHER KANAL", "framePending": "BILD IN VORBEREITUNG", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "FEHLER 404 // SEKTOR NICHT GEFUNDEN", "title": "Signal im Tiefen Weltraum Verloren",
        "description": "Die angeforderten Koordinaten entsprechen keinem bekannten Zukunftssystem oder Habitat.", "returnBtn": "Zurück zum Orbitalkommando"
    }
}

de_content = json.loads(json.dumps(en_content))
de_content["eras"]["era-2030"]["title"] = "Das Kognitive Fundament"
de_content["eras"]["era-2030"]["yearLabel"] = "EPOCHE // 2030"
de_content["eras"]["era-2030"]["story"] = "Der Morgen beginnt mit einer Umgebungskunstintelligenz, die die Energienetze synchronisiert hat, während Sie schliefen. Die Stadt pulsiert mit leisen elektrischen Shuttles und Lieferkapseln in unterirdischen Tunneln."
de_content["eras"]["era-2030"]["breakthroughs"] = [
    "Geräte-interne KI-Assistenten ohne Cloud-Latenz für den täglichen Lebensrhythmus",
    "Festkörper-Lithium-Metall-Batteriepakete für 1.000 km städtischen Nahverkehr",
    "Zulassung autonomer Punkt-zu-Punkt-Lufttaxis im städtischen Luftraum"
]
de_content["eras"]["era-2030"]["bannerAlt"] = "Weitwinkelansicht einer nachhaltigen Metropole 2030 mit sauberen Verkehrskorridoren"
de_content["eras"]["era-2030"]["bannerPrompt"] = "Cinematische Weitwinkelaufnahme einer nachhaltigen Küstenstadt 2030 bei Sonnenaufgang, solare Glastürme, elektrische Shuttles, vertikale Gärten, 8k Auflösung."

de_content["eras"]["era-2035"]["title"] = "Die Biomechanische Synthese"
de_content["eras"]["era-2035"]["yearLabel"] = "EPOCHE // 2035"
de_content["eras"]["era-2035"]["story"] = "Neuronale Schnittstellen ermöglichen die mühelose Steuerung digitaler Systeme durch Gedanken. Die Gesundheitsvorsorge erfolgt rund um die Uhr auf zellulärer Ebene durch minimalinvasive Nanosensoren."
de_content["eras"]["era-2035"]["breakthroughs"] = [
    "Subkutane optoelektronische Sensoren zur kontinuierlichen Stoffwechselüberwachung",
    "Nicht-invasive Motor-Cortex-Decoder zur Wiederherstellung der Mobilität",
    "Industrielle Myzel- und Mikroben-Bioreaktoren für nachhaltige Baumaterialien"
]
de_content["eras"]["era-2035"]["bannerAlt"] = "Cinematische Ansicht einer vertikalen Stadt mit Biodomen und Magnetschwebebahnen"
de_content["eras"]["era-2035"]["bannerPrompt"] = "Panoramabild einer vertikalen Stadt 2035 mit erhöhten Magnetschwebebahn-Röhren und aeroponischen Kuppeln, Dämmerung, 8k Auflösung."

de_content["eras"]["era-2050"]["title"] = "Der Planetare & Orbitale Horizont"
de_content["eras"]["era-2050"]["yearLabel"] = "EPOCHE // 2050"
de_content["eras"]["era-2050"]["story"] = "Die Schwerindustrie wurde aus der irdischen Biosphäre in orbitale Schwerelosigkeits-Raffinerien verlagert. Fusionsenergie und geschlossene Kreislaufökonomien stellen das Gleichgewicht von Ozeanen und Atmosphäre wieder her."
de_content["eras"]["era-2050"]["breakthroughs"] = [
    "Kommerzielle Kernfusionsreaktoren für kontinuierliche saubere Grundlastenergie",
    "Permanente lunare Südpol-Basen zur Gewinnung von Wassereis und Raketentreibstoff",
    "Synthetisch-biologische Großanlagen zur Bindung von Gigatonnen atmosphärischem Kohlenstoff"
]
de_content["eras"]["era-2050"]["bannerAlt"] = "Blick auf die Erde aus dem erdnahen Orbit mit Raumstationen und Lebensräumen"
de_content["eras"]["era-2050"]["bannerPrompt"] = "Cinematischer Blick auf die Erde aus dem Orbit mit einer Weltraum-Transferstation, blaue Erdkrümmung, schwarzes All, 8k Auflösung."

for k, card in en_content["timelineCards"].items():
    de_content["timelineCards"][k]["title"] = f"Projekt // {k.upper()}"
    de_content["timelineCards"][k]["description"] = f"Fortschrittlicher Konstruktionsplan und emissionsfreie technische Spezifikation für 2030-2050."
    de_content["timelineCards"][k]["breakthrough"] = f"Hocheffiziente physikalische Prinzipien und nachhaltige Energieeffizienz."
    de_content["timelineCards"][k]["alt"] = f"Technische Darstellung von {k}"
    de_content["timelineCards"][k]["prompt"] = f"Cinematische Architekturfotografie, {k}, 8k Auflösung."

for k, card in en_content["techCards"].items():
    de_content["techCards"][k]["title"] = f"Technologie // {k.upper()}"
    de_content["techCards"][k]["description"] = f"Zukunftstechnologisches System {k.upper()} für nachhaltigen und automatisierten Dauerbetrieb."
    de_content["techCards"][k]["howItWorks"] = f"Basiert auf fortschrittlichen physikalischen und rechnerischen Prinzipien ohne CO2-Emissionen."
    de_content["techCards"][k]["alt"] = f"Konzeptbild von {k}"
    de_content["techCards"][k]["prompt"] = f"Industriekonzept-Fotografie, {k}, 8k Auflösung."

for k, place in en_content["places"].items():
    de_content["places"][k]["title"] = f"Ort // {k.upper()}"
    de_content["places"][k]["location"] = f"Internationales Habitat {k.upper()}"
    de_content["places"][k]["story"] = f"Bewohner nutzen modernste Infrastruktur und leben in einer schadstofffreien Umgebung im Einklang mit der Natur."
    de_content["places"][k]["infrastructureTags"] = ["Intelligentes Netz", "Nachhaltiger Transit", "Saubere Energie", "Umweltschutz"]
    de_content["places"][k]["alt"] = f"Realistisches Bild von {k}"
    de_content["places"][k]["prompt"] = f"Cinematische Stadtansicht, {k}, 8k Auflösung."

de_content["projects"]["pendingNotice"] = "Projekte werden direkt von Aliya Khan geprüft und synchronisiert."
de_content["projects"]["emptyLive"] = "Derzeit sind keine Live-Systeme gelistet. Neue Projekte werden hier veröffentlicht."
de_content["projects"]["emptyInProgress"] = "Aktive Projekte werden hier gelistet, sobald Meilensteine erreicht sind."
de_content["projects"]["emptyIdeas"] = "Forschungsvorschläge und Konzepte werden hier katalogisiert."

os.makedirs('locales/de', exist_ok=True)
with open('locales/de/ui.json', 'w', encoding='utf-8') as f:
    json.dump(de_ui, f, ensure_ascii=False, indent=2)
with open('locales/de/content.json', 'w', encoding='utf-8') as f:
    json.dump(de_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete German (de) locales.")

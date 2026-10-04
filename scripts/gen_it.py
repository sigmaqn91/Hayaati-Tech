#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

it_ui = {
    "meta": {"code": "it", "languageName": "Italian", "nativeName": "Italiano", "rtl": False},
    "nav": {
        "home": "Inizio", "timeline": "Linea Temporale", "tech": "Tecnologia Futura", "places": "Città e Luoghi",
        "projects": "I Miei Progetti", "advertise": "Pubblica / Inserisci", "about": "Chi Sono", "contact": "Contattami",
        "assistant": "Assistente IA", "language": "Lingua", "menu": "Apri menu di navigazione", "close": "Chiudi menu di navigazione",
        "brandSubtitle": "TECNOLOGIA // 2030-2050", "menuSysHeader": "MENU DI SISTEMA", "locationDomain": "POSIZIONE: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "SISTEMA//NODO.2030-2050", "online": "SISTEMI ONLINE",
        "headline": "Il futuro non si aspetta. Lo costruiamo insieme.",
        "subtitle": "Un progetto cinematografico di innovazione umana, macchine cognitive, colonie orbitali e habitat sostenibili dal 2030 al 2050. Creato da Aliya Khan.",
        "exploreCta": "Esplora 2030 2050", "projectsCta": "Vedi i Miei Progetti",
        "coordinates": "COORDINATE: 28.6139° N, 77.2090° E // MOTORE ATTIVO", "timelineSpan": "ORIZZONTE TEMPORALE 2030 — 2050",
        "liveTelemetry": "TELEMETRIA: REGOLARE", "scrollDown": "Scorri per esplorare la linea del tempo",
        "imageAlt": "Visione cinematografica di una metropoli futuristica 2030 2050"
    },
    "timeline": {
        "sectionTag": "MAPPA_CRONOLOGICA // 2030 -> 2050", "title": "Cronologia dell'Innovazione Umana",
        "subtitle": "Dall'intelligenza pervasiva diffusa del 2030 alla grande industria interplanetaria entro il 2050.",
        "chronoMap": "PROGETTO CRONOLOGICO", "eraHeading": "ORIZZONTE DELL'EPOCA", "storyTitle": "Un Giorno in Questa Epoca",
        "breakthroughsTitle": "Traguardi Tecnologici Fondamentali", "viewEraDetails": "Esamina Dossier Epoca",
        "jumpToEra": "Vai a questa Epoca", "statusPrefix": "STATO", "eraBreakthroughsHeading": "Traguardi",
        "specificationsCount": "Specifiche"
    },
    "tech": {
        "sectionTag": "INDICE_SISTEMI // 42 FRONTIERE", "title": "Catalogo delle Tecnologie Future",
        "subtitle": "Schemi dettagliati e principi fisici innovativi in 7 frontiere tecnologiche fondamentali.",
        "systemsIndex": "INDICE DEL CATALOGO", "howItWorksLabel": "COME POTREBBE FUNZIONARE",
        "architectureMechanics": "ARCHITETTURA TECNICA & DINAMICA", "underlyingMechanism": "PRINCIPIO FISICO ALLA BASE",
        "searchPlaceholder": "Cerca tecnologie, sistemi o scoperte...", "searchNoResults": "Nessuna tecnologia corrispondente trovata.",
        "filterAll": "Tutte le Frontiere", "modalClose": "Chiudi Scheda", "viewDossier": "Visualizza Scheda Tecnica",
        "yearLabel": "ANNO", "statusLabel": "STATO", "activeStatus": "SPECIFICA ATTIVA", "promptLabel": "ISTRUZIONE",
        "categories": {
            "all": "Tutte le Frontiere", "ai": "IA del Futuro", "vehicles": "Veicoli & Trasporti", "devices": "Dispositivi & Bionica",
            "homeWork": "Abitare & Lavoro", "health": "Salute & Biologia", "energy": "Energia & Clima", "space": "Spazio Profondo"
        }
    },
    "places": {
        "sectionTag": "INDICE_HABITAT // 2030-2050", "title": "Cartoline da Città & Luoghi",
        "subtitle": "Cartoline fotorealistiche e relazioni infrastrutturali degli insediamenti umani emergenti sulla Terra e nello spazio.",
        "horizonLabel": "PROSPETTIVA", "aDayInPlace": "Un Giorno in Questo Luogo", "infrastructureLabel": "Infrastrutture Chiave",
        "viewLocation": "Esamina Mappa Habitat", "promptLabel": "ISTRUZIONE"
    },
    "projects": {
        "sectionTag": "PROGETTI_FONDATRICE // ALIYA KHAN", "title": "I Miei Progetti",
        "subtitle": "Sistemi software attivi, archivi di ricerca e progetti di ingegneria ideati da Aliya Khan.",
        "tabs": {"live": "Sistemi Attivi", "inProgress": "In Sviluppo", "futureIdeas": "Idee Future"},
        "visit": "Apri Collegamento Sistema", "emptyLive": "Nessun sistema pubblico attualmente online. Nuovi progetti saranno inseriti a breve.",
        "emptyInProgress": "I progetti di ingegneria in corso saranno elencati al raggiungimento delle pietre miliari.",
        "emptyIdeas": "Le proposte di ricerca teorica saranno indicizzate qui.",
        "pendingNotice": "Progetti revisionati e sincronizzati direttamente da Aliya Khan."
    },
    "advertise": {
        "sectionTag": "PROPOSTA_PROGETTO // REGISTRAZIONE", "title": "Pubblica / Proponi un Progetto",
        "subtitle": "Invia innovazioni tecnologiche o iniziative di sostenibilità per una revisione curata da Aliya Khan.",
        "reviewNotice": "Ogni proposta viene valutata personalmente da Aliya Khan. Lo spam verrà respinto.",
        "pricingNote": "I parametri di inserimento e le modalità di cooperazione saranno comunicati via corrispondenza diretta.",
        "form": {
            "name": "Nome Completo", "email": "Indirizzo Email Diretto", "projectName": "Titolo del Progetto / Azienda",
            "projectLink": "Link al Sistema o Documento Tecnico", "category": "Settore Tecnologico", "selectCategory": "Seleziona una categoria...",
            "budget": "Budget Previsto / Stadio di Finanziamento", "budgetPlaceholder": "es. 10.000€-50.000€, Fondo di Ricerca",
            "description": "Sintesi del Progetto & Innovazione Chiave", "submitBtn": "Invia Progetto per Revisione",
            "sending": "Cifratura e trasmissione in corso...", "sentSuccess": "Proposta inviata con successo. Aliya Khan esaminerà la tua documentazione.",
            "sendError": "Errore durante la trasmissione. Invia un messaggio diretto via email."
        }
    },
    "about": {
        "sectionTag": "ARCHITETTO_CAPO // DOSSIER", "title": "Chi Sono — Aliya Khan",
        "subtitle": "Fondatrice, architetto software e ricercatrice di sistemi presso Hayaati Web Technology.",
        "ownerName": "Aliya Khan", "architectTitle": "FONDATRICE & ARCHITETTO CAPO",
        "leadArchitect": "Alla guida dell'architettura di sistemi futuri e infrastrutture digitali ad altissime prestazioni.",
        "bioPlaceholder": "Aliya Khan è un architetto software e ricercatrice focalizzata sull'intersezione tra sistemi distribuiti, intelligenza artificiale e habitat umani a lungo termine. Hayaati Web Technology è una piattaforma indipendente di divulgazione ingegneristica.",
        "contactDirect": "Contatto Diretto", "photoAlt": "Aliya Khan, Fondatrice & Architetto Capo"
    },
    "contact": {
        "sectionTag": "CANALE_DI_COMUNICAZIONE // PROTETTO", "title": "Comunicazione Diretta",
        "subtitle": "Invia richieste tecniche approfondite, partnership di ricerca o proposte ingegneristiche.",
        "emailLabel": "Canale Ufficiale di Trasmissione", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "Nome Completo", "email": "Indirizzo Email", "message": "Messaggio / Descrizione Tecnica",
            "submitBtn": "Invia Messaggio Cifrato", "sending": "Invio in corso...",
            "sentSuccess": "Messaggio ricevuto con successo. Risponderemo attraverso i canali ufficiali.",
            "sendError": "Invio non riuscito. Contattaci direttamente via email.",
            "placeholderName": "Inserisci il tuo nome completo...", "placeholderEmail": "Inserisci la tua email...",
            "placeholderMessage": "Scrivi la tua richiesta o proposta tecnica..."
        }
    },
    "assistant": {
        "buttonLabel": "Assistente IA", "panelTitle": "INTERFACCIA COGNITIVA HAYAATI", "subtitle": "ORIZZONTE COGNITIVO // 2030-2050",
        "welcomeMessage": "Ciao! Sono l'assistente cognitivo di Hayaati. Chiedimi qualsiasi cosa sulle tecnologie del futuro o seleziona un argomento da esplorare.",
        "chips": ["Come sarà il mondo nel 2030?", "Mostrami le tecnologie mediche del futuro", "Parlami di Hayaati e di Aliya Khan"],
        "inputPlaceholder": "Fai una domanda sulla linea temporale 2030-2050, tecnologia o città...",
        "sendBtn": "Invia", "retryBtn": "Riprova", "voiceBtn": "Avvia Collegamento Vocale", "voiceStopBtn": "Termina Sessione Vocale",
        "voiceListening": "In ascolto...", "voiceSpeaking": "Hayaati sta parlando...", "voiceConnecting": "Connessione vocale in corso...",
        "voiceUnsupported": "L'accesso al microfono non è supportato da questo browser.", "voiceNotAvailableLang": "La conversazione vocale non è ancora disponibile in questa lingua. Puoi chattare tramite testo.",
        "rateLimitBanner": "Controllo del traffico per visitatore attivo.", "talkTo": "Parla con Hayaati", "typeInstead": "Preferisco scrivere",
        "returnToOrb": "Torna all'Orb Vocale", "muteMic": "Disattiva microfono", "unmuteMic": "Attiva microfono",
        "micLabel": "Microfono", "mutedLabel": "Muto", "endSession": "Termina Sessione", "endLabel": "Fine",
        "userTag": "TU", "assistantTag": "HAYAATI", "cognitiveLink": "COLLEGAMENTO COGNITIVO DIRETTO",
        "orb": {"ready": "Pronto", "listening": "In ascolto...", "thinking": "Elaborazione...", "speaking": "Risposta in corso...", "tapToStart": "Tocca Inizia per parlare", "start": "Inizia"},
        "errors": {
            "quotaReached": "L'assistente ha raggiunto la soglia di calcolo temporanea. Riprova più tardi.",
            "serverBusy": "I sistemi sono momentaneamente carichi. Riprova tra poco.",
            "networkError": "Connessione di rete assente. Controlla il collegamento internet.",
            "micBlocked": "Accesso al microfono negato. Autorizza il microfono nel tuo browser.",
            "sessionEnded": "Sessione vocale terminata (raggiunto tempo massimo). Puoi avviarne una nuova.",
            "genericError": "Si è verificata un'anomalia. Fai clic su Riprova."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Fondato da Aliya Khan.",
        "disclaimer": "Hayaati Web Technology è un archivio speculativo indipendente. Tutte le proiezioni rappresentano ipotesi di ingegneria per il 2030 2050.",
        "liveDomainLabel": "DOMINIO UFFICIALE", "quickLinks": "Indice di Navigazione", "systemDesignation": "MOTORE PRIMARIO HAYAATI // VERIFICATO", "allRightsReserved": "Tutti i diritti riservati."
    },
    "common": {
        "year": "Anno", "status": "Stato", "operational": "Operativo", "close": "Chiudi", "back": "Indietro",
        "retry": "Riprova", "error": "Errore", "success": "Successo", "loading": "Caricamento in corso..."
    },
    "languageSelector": {
        "selectLanguage": "Seleziona lingua internazionale", "dialogTitle": "Selezione Lingua",
        "searchPlaceholder": "Filtra lingue (es. Italiano, English, Français)...", "languagesCountSuffix": "Lingue"
    },
    "imageSlot": {"opticalChannel": "CANALE OTTICO", "framePending": "IMMAGINE IN ELABORAZIONE", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "ERRORE 404 // SETTORE NON TROVATO", "title": "Segnale Disperso nello Spazio Profondo",
        "description": "Le coordinate richieste non corrispondono ad alcun sistema o habitat futuro conosciuto.", "returnBtn": "Torna al Comando Orbitale"
    }
}

it_content = json.loads(json.dumps(en_content))
it_content["eras"]["era-2030"]["title"] = "Le Fondamenta Cognitive"
it_content["eras"]["era-2030"]["yearLabel"] = "EPOCA // 2030"
it_content["eras"]["era-2030"]["story"] = "Le giornate iniziano con un'intelligenza artificiale ambientale che ha sincronizzato le reti elettriche durante la notte. La città vive di navette elettriche silenziose e capsule di consegna sotterranee dedicate."
it_content["eras"]["era-2030"]["breakthroughs"] = [
    "Assistenti integrati sul dispositivo a bassissima latenza senza dipendenza dal cloud",
    "Batterie a stato solido litio-metallo per 1.000 km di mobilità metropolitana continua",
    "Certificazione operativa di taxi volanti aerei a guida autonoma nei principali corridoi urbani"
]
it_content["eras"]["era-2030"]["bannerAlt"] = "Veduta cinematografica di una metropoli ecologica nel 2030 con percorsi a zero emissioni"
it_content["eras"]["era-2030"]["bannerPrompt"] = "Scatto panoramico cinematografico di una metropoli costiera nel 2030 all'alba, torri in vetro solare, navette silenziose, giardini verticali, risoluzione 8k."

it_content["eras"]["era-2035"]["title"] = "La Sintesi Biomeccanica"
it_content["eras"]["era-2035"]["yearLabel"] = "EPOCA // 2035"
it_content["eras"]["era-2035"]["story"] = "Interfacce neurali permettono di interagire con i sistemi digitali attraverso il pensiero. La medicina preventiva opera a livello cellulare continuo tramite nanosensori biocompatibili."
it_content["eras"]["era-2035"]["breakthroughs"] = [
    "Sensori optoelettronici sottocutanei per il monitoraggio continuo dei parametri biologici",
    "Decodificatori non invasivi della corteccia motoria per il recupero della mobilità articolare",
    "Bioreattori miceliali e microbici per la sintesi di materiali strutturali ad alta resistenza"
]
it_content["eras"]["era-2035"]["bannerAlt"] = "Veduta cinematografica di una città verticale con cupole biofile e ferrovie a levitazione magnetica"
it_content["eras"]["era-2035"]["bannerPrompt"] = "Panoramica cinematografica di città verticale nel 2035 con gallerie di transito maglev e cupole aeroponiche, tramonto, risoluzione 8k."

it_content["eras"]["era-2050"]["title"] = "L'Orizzonte Planetario e Orbitale"
it_content["eras"]["era-2050"]["yearLabel"] = "EPOCA // 2050"
it_content["eras"]["era-2050"]["story"] = "L'industria manifatturiera pesante è stata delocalizzata nello spazio in stazioni orbitali a gravità zero. I reattori a fusione e le economie a ciclo chiuso ristabiliscono l'equilibrio della biosfera terrestre."
it_content["eras"]["era-2050"]["breakthroughs"] = [
    "Reattori a fusione nucleare commerciali attivi per fornitura continua di elettricità pulita",
    "Insediamenti lunari stabili al polo sud per estrazione di risorse e carburante spaziale",
    "Complessi di biologia sintetica globale per la cattura e stabilizzazione su vasta scala della CO2"
]
it_content["eras"]["era-2050"]["bannerAlt"] = "Visione della Terra dallo spazio con moduli di transito orbitale e stazioni scientifiche"
it_content["eras"]["era-2050"]["bannerPrompt"] = "Vista cinematografica del globo terrestre dallo spazio con nodi orbitali di attracco, orizzonte azzurro illuminato, spazio profondo, risoluzione 8k."

for k, card in en_content["timelineCards"].items():
    it_content["timelineCards"][k]["title"] = f"Progetto // {k.upper()}"
    it_content["timelineCards"][k]["description"] = f"Specifiche ingegneristiche avanzate e architettura a emissioni zero per il periodo 2030-2050."
    it_content["timelineCards"][k]["breakthrough"] = f"Principi fisici avanzati e massima ottimizzazione delle risorse."
    it_content["timelineCards"][k]["alt"] = f"Rappresentazione tecnica di {k}"
    it_content["timelineCards"][k]["prompt"] = f"Fotografia architettonica cinematografica, {k}, risoluzione 8k."

for k, card in en_content["techCards"].items():
    it_content["techCards"][k]["title"] = f"Tecnologia // {k.upper()}"
    it_content["techCards"][k]["description"] = f"Sistema innovativo {k.upper()} progettato per operazioni autonome e sostenibili nel lungo termine."
    it_content["techCards"][k]["howItWorks"] = f"Funzionamento basato su principi fisici e computazionali a impatto climatico zero."
    it_content["techCards"][k]["alt"] = f"Rendering concettuale di {k}"
    it_content["techCards"][k]["prompt"] = f"Fotografia di design industriale, {k}, risoluzione 8k."

for k, place in en_content["places"].items():
    it_content["places"][k]["title"] = f"Luogo // {k.upper()}"
    it_content["places"][k]["location"] = f"Habitat Internazionale {k.upper()}"
    it_content["places"][k]["story"] = f"La comunità vive integrata con ecosistemi a ciclo chiuso e tecnologie a impatto zero."
    it_content["places"][k]["infrastructureTags"] = ["Rete Intelligente", "Mobilità Pulita", "Energia Verde", "Biosistemi"]
    it_content["places"][k]["alt"] = f"Visualizzazione realistica di {k}"
    it_content["places"][k]["prompt"] = f"Veduta urbana cinematografica, {k}, risoluzione 8k."

it_content["projects"]["pendingNotice"] = "Progetti revisionati e sincronizzati direttamente da Aliya Khan."
it_content["projects"]["emptyLive"] = "Nessun sistema pubblico attualmente online. Nuovi progetti saranno inseriti a breve."
it_content["projects"]["emptyInProgress"] = "I progetti di ingegneria in corso saranno elencati al raggiungimento delle pietre miliari."
it_content["projects"]["emptyIdeas"] = "Le proposte di ricerca teorica saranno indicizzate qui."

os.makedirs('locales/it', exist_ok=True)
with open('locales/it/ui.json', 'w', encoding='utf-8') as f:
    json.dump(it_ui, f, ensure_ascii=False, indent=2)
with open('locales/it/content.json', 'w', encoding='utf-8') as f:
    json.dump(it_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Italian (it) locales.")

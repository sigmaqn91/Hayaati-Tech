#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

fr_ui = {
    "meta": {"code": "fr", "languageName": "French", "nativeName": "Français", "rtl": False},
    "nav": {
        "home": "Accueil", "timeline": "Chronologie Future", "tech": "Technologies Futures", "places": "Villes & Lieux",
        "projects": "Mes Projets", "advertise": "Annoncer / Lister", "about": "À Propos", "contact": "Nous Contacter",
        "assistant": "Assistant IA", "language": "Langue", "menu": "Ouvrir le menu de navigation", "close": "Fermer le menu de navigation",
        "brandSubtitle": "TECHNOLOGIE // 2030-2050", "menuSysHeader": "MENU SYSTÈME", "locationDomain": "LIEU: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "SYSTÈME//NŒUD.2030-2050", "online": "SYSTÈMES EN LIGNE",
        "headline": "L'avenir n'arrive pas tout seul. Nous le concevons ensemble.",
        "subtitle": "Un plan cinématique de l'innovation humaine, des machines cognitives, des colonies orbitales et des habitats durables de 2030 à 2050. Conçu par Aliya Khan.",
        "exploreCta": "Explorer 2030 2050", "projectsCta": "Voir Mes Projets",
        "coordinates": "COORDONNÉES: 28.6139° N, 77.2090° E // MOTEUR ACTIF", "timelineSpan": "HORIZON TEMPOREL 2030 — 2050",
        "liveTelemetry": "TÉLÉMÉTRIE: NOMINALE", "scrollDown": "Faites défiler pour explorer la chronologie",
        "imageAlt": "Vision cinématique d'une métropole futuriste 2030 2050"
    },
    "timeline": {
        "sectionTag": "CARTE_CHRONOLOGIQUE // 2030 -> 2050", "title": "Chronologie de l'Innovation Humaine",
        "subtitle": "De l'intelligence périphérique omniprésente en 2030 à l'industrie lourde interplanétaire d'ici 2050.",
        "chronoMap": "PLAN CHRONOLOGIQUE", "eraHeading": "HORIZON DE L'ÈRE", "storyTitle": "Une Journée à cette Époque",
        "breakthroughsTitle": "Avancées Technologiques Majeures", "viewEraDetails": "Examiner le Dossier d'Époque",
        "jumpToEra": "Aller à cette Époque", "statusPrefix": "STATUT", "eraBreakthroughsHeading": "Percées",
        "specificationsCount": "Spécifications"
    },
    "tech": {
        "sectionTag": "INDEX_SYSTÈMES // 42 FRONTIÈRES", "title": "Catalogue des Technologies Futures",
        "subtitle": "Plans complets et mécanismes théoriques à travers 7 frontières technologiques fondamentales.",
        "systemsIndex": "INDEX DU CATALOGUE", "howItWorksLabel": "FONCTIONNEMENT THÉORIQUE",
        "architectureMechanics": "ARCHITECTURE TECHNIQUE & MÉCANIQUE", "underlyingMechanism": "PRINCIPE PHYSIQUE FONDAMENTAL",
        "searchPlaceholder": "Rechercher des technologies, mécanismes ou innovations...", "searchNoResults": "Aucune technologie trouvée pour cette recherche.",
        "filterAll": "Toutes les Frontières", "modalClose": "Fermer le Dossier", "viewDossier": "Consulter la Fiche Technique",
        "yearLabel": "ANNÉE", "statusLabel": "STATUT", "activeStatus": "SPÉCIFICATION ACTIVE", "promptLabel": "INSTRUCTION",
        "categories": {
            "all": "Toutes les Frontières", "ai": "IA Future", "vehicles": "Véhicules & Transit", "devices": "Appareils & Bionique",
            "homeWork": "Habitat & Travail", "health": "Santé & Biologie", "energy": "Énergie & Climat", "space": "Espace Lointain"
        }
    },
    "places": {
        "sectionTag": "INDEX_HABITATS // 2030-2050", "title": "Cartes Postales des Villes & Lieux",
        "subtitle": "Cartes postales photoréalistes et dossiers d'infrastructure des habitats terrestres et spatiaux émergents.",
        "horizonLabel": "PERSPECTIVE", "aDayInPlace": "Une Journée en ce Lieu", "infrastructureLabel": "Infrastructures Clés",
        "viewLocation": "Examiner le Plan de l'Habitat", "promptLabel": "INSTRUCTION"
    },
    "projects": {
        "sectionTag": "PROJETS_FONDATEUR // ALIYA KHAN", "title": "Mes Projets",
        "subtitle": "Logiciels actifs, archives de recherche et systèmes architecturaux développés par Aliya Khan.",
        "tabs": {"live": "Systèmes Déployés", "inProgress": "En Développement", "futureIdeas": "Concepts Futurs"},
        "visit": "Ouvrir le Lien du Système", "emptyLive": "Aucun déploiement en production pour le moment. Les nouveaux projets apparaîtront ici.",
        "emptyInProgress": "Les plans d'ingénierie actifs seront répertoriés au fur et à mesure des étapes franchies.",
        "emptyIdeas": "Les propositions de recherche conceptuelle seront cataloguées ici.",
        "pendingNotice": "Les projets sont directement vérifiés et synchronisés par Aliya Khan."
    },
    "advertise": {
        "sectionTag": "SOUMISSION_PROJET // RÉFÉRENCEMENT", "title": "Annoncer / Référencer Votre Projet",
        "subtitle": "Soumettez vos technologies pionnières ou projets durables pour évaluation par Aliya Khan.",
        "reviewNotice": "Toutes les soumissions sont examinées personnellement par Aliya Khan. Aucun spam ne sera accepté.",
        "pricingNote": "Les détails de tarification et d'intégration seront transmis directement par correspondance officielle.",
        "form": {
            "name": "Nom Complet", "email": "Email de Contact Direct", "projectName": "Titre du Projet / Entreprise",
            "projectLink": "Lien du Système / Livre Blanc", "category": "Catégorie Disciplinaire", "selectCategory": "Sélectionner une catégorie...",
            "budget": "Budget Estimé / Financement", "budgetPlaceholder": "ex., 10k€-50k€, Subvention, Amorçage",
            "description": "Synopsis du Projet & Avancée Technique", "submitBtn": "Transmettre le Projet pour Examen",
            "sending": "Chiffrement et Transmission...", "sentSuccess": "Soumission transmise avec succès. Aliya Khan examinera votre dossier.",
            "sendError": "Erreur lors de la transmission. Veuillez envoyer un email directement."
        }
    },
    "about": {
        "sectionTag": "ARCHITECTE_PRINCIPALE // DOSSIER", "title": "À Propos — Aliya Khan",
        "subtitle": "Fondatrice, Architecte Logiciel et Chercheuse en Systèmes à la tête de Hayaati Web Technology.",
        "ownerName": "Aliya Khan", "architectTitle": "FONDATEUR & ARCHITECTE PRINCIPALE",
        "leadArchitect": "Pionnière des architectures de systèmes futurs et des infrastructures numériques haute performance.",
        "bioPlaceholder": "Aliya Khan est architecte logiciel et chercheuse explorant l'intersection des systèmes distribués, de l'intelligence artificielle et des habitats humains à long terme. Hayaati Web Technology est une plateforme indépendante dédiée à visualiser les jalons technologiques façonnant notre horizon planétaire.",
        "contactDirect": "Liaison Directe", "photoAlt": "Aliya Khan, Fondatrice & Architecte Principale"
    },
    "contact": {
        "sectionTag": "CANAL_TRANSMISSION // SÉCURISÉ", "title": "Liaison de Communication Directe",
        "subtitle": "Envoyez vos demandes techniques, propositions de partenariat ou invitations à des projets.",
        "emailLabel": "Canal Officiel de Transmission", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "Nom Complet", "email": "Adresse Email", "message": "Message / Contenu de la Transmission",
            "submitBtn": "Transmettre le Message Chiffré", "sending": "Transmission en cours...",
            "sentSuccess": "Transmission envoyée avec succès. Nous répondrons par canal officiel.",
            "sendError": "Échec de l'envoi. Veuillez envoyer un email directement.",
            "placeholderName": "Entrez votre nom...", "placeholderEmail": "Entrez votre adresse email...",
            "placeholderMessage": "Rédigez votre demande ou briefing..."
        }
    },
    "assistant": {
        "buttonLabel": "Assistant IA", "panelTitle": "INTERFACE COGNITIVE HAYAATI", "subtitle": "HORIZON COGNITIF // 2030-2050",
        "welcomeMessage": "Bonjour ! Je suis l'assistant Hayaati. Posez-moi vos questions sur les technologies futures ou explorez les thèmes qui vous passionnent.",
        "chips": ["À quoi ressemblera 2030 ?", "Montrez-moi les technologies de santé futures", "Parlez-moi de Hayaati et Aliya Khan"],
        "inputPlaceholder": "Interrogez la chronologie 2030-2050, les technologies ou les lieux...",
        "sendBtn": "Envoyer", "retryBtn": "Réessayer", "voiceBtn": "Démarrer la Liaison Vocale", "voiceStopBtn": "Arrêter la Liaison Vocale",
        "voiceListening": "Écoute de votre voix...", "voiceSpeaking": "Hayaati parle...", "voiceConnecting": "Connexion vocale en cours...",
        "voiceUnsupported": "L'accès au microphone n'est pas pris en charge par ce navigateur.", "voiceNotAvailableLang": "La conversation vocale est indisponible dans cette langue. Vous pouvez échanger par écrit.",
        "rateLimitBanner": "Limite de requêtes par visiteur active pour la sécurité du projet.", "talkTo": "Parler à Hayaati", "typeInstead": "Écrire plutôt",
        "returnToOrb": "Retourner à l'orbe vocal", "muteMic": "Couper le micro", "unmuteMic": "Activer le micro",
        "micLabel": "Micro", "mutedLabel": "Coupé", "endSession": "Terminer la session", "endLabel": "Fin",
        "userTag": "VOUS", "assistantTag": "HAYAATI", "cognitiveLink": "LIAISON COGNITIVE DIRECTE",
        "orb": {"ready": "Prêt", "listening": "Écoute...", "thinking": "Réflexion...", "speaking": "Parle...", "tapToStart": "Appuyez sur Démarrer pour parler", "start": "Démarrer"},
        "errors": {
            "quotaReached": "L'assistant a atteint sa limite de calcul. Veuillez réessayer plus tard. Vous pouvez continuer à lire le site.",
            "serverBusy": "Le service cognitif est temporairement saturé. Veuillez réessayer dans un instant.",
            "networkError": "Connexion réseau perdue. Vérifiez votre connexion et réessayez.",
            "micBlocked": "Accès au microphone refusé. Autorisez le micro dans les paramètres de votre navigateur.",
            "sessionEnded": "Session vocale terminée (durée maximale atteinte). Vous pouvez démarrer une nouvelle session.",
            "genericError": "Une erreur est survenue lors du traitement. Cliquez sur Réessayer."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Fondé par Aliya Khan.",
        "disclaimer": "Hayaati Web Technology est une archive de recherche spéculative indépendante. Toutes les projections représentent des hypothèses d'ingénierie pour 2030 2050.",
        "liveDomainLabel": "DOMAINE OFFICIEL", "quickLinks": "Index de Navigation", "systemDesignation": "MOTEUR CENTRAL HAYAATI // VÉRIFIÉ", "allRightsReserved": "Tous Droits Réservés."
    },
    "common": {
        "year": "Année", "status": "Statut", "operational": "Opérationnel", "close": "Fermer", "back": "Retour",
        "retry": "Réessayer", "error": "Erreur", "success": "Succès", "loading": "Chargement..."
    },
    "languageSelector": {
        "selectLanguage": "Sélectionner une langue internationale", "dialogTitle": "Sélecteur de Langue",
        "searchPlaceholder": "Filtrer les langues (ex. Français, English, العربية)...", "languagesCountSuffix": "Langues"
    },
    "imageSlot": {"opticalChannel": "CANAL OPTIQUE", "framePending": "IMAGE EN ATTENTE", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "ERREUR 404 // SECTEUR INTROUVABLE", "title": "Signal Perdu dans l'Espace Lointain",
        "description": "Les coordonnées demandées ne correspondent à aucun système ou habitat futur connu.", "returnBtn": "Retour au Commandement Orbital"
    }
}

fr_content = json.loads(json.dumps(en_content))
fr_content["eras"]["era-2030"]["title"] = "La Fondation Cognitive"
fr_content["eras"]["era-2030"]["yearLabel"] = "ÈRE // 2030"
fr_content["eras"]["era-2030"]["story"] = "Les matinées débutent avec une intelligence synthétique ambiante qui a synchronisé les réseaux d'énergie pendant votre sommeil. La métropole vibre de navettes électriques silencieuses et de capsules souterraines de livraison."
fr_content["eras"]["era-2030"]["breakthroughs"] = [
    "Assistants d'apprentissage automatique ambiants exécutés localement sans latence cloud",
    "Batteries lithium-métal à état solide alimentant 1 000 km de transport urbain",
    "Certification commerciale de taxis aériens urbains autonomes de point à point"
]
fr_content["eras"]["era-2030"]["bannerAlt"] = "Vue panoramique d'une métropole écologique et intelligente en 2030 avec corridors de livraison autonomes"
fr_content["eras"]["era-2030"]["bannerPrompt"] = "Prise de vue panoramique cinématique d'une ville côtière durable en 2030 au lever du soleil, tours solaires en verre, navettes électriques silencieuses, 8k résolution."

fr_content["eras"]["era-2035"]["title"] = "La Synthèse Biomécanique"
fr_content["eras"]["era-2035"]["yearLabel"] = "ÈRE // 2035"
fr_content["eras"]["era-2035"]["story"] = "Les interfaces neurales permettent une interaction directe et fluide avec les systèmes numériques. La santé préventive opère en temps réel au niveau cellulaire grâce à des biocapteurs miniaturisés."
fr_content["eras"]["era-2035"]["breakthroughs"] = [
    "Capteurs optoélectroniques sous-cutanés pour le suivi endocrinien continu",
    "Décodeurs moteurs non invasifs restaurant l'autonomie motrice de millions de personnes",
    "Bioréacteurs microbiens produisant des matériaux de construction écologiques"
]
fr_content["eras"]["era-2035"]["bannerAlt"] = "Vue cinématique d'une cité verticale comprenant des biodômes et des voies de transit suspendues"
fr_content["eras"]["era-2035"]["bannerPrompt"] = "Vue cinématique d'une cité verticale en 2035 avec des tubes de transport magnétique et des dômes aéroponiques, crépuscule, 8k résolution."

fr_content["eras"]["era-2050"]["title"] = "L'Horizon Planétaire et Orbital"
fr_content["eras"]["era-2050"]["yearLabel"] = "ÈRE // 2050"
fr_content["eras"]["era-2050"]["story"] = "L'industrie lourde est désormais délocalisée dans des raffineries orbitales en microgravité. Sur Terre, l'énergie de fusion commerciale et les écosystèmes en boucle fermée restaurent l'équilibre écologique mondial."
fr_content["eras"]["era-2050"]["breakthroughs"] = [
    "Réacteurs de fusion nucléaire commerciale fournissant une énergie de base illimitée",
    "Infrastructures lunaires permanentes d'extraction de glace d'eau au pôle Sud",
    "Complexes de biologie synthétique planétaires capturant des gigatonnes de carbone"
]
fr_content["eras"]["era-2050"]["bannerAlt"] = "Vue de la Terre depuis l'orbite basse montrant des ascenseurs spatiaux et des habitats habités"
fr_content["eras"]["era-2050"]["bannerPrompt"] = "Vue cinématique de la Terre depuis l'espace avec station de transfert en nanotubes de carbone, courbure bleue de l'atmosphère, noirceur spatiale, 8k résolution."

for k, card in en_content["timelineCards"].items():
    fr_content["timelineCards"][k]["title"] = f"Projet // {k.upper()}"
    fr_content["timelineCards"][k]["description"] = f"Plan d'ingénierie avancée et spécification technique à zéro émission pour la période 2030-2050."
    fr_content["timelineCards"][k]["breakthrough"] = f"Principes scientifiques avancés garantissant une efficacité énergétique et environnementale optimale."
    fr_content["timelineCards"][k]["alt"] = f"Illustration technique de {k}"
    fr_content["timelineCards"][k]["prompt"] = f"Photographie d'architecture cinématique, {k}, 8k résolution."

for k, card in en_content["techCards"].items():
    fr_content["techCards"][k]["title"] = f"Technologie // {k.upper()}"
    fr_content["techCards"][k]["description"] = f"Système technologique futur {k.upper()} conçu pour une performance durable et autonome."
    fr_content["techCards"][k]["howItWorks"] = f"Opère selon des lois physiques et algorithmiques de pointe garantissant une empreinte carbone nulle."
    fr_content["techCards"][k]["alt"] = f"Rendu conceptuel de {k}"
    fr_content["techCards"][k]["prompt"] = f"Photographie de concept industriel, {k}, 8k résolution."

for k, place in en_content["places"].items():
    fr_content["places"][k]["title"] = f"Lieu // {k.upper()}"
    fr_content["places"][k]["location"] = f"Habitat International {k.upper()}"
    fr_content["places"][k]["story"] = f"Les résidents profitent d'infrastructures de pointe et d'un environnement sans pollution en harmonie avec la technologie."
    fr_content["places"][k]["infrastructureTags"] = ["Réseau intelligent", "Transit durable", "Énergie propre", "Protection environnementale"]
    fr_content["places"][k]["alt"] = f"Vue réaliste de {k}"
    fr_content["places"][k]["prompt"] = f"Photographie cinématique urbaine, {k}, 8k résolution."

fr_content["projects"]["pendingNotice"] = "Les projets sont directement vérifiés et synchronisés par Aliya Khan."
fr_content["projects"]["emptyLive"] = "Aucun déploiement en production pour le moment. Les nouveaux projets apparaîtront ici."
fr_content["projects"]["emptyInProgress"] = "Les plans d'ingénierie actifs seront répertoriés au fur et à mesure des étapes franchies."
fr_content["projects"]["emptyIdeas"] = "Les propositions de recherche conceptuelle seront cataloguées ici."

os.makedirs('locales/fr', exist_ok=True)
with open('locales/fr/ui.json', 'w', encoding='utf-8') as f:
    json.dump(fr_ui, f, ensure_ascii=False, indent=2)
with open('locales/fr/content.json', 'w', encoding='utf-8') as f:
    json.dump(fr_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete French (fr) locales.")

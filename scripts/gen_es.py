#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

es_ui = {
    "meta": {"code": "es", "languageName": "Spanish", "nativeName": "Español", "rtl": False},
    "nav": {
        "home": "Inicio", "timeline": "Línea de Tiempo", "tech": "Tecnología Futura", "places": "Ciudades y Lugares",
        "projects": "Mis Proyectos", "advertise": "Anunciar / Listar", "about": "Acerca de", "contact": "Contacto",
        "assistant": "Asistente IA", "language": "Idioma", "menu": "Abrir menú de navegación", "close": "Cerrar menú de navegación",
        "brandSubtitle": "TECNOLOGÍA // 2030-2050", "menuSysHeader": "MENÚ DEL SISTEMA", "locationDomain": "UBICACIÓN: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "SISTEMA//NODO.2030-2050", "online": "SISTEMAS EN LÍNEA",
        "headline": "El futuro no llega solo. Lo estamos diseñando juntos.",
        "subtitle": "Un plano cinematográfico de innovación humana, máquinas cognitivas, colonias orbitales y hábitats sostenibles entre 2030 y 2050. Creado por Aliya Khan.",
        "exploreCta": "Explorar 2030 2050", "projectsCta": "Ver Mis Proyectos",
        "coordinates": "COORDENADAS: 28.6139° N, 77.2090° E // MOTOR ACTIVO", "timelineSpan": "HORIZONTE 2030 — 2050",
        "liveTelemetry": "TELEMETRÍA: NOMINAL", "scrollDown": "Desplaza para explorar la línea de tiempo",
        "imageAlt": "Visión cinematográfica de una metrópolis futurista 2030 2050"
    },
    "timeline": {
        "sectionTag": "MAPA_CRONOLÓGICO // 2030 -> 2050", "title": "Cronología de Innovación Humana",
        "subtitle": "Desde la inteligencia perimetral en 2030 hasta la industria interplanetaria pesada en 2050.",
        "chronoMap": "PLANO CRONOLÓGICO", "eraHeading": "HORIZONTE DE ERA", "storyTitle": "Un Día en Esta Era",
        "breakthroughsTitle": "Hitos Tecnológicos Clave", "viewEraDetails": "Examinar Detalles de la Era",
        "jumpToEra": "Ir a esta Era", "statusPrefix": "ESTADO", "eraBreakthroughsHeading": "Avances",
        "specificationsCount": "Especificaciones"
    },
    "tech": {
        "sectionTag": "ÍNDICE_SISTEMAS // 42 FRONTERAS", "title": "Catálogo de Tecnologías Futuras",
        "subtitle": "Planos completos y mecanismos teóricos en 7 fronteras tecnológicas fundamentales.",
        "systemsIndex": "ÍNDICE DEL CATÁLOGO", "howItWorksLabel": "CÓMO PODRÍA FUNCIONAR",
        "architectureMechanics": "ARQUITECTURA TÉCNICA Y MECÁNICA", "underlyingMechanism": "PRINCIPIO FÍSICO SUBYACENTE",
        "searchPlaceholder": "Buscar tecnologías, sistemas o avances...", "searchNoResults": "No se encontraron tecnologías coincidentes.",
        "filterAll": "Todas las Fronteras", "modalClose": "Cerrar Ficha", "viewDossier": "Ver Ficha Técnica",
        "yearLabel": "AÑO", "statusLabel": "ESTADO", "activeStatus": "ESPECIFICACIÓN ACTIVA", "promptLabel": "INSTRUCCIÓN",
        "categories": {
            "all": "Todas las Fronteras", "ai": "IA del Futuro", "vehicles": "Vehículos y Tránsito", "devices": "Dispositivos y Biónica",
            "homeWork": "Hogar y Trabajo", "health": "Salud y Biología", "energy": "Energía y Clima", "space": "Espacio Profundo"
        }
    },
    "places": {
        "sectionTag": "ÍNDICE_HÁBITATS // 2030-2050", "title": "Postales de Ciudades y Lugares",
        "subtitle": "Postales fotorrealistas y expedientes de infraestructura de asentamientos terrestres y espaciales.",
        "horizonLabel": "HORIZONTE", "aDayInPlace": "Un Día en Este Lugar", "infrastructureLabel": "Infraestructura Clave",
        "viewLocation": "Inspeccionar Hábitat", "promptLabel": "INSTRUCCIÓN"
    },
    "projects": {
        "sectionTag": "PROYECTOS_FUNDADORA // ALIYA KHAN", "title": "Mis Proyectos",
        "subtitle": "Sistemas de software activos, archivos de investigación y arquitectura creados por Aliya Khan.",
        "tabs": {"live": "Sistemas en Vivo", "inProgress": "En Desarrollo", "futureIdeas": "Conceptos Futuros"},
        "visit": "Abrir Enlace del Sistema", "emptyLive": "No hay despliegues activos en este momento. Se calibrarán nuevos proyectos aquí.",
        "emptyInProgress": "Los planos de ingeniería activos se indexarán aquí a medida que se alcancen los hitos.",
        "emptyIdeas": "Las propuestas de investigación conceptual se catalogarán aquí.",
        "pendingNotice": "Los proyectos son verificados y sincronizados directamente por Aliya Khan."
    },
    "advertise": {
        "sectionTag": "ENVÍO_PROYECTOS // LISTADO", "title": "Anunciar / Listar Tu Proyecto",
        "subtitle": "Envía tecnologías pioneras o iniciativas sostenibles para evaluación personal por Aliya Khan.",
        "reviewNotice": "Todas las presentaciones son revisadas personalmente por Aliya Khan. No se aprobará spam.",
        "pricingNote": "Los detalles de nivel y ubicación se enviarán por correspondencia oficial.",
        "form": {
            "name": "Nombre Completo", "email": "Correo Electrónico Directo", "projectName": "Título del Proyecto o Empresa",
            "projectLink": "Enlace al Sistema / Whitepaper", "category": "Categoría Disciplinaria", "selectCategory": "Seleccionar categoría...",
            "budget": "Presupuesto Estimado / Nivel de Fondos", "budgetPlaceholder": "ej., $10k-$50k, Beca, Capital Semilla",
            "description": "Sinopsis del Proyecto y Avance Técnico", "submitBtn": "Enviar Proyecto para Revisión",
            "sending": "Cifrando y Transmitiendo...", "sentSuccess": "Envío transmitido con éxito. Aliya Khan revisará tu expediente.",
            "sendError": "Error en la transmisión. Por favor, escribe directamente por correo."
        }
    },
    "about": {
        "sectionTag": "ARQUITECTA_PRINCIPAL // EXPEDIENTE", "title": "Acerca de — Aliya Khan",
        "subtitle": "Fundadora, Arquitecta de Software e Investigadora de Sistemas al frente de Hayaati Web Technology.",
        "ownerName": "Aliya Khan", "architectTitle": "FUNDADORA Y ARQUITECTA PRINCIPAL",
        "leadArchitect": "Liderando la arquitectura de sistemas futuros e infraestructura digital de alto rendimiento.",
        "bioPlaceholder": "Aliya Khan es arquitecta de software e investigadora en la intersección de sistemas distribuidos, inteligencia artificial y hábitats humanos a largo plazo. Hayaati Web Technology es una plataforma independiente dedicada a visualizar los hitos tecnológicos que darán forma a nuestro horizonte planetario.",
        "contactDirect": "Contacto Directo", "photoAlt": "Aliya Khan, Fundadora y Arquitecta Principal"
    },
    "contact": {
        "sectionTag": "CANAL_TRANSMISIÓN // SEGURO", "title": "Canal de Comunicación Directa",
        "subtitle": "Envía consultas técnicas directas, propuestas de colaboración o invitaciones a proyectos.",
        "emailLabel": "Canal Oficial de Transmisión", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "Nombre Completo", "email": "Dirección de Correo", "message": "Mensaje / Contenido de la Transmisión",
            "submitBtn": "Transmitir Mensaje Cifrado", "sending": "Transmitiendo...",
            "sentSuccess": "Transmisión enviada con éxito. Responderemos por canal oficial.",
            "sendError": "Fallo en la entrega. Por favor, escribe directamente.",
            "placeholderName": "Ingresa tu nombre...", "placeholderEmail": "Ingresa tu correo electrónico...",
            "placeholderMessage": "Escribe tu consulta o informe..."
        }
    },
    "assistant": {
        "buttonLabel": "Asistente IA", "panelTitle": "INTERFAZ COGNITIVA HAYAATI", "subtitle": "HORIZONTE COGNITIVO // 2030-2050",
        "welcomeMessage": "¡Hola! Soy el asistente de Hayaati. Pregúntame lo que desees sobre tecnologías futuras o cuéntame qué te gustaría explorar.",
        "chips": ["¿Cómo será el año 2030?", "Muéstrame tecnología de salud futura", "Háblame de Hayaati y Aliya Khan"],
        "inputPlaceholder": "Pregunta sobre la línea de tiempo 2030-2050, tecnología o lugares...",
        "sendBtn": "Enviar", "retryBtn": "Reintentar", "voiceBtn": "Iniciar Enlace de Voz", "voiceStopBtn": "Detener Enlace de Voz",
        "voiceListening": "Escuchando tu voz...", "voiceSpeaking": "Hayaati está hablando...", "voiceConnecting": "Conectando enlace de voz...",
        "voiceUnsupported": "El acceso al micrófono no es compatible con este navegador.", "voiceNotAvailableLang": "La conversación por voz aún no está disponible en este idioma. Puedes chatear por texto.",
        "rateLimitBanner": "Límite de velocidad por visitante activo para seguridad del proyecto.", "talkTo": "Hablar con Hayaati", "typeInstead": "Escribir en su lugar",
        "returnToOrb": "Volver al orbe de voz", "muteMic": "Silenciar micrófono", "unmuteMic": "Activar micrófono",
        "micLabel": "Micrófono", "mutedLabel": "Silenciado", "endSession": "Finalizar sesión", "endLabel": "Fin",
        "userTag": "TÚ", "assistantTag": "HAYAATI", "cognitiveLink": "ENLACE COGNITIVO DIRECTO",
        "orb": {"ready": "Listo", "listening": "Escuchando...", "thinking": "Pensando...", "speaking": "Hablando...", "tapToStart": "Toca Iniciar para hablar", "start": "Iniciar"},
        "errors": {
            "quotaReached": "El asistente ha alcanzado su límite computacional. Por favor, inténtalo más tarde. Puedes seguir leyendo el sitio.",
            "serverBusy": "El servicio está temporalmente ocupado. Por favor, reintenta en unos instantes.",
            "networkError": "Conexión perdida. Verifica tu internet y reintenta.",
            "micBlocked": "Permiso de micrófono denegado. Habilita el micrófono en los ajustes de tu navegador.",
            "sessionEnded": "Sesión de voz finalizada (duración máxima alcanzada). Puedes iniciar una nueva sesión.",
            "genericError": "Ocurrió un error al procesar tu solicitud. Haz clic en Reintentar."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Fundado por Aliya Khan.",
        "disclaimer": "Hayaati Web Technology es un archivo de investigación especulativa independiente. Todas las proyecciones representan hipótesis de ingeniería para 2030 2050.",
        "liveDomainLabel": "DOMINIO OFICIAL", "quickLinks": "Índice de Navegación", "systemDesignation": "MOTOR CENTRAL HAYAATI // VERIFICADO", "allRightsReserved": "Todos los Derechos Reservados."
    },
    "common": {
        "year": "Año", "status": "Estado", "operational": "Operativo", "close": "Cerrar", "back": "Volver",
        "retry": "Reintentar", "error": "Fallo", "success": "Éxito", "loading": "Cargando..."
    },
    "languageSelector": {
        "selectLanguage": "Seleccionar idioma internacional", "dialogTitle": "Selector de Idioma",
        "searchPlaceholder": "Filtrar idiomas (ej. Español, English, Français)...", "languagesCountSuffix": "Idiomas"
    },
    "imageSlot": {"opticalChannel": "CANAL ÓPTICO", "framePending": "IMAGEN EN ESPERA", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "ERROR 404 // SECTOR NO ENCONTRADO", "title": "Señal Perdida en el Espacio Profundo",
        "description": "Las coordenadas solicitadas no corresponden a ningún sistema o hábitat futuro conocido.", "returnBtn": "Volver al Comando Orbital"
    }
}

es_content = json.loads(json.dumps(en_content))
es_content["eras"]["era-2030"]["title"] = "La Fundación Cognitiva"
es_content["eras"]["era-2030"]["yearLabel"] = "ÉPOCA // 2030"
es_content["eras"]["era-2030"]["story"] = "Las mañanas comienzan con una inteligencia sintética ambiental que sincronizó las redes de energía mientras dormías. La metrópolis vibra con conductos eléctricos silenciosos y cápsulas de entrega que transitan por túneles subterráneos dedicados."
es_content["eras"]["era-2030"]["breakthroughs"] = [
    "Asistentes de aprendizaje automático ambiental en el dispositivo sin latencia en la nube",
    "Baterías de litio-metal en estado sólido que alimentan 1.000 km de transporte municipal",
    "Certificación de taxis aéreos urbanos autónomos punto a punto en los principales corredores"
]
es_content["eras"]["era-2030"]["bannerAlt"] = "Vista panorámica de una metrópolis ecosostenible en 2030 con corredores de entrega autónomos"
es_content["eras"]["era-2030"]["bannerPrompt"] = "Toma panorámica cinematográfica de una ciudad costera sostenible en 2030 al amanecer, torres solares de cristal, lanzaderas eléctricas silenciosas, jardines verticales, resolución 8k."

es_content["eras"]["era-2035"]["title"] = "La Síntesis Biomecánica"
es_content["eras"]["era-2035"]["yearLabel"] = "ÉPOCA // 2035"
es_content["eras"]["era-2035"]["story"] = "Las prótesis neurales permiten a los usuarios interactuar con interfaces digitales sin esfuerzo motriz. La medicina preventiva opera a nivel celular continuo mediante biosensores miniaturizados."
es_content["eras"]["era-2035"]["breakthroughs"] = [
    "Sensores optoelectrónicos subdérmicos para monitorización metabólica continua",
    "Decodificadores no invasivos de corteza motora que restauran la movilidad física",
    "Biorreactores microbianos que sintetizan compuestos estructurales ultra resistentes"
]
es_content["eras"]["era-2035"]["bannerAlt"] = "Vista cinematográfica de una ciudad vertical con biodomos y vías de levitación magnética"
es_content["eras"]["era-2035"]["bannerPrompt"] = "Toma cinematográfica de una ciudad vertical en 2035 con tubos de tránsito magnético y domos aeropónicos, crepúsculo, resolución 8k."

es_content["eras"]["era-2050"]["title"] = "El Horizonte Planetario y Orbital"
es_content["eras"]["era-2050"]["yearLabel"] = "ÉPOCA // 2050"
es_content["eras"]["era-2050"]["story"] = "La manufactura pesada se ha trasladado fuera de la biosfera terrestre hacia refinerías espaciales en microgravedad. En la Tierra, los reactores de fusión comercial y ecosistemas de ciclo cerrado restauran el equilibrio oceánico y atmosférico."
es_content["eras"]["era-2050"]["breakthroughs"] = [
    "Reactores comerciales de fusión por confinamiento magnético para energía limpia continua",
    "Instalaciones polares lunares permanentes para extracción de hielo y combustible",
    "Complejos de biología sintética a escala planetaria para captura masiva de carbono"
]
es_content["eras"]["era-2050"]["bannerAlt"] = "Vista de la Tierra desde la órbita baja mostrando elevadores orbitales y hábitats habitados"
es_content["eras"]["era-2050"]["bannerPrompt"] = "Toma cinematográfica de la Tierra desde el espacio con estación de transferencia orbital en primer plano, curvatura azul de la atmósfera, espacio oscuro, resolución 8k."

for k, card in en_content["timelineCards"].items():
    es_content["timelineCards"][k]["title"] = f"Proyecto // {k.upper()}"
    es_content["timelineCards"][k]["description"] = f"Plano de ingeniería avanzada y especificación técnica de cero emisiones para el periodo 2030-2050."
    es_content["timelineCards"][k]["breakthrough"] = f"Principios científicos avanzados que garantizan una eficiencia energética y ambiental óptima."
    es_content["timelineCards"][k]["alt"] = f"Ilustración técnica de {k}"
    es_content["timelineCards"][k]["prompt"] = f"Fotografía de arquitectura cinematográfica, {k}, resolución 8k."

for k, card in en_content["techCards"].items():
    es_content["techCards"][k]["title"] = f"Tecnología // {k.upper()}"
    es_content["techCards"][k]["description"] = f"Sistema tecnológico futuro {k.upper()} diseñado para un funcionamiento sostenible y automatizado."
    es_content["techCards"][k]["howItWorks"] = f"Opera según principios físicos y computacionales de vanguardia con cero emisiones directas."
    es_content["techCards"][k]["alt"] = f"Diseño conceptual de {k}"
    es_content["techCards"][k]["prompt"] = f"Fotografía de concepto industrial, {k}, resolución 8k."

for k, place in en_content["places"].items():
    es_content["places"][k]["title"] = f"Lugar // {k.upper()}"
    es_content["places"][k]["location"] = f"Hábitat Internacional {k.upper()}"
    es_content["places"][k]["story"] = f"Los residentes disfrutan de infraestructuras de última generación y de un entorno libre de polución en armonía con la tecnología."
    es_content["places"][k]["infrastructureTags"] = ["Red inteligente", "Tránsito sostenible", "Energía limpia", "Protección ambiental"]
    es_content["places"][k]["alt"] = f"Vista realista de {k}"
    es_content["places"][k]["prompt"] = f"Fotografía urbana cinematográfica, {k}, resolución 8k."

es_content["projects"]["pendingNotice"] = "Los proyectos son verificados y sincronizados directamente por Aliya Khan."
es_content["projects"]["emptyLive"] = "No hay despliegues activos en este momento. Se calibrarán nuevos proyectos aquí."
es_content["projects"]["emptyInProgress"] = "Los planos de ingeniería activos se indexarán aquí a medida que se alcancen los hitos."
es_content["projects"]["emptyIdeas"] = "Las propuestas de investigación conceptual se catalogarán aquí."

os.makedirs('locales/es', exist_ok=True)
with open('locales/es/ui.json', 'w', encoding='utf-8') as f:
    json.dump(es_ui, f, ensure_ascii=False, indent=2)
with open('locales/es/content.json', 'w', encoding='utf-8') as f:
    json.dump(es_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Spanish (es) locales.")

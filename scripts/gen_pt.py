#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

pt_ui = {
    "meta": {"code": "pt", "languageName": "Portuguese", "nativeName": "Português", "rtl": False},
    "nav": {
        "home": "Início", "timeline": "Linha do Tempo", "tech": "Tecnologia Futura", "places": "Cidades e Lugares",
        "projects": "Meus Projetos", "advertise": "Anunciar / Listar", "about": "Sobre", "contact": "Fale Conosco",
        "assistant": "Assistente IA", "language": "Idioma", "menu": "Abrir menu de navegação", "close": "Fechar menu de navegação",
        "brandSubtitle": "TECNOLOGIA // 2030-2050", "menuSysHeader": "MENU DO SISTEMA", "locationDomain": "LOCALIZAÇÃO: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "SISTEMA//NÓ.2030-2050", "online": "SISTEMAS ONLINE",
        "headline": "O futuro não acontece por acaso. Estamos a construí-lo juntos.",
        "subtitle": "Um roteiro cinematográfico de inovação humana, máquinas cognitivas, colónias orbitais e habitats sustentáveis de 2030 a 2050. Criado por Aliya Khan.",
        "exploreCta": "Explorar 2030 2050", "projectsCta": "Ver Meus Projetos",
        "coordinates": "COORDENADAS: 28.6139° N, 77.2090° E // MOTOR ATIVO", "timelineSpan": "HORIZONTE TEMPORAL 2030 — 2050",
        "liveTelemetry": "TELEMETRIA: NOMINAL", "scrollDown": "Deslize para explorar a linha do tempo",
        "imageAlt": "Visão cinematográfica de uma metrópole futurista 2030 2050"
    },
    "timeline": {
        "sectionTag": "MAPA_CRONOLÓGICO // 2030 -> 2050", "title": "Cronologia da Inovação Humana",
        "subtitle": "Da inteligência de borda omnipresente em 2030 à indústria pesada interplanetária em 2050.",
        "chronoMap": "PLANO CRONOLÓGICO", "eraHeading": "HORIZONTE DA ÉPOCA", "storyTitle": "Um Dia Nesta Época",
        "breakthroughsTitle": "Marcos Tecnológicos Decisivos", "viewEraDetails": "Examinar Dossier da Época",
        "jumpToEra": "Ir para esta Época", "statusPrefix": "ESTADO", "eraBreakthroughsHeading": "Avanços",
        "specificationsCount": "Especificações"
    },
    "tech": {
        "sectionTag": "ÍNDICE_SISTEMAS // 42 FRONTEIRAS", "title": "Catálogo de Tecnologias Futuras",
        "subtitle": "Projetos detalhados e mecanismos teóricos em 7 fronteiras tecnológicas essenciais.",
        "systemsIndex": "ÍNDICE DO CATÁLOGO", "howItWorksLabel": "COMO PODERÁ FUNCIONAR",
        "architectureMechanics": "ARQUITETURA TÉCNICA E MECÂNICA", "underlyingMechanism": "PRINCÍPIO FÍSICO SUBJACENTE",
        "searchPlaceholder": "Pesquisar tecnologias, sistemas ou inovações...", "searchNoResults": "Nenhuma tecnologia correspondente encontrada.",
        "filterAll": "Todas as Fronteiras", "modalClose": "Fechar Dossier", "viewDossier": "Ver Ficha Técnica",
        "yearLabel": "ANO", "statusLabel": "ESTADO", "activeStatus": "ESPECIFICAÇÃO ATIVA", "promptLabel": "INSTRUÇÃO",
        "categories": {
            "all": "Todas as Fronteiras", "ai": "IA do Futuro", "vehicles": "Veículos e Trânsito", "devices": "Dispositivos e Biónica",
            "homeWork": "Habitação e Trabalho", "health": "Saúde e Biologia", "energy": "Energia e Clima", "space": "Espaço Profundo"
        }
    },
    "places": {
        "sectionTag": "ÍNDICE_HÁBITATS // 2030-2050", "title": "Postais de Cidades e Lugares",
        "subtitle": "Postais fotorrealistas e relatórios de infraestruturas de colónias humanas emergentes na Terra e no espaço.",
        "horizonLabel": "PERSPECTIVA", "aDayInPlace": "Um Dia Neste Local", "infrastructureLabel": "Infraestruturas Críticas",
        "viewLocation": "Examinar Plano do Habitat", "promptLabel": "INSTRUÇÃO"
    },
    "projects": {
        "sectionTag": "PROJETOS_FUNDADORA // ALIYA KHAN", "title": "Meus Projetos",
        "subtitle": "Sistemas de software ativos, arquivos de pesquisa e projetos de arquitetura concebidos por Aliya Khan.",
        "tabs": {"live": "Sistemas em Execução", "inProgress": "Em Desenvolvimento", "futureIdeas": "Conceitos Futuros"},
        "visit": "Abrir Ligação do Sistema", "emptyLive": "Nenhum sistema público ativo de momento. Novos lançamentos serão apresentados aqui.",
        "emptyInProgress": "Projetos de engenharia em curso serão listados assim que atingirem os marcos definidos.",
        "emptyIdeas": "Propostas de pesquisa teórica serão indexadas aqui.",
        "pendingNotice": "Projetos revistos e sincronizados diretamente por Aliya Khan."
    },
    "advertise": {
        "sectionTag": "SUBMISSÃO_DE_PROJETO // LISTAGEM", "title": "Anunciar / Submeter Projeto",
        "subtitle": "Submeta inovações tecnológicas ou projetos ecológicos para análise direta por Aliya Khan.",
        "reviewNotice": "Todas as propostas são avaliadas pessoalmente por Aliya Khan. Comunicações não solicitadas serão rejeitadas.",
        "pricingNote": "Parâmetros de posicionamento e condições serão transmitidos por contacto direto.",
        "form": {
            "name": "Nome Completo", "email": "Endereço de Correio Eletrónico", "projectName": "Título do Projeto / Empresa",
            "projectLink": "Ligação do Sistema / Relatório Técnico", "category": "Área Tecnológica", "selectCategory": "Selecione uma categoria...",
            "budget": "Orçamento Estimado / Fase de Financiamento", "budgetPlaceholder": "ex.: 10.000€-50.000€, Bolsa de Investigação",
            "description": "Sinopse do Projeto e Inovação Principal", "submitBtn": "Submeter Projeto para Revisão",
            "sending": "A encriptar e enviar...", "sentSuccess": "Submissão transmitida com sucesso. Aliya Khan analisará a sua proposta.",
            "sendError": "Falha na transmissão. Por favor, envie uma mensagem direta por email."
        }
    },
    "about": {
        "sectionTag": "ARQUITETA_CHEFE // DOSSIER", "title": "Sobre — Aliya Khan",
        "subtitle": "Fundadora, arquiteta de software e investigadora de sistemas na Hayaati Web Technology.",
        "ownerName": "Aliya Khan", "architectTitle": "FUNDADORA E ARQUITETA CHEFE",
        "leadArchitect": "Líder no desenvolvimento de arquiteturas de sistemas futuros e infraestruturas digitais de elevado rendimento.",
        "bioPlaceholder": "Aliya Khan é arquiteta de software e investigadora dedicada à convergência de sistemas distribuídos, inteligência artificial e habitats espaciais a longo prazo. A Hayaati Web Technology é uma iniciativa independente para visualização de avanços tecnológicos.",
        "contactDirect": "Contacto Direto", "photoAlt": "Aliya Khan, Fundadora e Arquiteta Chefe"
    },
    "contact": {
        "sectionTag": "CANAL_DE_TRANSMISSÃO // SEGURO", "title": "Comunicação Direta",
        "subtitle": "Envie consultas técnicas especializadas, parcerias de investigação ou propostas de projetos.",
        "emailLabel": "Canal de Comunicação Oficial", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "Nome Completo", "email": "Endereço Eletrónico", "message": "Mensagem / Descrição da Transmissão",
            "submitBtn": "Enviar Mensagem Encriptada", "sending": "A transmitir dados...",
            "sentSuccess": "Mensagem recebida com sucesso. Responderemos através do canal oficial.",
            "sendError": "Erro no envio. Por favor envie mensagem direta para o email oficial.",
            "placeholderName": "Introduza o seu nome...", "placeholderEmail": "Introduza o seu endereço de email...",
            "placeholderMessage": "Escreva a sua consulta ou mensagem técnica..."
        }
    },
    "assistant": {
        "buttonLabel": "Assistente IA", "panelTitle": "INTERFACE COGNITIVA HAYAATI", "subtitle": "HORIZONTE COGNITIVO // 2030-2050",
        "welcomeMessage": "Olá! Sou a interface inteligente da Hayaati. Coloque questões sobre tecnologias de ponta ou escolha um tema para explorar.",
        "chips": ["Como será o ano de 2030?", "Mostre-me as inovações na saúde futura", "Conte-me mais sobre a Hayaati e a Aliya Khan"],
        "inputPlaceholder": "Pergunte sobre a cronologia 2030-2050, inovações ou cidades futuras...",
        "sendBtn": "Enviar", "retryBtn": "Repetir", "voiceBtn": "Iniciar Ligação de Voz", "voiceStopBtn": "Terminar Sessão de Voz",
        "voiceListening": "A escutar...", "voiceSpeaking": "A responder...", "voiceConnecting": "A estabelecer ligação de voz...",
        "voiceUnsupported": "O acesso ao microfone não é suportado pelo seu navegador.", "voiceNotAvailableLang": "A conversação por voz ainda não se encontra ativa neste idioma. Pode comunicar por texto.",
        "rateLimitBanner": "Controlo de pedidos por visitante ativo.", "talkTo": "Falar com a Hayaati", "typeInstead": "Prefiro escrever",
        "returnToOrb": "Voltar ao Orbe de Voz", "muteMic": "Silenciar microfone", "unmuteMic": "Ativar microfone",
        "micLabel": "Microfone", "mutedLabel": "Silenciado", "endSession": "Encerrar Sessão", "endLabel": "Fim",
        "userTag": "VOCÊ", "assistantTag": "HAYAATI", "cognitiveLink": "LIGAÇÃO COGNITIVA DIRETA",
        "orb": {"ready": "Pronto", "listening": "A escutar...", "thinking": "A processar...", "speaking": "A falar...", "tapToStart": "Toque em Iniciar para falar", "start": "Iniciar"},
        "errors": {
            "quotaReached": "O assistente atingiu a capacidade de processamento temporária. Por favor tente mais tarde.",
            "serverBusy": "O servidor está com tráfego elevado. Por favor tente dentro de instantes.",
            "networkError": "Ligação de rede perdida. Verifique a sua ligação à internet.",
            "micBlocked": "Acesso ao microfone recusado. Permita a utilização do microfone no navegador.",
            "sessionEnded": "Sessão de voz concluída (limite de duração alcançado). Pode iniciar uma nova sessão a qualquer momento.",
            "genericError": "Ocorreu uma anomalia no processamento. Por favor selecione Repetir."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Fundado por Aliya Khan.",
        "disclaimer": "A Hayaati Web Technology é um repositório especulativo independente. Todas as projeções constituem hipóteses de engenharia para 2030 2050.",
        "liveDomainLabel": "DOMÍNIO OFICIAL", "quickLinks": "Índice Geral", "systemDesignation": "MOTOR CENTRAL HAYAATI // AUTENTICADO", "allRightsReserved": "Todos os direitos reservados."
    },
    "common": {
        "year": "Ano", "status": "Estado", "operational": "Operacional", "close": "Fechar", "back": "Voltar",
        "retry": "Tentar novamente", "error": "Erro", "success": "Sucesso", "loading": "A carregar..."
    },
    "languageSelector": {
        "selectLanguage": "Selecionar idioma internacional", "dialogTitle": "Seletor de Idioma",
        "searchPlaceholder": "Filtrar idiomas (ex.: Português, English, Français)...", "languagesCountSuffix": "Idiomas"
    },
    "imageSlot": {"opticalChannel": "CANAL ÓPTICO", "framePending": "IMAGEM EM PROCESSAMENTO", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "ERRO 404 // SETOR NÃO ENCONTRADO", "title": "Sinal Perdido no Espaço Profundo",
        "description": "As coordenadas especificadas não correspondem a nenhum subsistema ou habitat futuro catalogado.", "returnBtn": "Regressar ao Comando Orbital"
    }
}

pt_content = json.loads(json.dumps(en_content))
pt_content["eras"]["era-2030"]["title"] = "A Fundação Cognitiva"
pt_content["eras"]["era-2030"]["yearLabel"] = "ÉPOCA // 2030"
pt_content["eras"]["era-2030"]["story"] = "As manhãs iniciam com inteligência sintética ambiente que equilibrou as redes de energia durante o repouso. A metrópole opera com condutas elétricas silenciosas e cápsulas de entrega automatizadas em túneis dedicados."
pt_content["eras"]["era-2030"]["breakthroughs"] = [
    "Assistentes de aprendizagem automática locais no dispositivo sem dependência de nuvem",
    "Baterias de lítio-metal em estado sólido com autonomia de 1.000 km para transporte urbano",
    "Homologação comercial de táxis aéreos autónomos ponto a ponto nos principais corredores"
]
pt_content["eras"]["era-2030"]["bannerAlt"] = "Vista cinematográfica de uma metrópole sustentável em 2030 com corredores de transporte limpos"
pt_content["eras"]["era-2030"]["bannerPrompt"] = "Fotografia panorâmica cinematográfica de cidade costeira ecológica em 2030 ao amanhecer, torres envidraçadas solares, lançadeiras elétricas, jardins verticais, resolução 8k."

pt_content["eras"]["era-2035"]["title"] = "A Síntese Biomecânica"
pt_content["eras"]["era-2035"]["yearLabel"] = "ÉPOCA // 2035"
pt_content["eras"]["era-2035"]["story"] = "Interfaces neurais permitem a interação com sistemas de informação através do pensamento. A medicina preventiva decorre em tempo real à escala celular mediante nanossensores biocompatíveis."
pt_content["eras"]["era-2035"]["breakthroughs"] = [
    "Sensores optoeletrónicos subdérmicos para monitorização contínua de biomarcadores metabólicos",
    "Descodificadores não invasivos do córtex motor que restauram a função muscular",
    "Biorreatores miceliais e bacterianos para produção de novos materiais de construção sustentáveis"
]
pt_content["eras"]["era-2035"]["bannerAlt"] = "Perspetiva cinematográfica de uma urbe vertical com biodomos e linhas de levitação magnética"
pt_content["eras"]["era-2035"]["bannerPrompt"] = "Panorâmica cinematográfica de cidade vertical em 2035 com condutas de trânsito maglev e cúpulas aeropónicas, entardecer, resolução 8k."

pt_content["eras"]["era-2050"]["title"] = "O Horizonte Planetário e Orbital"
pt_content["eras"]["era-2050"]["yearLabel"] = "ÉPOCA // 2050"
pt_content["eras"]["era-2050"]["story"] = "A indústria pesada foi transferida para plataformas orbitais em microgravidade. Reatores de fusão nuclear e ciclos fechados de materiais restauram a harmonia climática dos oceanos e da atmosfera terrestre."
pt_content["eras"]["era-2050"]["breakthroughs"] = [
    "Reatores de fusão nuclear comerciais a fornecer eletricidade limpa constante",
    "Bases permanentes no polo sul lunar para extração de voláteis e propulsores espaciais",
    "Centros globais de biologia sintética dedicados à remoção massiva de carbono atmosférico"
]
pt_content["eras"]["era-2050"]["bannerAlt"] = "Visão da Terra a partir da órbita com complexos espaciais e estações habitacionais"
pt_content["eras"]["era-2050"]["bannerPrompt"] = "Visual cinematográfico da Terra vista do espaço com docas orbitais de transferência, horizonte azul curvado, espaço profundo, resolução 8k."

for k, card in en_content["timelineCards"].items():
    pt_content["timelineCards"][k]["title"] = f"Projeto // {k.upper()}"
    pt_content["timelineCards"][k]["description"] = f"Especificação de engenharia avançada com neutralidade carbónica para o período 2030-2050."
    pt_content["timelineCards"][k]["breakthrough"] = f"Fundamentos científicos avançados e eficiência de recursos."
    pt_content["timelineCards"][k]["alt"] = f"Visualização técnica de {k}"
    pt_content["timelineCards"][k]["prompt"] = f"Fotografia arquitetónica cinematográfica, {k}, resolução 8k."

for k, card in en_content["techCards"].items():
    pt_content["techCards"][k]["title"] = f"Tecnologia // {k.upper()}"
    pt_content["techCards"][k]["description"] = f"Subsistema pioneiro {k.upper()} concebido para operações sustentáveis e autónomas."
    pt_content["techCards"][k]["howItWorks"] = f"Alimentado por princípios físicos e algoritmos computacionais sem pegada carbónica."
    pt_content["techCards"][k]["alt"] = f"Imagem conceitual de {k}"
    pt_content["techCards"][k]["prompt"] = f"Conceito de engenharia industrial, {k}, resolução 8k."

for k, place in en_content["places"].items():
    pt_content["places"][k]["title"] = f"Local // {k.upper()}"
    pt_content["places"][k]["location"] = f"Colónia Internacional {k.upper()}"
    pt_content["places"][k]["story"] = f"Os residentes usufruem de infraestruturas ecológicas de ciclo fechado em simbiose com a natureza."
    pt_content["places"][k]["infrastructureTags"] = ["Rede Inteligente", "Mobilidade Limpa", "Energia Descarbonizada", "Biossistemas"]
    pt_content["places"][k]["alt"] = f"Imagem fotorrealista de {k}"
    pt_content["places"][k]["prompt"] = f"Cenário urbano cinematográfico, {k}, resolução 8k."

pt_content["projects"]["pendingNotice"] = "Projetos revistos e sincronizados diretamente por Aliya Khan."
pt_content["projects"]["emptyLive"] = "Nenhum sistema público ativo de momento. Novos lançamentos serão apresentados aqui."
pt_content["projects"]["emptyInProgress"] = "Projetos de engenharia em curso serão listados assim que atingirem os marcos definidos."
pt_content["projects"]["emptyIdeas"] = "Propostas de pesquisa teórica serão indexadas aqui."

os.makedirs('locales/pt', exist_ok=True)
with open('locales/pt/ui.json', 'w', encoding='utf-8') as f:
    json.dump(pt_ui, f, ensure_ascii=False, indent=2)
with open('locales/pt/content.json', 'w', encoding='utf-8') as f:
    json.dump(pt_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Portuguese (pt) locales.")

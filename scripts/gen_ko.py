#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

ko_ui = {
    "meta": {"code": "ko", "languageName": "Korean", "nativeName": "한국어", "rtl": False},
    "nav": {
        "home": "홈", "timeline": "미래 연대표", "tech": "미래 기술", "places": "도시 및 거주지",
        "projects": "개발 프로젝트", "advertise": "프로젝트 제안 / 등록", "about": "소개", "contact": "문의하기",
        "assistant": "AI 어시스턴트", "language": "언어", "menu": "내비게이션 메뉴 열기", "close": "내비게이션 메뉴 닫기",
        "brandSubtitle": "첨단 기술 // 2030-2050", "menuSysHeader": "시스템 메뉴", "locationDomain": "접속 노드: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "시스템//노드.2030-2050", "online": "모든 시스템 정상 가동 중",
        "headline": "미래는 저절로 오지 않습니다. 우리가 함께 설계하고 만듭니다.",
        "subtitle": "2030년부터 2050년까지 인류의 기술 혁신, 인지 지능형 기계, 궤도 거주 식민지 및 지속 가능한 생태 거주지의 영화적 청사진. Aliya Khan 제작.",
        "exploreCta": "2030 2050 탐험하기", "projectsCta": "프로젝트 살펴보기",
        "coordinates": "지리적 좌표: 28.6139° N, 77.2090° E // 추진 엔진 활성화", "timelineSpan": "시간적 지평 2030 — 2050",
        "liveTelemetry": "원격 측정: 정상", "scrollDown": "아래로 스크롤하여 연대표 탐색",
        "imageAlt": "2030-2050년 미래 거대 도시의 영화적 경관"
    },
    "timeline": {
        "sectionTag": "시간 지도 // 2030 -> 2050", "title": "인류 혁신의 연대기",
        "subtitle": "2030년 도처에 편재된 온디바이스 인공지능부터 2050년 행성 간 중공업 체계 구축까지.",
        "chronoMap": "연대기 청사진", "eraHeading": "시대의 지평", "storyTitle": "이 시대의 하루",
        "breakthroughsTitle": "핵심 기술 혁신 이정표", "viewEraDetails": "시대 상세 보고서 보기",
        "jumpToEra": "이 시대로 이동", "statusPrefix": "상태", "eraBreakthroughsHeading": "기술적 돌파구",
        "specificationsCount": "기술 규격"
    },
    "tech": {
        "sectionTag": "시스템 색인 // 42개 핵심 영역", "title": "미래 기술 카탈로그",
        "subtitle": "7대 근본 기술 영역 전반에 걸친 포괄적 시스템 청사진과 과학적 작동 원리.",
        "systemsIndex": "카탈로그 색인", "howItWorksLabel": "가상 작동 원리",
        "architectureMechanics": "공학 아키텍처 및 메커니즘", "underlyingMechanism": "기반 물리 법칙",
        "searchPlaceholder": "기술, 시스템 또는 혁신 검색...", "searchNoResults": "일치하는 기술 시스템을 찾을 수 없습니다.",
        "filterAll": "모든 영역", "modalClose": "상세 닫기", "viewDossier": "기술 보고서 보기",
        "yearLabel": "연도", "statusLabel": "상태", "activeStatus": "활성 규격", "promptLabel": "프롬프트",
        "categories": {
            "all": "모든 영역", "ai": "미래 AI", "vehicles": "모빌리티 및 수송", "devices": "디바이스 및 바이오닉스",
            "homeWork": "주거 및 업무 환경", "health": "의료 및 생명공학", "energy": "청정에너지 및 기후", "space": "심우주 개척"
        }
    },
    "places": {
        "sectionTag": "거주지 색인 // 2030-2050", "title": "미래 도시와 거주지의 엽서",
        "subtitle": "지구와 우주 궤도에 형성되는 신인류 거주지에 대한 초고화질 기록과 인프라 설계서.",
        "horizonLabel": "전망", "aDayInPlace": "이곳에서의 하루", "infrastructureLabel": "핵심 기반시설",
        "viewLocation": "거주지 설계안 검토", "promptLabel": "생성 프롬프트"
    },
    "projects": {
        "sectionTag": "설립자 주도 프로젝트 // ALIYA KHAN", "title": "개발 프로젝트",
        "subtitle": "Aliya Khan 이 설계하고 주도하는 소프트웨어 시스템, 연구 기록 및 공학 아키텍처.",
        "tabs": {"live": "가동 중인 시스템", "inProgress": "개발 진행 중", "futureIdeas": "미래 개념 구상"},
        "visit": "시스템 링크 열기", "emptyLive": "현재 일반에 공개된 가동 시스템이 없습니다. 새로운 프로젝트가 곧 등록됩니다.",
        "emptyInProgress": "주요 개발 이정표에 도달하는 대로 공학 청사진이 공개됩니다.",
        "emptyIdeas": "이론적 연구 제안과 구상들이 이곳에 등재됩니다.",
        "pendingNotice": "모든 프로젝트는 Aliya Khan 에 의해 직접 검토되고 동기화됩니다."
    },
    "advertise": {
        "sectionTag": "프로젝트 제안 // 등록 신청", "title": "혁신 프로젝트 등록 및 제안",
        "subtitle": "획기적인 기술 혁신이나 지속 가능한 이니셔티브를 Aliya Khan 의 직접 검토를 위해 제출하세요.",
        "reviewNotice": "모든 제안은 Aliya Khan 이 직접 검토하며, 스팸 및 무관한 홍보는 즉시 배제됩니다.",
        "pricingNote": "게재 요건 및 협력 조건은 직접 연락을 통해 상세히 안내해 드립니다.",
        "form": {
            "name": "성함", "email": "연락처 이메일", "projectName": "프로젝트명 / 기업명",
            "projectLink": "시스템 주소 또는 기술 백서 링크", "category": "기술 분야", "selectCategory": "분야 선택...",
            "budget": "예상 예산 / 투자 단계", "budgetPlaceholder": "예: 10,000달러-50,000달러, 연구 지원금",
            "description": "프로젝트 개요 및 핵심 기술 혁신성", "submitBtn": "검토를 위한 제출",
            "sending": "암호화 전송 중...", "sentSuccess": "제안서가 성공적으로 전송되었습니다. Aliya Khan 이 내용을 검토할 예정입니다.",
            "sendError": "전송 중 오류가 발생했습니다. 공식 이메일로 직접 문의해 주십시오."
        }
    },
    "about": {
        "sectionTag": "수석 아키텍트 기록", "title": "소개 — Aliya Khan",
        "subtitle": "Hayaati Web Technology 설립자, 소프트웨어 아키텍트 및 미래 시스템 연구원.",
        "ownerName": "Aliya Khan", "architectTitle": "설립자 겸 수석 시스템 아키텍트",
        "leadArchitect": "2030-2050년을 향한 미래 분산 시스템 및 고성능 디지털 인프라 설계를 주도합니다.",
        "bioPlaceholder": "Aliya Khan 은 분산 시스템, 인공 인지 지능 및 장기 우주 거주 환경의 융합을 연구하는 소프트웨어 아키텍트입니다. Hayaati Web Technology 는 객관적인 공학적 관점에서 인류의 기술적 도약을 시각화하는 독립 플랫폼입니다.",
        "contactDirect": "직접 연락", "photoAlt": "Aliya Khan, 설립자 겸 수석 아키텍트"
    },
    "contact": {
        "sectionTag": "보안 통신 채널", "title": "직접 소통",
        "subtitle": "심층 기술 질의, 공동 연구 제휴 또는 프로젝트 협업을 제안하세요.",
        "emailLabel": "공식 통신 채널", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "성함", "email": "이메일 주소", "message": "메시지 내용 / 기술 문의",
            "submitBtn": "암호화 메시지 전송", "sending": "전송 중...",
            "sentSuccess": "메시지가 안전하게 전송되었습니다. 공식 채널을 통해 답변드리겠습니다.",
            "sendError": "전송에 실패했습니다. 공식 이메일로 직접 문의해 주십시오.",
            "placeholderName": "성함을 입력하세요...", "placeholderEmail": "이메일 주소를 입력하세요...",
            "placeholderMessage": "협업 제안이나 구체적인 문의 내용을 작성해 주세요..."
        }
    },
    "assistant": {
        "buttonLabel": "AI 어시스턴트", "panelTitle": "HAYAATI 인지 인터페이스", "subtitle": "인지적 지평 // 2030-2050",
        "welcomeMessage": "안녕하세요! Hayaati 어시스턴트입니다. 미래 기술 청사진에 대해 궁금한 점을 질문하시거나 탐색할 주제를 선택하세요.",
        "chips": ["2030년의 세상은 어떻게 변화할까요?", "미래 의료 기술의 혁신을 알려주세요", "Hayaati 와 Aliya Khan 에 대해 소개해 주세요"],
        "inputPlaceholder": "2030-2050 연대표, 기술, 미래 도시에 대해 질문해 보세요...",
        "sendBtn": "전송", "retryBtn": "다시 시도", "voiceBtn": "음성 연결 시작", "voiceStopBtn": "음성 대화 종료",
        "voiceListening": "듣고 있습니다...", "voiceSpeaking": "Hayaati 가 답변 중입니다...", "voiceConnecting": "음성 연결 수립 중...",
        "voiceUnsupported": "현재 브라우저는 마이크 오디오 입력을 지원하지 않습니다.", "voiceNotAvailableLang": "이 언어의 음성 대화 기능은 준비 중입니다. 텍스트 채팅을 이용해 주세요.",
        "rateLimitBanner": "방문자 요청 한도 보호 기능이 동작 중입니다.", "talkTo": "음성으로 대화하기", "typeInstead": "텍스트로 입력하기",
        "returnToOrb": "음성 구체로 복귀", "muteMic": "마이크 음소거", "unmuteMic": "마이크 음소거 해제",
        "micLabel": "마이크", "mutedLabel": "음소거됨", "endSession": "세션 종료", "endLabel": "종료",
        "userTag": "사용자", "assistantTag": "HAYAATI", "cognitiveLink": "직접 인지 링크",
        "orb": {"ready": "준비됨", "listening": "듣는 중...", "thinking": "생각 중...", "speaking": "답변 중...", "tapToStart": "시작을 탭하여 음성으로 대화하세요", "start": "시작"},
        "errors": {
            "quotaReached": "어시스턴트의 일시적 처리 한도에 도달했습니다. 잠시 후 다시 이용해 주세요. 정적 페이지 탐색은 계속 가능합니다.",
            "serverBusy": "서버 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
            "networkError": "네트워크 연결이 끊어졌습니다. 인터넷 상태를 확인해 주세요.",
            "micBlocked": "마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 사용을 허용해 주세요.",
            "sessionEnded": "최대 음성 대화 시간에 도달하여 세션이 종료되었습니다. 언제든 새로 시작하실 수 있습니다.",
            "genericError": "처리 중 문제가 발생했습니다. '다시 시도'를 클릭해 주세요."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Aliya Khan 설립.",
        "disclaimer": "Hayaati Web Technology 는 독립적인 사유적 기술 아카이브입니다. 모든 전망은 2030-2050년을 향한 공학적 가설을 바탕으로 합니다.",
        "liveDomainLabel": "공식 도메인", "quickLinks": "탐색 색인", "systemDesignation": "HAYAATI 코어 엔진 // 인증됨", "allRightsReserved": "All rights reserved."
    },
    "common": {
        "year": "연도", "status": "상태", "operational": "정상 작동", "close": "닫기", "back": "뒤로",
        "retry": "다시 시도", "error": "오류", "success": "성공", "loading": "로딩 중..."
    },
    "languageSelector": {
        "selectLanguage": "표시 언어 선택", "dialogTitle": "언어 선택 패널",
        "searchPlaceholder": "언어 검색 (예: 한국어, English, Français)...", "languagesCountSuffix": "개 언어"
    },
    "imageSlot": {"opticalChannel": "광학 채널", "framePending": "이미지 생성 대기 중", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "오류 404 // 해당 구역 없음", "title": "심우주 통신 신호 유실",
        "description": "요청하신 좌표는 기록된 미래 시스템 또는 인간 거주지와 일치하지 않습니다.", "returnBtn": "궤도 사령부로 복귀"
    }
}

ko_content = json.loads(json.dumps(en_content))
ko_content["eras"]["era-2030"]["title"] = "인지 지능의 초석"
ko_content["eras"]["era-2030"]["yearLabel"] = "시대 // 2030"
ko_content["eras"]["era-2030"]["story"] = "수면 중 전력망을 지능적으로 최적화한 주변 환경 인공지능과 함께 아침이 시작됩니다. 도시에는 무소음 전기 셔틀과 지하 전용 터널을 오가는 자율 배송 캡슐이 유기적으로 순환합니다."
ko_content["eras"]["era-2030"]["breakthroughs"] = [
    "클라우드 지연 없이 생활 주기를 실시간 지원하는 온디바이스 환경 지능 어시스턴트",
    "도시 교통 수단을 1,000km 무충전 주행시키는 고밀도 전고체 리튬메탈 배터리",
    "주요 회랑 간 자율비행 도심 항공 모빌리티(UAM) 상업 운항 정식 인가"
]
ko_content["eras"]["era-2030"]["bannerAlt"] = "친환경 자율 수송 통로를 갖춘 2030년 친환경 미래 대도시의 영화적 전경"
ko_content["eras"]["era-2030"]["bannerPrompt"] = "새벽녘 지속 가능한 해안 미래 도시의 영화 같은 파노라마 풍경, 태양광 유리 고층 빌딩, 조용한 전기 셔틀, 수직 정원, 8k 해상도."

ko_content["eras"]["era-2035"]["title"] = "생체 기계의 융합"
ko_content["eras"]["era-2035"]["yearLabel"] = "시대 // 2035"
ko_content["eras"]["era-2035"]["story"] = "비침습적 신경 인터페이스를 통해 생각만으로 디지털 정보계를 직관적으로 제어합니다. 초소형 생체 나노센서가 세포 수준에서 건강을 24시간 감시하며 예방 의학이 일상화됩니다."
ko_content["eras"]["era-2035"]["breakthroughs"] = [
    "연속 대사 지표 측정을 지원하는 피하 광전자 센서 시스템",
    "신체 운동 기능을 완벽히 복원하는 비침습성 운동 피질 디코더",
    "초고강도 친환경 건축 자재를 합성하는 균사체 및 미생물 대규모 생물반응기"
]
ko_content["eras"]["era-2035"]["bannerAlt"] = "바이오 돔과 자기부상 궤도를 갖춘 수직 입체 도시의 영화적 풍경"
ko_content["eras"]["era-2035"]["bannerPrompt"] = "황혼 무렵 초고층 수직 도시의 영화적 파노라마, 자기부상 튜브 통로와 에어로포닉 온실 돔, 8k 해상도."

ko_content["eras"]["era-2050"]["title"] = "행성 및 궤도 지평"
ko_content["eras"]["era-2050"]["yearLabel"] = "시대 // 2050"
ko_content["eras"]["era-2050"]["story"] = "중공업 생산 시설은 지구 생태계를 벗어나 미세중력 궤도 정제 플랫폼으로 이전되었습니다. 상용 핵융합 에너지와 완전 순환 경제가 지구의 바다와 대기 균형을 완벽히 되살려 놓았습니다."
ko_content["eras"]["era-2050"]["breakthroughs"] = [
    "무한 청정 기저 부하 전력을 공급하는 상업용 자기 구속 핵융합 발전소 완공",
    "달 남극 영구 기지에서 수행되는 현장 수빙 추출 및 심우주 추진체 생산",
    "기가톤 규모의 대기 중 이산화탄소를 영구 고정하는 행성 규모 합성생물학 단지"
]
ko_content["eras"]["era-2050"]["bannerAlt"] = "궤도 우주 정거장과 거주 구역 너머로 바라본 푸른 지구의 장관"
ko_content["eras"]["era-2050"]["bannerPrompt"] = "저궤도 환승 기지 너머로 지구를 내려다보는 웅장한 영화적 우주 풍경, 푸른 지구의 곡선과 칠흑 같은 암흑 우주, 8k 해상도."

for k, card in en_content["timelineCards"].items():
    ko_content["timelineCards"][k]["title"] = f"프로젝트 // {k.upper()}"
    ko_content["timelineCards"][k]["description"] = f"2030-2050년을 향한 탄소 배출 제로 첨단 엔지니어링 설계 및 기술 규격."
    ko_content["timelineCards"][k]["breakthrough"] = f"최첨단 물리 원리와 극대화된 자원 효율성 메커니즘."
    ko_content["timelineCards"][k]["alt"] = f"{k} 의 정밀 기술 청사진"
    ko_content["timelineCards"][k]["prompt"] = f"영화적 건축 사진, {k}, 8k 해상도."

for k, card in en_content["techCards"].items():
    ko_content["techCards"][k]["title"] = f"첨단 기술 // {k.upper()}"
    ko_content["techCards"][k]["description"] = f"지속 가능하고 자율적인 운영을 위해 설계된 차세대 핵심 서브시스템 {k.upper()}."
    ko_content["techCards"][k]["howItWorks"] = f"탄소 발자국이 없는 혁신적인 물리 및 계산 원리를 바탕으로 설계되었습니다."
    ko_content["techCards"][k]["alt"] = f"{k} 의 개념 설계도"
    ko_content["techCards"][k]["prompt"] = f"산업 디자인 개념 사진, {k}, 8k 해상도."

for k, place in en_content["places"].items():
    ko_content["places"][k]["title"] = f"인류 거주지 // {k.upper()}"
    ko_content["places"][k]["location"] = f"국제 연구 거주 실증단지 {k.upper()}"
    ko_content["places"][k]["story"] = f"거주자들은 폐쇄 순환형 친환경 기반시설 속에서 자연 생태계와 조화롭게 살아갑니다."
    ko_content["places"][k]["infrastructureTags"] = ["지능형 자가치유 전력망", "무탄소 모빌리티", "청정 핵융합", "생태 공존 시스템"]
    ko_content["places"][k]["alt"] = f"{k} 의 초고화질 실경"
    ko_content["places"][k]["prompt"] = f"영화 같은 미래 도시 경관, {k}, 8k 해상도."

ko_content["projects"]["pendingNotice"] = "모든 프로젝트는 Aliya Khan 에 의해 직접 검토되고 동기화됩니다."
ko_content["projects"]["emptyLive"] = "현재 일반에 공개된 가동 시스템이 없습니다. 새로운 프로젝트가 곧 등록됩니다."
ko_content["projects"]["emptyInProgress"] = "주요 개발 이정표에 도달하는 대로 공학 청사진이 공개됩니다."
ko_content["projects"]["emptyIdeas"] = "이론적 연구 제안과 구상들이 이곳에 등재됩니다."

os.makedirs('locales/ko', exist_ok=True)
with open('locales/ko/ui.json', 'w', encoding='utf-8') as f:
    json.dump(ko_ui, f, ensure_ascii=False, indent=2)
with open('locales/ko/content.json', 'w', encoding='utf-8') as f:
    json.dump(ko_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Korean (ko) locales.")

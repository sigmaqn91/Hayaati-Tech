#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

zh_ui = {
    "meta": {"code": "zh", "languageName": "Chinese", "nativeName": "中文", "rtl": False},
    "nav": {
        "home": "首页", "timeline": "未来时间线", "tech": "未来科技", "places": "城市与居所",
        "projects": "我的项目", "advertise": "项目展示 / 合作", "about": "关于", "contact": "联系我们",
        "assistant": "AI 助手", "language": "语言", "menu": "打开导航菜单", "close": "关闭导航菜单",
        "brandSubtitle": "前沿科技 // 2030-2050", "menuSysHeader": "系统菜单", "locationDomain": "访问节点: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "系统//节点.2030-2050", "online": "系统全部在线",
        "headline": "未来并非自发降临。它由我们携手构建。",
        "subtitle": "2030至2050年人类科技创新、认知智能机器、轨道殖民基地与可持续生态聚落的电影级全景蓝图。由 Aliya Khan 倾力构建。",
        "exploreCta": "探索 2030 2050", "projectsCta": "浏览我的项目",
        "coordinates": "地理坐标: 28.6139° N, 77.2090° E // 动力引擎已激活", "timelineSpan": "跨度视野 2030 — 2050",
        "liveTelemetry": "实时遥测: 运行良好", "scrollDown": "向下滚动以探索宏大时间线",
        "imageAlt": "2030至2050年未来超级大都市的电影质感景象"
    },
    "timeline": {
        "sectionTag": "时空图谱 // 2030 -> 2050", "title": "人类科技创新编年史",
        "subtitle": "从2030年无所不在的边缘智能感知，到2050年星际重工业体系的建立。",
        "chronoMap": "历程蓝图", "eraHeading": "时代视野", "storyTitle": "该时代的日常生活",
        "breakthroughsTitle": "关键科技里程碑", "viewEraDetails": "查看时代档案",
        "jumpToEra": "跳转至该时代", "statusPrefix": "运行状态", "eraBreakthroughsHeading": "重大突破",
        "specificationsCount": "技术规范"
    },
    "tech": {
        "sectionTag": "系统索引 // 42 项前沿领域", "title": "未来科技系统总览",
        "subtitle": "横跨七大核心科技前沿的详尽系统蓝图与基础物理运作机制。",
        "systemsIndex": "前沿目录索引", "howItWorksLabel": "科学运作构想",
        "architectureMechanics": "工程架构与机械原理", "underlyingMechanism": "底层物理机制",
        "searchPlaceholder": "搜索技术、系统或科学突破...", "searchNoResults": "未找到匹配的技术系统。",
        "filterAll": "所有领域", "modalClose": "关闭档案", "viewDossier": "查看技术档案",
        "yearLabel": "年份", "statusLabel": "状态", "activeStatus": "已激活技术规范", "promptLabel": "生成提示词",
        "categories": {
            "all": "所有领域", "ai": "未来人工智能", "vehicles": "智能运载与交通", "devices": "穿戴设备与仿生",
            "homeWork": "智能家居与协作", "health": "医疗与合成生物", "energy": "聚变能源与气候", "space": "深空探索与开发"
        }
    },
    "places": {
        "sectionTag": "生态聚落索引 // 2030-2050", "title": "未来城市与人居明信片",
        "subtitle": "地球表面与近地轨道新兴人类定居点的超高清实景图录与基础设施规划档案。",
        "horizonLabel": "时代前景", "aDayInPlace": "聚落的一天生活", "infrastructureLabel": "核心基础设施",
        "viewLocation": "查阅生态聚落规划", "promptLabel": "视觉提示词"
    },
    "projects": {
        "sectionTag": "创始人前沿探索 // ALIYA KHAN", "title": "我的项目",
        "subtitle": "由 Aliya Khan 主导研发的核心软件系统、理论研究文献及未来工程构架。",
        "tabs": {"live": "运行中系统", "inProgress": "研发推进中", "futureIdeas": "未来理论构想"},
        "visit": "访问系统链接", "emptyLive": "暂无公开展出的运行系统。全新研发成果即将于此上线。",
        "emptyInProgress": "达到关键阶段里程碑后，核心工程蓝图将在此公布。",
        "emptyIdeas": "前沿理论探索与研究方案将陆续在此收录。",
        "pendingNotice": "所有收录项目均经 Aliya Khan 亲自审核与系统校准。"
    },
    "advertise": {
        "sectionTag": "项目入驻 // 合作呈递", "title": "展示与呈递创新项目",
        "subtitle": "提交您的突破性科技或可持续发展工程，供 Aliya Khan 亲自审核。",
        "reviewNotice": "所有提案均由 Aliya Khan 亲自审阅。垃圾信息与无关推销将被直接过滤。",
        "pricingNote": "具体展示席位与合作模式将通过专属信道沟通确认。",
        "form": {
            "name": "完整姓名", "email": "常用联络邮箱", "projectName": "项目名称 / 机构代号",
            "projectLink": "系统网址或技术白皮书", "category": "技术领域", "selectCategory": "选择所属领域...",
            "budget": "预估预算 / 融资阶段", "budgetPlaceholder": "例如: 10,000-50,000 美元、科研基金",
            "description": "项目摘要与核心技术创新点", "submitBtn": "提交项目申请",
            "sending": "数据加密发送中...", "sentSuccess": "提交成功。Aliya Khan 将尽快审核您的技术档案。",
            "sendError": "网络发送中断。请直接通过官方邮箱联系我们。"
        }
    },
    "about": {
        "sectionTag": "首席架构师档案", "title": "关于 — Aliya Khan",
        "subtitle": "Hayaati Web Technology 创始人、系统软件架构师及未来技术研究员。",
        "ownerName": "Aliya Khan", "architectTitle": "创始人兼首席系统架构师",
        "leadArchitect": "引领面向2030至2050年的未来分布式系统与高性能数字基础设施设计。",
        "bioPlaceholder": "Aliya Khan 是一位深耕于分布式计算、人工认知智能与长期太空人居环境交叉领域的软件架构师。Hayaati Web Technology 作为一个独立探索平台，旨在通过严谨的工程视角展现人类文明的科技演进。",
        "contactDirect": "直接联络", "photoAlt": "Aliya Khan，创始人兼首席架构师"
    },
    "contact": {
        "sectionTag": "安全通讯信道", "title": "直接沟通",
        "subtitle": "发送深度技术研讨、联合研发意向或合作邀约。",
        "emailLabel": "官方通讯信箱", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "您的姓名", "email": "电子邮箱", "message": "通讯内容 / 合作说明",
            "submitBtn": "发送加密信息", "sending": "信息传送中...",
            "sentSuccess": "信息已安全送达。我们将通过官方信箱回复您。",
            "sendError": "信息发送失败。请直接发送邮件至官方信箱。",
            "placeholderName": "请输入您的姓名...", "placeholderEmail": "请输入您的电子邮箱...",
            "placeholderMessage": "请详细描述您的技术合作意向或咨询内容..."
        }
    },
    "assistant": {
        "buttonLabel": "AI 助手", "panelTitle": "HAYAATI 认知交互界面", "subtitle": "认知视野 // 2030-2050",
        "welcomeMessage": "您好！我是 Hayaati 智能助手。关于未来科技的发展蓝图，随时向我提问，或选择话题开始探索。",
        "chips": ["2030年的世界会是怎样的？", "介绍一下未来的前沿医疗突破", "聊聊 Hayaati 和 Aliya Khan"],
        "inputPlaceholder": "探索 2030-2050 时间线、核心科技或生态城市...",
        "sendBtn": "发送", "retryBtn": "重试", "voiceBtn": "启动语音交互", "voiceStopBtn": "结束语音交互",
        "voiceListening": "正在倾听...", "voiceSpeaking": "Hayaati 正在回答...", "voiceConnecting": "正在建立语音链路...",
        "voiceUnsupported": "当前浏览器暂不支持麦克风音频采集功能。", "voiceNotAvailableLang": "该语言暂未开放实时语音功能，您可以通过文字模式流畅交流。",
        "rateLimitBanner": "访问频次保护机制运行中。", "talkTo": "与 Hayaati 对话", "typeInstead": "切换为打字",
        "returnToOrb": "返回语音光球", "muteMic": "静音麦克风", "unmuteMic": "恢复麦克风",
        "micLabel": "麦克风", "mutedLabel": "静音中", "endSession": "结束当前对话", "endLabel": "结束",
        "userTag": "您", "assistantTag": "HAYAATI", "cognitiveLink": "直接认知链路",
        "orb": {"ready": "就绪", "listening": "正在倾听...", "thinking": "思考计算中...", "speaking": "正在输出...", "tapToStart": "点击开始语音对话", "start": "开始"},
        "errors": {
            "quotaReached": "助手当前算力已达上限。请稍后再试，您仍可正常浏览所有静态内容。",
            "serverBusy": "服务当前较为繁忙，请稍等片刻后重试。",
            "networkError": "网络连接异常，请检查您的网络连接状态。",
            "micBlocked": "麦克风权限被拒绝。请在浏览器设置中允许调用麦克风。",
            "sessionEnded": "语音会话已达单次最大时长限制。您可以随时发起新的会话。",
            "genericError": "处理过程中发生错误，请点击重试。"
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. 由 Aliya Khan 创立。",
        "disclaimer": "Hayaati Web Technology 是一项独立的推演性科技探索工程。所有前景预测均为针对 2030 2050 年代的严谨工程假说。",
        "liveDomainLabel": "官方访问地址", "quickLinks": "导航索引", "systemDesignation": "HAYAATI 核心引擎 // 验证通过", "allRightsReserved": "版权所有，保留一切权利。"
    },
    "common": {
        "year": "年份", "status": "状态", "operational": "正常运行", "close": "关闭", "back": "返回",
        "retry": "重试", "error": "错误", "success": "成功", "loading": "加载中..."
    },
    "languageSelector": {
        "selectLanguage": "选择界面语言", "dialogTitle": "语言切换面板",
        "searchPlaceholder": "快速检索语言 (例如: 中文, English, Français)...", "languagesCountSuffix": "种语言"
    },
    "imageSlot": {"opticalChannel": "光学信道", "framePending": "图像生成校验中", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "错误 404 // 未知时空区域", "title": "深空通讯信号丢失",
        "description": "所请求的空间坐标未匹配到任何已知的未来系统或人居聚落。", "returnBtn": "返回轨道指挥中心"
    }
}

zh_content = json.loads(json.dumps(en_content))
zh_content["eras"]["era-2030"]["title"] = "认知智能基石"
zh_content["eras"]["era-2030"]["yearLabel"] = "时代 // 2030"
zh_content["eras"]["era-2030"]["story"] = "清晨的城市伴随着泛在环境人工智能苏醒，在你安睡时，电网负荷已被精准调优。静音电动飞梭与地下管道无人配送舱穿行于城市的专属脉络中。"
zh_content["eras"]["era-2030"]["breakthroughs"] = [
    "完全无需云端回传的低延迟端侧嵌入式环境学习助手",
    "可支持1000公里城市无间断运行的固态锂金属高密电池组",
    "全自主运行的点对点城市低空空中的士正式获得民航运营认证"
]
zh_content["eras"]["era-2030"]["bannerAlt"] = "2030年具备绿色物流走廊的生态智能超级大都市全景"
zh_content["eras"]["era-2030"]["bannerPrompt"] = "2030年拂晓时分的生态海滨未来都市电影级全景摄影，太阳能光伏玻璃大厦，无声静音电动交通舱，立体垂直生态花园，8k分辨率。"

zh_content["eras"]["era-2035"]["title"] = "生物机械融合"
zh_content["eras"]["era-2035"]["yearLabel"] = "时代 // 2035"
zh_content["eras"]["era-2035"]["story"] = "高带宽非侵入式神经接口让意念成为直接的控制工具。微型化生物纳米传感器在细胞级别开展全天候健康监控，预防性医学成为日常标准。"
zh_content["eras"]["era-2035"]["breakthroughs"] = [
    "皮下光电复合传感器，实现全天候代谢与生物标志物连续监测",
    "高分辨率运动皮层无创解码器，完全恢复肢体运动机能",
    "菌丝体与基因工程微生物生物反应器，规模化生产高强度生态建筑结构材料"
]
zh_content["eras"]["era-2035"]["bannerAlt"] = "拥有生物温室穹顶与磁悬浮交通轨道的立体垂直都市电影级景象"
zh_content["eras"]["era-2035"]["bannerPrompt"] = "2035年暮色下的垂直生态摩天都市电影质感全景，真空管道磁悬浮交通网络与气雾水培温室穹顶，8k分辨率。"

zh_content["eras"]["era-2050"]["title"] = "行星与近地轨道视野"
zh_content["eras"]["era-2050"]["yearLabel"] = "时代 // 2050"
zh_content["eras"]["era-2050"]["story"] = "重工业制造体系已彻底搬离地球生物圈，转移至微重力轨道精炼加工平台。商用可控核聚变发电与闭环生态经济使地球的海洋与大气重归自然平衡。"
zh_content["eras"]["era-2050"]["breakthroughs"] = [
    "商用磁约束受控核聚变堆全面并网，提供取之不尽的清洁基荷电力",
    "月球南极永久科考科研基地，实现原位水冰资源提取与深空推进剂制备",
    "行星级超大规模合成生物圈设施，实现亿吨级大气温室气体固化工程"
]
zh_content["eras"]["era-2050"]["bannerAlt"] = "从近地轨道眺望地球以及轨道空间站和人类居住舱"
zh_content["eras"]["era-2050"]["bannerPrompt"] = "从近地轨道俯瞰地球与环形空间转运站的电影级宏伟构图，弧形蓝色大气地平线，深邃漆黑太空，8k分辨率。"

for k, card in en_content["timelineCards"].items():
    zh_content["timelineCards"][k]["title"] = f"项目工程 // {k.upper()}"
    zh_content["timelineCards"][k]["description"] = f"面向 2030-2050 年代的零碳排放先进工业设计蓝图与技术规范。"
    zh_content["timelineCards"][k]["breakthrough"] = f"基于突破性物理定律的高效资源闭环利用机制。"
    zh_content["timelineCards"][k]["alt"] = f"{k} 的精密技术图解"
    zh_content["timelineCards"][k]["prompt"] = f"电影级建筑工业摄影，{k}，8k分辨率。"

for k, card in en_content["techCards"].items():
    zh_content["techCards"][k]["title"] = f"前沿技术 // {k.upper()}"
    zh_content["techCards"][k]["description"] = f"为可持续自治化长期运行而设计的未来科技子系统 {k.upper()}。"
    zh_content["techCards"][k]["howItWorks"] = f"基于前沿物理模型与高能效算法设计，实现零环境足迹。"
    zh_content["techCards"][k]["alt"] = f"{k} 的工程概念图"
    zh_content["techCards"][k]["prompt"] = f"工业设计概念摄影，{k}，8k分辨率。"

for k, place in en_content["places"].items():
    zh_content["places"][k]["title"] = f"人居聚落 // {k.upper()}"
    zh_content["places"][k]["location"] = f"国际科研定居示范区 {k.upper()}"
    zh_content["places"][k]["story"] = f"居民依托先进的生态闭环技术生活，与自然环境实现和谐共生。"
    zh_content["places"][k]["infrastructureTags"] = ["智能自愈电网", "清洁微出行", "绿色聚变能源", "生态循环舱"]
    zh_content["places"][k]["alt"] = f"{k} 的超清实景再现"
    zh_content["places"][k]["prompt"] = f"电影级城市景观摄影，{k}，8k分辨率。"

zh_content["projects"]["pendingNotice"] = "所有收录项目均经 Aliya Khan 亲自审核与系统校准。"
zh_content["projects"]["emptyLive"] = "暂无公开展出的运行系统。全新研发成果即将于此上线。"
zh_content["projects"]["emptyInProgress"] = "达到关键阶段里程碑后，核心工程蓝图将在此公布。"
zh_content["projects"]["emptyIdeas"] = "前沿理论探索与研究方案将陆续在此收录。"

os.makedirs('locales/zh', exist_ok=True)
with open('locales/zh/ui.json', 'w', encoding='utf-8') as f:
    json.dump(zh_ui, f, ensure_ascii=False, indent=2)
with open('locales/zh/content.json', 'w', encoding='utf-8') as f:
    json.dump(zh_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Chinese (zh) locales.")

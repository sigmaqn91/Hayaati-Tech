#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

ja_ui = {
    "meta": {"code": "ja", "languageName": "Japanese", "nativeName": "日本語", "rtl": False},
    "nav": {
        "home": "ホーム", "timeline": "未来年表", "tech": "未来テクノロジー", "places": "都市と居住区",
        "projects": "開発プロジェクト", "advertise": "掲載 / プロジェクト提案", "about": "概要", "contact": "お問い合わせ",
        "assistant": "AI アシスタント", "language": "言語", "menu": "ナビゲーションメニューを開く", "close": "ナビゲーションメニューを閉じる",
        "brandSubtitle": "最先端技術 // 2030-2050", "menuSysHeader": "システムメニュー", "locationDomain": "アクセス先: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "システム//ノード.2030-2050", "online": "全システム正常稼働中",
        "headline": "未来は偶然訪れるものではない。私たちが共に築くものだ。",
        "subtitle": "2030年から2050年に至る人類の技術革新、自律的認知機械、軌道上コロニー、持続可能な都市生態系の映画的ブループリント。Aliya Khan によって設計・構築。",
        "exploreCta": "2030 2050 を探求する", "projectsCta": "プロジェクト一覧を見る",
        "coordinates": "位置情報: 28.6139° N, 77.2090° E // 推進エンジン稼働", "timelineSpan": "時間軸の展望 2030 — 2050",
        "liveTelemetry": "稼働状態: 正常", "scrollDown": "スクロールして年表を探索",
        "imageAlt": "2030-2050年の未来都市を描いた映画的景観"
    },
    "timeline": {
        "sectionTag": "時系列マップ // 2030 -> 2050", "title": "人類の技術革新クロニクル",
        "subtitle": "2030年の遍在するエッジ知能から、2050年の惑星間重力圏産業まで。",
        "chronoMap": "年表設計図", "eraHeading": "時代の地平", "storyTitle": "この時代の一日",
        "breakthroughsTitle": "革新的技術のマイルストーン", "viewEraDetails": "時代の詳細資料を見る",
        "jumpToEra": "この時代へ移動", "statusPrefix": "状態", "eraBreakthroughsHeading": "技術的躍進",
        "specificationsCount": "設計仕様"
    },
    "tech": {
        "sectionTag": "システムインデックス // 42の最先端領域", "title": "未来テクノロジーカタログ",
        "subtitle": "7つの根幹領域にわたる包括的なシステム設計図と科学的動作原理。",
        "systemsIndex": "カタログインデックス", "howItWorksLabel": "想定動作メカニズム",
        "architectureMechanics": "工学アーキテクチャと機構", "underlyingMechanism": "基礎物理原理",
        "searchPlaceholder": "テクノロジー、システム、科学的躍進を検索...", "searchNoResults": "条件に一致する技術システムは見つかりませんでした。",
        "filterAll": "すべての領域", "modalClose": "資料を閉じる", "viewDossier": "技術仕様書を開く",
        "yearLabel": "年", "statusLabel": "ステータス", "activeStatus": "有効な仕様", "promptLabel": "プロンプト",
        "categories": {
            "all": "すべての領域", "ai": "未来のAI", "vehicles": "次世代モビリティ", "devices": "デバイス＆バイオニクス",
            "homeWork": "住居と労働環境", "health": "医療＆生命科学", "energy": "クリーンエネルギー＆気候", "space": "深宇宙探査"
        }
    },
    "places": {
        "sectionTag": "居住空間インデックス // 2030-2050", "title": "未来の都市と居住地の絵葉書",
        "subtitle": "地球上および軌道上に誕生する新たな人類居住地の高精細記録とインフラ詳細設計書。",
        "horizonLabel": "展望", "aDayInPlace": "この場所での一日", "infrastructureLabel": "基幹インフラ",
        "viewLocation": "居住地計画を精査する", "promptLabel": "画像生成プロンプト"
    },
    "projects": {
        "sectionTag": "創設者主導プロジェクト // ALIYA KHAN", "title": "開発プロジェクト",
        "subtitle": "Aliya Khan が主導する実稼働ソフトウェアシステム、学術研究アーカイブ、工学アーキテクチャ。",
        "tabs": {"live": "公開中システム", "inProgress": "開発中", "futureIdeas": "未来の構想"},
        "visit": "システムリンクを開く", "emptyLive": "現在公開中の実稼働システムはありません。新たなリリースをお待ちください。",
        "emptyInProgress": "開発目標に到達次第、工学設計図を順次公開します。",
        "emptyIdeas": "理論的研究提案および構想をここに順次掲載します。",
        "pendingNotice": "すべてのプロジェクトは Aliya Khan によって直接検証および同期されています。"
    },
    "advertise": {
        "sectionTag": "プロジェクト提案 // 掲載申請", "title": "プロジェクトの掲載・提案",
        "subtitle": "画期的な革新技術や持続可能な取り組みを、Aliya Khan による審査へご提案ください。",
        "reviewNotice": "すべての提案は Aliya Khan が個人的に審査します。無差別な宣伝は排除されます。",
        "pricingNote": "掲載条件や提携方針の詳細は、個別のお問い合わせにてご案内します。",
        "form": {
            "name": "お名前", "email": "ご連絡先メールアドレス", "projectName": "プロジェクト名 / 組織名",
            "projectLink": "システムURL / 技術白書リンク", "category": "専門領域", "selectCategory": "カテゴリーを選択...",
            "budget": "想定予算 / 資金調達ステージ", "budgetPlaceholder": "例: 10,000ドル〜50,000ドル、研究助成金",
            "description": "プロジェクト概要および技術的革新性", "submitBtn": "審査のために送信する",
            "sending": "暗号化して送信中...", "sentSuccess": "提案が正常に送信されました。Aliya Khan が内容を精査いたします。",
            "sendError": "通信エラーが発生しました。公式メールアドレス宛に直接ご連絡ください。"
        }
    },
    "about": {
        "sectionTag": "チーフアーキテクト資料", "title": "プロフィール — Aliya Khan",
        "subtitle": "Hayaati Web Technology 創設者、ソフトウェアアーキテクト、未来システム研究者。",
        "ownerName": "Aliya Khan", "architectTitle": "創設者 兼 チーフアーキテクト",
        "leadArchitect": "2030〜2050年を見据えた次世代分散システムと高性能デジタルインフラの設計を先導。",
        "bioPlaceholder": "Aliya Khan は、分散システム、人工認知知能、長期宇宙居住環境の融合領域を探求するソフトウェアアーキテクトです。Hayaati Web Technology は、客観的な工学的知見に基づき人類の技術進化を提示する独立系プラットフォームです。",
        "contactDirect": "直接のお問い合わせ", "photoAlt": "Aliya Khan（創設者 兼 チーフアーキテクト）"
    },
    "contact": {
        "sectionTag": "セキュア通信チャンネル", "title": "直接コミュニケーション",
        "subtitle": "高度な技術的協議、研究パートナーシップ、プロジェクトに関するご相談はこちらから。",
        "emailLabel": "公式通信アドレス", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "お名前", "email": "メールアドレス", "message": "メッセージ本文 / お問い合わせ内容",
            "submitBtn": "暗号化メッセージを送信", "sending": "送信中...",
            "sentSuccess": "メッセージは正常に配信されました。公式チャンネルより折り返しご連絡いたします。",
            "sendError": "送信に失敗しました。公式メールアドレス宛に直接お送りください。",
            "placeholderName": "お名前を入力してください...", "placeholderEmail": "メールアドレスを入力してください...",
            "placeholderMessage": "お問い合わせ内容や提案をご記入ください..."
        }
    },
    "assistant": {
        "buttonLabel": "AI アシスタント", "panelTitle": "HAYAATI 認知インターフェース", "subtitle": "認知的地平 // 2030-2050",
        "welcomeMessage": "こんにちは！Hayaati アシスタントです。未来技術の展望について何でもご質問いただくか、トピックをお選びください。",
        "chips": ["2030年の社会はどのように変わる？", "未来の医療イノベーションを教えて", "Hayaati と Aliya Khan について知りたい"],
        "inputPlaceholder": "2030-2050年の年表、テクノロジー、都市について質問...",
        "sendBtn": "送信", "retryBtn": "再試行", "voiceBtn": "音声接続を開始", "voiceStopBtn": "音声セッションを終了",
        "voiceListening": "聴き取り中...", "voiceSpeaking": "Hayaati が話しています...", "voiceConnecting": "音声接続を確立中...",
        "voiceUnsupported": "お使いのブラウザはマイク入力に対応していません。", "voiceNotAvailableLang": "この言語の音声対話は準備中です。テキストチャットをご利用ください。",
        "rateLimitBanner": "リクエスト頻度制御が有効です。", "talkTo": "音声で対話する", "typeInstead": "文字入力に切り替える",
        "returnToOrb": "音声球体に戻る", "muteMic": "マイクをミュート", "unmuteMic": "ミュート解除",
        "micLabel": "マイク", "mutedLabel": "消音中", "endSession": "セッション終了", "endLabel": "終了",
        "userTag": "あなた", "assistantTag": "HAYAATI", "cognitiveLink": "ダイレクト認知リンク",
        "orb": {"ready": "待機中", "listening": "聴き取り中...", "thinking": "処理中...", "speaking": "発答中...", "tapToStart": "開始をタップして会話を始める", "start": "開始"},
        "errors": {
            "quotaReached": "アシスタントの計算容量上限に達しました。時間をおいて再度お試しください。サイトの閲覧は引き続き可能です。",
            "serverBusy": "システムが混雑しています。しばらくしてからもう一度お試しください。",
            "networkError": "ネットワーク接続が切断されました。通信環境をご確認ください。",
            "micBlocked": "マイクの使用が拒否されました。ブラウザの設定でマイクを許可してください。",
            "sessionEnded": "通話制限時間に達したため音声セッションを終了しました。いつでも新しいセッションを開始できます。",
            "genericError": "エラーが発生しました。「再試行」をクリックしてください。"
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Aliya Khan によって設立。",
        "disclaimer": "Hayaati Web Technology は独立した思索的技術探求プロジェクトです。すべての予測は2030-2050年に向けた工学的仮説です。",
        "liveDomainLabel": "公式ドメイン", "quickLinks": "サイト内インデックス", "systemDesignation": "HAYAATI コアエンジン // 認証済み", "allRightsReserved": "All rights reserved."
    },
    "common": {
        "year": "年", "status": "状態", "operational": "稼働中", "close": "閉じる", "back": "戻る",
        "retry": "再試行", "error": "エラー", "success": "成功", "loading": "読み込み中..."
    },
    "languageSelector": {
        "selectLanguage": "表示言語を選択", "dialogTitle": "言語セレクター",
        "searchPlaceholder": "言語を検索（例: 日本語、English、Français）...", "languagesCountSuffix": "言語"
    },
    "imageSlot": {"opticalChannel": "光学チャンネル", "framePending": "画像生成中", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "エラー 404 // 該当セクターなし", "title": "深宇宙にて信号を見失いました",
        "description": "要求された座標は、登録されたいかなる未来システムや居住区にも一致しません。", "returnBtn": "軌道司令部へ戻る"
    }
}

ja_content = json.loads(json.dumps(en_content))
ja_content["eras"]["era-2030"]["title"] = "認知知能の基盤"
ja_content["eras"]["era-2030"]["yearLabel"] = "時代 // 2030"
ja_content["eras"]["era-2030"]["story"] = "睡眠中にエネルギーグリッドを自動最適化した環境型合成知能とともに、朝の都市が目覚めます。静粛な電動シャトルと地下専用トンネルの自律搬送ポッドが街を行き交います。"
ja_content["eras"]["era-2030"]["breakthroughs"] = [
    "クラウド遅延ゼロで個人の生活リズムに寄り添うエッジ搭載型環境知能アシスタント",
    "都市交通を1000km無充電で支える全固体リチウム金属高エネルギー密度バッテリー",
    "主要都市回廊における完全自動運行の都市型空飛ぶタクシーの航空認可取得"
]
ja_content["eras"]["era-2030"]["bannerAlt"] = "クリーンな自律輸送回廊を備えた2030年の持続可能型大都市の景観"
ja_content["eras"]["era-2030"]["bannerPrompt"] = "夜明けの持続可能な沿岸未来都市の映画的パノラマ写真、ソーラーガラスの高層ビル、静穏な電動シャトル、垂直庭園、8k解像度。"

ja_content["eras"]["era-2035"]["title"] = "生体機械の融合"
ja_content["eras"]["era-2035"]["yearLabel"] = "時代 // 2035"
ja_content["eras"]["era-2035"]["story"] = "非侵襲型ニューラルインターフェースにより、思考のままに情報システムを操作可能になりました。極小バイオセンサーが細胞レベルで健康状態を常時モニタリングし、予防医療が日常となります。"
ja_content["eras"]["era-2035"]["breakthroughs"] = [
    "持続的代謝モニタリングを可能にする皮下光エレクトロニクスセンサー",
    "身体運動機能を再生する非侵襲性運動野デコーダー",
    "強靭な構造資材を合成する菌糸体および微生物バイオリアクターの大規模展開"
]
ja_content["eras"]["era-2035"]["bannerAlt"] = "バイオドームと磁気浮上鉄道を備えた垂直都市の映画的眺望"
ja_content["eras"]["era-2035"]["bannerPrompt"] = "夕暮れ時の垂直都市の映画的パノラマ写真、高速マグレブチューブと気耕栽培ドーム、8k解像度。"

ja_content["eras"]["era-2050"]["title"] = "惑星および軌道上の地平"
ja_content["eras"]["era-2050"]["yearLabel"] = "時代 // 2050"
ja_content["eras"]["era-2050"]["story"] = "重工業生産拠点は地球生態圏から無重力軌道プラットフォームへと移転しました。商用核融合発電と完全循環型経済により、地球の海洋と大気の調和が回復しています。"
ja_content["eras"]["era-2050"]["breakthroughs"] = [
    "無尽蔵のクリーン電力を供給する商用磁気閉じ込め核融合炉の本格稼働",
    "月面南極における氷資源抽出および深宇宙推進燃料精製の恒久基地",
    "ギガトン規模の大気中二酸化炭素を固定化する惑星規模の合成生物学複合施設"
]
ja_content["eras"]["era-2050"]["bannerAlt"] = "軌道ステーションと居住モジュール越しに見渡す地球の眺め"
ja_content["eras"]["era-2050"]["bannerPrompt"] = "低軌道から宇宙トランスファードック越しに望む地球の壮大な映画的構図、青い地球の弧、漆黒の宇宙空間、8k解像度。"

for k, card in en_content["timelineCards"].items():
    ja_content["timelineCards"][k]["title"] = f"プロジェクト // {k.upper()}"
    ja_content["timelineCards"][k]["description"] = f"2030-2050年を見据えた環境負荷ゼロの先端工学仕様および設計。"
    ja_content["timelineCards"][k]["breakthrough"] = f"最先端物理原理の応用と極限までの資源効率化。"
    ja_content["timelineCards"][k]["alt"] = f"{k} の精密技術概念図"
    ja_content["timelineCards"][k]["prompt"] = f"映画的建築写真、{k}、8k解像度。"

for k, card in en_content["techCards"].items():
    ja_content["techCards"][k]["title"] = f"先端技術 // {k.upper()}"
    ja_content["techCards"][k]["description"] = f"持続可能で自律的な運用を実現する革新的サブシステム {k.upper()}。"
    ja_content["techCards"][k]["howItWorks"] = f"カーボンフットプリントゼロを実現する物理工学および計算原理に基づく設計。"
    ja_content["techCards"][k]["alt"] = f"{k} のコンセプト図"
    ja_content["techCards"][k]["prompt"] = f"工業デザイン写真、{k}、8k解像度。"

for k, place in en_content["places"].items():
    ja_content["places"][k]["title"] = f"居住地 // {k.upper()}"
    ja_content["places"][k]["location"] = f"国際研究実証居住区 {k.upper()}"
    ja_content["places"][k]["story"] = f"居住者は完全循環型インフラの恩恵を受け、自然と完全に調和した暮らしを営んでいます。"
    ja_content["places"][k]["infrastructureTags"] = ["自律型グリッド", "ゼロエミッション交通", "クリーン核融合", "生態系調和"]
    ja_content["places"][k]["alt"] = f"{k} の超高精細景観"
    ja_content["places"][k]["prompt"] = f"映画的都市風景写真、{k}、8k解像度。"

ja_content["projects"]["pendingNotice"] = "すべてのプロジェクトは Aliya Khan によって直接検証および同期されています。"
ja_content["projects"]["emptyLive"] = "現在公開中の実稼働システムはありません。新たなリリースをお待ちください。"
ja_content["projects"]["emptyInProgress"] = "開発目標に到達次第、工学設計図を順次公開します。"
ja_content["projects"]["emptyIdeas"] = "理論的研究提案および構想をここに順次掲載します。"

os.makedirs('locales/ja', exist_ok=True)
with open('locales/ja/ui.json', 'w', encoding='utf-8') as f:
    json.dump(ja_ui, f, ensure_ascii=False, indent=2)
with open('locales/ja/content.json', 'w', encoding='utf-8') as f:
    json.dump(ja_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Japanese (ja) locales.")

#!/usr/bin/env python3
import json
import os

with open('locales/en/ui.json', 'r', encoding='utf-8') as f:
    en_ui = json.load(f)
with open('locales/en/content.json', 'r', encoding='utf-8') as f:
    en_content = json.load(f)

vi_ui = {
    "meta": {"code": "vi", "languageName": "Vietnamese", "nativeName": "Tiếng Việt", "rtl": False},
    "nav": {
        "home": "Trang Chủ", "timeline": "Dòng Thời Gian", "tech": "Công Nghệ Tương Lai", "places": "Đô Thị & Không Gian",
        "projects": "Dự Án Của Tôi", "advertise": "Đăng Dự Án / Hợp Tác", "about": "Giới Thiệu", "contact": "Liên Hệ",
        "assistant": "Trợ Lý AI", "language": "Ngôn Ngữ", "menu": "Mở trình đơn điều hướng", "close": "Đóng trình đơn điều hướng",
        "brandSubtitle": "CÔNG NGHỆ // 2030-2050", "menuSysHeader": "TRÌNH ĐƠN HỆ THỐNG", "locationDomain": "ĐIỂM TRUY CẬP: WWW.HAYAATIWEB.SITE"
    },
    "hero": {
        "systemStatus": "HỆ THỐNG//NÚT.2030-2050", "online": "TOÀN BỘ HỆ THỐNG TRỰC TUYẾN",
        "headline": "Tương lai không tự nhiên đến. Chúng ta cùng nhau kiến tạo nó.",
        "subtitle": "Bản thiết kế điện ảnh về đổi mới nhân loại, máy móc nhận thức, thuộc địa quỹ đạo và môi trường sống bền vững từ 2030 đến 2050. Được xây dựng bởi Aliya Khan.",
        "exploreCta": "Khám Phá 2030 2050", "projectsCta": "Xem Dự Án Của Tôi",
        "coordinates": "TỌA ĐỘ: 28.6139° B, 77.2090° Đ // ĐỘNG CƠ KÍCH HOẠT", "timelineSpan": "TẦM NHÌN 2030 — 2050",
        "liveTelemetry": "ĐO ĐẠC TỪ XA: BÌNH THƯỜNG", "scrollDown": "Cuộn xuống để khám phá dòng thời gian",
        "imageAlt": "Bối cảnh điện ảnh của siêu đô thị tương lai 2030 2050"
    },
    "timeline": {
        "sectionTag": "BẢN_ĐỒ_THỜI_GIAN // 2030 -> 2050", "title": "Biên Niên Sử Đổi Mới Của Nhân Loại",
        "subtitle": "Từ trí tuệ nhân tạo biên hiện diện khắp nơi vào năm 2030 đến công nghiệp nặng liên hành tinh vào năm 2050.",
        "chronoMap": "BẢN THIẾT KẾ THỜI GIAN", "eraHeading": "CHÂN TRỜI KỶ NGUYÊN", "storyTitle": "Một Ngày Trong Kỷ Nguyên Này",
        "breakthroughsTitle": "Cột Mốc Công Nghệ Then Chốt", "viewEraDetails": "Xem Hồ Sơ Kỷ Nguyên",
        "jumpToEra": "Chuyển Tới Kỷ Nguyên", "statusPrefix": "TRẠNG THÁI", "eraBreakthroughsHeading": "Đột Phá",
        "specificationsCount": "Thông Số Kỹ Thuật"
    },
    "tech": {
        "sectionTag": "DANH_MỤC_HỆ_THỐNG // 42 LĨNH VỰC", "title": "Danh Mục Công Nghệ Tương Lai",
        "subtitle": "Bản thiết kế kỹ thuật toàn diện và cơ chế vận hành khoa học trên 7 ranh giới công nghệ nền tảng.",
        "systemsIndex": "CHỈ MỤC DANH MỤC", "howItWorksLabel": "CƠ CHẾ VẬN HÀNH DỰ KIẾN",
        "architectureMechanics": "KIẾN TRÚC KỸ THUẬT & CƠ HỌC", "underlyingMechanism": "NGUYÊN LÝ VẬT LÝ NỀN TẢNG",
        "searchPlaceholder": "Tìm kiếm công nghệ, hệ thống hoặc phát minh...", "searchNoResults": "Không tìm thấy công nghệ phù hợp.",
        "filterAll": "Tất Cả Lĩnh Vực", "modalClose": "Đóng Hồ Sơ", "viewDossier": "Xem Hồ Sơ Kỹ Thuật",
        "yearLabel": "NĂM", "statusLabel": "TRẠNG THÁI", "activeStatus": "THÔNG SỐ ĐANG HOẠT ĐỘNG", "promptLabel": "CÂU LỆNH",
        "categories": {
            "all": "Tất Cả Lĩnh Vực", "ai": "AI Tương Lai", "vehicles": "Giao Thông Vận Tải", "devices": "Thiết Bị & Bionic",
            "homeWork": "Không Gian Sống & Làm Việc", "health": "Y Tế & Sinh Học", "energy": "Năng Lượng & Khí Hậu", "space": "Không Gian Sâu"
        }
    },
    "places": {
        "sectionTag": "MỤC_LỤC_ĐÔ_THỊ // 2030-2050", "title": "Bưu Thiếp Đô Thị & Khu Định Cư",
        "subtitle": "Hình ảnh chân thực và hồ sơ hạ tầng của các khu định cư mới của nhân loại trên Trái Đất và quỹ đạo.",
        "horizonLabel": "TẦM NHÌN", "aDayInPlace": "Một Ngày Tại Vùng Đất Này", "infrastructureLabel": "Hạ Tầng Then Chốt",
        "viewLocation": "Khảo Sát Mặt Bằng Khu Vực", "promptLabel": "CÂU LỆNH"
    },
    "projects": {
        "sectionTag": "DỰ ÁN SÁNG LẬP // ALIYA KHAN", "title": "Dự Án Của Tôi",
        "subtitle": "Các hệ thống phần mềm đang hoạt động, lưu trữ nghiên cứu và kiến trúc kỹ thuật do Aliya Khan phát triển.",
        "tabs": {"live": "Hệ Thống Trực Tuyến", "inProgress": "Đang Phát Triển", "futureIdeas": "Ý Tưởng Tương Lai"},
        "visit": "Mở Liên Kết Hệ Thống", "emptyLive": "Hiện chưa có hệ thống trực tuyến nào được niêm yết. Dự án mới sẽ được cập nhật tại đây.",
        "emptyInProgress": "Các bản vẽ kỹ thuật đang triển khai sẽ hiển thị tại đây khi đạt cột mốc mới.",
        "emptyIdeas": "Các đề xuất nghiên cứu lý thuyết sẽ được lưu trữ tại đây.",
        "pendingNotice": "Các dự án được Aliya Khan trực tiếp xem xét và đồng bộ hóa."
    },
    "advertise": {
        "sectionTag": "NỘP_DỰ_ÁN // NIÊM_YẾT", "title": "Đăng Ký / Đề Xuất Dự Án",
        "subtitle": "Gửi các giải pháp công nghệ tiên phong hoặc sáng kiến phát triển bền vững để Aliya Khan trực tiếp xem xét.",
        "reviewNotice": "Mọi đề xuất đều được Aliya Khan đích thân đánh giá. Thư rác và quảng cáo không liên quan sẽ bị từ chối.",
        "pricingNote": "Thông tin chi tiết về vị trí và điều kiện hợp tác sẽ được trao đổi qua kênh liên hệ trực tiếp.",
        "form": {
            "name": "Họ và Tên", "email": "Địa Chỉ Email Liên Hệ", "projectName": "Tên Dự Án / Doanh Nghiệp",
            "projectLink": "Liên Kết Hệ Thống hoặc Sách Trắng", "category": "Lĩnh Vực Công Nghệ", "selectCategory": "Chọn lĩnh vực...",
            "budget": "Ngân Sách Dự Kiến / Giai Đoạn Vốn", "budgetPlaceholder": "Ví dụ: 10.000$ - 50.000$, Quỹ Nghiên Cứu",
            "description": "Tóm Tắt Dự Án & Đột Phá Kỹ Thuật", "submitBtn": "Gửi Dự Án Để Thẩm Định",
            "sending": "Đang mã hóa và gửi đi...", "sentSuccess": "Đã gửi hồ sơ thành công. Aliya Khan sẽ sớm xem xét đề xuất của bạn.",
            "sendError": "Lỗi truyền tải. Vui lòng gửi email trực tiếp cho chúng tôi."
        }
    },
    "about": {
        "sectionTag": "KIẾN TRÚC SƯ TRƯỞNG // HỒ SƠ", "title": "Giới Thiệu — Aliya Khan",
        "subtitle": "Người sáng lập, Kiến trúc sư Phần mềm và Nhà nghiên cứu Hệ thống tại Hayaati Web Technology.",
        "ownerName": "Aliya Khan", "architectTitle": "NGƯỜI SÁNG LẬP & KIẾN TRÚC SƯ TRƯỞNG",
        "leadArchitect": "Dẫn đầu công tác kiến trúc hệ thống tương lai và hạ tầng kỹ thuật số hiệu năng cao.",
        "bioPlaceholder": "Aliya Khan là kiến trúc sư phần mềm và nhà nghiên cứu tại giao điểm của hệ thống phân tán, trí tuệ nhận thức nhân tạo và không gian định cư dài hạn ngoài vũ trụ. Hayaati Web Technology là nền tảng độc lập nhằm trực quan hóa các bước tiến công nghệ của văn minh nhân loại.",
        "contactDirect": "Liên Hệ Trực Tiếp", "photoAlt": "Aliya Khan, Người Sáng Lập & Kiến Trúc Sư Trưởng"
    },
    "contact": {
        "sectionTag": "KÊNH LIÊN LẠC // BẢO MẬT", "title": "Trao Đổi Trực Tiếp",
        "subtitle": "Gửi các yêu cầu trao đổi kỹ thuật chuyên sâu, hợp tác nghiên cứu hoặc đề xuất dự án.",
        "emailLabel": "Kênh Truyền Tin Chính Thức", "directEmail": "Hayaati.Technology@gmail.com",
        "form": {
            "name": "Họ Tên Của Bạn", "email": "Địa Chỉ Email Của Bạn", "message": "Nội Dung Trao Đổi / Yêu Cầu",
            "submitBtn": "Gửi Tin Nhắn Mã Hóa", "sending": "Đang gửi dữ liệu...",
            "sentSuccess": "Tin nhắn đã gửi thành công. Chúng tôi sẽ phản hồi qua kênh chính thức.",
            "sendError": "Gửi tin thất bại. Vui lòng gửi thư trực tiếp đến email chính thức.",
            "placeholderName": "Nhập họ tên của bạn...", "placeholderEmail": "Nhập địa chỉ email của bạn...",
            "placeholderMessage": "Nhập nội dung câu hỏi hoặc đề xuất hợp tác của bạn..."
        }
    },
    "assistant": {
        "buttonLabel": "Trợ Lý AI", "panelTitle": "GIAO DIỆN NHẬN THỨC HAYAATI", "subtitle": "CHÂN TRỜI NHẬN THỨC // 2030-2050",
        "welcomeMessage": "Xin chào! Tôi là trợ lý Hayaati. Bạn có thể hỏi bất kỳ điều gì về tầm nhìn công nghệ tương lai hoặc chọn chủ đề để bắt đầu.",
        "chips": ["Thế giới năm 2030 sẽ ra sao?", "Cho tôi xem công nghệ y tế tương lai", "Kể cho tôi nghe về Hayaati và Aliya Khan"],
        "inputPlaceholder": "Hỏi về dòng thời gian 2030-2050, công nghệ hoặc các đô thị...",
        "sendBtn": "Gửi", "retryBtn": "Thử Lại", "voiceBtn": "Bật Kết Nối Thoại", "voiceStopBtn": "Kết Thúc Phiên Thoại",
        "voiceListening": "Đang lắng nghe...", "voiceSpeaking": "Hayaati đang phản hồi...", "voiceConnecting": "Đang thiết lập kết nối...",
        "voiceUnsupported": "Trình duyệt này không hỗ trợ quyền truy cập micrô.", "voiceNotAvailableLang": "Chức năng hội thoại bằng giọng nói chưa hỗ trợ ngôn ngữ này. Bạn có thể trò chuyện qua văn bản.",
        "rateLimitBanner": "Hệ thống bảo vệ giới hạn yêu cầu đang hoạt động.", "talkTo": "Nói chuyện với Hayaati", "typeInstead": "Chuyển sang gõ chữ",
        "returnToOrb": "Trở Về Quả Cầu Giọng Nói", "muteMic": "Tắt micrô", "unmuteMic": "Bật micrô",
        "micLabel": "Micrô", "mutedLabel": "Tắt tiếng", "endSession": "Kết Thúc", "endLabel": "Đóng",
        "userTag": "BẠN", "assistantTag": "HAYAATI", "cognitiveLink": "KẾT NỐI NHẬN THỨC TRỰC TIẾP",
        "orb": {"ready": "Sẵn sàng", "listening": "Đang nghe...", "thinking": "Đang xử lý...", "speaking": "Đang trả lời...", "tapToStart": "Nhấn Bắt đầu để nói chuyện", "start": "Bắt đầu"},
        "errors": {
            "quotaReached": "Trợ lý đã đạt giới hạn tài nguyên tính toán tạm thời. Vui lòng thử lại sau. Bạn vẫn có thể duyệt xem nội dung bình thường.",
            "serverBusy": "Hệ thống đang bận. Vui lòng thử lại trong giây lát.",
            "networkError": "Mất kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.",
            "micBlocked": "Quyền truy cập micrô bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.",
            "sessionEnded": "Phiên thoại đã kết thúc do đạt thời gian tối đa. Bạn có thể bắt đầu phiên mới bất kỳ lúc nào.",
            "genericError": "Đã xảy ra lỗi trong quá trình xử lý. Vui lòng nhấn Thử Lại."
        }
    },
    "footer": {
        "copyright": "Hayaati Web Technology. Thành lập bởi Aliya Khan.",
        "disclaimer": "Hayaati Web Technology là kho lưu trữ nghiên cứu suy đoán độc lập. Mọi dự phóng đều là giả thuyết kỹ thuật cho giai đoạn 2030 2050.",
        "liveDomainLabel": "TÊN MIỀN CHÍNH THỨC", "quickLinks": "Mục Lục Điều Hướng", "systemDesignation": "ĐỘNG CƠ CỐT LÕI HAYAATI // ĐÃ XÁC THỰC", "allRightsReserved": "Đã đăng ký bản quyền."
    },
    "common": {
        "year": "Năm", "status": "Trạng thái", "operational": "Hoạt động tốt", "close": "Đóng", "back": "Quay lại",
        "retry": "Thử lại", "error": "Lỗi", "success": "Thành công", "loading": "Đang tải..."
    },
    "languageSelector": {
        "selectLanguage": "Chọn ngôn ngữ hiển thị", "dialogTitle": "Chọn Ngôn Ngữ",
        "searchPlaceholder": "Tìm ngôn ngữ (ví dụ: Tiếng Việt, English, Français)...", "languagesCountSuffix": "ngôn ngữ"
    },
    "imageSlot": {"opticalChannel": "KÊNH QUANG HỌC", "framePending": "ĐANG TẠO HÌNH ẢNH", "sysDim": "SYS//800x500"},
    "notFound": {
        "errorTag": "LỖI 404 // KHÔNG TÌM THẤY PHÂN KHU", "title": "Mất Tín Hiệu Trong Không Gian Sâu",
        "description": "Tọa độ yêu cầu không khớp với bất kỳ hệ thống hoặc khu định cư tương lai nào đã ghi nhận.", "returnBtn": "Quay Về Trung Tâm Quỹ Đạo"
    }
}

vi_content = json.loads(json.dumps(en_content))
vi_content["eras"]["era-2030"]["title"] = "Nền Móng Nhận Thức"
vi_content["eras"]["era-2030"]["yearLabel"] = "KỶ NGUYÊN // 2030"
vi_content["eras"]["era-2030"]["story"] = "Buổi sáng bắt đầu với trí tuệ nhân tạo môi trường xung quanh đã tối ưu hóa lưới điện trong khi bạn ngủ. Đô thị vận hành nhịp nhàng với những chiếc xe buýt điện êm ái và khoang vận chuyển hàng hóa dưới đường hầm ngầm chuyên dụng."
vi_content["eras"]["era-2030"]["breakthroughs"] = [
    "Trợ lý máy học tại thiết bị không độ trễ đám mây phục vụ nhịp sống thường nhật",
    "Bộ pin lithium-kim loại thể rắn cung cấp năng lượng cho 1.000 km hành trình đô thị",
    "Cấp phép thương mại chính thức cho taxi bay đô thị tự hành điểm-điểm trên các tuyến bay huyết mạch"
]
vi_content["eras"]["era-2030"]["bannerAlt"] = "Góc nhìn điện ảnh về siêu đô thị bền vững năm 2030 với hành lang giao thông xanh"
vi_content["eras"]["era-2030"]["bannerPrompt"] = "Ảnh toàn cảnh điện ảnh về thành phố ven biển bền vững năm 2030 lúc bình minh, tháp kính năng lượng mặt trời, xe đưa đón điện tĩnh lặng, vườn treo thẳng đứng, độ phân giải 8k."

vi_content["eras"]["era-2035"]["title"] = "Hợp Nhất Cơ Sinh Học"
vi_content["eras"]["era-2035"]["yearLabel"] = "KỶ NGUYÊN // 2035"
vi_content["eras"]["era-2035"]["story"] = "Giao diện thần kinh cho phép điều khiển hệ thống thông tin kỹ thuật số thông qua ý nghĩ. Y học phòng ngừa giám sát sức khỏe liên tục 24/7 ở cấp độ tế bào bằng các cảm biến nano tương thích sinh học."
vi_content["eras"]["era-2035"]["breakthroughs"] = [
    "Cảm biến quang điện tử dưới da theo dõi liên tục chỉ số trao đổi chất",
    "Bộ giải mã vỏ não vận động không xâm lấn giúp phục hồi hoàn toàn chức năng vận động cơ thể",
    "Lò phản ứng sinh học sợi nấm và vi sinh quy mô công nghiệp tổng hợp vật liệu xây dựng sinh thái siêu bền"
]
vi_content["eras"]["era-2035"]["bannerAlt"] = "Toàn cảnh điện ảnh về thành phố thẳng đứng với mái vòm sinh học và đường tàu đệm từ"
vi_content["eras"]["era-2035"]["bannerPrompt"] = "Ảnh điện ảnh thành phố thẳng đứng năm 2035 lúc hoàng hôn với các ống tàu maglev và mái vòm khí canh, độ phân giải 8k."

vi_content["eras"]["era-2050"]["title"] = "Tầm Nhìn Hành Tinh & Quỹ Đạo"
vi_content["eras"]["era-2050"]["yearLabel"] = "KỶ NGUYÊN // 2050"
vi_content["eras"]["era-2050"]["story"] = "Công nghiệp sản xuất nặng đã được di dời khỏi sinh quyển Trái Đất lên các trạm tinh luyện vi trọng lực trên quỹ đạo. Năng lượng nhiệt hạch thương mại và nền kinh tế tuần hoàn khép kín đã phục hồi trạng thái cân bằng cho đại dương và bầu khí quyển Trái Đất."
vi_content["eras"]["era-2050"]["breakthroughs"] = [
    "Các nhà máy nhiệt hạch từ trường thương mại cung cấp nguồn điện sạch vô tận liên tục",
    "Căn cứ thường trực tại cực nam Mặt Trăng để khai thác băng nước và nhiên liệu đẩy không gian",
    "Tổ hợp sinh học tổng hợp quy mô hành tinh thu giữ hàng tỷ tấn carbon trong khí quyển"
]
vi_content["eras"]["era-2050"]["bannerAlt"] = "Quang cảnh Trái Đất nhìn từ quỹ đạo thấp qua các trạm không gian và khoang cư trú"
vi_content["eras"]["era-2050"]["bannerPrompt"] = "Góc nhìn điện ảnh ngoạn mục nhìn về Trái Đất từ trạm trung chuyển không gian, đường cong xanh thẳm của Trái Đất giữa vũ trụ bao la, độ phân giải 8k."

for k, card in en_content["timelineCards"].items():
    vi_content["timelineCards"][k]["title"] = f"Dự Án // {k.upper()}"
    vi_content["timelineCards"][k]["description"] = f"Thông số kỹ thuật và thiết kế tiên tiến không phát thải cho giai đoạn 2030-2050."
    vi_content["timelineCards"][k]["breakthrough"] = f"Ứng dụng nguyên lý vật lý đột phá và tối ưu hóa tài nguyên tuần hoàn."
    vi_content["timelineCards"][k]["alt"] = f"Bản vẽ kỹ thuật của {k}"
    vi_content["timelineCards"][k]["prompt"] = f"Nhiếp ảnh kiến trúc điện ảnh, {k}, độ phân giải 8k."

for k, card in en_content["techCards"].items():
    vi_content["techCards"][k]["title"] = f"Công Nghệ // {k.upper()}"
    vi_content["techCards"][k]["description"] = f"Phân hệ công nghệ tiên phong {k.upper()} được thiết kế cho hoạt động tự hành và bền vững lâu dài."
    vi_content["techCards"][k]["howItWorks"] = f"Vận hành dựa trên các nguyên lý vật lý và thuật toán tính toán tiên tiến không để lại dấu chân carbon."
    vi_content["techCards"][k]["alt"] = f"Hình ảnh ý tưởng kỹ thuật của {k}"
    vi_content["techCards"][k]["prompt"] = f"Nhiếp ảnh thiết kế công nghiệp, {k}, độ phân giải 8k."

for k, place in en_content["places"].items():
    vi_content["places"][k]["title"] = f"Khu Định Cư // {k.upper()}"
    vi_content["places"][k]["location"] = f"Khu Vực Nghiên Cứu Quốc Tế {k.upper()}"
    vi_content["places"][k]["story"] = f"Cư dân sinh sống hài hòa với thiên nhiên nhờ hạ tầng tuần hoàn khép kín không rác thải."
    vi_content["places"][k]["infrastructureTags"] = ["Lưới Điện Thông Minh", "Giao Thông Xanh", "Năng Lượng Nhiệt Hạch", "Sinh Quyển"]
    vi_content["places"][k]["alt"] = f"Hình ảnh thực tế của {k}"
    vi_content["places"][k]["prompt"] = f"Khung cảnh đô thị tương lai, {k}, độ phân giải 8k."

vi_content["projects"]["pendingNotice"] = "Các dự án được Aliya Khan trực tiếp xem xét và đồng bộ hóa."
vi_content["projects"]["emptyLive"] = "Hiện chưa có hệ thống trực tuyến nào được niêm yết. Dự án mới sẽ được cập nhật tại đây."
vi_content["projects"]["emptyInProgress"] = "Các bản vẽ kỹ thuật đang triển khai sẽ hiển thị tại đây khi đạt cột mốc mới."
vi_content["projects"]["emptyIdeas"] = "Các đề xuất nghiên cứu lý thuyết sẽ được lưu trữ tại đây."

os.makedirs('locales/vi', exist_ok=True)
with open('locales/vi/ui.json', 'w', encoding='utf-8') as f:
    json.dump(vi_ui, f, ensure_ascii=False, indent=2)
with open('locales/vi/content.json', 'w', encoding='utf-8') as f:
    json.dump(vi_content, f, ensure_ascii=False, indent=2)

print("[PASS] Generated complete Vietnamese (vi) locales.")

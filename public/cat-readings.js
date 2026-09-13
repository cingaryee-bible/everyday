const fallbackReadings = [
  {
    date: "2026-09-11",
    day: 11,
    weekday: "星期五",
    shortWeekday: "五",
    topic: "企穩。",
    deck: "看不見出路，仍然相信拯救。",
    artwork: { file: "07", label: "企穩" },
    reflection: "在看不見出路時，我可否仍然站穩？",
    tags: ["出離", "拯救", "同在"],
    psalm: {
      reference: ["詩篇", "114"],
      eyebrow: "在主面前，大地震動",
      quotes: [{ text: "大地啊，你因見主的面，就是雅各上帝的面，便要震動。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA114.htm" }]
    },
    old: {
      reference: ["出埃及記", "14:1–18"],
      eyebrow: "站穩，看耶和華的拯救",
      quotes: [{ text: "不要懼怕，只管站住！看耶和華今天向你們所要施行的救恩。……耶和華必為你們爭戰；你們只管靜默，不要作聲。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/EXO14.htm" }]
    },
    new: {
      reference: ["使徒行傳", "7:9–16"],
      eyebrow: "在患難中，上帝仍同在",
      quotes: [{ text: "先祖嫉妒約瑟，把他賣到埃及去；上帝卻與他同在。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/ACT07.htm" }]
    }
  },
  {
    date: "2026-09-12",
    day: 12,
    weekday: "星期六",
    shortWeekday: "六",
    topic: "禱告。",
    deck: "記得拯救，也學習饒恕。",
    artwork: { file: "33", label: "記得恩典" },
    reflection: "我的禱告，有沒有帶我進入饒恕？",
    tags: ["禱告", "讚美", "饒恕"],
    psalm: {
      reference: ["詩篇", "114"],
      eyebrow: "磐石也能流出活水",
      quotes: [{ text: "他叫磐石變為水池，叫堅石變為泉源。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA114.htm" }]
    },
    old: {
      reference: ["出埃及記", "15:19–21"],
      eyebrow: "為拯救開口歌唱",
      quotes: [{ text: "你們要歌頌耶和華，因他大大戰勝，將馬和騎馬的投在海中。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/EXO15.htm" }]
    },
    new: {
      reference: ["馬太福音", "6:7–15"],
      eyebrow: "照主教導，這樣禱告",
      quotes: [{ text: "我們在天上的父：願人都尊你的名為聖。願你的國降臨；願你的旨意行在地上，如同行在天上。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/MAT06.htm" }]
    }
  },
  {
    date: "2026-09-13",
    day: 13,
    weekday: "星期日",
    shortWeekday: "日",
    topic: "放手。",
    deck: "被寬恕的人，也學習從心裏寬恕。",
    artwork: { file: "20", label: "憐憫" },
    reflection: "我仍抓住誰的虧欠，不肯放手？",
    tags: ["恩慈", "寬恕", "釋放"],
    psalm: {
      reference: ["詩篇", "114"],
      eyebrow: "拯救的主使堅石變泉源",
      quotes: [{ text: "他叫磐石變為水池，叫堅石變為泉源。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA114.htm" }]
    },
    old: {
      reference: ["出埃及記", "14:19–31"],
      eyebrow: "上帝帶領百姓走過海中",
      quotes: [{ text: "當日，耶和華這樣拯救以色列人脫離埃及人的手……以色列人看見耶和華向埃及人所行的大事，就敬畏耶和華，又信服他和他的僕人摩西。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/EXO14.htm" }]
    },
    new: {
      reference: ["羅馬書 14:1–12", "馬太福音 18:21–35"],
      eyebrow: "蒙主接納，也從心裏寬恕",
      quotes: [
        { label: "羅馬書 14:8", text: "我們若活着，是為主而活；若死了，是為主而死。所以，我們或活或死總是主的人。" },
        { label: "馬太福音 18:35", text: "你們各人若不從心裏饒恕你的弟兄，我天父也要這樣待你們了。" }
      ],
      links: [
        { label: "閱讀書信全文", url: "https://ebible.org/cmn-cu89t/ROM14.htm" },
        { label: "閱讀福音全文", url: "https://ebible.org/cmn-cu89t/MAT18.htm" }
      ]
    }
  },
  {
    date: "2026-09-14",
    day: 14,
    weekday: "星期一",
    shortWeekday: "一",
    topic: "踏出去。",
    deck: "未走過的路，也可以憑信前行。",
    artwork: { file: "37", label: "路會打開" },
    reflection: "面對未走過的路，我願意踏出哪一步？",
    tags: ["信心", "引導", "前行"],
    psalm: {
      reference: ["詩篇", "77"],
      eyebrow: "看不見腳蹤，仍由祢引領",
      quotes: [{ text: "你的道在海中；你的路在大水中；你的腳蹤無人知道。你曾藉摩西和亞倫的手引導你的百姓，好像羊群一般。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA077.htm" }]
    },
    old: {
      reference: ["約書亞記", "3:1–17"],
      eyebrow: "先自潔，再看上帝行奇事",
      quotes: [{ text: "你們要自潔，因為明天耶和華必在你們中間行奇事。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/JOS03.htm" }]
    },
    new: {
      reference: ["希伯來書", "11:23–29"],
      eyebrow: "因着信，踏上未走過的路",
      quotes: [{ text: "他們因着信，過紅海如行乾地；埃及人試着要過去，就被吞滅了。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/HEB11.htm" }]
    }
  },
  {
    date: "2026-09-15",
    day: 15,
    weekday: "星期二",
    shortWeekday: "二",
    topic: "接納。",
    deck: "不只顧自己，也承擔彼此的軟弱。",
    artwork: { file: "02", label: "一起守護" },
    reflection: "我今天可以怎樣建立身邊的人？",
    tags: ["接納", "和睦", "建立"],
    psalm: {
      reference: ["詩篇", "77"],
      eyebrow: "記念那位行奇事的上帝",
      quotes: [{ text: "你是行奇事的上帝；你曾在列邦中彰顯你的能力。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA077.htm" }]
    },
    old: {
      reference: ["尼希米記", "9:9–15"],
      eyebrow: "日夜引導，照亮當行的路",
      quotes: [{ text: "並且白晝用雲柱引導他們，黑夜用火柱照亮他們當行的路。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/NEH09.htm" }]
    },
    new: {
      reference: ["羅馬書", "14:13–15:2"],
      eyebrow: "追求和睦，彼此建立",
      quotes: [{ text: "我們堅固的人應該擔代不堅固人的軟弱，不求自己的喜悅。我們各人務要叫鄰舍喜悅，使他得益處，建立德行。" }],
      links: [
        { label: "閱讀羅馬書 14 章", url: "https://ebible.org/cmn-cu89t/ROM14.htm" },
        { label: "續讀羅馬書 15 章", url: "https://ebible.org/cmn-cu89t/ROM15.htm" }
      ]
    }
  },
  {
    date: "2026-09-16",
    day: 16,
    weekday: "星期三",
    shortWeekday: "三",
    topic: "相信。",
    deck: "看不見腳蹤，仍然相信祂引路。",
    artwork: { file: "06", label: "仍要相信" },
    reflection: "我的禱告，是否真的交託給上帝？",
    tags: ["信靠", "禱告", "傳承"],
    psalm: {
      reference: ["詩篇", "77"],
      eyebrow: "祢的腳蹤雖然無人知道",
      quotes: [{ text: "你的道在海中；你的路在大水中；你的腳蹤無人知道。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA077.htm" }]
    },
    old: {
      reference: ["列王紀下", "2:1–18"],
      eyebrow: "求祢的靈加倍感動我",
      quotes: [{ text: "願感動你的靈加倍地感動我。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/2KI02.htm" }]
    },
    new: {
      reference: ["馬可福音", "11:20–25"],
      eyebrow: "禱告、相信，也要饒恕",
      quotes: [{ text: "凡你們禱告祈求的，無論是甚麼，只要信是得着的，就必得着。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/MRK11.htm" }]
    }
  },
  {
    date: "2026-09-17",
    day: 17,
    weekday: "星期四",
    shortWeekday: "四",
    topic: "變甜。",
    deck: "苦水也能成為供應與記念。",
    artwork: { file: "22", label: "會有新事" },
    reflection: "我願意把哪一份苦澀帶到上帝面前？",
    tags: ["尋求", "醫治", "能力"],
    psalm: {
      reference: ["詩篇", "105:1–6, 37–45"],
      eyebrow: "時常尋求祂的面",
      quotes: [{ text: "要尋求耶和華與他的能力，時常尋求他的面。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA105.htm" }]
    },
    old: {
      reference: ["出埃及記", "15:22–27"],
      eyebrow: "呼求之後，苦水變甜",
      quotes: [{ text: "摩西呼求耶和華，耶和華指示他一棵樹。他把樹丟在水裏，水就變甜了。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/EXO15.htm" }]
    },
    new: {
      reference: ["哥林多後書", "13:1–4"],
      eyebrow: "軟弱之中，仍有上帝的大能",
      quotes: [{ text: "他因軟弱被釘在十字架上，卻因上帝的大能仍然活着。我們也是這樣同他軟弱，但因上帝向你們所顯的大能，也必與他同活。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/2CO13.htm" }]
    }
  },
  {
    date: "2026-09-18",
    day: 18,
    weekday: "星期五",
    shortWeekday: "五",
    topic: "省察。",
    deck: "每天領受，也誠實察看自己的心。",
    artwork: { file: "26", label: "看清楚" },
    reflection: "今天，我需要在上帝面前省察甚麼？",
    tags: ["供應", "試驗", "省察"],
    psalm: {
      reference: ["詩篇", "105:1–6, 37–45"],
      eyebrow: "祈求，祂便賜下供應",
      quotes: [{ text: "他們一求，他就使鵪鶉飛來，並用天上的糧食叫他們飽足。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA105.htm" }]
    },
    old: {
      reference: ["出埃及記", "16:1–21"],
      eyebrow: "每日收取每日的分",
      quotes: [{ text: "我要將糧食從天降給你們。百姓可以出去，每天收每天的分，我好試驗他們遵不遵我的法度。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/EXO16.htm" }]
    },
    new: {
      reference: ["哥林多後書", "13:5–10"],
      eyebrow: "在信仰裏誠實省察自己",
      quotes: [{ text: "你們總要自己省察有信心沒有，也要自己試驗。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/2CO13.htm" }]
    }
  },
  {
    date: "2026-09-19",
    day: 19,
    weekday: "星期六",
    shortWeekday: "六",
    topic: "安息。",
    deck: "停止抓取，信靠上帝已經預備。",
    artwork: { file: "16", label: "安心交托" },
    reflection: "我能否放下控制，真正安息一天？",
    tags: ["安息", "信靠", "知足"],
    psalm: {
      reference: ["詩篇", "105:1–6, 37–45"],
      eyebrow: "上帝用天糧使百姓飽足",
      quotes: [{ text: "他們一求，他就使鵪鶉飛來，並用天上的糧食叫他們飽足。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA105.htm" }]
    },
    old: {
      reference: ["出埃及記", "16:22–30"],
      eyebrow: "安息是上帝所賜的禮物",
      quotes: [{ text: "你們看！耶和華既將安息日賜給你們，所以第六天他賜給你們兩天的食物。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/EXO16.htm" }]
    },
    new: {
      reference: ["馬太福音", "19:23–30"],
      eyebrow: "在人不能，在上帝凡事都能",
      quotes: [{ text: "在人這是不能的，在上帝凡事都能。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/MAT19.htm" }]
    }
  },
  {
    date: "2026-09-20",
    day: 20,
    weekday: "星期日",
    shortWeekday: "日",
    topic: "恩典。",
    deck: "上帝所給的，不由人的先後衡量。",
    artwork: { file: "33", label: "記得恩典" },
    reflection: "我能否為別人所得的恩典一同歡喜？",
    tags: ["恩典", "供應", "喜樂"],
    psalm: {
      reference: ["詩篇", "105:1–6, 37–45"],
      eyebrow: "記念那位供應百姓的主",
      quotes: [{ text: "他們一求，他就使鵪鶉飛來，並用天上的糧食叫他們飽足。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA105.htm" }]
    },
    old: {
      reference: ["出埃及記", "16:2–15"],
      eyebrow: "這就是耶和華所賜的食物",
      quotes: [{ text: "這就是耶和華給你們吃的食物。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/EXO16.htm" }]
    },
    new: {
      reference: ["腓立比書 1:21–30", "馬太福音 20:1–16"],
      eyebrow: "活着為基督，也以恩典看人",
      quotes: [
        { label: "腓立比書 1:21", text: "因我活着就是基督，我死了就有益處。" },
        { label: "馬太福音 20:16", text: "這樣，那在後的，將要在前；在前的，將要在後了。" }
      ],
      links: [
        { label: "閱讀書信全文", url: "https://ebible.org/cmn-cu89t/PHP01.htm" },
        { label: "閱讀福音全文", url: "https://ebible.org/cmn-cu89t/MAT20.htm" }
      ]
    }
  },
  {
    date: "2026-09-21",
    day: 21,
    weekday: "星期一",
    shortWeekday: "一",
    topic: "記得。",
    deck: "把恩典留下，也把人好好接待。",
    artwork: { file: "33", label: "記得恩典" },
    reflection: "我要記住哪一份供應，又接待哪一個人？",
    tags: ["記念", "接待", "同行"],
    psalm: {
      reference: ["詩篇", "119:97–104"],
      eyebrow: "終日思想所愛慕的話語",
      quotes: [{ text: "我何等愛慕你的律法，終日不住地思想。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA119.htm" }]
    },
    old: {
      reference: ["出埃及記", "16:31–35"],
      eyebrow: "把供應留下，讓後代記得",
      quotes: [{ text: "要將一滿俄梅珥嗎哪留到世世代代，使後人可以看見我當日將你們領出埃及地，在曠野所給你們吃的食物。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/EXO16.htm" }]
    },
    new: {
      reference: ["羅馬書", "16:1–16"],
      eyebrow: "在主裏接待，一同作工",
      quotes: [{ text: "我對你們舉薦我們的姊妹非比；她是堅革哩教會中的女執事。請你們為主接待她，合乎聖徒的體統。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/ROM16.htm" }]
    }
  },
  {
    date: "2026-09-22",
    day: 22,
    weekday: "星期二",
    shortWeekday: "二",
    topic: "知足。",
    deck: "別讓貪慾與離間偷走平安。",
    artwork: { file: "40", label: "靜下來" },
    reflection: "我真正需要的是甚麼？",
    tags: ["知足", "分辨", "平安"],
    psalm: {
      reference: ["詩篇", "119:97–104"],
      eyebrow: "祢的言語比蜜更甜",
      quotes: [{ text: "你的言語在我上膛何等甘美，在我口中比蜜更甜！" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA119.htm" }]
    },
    old: {
      reference: ["民數記", "11:1–9"],
      eyebrow: "別讓不滿遮住已有的供應",
      quotes: [{ text: "現在我們的心血枯竭了，除這嗎哪以外，在我們眼前並沒有別的東西。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/NUM11.htm" }]
    },
    new: {
      reference: ["羅馬書", "16:17–20"],
      eyebrow: "留心離間，持守上帝的平安",
      quotes: [{ text: "賜平安的上帝快要將撒但踐踏在你們腳下。願我主耶穌基督的恩常和你們同在！" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/ROM16.htm" }]
    }
  },
  {
    date: "2026-09-23",
    day: 23,
    weekday: "星期三",
    shortWeekday: "三",
    topic: "謙卑。",
    deck: "重擔可以同擔，天國也從微小開始。",
    artwork: { file: "24", label: "求智慧" },
    reflection: "我願意接受誰的幫助，又謙卑服事誰？",
    tags: ["同擔", "信靠", "謙卑"],
    psalm: {
      reference: ["詩篇", "119:97–104"],
      eyebrow: "反覆思想祢的教導",
      quotes: [{ text: "我何等愛慕你的律法，終日不住地思想。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA119.htm" }]
    },
    old: {
      reference: ["民數記", "11:18–23, 31–32"],
      eyebrow: "耶和華的膀臂豈是縮短了嗎",
      quotes: [{ text: "耶和華的膀臂豈是縮短了嗎？現在要看我的話向你應驗不應驗。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/NUM11.htm" }]
    },
    new: {
      reference: ["馬太福音", "18:1–5"],
      eyebrow: "自己謙卑，像小孩子一樣",
      quotes: [{ text: "凡自己謙卑像這小孩子的，他在天國裏就是最大的。" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/MAT18.htm" }]
    }
  },
  {
    date: "2026-09-24",
    day: 24,
    weekday: "星期四",
    shortWeekday: "四",
    topic: "聽教。",
    deck: "讓上帝引導，也停止論斷明天。",
    artwork: { file: "25", label: "留心聽" },
    reflection: "我願意放下哪一個自以為是的計劃？",
    tags: ["聆聽", "引導", "交託"],
    psalm: {
      reference: ["詩篇", "78:1–4, 12–16"],
      eyebrow: "把祂奇妙的作為告訴後代",
      quotes: [{ text: "我們不將這些事向他們的子孫隱瞞，要將耶和華的美德和他的能力，並他奇妙的作為，述說給後代聽。" }],
      links: [{ label: "閱讀詩篇全文", url: "https://ebible.org/cmn-cu89t/PSA078.htm" }]
    },
    old: {
      reference: ["以賽亞書", "48:17–21"],
      eyebrow: "聽從引導，平安就如河水",
      quotes: [{ text: "甚願你素來聽從我的命令！你的平安就如河水；你的公義就如海浪。" }],
      links: [{ label: "閱讀舊約全文", url: "https://ebible.org/cmn-cu89t/ISA48.htm" }]
    },
    new: {
      reference: ["雅各書", "4:11–16"],
      eyebrow: "不論斷，也不誇口明天",
      quotes: [{ text: "你們只當說：『主若願意，我們就可以活着，也可以做這事，或做那事。』" }],
      links: [{ label: "閱讀新約全文", url: "https://ebible.org/cmn-cu89t/JAS04.htm" }]
    }
  }
];

let generatedContent = window.dailyReadingContent;
let readings = generatedContent?.readings?.length
  ? generatedContent.readings
  : fallbackReadings;
const readingKinds = ["psalm", "old", "new"];

const fallbackFullReadingKeys = {
  "2026-09-11": { psalm: ["psa114"], old: ["exo14_1_18"], new: ["act7_9_16"] },
  "2026-09-12": { psalm: ["psa114"], old: ["exo15_19_21"], new: ["mat6_7_15"] },
  "2026-09-13": { psalm: ["psa114"], old: ["exo14_19_31"], new: ["rom14_1_12", "mat18_21_35"] },
  "2026-09-14": { psalm: ["psa77"], old: ["jos3_1_17"], new: ["heb11_23_29"] },
  "2026-09-15": { psalm: ["psa77"], old: ["neh9_9_15"], new: ["rom14_13_15_2"] },
  "2026-09-16": { psalm: ["psa77"], old: ["twoKings2_1_18"], new: ["mrk11_20_25"] },
  "2026-09-17": { psalm: ["psa105_1_6_37_45"], old: ["exo15_22_27"], new: ["twoCor13_1_4"] },
  "2026-09-18": { psalm: ["psa105_1_6_37_45"], old: ["exo16_1_21"], new: ["twoCor13_5_10"] },
  "2026-09-19": { psalm: ["psa105_1_6_37_45"], old: ["exo16_22_30"], new: ["mat19_23_30"] },
  "2026-09-20": { psalm: ["psa105_1_6_37_45"], old: ["exo16_2_15"], new: ["php1_21_30", "mat20_1_16"] },
  "2026-09-21": { psalm: ["psa119_97_104"], old: ["exo16_31_35"], new: ["rom16_1_16"] },
  "2026-09-22": { psalm: ["psa119_97_104"], old: ["num11_1_9"], new: ["rom16_17_20"] },
  "2026-09-23": { psalm: ["psa119_97_104"], old: ["num11_18_23_31_32"], new: ["mat18_1_5"] },
  "2026-09-24": { psalm: ["psa78_1_4_12_16"], old: ["isa48_17_21"], new: ["jas4_11_16"] }
};
let fullReadingKeys = generatedContent?.fullReadingKeys
  ?? fallbackFullReadingKeys;
let scriptureTexts = generatedContent?.scriptureTexts
  ?? window.scriptureTexts;
const dataRefreshInterval = 15 * 60 * 1000;
let lastDataRefreshAt = 0;
let dataRefreshPromise = null;

function applyGeneratedContent(content) {
  if (!content?.readings?.length || !content.fullReadingKeys || !content.scriptureTexts) {
    return false;
  }
  generatedContent = content;
  readings = content.readings;
  fullReadingKeys = content.fullReadingKeys;
  scriptureTexts = content.scriptureTexts;
  return true;
}

function refreshGeneratedContent({ force = false } = {}) {
  if (window.location.protocol === "file:") return Promise.resolve(false);
  if (!force && Date.now() - lastDataRefreshAt < dataRefreshInterval) {
    return Promise.resolve(false);
  }
  if (dataRefreshPromise) return dataRefreshPromise;

  lastDataRefreshAt = Date.now();
  dataRefreshPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    const finish = (updated) => {
      script.remove();
      resolve(updated);
    };
    script.src = `daily-content.js?refresh=${Date.now()}`;
    script.async = true;
    script.onload = () => finish(applyGeneratedContent(window.dailyReadingContent));
    script.onerror = () => finish(false);
    document.head.append(script);
  }).finally(() => {
    dataRefreshPromise = null;
  });

  return dataRefreshPromise;
}

function buildReference(element, lines) {
  const nodes = [];

  lines.forEach((line, index) => {
    const span = document.createElement("span");
    span.className = "reference-line";
    span.textContent = line;
    nodes.push(span);

    if (index < lines.length - 1) {
      nodes.push(document.createElement("br"));
    }
  });

  element.replaceChildren(...nodes);
}

function buildQuotes(element, quotes) {
  const paragraphs = quotes.map((quote) => {
    const paragraph = document.createElement("p");

    if (quote.label) {
      const source = document.createElement("small");
      source.className = "quote-source";
      source.textContent = quote.label;
      paragraph.append(source);
    }

    paragraph.append(document.createTextNode(`「${quote.text}」`));
    return paragraph;
  });

  element.replaceChildren(...paragraphs);
}

function buildFullScriptures(element, keys) {
  const panels = keys.map((key) => {
    const passage = scriptureTexts[key];
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const action = document.createElement("span");
    const label = document.createElement("b");
    const body = document.createElement("div");

    details.className = "full-scripture";
    action.className = "summary-action";
    action.textContent = "完整經文";
    label.textContent = passage.label;
    body.className = "full-scripture-text";
    body.textContent = passage.text;
    summary.append(action, label);
    details.append(summary, body);
    return details;
  });

  element.replaceChildren(...panels);
}

function renderReading(kind, reading, fullKeys) {
  const cardTop = document.getElementById(`${kind}-card-top`);
  const reference = document.getElementById(`${kind}-reference`);

  buildReference(reference, reading.reference);
  document.getElementById(`${kind}-translation`).textContent = "和合本 · 重點節錄";
  document.getElementById(`${kind}-eyebrow`).textContent = reading.eyebrow;
  buildQuotes(document.getElementById(`${kind}-quote`), reading.quotes);
  buildFullScriptures(document.getElementById(`${kind}-links`), fullKeys);

  cardTop.classList.toggle("has-multiple", fullKeys.length > 1);
}

function renderTheme(tags) {
  const themeLine = document.getElementById("theme-line");
  const nodes = [];

  tags.forEach((tag, index) => {
    const span = document.createElement("span");
    span.textContent = tag;
    nodes.push(span);

    if (index < tags.length - 1) {
      const dot = document.createElement("i");
      dot.setAttribute("aria-hidden", "true");
      nodes.push(dot);
    }
  });

  themeLine.replaceChildren(...nodes);
  themeLine.setAttribute("aria-label", `今日主題：${tags.join("、")}`);
}

function renderDay(day) {
  const [year, month] = day.date.split("-").map(Number);
  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  document.getElementById("date-display").textContent = `${month} · ${day.day}`;
  document.getElementById("month-name").textContent = monthNames[month - 1];
  document.getElementById("weekday-display").textContent = day.weekday;
  document.getElementById("year-display").textContent = year;
  document.getElementById("date-row").setAttribute(
    "aria-label",
    `${year} 年 ${month} 月 ${day.day} 日，${day.weekday}`
  );
  document.getElementById("page-title").textContent = day.topic;
  document.getElementById("topic-deck").textContent = day.deck;
  const topicArtwork = document.getElementById("topic-art-image");
  topicArtwork.src = `assets/topics/topic-${day.artwork.file}.webp?v=20260912e`;
  topicArtwork.alt = `${day.artwork.label}主題插畫`;
  topicArtwork.draggable = false;
  document.getElementById("reflection-title").textContent = day.reflection;
  renderTheme(day.tags);

  readingKinds.forEach((kind) => {
    renderReading(kind, day[kind], fullReadingKeys[day.date][kind]);
  });

  document.title = `每日經課｜${year} 年 ${month} 月 ${day.day} 日`;
  document.querySelector(".readings").setAttribute("aria-label", `${day.weekday}經課內容`);
  document.documentElement.dataset.activeDate = day.date;

  const url = new URL(window.location.href);
  url.searchParams.delete("date");
  try {
    window.history.replaceState({}, "", url);
  } catch {
    // Some browsers restrict History API updates on local file previews.
  }
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderLocalDay() {
  const localDate = getLocalDateKey();
  const exactDay = readings.find((reading) => reading.date === localDate);
  const generatedFallback = generatedContent?.readings?.length
    ? [...readings]
      .sort((first, second) => first.date.localeCompare(second.date))
      .filter((reading) => reading.date <= localDate)
      .at(-1) ?? readings[0]
    : null;
  const day = exactDay ?? generatedFallback;

  if (day && document.documentElement.dataset.activeDate !== day.date) {
    renderDay(day);
  }
  document.documentElement.dataset.contentDateStatus = exactDay ? "current" : "fallback";
  return Boolean(exactDay);
}

function scheduleLocalMidnightUpdate() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 1
  );

  window.setTimeout(async () => {
    await refreshGeneratedContent({ force: true });
    renderLocalDay();
    scheduleLocalMidnightUpdate();
  }, nextMidnight.getTime() - now.getTime());
}

if (!renderLocalDay()) {
  refreshGeneratedContent({ force: true }).finally(renderLocalDay);
}
scheduleLocalMidnightUpdate();

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest?.(".topic-art-stage")) {
    event.preventDefault();
  }
});

document.addEventListener("dragstart", (event) => {
  if (event.target.closest?.(".topic-art-stage")) {
    event.preventDefault();
  }
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshGeneratedContent().finally(renderLocalDay);
  }
});

const installDialog = document.getElementById("install-dialog");
const addHomeButton = document.getElementById("add-home-button");
const installDialogClose = installDialog.querySelector(".install-dialog-close");
const directInstallButton = document.getElementById("direct-install-button");
let deferredInstallPrompt;

function detectInstallPlatform() {
  const isIPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || isIPadOS;
  const isAndroid = /Android/i.test(navigator.userAgent);

  return isIOS ? "ios" : isAndroid ? "android" : "";
}

function markCurrentInstallPlatform() {
  const platform = detectInstallPlatform();

  document.querySelectorAll("[data-install-platform]").forEach((section) => {
    section.classList.toggle(
      "is-current",
      section.dataset.installPlatform === platform
    );
  });
}

function openInstallDialog() {
  markCurrentInstallPlatform();

  if (typeof installDialog.showModal === "function") {
    installDialog.showModal();
  } else {
    installDialog.setAttribute("open", "");
    document.body.classList.add("install-dialog-fallback-open");
  }
}

function closeInstallDialog() {
  if (typeof installDialog.close === "function") {
    installDialog.close();
  } else {
    installDialog.removeAttribute("open");
  }

  document.body.classList.remove("install-dialog-fallback-open");
}

addHomeButton.addEventListener("click", openInstallDialog);

installDialogClose.addEventListener("click", () => {
  if (typeof installDialog.close !== "function") {
    closeInstallDialog();
  }
});

installDialog.addEventListener("click", (event) => {
  if (event.target === installDialog) {
    closeInstallDialog();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && installDialog.hasAttribute("open")) {
    closeInstallDialog();
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  directInstallButton.hidden = false;
});

directInstallButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  const result = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = undefined;
  directInstallButton.hidden = true;

  if (result.outcome === "accepted") {
    closeInstallDialog();
  }
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = undefined;
  directInstallButton.hidden = true;
  addHomeButton.querySelector("span").textContent = "已加入主畫面";
});

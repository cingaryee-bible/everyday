let generatedContent = window.dailyReadingContent;
let readings = generatedContent?.readings?.length
  ? generatedContent.readings
  : [];
const readingKinds = ["psalm", "old", "new"];

let fullReadingKeys = generatedContent?.fullReadingKeys ?? {};
let scriptureTexts = generatedContent?.scriptureTexts ?? {};
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

    paragraph.append(document.createTextNode(quote.text));
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
  document.getElementById(`${kind}-translation`).textContent = "和合本2010 · 重點節錄";
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

const translationDialog = document.getElementById("translation-dialog");
const translationPickerButton = document.getElementById("translation-picker-button");
const translationDialogClose = translationDialog.querySelector(".translation-dialog-close");
const currentTranslationOption = document.getElementById("current-translation-option");

function openTranslationDialog() {
  if (typeof translationDialog.showModal === "function") {
    translationDialog.showModal();
  } else {
    translationDialog.setAttribute("open", "");
    document.body.classList.add("translation-dialog-fallback-open");
  }
}

function closeTranslationDialog() {
  if (typeof translationDialog.close === "function") {
    translationDialog.close();
  } else {
    translationDialog.removeAttribute("open");
  }

  document.body.classList.remove("translation-dialog-fallback-open");
}

translationPickerButton.addEventListener("click", openTranslationDialog);

translationDialogClose.addEventListener("click", () => {
  if (typeof translationDialog.close !== "function") {
    closeTranslationDialog();
  }
});

currentTranslationOption.addEventListener("click", closeTranslationDialog);

translationDialog.addEventListener("click", (event) => {
  if (event.target === translationDialog) {
    closeTranslationDialog();
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
  if (event.key === "Escape" && translationDialog.hasAttribute("open")) {
    closeTranslationDialog();
  }

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

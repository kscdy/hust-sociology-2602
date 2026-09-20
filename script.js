const STORAGE_KEY = "hust-sociology-2602-messages";
const PEOPLE_KEY = "hust-sociology-2602-people";
const GROUPS = ["教师班主任", "辅导员", "研班"];
const GROUP_MAP = {
  教师班主任: "教师班主任",
  辅导员: "辅导员",
  研班: "研班",
};

const PHOTO = "assets/advisor.png";
const ADVISOR_INTRO =
  "大家好，我是社会学院 2602 班的教师班主任。课堂上，我希望带大家把理论读扎实、把调查方法用起来；课后也欢迎随时来聊读书、研究和生活里的困惑。社会学最动人的地方，是看见人、理解结构。期待和同学们一起在喻园求是、共情、同行。";
const COUNSELOR_INTRO =
  "大家好，我是社会学院 2602 班辅导员。学习、生活、心理和职业规划，都可以来找我。班集体的事我们一起商量，困难不必一个人扛。";
const YANBAN_INTRO =
  "我也在研班这边陪伴大家：带读、答疑、分享田野和学业经验。有问题随时问，我们一起把低年级的路走稳。";

const seeds = [
  {
    name: "辅导员",
    body: "愿 2602 班求是、共情、同行。在喻园把彼此照顾好。",
    time: "2026-09-01 09:00",
  },
  {
    name: "开发者小陈",
    body: "欢迎随时在这里留下想说的话。班级的故事，也从一句问候开始。",
    time: "2026-09-10 21:18",
  },
];

const defaultPeople = [
  {
    id: "as-teacher-advisor",
    group: "教师班主任",
    role: "教师班主任",
    name: "教师班主任",
    photo: PHOTO,
    intro: ADVISOR_INTRO,
    locked: true,
  },
  {
    id: "as-counselor",
    group: "辅导员",
    role: "辅导员",
    name: "辅导员",
    photo: PHOTO,
    intro: COUNSELOR_INTRO,
    locked: true,
  },
  {
    id: "yanban-1",
    group: "研班",
    role: "研班",
    name: "研班",
    photo: PHOTO,
    intro: YANBAN_INTRO,
    locked: true,
  },
];

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seeds;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return seeds;
    return parsed.map((item) =>
      item && item.name === "班长" ? { ...item, name: "开发者小陈" } : item
    );
  } catch {
    return seeds;
  }
}

function saveMessages(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function formatNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function render(items) {
  const list = document.getElementById("message-list");
  if (!items.length) {
    list.innerHTML = `<p class="message-empty">还没有留言，来写第一条吧。</p>`;
    return;
  }
  list.innerHTML = items
    .slice()
    .reverse()
    .map(
      (item) => `
        <article class="message-card">
          <strong>${escapeHtml(item.name)}</strong>
          <p>${escapeHtml(item.body)}</p>
          <time>${escapeHtml(item.time)}</time>
        </article>`
    )
    .join("");
}

const form = document.getElementById("message-form");
let messages = loadMessages();
render(messages);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const body = String(data.get("body") || "").trim();
  if (!name || !body) return;
  messages.push({ name, body, time: formatNow() });
  saveMessages(messages);
  render(messages);
  form.reset();
});

function loadExtraPeople() {
  try {
    const raw = localStorage.getItem(PEOPLE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((person) => {
      if (!person) return person;
      if (person.role === "辅导员" || person.name === "辅导员") {
        return { ...person, group: "辅导员", role: "辅导员" };
      }
      if (person.group === "教师" || person.group === "班主任") {
        return { ...person, group: "教师班主任" };
      }
      return person;
    });
  } catch {
    return [];
  }
}

function saveExtraPeople(items) {
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(items));
}

function allPeople() {
  return [...defaultPeople, ...loadExtraPeople()];
}

function personCard(person) {
  const photo = person.photo || "assets/sociology-emblem.png";
  const remove = person.locked
    ? ""
    : `<button class="person-remove" type="button" data-remove="${escapeHtml(person.id)}">移除</button>`;
  return `
    <article class="person-card">
      <img class="person-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(person.name)}" />
      <p class="person-role">2602 · ${escapeHtml(person.role || person.group)}</p>
      <h4>${escapeHtml(person.name)}</h4>
      <p>${escapeHtml(person.intro)}</p>
      ${remove}
    </article>`;
}

function renderPeople() {
  const board = document.getElementById("people-board");
  const people = allPeople();
  board.innerHTML = people.length
    ? `<div class="people-grid">${people.map(personCard).join("")}</div>`
    : `<p class="message-empty">这一栏还空着，可以点下方补充照片和自我介绍。</p>`;
}

function readPhoto(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("assets/sociology-emblem.png");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "assets/sociology-emblem.png"));
    reader.readAsDataURL(file);
  });
}

renderPeople();

document.getElementById("people-board").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  const id = button.getAttribute("data-remove");
  saveExtraPeople(loadExtraPeople().filter((person) => person.id !== id));
  renderPeople();
});

document.getElementById("people-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formEl = event.currentTarget;
  const data = new FormData(formEl);
  const name = String(data.get("name") || "").trim();
  const intro = String(data.get("intro") || "").trim();
  const role = String(data.get("group") || "");
  const group = GROUP_MAP[role];
  if (!name || !intro || !group) return;
  const photo = await readPhoto(data.get("photo"));
  const extras = loadExtraPeople();
  extras.push({
    id: `p-${Date.now()}`,
    group,
    role,
    name,
    intro,
    photo,
  });
  saveExtraPeople(extras);
  renderPeople();
  formEl.reset();
});

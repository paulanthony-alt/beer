// Sun Devil Sip-Off — game logic. Plain JS, state lives in localStorage.

const STORE_KEY = "sun-devil-sip-off-v1";
const AVATARS = ["🔱", "😈", "🌵", "☀️", "🔥", "🌴", "🏜️", "🦂", "🐍", "🌶️", "🏈", "🎓", "🍺", "🥵", "🌞", "⚡"];

const RANKS = [
  { min: 0, title: "Orientation Week", emoji: "🎒" },
  { min: 5, title: "Freshman", emoji: "🐣" },
  { min: 15, title: "Sophomore", emoji: "📚" },
  { min: 30, title: "Junior", emoji: "🍻" },
  { min: 50, title: "Senior", emoji: "🎓" },
  { min: 75, title: "Super Senior", emoji: "🕶️" },
  { min: 100, title: "Grad Student", emoji: "🧪" },
  { min: 140, title: "Alumni Legend", emoji: "🏛️" },
  { min: 200, title: "Sparky Status", emoji: "🔱" },
];

const BADGES = [
  { id: "first", emoji: "🔱", name: "Forks Up", desc: "Logged your first drink", test: (s) => s.drinks >= 1 },
  { id: "hat", emoji: "🎩", name: "Hat Trick", desc: "3 shots", test: (s) => s.byCat.shots >= 3 },
  { id: "water", emoji: "💧", name: "Hydration Homie", desc: "3 waters (it's a dry heat)", test: (s) => s.byCat.hydro >= 3 },
  { id: "local", emoji: "🌵", name: "Local Legend", desc: "Drank an Arizona local", test: (s) => s.byCat.local >= 1 },
  { id: "traitor", emoji: "🐻", name: "Traitor", desc: "Drank a Tucson beer. Shame.", test: (s) => s.ids.has("dragoon-ipa") },
  { id: "frat", emoji: "🏚️", name: "Frat Row", desc: "Did a party classic", test: (s) => s.byCat.party >= 1 },
  { id: "special", emoji: "😈", name: "House Recipe", desc: "Tried a Sun Devil Special", test: (s) => s.byCat.house >= 1 },
  { id: "wine", emoji: "🍷", name: "Wine Mom", desc: "3 wines", test: (s) => s.byCat.wine >= 3 },
  { id: "claw", emoji: "🥤", name: "Seltzer Szn", desc: "3 seltzers or malts", test: (s) => s.byCat.malt >= 3 },
  { id: "hell", emoji: "🔥", name: "Hellfire", desc: "Took on a 5+ point drink", test: (s) => s.maxPts >= 5 },
  { id: "loko", emoji: "🧃", name: "2010 Called", desc: "Drank a Four Loko", test: (s) => s.ids.has("four-loko") },
  { id: "iced", emoji: "🧊", name: "Got Iced", desc: "Smirnoff Ice'd", test: (s) => s.ids.has("smirnoff-ice") },
  { id: "dare", emoji: "🤘", name: "Daredevil", desc: "Completed 5 dares", test: (s) => s.dares >= 5 },
  { id: "chicken", emoji: "🐔", name: "Chicken Little", desc: "Chickened out 3 times", test: (s) => s.chickens >= 3 },
  { id: "ten", emoji: "🔟", name: "Double Digits", desc: "10 drinks logged", test: (s) => s.drinks >= 10 },
  { id: "century", emoji: "💯", name: "Century Club", desc: "100 points", test: (s) => s.points >= 100 },
];

// ---------- state ----------

function freshState() {
  return { players: [], log: [], settings: { hydrate: true }, ui: { tab: "board", cat: "all", deckTypes: DECK_TYPES.map((d) => d.id) } };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(freshState(), JSON.parse(raw));
  } catch (e) { /* storage blocked or corrupt — start fresh */ }
  return freshState();
}

let state = load();
let selectedLog = new Set();
let darePlayer = null;
let deck = [];
let currentCard = null;
let importPlan = null;

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  if (window.Live && window.Live.active) window.Live.push(state);
}

// Called by sync.js whenever the shared game changes on any phone.
function applyRemote(players, log) {
  state.players = players;
  state.log = log;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  render();
}

const isLive = () => Boolean(window.Live && window.Live.active);

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const player = (id) => state.players.find((p) => p.id === id);
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const drinkById = Object.fromEntries(DRINKS.map((d) => [d.id, d]));

// ---------- stats ----------

function statsFor(pid) {
  const s = { points: 0, drinks: 0, waters: 0, dares: 0, chickens: 0, sips: 0, maxPts: 0, byCat: {}, ids: new Set(), favs: {}, sinceWater: 0 };
  for (const c of CATEGORIES) s.byCat[c.id] = 0;
  for (const e of state.log) {
    if (e.pid !== pid) continue;
    s.points += e.pts;
    if (e.kind === "drink") {
      s.byCat[e.cat] = (s.byCat[e.cat] || 0) + 1;
      s.ids.add(e.drinkId);
      if (e.alc) {
        s.drinks++;
        s.sinceWater++;
        s.maxPts = Math.max(s.maxPts, e.pts);
        s.favs[e.name] = (s.favs[e.name] || 0) + 1;
      } else {
        s.waters++;
        s.sinceWater = 0;
      }
    } else if (e.kind === "dare") s.dares++;
    else if (e.kind === "chicken") s.chickens++;
    else if (e.kind === "sips") s.sips += e.sips || 0;
  }
  const fav = Object.entries(s.favs).sort((a, b) => b[1] - a[1])[0];
  s.fav = fav ? fav[0] : null;
  s.badges = BADGES.filter((b) => b.test(s));
  return s;
}

function rankFor(points) {
  let i = 0;
  RANKS.forEach((r, idx) => { if (points >= r.min) i = idx; });
  return { ...RANKS[i], index: i, next: RANKS[i + 1] || null };
}

function standings() {
  return state.players
    .map((p) => ({ p, s: statsFor(p.id) }))
    .sort((a, b) => b.s.points - a.s.points || b.s.drinks - a.s.drinks || a.p.name.localeCompare(b.p.name));
}

// ---------- logging ----------

function addEntries(entries, { quiet = false, celebrate = true } = {}) {
  const before = new Map(entries.map((e) => [e.pid, statsFor(e.pid)]));
  const stamped = entries.map((e) => ({ id: uid(), t: Date.now(), ...e }));
  state.log.push(...stamped);
  save();

  // Collect celebrations, then group them so a round for the whole crew is one toast, not twelve.
  const promos = [], badges = {}, thirsty = [];
  for (const [pid, prev] of celebrate ? before : []) {
    const now = statsFor(pid);
    const name = esc(player(pid).name);
    const oldRank = rankFor(prev.points), newRank = rankFor(now.points);
    if (newRank.index > oldRank.index) promos.push({ name, rank: newRank });
    const prevBadges = new Set(prev.badges.map((b) => b.id));
    for (const b of now.badges) if (!prevBadges.has(b.id)) (badges[b.id] ||= { b, names: [] }).names.push(name);
    if (state.settings.hydrate && now.sinceWater > prev.sinceWater && now.sinceWater > 0 && now.sinceWater % 3 === 0) thirsty.push(name);
  }
  if (promos.length === 1) toast(`${promos[0].rank.emoji} <b>${promos[0].name}</b> promoted to <b>${promos[0].rank.title}</b>!`, { cls: "gold" });
  else if (promos.length) toast(`🎓 Promotions! ${promos.map((x) => `<b>${x.name}</b> → ${x.rank.title}`).join(", ")}`, { cls: "gold" });
  if (promos.length) burst();
  for (const { b, names } of Object.values(badges)) toast(`${b.emoji} <b>${b.name}</b> unlocked: ${listNames(names)}`, { cls: "maroon" });
  if (thirsty.length) toast(`💧 ${listNames(thirsty)} — 3 drinks since your last water. It's a dry heat, hydrate!`, { cls: "water", ms: 6000 });

  if (!quiet) {
    const pts = stamped.reduce((a, e) => a + e.pts, 0);
    const who = [...new Set(stamped.map((e) => player(e.pid).name))];
    const label = stamped[0].name;
    const whoText = who.length > 3 ? `${who.length} Sun Devils` : who.map(esc).join(", ");
    toast(`<b>+${pts}</b> · ${whoText} · ${esc(label)}`, {
      undo: () => {
        const ids = new Set(stamped.map((e) => e.id));
        state.log = state.log.filter((e) => !ids.has(e.id));
        save();
        render();
      },
    });
    if (stamped.some((e) => e.pts >= 4)) burst();
  }
  render();
  return stamped;
}

function logDrink(drink, pids) {
  if (!pids.length) {
    toast("Pick who's drinking first ☝️", { cls: "maroon" });
    $("#log-players").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  addEntries(pids.map((pid) => ({ pid, kind: "drink", drinkId: drink.id, name: drink.name, cat: drink.cat, pts: drink.pts, alc: drink.alc })));
}

function logSips(pids, sips, reason) {
  return addEntries(pids.map((pid) => ({ pid, kind: "sips", name: reason, sips, pts: sips })));
}

// ---------- rendering ----------

function render() {
  renderBoard();
  renderLogPlayers();
  renderDarePlayers();
  renderCrew();
}

function tallyMarks(n) {
  // Classic tally: groups of four strokes and a slash. Cap the visual at 50.
  const shown = Math.min(n, 50);
  let html = "";
  for (let g = 0; g < Math.ceil(shown / 5); g++) {
    const count = Math.min(5, shown - g * 5);
    html += `<span class="tally${count === 5 ? " full" : ""}">${"<i></i>".repeat(Math.min(count, 4))}</span>`;
  }
  if (n > 50) html += `<span class="tally-more">+${n - 50}</span>`;
  return html || `<span class="hint">No tallies yet</span>`;
}

function renderBoard() {
  const rows = standings();
  const totals = rows.reduce((a, { s }) => ({ points: a.points + s.points, drinks: a.drinks + s.drinks, waters: a.waters + s.waters, dares: a.dares + s.dares }), { points: 0, drinks: 0, waters: 0, dares: 0 });

  $("#crew-stats").innerHTML = [
    ["🔥", totals.points, "Crew points"],
    ["🍺", totals.drinks, "Drinks"],
    ["💧", totals.waters, "Waters"],
    ["😈", totals.dares, "Dares done"],
  ].map(([e, v, l]) => `<div class="stat"><span class="stat-emoji">${e}</span><b>${v}</b><span>${l}</span></div>`).join("");

  if (!rows.length) {
    $("#podium").innerHTML = "";
    $("#player-cards").innerHTML = `<div class="empty"><p>No Sun Devils yet.</p><button class="btn gold" data-goto="crew">Add the crew 🔱</button></div>`;
  } else {
    const top = rows.slice(0, 3);
    const order = top.length === 3 ? [top[1], top[0], top[2]] : top.length === 2 ? [top[1], top[0]] : top;
    $("#podium").innerHTML = order.map(({ p, s }) => {
      const place = top.findIndex((r) => r.p.id === p.id) + 1;
      const medal = ["🥇", "🥈", "🥉"][place - 1];
      return `<div class="podium-spot place-${place}"><div class="podium-avatar">${place === 1 ? '<span class="crown">👑</span>' : ""}${p.avatar}</div><div class="podium-name">${esc(p.name)}</div><div class="podium-block"><span>${medal}</span><b>${s.points}</b></div></div>`;
    }).join("");

    const leader = rows[0].s.points;
    $("#player-cards").innerHTML = rows.map(({ p, s }, i) => {
      const r = rankFor(s.points);
      const pct = r.next ? Math.round(((s.points - r.min) / (r.next.min - r.min)) * 100) : 100;
      const cats = CATEGORIES.filter((c) => s.byCat[c.id]).map((c) => `<span class="mini-cat" title="${c.label}">${c.emoji}${s.byCat[c.id]}</span>`).join("");
      return `<article class="player-card ${i === 0 && leader > 0 ? "leader" : ""}" data-player="${p.id}">
        <div class="pc-top">
          <div class="pc-place">#${i + 1}</div>
          <div class="pc-avatar">${p.avatar}</div>
          <div class="pc-who"><h3>${esc(p.name)}</h3><p>${r.emoji} ${r.title}</p></div>
          <div class="pc-points"><b>${s.points}</b><span>pts</span></div>
        </div>
        <div class="progress"><div style="width:${pct}%"></div></div>
        <p class="progress-label">${r.next ? `${r.next.min - s.points} pts to ${r.next.title}` : "Max rank. Sparky salutes you."}</p>
        <div class="tallies" aria-label="${s.drinks} drinks">${tallyMarks(s.drinks)}</div>
        <div class="pc-meta">
          <span>🍺 ${s.drinks}</span><span>💧 ${s.waters}</span><span>😈 ${s.dares}</span>${s.chickens ? `<span>🐔 ${s.chickens}</span>` : ""}
        </div>
        ${cats ? `<div class="mini-cats">${cats}</div>` : ""}
        ${s.badges.length ? `<div class="pc-badges">${s.badges.map((b) => `<span title="${b.name}: ${b.desc}">${b.emoji}</span>`).join("")}</div>` : ""}
        <div class="pc-actions"><button class="btn gold small" data-quicklog="${p.id}">+ Drink</button><button class="btn ghost small" data-water="${p.id}">💧 Water</button><button class="btn ghost small" data-details="${p.id}">History</button></div>
      </article>`;
    }).join("");
  }

  const feed = state.log.slice(-25).reverse();
  $("#feed").innerHTML = feed.length ? feed.map((e) => {
    const p = player(e.pid);
    if (!p) return "";
    const icon = e.kind === "drink" ? catById[e.cat]?.emoji || "🍺" : { sips: "🎲", dare: "😈", chicken: "🐔", trivia: "🧠" }[e.kind];
    return `<li><span class="feed-icon">${icon}</span><span class="feed-text"><b>${esc(p.name)}</b> ${feedVerb(e)}</span><span class="feed-pts">${e.pts ? "+" + e.pts : ""}</span><span class="feed-time">${timeAgo(e.t)}</span><button class="icon-btn" data-remove="${e.id}" aria-label="Remove entry">✕</button></li>`;
  }).join("") : `<li class="hint">Nothing yet. Somebody crack a Natty.</li>`;
}

function feedVerb(e) {
  if (e.kind === "drink") return e.alc ? `drank <i>${esc(e.name)}</i>` : `hydrated with <i>${esc(e.name)}</i>`;
  if (e.kind === "dare") return `completed a dare`;
  if (e.kind === "chicken") return `chickened out of a dare 🐔`;
  if (e.kind === "trivia") return `nailed a trivia question`;
  if (e.kind === "sips") return `took ${e.sips} sip${e.sips === 1 ? "" : "s"} · ${esc(e.name)}`;
  return esc(e.name || "");
}

function timeAgo(t) {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "now";
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  return h < 24 ? h + "h" : Math.floor(h / 24) + "d";
}

function chipHTML(p, on) {
  return `<button class="chip ${on ? "on" : ""}" data-pid="${p.id}"><span>${p.avatar}</span>${esc(p.name)}</button>`;
}

function noPlayersHTML() {
  return `<p class="hint">Add your crew first. <button class="link" data-goto="crew">Go to Crew →</button></p>`;
}

function renderLogPlayers() {
  for (const id of [...selectedLog]) if (!player(id)) selectedLog.delete(id);
  $("#log-players").innerHTML = state.players.length ? state.players.map((p) => chipHTML(p, selectedLog.has(p.id))).join("") : noPlayersHTML();
}

function renderCatFilters() {
  const pills = [{ id: "all", label: "All", emoji: "🔱" }, ...CATEGORIES];
  $("#cat-filters").innerHTML = pills.map((c) => `<button class="pill ${state.ui.cat === c.id ? "on" : ""}" data-cat="${c.id}">${c.emoji} ${c.label}</button>`).join("");
}

function renderDrinkGrid() {
  const q = normalize($("#drink-search").value);
  const list = DRINKS.filter((d) => (state.ui.cat === "all" || d.cat === state.ui.cat) && (!q || normalize(d.name + " " + d.note).includes(q)));
  $("#drink-grid").innerHTML = list.length ? list.map((d) => {
    const tier = tierFor(d.pts);
    return `<button class="drink-tile cat-${d.cat}" data-drink="${d.id}">
      <span class="dt-cat">${catById[d.cat].emoji}</span>
      <span class="dt-name">${esc(d.name)}</span>
      ${d.note ? `<span class="dt-note">${esc(d.note)}</span>` : ""}
      <span class="dt-foot"><span class="dt-tier">${d.alc ? "🔥".repeat(tier.flames) : "💧"} ${d.alc ? tier.label : "Hydration"}</span><b class="dt-pts">${d.pts}</b></span>
    </button>`;
  }).join("") : `<p class="hint">No match. Use “Custom drink” below to add it.</p>`;
}

function renderRecipeTags() {
  const tag = state.ui.recipeTag || "all";
  $("#recipe-tags").innerHTML = [{ id: "all", label: "All", emoji: "🔱" }, ...RECIPE_TAGS]
    .map((t) => `<button class="pill ${tag === t.id ? "on" : ""}" data-rtag="${t.id}">${t.emoji} ${t.label}</button>`).join("");
}

function renderRecipes() {
  const tag = state.ui.recipeTag || "all";
  const q = normalize($("#recipe-search").value);
  const tagById = Object.fromEntries(RECIPE_TAGS.map((t) => [t.id, t]));
  const list = RECIPES.filter((r) => (tag === "all" || r.tag === tag) && (!q || normalize(r.drink + " " + r.ings.join(" ")).includes(q)));
  $("#recipe-list").innerHTML = list.length ? list.map((r) => {
    const d = drinkById[slugify(r.drink)];
    const t = tagById[r.tag];
    return `<article class="recipe tag-${r.tag}">
      <div class="recipe-head"><h3>${esc(r.drink)}</h3>${d ? `<b class="dt-pts">${d.pts}</b>` : ""}</div>
      <span class="recipe-tag">${t.emoji} ${t.label}</span>
      <ul class="recipe-ings">${r.ings.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <p class="recipe-steps">${esc(r.steps)}</p>
      ${d ? `<button class="btn ghost small" data-recipelog="${d.id}">🍺 Log it</button>` : ""}
    </article>`;
  }).join("") : `<p class="hint">No recipe for that one yet.</p>`;
}

function renderDarePlayers() {
  if (darePlayer && !player(darePlayer)) darePlayer = null;
  if (!darePlayer && state.players.length) darePlayer = state.players[0].id;
  $("#dare-players").innerHTML = state.players.length ? state.players.map((p) => chipHTML(p, p.id === darePlayer)).join("") : noPlayersHTML();
}

function renderDeckTypes() {
  $("#deck-types").innerHTML = DECK_TYPES.map((d) => `<button class="pill ${state.ui.deckTypes.includes(d.id) ? "on" : ""}" data-deck="${d.id}">${d.emoji} ${d.label}</button>`).join("");
  $("#deck-count").textContent = `${deck.length} cards left`;
}

function renderCrew() {
  $("#crew-list").innerHTML = state.players.length ? state.players.map((p) => `<li>
      <button class="avatar-btn" data-avatar="${p.id}" title="Change avatar">${p.avatar}</button>
      <input class="input crew-name" data-rename="${p.id}" value="${esc(p.name)}" maxlength="24" aria-label="Player name">
      <button class="icon-btn" data-delplayer="${p.id}" aria-label="Remove ${esc(p.name)}">🗑️</button>
    </li>`).join("") : `<li class="hint">No one yet. Add everyone who's back in town.</li>`;

  $("#rank-list").innerHTML = RANKS.map((r) => `<li><span>${r.emoji}</span><b>${r.title}</b><em>${r.min}+ pts</em></li>`).join("");
  $("#badge-list").innerHTML = BADGES.map((b) => `<li><span>${b.emoji}</span><div><b>${b.name}</b><em>${b.desc}</em></div></li>`).join("");
  $("#hydrate-toggle").checked = state.settings.hydrate;
}

// ---------- tabs ----------

function setTab(tab, { scroll = true } = {}) {
  state.ui.tab = tab;
  save();
  document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".tab-panel").forEach((s) => s.classList.toggle("active", s.id === "tab-" + tab));
  if (scroll && window.scrollY > $(".tabs").offsetTop) window.scrollTo({ top: $(".tabs").offsetTop, behavior: "smooth" });
}

// ---------- drink or dare ----------

function refillDeck() {
  deck = buildDeck(state.ui.deckTypes);
  renderDeckTypes();
}

function drawCard() {
  if (!state.players.length) { toast("Add the crew before drawing cards", { cls: "maroon" }); setTab("crew"); return; }
  if (!state.ui.deckTypes.length) { toast("Turn on at least one deck", { cls: "maroon" }); return; }
  if (!deck.length) { refillDeck(); toast("🔁 Deck reshuffled"); }
  currentCard = deck.pop();
  renderDeckTypes();
  const el = $("#dare-card");
  el.classList.remove("flip");
  void el.offsetWidth;
  el.classList.add("flip");
  setTimeout(() => showCard(currentCard), 180);
}

function showCard(card) {
  const el = $("#dare-card");
  const type = DECK_TYPES.find((d) => d.id === card.type);
  const who = player(darePlayer);
  el.className = `dare-card face type-${card.type}`;
  const body = `<p class="card-text">${esc(card.text)}</p>`;
  const reward = card.type === "dare" ? `<span class="card-reward">Do it: +${card.pts} · Chicken: drink ${card.sips}</span>`
    : card.water ? `<span class="card-reward">💧 +1 per water</span>`
    : `<span class="card-reward">${card.sips} sip${card.sips === 1 ? "" : "s"} = ${card.sips} pt${card.sips === 1 ? "" : "s"}</span>`;
  el.innerHTML = `<div class="card-inner">
    <div class="card-banner">${type.emoji} ${type.label}</div>
    ${who && (card.type === "dare" || card.select === "self") ? `<p class="card-for">${who.avatar} ${esc(who.name)}, you're up</p>` : ""}
    ${body}
    ${reward}
    <svg class="card-corner" viewBox="0 0 140 200" aria-hidden="true"><use href="#pitchfork"/></svg>
  </div>`;
  renderCardActions(card);
}

function renderCardActions(card) {
  const box = $("#card-actions");
  const who = player(darePlayer);
  if (card.type === "dare") {
    box.innerHTML = `<div class="btn-row"><button class="btn gold" data-act="dare-done">✅ Did it (+${card.pts})</button><button class="btn ghost" data-act="dare-chicken">🐔 Chicken — drink ${card.sips}</button></div>`;
  } else if (card.select === "self") {
    box.innerHTML = `<div class="btn-row"><button class="btn gold" data-act="self">🍺 ${esc(who.name)} drank (+${card.sips})</button><button class="btn ghost" data-act="skip">Skip</button></div>`;
  } else {
    const preselect = card.select === "all";
    const prompt = card.select === "one" ? "Tap who the crew picked:" : card.water ? "Who hydrated?" : card.select === "all" ? "Everyone drinks — untap anyone sitting out:" : "Tap everyone who drinks:";
    box.innerHTML = `<p class="hint">${prompt}</p><div class="chips" id="card-chips" data-mode="${card.select}">${state.players.map((p) => chipHTML(p, preselect)).join("")}</div>
      <div class="btn-row"><button class="btn gold" data-act="group">${card.water ? "💧 Log water" : "🍺 Log sips"}</button><button class="btn ghost" data-act="skip">Nobody / skip</button></div>`;
  }
}

function resolveCard(act) {
  const card = currentCard;
  if (!card) return;
  const pid = darePlayer;
  if (act === "dare-done") addEntries([{ pid, kind: "dare", name: "Dare", pts: card.pts }]);
  else if (act === "dare-chicken") {
    addEntries([{ pid, kind: "chicken", name: "Chickened out", pts: 0 }], { quiet: true });
    logSips([pid], card.sips, "Chicken penalty");
  } else if (act === "self") logSips([pid], card.sips, "Drink card");
  else if (act === "group") {
    const pids = [...document.querySelectorAll("#card-chips .chip.on")].map((c) => c.dataset.pid);
    if (pids.length) {
      if (card.water) {
        const water = drinkById["water"];
        addEntries(pids.map((id) => ({ pid: id, kind: "drink", drinkId: water.id, name: water.name, cat: water.cat, pts: water.pts, alc: false })));
      } else logSips(pids, card.sips, DECK_TYPES.find((d) => d.id === card.type).label);
    }
  }
  currentCard = null;
  $("#card-actions").innerHTML = "";
  advancePlayer();
}

function advancePlayer() {
  if (!state.players.length) return;
  const i = state.players.findIndex((p) => p.id === darePlayer);
  darePlayer = state.players[(i + 1) % state.players.length].id;
  renderDarePlayers();
}

// ---------- import ----------

function normalize(s) {
  return s.toLowerCase().replace(/['’]/g, "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

const ALIASES = {
  natty: "natural-light", "natty light": "natural-light", "nattylight": "natural-light", "bud lite": "bud-light", "miller light": "miller-lite",
  "coors lite": "coors-light", "michelob": "michelob-ultra", "ultra": "michelob-ultra", pbr: "pabst-blue-ribbon", "high life": "miller-high-life",
  modelo: "modelo-especial", corona: "corona-extra", claw: "white-claw", "white claws": "white-claw", loko: "four-loko", "4loko": "four-loko", "4 loko": "four-loko",
  "long island": "long-island-iced-tea", lit: "long-island-iced-tea", marg: "margarita", margs: "margarita", "spicy marg": "spicy-margarita",
  vodka: "vodka-shot", tequila: "tequila-shot", whiskey: "whiskey-shot", rum: "rum-shot", shot: "vodka-shot", jager: "jagermeister", "jager bomb": "jagerbomb",
  "car bomb": "irish-slammer-car-bomb", "irish car bomb": "irish-slammer-car-bomb", shotgun: "shotgun-a-beer", "beer bong": "beer-bong", borg: "borg",
  "jungle juice": "jungle-juice", wine: "red-wine-glass", "red wine": "red-wine-glass", "white wine": "white-wine-glass", rose: "rose-glass", "jello shot": "jell-o-shot",
  water: "water", "topo chico": "sparkling-water-topo-chico", "liquid iv": "liquid-i-v-electrolytes", gatorade: "gatorade", "kilt lifter": "four-peaks-kilt-lifter",
  ipa: "west-coast-ipa", "hazy": "hazy-ipa", beer: "bud-light", "light beer": "bud-light", seltzer: "white-claw", "twisted": "twisted-tea", "mikes": "mike-s-hard-lemonade",
  "vodka cranberry": "vodka-cran", "jack and coke": "jack-coke", "rum and coke": "rum-coke", "gin and tonic": "gin-tonic", "vodka redbull": "vodka-red-bull",
};

function matchDrink(text) {
  const q = normalize(text);
  if (!q) return null;
  if (ALIASES[q]) return drinkById[ALIASES[q]];
  let best = null, bestScore = 0;
  const qTokens = q.split(" ");
  for (const d of DRINKS) {
    const n = normalize(d.name);
    if (n === q) return d;
    let score = 0;
    if (n.startsWith(q)) score = 0.9;
    else if (n.includes(q)) score = 0.8;
    else {
      const nTokens = new Set(n.split(" "));
      const hits = qTokens.filter((t) => nTokens.has(t) || [...nTokens].some((nt) => nt.startsWith(t) && t.length >= 3)).length;
      score = (hits / qTokens.length) * 0.5 + (hits / nTokens.size) * 0.25;
    }
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return bestScore >= 0.45 ? best : null;
}

function parseImport(text) {
  const plan = [];
  for (const raw of text.split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^([^:]+?)\s*:\s*(.+)$/) || line.match(/^([^\-–]+?)\s+[\-–]\s+(.+)$/);
    if (!m) { plan.push({ error: `Couldn't read: “${line}” (use Name: drink, drink)` }); continue; }
    const name = m[1].trim();
    const items = [];
    for (let part of m[2].split(/[,;]/)) {
      part = part.trim();
      if (!part) continue;
      let qty = 1;
      const q = part.match(/^(\d+)\s*x?\s+(.+)$/i) || part.match(/^(.+?)\s*(?:x\s*(\d+)|\((\d+)\))$/i);
      if (q) {
        if (/^\d/.test(part)) { qty = parseInt(q[1], 10); part = q[2]; }
        else { qty = parseInt(q[2] || q[3], 10); part = q[1]; }
      }
      qty = Math.max(1, Math.min(qty, 50));
      const drink = matchDrink(part);
      items.push({ input: part, qty, drink: drink || { id: "custom-" + slugify(part), name: part, pts: 1, cat: "light", alc: true, custom: true } });
    }
    plan.push({ name, items });
  }
  return plan;
}

function renderImportPreview(plan) {
  const ok = plan.filter((r) => !r.error);
  $("#import-preview").innerHTML = plan.map((r) => r.error ? `<p class="import-error">${esc(r.error)}</p>` : `<div class="import-row">
      <b>${esc(r.name)}</b>${state.players.some((p) => p.name.toLowerCase() === r.name.toLowerCase()) ? "" : ' <span class="tag">new player</span>'}
      <ul>${r.items.map((it) => `<li>${it.qty}× ${esc(it.drink.name)} <em>${it.drink.custom ? "(not in list — 1 pt each)" : it.drink.name.toLowerCase() !== it.input.toLowerCase() ? `(from “${esc(it.input)}”)` : ""}</em> <b>+${it.qty * it.drink.pts}</b></li>`).join("")}</ul>
    </div>`).join("");
  $("#import-confirm-btn").disabled = !ok.length;
}

function applyImport(plan) {
  const entries = [];
  for (const r of plan) {
    if (r.error) continue;
    let p = state.players.find((x) => x.name.toLowerCase() === r.name.toLowerCase());
    if (!p) p = addPlayer(r.name, { silent: true });
    for (const it of r.items) for (let i = 0; i < it.qty; i++) {
      entries.push({ pid: p.id, kind: "drink", drinkId: it.drink.id, name: it.drink.name, cat: it.drink.cat, pts: it.drink.pts, alc: it.drink.alc });
    }
  }
  if (entries.length) {
    addEntries(entries, { quiet: true, celebrate: false });
    toast(`📥 Imported ${entries.length} drinks for ${new Set(entries.map((e) => e.pid)).size} Sun Devils`, { cls: "gold" });
    burst();
  }
}

// ---------- players ----------

function addPlayer(name, { silent = false } = {}) {
  name = name.trim().slice(0, 24);
  if (!name) return null;
  const used = new Set(state.players.map((p) => p.avatar));
  const avatar = AVATARS.find((a) => !used.has(a)) || AVATARS[state.players.length % AVATARS.length];
  const p = { id: uid(), name, avatar, createdAt: Date.now() };
  state.players.push(p);
  save();
  if (!silent) toast(`${avatar} <b>${esc(name)}</b> is back in Tempe!`);
  render();
  return p;
}

// ---------- modal / toasts / effects ----------

function openModal(html) {
  $("#modal-body").innerHTML = html;
  $("#modal").hidden = false;
}
function closeModal() { $("#modal").hidden = true; }

function showHistory(pid) {
  const p = player(pid);
  const s = statsFor(pid);
  const r = rankFor(s.points);
  const entries = state.log.filter((e) => e.pid === pid).reverse();
  openModal(`<div class="history-head"><span class="pc-avatar">${p.avatar}</span><div><h2>${esc(p.name)}</h2><p>${r.emoji} ${r.title} · <b>${s.points} pts</b></p></div></div>
    ${s.fav ? `<p class="hint">Drink of choice: <b>${esc(s.fav)}</b></p>` : ""}
    <div class="badge-strip">${BADGES.map((b) => `<span class="${s.badges.includes(b) ? "got" : ""}" title="${b.name}: ${b.desc}">${b.emoji}</span>`).join("")}</div>
    <ol class="feed">${entries.length ? entries.map((e) => `<li><span class="feed-text">${feedVerb(e)}</span><span class="feed-pts">${e.pts ? "+" + e.pts : ""}</span><span class="feed-time">${timeAgo(e.t)}</span><button class="icon-btn" data-remove="${e.id}" aria-label="Remove entry">✕</button></li>`).join("") : `<li class="hint">Clean record. For now.</li>`}</ol>`);
}

function pickAvatar(pid) {
  openModal(`<h2>Pick an avatar</h2><div class="avatar-grid">${AVATARS.map((a) => `<button class="avatar-btn" data-setavatar="${pid}" data-emoji="${a}">${a}</button>`).join("")}</div>`);
}

function listNames(names) {
  const b = names.map((n) => `<b>${n}</b>`);
  return b.length > 1 ? b.slice(0, -1).join(", ") + " & " + b[b.length - 1] : b[0];
}

function toast(html, { cls = "", ms = 3500, undo = null } = {}) {
  const box = $("#toasts");
  while (box.children.length >= 4) box.firstElementChild.remove();
  const t = document.createElement("div");
  t.className = "toast " + cls;
  t.innerHTML = `<span>${html}</span>`;
  if (undo) {
    const b = document.createElement("button");
    b.textContent = "Undo";
    b.onclick = () => { undo(); t.remove(); };
    t.appendChild(b);
  }
  box.appendChild(t);
  setTimeout(() => t.classList.add("out"), ms);
  setTimeout(() => t.remove(), ms + 400);
}

function burst() {
  const box = $("#burst");
  const bits = ["🔱", "🔥", "😈", "☀️", "🍺"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.textContent = bits[i % bits.length];
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = Math.random() * 0.3 + "s";
    s.style.fontSize = 18 + Math.random() * 22 + "px";
    box.appendChild(s);
    setTimeout(() => s.remove(), 1800);
  }
}

function scoreboardText() {
  const rows = standings();
  const lines = ["🔱 SUN DEVIL SIP-OFF — STANDINGS 🔱", ""];
  rows.forEach(({ p, s }, i) => {
    const r = rankFor(s.points);
    lines.push(`${["🥇", "🥈", "🥉"][i] || `#${i + 1}`} ${p.name} — ${s.points} pts (${s.drinks} drinks, ${s.waters} waters) · ${r.title}`);
  });
  lines.push("", "Forks up! 🤘");
  return lines.join("\n");
}

// ---------- events ----------

document.addEventListener("click", (ev) => {
  const t = ev.target.closest("button, [data-goto]");
  if (!t) {
    if (ev.target.closest("#dare-card") && !currentCard) drawCard();
    return;
  }
  const d = t.dataset;

  if (d.tab) return setTab(d.tab);
  if (d.goto) { closeModal(); return setTab(d.goto); }
  if (t.classList.contains("modal-close")) return closeModal();

  if (d.pid) {
    const parent = t.parentElement;
    if (parent.id === "log-players") {
      selectedLog.has(d.pid) ? selectedLog.delete(d.pid) : selectedLog.add(d.pid);
      t.classList.toggle("on");
    } else if (parent.id === "dare-players") {
      darePlayer = d.pid;
      renderDarePlayers();
      if (currentCard) showCard(currentCard);
    } else if (parent.id === "card-chips") {
      if (parent.dataset.mode === "one") parent.querySelectorAll(".chip").forEach((c) => c !== t && c.classList.remove("on"));
      t.classList.toggle("on");
    }
    return;
  }
  if (d.cat) { state.ui.cat = d.cat; save(); renderCatFilters(); renderDrinkGrid(); return; }
  if (d.rtag) { state.ui.recipeTag = d.rtag; save(); renderRecipeTags(); renderRecipes(); return; }
  if (d.recipelog) {
    // Jump to the drink on the Log tab so it's logged for whoever's selected there.
    state.ui.cat = "all";
    $("#drink-search").value = drinkById[d.recipelog].name;
    renderCatFilters();
    renderDrinkGrid();
    setTab("log");
    toast(selectedLog.size ? "Tap the drink to log it" : "Pick who's drinking, then tap the drink");
    return;
  }
  if (d.drink) { logDrink(drinkById[d.drink], [...selectedLog]); t.classList.add("pop"); setTimeout(() => t.classList.remove("pop"), 300); return; }
  if (d.quicklog) { selectedLog = new Set([d.quicklog]); setTab("log"); renderLogPlayers(); return; }
  if (d.water) return logDrink(drinkById["water"], [d.water]);
  if (d.details) return showHistory(d.details);
  if (d.remove) {
    state.log = state.log.filter((e) => e.id !== d.remove);
    save();
    render();
    if (!$("#modal").hidden) {
      const li = t.closest("li");
      if (li) li.remove();
    }
    return;
  }
  if (d.avatar) return pickAvatar(d.avatar);
  if (d.setavatar) { const p = player(d.setavatar); p.avatar = d.emoji; save(); closeModal(); render(); return; }
  if (d.delplayer) {
    const p = player(d.delplayer);
    if (confirm(`Remove ${p.name} and all their drinks${isLive() ? " for everyone" : ""}?`)) {
      state.players = state.players.filter((x) => x.id !== p.id);
      state.log = state.log.filter((e) => e.pid !== p.id);
      selectedLog.delete(p.id);
      save();
      render();
    }
    return;
  }
  if (d.deck) {
    const on = state.ui.deckTypes.includes(d.deck);
    state.ui.deckTypes = on ? state.ui.deckTypes.filter((x) => x !== d.deck) : [...state.ui.deckTypes, d.deck];
    save();
    refillDeck();
    return;
  }
  if (d.act) return resolveCard(d.act);
  
  switch (t.id) {
    case "log-select-all": {
      const all = state.players.every((p) => selectedLog.has(p.id));
      selectedLog = all ? new Set() : new Set(state.players.map((p) => p.id));
      renderLogPlayers();
      break;
    }
    case "draw-card": drawCard(); break;
    case "dare-random":
      if (state.players.length) {
        darePlayer = state.players[Math.floor(Math.random() * state.players.length)].id;
        renderDarePlayers();
        const who = player(darePlayer);
        toast(`🎲 Sparky picks… <b>${who.avatar} ${esc(who.name)}</b>!`, { cls: "gold" });
        if (currentCard) showCard(currentCard);
      }
      break;
    case "dare-next": advancePlayer(); if (currentCard) showCard(currentCard); break;
    case "share-board": {
      const text = scoreboardText();
      const done = () => toast("📋 Standings copied — paste it in the group chat");
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => openModal(`<h2>Copy this</h2><textarea class="input" rows="10">${esc(text)}</textarea>`));
      else openModal(`<h2>Copy this</h2><textarea class="input" rows="10">${esc(text)}</textarea>`);
      break;
    }
    case "import-preview-btn":
      importPlan = parseImport($("#import-text").value);
      renderImportPreview(importPlan);
      break;
    case "import-confirm-btn":
      if (!importPlan) importPlan = parseImport($("#import-text").value);
      applyImport(importPlan);
      importPlan = null;
      $("#import-text").value = "";
      $("#import-preview").innerHTML = "";
      t.disabled = true;
      break;
    case "export-btn": {
      const blob = new Blob([JSON.stringify({ app: "sun-devil-sip-off", version: 1, players: state.players, log: state.log, settings: state.settings }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sun-devil-sip-off-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      break;
    }
    case "reset-scores":
      if (confirm(`Wipe all drinks and points${isLive() ? " for EVERYONE in the live game" : ""} but keep the crew?`)) { state.log = []; save(); render(); toast("Scores reset. Fresh semester."); }
      break;
    case "reset-all":
      if (confirm(`Delete EVERYTHING — crew, drinks, points${isLive() ? " — for everyone in the live game" : ""}?`)) { state = freshState(); selectedLog.clear(); darePlayer = null; save(); render(); renderCatFilters(); renderDrinkGrid(); refillDeck(); toast("Everything wiped. Welcome to orientation."); }
      break;
  }
});

$("#modal").addEventListener("click", (ev) => { if (ev.target.id === "modal") closeModal(); });
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeModal(); });

$("#drink-search").addEventListener("input", renderDrinkGrid);
$("#recipe-search").addEventListener("input", renderRecipes);

$("#add-player").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const input = $("#player-name");
  const name = input.value.trim();
  if (state.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) { toast("That Sun Devil's already here", { cls: "maroon" }); return; }
  addPlayer(name);
  input.value = "";
  input.focus();
});

$("#custom-form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const name = $("#custom-name").value.trim();
  const pts = parseInt($("#custom-pts").value, 10);
  if (!name) return;
  logDrink({ id: "custom-" + slugify(name), name, pts, cat: "light", alc: true }, [...selectedLog]);
  if (selectedLog.size) $("#custom-name").value = "";
});

$("#crew-list").addEventListener("change", (ev) => {
  const id = ev.target.dataset.rename;
  if (!id) return;
  const name = ev.target.value.trim().slice(0, 24);
  if (name) { player(id).name = name; save(); render(); }
  else ev.target.value = player(id).name;
});

$("#hydrate-toggle").addEventListener("change", (ev) => { state.settings.hydrate = ev.target.checked; save(); });

$("#import-text").addEventListener("input", () => { importPlan = null; $("#import-confirm-btn").disabled = !$("#import-text").value.trim(); });

$("#import-file").addEventListener("change", async (ev) => {
  const file = ev.target.files[0];
  ev.target.value = "";
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.players) || !Array.isArray(data.log)) throw new Error("bad file");
    const merge = state.players.length && confirm("Merge with the current game? (Cancel = replace it)");
    if (merge) {
      const byName = new Map(state.players.map((p) => [p.name.toLowerCase(), p]));
      const idMap = {};
      for (const p of data.players) {
        let mine = byName.get(String(p.name).toLowerCase());
        if (!mine) { mine = { id: uid(), name: String(p.name).slice(0, 24), avatar: p.avatar || "🔱", createdAt: Date.now() }; state.players.push(mine); byName.set(mine.name.toLowerCase(), mine); }
        idMap[p.id] = mine.id;
      }
      const have = new Set(state.log.map((e) => e.id));
      for (const e of data.log) if (!have.has(e.id) && idMap[e.pid]) state.log.push({ ...e, pid: idMap[e.pid] });
      state.log.sort((a, b) => a.t - b.t);
    } else {
      state.players = data.players;
      state.log = data.log;
      if (data.settings) state.settings = Object.assign(state.settings, data.settings);
    }
    save();
    render();
    toast("⬆️ Game file loaded", { cls: "gold" });
  } catch (e) {
    toast("That doesn't look like a Sip-Off game file", { cls: "maroon" });
  }
});

// Keep relative times fresh.
setInterval(renderBoard, 60000);

// ---------- boot ----------

renderCatFilters();
renderDrinkGrid();
renderRecipeTags();
renderRecipes();
refillDeck();
render();
setTab(state.ui.tab || "board", { scroll: false });

// Live mode: sync.js takes over the sign-in gate. If Firebase can't even load, say so instead of hanging.
if (window.FIREBASE_CONFIG) {
  $("#gate").hidden = false;
  const s = document.createElement("script");
  s.type = "module";
  s.src = "js/sync.js";
  document.body.appendChild(s);
  setTimeout(() => {
    if (!window.Live) $("#gate .gate-body").innerHTML = location.protocol === "file:"
      ? `<p class="gate-msg">Live mode needs the hosted link, not a file opened from your phone.</p>`
      : `<p class="gate-msg">Couldn't load Firebase.</p><p class="hint">Check your connection and reload.</p>`;
  }, 10000);
}

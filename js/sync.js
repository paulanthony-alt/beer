// Live sync over Firebase. Every phone enters the crew password and shares one scoreboard.
// Under the hood the whole crew shares one Firebase email/password account, so Firebase
// checks the password (and throttles guessing), and firestore.rules only lets that account in.
// app.js keeps working on its local `state`; this module pushes whatever changed after
// each save() and pours remote changes back in. Players and log entries are one Firestore
// doc each, so two phones logging at the same time never overwrite each other.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator,
  collection, doc, onSnapshot, writeBatch,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const config = window.FIREBASE_CONFIG;
const gameId = window.GAME_ID || "tempe-reunion";
const crewEmail = window.CREW_EMAIL || "crew@sundevil-sipoff.app";

const gate = document.getElementById("gate");
const pill = document.getElementById("live-status");
const account = document.getElementById("account");

let db = null;
let user = null;
let unsubs = [];
let synced = null; // what Firestore last told us: { players: Map(id → json), log: Set(id) }
let ready = { players: false, log: false };

// Firestore hands fields back in its own order, so compare players with sorted keys.
const stable = (o) => JSON.stringify(Object.keys(o).sort().reduce((a, k) => ((a[k] = o[k]), a), {}));

window.Live = { active: false, push };

if (config) start();

function start() {
  const app = initializeApp(config);
  const auth = getAuth(app);
  db = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  // Local testing against `firebase emulators:start`: open the page on localhost with ?emulator
  if (["localhost", "127.0.0.1"].includes(location.hostname) && new URLSearchParams(location.search).has("emulator")) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }

  setPill("connecting");
  showGate(`<p class="gate-msg">Connecting to the crew…</p>`);

  onAuthStateChanged(auth, (u) => {
    stopListening();
    user = u;
    renderAccount(auth);
    if (!u) {
      setPill("signed-out");
      showGate(`<p class="gate-msg">Crew only. Enter the password.</p>
        <form id="gate-form" class="gate-form">
          <input class="input" id="gate-password" type="password" placeholder="Crew password" autocomplete="current-password" required>
          <button class="btn gold big" type="submit">Forks up 🔱</button>
          <p class="gate-error" id="gate-error" role="alert"></p>
        </form>`);
      const form = document.getElementById("gate-form");
      const input = document.getElementById("gate-password");
      input.focus();
      form.onsubmit = (ev) => {
        ev.preventDefault();
        const btn = form.querySelector("button");
        btn.disabled = true;
        signInWithEmailAndPassword(auth, crewEmail, input.value).catch((e) => {
          btn.disabled = false;
          input.select();
          const msg = {
            "auth/invalid-credential": "Wrong password. Forks down. 👎",
            "auth/wrong-password": "Wrong password. Forks down. 👎",
            "auth/invalid-login-credentials": "Wrong password. Forks down. 👎",
            "auth/too-many-requests": "Too many wrong guesses. Wait a few minutes and try again.",
            "auth/network-request-failed": "No connection. Find some Wi-Fi and try again.",
            "auth/user-not-found": "The crew account isn't set up yet. Check the README setup steps.",
          }[e.code] || `Couldn't sign in: ${e.message}`;
          document.getElementById("gate-error").textContent = msg;
        });
      };
      return;
    }
    listen(auth);
  });
}

function listen(auth) {
  showGate(`<p class="gate-msg">Loading the scoreboard…</p>`);
  synced = { players: new Map(), log: new Set() };
  ready = { players: false, log: false };
  const base = ["games", gameId];
  const onError = (e) => {
    stopListening();
    setPill("denied");
    if (e.code === "permission-denied") {
      showGate(`<p class="gate-msg">The password worked, but the database said no.</p>
        <p class="hint">The email in firestore.rules has to match CREW_EMAIL in js/firebase-config.js (${esc(crewEmail)}).</p>
        <button class="btn ghost" id="gate-signout">Sign out</button>`);
    } else {
      showGate(`<p class="gate-msg">Couldn't reach the scoreboard.</p><p class="hint">${esc(e.message)}</p>
        <button class="btn ghost" id="gate-signout">Sign out</button>`);
    }
    document.getElementById("gate-signout").onclick = () => signOut(auth);
  };

  unsubs.push(onSnapshot(collection(db, ...base, "players"), (snap) => {
    const players = snap.docs.map((d) => d.data()).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || a.name.localeCompare(b.name));
    synced.players = new Map(players.map((p) => [p.id, stable(p)]));
    ready.players = true;
    arrive(snap, "players", players);
  }, onError));

  unsubs.push(onSnapshot(collection(db, ...base, "log"), (snap) => {
    const log = snap.docs.map((d) => d.data()).sort((a, b) => a.t - b.t);
    synced.log = new Set(log.map((e) => e.id));
    ready.log = true;
    arrive(snap, "log", log);
  }, onError));
}

function arrive(snap, key, items) {
  if (!ready.players || !ready.log) {
    // Hold the first half until the other collection lands, so we never render half a game.
    arrive.pending = { ...arrive.pending, [key]: items };
    return;
  }
  const first = !window.Live.active;
  const pending = arrive.pending || {};
  arrive.pending = null;
  const remote = {
    players: key === "players" ? items : pending.players ?? state.players,
    log: key === "log" ? items : pending.log ?? state.log,
  };

  if (first) {
    window.Live.active = true;
    hideGate();
    // First phone online with an existing single-device game seeds the shared one.
    if (!remote.players.length && !remote.log.length && state.players.length && state.liveGame !== gameId) {
      state.liveGame = gameId;
      push(state);
      toast(`📡 Uploaded this phone's game to the live scoreboard`, { cls: "gold" });
      return;
    }
  }
  state.liveGame = gameId;
  applyRemote(remote.players, remote.log);
  setPill(snap.metadata.fromCache && !navigator.onLine ? "offline" : "live");
}

function push(s) {
  if (!window.Live.active || !synced) return;
  const base = ["games", gameId];
  const ops = [];
  s.players.forEach((p, i) => {
    if (!p.createdAt) p.createdAt = Date.now() + i;
    const json = stable(p);
    if (synced.players.get(p.id) !== json) { ops.push(["set", doc(db, ...base, "players", p.id), p]); synced.players.set(p.id, json); }
  });
  const livePlayers = new Set(s.players.map((p) => p.id));
  for (const id of [...synced.players.keys()]) if (!livePlayers.has(id)) { ops.push(["delete", doc(db, ...base, "players", id)]); synced.players.delete(id); }

  for (const e of s.log) if (!synced.log.has(e.id)) { ops.push(["set", doc(db, ...base, "log", e.id), e]); synced.log.add(e.id); }
  const liveLog = new Set(s.log.map((e) => e.id));
  for (const id of [...synced.log]) if (!liveLog.has(id)) { ops.push(["delete", doc(db, ...base, "log", id)]); synced.log.delete(id); }

  // Firestore batches cap at 500 writes; a full reset can be bigger than that.
  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(db);
    for (const [op, ref, data] of ops.slice(i, i + 400)) op === "set" ? batch.set(ref, data) : batch.delete(ref);
    batch.commit().catch((e) => toast(`⚠️ Didn't sync: ${esc(e.message)}`, { cls: "maroon", ms: 6000 }));
  }
}

function stopListening() {
  unsubs.forEach((u) => u());
  unsubs = [];
  window.Live.active = false;
  synced = null;
  arrive.pending = null;
}

function setPill(mode) {
  const labels = { connecting: "⏳ Connecting", live: "🟢 Live", offline: "📴 Offline — will sync", "signed-out": "🔒 Signed out", denied: "⛔ No access" };
  pill.hidden = false;
  pill.dataset.mode = mode;
  pill.textContent = labels[mode];
}

function showGate(html) {
  gate.querySelector(".gate-body").innerHTML = html;
  gate.hidden = false;
}

function hideGate() { gate.hidden = true; }

function renderAccount(auth) {
  account.hidden = false;
  account.innerHTML = user
    ? `<span>📡 Live game <b>${esc(gameId)}</b> · this phone is signed in</span><button class="btn ghost small" id="signout">Sign out</button>`
    : `<span>📡 Live game <b>${esc(gameId)}</b> · signed out</span>`;
  const b = document.getElementById("signout");
  if (b) b.onclick = () => signOut(auth);
}

window.addEventListener("online", () => window.Live.active && setPill("live"));
window.addEventListener("offline", () => window.Live.active && setPill("offline"));

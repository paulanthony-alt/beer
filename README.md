# 🔱 Sun Devil Sip-Off

An ASU-themed drink tracking party game for a Tempe reunion weekend. Forks up, bottoms up.

## Play it

No install, no build. Two ways to play:

- **One phone (default):** open `index.html` in any browser. Everything saves on that device. Pass it
  around as the official scorekeeper, or use **Crew → Export game file** / **Load game file** to move a game
  between phones.
- **Live (everyone's phone):** set up Firebase (below). Everyone opens the link, types the crew password
  once, and shares one scoreboard that updates instantly.

## Going live with Firebase (about 15 minutes, free)

Everything here fits in Firebase's free Spark plan, so no credit card is needed. A weekend with a dozen friends
uses a tiny fraction of the free daily limits.

1. **Create a project** at [console.firebase.google.com](https://console.firebase.google.com) → *Add project*.
   You can skip Google Analytics.
2. **Turn on passwords:** *Build → Authentication → Get started → Sign-in method → Email/Password → Enable*.
3. **Create the crew login:** *Authentication → Users → Add user*. Email: `crew@sundevil-sipoff.app` (it
   doesn't need to be a real inbox). Password: whatever the crew will type, at least 6 characters.
   *Optional:* under *Authentication → Settings → User actions*, untick **Enable create (sign-up)**.
4. **Create the database:** *Build → Firestore Database → Create database*. Pick a US West location and
   start in **production mode**.
5. **Lock it to the crew:** paste the whole of [`firestore.rules`](firestore.rules) into *Firestore → Rules* and hit
   **Publish**. It only lets the crew login in. The password isn't in this file, so it's safe to commit.
6. **Connect the app:** go to *Project settings (gear icon) → Your apps → Web (`</>`)*, register an app, and copy
   the `firebaseConfig` values into [`js/firebase-config.js`](js/firebase-config.js). Commit and push.
   (If you used a different crew email in step 3, change `CREW_EMAIL` there and the email in `firestore.rules`.)
7. **Host it for free**, using either option:
   - **GitHub Pages** (the repo must be public on a free GitHub plan): repo *Settings → Pages → Deploy from a
     branch → `main` / root*.
   - **Firebase Hosting** (works with a private repo): install Node, then run
     `npm i -g firebase-tools`, `firebase login`, `firebase use --add` (pick your project) and `firebase deploy`.
     Your link is `https://<project-id>.web.app`.
8. **Send the link and the password to the group chat.**

Good to know:
- Each phone asks for the password once and stays signed in. **Crew → Sign out** logs that phone out.
- Firebase checks the password and locks out repeated wrong guesses for a while.
- To change the password, delete the crew user in *Authentication → Users* and add it again with the new one.
  Everyone re-enters it on their next visit.
- If the first phone to go live already has a one-phone game on it, that game is uploaded as the starting
  scoreboard.
- Anyone with the password can log for anyone, undo entries and reset scores, which is the point of a group
  game. Resets ask for confirmation.
- Phones that lose signal keep working and sync when they're back online.
- To start a new game next year, change `GAME_ID` in `js/firebase-config.js`.

## What's in it

- **Scoreboard** — crew totals, a podium, and a card per player with tally marks, points, rank
  (Orientation Week → Freshman → … → Alumni Legend → Sparky Status), badges, and a play-by-play feed with undo.
- **Log Drinks** — 328 drinks across 10 categories (Light & Lager, Craft & IPA, Arizona Local, Seltzers & Malt,
  Wine & Bubbly, Shots, Cocktails, Party Classics, Sun Devil Specials, Hydration Station). Pick one or more
  players, tap a drink, done. Custom drinks supported.
- **Import** — paste what everyone's already had:
  ```
  Jake: Bud Light x3, Fireball, Long Island
  Maria: White Claw x2, water
  ```
  Fuzzy matching handles nicknames like `natty`, `loko`, `marg`, `jager bomb`. New names become new players.
- **Drink or Dare** — 155 cards: dares, drink cards, Never Have I Ever, Most Likely To, and ASU trivia.
  Do the dare for points or chicken out and drink. Toggle which decks are in play.
- **Badges** — Hat Trick, Hydration Homie, Local Legend, Traitor (drank a Tucson beer), Century Club, and more.

## Points

Roughly one point per standard drink, rounded up, plus hazard pay for the questionable stuff:

| Points | Tier | Examples |
| --- | --- | --- |
| 1 | Tempe Breeze | Bud Light, White Claw, Kilt Lifter, a glass of wine, water |
| 2 | Mill Ave Buzz | IPA, any shot, Margarita, Ranch Water, shotgun a beer |
| 3 | Spring Break | Double IPA, Jägerbomb, Jungle Juice, Beer Bong, Keg Stand |
| 4 | Frat Row | Long Island, Boot of Beer, Steel Reserve 24 oz, Sparky's Pitchfork |
| 5+ | Hellfire | Four Loko, Everclear, Fishbowl, BORG, Power Hour, Centurion |

Water and other hydration count for a point too, and the game nudges anyone who's had three drinks
without water. Nobody has to drink, and nobody drives.

## Files

- `index.html` — layout and the pitchfork header SVG
- `css/styles.css` — maroon & gold everything
- `js/drinks.js` — the drink catalog and point values (edit freely)
- `js/cards.js` — the Drink-or-Dare deck and trivia
- `js/app.js` — game logic, scoring, badges, import, persistence
- `js/sync.js` — live mode: crew password gate and Firestore sync (only loads when Firebase is configured)
- `js/firebase-config.js` — your Firebase project config, crew login email and game ID
- `firestore.rules` — only the crew login gets in
- `firebase.json` — for `firebase deploy` (hosting and rules)

_Unofficial fan-made party game. Not affiliated with or endorsed by Arizona State University._

# 🔱 Sun Devil Sip-Off

An ASU-themed drink tracking party game for a Tempe reunion weekend. Forks up, bottoms up.

## Play it

No install, no build. Two ways to play:

- **One phone (default):** open `index.html` in any browser. Everything saves on that device. Pass it
  around as the official scorekeeper, or use **Crew → Export game file** / **Load game file** to move a game
  between phones.
- **Live (everyone's phone):** set up Firebase (below). Everyone signs in with Google and shares one
  scoreboard that updates instantly. Only the emails you list can get in.

## Going live with Firebase (about 15 minutes, free)

1. **Create a project** at [console.firebase.google.com](https://console.firebase.google.com) → *Add project*.
   You can skip Google Analytics.
2. **Turn on Google sign-in:** *Build → Authentication → Get started → Sign-in method → Google → Enable*.
3. **Create the database:** *Build → Firestore Database → Create database*. Pick a US West location and
   start in **production mode**.
4. **Lock it to your crew:** open [`firestore.rules`](firestore.rules), replace the example emails with everyone's
   Google account emails, then paste the whole file into *Firestore → Rules* and hit **Publish**.
5. **Connect the app:** go to *Project settings (gear icon) → Your apps → Web (`</>`)*, register an app, and copy
   the `firebaseConfig` values into [`js/firebase-config.js`](js/firebase-config.js). Commit and push.
6. **Host it**, using either option:
   - **GitHub Pages** (the repo must be public on a free GitHub plan): repo *Settings → Pages → Deploy from a
     branch → `main` / root*. Then in Firebase go to *Authentication → Settings → Authorized domains* and add
     `paulanthony-alt.github.io`.
   - **Firebase Hosting** (works with a private repo): install Node, then run
     `npm i -g firebase-tools`, `firebase login`, `firebase use --add` (pick your project) and `firebase deploy`.
     Your link is `https://<project-id>.web.app`, and sign-in already works there.
7. **Send the link to the group chat.** Everyone taps *Sign in with Google*, and anyone not on the list sees a
   "not on the guest list" screen.

Good to know:
- To add someone mid-weekend, put their email in the rules, publish again, and have them reload.
- If the first phone to go live already has a one-phone game on it, that game is uploaded as the starting
  scoreboard.
- Anyone on the list can log for anyone, undo entries and reset scores, which is the point of a group game.
  Resets ask for confirmation.
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
- `js/sync.js` — live mode: Google sign-in and Firestore sync (only loads when Firebase is configured)
- `js/firebase-config.js` — your Firebase project config and game ID
- `firestore.rules` — who's allowed in
- `firebase.json` — for `firebase deploy` (hosting and rules)

_Unofficial fan-made party game. Not affiliated with or endorsed by Arizona State University._

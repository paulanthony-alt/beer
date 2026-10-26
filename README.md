# 🔱 Sun Devil Sip-Off

An ASU-themed drink tracking party game for a Tempe reunion weekend. Forks up, bottoms up.

## Play it

No install, no build. Either:

- Open `index.html` in any browser (phone or laptop), or
- Turn on GitHub Pages for this repo (Settings → Pages → deploy from `main` / root) and share the link with the crew.

Everything saves in the browser on that device. Pass one phone around as the official scorekeeper, or use
**Crew → Export game file** and **Load game file** to sync between phones (loading offers to merge).

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

_Unofficial fan-made party game. Not affiliated with or endorsed by Arizona State University._

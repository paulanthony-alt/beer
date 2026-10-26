// Shot recipes. `drink` must match a name in drinks.js so the card can show points and log it.
// Single shots are ~1½ oz total; "½ oz each" splits that three ways.

const RECIPE_TAGS = [
  { id: "classic", label: "Classics", emoji: "🥃" },
  { id: "dessert", label: "Dessert", emoji: "🍰" },
  { id: "layered", label: "Layered", emoji: "🌈" },
  { id: "bomb", label: "Bombs & Drops", emoji: "💣" },
  { id: "spicy", label: "Spicy & Weird", emoji: "🌶️" },
  { id: "batch", label: "Party Batches", emoji: "🎉" },
  { id: "house", label: "Sun Devil Specials", emoji: "🔱" },
];

const RECIPES = [
  // Classics
  { drink: "Tequila Shot", tag: "classic", ings: ["1½ oz tequila", "Salt", "Lime wedge"], steps: "Lick the salt, shoot the tequila, bite the lime. In that order." },
  { drink: "Green Tea Shot", tag: "classic", ings: ["½ oz Irish whiskey (Jameson)", "½ oz peach schnapps", "½ oz sour mix", "Splash of Sprite"], steps: "Shake the whiskey, schnapps and sour mix with ice, strain, top with Sprite." },
  { drink: "White Tea Shot", tag: "classic", ings: ["½ oz vodka", "½ oz peach schnapps", "½ oz sour mix", "Splash of Sprite"], steps: "Same as a Green Tea Shot with vodka instead of whiskey. Shake, strain, top with Sprite." },
  { drink: "Lemon Drop", tag: "classic", ings: ["1 oz citrus vodka", "½ oz lemon juice", "½ oz simple syrup", "Sugar for the rim"], steps: "Rim the glass with sugar. Shake everything else with ice and strain in." },
  { drink: "Kamikaze", tag: "classic", ings: ["½ oz vodka", "½ oz triple sec", "½ oz lime juice"], steps: "Shake with ice, strain." },
  { drink: "Washington Apple", tag: "classic", ings: ["½ oz Crown Royal", "½ oz sour apple schnapps", "½ oz cranberry juice"], steps: "Shake with ice, strain." },
  { drink: "Royal Flush", tag: "classic", ings: ["½ oz Crown Royal", "½ oz peach schnapps", "½ oz cranberry juice"], steps: "Shake with ice, strain." },
  { drink: "Red Snapper", tag: "classic", ings: ["½ oz Crown Royal", "½ oz amaretto", "½ oz cranberry juice"], steps: "Shake with ice, strain." },
  { drink: "Woo Woo", tag: "classic", ings: ["½ oz vodka", "½ oz peach schnapps", "½ oz cranberry juice"], steps: "Shake with ice, strain." },
  { drink: "Purple Hooter", tag: "classic", ings: ["½ oz vodka", "½ oz Chambord", "½ oz lime juice", "Splash of Sprite"], steps: "Shake the first three with ice, strain, top with Sprite." },
  { drink: "Alabama Slammer", tag: "classic", ings: ["½ oz Southern Comfort", "½ oz sloe gin", "½ oz amaretto", "Splash of orange juice"], steps: "Shake with ice, strain." },
  { drink: "Kool-Aid Shot", tag: "classic", ings: ["½ oz vodka", "½ oz amaretto", "½ oz Midori", "Splash of cranberry juice"], steps: "Shake with ice, strain. Tastes exactly like the name." },
  { drink: "Jolly Rancher Shot", tag: "classic", ings: ["½ oz vodka", "½ oz peach schnapps", "½ oz sour apple schnapps", "Splash of cranberry juice"], steps: "Shake with ice, strain." },
  { drink: "Scooby Snack", tag: "classic", ings: ["½ oz coconut rum", "½ oz Midori", "½ oz pineapple juice", "Splash of cream or half-and-half"], steps: "Shake hard with ice, strain." },
  { drink: "Surfer on Acid", tag: "classic", ings: ["½ oz Jägermeister", "½ oz coconut rum", "½ oz pineapple juice"], steps: "Shake with ice, strain." },
  { drink: "Pickleback", tag: "classic", ings: ["1½ oz Irish whiskey", "1½ oz pickle brine (separate glass)"], steps: "Shoot the whiskey, chase it with the brine. Weirdly perfect." },
  { drink: "Liquid Marijuana", tag: "classic", ings: ["¼ oz spiced rum", "¼ oz coconut rum", "¼ oz Midori", "¼ oz blue curaçao", "Splash each of pineapple juice and sour mix"], steps: "Shake with ice, strain. It's green. That's the joke." },
  { drink: "Three Wise Men", tag: "classic", ings: ["½ oz Jim Beam", "½ oz Jack Daniel's", "½ oz Johnnie Walker"], steps: "Pour all three into one glass. No ice, no mercy." },
  { drink: "Four Horsemen", tag: "classic", ings: ["½ oz Jim Beam", "½ oz Jack Daniel's", "½ oz Johnnie Walker", "½ oz Jose Cuervo"], steps: "All four into one glass. Shoot." },
  { drink: "Liquid Cocaine", tag: "classic", ings: ["½ oz Jägermeister", "½ oz Goldschläger", "½ oz Rumple Minze"], steps: "Chill everything first, then pour together and shoot." },

  // Dessert
  { drink: "Cinnamon Toast Crunch Shot", tag: "dessert", ings: ["1 oz RumChata", "½ oz Fireball", "Cinnamon sugar for the rim (optional)"], steps: "Shake with ice and strain into a cinnamon-sugar rimmed glass." },
  { drink: "Oatmeal Cookie Shot", tag: "dessert", ings: ["½ oz Baileys", "½ oz butterscotch schnapps", "¼ oz Jägermeister", "¼ oz cinnamon schnapps"], steps: "Shake with ice, strain. Somehow tastes like an actual cookie." },
  { drink: "Chocolate Cake Shot", tag: "dessert", ings: ["¾ oz Frangelico", "¾ oz citrus vodka", "Lemon wedge dipped in sugar"], steps: "Shake the liquor with ice and strain. Shoot it, then bite the sugared lemon. Chocolate cake, apparently." },
  { drink: "Birthday Cake Shot", tag: "dessert", ings: ["1 oz cake vodka", "½ oz white crème de cacao", "Splash of cream", "Whipped cream and sprinkles"], steps: "Shake with ice, strain, top with whipped cream and sprinkles." },
  { drink: "Pineapple Upside-Down Cake Shot", tag: "dessert", ings: ["¾ oz vanilla vodka", "¾ oz pineapple juice", "Few drops of grenadine"], steps: "Shake the vodka and juice with ice, strain, then drop grenadine in so it sinks." },

  // Layered — pour slowly over the back of a spoon so each layer floats on the one below
  { drink: "B-52", tag: "layered", ings: ["½ oz Kahlúa (bottom)", "½ oz Baileys (middle)", "½ oz Grand Marnier (top)"], steps: "Layer in order over the back of a spoon. Don't stir." },
  { drink: "Buttery Nipple", tag: "layered", ings: ["¾ oz butterscotch schnapps (bottom)", "¾ oz Baileys (top)"], steps: "Pour the schnapps, then float the Baileys over a spoon." },
  { drink: "Slippery Nipple", tag: "layered", ings: ["¾ oz sambuca (bottom)", "¾ oz Baileys (top)"], steps: "Pour the sambuca, then float the Baileys over a spoon." },
  { drink: "Baby Guinness", tag: "layered", ings: ["1 oz Kahlúa", "½ oz Baileys"], steps: "Pour the Kahlúa, float the Baileys on top. Looks like a tiny pint of Guinness." },
  { drink: "Duck Fart", tag: "layered", ings: ["½ oz Kahlúa (bottom)", "½ oz Baileys (middle)", "½ oz Crown Royal (top)"], steps: "Layer in order over the back of a spoon." },
  { drink: "Rattlesnake", tag: "layered", ings: ["½ oz Kahlúa (bottom)", "½ oz white crème de cacao (middle)", "½ oz Baileys (top)"], steps: "Layer in order over the back of a spoon." },
  { drink: "Mexican Flag", tag: "layered", ings: ["½ oz grenadine (bottom)", "½ oz green crème de menthe (middle)", "½ oz tequila (top)"], steps: "Layer in order over the back of a spoon. Red, green, white." },
  { drink: "Irish Flag", tag: "layered", ings: ["½ oz green crème de menthe (bottom)", "½ oz Baileys (middle)", "½ oz Grand Marnier (top)"], steps: "Layer in order over the back of a spoon. Green, white, orange." },
  { drink: "Bazooka Joe", tag: "layered", ings: ["½ oz blue curaçao (bottom)", "½ oz banana liqueur (middle)", "½ oz Baileys (top)"], steps: "Layer in order over the back of a spoon. Tastes like the gum." },
  { drink: "Mind Eraser", tag: "layered", ings: ["1 oz Kahlúa (bottom)", "1 oz vodka (middle)", "Splash of club soda (top)"], steps: "Layer in a rocks glass, drop in a straw, and suck the whole thing down in one go." },

  // Bombs & drops — the shot glass goes INTO the bigger drink
  { drink: "Jägerbomb", tag: "bomb", ings: ["1½ oz Jägermeister", "½ can Red Bull"], steps: "Pour the Red Bull in a pint glass, drop the Jäger shot in, chug." },
  { drink: "Vegas Bomb", tag: "bomb", ings: ["½ oz Crown Royal", "½ oz peach schnapps", "Splash of cranberry juice", "½ can Red Bull"], steps: "Shake the Crown, schnapps and cranberry into a shot glass, drop it into the Red Bull, chug." },
  { drink: "Skittle Bomb", tag: "bomb", ings: ["1 oz Cointreau", "½ can Red Bull"], steps: "Drop the Cointreau shot into the Red Bull. Tastes like Skittles. Really." },
  { drink: "Fire Bomb", tag: "bomb", ings: ["1½ oz Fireball", "½ can Red Bull"], steps: "Drop the Fireball shot into the Red Bull, chug." },
  { drink: "Cherry Bomb", tag: "bomb", ings: ["1 oz cherry vodka", "½ can Red Bull"], steps: "Drop the shot into the Red Bull, chug." },
  { drink: "Irish Slammer (Car Bomb)", tag: "bomb", ings: ["½ oz Baileys", "½ oz Jameson", "¾ pint Guinness"], steps: "Layer the Baileys and Jameson in a shot glass, drop it into the Guinness and chug before it curdles. You have about 5 seconds." },
  { drink: "Boilermaker", tag: "bomb", ings: ["1½ oz whiskey", "1 pint of beer"], steps: "Drop the shot into the beer and chug, or shoot it and chase with the beer." },
  { drink: "Sake Bomb", tag: "bomb", ings: ["1 oz sake", "½ pint light beer (Sapporo or Asahi)", "Chopsticks"], steps: "Rest the sake shot on chopsticks across the beer glass. Everyone yells \"Ichi, ni, san — SAKE BOMB!\", pounds the table till it drops, then chug." },
  { drink: "Lunchbox", tag: "bomb", ings: ["¾ oz amaretto", "½ pint light beer", "Splash of orange juice"], steps: "Fill a glass with beer and a splash of OJ, drop in the amaretto shot, chug." },
  { drink: "Tequila Slammer", tag: "bomb", ings: ["1 oz tequila", "1 oz Sprite or ginger ale"], steps: "Pour both into a shot glass, cover it with your palm, slam it on the table, and drink while it fizzes. A Tequila Popper is the same thing." },
  { drink: "Flaming Dr Pepper", tag: "bomb", ings: ["1 oz amaretto", "Float of high-proof rum", "½ pint light beer"], steps: "Float the rum on the amaretto and drop the shot into the beer. Lighting it is the classic move, but skip the fire once people are drunk. It tastes like Dr Pepper either way." },

  // Spicy & weird
  { drink: "Mexican Candy Shot", tag: "spicy", ings: ["1 oz tequila", "½ oz watermelon schnapps", "Dash of Valentina or Tapatío", "Tajín or chamoy for the rim"], steps: "Rim the glass, shake the rest with ice and strain. Tastes like a paleta." },
  { drink: "Prairie Fire", tag: "spicy", ings: ["1½ oz tequila", "3–5 dashes Tabasco"], steps: "Pour the tequila, add the Tabasco, shoot. More dashes, more pain." },
  { drink: "Mad Dog", tag: "spicy", ings: ["1 oz vodka", "½ oz raspberry syrup", "3 dashes Tabasco"], steps: "Pour the vodka, slowly add the syrup so it sinks, then the Tabasco. Polish bar classic." },
  { drink: "Brain Hemorrhage", tag: "spicy", ings: ["1 oz peach schnapps", "¼ oz Baileys", "Few drops of grenadine"], steps: "Pour the schnapps, gently float the Baileys so it clumps up like a brain, drip grenadine over it. Gross. Delicious." },
  { drink: "Cement Mixer", tag: "spicy", ings: ["¾ oz Baileys", "¾ oz lime juice"], steps: "Take both in your mouth and swish until it curdles. This one's a prank. Have a chaser ready." },
  { drink: "Oyster Shooter", tag: "spicy", ings: ["1 fresh oyster", "1 oz vodka", "1 tsp cocktail sauce", "Dash of hot sauce", "Squeeze of lemon"], steps: "Drop everything into a shot glass and shoot it all at once." },

  // Party batches
  { drink: "Jell-O Shot", tag: "batch", ings: ["1 box (3 oz) Jell-O", "1 cup boiling water", "½ cup cold water", "½ cup vodka", "2 oz plastic cups"], steps: "Stir the Jell-O into the boiling water until dissolved, add the cold water and vodka, pour into cups and chill 2–4 hours. Makes about 16." },
  { drink: "Pudding Shot", tag: "batch", ings: ["1 box (3.4 oz) instant pudding", "¾ cup milk", "¾ cup liqueur (Baileys, RumChata or flavored vodka)", "1 tub (8 oz) Cool Whip"], steps: "Whisk the pudding mix, milk and liqueur, fold in the Cool Whip, spoon into cups and freeze 1–2 hours. Makes about 20." },
  { drink: "Vodka Gummy Bears (handful)", tag: "batch", ings: ["1 bag gummy bears", "Vodka to just cover them"], steps: "Spread the bears in a shallow dish, pour vodka over to barely cover, and refrigerate 1–2 days, stirring once. They get big and sneaky strong." },
  { drink: "Shot Ski (one pull)", tag: "batch", ings: ["An old ski (or a long board)", "4–6 shot glasses glued on", "Your shot of choice"], steps: "Fill every glass, everyone grabs on, count to three and tip together. Spillage is part of it." },

  // Sun Devil Specials
  { drink: "Forks Up Fireball", tag: "house", ings: ["1½ oz Fireball"], steps: "Pour the shot. Hold Forks Up with your other hand the entire time. Drop the fork, take another." },
  { drink: "A Mountain Shot", tag: "house", ings: ["1½ oz tequila", "Lime wedge", "Gold sanding sugar"], steps: "Run the lime around the rim, dip it in gold sugar, pour the tequila. Maroon chaser optional." },
  { drink: "The Inferno", tag: "house", ings: ["1½ oz cinnamon whiskey", "2 dashes hot sauce"], steps: "Pour the whiskey, add the hot sauce, shoot it. Feels like Tempe in July." },
  { drink: "Sparky's Pitchfork", tag: "house", ings: ["½ oz Fireball", "½ oz Jägermeister", "½ can Red Bull"], steps: "Fireball and Jäger in one shot glass, drop it into the Red Bull, chug, then throw Forks Up." },
];

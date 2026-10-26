// Live mode: paste your Firebase web app config here (Firebase console → Project settings → Your apps).
// While this is null the game runs on a single device, saved in the browser.
// This config is not a secret — who can read and write is controlled by firestore.rules.
window.FIREBASE_CONFIG = null;

// Example:
// window.FIREBASE_CONFIG = {
//   apiKey: "AIza...",
//   authDomain: "sun-devil-sip-off.firebaseapp.com",
//   projectId: "sun-devil-sip-off",
//   storageBucket: "sun-devil-sip-off.appspot.com",
//   messagingSenderId: "1234567890",
//   appId: "1:1234567890:web:abc123",
// };

// The shared crew login. Create this user in Firebase (Authentication → Users → Add user) with the
// password you'll tell your friends. It doesn't need to be a real inbox. Must match firestore.rules.
window.CREW_EMAIL = "crew@sundevil-sipoff.app";

// Every phone with the same GAME_ID shares one scoreboard. Change it to start a fresh game next year.
window.GAME_ID = "tempe-reunion";

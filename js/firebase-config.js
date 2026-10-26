// Live mode: your Firebase web app config (Firebase console → Project settings → Your apps).
// Set this to null to play on a single device, saved in the browser.
// This config is not a secret — who can read and write is controlled by firestore.rules.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDdPGXif-BtqnpIDsusMn5DHzibMy-dGqU",
  authDomain: "beer-99ee1.firebaseapp.com",
  projectId: "beer-99ee1",
  storageBucket: "beer-99ee1.firebasestorage.app",
  messagingSenderId: "342577591766",
  appId: "1:342577591766:web:7c1d68a9d33d8f0a7ca077",
};

// The shared crew login. Create this user in Firebase (Authentication → Users → Add user) with the
// password you'll tell your friends. It doesn't need to be a real inbox. Must match firestore.rules.
window.CREW_EMAIL = "crew@sundevil-sipoff.app";

// Every phone with the same GAME_ID shares one scoreboard. Change it to start a fresh game next year.
window.GAME_ID = "tempe-reunion";

// Live mode: paste your Firebase web app config here (Firebase console → Project settings → Your apps).
// While this is null the game runs on a single device, saved in the browser.
// This config is not a secret — who can read and write is controlled by firestore.rules.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
// The shared crew login. Create this user in Firebase (Authentication → Users → Add user) with the
// password you'll tell your friends. It doesn't need to be a real inbox. Must match firestore.rules.
window.CREW_EMAIL = "crew@sundevil-sipoff.app";

// Every phone with the same GAME_ID shares one scoreboard. Change it to start a fresh game next year.
window.GAME_ID = "tempe-reunion";

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDzrOxTxbDZXkqKBkXEFRWJvjZMxwVXZKI",
  authDomain: "lapse-app-1.firebaseapp.com",
  projectId: "lapse-app-1",
  storageBucket: "lapse-app-1.appspot.com",
  messagingSenderId: "685052568523",
  appId: "1:685052568523:web:9f9f9f9f9f9f9f9f9f9f9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add calendar scope to Google provider
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

export { auth, googleProvider };

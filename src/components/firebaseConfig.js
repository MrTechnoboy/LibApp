//imports
import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';

//config
const firebaseConfig = {
    apiKey: "AIzaSyAmuXcilN6arwp37sLrZthqJCiLsY_YiGo",
    authDomain: "wechat-9f9f8.firebaseapp.com",
    databaseURL: "https://wechat-9f9f8-default-rtdb.firebaseio.com",
    projectId: "wechat-9f9f8",
    storageBucket: "wechat-9f9f8.firebasestorage.app",
    messagingSenderId: "929007397178",
    appId: "1:929007397178:web:02effc2fbc6f2380d5c803",
    measurementId: "G-DB0JJEYNV0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Export
export { db, auth };
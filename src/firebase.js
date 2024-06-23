import firebase from 'firebase';

const firebaseConfig = firebase.initializeApp({
    apiKey: "AIzaSyBGAE3xwk4bOP5crndYQSoopEvVb9BoMII",
    authDomain: "cabeleleiro-1f718.firebaseapp.com",
    projectId: "cabeleleiro-1f718",
    storageBucket: "cabeleleiro-1f718.appspot.com",
    messagingSenderId: "683325114798",
    appId: "1:683325114798:web:50717a7a88ab3e6834203f"
});

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const functions = firebase.functions();

export { db, auth, storage, functions };
import firebase from "firebase/app";
import "firebase/functions";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7fXQhli5MtM1d1RAQfNytLR8WLOogKxA",
  authDomain: "to-brick-clone.firebaseapp.com",
  databaseURL: "https://to-brick-clone.firebaseio.com",
  projectId: "to-brick-clone",
  storageBucket: "to-brick-clone.appspot.com",
  messagingSenderId: "669212999817",
  appId: "1:669212999817:web:2391a39f4275d418b4c658",
  measurementId: "G-YSLVEZBEKY",
};

firebase.initializeApp(firebaseConfig);

export const functions = firebase.functions();
export const storage = firebase.storage();
export default firebase;

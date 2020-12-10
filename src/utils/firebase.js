import firebase from "firebase/app";
import "firebase/auth";
window.firebase = firebase;

const firebaseConfig = {
  apiKey: "AIzaSyC4Mni8wooOc8UXo_SUazQQi_02Z-YzBPI",
  authDomain: "foodhub-294508.firebaseapp.com",
};

let Auth, AuthUIConfig, AuthUI;

if (!window.localStorage.getItem("jwt")) {
  firebase.initializeApp(firebaseConfig);

  Auth = firebase.auth();
  AuthUIConfig = {
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
    ],
  };
  AuthUI = new window.firebaseui.auth.AuthUI(Auth);
} else {
  Auth = { currentUser: { uid: "worker" } };
}

export { AuthUI, Auth, AuthUIConfig };

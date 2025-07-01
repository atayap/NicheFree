import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9jIBj5bkxo8e_SewIsfNyhEcoUs7Cq6A",
  authDomain: "freeai-5aff0.firebaseapp.com",
  projectId: "freeai-5aff0",
  storageBucket: "freeai-5aff0.firebasestorage.app",
  messagingSenderId: "774918057319",
  appId: "1:774918057319:web:227b0f72c175fea11753c2",
  measurementId: "G-G3CHE2S42W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

document.getElementById("loginBtn").addEventListener("click", () => {
  signInWithPopup(auth, provider);
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("userInfo");
  const genBtn = document.getElementById("generateBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    userInfo.textContent = `Halo, ${user.displayName}`;
    genBtn.disabled = false;
    logoutBtn.style.display = "inline-block";
  } else {
    userInfo.textContent = "";
    genBtn.disabled = true;
    logoutBtn.style.display = "none";
  }
});

export { auth };

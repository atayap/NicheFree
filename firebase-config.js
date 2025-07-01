import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// Hapus onAuthStateChanged dari import di sini, karena akan ditangani di script.js
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

// Event listener untuk tombol Login
document.getElementById("loginBtn").addEventListener("click", () => {
  signInWithPopup(auth, provider);
});

// Event listener untuk tombol Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth);
});

// HAPUS BLOK onAuthStateChanged DARI SINI
// Logika onAuthStateChanged akan sepenuhnya ditangani di script.js
/*
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("userInfo");
  const genBtn = document.getElementById("generateBtn"); // Ini ID lama yang menyebabkan error
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
*/

export { auth }; // Ekspor objek auth agar bisa digunakan di script.js

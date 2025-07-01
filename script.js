// script.js
// Pastikan onAuthStateChanged diimport dari firebase-auth
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; // Pastikan baris ini ada!

let count = 0;
let lastReset = new Date().toDateString();

// Elemen UI
const featureMenu = document.getElementById("featureMenu");
console.log("featureMenu element:", featureMenu); // Debugging log
const nicheFinderSection = document.getElementById("nicheFinderSection");
console.log("nicheFinderSection element:", nicheFinderSection); // Debugging log
const shortsScheduleSection = document.getElementById("shortsScheduleSection");
console.log("shortsScheduleSection element:", shortsScheduleSection); // Debugging log
const contentIdeasSection = document.getElementById("contentIdeasSection");
console.log("contentIdeasSection element:", contentIdeasSection); // Debugging log
const loginBtn = document.getElementById("loginBtn");
console.log("loginBtn element:", loginBtn); // Debugging log
const logoutBtn = document.getElementById("logoutBtn");
console.log("logoutBtn element:", logoutBtn); // Debugging log
const userInfo = document.getElementById("userInfo");
console.log("userInfo element:", userInfo); // Debugging log
const limitInfo = document.getElementById("limitInfo");
console.log("limitInfo element:", limitInfo); // Debugging log
const loader = document.getElementById("loader");
console.log("loader element:", loader); // Debugging log
const outputContainer = document.getElementById("outputContainer");
console.log("outputContainer element:", outputContainer); // Debugging log
const resultText = document.getElementById("resultText");
console.log("resultText element:", resultText); // Debugging log

// Tombol Fitur
const nicheFinderBtn = document.getElementById("nicheFinderBtn");
console.log("nicheFinderBtn element:", nicheFinderBtn); // Debugging log
const shortsScheduleBtn = document.getElementById("shortsScheduleBtn");
console.log("shortsScheduleBtn element:", shortsScheduleBtn); // Debugging log
const contentIdeasBtn = document.getElementById("contentIdeasBtn");
console.log("contentIdeasBtn element:", contentIdeasBtn); // Debugging log

// Input per fitur
const nicheInput = document.getElementById("nicheInput");
console.log("nicheInput element:", nicheInput); // Debugging log
const scheduleInput = document.getElementById("scheduleInput");
console.log("scheduleInput element:", scheduleInput); // Debugging log
const ideasInput = document.getElementById("ideasInput");
console.log("ideasInput element:", ideasInput); // Debugging log


// Event Listener untuk Dark Mode
document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.documentElement.setAttribute("data-theme", e.target.checked ? "dark" : "light");
});

// Fungsi untuk mereset limit harian
function resetLimitIfNeeded() {
  const today = new Date().toDateString();
  if (lastReset !== today) {
    count = 0;
    lastReset = today;
  }
}

// Fungsi untuk menampilkan bagian fitur tertentu dan menyembunyikan yang lain
function showFeatureSection(sectionToShow) {
    console.log("showFeatureSection called with:", sectionToShow ? sectionToShow.id : "null"); // Debugging log
    // Sembunyikan semua section fitur
    if (nicheFinderSection) nicheFinderSection.style.display = "none";
    if (shortsScheduleSection) shortsScheduleSection.style.display = "none";
    if (contentIdeasSection) contentIdeasSection.style.display = "none";
    if (outputContainer) outputContainer.style.display = "none"; // Sembunyikan hasil saat berpindah fitur
    if (resultText) resultText.textContent = ""; // Kosongkan hasil
    if (limitInfo) limitInfo.textContent = ""; // Kosongkan info limit saat berpindah fitur

    // Tampilkan section yang dipilih
    if (sectionToShow) {
        sectionToShow.style.display = "block";
        console.log(sectionToShow.id + " display set to block."); // Debugging log
    }
    // Update status tombol Generate pada section yang baru ditampilkan
    updateGenerateButtonState();
}

// Event Listeners untuk tombol fitur
// Pastikan tombol-tombol ini ada di index.html dengan ID yang sesuai
if (nicheFinderBtn) {
    nicheFinderBtn.addEventListener("click", () => showFeatureSection(nicheFinderSection));
}
if (shortsScheduleBtn) {
    shortsScheduleBtn.addEventListener("click", () => showFeatureSection(shortsScheduleSection));
}
if (contentIdeasBtn) {
    contentIdeasBtn.addEventListener("click", () => showFeatureSection(contentIdeasSection));
}


// Fungsi untuk mengupdate status tombol Generate (enable/disable)
function updateGenerateButtonState() {
    const isUserLoggedIn = auth.currentUser;
    console.log("updateGenerateButtonState called. User logged in:", isUserLoggedIn); // Debugging log
    // Pastikan elemen tombol ada sebelum mencoba mengakses properti disabled
    if (document.getElementById("generateNicheBtn")) {
        document.getElementById("generateNicheBtn").disabled = !isUserLoggedIn;
    }
    if (document.getElementById("generateScheduleBtn")) {
        document.getElementById("generateScheduleBtn").disabled = !isUserLoggedIn;
    }
    if (document.getElementById("generateIdeasBtn")) {
        document.getElementById("generateIdeasBtn").disabled = !isUserLoggedIn;
    }
}

// Event Listener untuk Auth State (dari firebase-config.js)
// Ini adalah bagian kunci yang akan menampilkan menu setelah login
onAuthStateChanged(auth, (user) => {
  console.log("onAuthStateChanged fired. User object:", user); // Debugging log
  if (user) {
    userInfo.textContent = `Halo, ${user.displayName}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    
    // Pastikan featureMenu ada sebelum mencoba mengubah display
    if (featureMenu) {
        featureMenu.style.display = "block"; // Tampilkan menu fitur setelah login
        console.log("featureMenu display set to block."); // Debugging log
        showFeatureSection(nicheFinderSection); // Tampilkan fitur pencari niche secara default
    } else {
        console.error("featureMenu element not found!"); // Debugging log
    }
  } else {
    userInfo.textContent = "";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    
    // Pastikan featureMenu ada sebelum mencoba mengubah display
    if (featureMenu) {
        featureMenu.style.display = "none"; // Sembunyikan menu fitur jika belum login
    }
    showFeatureSection(null); // Sembunyikan semua fitur
    outputContainer.style.display = "none"; // Sembunyikan hasil
  }
  updateGenerateButtonState(); // Update status tombol generate setelah auth state berubah
});

// Fungsi utama generateText, sekarang menerima parameter 'feature'
window.generateFeature = async function (feature) {
  console.log("generateFeature called for:", feature); // Debugging log
  resetLimitIfNeeded();

  let userInput = "";
  let promptText = "";
  let currentInputElem = null; // Elemen input yang sedang aktif

  // Tentukan input dan prompt berdasarkan fitur yang dipilih
  if (feature === 'nicheFinder') {
    currentInputElem = nicheInput;
    userInput = nicheInput.value.trim();
    promptText = `Temukan niche viral berdasarkan topik ini: ${userInput}. Berikan beberapa ide niche yang spesifik, target audiens, dan potensi monetisasi singkat untuk setiap niche. Format sebagai daftar poin yang mudah dibaca.`;
  } else if (feature === 'shortsSchedule') {
    currentInputElem = scheduleInput;
    userInput = scheduleInput.value.trim();
    promptText = `Buatkan jadwal upload YouTube Shorts untuk 30 hari ke depan dengan konsisten, berdasarkan niche atau topik: ${userInput}. Sertakan ide topik singkat untuk setiap hari. Format jadwal harian.`;
  } else if (feature === 'contentIdeas') {
    currentInputElem = ideasInput;
    userInput = ideasInput.value.trim();
    promptText = `Berikan ide konten YouTube Shorts selama 30 hari untuk niche atau topik: ${userInput}. Untuk setiap hari, sertakan:
    - Judul video yang menarik dan singkat
    - Deskripsi singkat (2-3 kalimat)
    - 5-10 hashtag yang relevan
    - 3-5 tag kunci video
    Format sebagai daftar harian yang jelas.`;
  }

  if (count >= 5) {
    limitInfo.textContent = "⚠️ Anda sudah mencapai limit 5x hari ini.";
    return;
  }

  if (!userInput) {
    alert("Masukkan teks untuk fitur ini terlebih dahulu.");
    return;
  }

  // Tampilkan loader
  loader.style.display = "block";
  outputContainer.style.display = "none";
  resultText.textContent = "";
  limitInfo.textContent = ""; // Kosongkan info limit sementara saat loading

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userInput: promptText // Kirim prompt yang sudah disesuaikan ke serverless function
      })
    });

    const data = await response.json();

    if (response.ok) {
        resultText.textContent = data?.choices?.[0]?.message?.content || "Gagal mendapatkan hasil.";
        count++;
        limitInfo.textContent = `Generate hari ini: ${count}/5`;
    } else {
        resultText.textContent = data.message || "Gagal mendapatkan hasil dari AI.";
        console.error("API Error:", data);
        limitInfo.textContent = "Terjadi kesalahan saat mendapatkan hasil."; // Tampilkan pesan error di limitInfo juga
    }

  } catch (error) {
    resultText.textContent = "Terjadi kesalahan saat menghubungi server.";
    console.error("Network or fetch error:", error);
    limitInfo.textContent = "Terjadi kesalahan koneksi."; // Tampilkan pesan error di limitInfo juga
  } finally {
    loader.style.display = "none";
    outputContainer.style.display = "block";
  }
};

window.copyText = function () {
  const text = document.getElementById("resultText").textContent;
  navigator.clipboard.writeText(text);
  alert("Teks disalin!");
};

// Initial state on load
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired."); // Debugging log
    resetLimitIfNeeded();
    // Login state handled by onAuthStateChanged, which will call showFeatureSection
    // So no need to call showFeatureSection here directly, it's handled by Firebase auth check
});

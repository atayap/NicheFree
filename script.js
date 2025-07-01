// script.js
import { auth } from "./firebase-config.js";

let count = 0;
let lastReset = new Date().toDateString();

// Elemen UI
const featureMenu = document.getElementById("featureMenu");
const nicheFinderSection = document.getElementById("nicheFinderSection");
const shortsScheduleSection = document.getElementById("shortsScheduleSection");
const contentIdeasSection = document.getElementById("contentIdeasSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const limitInfo = document.getElementById("limitInfo");
const loader = document.getElementById("loader");
const outputContainer = document.getElementById("outputContainer");
const resultText = document.getElementById("resultText");

// Tombol Fitur
const nicheFinderBtn = document.getElementById("nicheFinderBtn");
const shortsScheduleBtn = document.getElementById("shortsScheduleBtn");
const contentIdeasBtn = document.getElementById("contentIdeasBtn");

// Input per fitur
const nicheInput = document.getElementById("nicheInput");
const scheduleInput = document.getElementById("scheduleInput");
const ideasInput = document.getElementById("ideasInput");

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
    // Sembunyikan semua section fitur
    nicheFinderSection.style.display = "none";
    shortsScheduleSection.style.display = "none";
    contentIdeasSection.style.display = "none";
    outputContainer.style.display = "none"; // Sembunyikan hasil saat berpindah fitur
    resultText.textContent = ""; // Kosongkan hasil
    limitInfo.textContent = ""; // Kosongkan info limit saat berpindah fitur

    // Tampilkan section yang dipilih
    if (sectionToShow) {
        sectionToShow.style.display = "block";
    }
    // Update status tombol Generate pada section yang baru ditampilkan
    updateGenerateButtonState();
}

// Event Listeners untuk tombol fitur
nicheFinderBtn.addEventListener("click", () => showFeatureSection(nicheFinderSection));
shortsScheduleBtn.addEventListener("click", () => showFeatureSection(shortsScheduleSection));
contentIdeasBtn.addEventListener("click", () => showFeatureSection(contentIdeasSection));

// Fungsi untuk mengupdate status tombol Generate (enable/disable)
function updateGenerateButtonState() {
    const isUserLoggedIn = auth.currentUser;
    document.getElementById("generateNicheBtn").disabled = !isUserLoggedIn;
    document.getElementById("generateScheduleBtn").disabled = !isUserLoggedIn;
    document.getElementById("generateIdeasBtn").disabled = !isUserLoggedIn;
}

// Event Listener untuk Auth State (dari firebase-config.js)
onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.textContent = `Halo, ${user.displayName}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    featureMenu.style.display = "block"; // Tampilkan menu fitur setelah login
    showFeatureSection(nicheFinderSection); // Tampilkan fitur pencari niche secara default
  } else {
    userInfo.textContent = "";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    featureMenu.style.display = "none"; // Sembunyikan menu fitur jika belum login
    showFeatureSection(null); // Sembunyikan semua fitur
    outputContainer.style.display = "none"; // Sembunyikan hasil
  }
  updateGenerateButtonState(); // Update status tombol generate setelah auth state berubah
});

// Fungsi utama generateText, sekarang menerima parameter 'feature'
window.generateFeature = async function (feature) {
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
    resetLimitIfNeeded();
    // Login state handled by onAuthStateChanged, which will call showFeatureSection
    // So no need to call showFeatureSection here directly, it's handled by Firebase auth check
});

// script.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let count = 0;
let lastReset = new Date().toDateString();

// Fungsi untuk menampilkan section fitur
function showFeature(featureName) {
  // Sembunyikan semua section
  document.querySelectorAll('.feature-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Tampilkan section yang dipilih
  document.getElementById(`${featureName}Section`).style.display = 'block';
  
  // Sembunyikan feature grid
  document.getElementById('featureMenu').style.display = 'none';
  
  // Sembunyikan output container jika terbuka
  document.getElementById('outputContainer').style.display = 'none';
}

// Fungsi untuk kembali ke menu utama
function backToMenu() {
  // Sembunyikan semua section
  document.querySelectorAll('.feature-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Tampilkan feature grid
  document.getElementById('featureMenu').style.display = 'block';
  
  // Sembunyikan output container
  document.getElementById('outputContainer').style.display = 'none';
}

// Event listener untuk card fitur
document.addEventListener('DOMContentLoaded', function() {
  // Tambahkan event listener untuk setiap card fitur
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', function() {
      const feature = this.getAttribute('data-feature');
      showFeature(feature);
    });
  });
  
  // Tambahkan event listener untuk tombol kembali
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', backToMenu);
  });
});

// Fungsi untuk mereset limit harian
function resetLimitIfNeeded() {
  const today = new Date().toDateString();
  if (lastReset !== today) {
    count = 0;
    lastReset = today;
  }
}

// Fungsi untuk mengupdate status tombol Generate
function updateGenerateButtonState() {
  const isUserLoggedIn = auth.currentUser;
  ['nicheFinder', 'shortsSchedule', 'contentIdeas'].forEach(feature => {
    const btn = document.getElementById(`generate${feature.charAt(0).toUpperCase() + feature.slice(1)}Btn`);
    if (btn) btn.disabled = !isUserLoggedIn;
  });
}

// Event Listener untuk Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('userInfo').textContent = `Halo, ${user.displayName}`;
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('featureMenu').style.display = 'block';
  } else {
    document.getElementById('userInfo').textContent = '';
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('featureMenu').style.display = 'none';
    backToMenu();
  }
  updateGenerateButtonState();
});

// Fungsi utama generateText
window.generateFeature = async function (feature) {
  resetLimitIfNeeded();

  let userInput = "";
  let promptText = "";

  if (feature === 'nicheFinder') {
    userInput = document.getElementById('nicheInput').value.trim();
    promptText = `Temukan niche viral berdasarkan topik ini: ${userInput}. Berikan beberapa ide niche yang spesifik...`;
  } else if (feature === 'shortsSchedule') {
    userInput = document.getElementById('scheduleInput').value.trim();
    promptText = `Buatkan jadwal upload YouTube Shorts untuk 30 hari ke depan...`;
  } else if (feature === 'contentIdeas') {
    userInput = document.getElementById('ideasInput').value.trim();
    promptText = `Berikan ide konten YouTube Shorts selama 30 hari untuk niche atau topik: ${userInput}...`;
  }

  if (count >= 5) {
    document.getElementById('limitInfo').textContent = "⚠️ Anda sudah mencapai limit 5x hari ini.";
    return;
  }

  if (!userInput) {
    alert("Masukkan teks untuk fitur ini terlebih dahulu.");
    return;
  }

  const loader = document.getElementById('loader');
  const outputContainer = document.getElementById('outputContainer');
  const resultText = document.getElementById('resultText');

  loader.style.display = 'block';
  outputContainer.style.display = 'none';
  resultText.textContent = '';

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userInput: promptText
      })
    });

    const data = await response.json();

    if (response.ok) {
      resultText.textContent = data?.choices?.[0]?.message?.content || "Gagal mendapatkan hasil.";
      count++;
      document.getElementById('limitInfo').textContent = `Generate hari ini: ${count}/5`;
    } else {
      resultText.textContent = data.message || "Gagal mendapatkan hasil dari AI.";
    }
  } catch (error) {
    resultText.textContent = "Terjadi kesalahan saat menghubungi server.";
  } finally {
    loader.style.display = 'none';
    outputContainer.style.display = 'block';
  }
};

window.copyText = function () {
  const text = document.getElementById("resultText").textContent;
  navigator.clipboard.writeText(text);
  alert("Teks disalin!");
};

// Initial state
document.addEventListener("DOMContentLoaded", () => {
  resetLimitIfNeeded();
});
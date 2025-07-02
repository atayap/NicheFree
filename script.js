import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let count = 0;
let lastReset = new Date().toDateString();

function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.checked = savedTheme === 'dark';

  themeToggle.addEventListener('change', (e) => {
    const theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
}

function showFeature(featureName) {
  document.querySelectorAll('.feature-section').forEach(section => {
    section.style.display = 'none';
  });

  document.getElementById(`${featureName}Section`).style.display = 'block';
  document.getElementById('featureMenu').style.display = 'none';
  document.getElementById('outputContainer').style.display = 'none';
}

function backToMenu() {
  document.querySelectorAll('.feature-section').forEach(section => {
    section.style.display = 'none';
  });

  document.getElementById('featureMenu').style.display = 'block';
  document.getElementById('outputContainer').style.display = 'none';
}

function setupFeatureCards() {
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', function () {
      const feature = this.getAttribute('data-feature');
      showFeature(feature);
    });
  });

  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', backToMenu);
  });
}

function resetLimitIfNeeded() {
  const today = new Date().toDateString();
  if (lastReset !== today) {
    count = 0;
    lastReset = today;
  }
}

function updateGenerateButtonState() {
  const isUserLoggedIn = auth.currentUser;
  ['nicheFinder', 'shortsSchedule', 'contentIdeas'].forEach(feature => {
    const btn = document.getElementById(`generate${feature.charAt(0).toUpperCase() + feature.slice(1)}Btn`);
    if (btn) btn.disabled = !isUserLoggedIn;
  });
}

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

window.generateFeature = async function (feature) {
  resetLimitIfNeeded();

  let userInput = "";
  let promptText = "";

  if (feature === 'nicheFinder') {
    userInput = document.getElementById('nicheInput').value.trim();
    promptText = `
Kamu adalah AI profesional yang membantu konten kreator YouTube Shorts.
Berdasarkan topik berikut ini, berikan beberapa niche viral dan spesifik yang sedang tren di tahun 2025.

Pastikan niche tersebut cocok untuk video pendek (15–60 detik) dan memiliki potensi views tinggi.

Topik dari user:
${userInput}
`.trim();
  } else if (feature === 'shortsSchedule') {
    userInput = document.getElementById('scheduleInput').value.trim();
    promptText = `
TANGGAL SAAT INI ADALAH 2 JULI 2025.

Kamu adalah AI profesional pembuat konten.
Tolong bantu saya membuat **jadwal upload YouTube Shorts** yang realistis.

Saya hanya bisa upload **2 kali per minggu**, dan saya **bekerja dari jam 6 pagi sampai jam 8 malam, Senin sampai Jumat**. Jadi saya hanya punya waktu luang di malam hari atau di hari Sabtu dan Minggu.

Buatkan jadwal selama 4 minggu ke depan, sebutkan tanggal dan waktu upload-nya, lalu berikan ide video singkat per hari.

Topik tambahan dari user:
${userInput}
`.trim();
  } else if (feature === 'contentIdeas') {
    userInput = document.getElementById('ideasInput').value.trim();
    promptText = `
Kamu adalah AI kreatif yang membantu membuat konten YouTube Shorts.

Berikan 30 ide konten pendek untuk niche berikut: "${userInput}".

Setiap ide harus berisi:
1. Judul pendek
2. Konsep isi video (1–2 kalimat)
3. Gaya video (narasi, motivasi, tips, dll)

Fokus pada format yang cocok untuk video pendek berdurasi 15–60 detik.
`.trim();
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
    console.log("Response dari API:", data); // Debugging

    if (response.ok) {
      const cleanText = data?.choices?.[0]?.message?.content?.replace(/\*\*/g, '').trim();
      resultText.textContent = cleanText || "Gagal mendapatkan hasil.";
      count++;
      document.getElementById('limitInfo').textContent = `Generate hari ini: ${count}/5`;
    } else {
      resultText.textContent = data.message || "Gagal mendapatkan hasil dari AI.";
    }
  } catch (error) {
    resultText.textContent = "Terjadi kesalahan saat menghubungi server.";
    console.error(error);
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

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupFeatureCards();
  resetLimitIfNeeded();
});

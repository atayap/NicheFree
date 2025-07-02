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
    promptText = `Temukan niche viral berdasarkan topik ini: ${userInput}. Berikan beberapa ide niche yang spesifik dan sedang tren.`;
  } else if (feature === 'shortsSchedule') {
    userInput = document.getElementById('scheduleInput').value.trim();
    promptText = `Buatkan jadwal upload YouTube Shorts untuk 30 hari ke depan berdasarkan topik: ${userInput}. Berikan tanggal dan ide singkat setiap harinya.`;
  } else if (feature === 'contentIdeas') {
    userInput = document.getElementById('ideasInput').value.trim();
    promptText = `Berikan ide konten YouTube Shorts selama 30 hari untuk niche atau topik: ${userInput}. Sertakan judul pendek dan konsepnya.`;
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

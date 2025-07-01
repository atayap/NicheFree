// script.js
import { auth } from "./firebase-config.js";

let count = 0;
let lastReset = new Date().toDateString();

document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.documentElement.setAttribute("data-theme", e.target.checked ? "dark" : "light");
});

function resetLimitIfNeeded() {
  const today = new Date().toDateString();
  if (lastReset !== today) {
    count = 0;
    lastReset = today;
  }
}

window.generateText = async function () {
  resetLimitIfNeeded();

  const outputContainer = document.getElementById("outputContainer");
  const resultText = document.getElementById("resultText");
  const input = document.getElementById("userInput").value.trim();
  const limitInfo = document.getElementById("limitInfo");
  const loader = document.getElementById("loader");

  if (count >= 5) {
    limitInfo.textContent = "⚠️ Anda sudah mencapai limit 5x hari ini.";
    return;
  }

  if (!input) {
    alert("Masukkan teks terlebih dahulu.");
    return;
  }

  // Tampilkan loader
  loader.style.display = "block";
  outputContainer.style.display = "none";
  resultText.textContent = "";

  try {
    // Panggil endpoint API Anda di Vercel, bukan langsung OpenRouter
    const response = await fetch("/api/generate", { // <--- UBAH DI SINI!
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userInput: input // Kirim input pengguna ke serverless function
      })
    });

    const data = await response.json();

    // Tangani jika ada error dari serverless function atau OpenRouter
    if (response.ok) { // Jika respons OK (status 200-299)
        resultText.textContent = data?.choices?.[0]?.message?.content || "Gagal mendapatkan hasil.";
        count++;
        limitInfo.textContent = `Generate hari ini: ${count}/5`;
    } else {
        resultText.textContent = data.message || "Gagal mendapatkan hasil dari AI.";
        console.error("API Error:", data);
    }

  } catch (error) {
    resultText.textContent = "Terjadi kesalahan saat menghubungi server.";
    console.error("Network or fetch error:", error);
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
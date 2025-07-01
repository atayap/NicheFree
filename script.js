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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: "Kamu adalah AI yang membantu membuat teks menarik dan profesional."
          },
          {
            role: "user",
            content: input
          }
        ]
      })
    });

    const data = await response.json();
    resultText.textContent = data?.choices?.[0]?.message?.content || "Gagal mendapatkan hasil.";
    count++;
    limitInfo.textContent = `Generate hari ini: ${count}/5`;

  } catch (error) {
    resultText.textContent = "Terjadi kesalahan saat menghubungi AI.";
    console.error(error);
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

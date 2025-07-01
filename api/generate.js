// api/generate.js
import fetch from 'node-fetch'; // Perlu install node-fetch jika belum ada: npm install node-fetch

export default async function handler(req, res) {
  // Pastikan metode permintaan adalah POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Pastikan ada input dari body permintaan
  const { userInput } = req.body;
  if (!userInput) {
    return res.status(400).json({ message: 'User input is required' });
  }

  // Ambil API Key dari environment variable Vercel
  // PASTIKAN ANDA MENAMBAHKAN INI DI PENGATURAN PROJECT VERCEL ANDA!
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ message: 'Server configuration error: API Key not set.' });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`, // Menggunakan environment variable
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
            content: userInput
          }
        ]
      })
    });

    const data = await response.json();

    // Teruskan respons dari OpenRouter kembali ke frontend
    res.status(response.status).json(data);

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server saat menghubungi AI." });
  }
}
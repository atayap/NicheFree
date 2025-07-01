// api/generate.js

// Cara 1: Gunakan fetch global Node.js (Node 18+). Ini adalah yang paling bersih jika Vercel mendukungnya.
// const fetch = require('node-fetch'); // Hapus baris ini jika Node.js Vercel sudah punya fetch global

// Jika Anda ingin memastikan menggunakan node-fetch, cara terbaik adalah dengan dynamic import
// atau pastikan package.json Anda disetel ke "type": "module" dan tidak ada require di mana pun.

// Mari kita coba cara yang paling kompatibel dan direkomendasikan Vercel:
// Menggunakan fetch global Node.js (sejak Node.js 18)
// Atau pastikan Anda menginstal "node-fetch" dan mengimpornya dengan benar

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userInput } = req.body;
  if (!userInput) {
    return res.status(400).json({ message: 'User input is required' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set in environment variables.");
      return res.status(500).json({ message: 'Server configuration error: API Key not set.' });
  }

  try {
    // Gunakan fetch. Perlu dicatat, di Node.js 18 ke atas, fetch sudah global.
    // Jika Vercel menggunakan Node 22 (seperti yang terlihat di screenshot Resources Anda),
    // seharusnya Anda tidak perlu 'import fetch from "node-fetch";' sama sekali.
    // Kita bisa coba hapus baris import node-fetch untuk melihat apakah itu solusinya.

    // Untuk memastikan, kita bisa tetap menggunakan import, tapi pastikan tidak ada konflik.
    // Paling aman adalah pastikan package.json TIDAK memiliki "type": "module"
    // dan Anda menggunakan `const fetch = require('node-fetch');` jika Anda ingin menggunakannya.

    // Namun, error log Anda menunjukkan masalah dengan `import`.
    // Coba **hapus baris import node-fetch** dari api/generate.js:
    // HAPUS: import fetch from 'node-fetch';
    // Karena Node 22 sudah memiliki fetch bawaan.

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
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
    res.status(response.status).json(data);

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server saat menghubungi AI." });
  }
}
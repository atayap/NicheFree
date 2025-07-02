// api/generate.js

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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-3n-e4b-it:free",
        messages: [
          {
            role: "system",
            content: "Kamu adalah AI dari model Google Gemma yang memberikan jawaban profesional dan relevan terhadap pertanyaan pengguna."
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

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userInput } = req.body;
  if (!userInput) {
    return res.status(400).json({ message: 'User input is required' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set");
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
        model: "meta-llama/llama-4-maverick",
        messages: [
          { role: "system", content: "Kamu adalah AI profesional yang membantu membuat konten dan jadwal YouTube Shorts secara kreatif dan detail." },
          { role: "user", content: userInput }
        ],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server saat menghubungi AI." });
  }
};

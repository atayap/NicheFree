// api/generate.js

// Fungsi handler untuk menangani permintaan API.
// Ini akan menerima input dari frontend dan memanggil API OpenRouter.
export default async function handler(req, res) {
  // Memastikan metode permintaan adalah POST.
  // Ini penting untuk keamanan dan memastikan endpoint hanya digunakan sesuai tujuan.
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Mengambil userInput dari body permintaan.
  // userInput ini akan berisi prompt yang sudah disesuaikan dari frontend (script.js).
  const { userInput } = req.body;

  // Memvalidasi apakah userInput tidak kosong.
  // Jika kosong, kembalikan error 400 Bad Request.
  if (!userInput) {
    return res.status(400).json({ message: 'User input is required' });
  }

  // Mengambil API Key OpenRouter dari environment variables Vercel.
  // Ini adalah cara yang aman untuk menyimpan kredensial sensitif.
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  // Memeriksa apakah API Key telah disetel.
  // Jika tidak, kembalikan error 500 Internal Server Error.
  if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set in environment variables.");
      return res.status(500).json({ message: 'Server configuration error: API Key not set.' });
  }

  try {
    // Melakukan panggilan ke API OpenRouter.
    // Karena Vercel menggunakan Node.js 18+ (saat ini Node 22),
    // fungsi `fetch` sudah tersedia secara global, jadi tidak perlu import `node-fetch`.
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST", // Metode POST untuk mengirim data
      headers: {
        // Header otentikasi menggunakan API Key.
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        // Menentukan tipe konten sebagai JSON.
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Model AI yang akan digunakan (mistralai/mistral-7b-instruct:free).
        "model": "google/gemma-3n-e4b-it:free",
        messages: [
          {
            // System prompt untuk mengarahkan perilaku AI.
            // Ini disesuaikan agar AI fokus pada konten kreator YouTube Shorts.
            role: "system",
            content: "Kamu adalah AI yang membantu membuat teks menarik dan profesional untuk konten kreator YouTube Shorts."
          },
          {
            // Pesan dari pengguna, yang berisi prompt spesifik fitur dari frontend.
            role: "user",
            content: userInput
          }
        ]
      })
    });

    // Mengurai respons dari API menjadi JSON.
    const data = await response.json();

    // Mengirimkan status dan data respons dari OpenRouter kembali ke frontend.
    res.status(response.status).json(data);

  } catch (error) {
    // Menangani kesalahan yang terjadi selama panggilan API.
    console.error("Error calling OpenRouter API:", error);
    // Mengembalikan error 500 Internal Server Error ke frontend.
    res.status(500).json({ message: "Terjadi kesalahan pada server saat menghubungi AI." });
  }
}

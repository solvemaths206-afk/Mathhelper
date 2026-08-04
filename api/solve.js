module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Solve this math problem step by step:\n\n${question}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini Response:");
    console.log(JSON.stringify(data, null, 2));

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No answer returned.";

    res.status(200).json({ answer });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

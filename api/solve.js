module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, image } = req.body;

    const parts = [];

    if (question) {
      parts.push({
        text: `Solve this math problem step by step:\n\n${question}`
      });
    }

    if (image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image
        }
      });

      parts.push({
        text: "Read the math question from this image and solve it step by step."
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      answer: answer || "No answer returned."
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};

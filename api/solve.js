module.exports = async function handler(req, res) {
 res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") {
  return res.status(200).end();
}
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, image, mode, grade, subject } = req.body;
console.log("Subject:", subject);
console.log("Grade:", grade);
   let prompt = "";

switch (mode) {
  case "exam":
    prompt = "Solve exactly as in an exam. Show concise steps.";
    break;

  case "quick":
    prompt = "Give only the final answer with a short explanation.";
    break;

  case "practice":
    prompt = "Solve the question, then generate 3 similar practice questions.";
    break;

  default:
    prompt = "Explain like a friendly teacher with clear step-by-step explanations.";
}
    const parts = [];

    if (question) {
      parts.push({
        text: `You are teaching a ${grade} student.
The subject is ${subject}.
${prompt}

Answer this ${subject} question for a ${grade} student.

Follow this instruction:
${prompt}

Question:

${question}`
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
        text: `You are an expert math teacher.

Read the math problem from the uploaded image.

Format your answer exactly like this:

📝 Question

📖 Step 1

📖 Step 2

📖 Step 3

✅ Final Answer

Explain in simple English.`
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

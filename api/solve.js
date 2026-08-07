module.exports = async function handler(req, res) {
  // CORS Headers
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
    const {
      question,
      image,
      mode,
      grade,
      subject,
      studentName,
      followUpQuestion,
      lastAnswer
    } = req.body;

    console.log("Subject:", subject);
    console.log("Grade:", grade);

    const parts = [];

    // 1. Follow-up Question Prompt
    if (followUpQuestion && lastAnswer) {
      parts.push({
        text: `You are an expert ${subject || "Math"} teacher.
Teach a ${grade || "Student"} student.

This was your previous answer:
${lastAnswer}

The student is now asking this follow-up question:
${followUpQuestion}

Answer only the follow-up question in very simple English with step-by-step clarity.`
      });
    } else {
      // 2. Mode Selection Prompt
      let modePrompt = "";
      switch (mode) {
        case "exam":
          modePrompt = "Solve exactly as in an exam. Show concise steps.";
          break;
        case "quick":
          modePrompt = "Give only the final answer with a short explanation.";
          break;
        case "practice":
          modePrompt = "Solve the question, then generate 3 similar practice questions.";
          break;
        default:
          modePrompt = "Explain like a friendly teacher with clear step-by-step explanations.";
      }

      // 3. Image Handling
      if (image) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: image
          }
        });
      }

      // 4. Main Question Prompt
      const mainPromptText = `You are an expert ${subject || "Math"} teacher.
${studentName ? `The student's name is ${studentName}. Greet them once at the beginning.` : ""}
Teach a ${grade || "Student"} student.

${modePrompt}

Use clear and simple English.
Explain every step clearly and keep each step concise.
Assume the student is learning this topic for the first time.

${question ? `Question: ${question}` : "Read and solve the problem present in the uploaded image."}

Format your answer clearly using LaTeX for formulas ($equation$) and structured headings:

📝 Question
📖 Step 1
📖 Step 2
📖 Step 3
✅ Final Answer
💡 Easy Tip`;

      parts.push({ text: mainPromptText });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      answer: answer || "No answer returned."
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};

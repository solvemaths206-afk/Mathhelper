const button = document.getElementById("solveBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const pdfBtn = document.getElementById("pdfBtn");
const askBtn = document.getElementById("askBtn");

const answer = document.getElementById("answer");
const textarea = document.getElementById("questionInput");

const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");

const mode = document.getElementById("mode");
const grade = document.getElementById("grade");
const subject = document.getElementById("subject");
const studentName = document.getElementById("studentName");
const followUp = document.getElementById("followUp");

const historyBtn = document.getElementById("historyBtn");
const historyBox = document.getElementById("historyBox");

// Image Preview
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    previewImage.src = URL.createObjectURL(file);
    previewContainer.style.display = "block";
});

// Helper Function: Format Markdown Bold & Line Breaks
function formatAIResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}

// Solve Main Question
button.addEventListener("click", async () => {
    const question = textarea.value.trim();
    const file = imageInput.files[0];

    if (!question && !file) {
        answer.innerHTML = "Please enter a question or upload an image.";
        return;
    }

    const startTime = Date.now();

    answer.innerHTML = `
        <div class="loader"></div>
        <p style="text-align:center;">🤖 AI is analyzing your question...</p>
    `;

    let image = null;
    if (file) {
        image = await toBase64(file);
    }

    try {
        const response = await fetch(
            "https://mathhelper-rose.vercel.app/api/solve",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question,
                    image,
                    mode: mode.value,
                    grade: grade.value,
                    subject: subject.value,
                    studentName: studentName.value
                })
            }
        );

        const data = await response.json();

        if (data.answer) {
            const endTime = Date.now();

            const history = JSON.parse(localStorage.getItem("mathHistory")) || [];

            history.unshift({
                question: question || "📷 Image Problem",
                answer: data.answer,
                time: new Date().toLocaleString()
            });

            localStorage.setItem(
                "mathHistory",
                JSON.stringify(history.slice(0, 20))
            );

            localStorage.setItem("lastAnswer", data.answer);

            answer.innerHTML =
                formatAIResponse(data.answer) +
                `<br><br><small>⚡ Solved in ${((endTime - startTime) / 1000).toFixed(2)} seconds</small>`;

            if (window.renderMathInElement) {
                renderMathInElement(answer, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false }
                    ],
                    throwOnError: false
                });
            }

        } else {
            if (data.error?.code === 429) {
                answer.innerHTML = "⚠️ Daily AI limit reached. Please try again later.";
            } else {
                answer.innerHTML = "❌ " + (data.error?.message || "Unknown error");
            }
        }

    } catch (err) {
        answer.innerHTML = "❌ " + err.message;
    }
});

// Convert Image File to Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Toggle History Box
historyBtn.addEventListener("click", () => {
    const history = JSON.parse(localStorage.getItem("mathHistory")) || [];

    historyBox.innerHTML = "";

    if (history.length === 0) {
        historyBox.innerHTML = "<p>No history available.</p>";
    } else {
        history.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "history-item";
            itemDiv.innerHTML = `<strong>${item.question}</strong><br><small>${item.time}</small>`;
            
            // Click to reload question
            itemDiv.addEventListener("click", () => {
                textarea.value = item.question.includes("📷") ? "" : item.question;
                answer.innerHTML = formatAIResponse(item.answer);
                if (window.renderMathInElement) {
                    renderMathInElement(answer, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "$", right: "$", display: false }
                        ],
                        throwOnError: false
                    });
                }
            });

            historyBox.appendChild(itemDiv);
        });
    }

    historyBox.style.display = historyBox.style.display === "none" ? "block" : "none";
});

// Clear Inputs & Output
clearBtn.addEventListener("click", () => {
    textarea.value = "";
    imageInput.value = "";
    followUp.value = "";

    previewContainer.style.display = "none";
    previewImage.src = "";

    answer.innerHTML = "Your step-by-step solution will appear here...";
});

// Copy Answer Text
copyBtn.addEventListener("click", async () => {
    const text = answer.innerText.trim();

    if (!text) {
        alert("No answer to copy.");
        return;
    }

    await navigator.clipboard.writeText(text);

    copyBtn.innerText = "✅ Copied!";
    setTimeout(() => {
        copyBtn.innerText = "📋 Copy Answer";
    }, 2000);
});

// Ask Follow-Up Question
askBtn.addEventListener("click", async () => {
    const lastAnswer = localStorage.getItem("lastAnswer");

    if (!followUp.value.trim()) {
        alert("Please type a follow-up question.");
        return;
    }

    if (!lastAnswer) {
        alert("Please solve a question first.");
        return;
    }

    const followUpQuestion = followUp.value.trim();

    answer.innerHTML += `<hr style="margin:20px 0;"><p><strong>💬 Your Question:</strong> ${followUpQuestion}</p>`;
    answer.innerHTML += `<p>🤖 AI is thinking...</p>`;

    try {
        const response = await fetch(
            "https://mathhelper-rose.vercel.app/api/solve",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    followUpQuestion,
                    lastAnswer,
                    subject: subject.value,
                    grade: grade.value
                })
            }
        );

        const data = await response.json();

        if (data.answer) {
            answer.innerHTML += `
                <hr style="margin:20px 0;">
                <p><strong>🤖 AI Reply:</strong></p>
                ${formatAIResponse(data.answer)}
            `;

            if (window.renderMathInElement) {
                renderMathInElement(answer, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false }
                    ],
                    throwOnError: false
                });
            }

            followUp.value = ""; // Clear input after asking

        } else {
            answer.innerHTML += `<p>❌ ${data.error?.message || "Unable to answer."}</p>`;
        }

    } catch (err) {
        answer.innerHTML += `<p>❌ ${err.message}</p>`;
    }
});

// Download Solution as PDF
pdfBtn.addEventListener("click", () => {
    const text = answer.innerText.trim();

    if (!text) {
        alert("No answer to download.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 15, 20);

    doc.save("MathHelper-Solution.pdf");
});
        
// Function to insert math symbols into textarea at cursor position
function insertMath(symbol) {
    const input = document.getElementById('questionInput');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;

    // Insert symbol at cursor position
    input.value = text.substring(0, start) + symbol + text.substring(end);

    // Move cursor right after the inserted symbol
    input.selectionStart = input.selectionEnd = start + symbol.length;
    input.focus();
}

const button = document.getElementById("solveBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const pdfBtn = document.getElementById("pdfBtn");
const answer = document.getElementById("answer");
const textarea = document.querySelector("textarea");
const imageInput = document.getElementById("imageInput");
const mode = document.getElementById("mode");
const grade = document.getElementById("grade");
const subject = document.getElementById("subject");
const studentName = document.getElementById("studentName");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    previewImage.src = URL.createObjectURL(file);
    previewContainer.style.display = "block";

});
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
<p>🤖 AI is analyzing your question...</p>
`;

    let image = null;

    if (file) {
        image = await toBase64(file);
    }

    try {

        const response = await fetch("https://mathhelper-rose.vercel.app/api/solve", {
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
        });

        const data = await response.json();

        if (data.answer) {
          const history = JSON.parse(localStorage.getItem("mathHistory")) || [];

history.unshift({
    question,
    answer: data.answer,
    time: new Date().toLocaleString()
});

localStorage.setItem("mathHistory", JSON.stringify(history.slice(0, 20))); 
       answer.innerHTML =
    data.answer.replace(/\n/g, "<br>") +
    `<br><br><small>⚡ Solved in ${((endTime - startTime) / 1000).toFixed(2)} seconds</small>`; 

          const endTime = Date.now();
            renderMathInElement(answer, {
    delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
    ],
    throwOnError: false
});
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

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result.split(",")[1]);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}
const historyBtn = document.getElementById("historyBtn");
const historyBox = document.getElementById("historyBox");

historyBtn.addEventListener("click", () => {

    const history = JSON.parse(localStorage.getItem("mathHistory")) || [];

    historyBox.innerHTML = "";

    history.forEach(item => {

        historyBox.innerHTML += `
        <div class="history-item">
            <strong>${item.question}</strong><br>
            <small>${item.time}</small>
        </div>`;
    });

    historyBox.style.display =
        historyBox.style.display === "none"
        ? "block"
        : "none";
});
clearBtn.addEventListener("click", () => {

    textarea.value = "";
    imageInput.value = "";

    previewContainer.style.display = "none";
    previewImage.src = "";

    answer.innerHTML = "Your step-by-step solution will appear here...";
});
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

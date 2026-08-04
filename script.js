const button = document.getElementById("solveBtn");
const answer = document.getElementById("answer");
const textarea = document.querySelector("textarea");
const imageInput = document.getElementById("imageInput");

button.addEventListener("click", async () => {

    const question = textarea.value.trim();
    const file = imageInput.files[0];

    if (!question && !file) {
        answer.innerHTML = "Please enter a question or upload an image.";
        return;
    }

    answer.innerHTML = "🤖 AI is analyzing...";

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
                image
            })
        });

        const data = await response.json();

        if (data.answer) {
            answer.innerHTML = data.answer.replace(/\n/g, "<br>");
        } else {
            answer.innerHTML = "❌ " + (data.error || "Unknown error");
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

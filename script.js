const button = document.querySelector("button");
const answer = document.getElementById("answer");
const textarea = document.querySelector("textarea");

button.addEventListener("click", async () => {

    const question = textarea.value.trim();

    if (!question) {
        answer.innerHTML = "Please enter a math question.";
        return;
    }

    answer.innerHTML = "🤖 AI is thinking...";

    try {

        const response = await fetch("https://mathhelper-rose.vercel.app/api/solve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question
            })
        });

        const data = await response.json();

        if (data.answer) {
            answer.innerHTML = data.answer.replace(/\n/g, "<br>");
        } else {
            answer.innerHTML = "❌ No answer received.";
        }

    } catch (error) {
        answer.innerHTML = "❌ Error connecting to AI.";
    }

});

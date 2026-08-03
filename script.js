const button = document.querySelector("button");
const answer = document.getElementById("answer");

button.addEventListener("click", () => {

    const question = document.querySelector("textarea").value;

    if(question.trim() === ""){
        answer.innerHTML = "Please enter a math question.";
        return;
    }

    answer.innerHTML = "🤖 AI is thinking...";
});
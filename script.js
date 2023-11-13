function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

let currentQuestionIndex = 0;
let questions = [];
let score = 0;

async function initQuiz() {
    try {
        questions = await fetch('./questions.json').then(res => res.json());
    } catch (err) {
        console.error(err);
        return;
    }

    document.getElementById("score").classList.add("hidden");
    document.getElementById("start").classList.add("hidden");
    document.getElementById("question").classList.remove("hidden");
    shuffleArray(questions);
    updateQuestion(questions[currentQuestionIndex]);
}

function updateQuestion(question) {
    document.getElementById("question").innerHTML = question.question;

    const buttons = document.querySelectorAll('.fadeIn');
    buttons.forEach(button => {
        button.classList.add("hidden");
        button.style.opacity = '0';
        button.style.animation = 'none';
    });

    setTimeout(() => {
        buttons.forEach((button, index) => {
            button.classList.remove("hidden");
            button.innerHTML = question.options[index];
            button.classList.remove("dbl", "btn-error", "btn-success");
            button.style.animation = `fadeIn 0.5s ease-out ${index * 0.12}s forwards`;
        });
    }, 50);
}

function disableButtons(disable) {
    for (let i = 0; i < 4; i++) {
        document.getElementById(`answer${i + 1}`).classList.toggle("dbl", disable);
    }
}

function resetButtons() {
    for (let i = 0; i < 4; i++) {
        document.getElementById(`answer${i + 1}`).className = "btn fadeIn";
    }
}

function handleAnswerClick(event) {
    if (event.target.classList.contains("dbl")) return;

    const selectedAnswerIndex = parseInt(event.target.id.slice(-1)) - 1;
    const isCorrect = questions[currentQuestionIndex].correct_answer === questions[currentQuestionIndex].options[selectedAnswerIndex];

    console.log(isCorrect ? "Correct" : "False");

    disableButtons(true);
    event.target.classList.add(isCorrect ? "btn-success" : "btn-error");

    if (!isCorrect) {
        const correctAnswerIndex = questions[currentQuestionIndex].options.indexOf(questions[currentQuestionIndex].correct_answer);
        document.getElementById(`answer${correctAnswerIndex + 1}`).classList.add("btn-success");
    }

    setTimeout(() => {
        if (currentQuestionIndex === questions.length - 1) {
            completeQuiz();
            return;
        }
        resetButtons();
        currentQuestionIndex++;
        updateQuestion(questions[currentQuestionIndex]);
    }, 2000);
}

function completeQuiz() {
    document.getElementById("score").textContent = `Score: ${score}`;
    document.getElementById("start").textContent = "Start again";
    document.getElementById("score").classList.remove("hidden");
    document.getElementById("question").classList.add("hidden");
    resetButtons();
    document.querySelectorAll('.btn').forEach(btn => btn.classList.add("hidden"));
    document.getElementById("start").classList.remove("hidden");
    currentQuestionIndex = 0;
    questions = [];
    score = 0;
}


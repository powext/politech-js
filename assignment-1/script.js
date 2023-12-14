function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

let currQuestionIndex = 0;
let questions = [];
let guessed = 0;
let answerState = [false, false, false, false]
let startTime = undefined;

async function initQuiz(event) {
    const id = event.target.id;

    try {
        questions = await fetch(id === 'movies' ? './movies_questions.json' : './tvseries_questions.json',{ mode: 'no-cors'}).then(res => res.json());
    } catch (err) {
        console.error(err);
        return;
    }

    startTime = new Date().getTime();

    document.getElementById("start-again").classList.add("hidden");
    document.getElementById("score").classList.add("hidden");
    document.getElementById("start").classList.add("hidden");
    document.getElementById("question").classList.remove("hidden");
    shuffleArray(questions);
    questions = questions.slice(0, 10);
    questions.forEach(question => {
        if (question.type === "truefalse") return;
        shuffleArray(question.options);
    });
    updateQuestion(questions[currQuestionIndex]);
}

function updateQuestion(question) {
    document.getElementById("question").innerHTML = question.question;

    const buttons = document.querySelectorAll('.fadeIn');
    buttons.forEach(button => {
        button.classList.add("hidden");
        button.style.opacity = '0';
        button.style.animation = 'none';
    });

    if (questions[currQuestionIndex].type === "multiple") {
        document.getElementById("multiple-disclaimer").classList.remove("hidden");
        document.getElementById("next").classList.remove("hidden");
        document.getElementById("image").classList.add("hidden");
    } else {
        document.getElementById("multiple-disclaimer").classList.add("hidden");
        document.getElementById("next").classList.add("hidden");
        if (questions[currQuestionIndex].type === "image") {
            document.getElementById("image").classList.remove("hidden");
            document.getElementById("image").src = question.image_href;
        } else {
            document.getElementById("image").classList.add("hidden");
        }
    }

    setTimeout(() => {
        buttons.forEach((button, index) => {
            if (questions[currQuestionIndex].options[index] == null) return;
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
        document.getElementById(`answer${i + 1}`).className = "btn btn-outline btn-primary fadeIn";
    }
    answerState = [false, false, false, false];
}

function handleAnswerClick(event) {
    if (event.target.classList.contains("dbl")) return;

    const answerIndex = parseInt(event.target.id.slice(-1)) - 1;
    answerState[answerIndex] = !answerState[answerIndex];
    event.target.classList.toggle("active");

    if (questions[currQuestionIndex].type === "single"
        || questions[currQuestionIndex].type === "truefalse"
        || questions[currQuestionIndex].type === "image") {
        validateAnswers();
    }
}

function validateAnswers() {
    let currQuestion = questions[currQuestionIndex];

    let answersValidated = [];
    currQuestion.options.forEach((option, index) => {
         if (!answerState[index]) {
              answersValidated[index] = undefined;
         } else {
            answersValidated[index] = currQuestion.correct_answers.includes(option);
         }
         if (answersValidated[index] === true) {
             guessed++;
             document.getElementById(`answer${index + 1}`).classList.remove("btn-primary");
             document.getElementById(`answer${index + 1}`).classList.add("btn-success");
         } else if (answersValidated[index] === false) {
             document.getElementById(`answer${index + 1}`).classList.remove("btn-primary");
             document.getElementById(`answer${index + 1}`).classList.add("btn-error");
         } else if (currQuestion.correct_answers.includes(option)) {
             document.getElementById(`answer${index + 1}`).classList.remove("btn-primary");
             document.getElementById(`answer${index + 1}`).classList.add("btn-success");
         }
    });
    disableButtons(true);

    setTimeout(() => {
        if (currQuestionIndex === questions.length - 1) {
            completeQuiz();
            return;
        }
        resetButtons();
        currQuestionIndex++;
        updateQuestion(questions[currQuestionIndex]);
    }, 2000);
}

function next() {
    validateAnswers();
}

function calculateScore(totalGuessed, totalQuestions, timePassed) {
    const baseScorePerGuess = 10; // Base score for each correct guess
    const timePenalty = 0.5; // Score reduction per unit of time
    const guessPenalty = 5; // Penalty for each unguessed question

    let score = totalGuessed * baseScorePerGuess - (totalQuestions - totalGuessed) * guessPenalty - timePassed * timePenalty;
    return Math.max(score, 0); // Ensures score doesn't go below 0
}


function completeQuiz() {
    let endTime = new Date().getTime();
    let timeTaken = endTime - startTime;
    let totalAnswers = questions.reduce((acc, curr) => acc + curr.correct_answers.length, 0);
    if (guessed < 0) guessed = 0;

    let score = calculateScore(guessed,totalAnswers, timeTaken / 10000);
    score = Math.round(score);

    document.getElementById("score-int").textContent = `Score: ${score}`;
    document.getElementById("score-time").textContent = `Time: ${timeTaken / 1000}s`;
    document.getElementById("score-correct").textContent = `Correct Answers: ${guessed}/${totalAnswers}`;
    document.getElementById("score").classList.remove("hidden");
    document.getElementById("image").classList.add("hidden");
    document.getElementById("question").classList.add("hidden");
    resetButtons();
    document.querySelectorAll('.btn').forEach(btn => btn.classList.add("hidden"));
    document.getElementById("start-again").classList.remove("hidden");
    currQuestionIndex = 0;
    questions = [];
    guessed = 0;
}

function startAgain() {
    document.getElementById("start-again").classList.add("hidden");
    document.getElementById("start").classList.remove("hidden");
}


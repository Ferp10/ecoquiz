function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function fetchQuestions(category) {
    fetch(`/api/questions/${category}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error fetching questions:', data.error);
                alert('Error fetching questions: ' + data.error);
            } else {
                showQuestions(data);
            }
        })
        .catch(error => console.error('Error fetching questions:', error));
}

function showQuestions(questions) {
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let totalQuestions = questions.length;

    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        const question = questions[currentQuestionIndex];
        const choicesContainer = document.createElement('div');
        choicesContainer.id = 'choices';
        question.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.onclick = () => selectAnswer(button, choice, question.answer);
            choicesContainer.appendChild(button);
        });

        document.getElementById('question-container').innerHTML = `
            <h2 id="question">${question.question}</h2>
        `;
        document.getElementById('question-container').appendChild(choicesContainer);
    }

    function selectAnswer(button, choice, correctAnswer) {
        if (choice === correctAnswer) {
            button.classList.add('correct');
            correctAnswers++;
        } else {
            button.classList.add('incorrect');
            const correctButton = Array.from(document.getElementById('choices').children)
                .find(btn => btn.textContent === correctAnswer);
            if (correctButton) {
                correctButton.classList.add('correct');
            }
        }
        document.getElementById('choices').childNodes.forEach(btn => {
            btn.disabled = true;
        });
        currentQuestionIndex++;
        setTimeout(showQuestion, 2000); // 4 segundos antes de mostrar la siguiente pregunta
    }

    function showResults() {
        const percentage = (correctAnswers / totalQuestions) * 100;
        document.getElementById('question-container').innerHTML = `
            <h2>¡Has completado la trivia! otra ronda o miedo?</h2>
            <p>Respuestas correctas: ${correctAnswers}</p>
            <p>Respuestas incorrectas: ${totalQuestions - correctAnswers}</p>
            <p>Porcentaje de respuestas correctas: ${percentage.toFixed(0)}%</p>
            <div id="control-buttons">
                <button id="select-category-button">Seleccionar  categoría</button>
                <button id="exit-button">Salir</button>
            </div>
        `;

        document.getElementById('select-category-button').onclick = () => {
            window.location.href = '/';
        };

        document.getElementById('exit-button').onclick = () => {
            window.location.href = '/';
        };
    }

    showQuestion();
}

// Obtener la categoría de la URL y cargar las preguntas
document.addEventListener('DOMContentLoaded', () => {
    const category = getQueryParameter('category');
    if (category) {
        fetchQuestions(category);
    } else {
        alert('No se ha seleccionado una categoría.');
        window.location.href = '/';
    }
});

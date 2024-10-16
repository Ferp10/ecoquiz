function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function fetchQuestions(category) {
    console.log(`Fetching questions for category: ${category}`);
    fetch(`/api/questions/${category}`)
        .then(response => {
            console.log(`Response status: ${response.status}`);
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error fetching questions:', data.error);
                alert('Error fetching preguntas: ' + data.error);
            } else {
                console.log('Questions fetched successfully:', data);
                showQuestions(data);
            }
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('Error fetching preguntas: ' + error.message);
        });
}

function showQuestions(questions) {
    console.log('Showing questions:', questions);
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        const question = questions[currentQuestionIndex];
        console.log(`Displaying question ${currentQuestionIndex + 1}:`, question);

        const choicesContainer = document.createElement('div');
        choicesContainer.id = 'choices';
        question.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.classList.add('btn');
            button.onclick = () => selectAnswer(button, choice, question.answer);
            choicesContainer.appendChild(button);
        });

        document.getElementById('question-container').innerHTML = `
            <h2 id="question">${question.question}</h2>
        `;
        document.getElementById('question-container').appendChild(choicesContainer);
    }

    function selectAnswer(button, choice, correctAnswer) {
        console.log(`Selected answer: ${choice} | Correct answer: ${correctAnswer}`);
        if (choice === correctAnswer) {
            button.classList.add('correct');
            correctAnswers++;
            console.log('Respuesta correcta.');
        } else {
            button.classList.add('incorrect');
            const correctButton = Array.from(document.getElementById('choices').children)
                .find(btn => btn.textContent === correctAnswer);
            if (correctButton) {
                correctButton.classList.add('correct');
            }
            console.log('Respuesta incorrecta.');
        }

        // Deshabilitar todos los botones
        document.getElementById('choices').childNodes.forEach(btn => {
            btn.classList.add('disabled');
            btn.disabled = true; // Deshabilita el botón
        });

        // Pasar a la siguiente pregunta después de 3 segundos
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestion();
        }, 3000); // 3000 milisegundos = 3 segundos
    }

    function showResults() {
        console.log('Showing results.');
        const percentage = (correctAnswers / totalQuestions) * 100;
        document.getElementById('question-container').innerHTML = `
            <h2>¡Has completado la trivia!</h2>
            <p>Respuestas correctas: ${correctAnswers}</p>
            <p>Respuestas incorrectas: ${totalQuestions - correctAnswers}</p>
            <p>Porcentaje de respuestas correctas: ${percentage.toFixed(0)}%</p>
            <div id="control-buttons">
                <button id="select-category-button" class="btn">Seleccionar Categoría</button>
                <button id="exit-button" class="btn">Salir</button>
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
    console.log(`Category obtained from URL: ${category}`);
    if (category) {
        fetchQuestions(category);
    } else {
        alert('No se ha seleccionado una categoría.');
        window.location.href = '/';
    }
});

function startGame() {
    fetch("/api/open_trivia/questions")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al cargar preguntas de la API");
            }
            return response.json();
        })
        .then((data) => {
            if (data.error) {
                alert("Error fetching questions: " + data.error);
                return;
            }
            questions = data; // Asegúrate de que 'data' tenga el formato correcto.
            currentQuestionIndex = 0;
            totalQuestions = questions.length;
            showQuestion();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

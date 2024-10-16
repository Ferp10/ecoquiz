from flask import Flask, render_template, jsonify, request
import json
import random
import logging
import requests

app = Flask(__name__, static_folder='app/static', template_folder='app/templates')

# Configurar logging
logging.basicConfig(level=logging.DEBUG)

# Cargar preguntas desde el archivo JSON (manejo de errores)
try:
    with open('questions.json', 'r', encoding='utf-8') as file:
        questions_data = json.load(file)
        logging.debug("questions.json cargado correctamente.")
except FileNotFoundError:
    questions_data = {}
    logging.error("¡Error! El archivo questions.json no se encontró.")

# Lista para almacenar preguntas mostradas
questions_shown = {}

@app.route('/')
def index():
    logging.debug("Accediendo a la página de inicio.")
    return render_template('index.html')

@app.route('/quiz')
def quiz():
    category = request.args.get('category')
    logging.debug(f"Accediendo al quiz con categoría: {category}")
    if category:
        return render_template('quiz.html', category=category)
    else:
        logging.warning("Categoría no proporcionada en la solicitud /quiz")
        return "Categoría no encontrada", 404

@app.route('/login')
def login():
    logging.debug("Accediendo a la página de login.")
    return render_template('login.html')

@app.route('/register')
def register():
    logging.debug("Accediendo a la página de registro.")
    return render_template('register.html')

@app.route('/about')
def about():
    logging.debug("Accediendo a la página sobre nosotros.")
    return render_template('about.html')

@app.route('/quizzes')  # Nueva ruta para explorar más quizzes
def quizzes():
    logging.debug("Accediendo a la página de explorar quizzes.")
    return render_template('explore.html')  # Asegúrate de que este archivo esté en app/templates

@app.route('/api/questions/<category>', methods=['GET'])
def get_questions(category):
    global questions_shown
    logging.debug(f"Solicitud de preguntas para la categoría: {category}")
    if category in questions_data:
        # Obtener todas las preguntas disponibles
        available_questions = questions_data[category]

        # Verificar si ya se han mostrado todas las preguntas
        if category not in questions_shown or len(questions_shown[category]) == len(available_questions):
            # Si no se ha registrado la categoría o se mostraron todas las preguntas, reiniciar la lista de mostradas
            questions_shown[category] = []
            logging.debug(f"Reiniciando lista de preguntas mostradas para la categoría: {category}")

        # Seleccionar preguntas aleatorias que no se han mostrado
        random_questions = []
        while len(random_questions) < 7 and len(questions_shown[category]) < len(available_questions):
            question = random.choice(available_questions)
            if question not in questions_shown[category]:
                random_questions.append(question)
                questions_shown[category].append(question)

        # Si no se pudieron obtener 7 preguntas nuevas, se debe reiniciar la lista
        if len(random_questions) < 7:
            questions_shown[category] = []
            logging.debug(f"Reiniciando lista de preguntas mostradas nuevamente para la categoría: {category}")
            while len(random_questions) < 7:
                question = random.choice(available_questions)
                if question not in random_questions:
                    random_questions.append(question)
                    questions_shown[category].append(question)

        logging.debug(f"Preguntas seleccionadas para la categoría {category}: {random_questions}")
        return jsonify(random_questions)
    else:
        logging.error(f"Categoría no encontrada: {category}")
        return jsonify({"error": "Categoría no encontrada"}), 404

@app.route('/api/open_trivia/questions', methods=['GET'])
def get_open_trivia_questions():
    # Lógica para obtener las preguntas de la API externa
    response = requests.get("https://opentdb.com/api.php?amount=10&difficulty=medium&type=multiple&lang=es")
    if response.ok:
        logging.debug(f"Datos recibidos de Open Trivia: {response.json()}")
        return jsonify(response.json())  # Asegúrate de que esta respuesta sea un JSON válido
    else:
        logging.error("No se pudieron obtener preguntas de la API externa.")
        return jsonify({"error": "No se pudieron obtener preguntas."}), 500

if __name__ == '__main__':
    app.run(debug=True)

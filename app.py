from flask import Flask, render_template, jsonify, request
import json
import random

app = Flask(__name__, static_folder='app/static', template_folder='app/templates')

# Cargar preguntas desde el archivo JSON (manejo de errores)
try:
    with open('questions.json', 'r') as file:
        questions_data = json.load(file)
except FileNotFoundError:
    questions_data = {}
    print("¡Error! El archivo questions.json no se encontró.")

# Lista para almacenar preguntas mostradas
questions_shown = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/quiz')
def quiz():
    category = request.args.get('category')
    if category:
        return render_template('quiz.html', category=category)
    else:
        return "Categoría no encontrada", 404
    
@app.route('/login')
def login():
        return render_template('login.html')
    
@app.route('/register')
def register():
        return render_template('register.html')
    
@app.route('/about')
def about():
        return render_template('about.html')

@app.route('/api/questions/<category>', methods=['GET'])
def get_questions(category):
    global questions_shown
    if category in questions_data:
        # Obtener todas las preguntas disponibles
        available_questions = questions_data[category]

        # Verificar si ya se han mostrado todas las preguntas
        if category not in questions_shown or len(questions_shown[category]) == len(available_questions):
            # Si no se ha registrado la categoría o se mostraron todas las preguntas, reiniciar la lista de mostradas
            questions_shown[category] = []

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
            while len(random_questions) < 7:
                question = random.choice(available_questions)
                if question not in random_questions:
                    random_questions.append(question)
                    questions_shown[category].append(question)

        return jsonify(random_questions)
    else:
        return jsonify({"error": "Categoría no encontrada"}), 404

if __name__ == '__main__':
    app.run(debug=True)

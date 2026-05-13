// 1. Especificaciones del Tablero (Grid)
const BOX = 20;
const canvas = document.getElementById("snakeGame");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const finalScoreElement = document.getElementById("final-score");
const overlay = document.getElementById("overlay");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const restartBtn = document.getElementById("restart-btn");

let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.innerHTML = highScore.toString().padStart(2, '0');

// Variables de estado del juego
let game;
let snake = [];
let food;
let d; // Dirección
let gameStarted = false;

// Inicialización de la serpiente
function initGame() {
    snake = [];
    snake[0] = { x: 9 * BOX, y: 10 * BOX };
    food = randomFood();
    score = 0;
    d = undefined;
    scoreElement.innerHTML = "00";
    gameStarted = false;
    
    // UI reset
    overlay.classList.remove("hidden");
    startScreen.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");
}

// 2. Funciones Principales

// Escuchador de teclado
document.addEventListener("keydown", direction);

function direction(event) {
    let key = event.keyCode;
    
    // Iniciar juego si no ha empezado
    if (!gameStarted && (key >= 37 && key <= 40 || key == 87 || key == 65 || key == 83 || key == 68)) {
        gameStarted = true;
        overlay.classList.add("hidden");
        game = setInterval(draw, 120); // 120ms por frame
    }

    // 3. Reglas de Movimiento y Control (Bloqueo de 180 grados)
    if ((key == 37 || key == 65) && d != "RIGHT") {
        d = "LEFT";
    } else if ((key == 38 || key == 87) && d != "DOWN") {
        d = "UP";
    } else if ((key == 39 || key == 68) && d != "LEFT") {
        d = "RIGHT";
    } else if ((key == 40 || key == 83) && d != "UP") {
        d = "DOWN";
    }
}

// 2. Función de colisión
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// 2. & 5. Función de comida con validación
function randomFood() {
    let newFood;
    let foodOnSnake = true;

    while (foodOnSnake) {
        newFood = {
            x: Math.floor(Math.random() * 19 + 1) * BOX,
            y: Math.floor(Math.random() * 19 + 1) * BOX
        };

        // Comprobar si la comida aparece dentro de la serpiente
        foodOnSnake = false;
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x == snake[i].x && newFood.y == snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
    }
    return newFood;
}

// 2. Bucle principal
function draw() {
    // Limpiar lienzo
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar cuadrícula sutil (opcional para estética)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    for(let i = 0; i < canvas.width; i += BOX) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Dibujar serpiente
    for (let i = 0; i < snake.length; i++) {
        // Estética: gradiente de verde
        ctx.fillStyle = (i == 0) ? "#10b981" : "#059669";
        ctx.strokeStyle = "#0f172a";
        
        // Dibujar segmento con bordes redondeados (simulado)
        ctx.fillRect(snake[i].x, snake[i].y, BOX, BOX);
        ctx.strokeRect(snake[i].x, snake[i].y, BOX, BOX);
        
        // Brillo para la cabeza
        if(i == 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#10b981";
        } else {
            ctx.shadowBlur = 0;
        }
    }

    // Dibujar comida
    ctx.fillStyle = "#f43f5e";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#f43f5e";
    ctx.beginPath();
    ctx.arc(food.x + BOX/2, food.y + BOX/2, BOX/2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3. Actualización de cabeza
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= BOX;
    if (d == "UP") snakeY -= BOX;
    if (d == "RIGHT") snakeX += BOX;
    if (d == "DOWN") snakeY += BOX;

    // 3. Gestión del Array y Comer
    let newHead = { x: snakeX, y: snakeY };

    // 4. Condiciones de "Game Over"
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        showGameOver();
        return;
    }

    if (snakeX == food.x && snakeY == food.y) {
        score++;
        scoreElement.innerHTML = score.toString().padStart(2, '0');
        food = randomFood();
        // No hacemos pop(), así crece
    } else {
        // Eliminar cola si no come
        snake.pop();
    }

    // Añadir nueva cabeza
    snake.unshift(newHead);
}

// 6. Estados del Juego: Fin de Juego
function showGameOver() {
    overlay.classList.remove("hidden");
    startScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");
    finalScoreElement.innerHTML = score;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highScoreElement.innerHTML = highScore.toString().padStart(2, '0');
    }
}

// Reiniciar
restartBtn.addEventListener("click", () => {
    initGame();
});

// Inicializar al cargar
initGame();

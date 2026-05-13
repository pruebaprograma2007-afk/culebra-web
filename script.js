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

// Función para manejar la dirección (compartida entre teclado y móvil)
function setDirection(newDir) {
    // Iniciar juego si no ha empezado
    if (!gameStarted) {
        gameStarted = true;
        overlay.classList.add("hidden");
        game = setInterval(draw, 120);
    }

    // Bloqueo de 180 grados
    if (newDir == "LEFT" && d != "RIGHT") d = "LEFT";
    else if (newDir == "UP" && d != "DOWN") d = "UP";
    else if (newDir == "RIGHT" && d != "LEFT") d = "RIGHT";
    else if (newDir == "DOWN" && d != "UP") d = "DOWN";
}

// Escuchador de teclado
document.addEventListener("keydown", (event) => {
    let key = event.keyCode;
    if (key == 37 || key == 65) setDirection("LEFT");
    else if (key == 38 || key == 87) setDirection("UP");
    else if (key == 39 || key == 68) setDirection("RIGHT");
    else if (key == 40 || key == 83) setDirection("DOWN");
});

// Escuchadores de controles móviles (Botones)
document.getElementById("ctrl-up").addEventListener("touchstart", (e) => { e.preventDefault(); setDirection("UP"); });
document.getElementById("ctrl-left").addEventListener("touchstart", (e) => { e.preventDefault(); setDirection("LEFT"); });
document.getElementById("ctrl-down").addEventListener("touchstart", (e) => { e.preventDefault(); setDirection("DOWN"); });
document.getElementById("ctrl-right").addEventListener("touchstart", (e) => { e.preventDefault(); setDirection("RIGHT"); });

// También añadir click para pruebas en desktop con modo móvil
document.getElementById("ctrl-up").addEventListener("click", () => setDirection("UP"));
document.getElementById("ctrl-left").addEventListener("click", () => setDirection("LEFT"));
document.getElementById("ctrl-down").addEventListener("click", () => setDirection("DOWN"));
document.getElementById("ctrl-right").addEventListener("click", () => setDirection("RIGHT"));

// Detección de Swipes (Gesto de deslizar)
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Previene el scroll mientras juegas
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    // Solo si el deslizamiento es significativo
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal
            setDirection(dx > 0 ? "RIGHT" : "LEFT");
        } else {
            // Vertical
            setDirection(dy > 0 ? "DOWN" : "UP");
        }
    }
});

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

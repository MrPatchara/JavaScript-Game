const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth > 480 ? 600 : window.innerWidth - 20;
    canvas.height = window.innerHeight > 640 ? 800 : window.innerHeight - 20;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let birdImg = new Image();
birdImg.src = 'bird.gif';

let pipeImg = new Image();
pipeImg.src = 'pipe.png';

let backgroundImg = new Image();
backgroundImg.src = 'background.png';

let flapSound = new Audio('flap.wav');
let hitSound = new Audio('hit.wav');

let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    gravity: 0.7,
    lift: -10,
    velocity: 0
};

let pipes = [];
let pipeWidth = 25;
let pipeGap = 250;
let pipeSpeed = 1.5;
let frame = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameStarted = false;
let gameOver = false;

function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];
        ctx.drawImage(pipeImg, pipe.x, pipe.y, pipe.width, pipe.height);
    }
}

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    }

    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function updatePipes() {
    if (frame % 100 === 0) {
        let pipeY = Math.random() * (canvas.height - pipeGap);
        pipes.push({ x: canvas.width, y: 0, width: pipeWidth, height: pipeY });
        pipes.push({ x: canvas.width, y: pipeY + pipeGap, width: pipeWidth, height: canvas.height - pipeY - pipeGap });
    }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            score++;
        }
    }
}

function checkCollision() {
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];
        if (bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height &&
            bird.y + bird.height > pipe.y) {
            return true;
        }
    }
    return false;
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 25);
    ctx.fillText('High Score: ' + highScore, 10, 50);
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    frame = 0;
    score = 0;
    gameStarted = true;
    gameOver = false;
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    if (gameStarted && !gameOver) {
        updateBird();
        updatePipes();

        if (checkCollision()) {
            hitSound.play();
            gameOver = true;
            document.getElementById('finalScore').textContent = 'Score: ' + score;

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }

            document.getElementById('gameOverScreen').style.display = 'flex';
        }

        drawBird();
        drawPipes();
        drawScore();

        frame++;
    }

    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (!gameStarted) {
        resetGame();
    } else if (gameOver) {
        resetGame();
    } else {
        bird.velocity = bird.lift;
        flapSound.play();
    }
}

document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        startGame();
    }
});

document.addEventListener('touchstart', function (event) {
    startGame();
});

gameLoop();

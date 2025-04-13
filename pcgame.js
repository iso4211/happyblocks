let player1 = document.getElementById("player1");
let player2 = document.getElementById("player2");
let gameArea = document.getElementById("gameArea");

let gravity = 0.3;
let jumpStrength = 10;
let player1Velocity = 0;
let player2Velocity = 0;
let isPlayer1Jumping = false;
let isPlayer2Jumping = false;

let player1Left = 50;
let player2Left = 150;
let player1Bottom = 0;
let player2Bottom = 0;

let player1Speed = 5;
let player2Speed = 5;

let isPlayer1MovingLeft = false;
let isPlayer1MovingRight = false;
let isPlayer2MovingLeft = false;
let isPlayer2MovingRight = false;

let platforms = [];
let obstacles = [];
let gameWidth = 5000;
let platformSpacing = 1000;
let obstacleSpacing = 5000;

let platformSpeed = 1;
let obstacleSpeed = 1;
let difficultyLevel = 1;

let gameStarted = false;

let player1JumpCount = 0;  // Double jump için sayaç
let player2JumpCount = 0;  // Double jump için sayaç

let isMobile = false; // Mobil cihaz kontrolü
let buttonContainer = null; // Mobil butonlar için konteyner

player1.style.backgroundColor = "blue";
player2.style.backgroundColor = "red";

// Başlangıç mesajı
let startMessage = document.createElement("div");
startMessage.textContent = "Başlamak için herhangi bir tuşa basın!";
startMessage.style.position = "absolute";
startMessage.style.top = "50%";
startMessage.style.left = "50%";
startMessage.style.transform = "translate(-50%, -50%)";
startMessage.style.fontSize = "24px";
startMessage.style.color = "white";
gameArea.appendChild(startMessage);

// Mutlu yüz çizme fonksiyonu
function drawHappyFace(player) {
    let face = document.createElement("canvas");
    face.width = 40;
    face.height = 40;
    face.style.position = "absolute";
    face.style.left = "0px";
    face.style.bottom = "0px";

    let ctx = face.getContext("2d");
    ctx.beginPath();
    ctx.arc(20, 20, 15, 0, Math.PI * 2, true); // Yüz
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(13, 13, 3, 0, Math.PI * 2, true); // Sol göz
    ctx.arc(27, 13, 3, 0, Math.PI * 2, true); // Sağ göz
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(20, 20, 10, 0, Math.PI, false); // Ağız
    ctx.stroke();

    player.appendChild(face);
}

// Oyuncu 1 ve 2'ye yüz ekleme
drawHappyFace(player1);
drawHappyFace(player2);

// Cihaz türünü kontrol etme (mobil mi bilgisayar mı?)
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
        isMobile = true;
    }
}

// Mobilde butonları oluşturma
function createMobileControls() {
    buttonContainer = document.createElement("div");
    buttonContainer.style.position = "absolute";
    buttonContainer.style.bottom = "10px";
    buttonContainer.style.left = "50%";
    buttonContainer.style.transform = "translateX(-50%)";
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";
    buttonContainer.style.width = "200px";

    let leftButton = document.createElement("button");
    leftButton.textContent = "←";
    leftButton.style.fontSize = "24px";
    leftButton.style.width = "60px";
    leftButton.style.height = "60px";
    leftButton.style.borderRadius = "50%";
    leftButton.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    leftButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
    leftButton.onclick = () => { isPlayer1MovingLeft = true; };

    let rightButton = document.createElement("button");
    rightButton.textContent = "→";
    rightButton.style.fontSize = "24px";
    rightButton.style.width = "60px";
    rightButton.style.height = "60px";
    rightButton.style.borderRadius = "50%";
    rightButton.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    rightButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
    rightButton.onclick = () => { isPlayer1MovingRight = true; };

    let jumpButton = document.createElement("button");
    jumpButton.textContent = "↑";
    jumpButton.style.fontSize = "24px";
    jumpButton.style.width = "60px";
    jumpButton.style.height = "60px";
    jumpButton.style.borderRadius = "50%";
    jumpButton.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    jumpButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
    jumpButton.onclick = () => {
        if (player1JumpCount < 2) {
            player1Velocity = jumpStrength;
            isPlayer1Jumping = true;
            player1JumpCount++;
        }
    };

    buttonContainer.appendChild(leftButton);
    buttonContainer.appendChild(rightButton);
    buttonContainer.appendChild(jumpButton);

    gameArea.appendChild(buttonContainer);
}

// Başlangıçta platformları ve engelleri oluşturma
function createPlatform() {
    let platform = document.createElement("div");
    let randomHeight = Math.random() * 150 + 100; 
    let randomLeft = gameWidth + Math.random() * platformSpacing;

    platform.classList.add("platform");
    platform.style.left = randomLeft + "px";
    platform.style.bottom = randomHeight + "px";

    gameArea.appendChild(platform);
    platforms.push(platform);
}

// Engelleri oluşturma
function createObstacle() {
    let obstacle = document.createElement("div");
    let randomHeight = Math.random() * 200 + 50; 
    let randomLeft = gameWidth + Math.random() * obstacleSpacing;

    obstacle.classList.add("obstacle");
    obstacle.style.left = randomLeft + "px";
    obstacle.style.bottom = randomHeight + "px";

    // Engel rengi ekleyelim
    obstacle.style.backgroundColor = randomHeight > 150 ? "red" : "green"; 

    gameArea.appendChild(obstacle);
    obstacles.push(obstacle);
}

// Oyuncuları hareket ettirme
function movePlayer1() {
    if (isPlayer1Jumping) {
        player1Velocity -= gravity;
        player1Bottom += player1Velocity;
        if (player1Bottom <= 0) {
            player1Bottom = 0;
            isPlayer1Jumping = false;
            player1JumpCount = 0;  // İlk zıplama bittiğinde sayacı sıfırla
        }
    }

    for (let platform of platforms) {
        let platLeft = parseInt(platform.style.left);
        let platBottom = parseInt(platform.style.bottom);
        let platWidth = platform.offsetWidth;

        if (
            player1Left + 40 > platLeft &&
            player1Left < platLeft + platWidth &&
            player1Bottom <= platBottom + 20 &&
            player1Bottom > platBottom
        ) {
            player1Velocity = 0;
            player1Bottom = platBottom + 20;
            isPlayer1Jumping = false;
            player1JumpCount = 0;  // Platforma inince sayacı sıfırla
        }
    }

    for (let obstacle of obstacles) {
        let obsLeft = parseInt(obstacle.style.left);
        let obsBottom = parseInt(obstacle.style.bottom);
        let obsWidth = obstacle.offsetWidth;

        if (
            player1Left + 40 > obsLeft &&
            player1Left < obsLeft + obsWidth &&
            player1Bottom <= obsBottom + 40 &&
            player1Bottom > obsBottom
        ) {
            alert("Oyuncu 1 engelle çarpıştı!");
            resetGame();
        }
    }

    if (isPlayer1MovingLeft) {
        player1Left -= player1Speed;
    }
    if (isPlayer1MovingRight) {
        player1Left += player1Speed;
    }

    player1.style.left = player1Left + "px";
    player1.style.bottom = player1Bottom + "px";
}

function movePlayer2() {
    if (isPlayer2Jumping) {
        player2Velocity -= gravity;
        player2Bottom += player2Velocity;
        if (player2Bottom <= 0) {
            player2Bottom = 0;
            isPlayer2Jumping = false;
            player2JumpCount = 0;  // İlk zıplama bittiğinde sayacı sıfırla
        }
    }

    for (let platform of platforms) {
        let platLeft = parseInt(platform.style.left);
        let platBottom = parseInt(platform.style.bottom);
        let platWidth = platform.offsetWidth;

        if (
            player2Left + 40 > platLeft &&
            player2Left < platLeft + platWidth &&
            player2Bottom <= platBottom + 20 &&
            player2Bottom > platBottom
        ) {
            player2Velocity = 0;
            player2Bottom = platBottom + 20;
            isPlayer2Jumping = false;
            player2JumpCount = 0;  // Platforma inince sayacı sıfırla
        }
    }

    for (let obstacle of obstacles) {
        let obsLeft = parseInt(obstacle.style.left);
        let obsBottom = parseInt(obstacle.style.bottom);
        let obsWidth = obstacle.offsetWidth;

        if (
            player2Left + 40 > obsLeft &&
            player2Left < obsLeft + obsWidth &&
            player2Bottom <= obsBottom + 40 &&
            player2Bottom > obsBottom
        ) {
            alert("Oyuncu 2 engelle çarpıştı!");
            resetGame();
        }
    }

    if (isPlayer2MovingLeft) {
        player2Left -= player2Speed;
    }
    if (isPlayer2MovingRight) {
        player2Left += player2Speed;
    }

    player2.style.left = player2Left + "px";
    player2.style.bottom = player2Bottom + "px";
}

function gameLoop() {
    movePlayer1();
    movePlayer2();

    if (difficultyLevel < 5) {
        difficultyLevel = Math.floor((gameWidth / 500) * 0.5);
    }

    if (platforms.length < 10 + difficultyLevel) {
        createPlatform();
    }

    if (obstacles.length < 5 + difficultyLevel) {
        createObstacle();
    }

    for (let platform of platforms) {
        let platLeft = parseInt(platform.style.left);
        let platBottom = parseInt(platform.style.bottom);

        platform.style.left = platLeft - platformSpeed + "px";

        if (platLeft + 200 < 0) {
            platform.remove();
            platforms = platforms.filter(p => p !== platform);
            createPlatform();
        }
    }

    for (let obstacle of obstacles) {
        let obsLeft = parseInt(obstacle.style.left);

        obstacle.style.left = obsLeft - obstacleSpeed + "px";

        if (obsLeft + 40 < 0) {
            obstacle.remove();
            obstacles = obstacles.filter(o => o !== obstacle);
            createObstacle();
        }
    }

    if (gameWidth > 2000) {
        platformSpeed = 2 + difficultyLevel * 0.1;
        obstacleSpeed = 2 + difficultyLevel * 0.1;
    }

    gameWidth += 2;
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    player1Left = 50;
    player1Bottom = 0;
    player2Left = 150;
    player2Bottom = 0;
    platforms = [];
    obstacles = [];
    gameWidth = 5000;
    player1JumpCount = 0;  // Double jump sayacını sıfırla
    player2JumpCount = 0;  // Double jump sayacını sıfırla
    alert("Oyun sıfırlanıyor...");
}

document.addEventListener("keydown", function(event) {
    if (!gameStarted) {
        gameStarted = true;
        detectDevice(); // Cihaz türünü tespit et
        gameArea.removeChild(startMessage); 
        gameLoop(); 
        
        // Mobil kullanıcılar için butonları oluştur
        if (isMobile) {
            createMobileControls();
        }
    }

    // Player 1 için
    if (event.key === "w" && player1JumpCount < 2) {
        player1Velocity = jumpStrength;
        isPlayer1Jumping = true;
        player1JumpCount++;
    }

    // Player 2 için
    if (event.key === "ArrowUp" && player2JumpCount < 2) {
        player2Velocity = jumpStrength;
        isPlayer2Jumping = true;
        player2JumpCount++;
    }

    if (event.key === "a") {
        isPlayer1MovingLeft = true;
    }
    if (event.key === "d") {
        isPlayer1MovingRight = true;
    }

    if (event.key === "ArrowLeft") {
        isPlayer2MovingLeft = true;
    }
    if (event.key === "ArrowRight") {
        isPlayer2MovingRight = true;
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "a") {
        isPlayer1MovingLeft = false;
    }
    if (event.key === "d") {
        isPlayer1MovingRight = false;
    }

    if (event.key === "ArrowLeft") {
        isPlayer2MovingLeft = false;
    }
    if (event.key === "ArrowRight") {
        isPlayer2MovingRight = false;
    }
});

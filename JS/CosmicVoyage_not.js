document.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('gameArea');
  const scoreDisplay = document.getElementById('score');
  const startButton = document.getElementById('startButton');
  let astronaut;
  let gameInterval, moveObstaclesInterval;
  let score = 0;
  let gameTime = 0;
  let lastBackgroundChangeScore = 0;
  let highScore = 0;

  document.getElementById('highScore').textContent = `High Score: ${highScore} km`;

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  if (isMobileDevice()) {
    document.getElementById('instructionText').textContent = 'Tap on the left or right side of the screen to move.';
  } else {
    document.getElementById('instructionText').textContent = 'Avoid obstacles by using the left and right arrow keys.';
  }

  function resetGame() {
    clearInterval(gameInterval);
    clearInterval(moveObstaclesInterval);
    gameArea.innerHTML = '';

    astronaut = document.createElement('img');
    astronaut.src = 'Icons/astronaut.png';
    astronaut.id = 'astronaut';
    astronaut.style.position = 'absolute';
    astronaut.style.left = '45%';
    astronaut.style.bottom = '10px';
    gameArea.appendChild(astronaut);

    score = 0;
    gameTime = 0;
    scoreDisplay.textContent = '0';
  }

  function moveAstronaut(dx) {
    let currentPosition = parseInt(window.getComputedStyle(astronaut).left, 10);
    const gameAreaWidth = gameArea.offsetWidth;
    const astronautWidth = astronaut.offsetWidth;
    let newPosition = currentPosition + dx;
    newPosition = Math.max(0, Math.min(newPosition, gameAreaWidth - astronautWidth));
    astronaut.style.left = `${newPosition}px`;
  }

  function handleKeyControls(e) {
    if (e.key === "ArrowLeft") {
      moveAstronaut(-30);
    } else if (e.key === "ArrowRight") {
      moveAstronaut(30);
    }
  }

  function activateKeyControls() {
    document.addEventListener('keydown', handleKeyControls);
  }

  function deactivateKeyControls() {
    document.removeEventListener('keydown', handleKeyControls);
  }

  function handleTouchStart(e) {
    e.preventDefault();
    const touchLocation = e.touches[0].clientX;
    if (touchLocation < window.innerWidth / 2) {
      moveAstronaut(-18);
    } else {
      moveAstronaut(18);
    }
  }

  function addTouchControls() {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
  }

  function removeTouchControls() {
    document.removeEventListener('touchstart', handleTouchStart, { passive: false });
  }

  function generateObstacle() {
    const gameTimeInSeconds = gameTime;
    let obstacleTypes = ['asteroid'];

    if (gameTimeInSeconds >= 20) {
      obstacleTypes.push('planet');
    }
    if (gameTimeInSeconds >= 60) {
      obstacleTypes.push('supernova');
    }
    if (gameTimeInSeconds >= 120) {
      obstacleTypes.push('blackhole');
    }

    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const obstacle = document.createElement('img');
    obstacle.className = `obstacle ${type}`;
    obstacle.src = `Icons/${type}.png`;
    obstacle.style.position = 'absolute';
    obstacle.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
    obstacle.style.top = '0px';
    obstacle.style.width = isMobileDevice() ? '20px' : '25px';  // Simplified for all obstacles
    obstacle.style.height = 'auto';

    gameArea.appendChild(obstacle);
  }

  function moveObstacles() {
    document.querySelectorAll('.obstacle').forEach(obstacle => {
      let currentTop = parseInt(obstacle.style.top, 10) + 2;
      obstacle.style.top = `${currentTop}px`;

      if (currentTop > gameArea.offsetHeight) {
        obstacle.remove();
      }

      if (checkCollision(obstacle)) {
        gameOver();
      }
    });
  }

  function checkCollision(obstacle) {
    const astronautRect = astronaut.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    return !(
      astronautRect.right < obstacleRect.left ||
      astronautRect.left > obstacleRect.right ||
      astronautRect.bottom < obstacleRect.top ||
      astronautRect.top > obstacleRect.bottom
    );
  }

  function changeBackgroundColor() {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    document.body.style.backgroundColor = randomColor;
    document.documentElement.style.backgroundColor = randomColor;
  }

  function gameOver() {
    removeTouchControls();
    deactivateKeyControls();
    clearInterval(gameInterval);
    clearInterval(moveObstaclesInterval);

    if (score > highScore) {
      highScore = score;
      document.getElementById('highScore').textContent = `High Score: ${highScore} km`;
    }

    document.getElementById('finalScore').textContent = `𐠒 Astronaut Died 𐠒`;
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('visible');

    startButton.textContent = 'Restart Voyage';
    startButton.onclick = () => {
      gameOverScreen.classList.add('hidden');
      gameOverScreen.classList.remove('visible');
      resetGame();
      startGame();
    };
  }

  function startGame() {
    resetGame();
    activateKeyControls();
    if (isMobileDevice()) {
      addTouchControls();
    }

    document.getElementById('gameOverScreen').classList.add('hidden');
    
    gameTime = 0;
    score = 0;
    lastBackgroundChangeScore = 0;
    scoreDisplay.textContent = '0 km';

    gameInterval = setInterval(() => {
      gameTime++;
      score += 10;
      scoreDisplay.textContent = `${Math.floor(score)} km`;

      if (score / 200 > lastBackgroundChangeScore) {
        changeBackgroundColor();
        lastBackgroundChangeScore = Math.floor(score / 200);
      }

      const numberOfObstacles = Math.floor(Math.random() * Math.max(5, Math.min(7, Math.floor(score / 1000))));
      for (let i = 0; i < numberOfObstacles; i++) {
        generateObstacle();
      }
    }, 1000);

    moveObstaclesInterval = setInterval(moveObstacles, 20);
  }

  startButton.addEventListener('click', startGame);
});

document.addEventListener('DOMContentLoaded', () => {

  const startButton = document.getElementById('startButton');
      // Update this to call resetGame directly
      startButton.addEventListener('click', function() {
        resetGame();  // Resets and starts the game
        startGame();
    });
    
  let astronaut = document.createElement('div');
  const scoreDisplay = document.getElementById('score');
  const gameArea = document.getElementById('gameArea');
  let gameInterval, moveObstaclesInterval;
  let score = 0;
  let gameTime = 0; // in seconds
  let nextObstacleTime = 0; // in milliseconds
  let lastBackgroundChangeScore = 0; // Keeps track of the score at the last background change
  let highScore = 0; // Initialize the high score as 0 at the start of the session
  document.getElementById('highScore').textContent = `High Score: ${highScore} km`;
  // Rest of your initialization code..
  
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
if (isMobileDevice()) {
  // Update the instruction text for touch controls
  document.getElementById('instructionText').textContent = 'Tap on the left or right side of the screen to move.';
} else {
  // For non-mobile devices, set or retain keyboard control instructions
  document.getElementById('instructionText').textContent = 'Avoid obstacles by using the left and right arrow keys.';
}

  astronaut.id = 'astronaut';
  gameArea.appendChild(astronaut); // Add astronaut to the game area

function moveAstronaut(dx) {
  let currentPosition = parseInt(window.getComputedStyle(astronaut).left, 10);
  const gameAreaWidth = gameArea.offsetWidth;
  const astronautWidth = astronaut.offsetWidth;

  // Calculate the new position with the movement delta applied
  let newPosition = currentPosition + dx;

  // Ensure the new position does not go beyond the left or right boundaries of the game area
  newPosition = Math.max(0, Math.min(newPosition, gameAreaWidth - astronautWidth));

  // Apply the calculated position
  astronaut.style.left = `${newPosition}px`;
}

function handleTouchStart(e) {
  e.preventDefault(); // Prevents scrolling or zooming

  const touchLocation = e.touches[0].clientX;
  if (touchLocation < window.innerWidth / 2) {
      moveAstronaut(-18); // Move left
  } else {
      moveAstronaut(18); // Move right
  }
}

function addTouchControls() {
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
}

function removeTouchControls() {
  document.removeEventListener('touchstart', handleTouchStart, { passive: false });
}


function handleKeyControls(e) {
  if (e.key === "ArrowLeft") {
    moveAstronaut(-20);
  } else if (e.key === "ArrowRight") {
    moveAstronaut(20);
  }
}

function activateKeyControls() {
  document.addEventListener('keydown', handleKeyControls);
}

function deactivateKeyControls() {
  document.removeEventListener('keydown', handleKeyControls);
}

  function generateObstacle() {
    const gameTimeInSeconds = gameTime; // Assuming 'gameTime' tracks elapsed game time in seconds
    let obstacleTypes = ['asteroid'];

    // Include supernovas and blackholes based on gameTime
    if (gameTimeInSeconds >= 20) obstacleTypes.push('planet');
    if (gameTimeInSeconds >= 60) obstacleTypes.push('supernova');
    if (gameTimeInSeconds >= 120) obstacleTypes.push('blackhole');

    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const obstacle = document.createElement('img');
    obstacle.className = `obstacle ${type}`;
    obstacle.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
    obstacle.style.top = '0px';

    // Set sources and base sizes
    switch (type) {
        case 'planet':
            obstacle.src = 'Icons/planet.png';
            obstacle.style.width = isMobileDevice() ? '40px' : '48px'; // 50% size for mobile
            break;
        case 'asteroid':
            obstacle.src = 'Icons/asteroid.png';
            obstacle.style.width = isMobileDevice() ? '20px' : '25px'; // 50% size for mobile
            break;
        case 'supernova':
            obstacle.src = 'Icons/supernova.png';
            obstacle.style.width = isMobileDevice() ? '50px' : '55px'; // 50% size for mobile
            break;
        case 'blackhole':
            obstacle.src = 'Icons/blackhole.png';
            obstacle.style.width = isMobileDevice() ? '17px' : '20px'; // 50% size for mobile
            break;
    }
    obstacle.style.height = 'auto'; // Maintain aspect ratio

    gameArea.appendChild(obstacle);
}

function updateDistances() {
  const astronautRect = astronaut.getBoundingClientRect();
  document.querySelectorAll('.obstacle').forEach(obstacle => {
      const obstacleRect = obstacle.getBoundingClientRect();
      let horizontalDistance = obstacleRect.left - astronautRect.left + (obstacleRect.width / 2) - (astronautRect.width / 2);
      let verticalDistance = obstacleRect.top - astronautRect.top;
      obstacle.setAttribute('data-horizontal-distance', horizontalDistance.toString());
      obstacle.setAttribute('data-vertical-distance', verticalDistance.toString());
  });
}

function moveObstacles() {
  const currentTime = Date.now(); // Current time for oscillation and growth calculations
  const astronaut = document.getElementById('astronaut');
  const astronautRect = astronaut.getBoundingClientRect(); // Get astronaut's current position

  document.querySelectorAll('.obstacle').forEach(obstacle => {
    let currentTop = parseInt(obstacle.style.top, 10) + 2;
    obstacle.style.top = `${currentTop}px`;

    // Calculate and update relative horizontal and vertical distances
    const obstacleRect = obstacle.getBoundingClientRect();
    let horizontalDistance = obstacleRect.left - astronautRect.left + (obstacleRect.width / 2) - (astronautRect.width / 2);
    let verticalDistance = obstacleRect.top - astronautRect.top;

    // Debug output to console
    //console.log(`Obstacle at top ${obstacle.style.top}: Horizontal Distance = ${horizontalDistance}, Vertical Distance = ${verticalDistance}`);
    
    // Store these distances as attributes on the obstacle for easy access
    obstacle.setAttribute('data-horizontal-distance', horizontalDistance.toString());
    obstacle.setAttribute('data-vertical-distance', verticalDistance.toString());

    if (currentTop > gameArea.offsetHeight) {
      obstacle.remove(); // Remove the obstacle if it moves beyond the game area
    }

    if (checkCollision(obstacle)) {
      gameOver(); // End game if there's a collision
    }

    // Growth for black holes
    if (obstacle.classList.contains('blackhole')) {
      let growthAccumulator = parseFloat(obstacle.dataset.growthAccumulator || '0');
      let growthFactor = 1.005;
      let currentWidth = parseFloat(obstacle.offsetWidth);

      // Calculate the desired new width
      let desiredWidth = currentWidth * growthFactor;
      let originalWidth = parseFloat(obstacle.dataset.originalWidth || currentWidth);
      let originalHeight = parseFloat(obstacle.dataset.originalHeight || obstacle.offsetHeight);
      let aspectRatio = originalHeight / originalWidth;

      growthAccumulator += (desiredWidth - currentWidth);

      if (growthAccumulator >= 1) { // Apply accumulated growth once it reaches a threshold
        let newWidth = currentWidth + growthAccumulator;
        let newHeight = newWidth * aspectRatio;
        obstacle.style.width = `${newWidth}px`;
        obstacle.style.height = `${newHeight}px`;
        obstacle.dataset.growthAccumulator = '0'; // Reset the accumulator
      } else {
        obstacle.dataset.growthAccumulator = growthAccumulator.toString();
      }
    }

    // Oscillation for supernovas
    if (obstacle.classList.contains('supernova')) {
      if (!obstacle.dataset.startTime) obstacle.dataset.startTime = currentTime.toString();
      const elapsedTime = currentTime - parseInt(obstacle.dataset.startTime, 10);

      // Reduce oscillation amplitude for mobile devices
      const amplitude = isMobileDevice() ? 25 : 50; // Half the amplitude for mobile devices

      const period = 2000; // Oscillation period in milliseconds
      let originalLeft = obstacle.dataset.originalLeft ? parseInt(obstacle.dataset.originalLeft, 10) : parseInt(obstacle.style.left, 10);
      if (!obstacle.dataset.originalLeft) obstacle.dataset.originalLeft = originalLeft.toString();
      
      // Calculate new position with conditional amplitude
      obstacle.style.left = `${originalLeft + amplitude * Math.sin(elapsedTime * 2 * Math.PI / period)}px`;
    }

  });
  updateDistances();
}


function checkCollision() {
  const astronautRect = document.getElementById('astronaut').getBoundingClientRect();
  const obstacles = document.querySelectorAll('.obstacle');
  for (let obstacle of obstacles) {
      const obstacleRect = obstacle.getBoundingClientRect();
      // Manual adjustments: Define how much to "shrink" the collision box on each side
      const adjustment = {
          top: 4, // Reduce the top side of the collision box by 10px
          right: 2, // Reduce the right side of the collision box by 10px
          bottom: 0, // Reduce the bottom side of the collision box by 10px
          left: 2, // Reduce the left side of the collision box by 10px
      };

      // Adjusted collision detection logic
      if (!(astronautRect.right - adjustment.right < obstacleRect.left + adjustment.left ||
          astronautRect.left + adjustment.left > obstacleRect.right - adjustment.right ||
          astronautRect.bottom - adjustment.bottom < obstacleRect.top + adjustment.top ||
          astronautRect.top + adjustment.top > obstacleRect.bottom - adjustment.bottom)) {
          return true; // Collision detected
      }
  }
  return false; // No collisions detected
}

function changeBackgroundColor() {
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  document.body.style.backgroundColor = randomColor;
  document.documentElement.style.backgroundColor = randomColor; // Also set on <html>
}

// Start, Reset and Game Over

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
  lastBackgroundChangeScore = 0;
  scoreDisplay.textContent = '0';
// Return a promise that resolves after all reset operations are complete
return new Promise(resolve => setTimeout(resolve, 100)); // 100 ms delay to ensure all clear

}

window.resetGame = resetGame;

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
    startGame();
  };
}

window.gameOver = gameOver;

function startGame() {
  resetGame();
  activateKeyControls();  // Initially activate key controls
  if (isMobileDevice()) {
    addTouchControls(); // Enable touch controls for the astronaut
}

      // Hide the instruction text
      document.getElementById('instructionText').style.display = 'none';

  // Reset nextObstacleTime to immediately generate the first obstacle
  nextObstacleTime = Date.now();


  gameInterval = setInterval(() => {
      gameTime++;
      score += 10; // Increment score every second
      scoreDisplay.textContent = `${Math.floor(score)} km`;

      // Calculate current threshold based on the score
      const currentThreshold = Math.floor(score / 200) * 200;

      // Change the background only when crossing to a new threshold
      if (currentThreshold > lastBackgroundChangeScore) {
          changeBackgroundColor();
          // Update lastBackgroundChangeScore to the next threshold
          lastBackgroundChangeScore = currentThreshold;
      }

    // Adjust the number of obstacles generated based on the score
    let maxObstacles;
    if (score >= 3000) {
        maxObstacles = 7; // Allows generating up to 6 obstacles (0 to 6)
    } else if (score >= 2000) {
        maxObstacles = 6; // Allows generating up to 5 obstacles (0 to 5)
    } else {
        maxObstacles = 5; // Default: Generate up to 4 obstacles (0 to 4)
    }
    const numberOfObstacles = Math.floor(Math.random() * maxObstacles);


      for (let i = 0; i < numberOfObstacles; i++) {
          generateObstacle(); // Call your existing function
      }

  }, 1000);

  moveObstaclesInterval = setInterval(moveObstacles, 20);
}

window.startGame = startGame;
startButton.addEventListener('click', startGame);


}
);







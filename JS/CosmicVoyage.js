document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
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

  function resetGame() {
    // Clear intervals and game area test
    clearInterval(gameInterval);
    clearInterval(moveObstaclesInterval);
    gameArea.innerHTML = '';

    // Create astronaut image
    astronaut = document.createElement('img');
    astronaut.src = 'Icons/astronaut.png'; // Update this path to your astronaut image
    astronaut.id = 'astronaut';
    gameArea.appendChild(astronaut);

    // Reset score and other game variables
    score = 0;
    gameTime = 0;
    scoreDisplay.textContent = '0';
}

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


function moveObstacles() {
  const currentTime = Date.now(); // Current time for oscillation and growth calculations

  document.querySelectorAll('.obstacle').forEach(obstacle => {
      let currentTop = parseInt(obstacle.style.top, 10) + 2;
      obstacle.style.top = `${currentTop}px`;

      if (currentTop > gameArea.offsetHeight) obstacle.remove();
      
      if (checkCollision(obstacle)) gameOver();

// Growth for black holes
if (obstacle.classList.contains('blackhole')) {
  let growthAccumulator = obstacle.dataset.growthAccumulator ? parseFloat(obstacle.dataset.growthAccumulator) : 0;
  let growthFactor = 1.005;
  let currentWidth = parseFloat(obstacle.offsetWidth);

  // Calculate the desired new width without applying it yet
  let desiredWidth = currentWidth * growthFactor;

  // Assume the original aspect ratio is stored or can be calculated
  // For example, if original dimensions are known:
  let originalWidth = parseFloat(obstacle.dataset.originalWidth); // Make sure to set this when creating the obstacle
  let originalHeight = parseFloat(obstacle.dataset.originalHeight); // Make sure to set this when creating the obstacle
  let aspectRatio = originalHeight / originalWidth;

  // Accumulate the difference until it's large enough to apply
  growthAccumulator += (desiredWidth - currentWidth);

  // Check if the accumulated growth is large enough to apply
  if (growthAccumulator >= 1) { // Using 1px as an example threshold
      let newWidth = currentWidth + growthAccumulator;
      let newHeight = newWidth * aspectRatio; // Calculate new height based on aspect ratio
      obstacle.style.width = `${newWidth}px`;
      obstacle.style.height = `${newHeight}px`; // Set height proportionally
      obstacle.dataset.growthAccumulator = '0'; // Reset accumulator after applying growth
  } else {
      // Save the accumulated growth back to the dataset for the next update
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
}


function checkCollision(obstacle) {
  const astronautRect = astronaut.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();
  
  // Manual adjustments: Define how much to "shrink" the collision box on each side
  const adjustment = {
      top: 4, // Reduce the top side of the collision box by 10px
      right: 2, // Reduce the right side of the collision box by 10px
      bottom: 0, // Reduce the bottom side of the collision box by 10px
      left: 2, // Reduce the left side of the collision box by 10px
  };

  // Adjusted collision detection logic
  return !(
      astronautRect.right - adjustment.right < obstacleRect.left + adjustment.left ||
      astronautRect.left + adjustment.left > obstacleRect.right - adjustment.right ||
      astronautRect.bottom - adjustment.bottom < obstacleRect.top + adjustment.top ||
      astronautRect.top + adjustment.top > obstacleRect.bottom - adjustment.bottom
  );
}


function gameOver() {
  // Disable controls if they are active
  removeTouchControls();
  deactivateKeyControls();
  // Stop any game interval timers to halt game progression
  clearInterval(gameInterval);
  clearInterval(moveObstaclesInterval);

  // Check if the current score is a new high score and update accordingly
  if (score > highScore) {
      highScore = score;
      document.getElementById('highScore').textContent = `High Score: ${highScore} km`;
  }

  // Display the final score in a pre-defined final score element
  document.getElementById('finalScore').textContent = `𐠒 Astronaut Died 𐠒`;

  // Make the game over screen visible
  const gameOverScreen = document.getElementById('gameOverScreen');
  gameOverScreen.classList.remove('hidden');
  gameOverScreen.classList.add('visible');

  // Update the start button text to indicate a game restart is possible
  const startButton = document.getElementById('startButton');
  startButton.textContent = 'Restart Voyage';

  // Ensure any previous event listeners are removed to prevent multiple bindings
  startButton.removeEventListener('click', startGame);
  startButton.addEventListener('click', function() {
      gameOverScreen.classList.add('hidden');
      gameOverScreen.classList.remove('visible');
      resetGame();
      startGame();
  }, { once: true });  // The listener will auto-remove after execution
}

function changeBackgroundColor() {
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  document.body.style.backgroundColor = randomColor;
  document.documentElement.style.backgroundColor = randomColor; // Also set on <html>
}


function startGame() {
  resetGame();
  activateKeyControls();  // Initially activate key controls
  if (isMobileDevice()) {
    addTouchControls(); // Enable touch controls for the astronaut
}
  const gameOverScreen = document.getElementById('gameOverScreen');
  gameOverScreen.classList.remove('visible');
  gameOverScreen.classList.add('hidden');

  
  gameTime = 0;
  score = 0;
  lastBackgroundChangeScore = 0; // Reset this variable at the start of each game
  scoreDisplay.textContent = '0 km';

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


startButton.addEventListener('click', startGame);


});







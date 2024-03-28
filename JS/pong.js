const ball = document.getElementById("ball");
const paddleA = document.getElementById("paddleA");
const paddleB = document.getElementById("paddleB");
const gameArea = document.getElementById("gameArea");
const gameWidth = gameArea.clientWidth;
const gameHeight = gameArea.clientHeight;
let ballSpeedX = 2, ballSpeedY = 2;
let paddleSpeed = 75, currentPaddleAPosition = 165, currentPaddleBPosition = 165;
let scoreA = 0, scoreB = 0;
const displayScoreA = document.getElementById("scoreA");
const displayScoreB = document.getElementById("scoreB");
let hitCount = 0; // To keep track of hits for difficulty
let gameInterval;
const startButton = document.getElementById("startButton");

// Device Detection--------------------

const isTouchDevice = () => {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0);
}



const controlInstructions = document.getElementById("controlInstructions");

if (isTouchDevice()) {
    // Display touch control instructions
    controlInstructions.textContent = "Swipe up and down to control the paddle.";
} else {
    // Display keyboard control instructions
    controlInstructions.textContent = "Use the UP and DOWN arrow keys to control the paddle.";
}


// End Device Detection--------------------

startButton.addEventListener("click", function() {
    // Reset scores
    scoreA = 0;
    scoreB = 0;
    currentPaddleAPosition = 165; // Reset AI paddle position
    currentPaddleBPosition = 165; // Reset player paddle position
    updateScore();
    resetBall();
    // Clear any existing game intervals and start a new one
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(moveBall, 10);
    startButton.disabled = false; // Make sure the button is always enabled when clicked
});



if (isTouchDevice()) {
    // Set up touch event listeners
    gameArea.addEventListener('touchstart', handleTouchStart, false);
    gameArea.addEventListener('touchmove', handleTouchMove, false);
    gameArea.addEventListener('touchend', handleTouchEnd, false);
} else {
document.addEventListener("keydown", function(event) {
    // Control player's paddle (right paddle) only if the game is active
    if (!startButton.disabled) {
        if (event.key === "ArrowUp" && currentPaddleBPosition > 0) {
            currentPaddleBPosition -= paddleSpeed;
            paddleB.style.top = `${currentPaddleBPosition}px`;
        } else if (event.key === "ArrowDown" && currentPaddleBPosition < gameHeight - paddleB.offsetHeight) {
            currentPaddleBPosition += paddleSpeed;
            paddleB.style.top = `${currentPaddleBPosition}px`;
        }
    }
});
}

function updateScore() {
    displayScoreA.textContent = scoreA;
    displayScoreB.textContent = scoreB;

    // Check if the player or AI has reached 10 points
    if (scoreA >= 10 || scoreB >= 10) {
        // Determine the winner
        const winner = scoreB >= 10 ? 'Player' : 'AI';
        
        // Display winning message and ask if they want to play again
        setTimeout(() => {
            alert(`${winner} wins the game! Click 'Start Game' to play again.`);
            // No need to disable the start button here. We allow them to restart the game.
        }, 100); // Short delay ensures the alert doesn't block other scripts
        
        // End the game
        clearInterval(gameInterval);
    }
}

function resetBall() {
    ball.style.left = "50%";
    ball.style.top = "50%";
    // Randomize ball direction on reset
    ballSpeedX = (Math.random() > 0.5 ? 2 : -2) * (1 + Math.random()); // Randomize speed and direction on the X axis
    ballSpeedY = (Math.random() > 0.5 ? 2 : -2) * (1 + Math.random()); // Randomize speed and direction on the Y axis
    hitCount = 0; // Reset hit count on score
}


function moveAI() {
    const paddleCenter = paddleA.offsetTop + paddleA.offsetHeight / 2;
    let targetY = ball.offsetTop + (ball.offsetHeight / 2) - (paddleA.offsetHeight / 2);

    // Predictive Adjustment: Adjust target Y based on ball's direction and speed
    // This is a basic prediction, you can make it more complex for better AI
    if (ballSpeedY > 0) {
        targetY += ballSpeedY * 10; // Predictive adjustment for downward movement
    } else {
        targetY += ballSpeedY * 10; // Predictive adjustment for upward movement
    }

    // AI Movement Speed Adjustment: Move faster towards the predicted position
    if (targetY < paddleCenter) {
        currentPaddleAPosition -= 4; // Increase this value to make AI faster
    } else {
        currentPaddleAPosition += 4; // Increase this value to make AI faster
    }

    // Ensure the paddle stays within the game area
    currentPaddleAPosition = Math.max(currentPaddleAPosition, 0);
    currentPaddleAPosition = Math.min(currentPaddleAPosition, gameHeight - paddleA.offsetHeight);
    paddleA.style.top = `${currentPaddleAPosition}px`;
}

function moveBall() {
    const ballCurrentX = ball.offsetLeft + ballSpeedX;
    const ballCurrentY = ball.offsetTop + ballSpeedY;

    // Wall collision for X
    if (ballCurrentX <= 0 || ballCurrentX + ball.offsetWidth >= gameWidth) {
        ballSpeedX *= -1;
        // Adjust position to ensure it's not out of bounds
        const overlapX = ballCurrentX <= 0 ? -ballCurrentX : gameWidth - (ballCurrentX + ball.offsetWidth);
        ball.style.left = `${ball.offsetLeft + overlapX * 2}px`;
    }
    // Wall collision for Y
    if (ballCurrentY <= 0 || ballCurrentY + ball.offsetHeight >= gameHeight) {
        ballSpeedY *= -1;
        // Adjust position to ensure it's not out of bounds
        const overlapY = ballCurrentY <= 0 ? -ballCurrentY : gameHeight - (ballCurrentY + ball.offsetHeight);
        ball.style.top = `${ball.offsetTop + overlapY * 2}px`;
    }
    // Paddle collision
    if ((ballCurrentX <= paddleA.offsetLeft + paddleA.offsetWidth && ballCurrentY + ball.offsetHeight >= paddleA.offsetTop && ballCurrentY <= paddleA.offsetTop + paddleA.offsetHeight) ||
        (ballCurrentX + ball.offsetWidth >= paddleB.offsetLeft && ballCurrentY + ball.offsetHeight >= paddleB.offsetTop && ballCurrentY <= paddleB.offsetTop + paddleB.offsetHeight)) {
        ballSpeedX *= -1;
    }
    ball.style.left = `${ball.offsetLeft + ballSpeedX}px`;
    ball.style.top = `${ball.offsetTop + ballSpeedY}px`;

        // Update for scoring
        if (ballCurrentX <= 0) {
            scoreB++;
            updateScore();
            resetBall();
            return; // Skip this turn to avoid extra ball movement
        } else if (ballCurrentX + ball.offsetWidth >= gameWidth) {
            scoreA++;
            updateScore();
            resetBall();
            return; // Skip this turn
        }
    
        // Update for increasing difficulty
        if ((ballCurrentX <= paddleA.offsetLeft + paddleA.offsetWidth && ballCurrentY + ball.offsetHeight >= paddleA.offsetTop && ballCurrentY <= paddleA.offsetTop + paddleA.offsetHeight) ||
            (ballCurrentX + ball.offsetWidth >= paddleB.offsetLeft && ballCurrentY + ball.offsetHeight >= paddleB.offsetTop && ballCurrentY <= paddleB.offsetTop + paddleB.offsetHeight)) {
            hitCount++;
            if (hitCount % 5 === 0) { // Increase speed every 5 hits
                ballSpeedX *= 1.1;
                ballSpeedY *= 1.1;
            }
        }
        moveAI(); // Update to include AI movement in the game loop
    
}
// ---------------TOUCH

let touchStartY = 0;
let touchEndY = 0;

// Function to handle the start of a touch
function handleTouchStart(evt) {
    touchStartY = evt.touches[0].clientY;
}

// Function to handle the end of a touch
function handleTouchMove(evt) {
    touchEndY = evt.touches[0].clientY;
}

// Function to move the paddle based on the swipe
function handleTouchEnd() {
    if (touchStartY > touchEndY) {
        // Swipe Up
        currentPaddleBPosition -= 20; // Adjust value as needed for responsiveness
    } else if (touchStartY < touchEndY) {
        // Swipe Down
        currentPaddleBPosition += 20; // Adjust value as needed
    }

    // Ensure the paddle stays within game boundaries
    currentPaddleBPosition = Math.max(currentPaddleBPosition, 0);
    currentPaddleBPosition = Math.min(currentPaddleBPosition, gameArea.clientHeight - paddleB.clientHeight);

    // Update paddle position
    paddleB.style.top = `${currentPaddleBPosition}px`;
}

// Adding event listeners for touch
gameArea.addEventListener('touchstart', handleTouchStart, false);
gameArea.addEventListener('touchmove', handleTouchMove, false);
gameArea.addEventListener('touchend', handleTouchEnd, false);
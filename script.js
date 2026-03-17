// =============================================
// GAME STATE VARIABLES
// =============================================

let gameRunning = false; // Keeps track of whether game is active or not
let score = 0; // Current player score
let timeRemaining = 30; // Game countdown timer
let dropMaker; // Will store our timer that creates drops regularly
let gameTimer; // Will store our countdown timer
const GAME_DURATION = 30; // Total game time in seconds
const WIN_SCORE = 20; // Score needed to win
const CLEAN_DROP_VALUE = 1; // Points for clean water
const DIRTY_DROP_VALUE = 2; // Points lost for dirty water
const DROP_SPAWN_RATE = 800; // Milliseconds between drops

// Get DOM elements
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const messageDisplay = document.getElementById("message-display");
const winOverlay = document.getElementById("win-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const confettiCanvas = document.getElementById("confetti-canvas");

// =============================================
// EVENT LISTENERS
// =============================================

// Wait for button clicks to control game
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

// =============================================
// MAIN GAME FUNCTIONS
// =============================================

/**
 * Starts the game - initializes timers and drop spawning
 */
function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeRemaining = GAME_DURATION;

  // Update displays
  updateScore(0);
  updateTimer();
  startBtn.disabled = true;
  resetBtn.disabled = true;

  // Clear any existing drops
  const existingDrops = document.querySelectorAll(".water-drop");
  existingDrops.forEach(drop => drop.remove());

  // Hide overlays
  winOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");

  // Create new drops every spawn rate milliseconds
  dropMaker = setInterval(createDrop, DROP_SPAWN_RATE);

  // Start countdown timer
  gameTimer = setInterval(countdown, 1000);
}

/**
 * Creates a new water drop at a random position
 * Randomly determines if it's a clean (blue) or dirty (brown) drop
 */
function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Randomly decide if it's a clean or dirty drop (70% clean, 30% dirty)
  const isClean = Math.random() < 0.7;
  if (isClean) {
    drop.classList.add("clean-drop");
  } else {
    drop.classList.add("bad-drop");
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = xPosition + "px";

  // Make drops fall based on game container height
  const gameHeight = gameContainer.offsetHeight;
  const fallDuration = (gameHeight / 100) * 3; // Adjust speed based on container size
  drop.style.animationDuration = fallDuration + "s";

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Add click event listener to the drop
  drop.addEventListener("click", (e) => handleDropClick(e, drop, isClean));

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    if (drop.parentElement) {
      drop.remove(); // Clean up drops that weren't caught
    }
  });
}

/**
 * Handles when a drop is clicked
 * Updates score and shows feedback message
 */
function handleDropClick(event, drop, isClean) {
  // Prevent default behavior
  event.stopPropagation();

  // Add clicked animation
  drop.classList.add("clicked");

  // Update score and show message
  if (isClean) {
    updateScore(CLEAN_DROP_VALUE);
    showMessage(`+${CLEAN_DROP_VALUE} Clean Water!`, "positive");
  } else {
    updateScore(-DIRTY_DROP_VALUE);
    showMessage(`-${DIRTY_DROP_VALUE} Dirty Water!`, "negative");
  }

  // Remove the drop after animation
  setTimeout(() => {
    if (drop.parentElement) {
      drop.remove();
    }
  }, 600);

  // Check for win condition
  if (score >= WIN_SCORE && gameRunning) {
    endGameWin();
  }
}

/**
 * Updates the score display and game state
 */
function updateScore(points) {
  score += points;
  // Ensure score doesn't go below 0
  if (score < 0) score = 0;
  scoreDisplay.textContent = score;
}

/**
 * Shows a temporary feedback message to the player
 */
function showMessage(text, type) {
  messageDisplay.textContent = text;
  messageDisplay.classList.remove("show-positive", "show-negative");

  // Trigger reflow to restart animation
  void messageDisplay.offsetWidth;

  if (type === "positive") {
    messageDisplay.classList.add("show-positive");
  } else if (type === "negative") {
    messageDisplay.classList.add("show-negative");
  }
}

/**
 * Starts the countdown timer for the game
 */
function countdown() {
  timeRemaining--;
  updateTimer();

  // End game when time runs out
  if (timeRemaining <= 0) {
    endGameTimeout();
  }
}

/**
 * Updates the timer display
 */
function updateTimer() {
  timeDisplay.textContent = timeRemaining;
}

/**
 * Ends the game when player reaches win score
 */
function endGameWin() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  startBtn.disabled = false;
  resetBtn.disabled = false;

  // Remove all drops from screen
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());

  // Show win overlay
  winOverlay.classList.remove("hidden");

  // Trigger confetti celebration
  triggerConfetti();

  // Setup play again button
  const playAgainBtn = document.getElementById("play-again-btn");
  playAgainBtn.addEventListener("click", resetGame);
}

/**
 * Ends the game when time runs out
 */
function endGameTimeout() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  startBtn.disabled = false;
  resetBtn.disabled = false;

  // Remove all drops from screen
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());

  // Show game over overlay
  document.getElementById("final-score").textContent = score;
  gameOverOverlay.classList.remove("hidden");

  // Setup replay button
  const replayBtn = document.getElementById("replay-btn");
  replayBtn.addEventListener("click", resetGame);
}

/**
 * Resets the game to initial state
 */
function resetGame() {
  // Stop the game if running
  if (gameRunning) {
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(gameTimer);
  }

  // Reset variables
  score = 0;
  timeRemaining = GAME_DURATION;

  // Update displays
  scoreDisplay.textContent = "0";
  timeDisplay.textContent = "30";
  messageDisplay.textContent = "";
  messageDisplay.classList.remove("show-positive", "show-negative");

  // Hide overlays
  winOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");

  // Remove all drops
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());

  // Enable buttons
  startBtn.disabled = false;
  resetBtn.disabled = false;

  // Clear any animation event listeners
  const allDivs = gameContainer.querySelectorAll("div");
  allDivs.forEach(div => {
    if (div !== messageDisplay) {
      div.remove();
    }
  });
}

// =============================================
// CONFETTI ANIMATION
// =============================================

/**
 * Triggers a confetti celebration using canvas
 * Creates falling confetti particles
 */
function triggerConfetti() {
  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");

  // Set canvas size to window size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Create confetti particles
  const particles = [];
  const particleCount = 100;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 5 + 3,
      size: Math.random() * 4 + 2,
      color: getRandomColor(),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });
  }

  // Animation function
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    let activeParticles = 0;

    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Gravity
      particle.rotation += particle.rotationSpeed;

      // Draw particle
      if (particle.y < canvas.height) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();
        activeParticles++;
      }
    });

    // Continue animation if there are active particles
    if (activeParticles > 0) {
      requestAnimationFrame(animate);
    } else {
      // Clear canvas when done
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

/**
 * Returns a random charity: water brand color for confetti
 */
function getRandomColor() {
  const colors = [
    "#FFC907", // Yellow
    "#2E9DF7", // Blue
    "#8BD1CB", // Light Blue
    "#4FCB53", // Green
    "#FF902A", // Orange
    "#F5402C", // Red
    "#159A48", // Dark Green
    "#F16061", // Pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// =============================================
// RESPONSIVE ADJUSTMENTS
// =============================================

/**
 * Handle window resize for responsive design
 */
window.addEventListener("resize", () => {
  const canvas = confettiCanvas;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

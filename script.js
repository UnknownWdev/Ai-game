// ============================
// Config
// ============================
const COLORS = [
  { name: 'Coral',  hex: '#FF6B6B' },
  { name: 'Amber',  hex: '#FFB84C' },
  { name: 'Lime',   hex: '#A8E063' },
  { name: 'Cyan',   hex: '#4CD6E0' },
  { name: 'Violet', hex: '#B18CFF' },
  { name: 'Rose',   hex: '#FF7FC0' },
];

const GAME_LENGTH = 45;      // seconds
const BASE_SPAWN_MS = 850;   // starting time between bubbles
const MIN_SPAWN_MS = 320;    // fastest spawn rate at high score
const BASE_LIFETIME_MS = 3400;
const HIGH_SCORE_KEY = 'colorRushHighScore';

// ============================
// Elements
// ============================
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');

const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');

const startHighScoreEl = document.getElementById('startHighScore');
const finalScoreEl = document.getElementById('finalScore');
const finalHighScoreEl = document.getElementById('finalHighScore');
const endHeadingEl = document.getElementById('endHeading');
const endEyebrowEl = document.getElementById('endEyebrow');

const scoreValueEl = document.getElementById('scoreValue');
const comboValueEl = document.getElementById('comboValue');
const timeValueEl = document.getElementById('timeValue');
const timerFillEl = document.getElementById('timerFill');

const targetChipEl = document.getElementById('targetChip');
const targetSwatchEl = document.getElementById('targetSwatch');
const targetNameEl = document.getElementById('targetName');

const playArea = document.getElementById('playArea');

// ============================
// State
// ============================
let score = 0;
let combo = 1;
let timeLeft = GAME_LENGTH;
let targetColor = COLORS[0];
let spawnTimeoutId = null;
let tickIntervalId = null;
let isPlaying = false;

// ============================
// Helpers
// ============================
function getHighScore() {
  return Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
}

function setHighScore(value) {
  localStorage.setItem(HIGH_SCORE_KEY, String(value));
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function currentSpawnDelay() {
  // Spawn rate ramps up with score, clamped at MIN_SPAWN_MS
  const ramped = BASE_SPAWN_MS - score * 6;
  return Math.max(MIN_SPAWN_MS, ramped);
}

function currentLifetime() {
  const ramped = BASE_LIFETIME_MS - score * 8;
  return Math.max(1600, ramped);
}

// ============================
// Target color
// ============================
function pickTarget() {
  let next = randomFrom(COLORS);
  // avoid repeating the same target twice in a row when possible
  if (COLORS.length > 1) {
    while (next.name === targetColor.name) {
      next = randomFrom(COLORS);
    }
  }
  targetColor = next;
  targetSwatchEl.style.background = targetColor.hex;
  targetSwatchEl.style.color = targetColor.hex;
  targetNameEl.textContent = targetColor.name;
  targetChipEl.classList.remove('pulse');
  // force reflow so the animation can retrigger
  void targetChipEl.offsetWidth;
  targetChipEl.classList.add('pulse');
}

// ============================
// Bubbles
// ============================
function spawnBubble() {
  if (!isPlaying) return;

  const bubble = document.createElement('button');
  bubble.className = 'bubble';
  bubble.type = 'button';
  bubble.setAttribute('aria-label', 'bubble');

  const color = randomFrom(COLORS);
  const size = 40 + Math.random() * 34; // 40–74px
  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;
  const x = Math.random() * (areaWidth - size);
  const y = Math.random() * (areaHeight - size);
  const lifetime = currentLifetime();

  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.style.background = `radial-gradient(circle at 32% 28%, #ffffff55, ${color.hex}dd 60%, ${color.hex}aa)`;
  bubble.style.boxShadow = `0 0 22px 2px ${color.hex}66`;
  bubble.style.animationDuration = `0.25s, ${lifetime}ms`;

  bubble.dataset.color = color.name;

  bubble.addEventListener('click', () => handleBubbleClick(bubble, color));

  const removeTimer = setTimeout(() => {
    bubble.remove();
  }, lifetime);
  bubble.dataset.timerId = removeTimer;

  playArea.appendChild(bubble);

  spawnTimeoutId = setTimeout(spawnBubble, currentSpawnDelay());
}

function handleBubbleClick(bubble, color) {
  if (!isPlaying) return;

  clearTimeout(Number(bubble.dataset.timerId));

  if (color.name === targetColor.name) {
    // correct pop
    score += 10 * combo;
    combo += 1;
    bubble.classList.add('pop-good');
    pickTarget();
  } else {
    // wrong pop
    score = Math.max(0, score - 5);
    combo = 1;
    bubble.classList.add('pop-bad');
    playArea.classList.remove('shake');
    void playArea.offsetWidth;
    playArea.classList.add('shake');
  }

  scoreValueEl.textContent = score;
  comboValueEl.textContent = `x${combo}`;
  setTimeout(() => bubble.remove(), 350);
}

// ============================
// Timer
// ============================
function tick() {
  timeLeft -= 1;
  timeValueEl.textContent = timeLeft;
  timerFillEl.style.width = `${(timeLeft / GAME_LENGTH) * 100}%`;
  timerFillEl.classList.toggle('is-low', timeLeft <= 10);

  if (timeLeft <= 0) {
    endGame();
  }
}

// ============================
// Game flow
// ============================
function resetState() {
  score = 0;
  combo = 1;
  timeLeft = GAME_LENGTH;
  scoreValueEl.textContent = '0';
  comboValueEl.textContent = 'x1';
  timeValueEl.textContent = String(GAME_LENGTH);
  timerFillEl.style.width = '100%';
  timerFillEl.classList.remove('is-low');
  playArea.innerHTML = '';
}

function startGame() {
  resetState();
  pickTarget();

  startScreen.classList.add('is-hidden');
  endScreen.classList.add('is-hidden');
  gameScreen.classList.remove('is-hidden');

  isPlaying = true;
  tickIntervalId = setInterval(tick, 1000);
  spawnTimeoutId = setTimeout(spawnBubble, 300);
}

function endGame() {
  isPlaying = false;
  clearInterval(tickIntervalId);
  clearTimeout(spawnTimeoutId);

  const previousHigh = getHighScore();
  const isNewHigh = score > previousHigh;
  if (isNewHigh) setHighScore(score);

  finalScoreEl.textContent = score;
  finalHighScoreEl.textContent = getHighScore();
  endEyebrowEl.textContent = isNewHigh ? 'New best score' : "Time's up";
  endHeadingEl.textContent = isNewHigh ? 'New high score!' : 'Nice run';

  gameScreen.classList.add('is-hidden');
  endScreen.classList.remove('is-hidden');
}

// ============================
// Init
// ============================
startHighScoreEl.textContent = getHighScore();
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

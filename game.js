class BadgerGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.badger = document.getElementById('badger');
        this.bear = document.getElementById('bear');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.hitIndicator = document.getElementById('hitIndicator');
        
        this.gameState = {
            isRunning: false,
            score: 0,
            timeLeft: 60,
            badgerPos: { x: 100, y: 300 },
            bearPos: { x: 400, y: 300 },
            keys: {},
            gameInterval: null,
            timerInterval: null,
            bearMoveInterval: null
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.resetGame();
    }
    
    setupEventListeners() {
        // Button events
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mobile drag/tap controls
        let dragActive = false;
        let dragStart = null;
        let dragDirection = null;
        let dragInterval = null;
        const moveSpeed = 5; // Fixed pace

        this.gameArea.addEventListener('touchstart', (e) => {
            if (!this.gameState.isRunning) return;
            if (e.touches.length === 1) {
                dragActive = true;
                dragStart = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
                dragDirection = null;
                // Start moving at fixed pace
                dragInterval = setInterval(() => {
                    if (dragDirection) {
                        let { x, y } = this.gameState.badgerPos;
                        x += moveSpeed * dragDirection.x;
                        y += moveSpeed * dragDirection.y;
                        // Clamp to bounds
                        x = Math.max(0, Math.min(this.gameArea.clientWidth - 50, x));
                        y = Math.max(0, Math.min(this.gameArea.clientHeight - 50, y));
                        this.gameState.badgerPos = { x, y };
                        this.updatePositions();
                    }
                }, 1000/30); // 30 FPS
            }
        });

        this.gameArea.addEventListener('touchmove', (e) => {
            if (!dragActive || !this.gameState.isRunning) return;
            const touch = e.touches[0];
            const dx = touch.clientX - dragStart.x;
            const dy = touch.clientY - dragStart.y;
            // Normalize direction
            const mag = Math.sqrt(dx*dx + dy*dy);
            if (mag > 10) {
                dragDirection = { x: dx/mag, y: dy/mag };
            } else {
                dragDirection = null;
            }
        });

        this.gameArea.addEventListener('touchend', (e) => {
            dragActive = false;
            dragDirection = null;
            if (dragInterval) clearInterval(dragInterval);
        });

        // Tap to jump/attack
        this.gameArea.addEventListener('touchend', (e) => {
            if (!dragActive && this.gameState.isRunning) {
                this.jump();
                this.checkHit();
            }
        });
    }
    
    handleKeyDown(e) {
        if (!this.gameState.isRunning) return;
        
        e.preventDefault();
        this.gameState.keys[e.code] = true;
        
        // Handle spacebar for jumping/attacking
        if (e.code === 'Space') {
            this.jump();
            this.checkHit();
        }
    }
    
    handleKeyUp(e) {
        this.gameState.keys[e.code] = false;
    }
    
    startGame() {
        this.gameState.isRunning = true;
        this.gameState.timeLeft = 60;
        this.gameState.score = 0;
        
        this.startBtn.disabled = true;
        this.startBtn.textContent = 'GAME RUNNING...';
        
        // Start game loops
        this.gameState.gameInterval = setInterval(() => this.gameLoop(), 1000/60); // 60 FPS
        this.gameState.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.gameState.bearMoveInterval = setInterval(() => this.moveBearRandomly(), 2000);
        
        this.updateDisplay();
    }
    
    gameLoop() {
        if (!this.gameState.isRunning) return;
        
        this.handleMovement();
        this.updatePositions();
    }
    
    handleMovement() {
        const speed = 5;
        let { x, y } = this.gameState.badgerPos;
        
        // WASD movement
        if (this.gameState.keys['KeyW'] || this.gameState.keys['ArrowUp']) {
            y = Math.max(0, y - speed);
        }
        if (this.gameState.keys['KeyS'] || this.gameState.keys['ArrowDown']) {
            y = Math.min(this.gameArea.clientHeight - 50, y + speed);
        }
        if (this.gameState.keys['KeyA'] || this.gameState.keys['ArrowLeft']) {
            x = Math.max(0, x - speed);
        }
        if (this.gameState.keys['KeyD'] || this.gameState.keys['ArrowRight']) {
            x = Math.min(this.gameArea.clientWidth - 50, x + speed);
        }
        
        this.gameState.badgerPos = { x, y };
    }
    
    jump() {
        // Add jump animation
        this.badger.style.transform = 'scale(1.2) translateY(-10px)';
        setTimeout(() => {
            this.badger.style.transform = 'scale(1) translateY(0)';
        }, 200);
    }
    
    checkHit() {
        const badgerRect = this.badger.getBoundingClientRect();
        const bearRect = this.bear.getBoundingClientRect();
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        
        // Calculate distance between badger and bear
        const badgerCenter = {
            x: badgerRect.left + badgerRect.width / 2 - gameAreaRect.left,
            y: badgerRect.top + badgerRect.height / 2 - gameAreaRect.top
        };
        
        const bearCenter = {
            x: bearRect.left + bearRect.width / 2 - gameAreaRect.left,
            y: bearRect.top + bearRect.height / 2 - gameAreaRect.top
        };
        
        const distance = Math.sqrt(
            Math.pow(badgerCenter.x - bearCenter.x, 2) + 
            Math.pow(badgerCenter.y - bearCenter.y, 2)
        );
        
        // If close enough to hit
        if (distance < 80) {
            this.hit();
        }
    }
    
    hit() {
        // Increase score
        this.gameState.score++;
        this.updateDisplay();
        
        // Show hit indicator
        this.showHitIndicator();
        
        // Bear swats badger away
        this.bearSwat();
        
        // Play hit sound effect (if you want to add audio)
        this.playHitSound();
    }
    
    showHitIndicator() {
        const bearRect = this.bear.getBoundingClientRect();
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        
        this.hitIndicator.style.left = (bearRect.left - gameAreaRect.left) + 'px';
        this.hitIndicator.style.top = (bearRect.top - gameAreaRect.top - 30) + 'px';
        this.hitIndicator.style.opacity = '1';
        this.hitIndicator.style.animation = 'hitAnimation 0.5s ease-out';
        
        setTimeout(() => {
            this.hitIndicator.style.opacity = '0';
            this.hitIndicator.style.animation = '';
        }, 500);
    }
    
    bearSwat() {
        // Bear swats badger away
        const swatDistance = 100;
        const angle = Math.random() * Math.PI * 2; // Random direction
        
        let newX = this.gameState.badgerPos.x + Math.cos(angle) * swatDistance;
        let newY = this.gameState.badgerPos.y + Math.sin(angle) * swatDistance;
        
        // Keep badger in bounds
        newX = Math.max(0, Math.min(this.gameArea.clientWidth - 50, newX));
        newY = Math.max(0, Math.min(this.gameArea.clientHeight - 50, newY));
        
        this.gameState.badgerPos = { x: newX, y: newY };
        
        // Bear animation
        this.bear.style.transform = 'scale(1.3) rotate(15deg)';
        setTimeout(() => {
            this.bear.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
        
        this.updatePositions();
    }
    
    moveBearRandomly() {
        if (!this.gameState.isRunning) return;
        
        // Move bear to random position
        const maxX = this.gameArea.clientWidth - 70;
        const maxY = this.gameArea.clientHeight - 70;
        
        this.gameState.bearPos = {
            x: Math.random() * maxX,
            y: Math.random() * maxY
        };
        
        this.updatePositions();
    }
    
    playHitSound() {
        // Create a simple beep sound
        if (window.AudioContext || window.webkitAudioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }
    
    updatePositions() {
        this.badger.style.left = this.gameState.badgerPos.x + 'px';
        this.badger.style.top = this.gameState.badgerPos.y + 'px';
        
        this.bear.style.left = this.gameState.bearPos.x + 'px';
        this.bear.style.top = this.gameState.bearPos.y + 'px';
    }
    
    updateTimer() {
        this.gameState.timeLeft--;
        this.updateDisplay();
        
        if (this.gameState.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.gameState.score;
        this.timerElement.textContent = this.gameState.timeLeft;
    }
    
    endGame() {
        this.gameState.isRunning = false;
        // Clear intervals
        if (this.gameState.gameInterval) clearInterval(this.gameState.gameInterval);
        if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);
        if (this.gameState.bearMoveInterval) clearInterval(this.gameState.bearMoveInterval);
        // Update button
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'START GAME';
        // Show score dashboard modal
        this.showScoreModal();
    }

    showScoreModal() {
        const scoreModal = document.getElementById('scoreModal');
        const finalScore = document.getElementById('finalScore');
        finalScore.textContent = this.gameState.score;
        scoreModal.style.display = 'block';
        // Share to X button
        const shareXBtn = document.getElementById('shareXBtn');
        shareXBtn.onclick = () => {
            const tweetText = encodeURIComponent(`I scored ${this.gameState.score} hits in 1 minute on the Honey Badger Don't Care game! 🦡🐻\nPlay now: HoneyBadgerPump.sol #BADGER #HoneyBadgerDontCare`);
            window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
        };
        // Close modal button
        const closeScoreModal = document.getElementById('closeScoreModal');
        closeScoreModal.onclick = () => {
            scoreModal.style.display = 'none';
        };
        // Close modal on outside click
        scoreModal.onclick = (e) => {
            if (e.target === scoreModal) scoreModal.style.display = 'none';
        };
        // Close modal with Escape key
        document.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape' && scoreModal.style.display === 'block') {
                scoreModal.style.display = 'none';
                document.removeEventListener('keydown', escListener);
            }
        });
    }
    
    resetGame() {
        // Stop any running game
        this.gameState.isRunning = false;
        
        if (this.gameState.gameInterval) clearInterval(this.gameState.gameInterval);
        if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);
        if (this.gameState.bearMoveInterval) clearInterval(this.gameState.bearMoveInterval);
        
        // Reset state
        this.gameState.score = 0;
        this.gameState.timeLeft = 60;
        this.gameState.badgerPos = { x: 100, y: 300 };
        this.gameState.bearPos = { x: 400, y: 300 };
        this.gameState.keys = {};
        
        // Update display
        this.updateDisplay();
        this.updatePositions();
        
        // Reset button
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'START GAME';
        
        // Hide hit indicator
        this.hitIndicator.style.opacity = '0';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BadgerGame();
});

// Prevent page scrolling with arrow keys and spacebar
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});
let score = 0;
let timeLeft = 60;
let timer;
let currentQuestion;
let playerName = '';
let difficultyLevel = 1;
const pointsPerLevel = 5;

const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');
const startButton = document.getElementById('start');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const nameInput = document.getElementById('player-name');
const submitNameButton = document.getElementById('submit-name');
const nameInputArea = document.getElementById('name-input-area');
const gameArea = document.getElementById('game-area');
const playerNameDisplay = document.getElementById('player-name-display');
const leaderboardElement = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');
const logoutButton = document.getElementById('logout');
const difficultyElement = document.getElementById('difficulty-level');
const wrongAnswerX = document.getElementById('wrong-answer-x');

const ADMIN_EMAIL = 'kirk.sarah@gmail.com';
let isAdmin = false;

const adminPanel = document.getElementById('admin-panel');
const clearLeaderboardButton = document.getElementById('clear-leaderboard');
const addBonusTimeButton = document.getElementById('add-bonus-time');
const playerEmailInput = document.getElementById('player-email');

// Add these variables at the top of your script
let gameDuration = 60;
let gameStats = {
    gamesPlayed: 0,
    totalScore: 0,
    highestScore: 0,
    averageDifficulty: 0
};

// Add these new elements
const gameDurationInput = document.getElementById('game-duration');
const setDurationButton = document.getElementById('set-duration');
const difficultyRateInput = document.getElementById('difficulty-rate');
const setDifficultyRateButton = document.getElementById('set-difficulty-rate');
const viewStatsButton = document.getElementById('view-stats');

// Add this near the top of your file with other element selections
const resetGlobalLeaderboardButton = document.getElementById('reset-global-leaderboard');

function generateQuestion() {
    const operations = ['+', '-', '*'];
    let num1, num2, operation;

    switch (difficultyLevel) {
        case 1:
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            operation = operations[Math.floor(Math.random() * 2)]; // Only +, -
            break;
        case 2:
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            operation = operations[Math.floor(Math.random() * 3)]; // +, -, *
            break;
        case 3:
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            operation = operations[Math.floor(Math.random() * 3)]; // +, -, *
            break;
        default:
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * 100) + 1;
            operation = operations[Math.floor(Math.random() * 3)]; // +, -, *
    }

    const question = `${num1} ${operation} ${num2}`;
    const answer = eval(question);

    return { question, answer };
}

function updateQuestion() {
    currentQuestion = generateQuestion();
    questionElement.textContent = currentQuestion.question;
    questionElement.style.animation = 'none';
    questionElement.offsetHeight; // Trigger reflow
    questionElement.style.animation = null;
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (userAnswer === currentQuestion.answer) {
        score++;
        scoreElement.textContent = score;
        scoreElement.style.animation = 'pulse 0.5s';
        
        // Check if difficulty should increase
        if (score % pointsPerLevel === 0) {
            increaseDifficulty();
        }
    } else {
        // Show the big red X
        wrongAnswerX.classList.remove('hidden');
        wrongAnswerX.classList.add('show');
        
        // Shake the game area
        gameArea.classList.add('shake-area');
        setTimeout(() => {
            gameArea.classList.remove('shake-area');
        }, 500);
        
        // Hide the X with a fade-out effect
        setTimeout(() => {
            wrongAnswerX.style.transition = 'opacity 0.5s ease-out';
            wrongAnswerX.style.opacity = '0';
            setTimeout(() => {
                wrongAnswerX.classList.remove('show');
                wrongAnswerX.classList.add('hidden');
                wrongAnswerX.style.transition = '';
                wrongAnswerX.style.opacity = '';
            }, 500);
        }, 1000);

        // Add shake animation for wrong answers
        answerInput.classList.add('shake');
        setTimeout(() => {
            answerInput.classList.remove('shake');
        }, 500);
    }
    answerInput.value = '';
    updateQuestion();
}

function increaseDifficulty() {
    difficultyLevel++;
    difficultyElement.textContent = difficultyLevel;
    difficultyElement.style.animation = 'pulse 0.5s, glow 1.5s infinite alternate';
    setTimeout(() => {
        difficultyElement.style.animation = '';
    }, 1500);
    console.log(`Difficulty increased to level ${difficultyLevel}`);
}

function updateTimer() {
    timeLeft--;
    timeElement.textContent = timeLeft;
    if (timeLeft === 0) {
        endGame();
    }
}

function startGame() {
    score = 0;
    timeLeft = gameDuration;
    difficultyLevel = 1;
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    startButton.style.display = 'none';
    submitButton.disabled = false;
    answerInput.disabled = false;
    gameArea.style.display = 'block';
    leaderboardElement.style.display = 'none';
    updateQuestion();
    timer = setInterval(updateTimer, 1000);
    difficultyElement.textContent = difficultyLevel;
    
    // Add animations to stats
    const statElements = document.querySelectorAll('#stats p');
    statElements.forEach((el, index) => {
        el.style.animationDelay = `${0.1 * index}s`;
    });
}

function endGame() {
    clearInterval(timer);
    questionElement.textContent = `Game Over! Your score: ${score}`;
    submitButton.disabled = true;
    answerInput.disabled = true;
    startButton.style.display = 'block';
    gameArea.style.display = 'none';
    updateLeaderboard();
    leaderboardElement.style.display = 'block';
    
    // Update game statistics
    gameStats.gamesPlayed++;
    gameStats.totalScore += score;
    gameStats.highestScore = Math.max(gameStats.highestScore, score);
    gameStats.averageDifficulty = ((gameStats.averageDifficulty * (gameStats.gamesPlayed - 1)) + difficultyLevel) / gameStats.gamesPlayed;
    
    // Add animations to leaderboard items
    const leaderboardItems = document.querySelectorAll('#leaderboard-list li');
    leaderboardItems.forEach((el, index) => {
        el.style.animationDelay = `${0.1 * index}s`;
    });
}

function saveUsername(name) {
    localStorage.setItem('mathWizardUsername', name);
}

function getSavedUsername() {
    return localStorage.getItem('mathWizardUsername');
}

function submitName() {
    playerName = nameInput.value.trim();
    const playerEmail = playerEmailInput.value.trim();
    if (playerName && playerEmail) {
        saveUsername(playerName);
        checkAdminStatus(playerEmail);
        showGameInterface();
    } else {
        alert('Please enter both your name and email.');
    }
}

function checkAdminStatus(email) {
    isAdmin = (email === 'kirk.sarah@gmail.com');
    adminPanel.style.display = isAdmin ? 'block' : 'none';
}

function showGameInterface() {
    nameInputArea.style.display = 'none';
    startButton.style.display = 'block';
    logoutButton.style.display = 'block';
    playerNameDisplay.textContent = playerName;
    if (isAdmin) {
        adminPanel.style.display = 'block';
    }
}

function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('mathWizardLeaderboard')) || [];
    if (playerName && score > 0) {
        leaderboard.push({ name: playerName, score: score });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); // Keep only top 10 scores
    localStorage.setItem('mathWizardLeaderboard', JSON.stringify(leaderboard));
    
    leaderboardList.innerHTML = '';
    if (leaderboard.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No scores yet. Be the first!';
        leaderboardList.appendChild(li);
    } else {
        leaderboard.forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `${entry.name}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    }
}

function createStars() {
    const starsContainer = document.querySelector('.stars');
    const numberOfStars = 100;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }
}

function logout() {
    localStorage.removeItem('mathWizardUsername');
    playerName = '';
    isAdmin = false;
    nameInputArea.style.display = 'block';
    startButton.style.display = 'none';
    logoutButton.style.display = 'none';
    adminPanel.style.display = 'none';
    playerNameDisplay.textContent = '';
    nameInput.value = '';
    playerEmailInput.value = '';
}

function clearLeaderboard() {
    if (isAdmin) {
        localStorage.removeItem('mathWizardLeaderboard');
        updateLeaderboard();
        alert('Leaderboard cleared!');
    }
}

function addBonusTime() {
    if (isAdmin && timeLeft > 0) {
        timeLeft += 30;
        timeElement.textContent = timeLeft;
        alert('30 seconds bonus time added!');
    }
}

// Add this new function to handle resetting the global leaderboard
function resetGlobalLeaderboard() {
    if (isAdmin) {
        if (confirm('Are you sure you want to reset the global leaderboard? This action cannot be undone.')) {
            localStorage.removeItem('mathWizardLeaderboard');
            updateLeaderboard();
            alert('Global leaderboard has been reset!');
        }
    }
}

// Add these new functions for admin controls
function setGameDuration() {
    if (isAdmin) {
        const newDuration = parseInt(gameDurationInput.value);
        if (newDuration >= 10 && newDuration <= 300) {
            gameDuration = newDuration;
            alert(`Game duration set to ${gameDuration} seconds.`);
        } else {
            alert('Please enter a duration between 10 and 300 seconds.');
        }
    }
}

function setDifficultyRate() {
    if (isAdmin) {
        const newRate = parseInt(difficultyRateInput.value);
        if (newRate >= 1 && newRate <= 20) {
            pointsPerLevel = newRate;
            alert(`Difficulty increase rate set to every ${pointsPerLevel} points.`);
        } else {
            alert('Please enter a rate between 1 and 20 points.');
        }
    }
}

function viewGameStats() {
    if (isAdmin) {
        const averageScore = gameStats.gamesPlayed > 0 ? (gameStats.totalScore / gameStats.gamesPlayed).toFixed(2) : 0;
        alert(`Game Statistics:
        Games Played: ${gameStats.gamesPlayed}
        Total Score: ${gameStats.totalScore}
        Highest Score: ${gameStats.highestScore}
        Average Score: ${averageScore}
        Average Difficulty: ${gameStats.averageDifficulty.toFixed(2)}`);
    }
}

// Call createStars when the window loads
window.addEventListener('load', function() {
    createStars();
    
    const savedUsername = getSavedUsername();
    if (savedUsername) {
        nameInput.value = savedUsername;
    }
});

logoutButton.addEventListener('click', logout);

// Add this new function for button click effect
function addButtonClickEffect(button) {
    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.95)';
    });
    button.addEventListener('mouseup', () => {
        button.style.transform = 'scale(1)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
}

// Apply button click effect to all buttons
document.querySelectorAll('button').forEach(addButtonClickEffect);

// Add this near the bottom of the file, with the other event listeners
submitNameButton.addEventListener('click', submitName);

// Also, let's add an event listener for the Enter key in the email input
playerEmailInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        submitName();
    }
});

startButton.addEventListener('click', startGame);

submitButton.addEventListener('click', checkAnswer);

answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

// Add event listeners for the new admin controls
setDurationButton.addEventListener('click', setGameDuration);
setDifficultyRateButton.addEventListener('click', setDifficultyRate);
viewStatsButton.addEventListener('click', viewGameStats);

// Add this event listener near the bottom of your file with other event listeners
resetGlobalLeaderboardButton.addEventListener('click', resetGlobalLeaderboard);

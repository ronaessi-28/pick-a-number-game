const socket = io();
let myName = '';
let opponentName = '';

const questionsList = [
    "What is your favorite movie?",              // 1
    "Describe your dream vacation.",              // 2
    "If you could have any superpower, what would it be?",  // 3
    "What's your happiest memory?",               // 4
    "Name a skill you wish you had.",              // 5
    "What's your biggest fear?",                  // 6
    "If you won a million dollars, what would you do?",  // 7
    "Favorite childhood game?",                   // 8
    "What's a goal you are currently working on?", // 9
    "Who inspires you the most?",                 // 10
    "What’s your favorite food?",                 // 11
    "What book had the biggest impact on you?",   // 12
    "If you could meet anyone dead or alive, who would it be?", // 13
    "Describe your ideal weekend.",               // 14
    "What's your biggest achievement?",           // 15
    "One thing you cannot live without?",         // 16
    "Favorite song or band?",                     // 17
    "Dream job?",                                 // 18
    "What motivates you every day?",              // 19
    "If you could time travel, where would you go?", // 20
    "Biggest life lesson you have learned?",      // 21
    "If you could change one thing about the world, what would it be?", // 22
    "What is your hidden talent?",                // 23
    "A quote you live by?",                       // 24
    "Something you're very proud of?",            // 25
    "If you were an animal, what would you be?",  // 26
    "Describe your perfect day.",                 // 27
    "If you could live anywhere, where?",         // 28
    "Biggest risk you've ever taken?",            // 29
    "What hobby would you start if time/money weren’t an issue?", // 30
    "What's something you're grateful for today?", // 31
    "Your biggest dream?",                        // 32
    "Most memorable trip you've taken?",          // 33
    "Something new you want to try?",              // 34
    "Favorite season and why?",                   // 35
    "What's your guilty pleasure?",               // 36
    "What's your proudest moment in school?",     // 37
    "If you had a warning label, what would it say?", // 38
    "Your most embarrassing moment?",             // 39
    "If you had 24 hours left to live, what would you do?", // 40
    "Favorite TV show?",                          // 41
    "What was your first job?",                   // 42
    "If you could master one musical instrument, which one?", // 43
    "What's your go-to comfort food?",             // 44
    "Who knows you best?",                        // 45
    "Biggest misconception people have about you?", // 46
    "If you could invent something, what would it be?", // 47
    "Describe yourself in three words.",           // 48
    "Your biggest regret?",                       // 49
    "What do you value most in friendship?",       // 50
    "Funniest thing that's ever happened to you?", // 51
    "Favorite childhood memory?",                 // 52
    "A habit you want to break?",                  // 53
    "What motivates you to keep going?",           // 54
    "What is your happy place?"                    // 55
];

const nameInput = document.getElementById('nameInput');

const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const joinInput = document.getElementById('joinInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const statusMessage = document.getElementById('statusMessage');

const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const buttonsGrid = document.getElementById('buttonsGrid');
const turnInfo = document.getElementById('turnInfo');

const questionSection = document.getElementById('questionSection');
const questionText = document.getElementById('questionText');
const answerInput = document.getElementById('answerInput');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');

const answerSection = document.getElementById('answerSection');
const opponentAnswer = document.getElementById('opponentAnswer');

let roomCode = '';
let isMyTurn = false;

// Create a game
createGameBtn.addEventListener('click', () => {
    const playerName = nameInput.value.trim();
    if (playerName === '') {
        alert("Please enter your name!");
        return;
    }
    myName = playerName;
    socket.emit('createGame', playerName);
});

joinGameBtn.addEventListener('click', () => {
    const code = joinInput.value.trim().toUpperCase();
    const playerName = nameInput.value.trim();
    if (playerName === '') {
        alert("Please enter your name!");
        return;
    }
    myName = playerName;
    if (code) {
        socket.emit('joinGame', { code, playerName });
    }
});


// Game created
socket.on('gameCreated', (code) => {
    roomCode = code;
    gameCodeDisplay.innerText = `Game Code: ${code}`;
    statusMessage.innerText = "Waiting for another player to join...";
});

// Player joined
socket.on('playerJoined', () => {
    statusMessage.innerText = "Player joined! Click Start to begin!";
    const startButton = document.createElement('button');
    startButton.innerText = "Start Game";
    startButton.onclick = () => {
        socket.emit('startGame', roomCode);
    };
    homeScreen.appendChild(startButton);
});

// Start game
socket.on('startGame', (names) => {
    homeScreen.style.display = "none";
    gameScreen.style.display = "block";
    generateButtons();
    isMyTurn = true;
    opponentName = names.find(name => name !== myName);
    updateTurnInfo();
});


// Error handling
socket.on('errorMessage', (msg) => {
    alert(msg);
});

// Picked number
socket.on('numberPicked', (number) => {
    showQuestion(number);
    isMyTurn = false;
    updateTurnInfo();
});

// Answer submitted
socket.on('answerSubmitted', (answer) => {
    opponentAnswer.innerText = answer;
    answerSection.style.display = "block";
    isMyTurn = true;
    updateTurnInfo();
});

function generateButtons() {
    buttonsGrid.innerHTML = '';
    for (let i = 1; i <= 55; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.onclick = () => {
            if (isMyTurn) {
                socket.emit('pickNumber', { roomCode, number: i });
                showQuestion(i, true);
                isMyTurn = false;
                updateTurnInfo();
            }
        };
        buttonsGrid.appendChild(btn);
    }
}

function showQuestion(number, pickedByMe = false) {
    buttonsGrid.style.display = "none";
    questionSection.style.display = "block";
    const question = questionsList[number - 1] || `Answer for number ${number}:`;
    questionText.innerText = question;
    if (!pickedByMe) {
        submitAnswerBtn.disabled = false;
    }
}

submitAnswerBtn.addEventListener('click', () => {
    const answer = answerInput.value.trim();
    if (answer) {
        socket.emit('submitAnswer', { roomCode, answer });
        answerInput.value = '';
        questionSection.style.display = "none";
        buttonsGrid.style.display = "block";
    }
});

function updateTurnInfo() {
    if (isMyTurn) {
        turnInfo.innerText = `Your Turn (${myName})`;
    } else {
        turnInfo.innerText = `Waiting for ${opponentName}'s move...`;
    }
}

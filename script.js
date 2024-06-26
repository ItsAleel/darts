document.addEventListener('DOMContentLoaded', () => {
    const dartboard = document.getElementById('dartboard');
    const ctx = dartboard.getContext('2d');
    const clearTurnBtn = document.getElementById('clearTurn');
    const confirmTurnBtn = document.getElementById('confirmTurn');
    const newGameBtn = document.getElementById('newGame');
    const addPlayerBtn = document.getElementById('addPlayer');
    const saveGameBtn = document.getElementById('saveGame');
    const gameModeSelect = document.getElementById('gameModeSelect');
    const playerScoreboards = document.querySelector('.playerScoreboards');
    const totalScoreboard = document.getElementById('totalScoreboard');

    let players = [];
    let currentPlayerIndex = 0;
    let gameMode = 'Free';
    let currentTurnScores = [];

    function initGame() {
        ctx.clearRect(0, 0, dartboard.width, dartboard.height);
        players = [];
        currentPlayerIndex = 0;
        currentTurnScores = [];
        playerScoreboards.innerHTML = '';
        totalScoreboard.innerHTML = '';
        addPlayer();
    }

    function addPlayer() {
        const playerName = prompt('Enter player name:');
        if (playerName) {
            const player = {
                name: playerName,
                scores: [],
                totalScore: 0
            };
            players.push(player);
            renderPlayerScoreboards();
            renderTotalScoreboard();
        }
    }

    function renderPlayerScoreboards() {
        playerScoreboards.innerHTML = '';
        players.forEach((player, index) => {
            const playerBoard = document.createElement('div');
            playerBoard.className = 'playerScoreboard';
            playerBoard.innerHTML = `
                <div class="playerHeader">
                    <span class="playerName">${player.name}</span>
                    <button class="makeTurn" onclick="makeTurn(${index})">Make Turn</button>
                </div>
                <div class="scoreTableBodyContainer">
                    <table class="scoreTable">
                        <thead>
                            <tr>
                                <th>Turn</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody id="scores-${index}">
                        </tbody>
                    </table>
                </div>
                <div class="playerTotalScore">
                    <span>Total: </span><span id="total-${index}">${player.totalScore}</span>
                </div>
            `;
            playerScoreboards.appendChild(playerBoard);
        });
    }

    function renderTotalScoreboard() {
        totalScoreboard.innerHTML = '';
        players.forEach((player, index) => {
            const playerScore = document.createElement('div');
            playerScore.className = 'playerTotalScore';
            playerScore.innerHTML = `
                <span>${player.name}</span>
                <span id="totalScore-${index}">${player.totalScore}</span>
            `;
            totalScoreboard.appendChild(playerScore);
        });
    }

    function makeTurn(playerIndex) {
        const score = prompt('Enter score for this turn:');
        if (score && !isNaN(score)) {
            currentTurnScores.push({ playerIndex, score: parseInt(score) });
        }
    }

    function renderPlayerScores(playerIndex) {
        const scoresTableBody = document.getElementById(`scores-${playerIndex}`);
        scoresTableBody.innerHTML = '';
        players[playerIndex].scores.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score}</td>
            `;
            scoresTableBody.appendChild(row);
        });
        document.getElementById(`total-${playerIndex}`).innerText = players[playerIndex].totalScore;
    }

    function clearTurn() {
        currentTurnScores = [];
        alert('Current turn cleared.');
    }

    function confirmTurn() {
        currentTurnScores.forEach(({ playerIndex, score }) => {
            players[playerIndex].scores.push(score);
            players[playerIndex].totalScore += score;
            renderPlayerScores(playerIndex);
        });
        renderTotalScoreboard();
        currentTurnScores = [];
        alert('Turn confirmed.');
    }

    function startNewGame() {
        if (confirm('Are you sure you want to start a new game?')) {
            initGame();
        }
    }

    function saveGame() {
        const gameState = {
            players,
            gameMode,
            currentPlayerIndex
        };
        localStorage.setItem('dartGame', JSON.stringify(gameState));
        savePastGame();
        alert('Game saved!');
    }

    function savePastGame() {
        const pastGames = JSON.parse(localStorage.getItem('pastGames')) || [];
        const gameDate = new Date().toISOString().split('T')[0];
        const playersNames = players.map(player => player.name).join(', ');
        pastGames.push({
            id: Date.now(),
            date: gameDate,
            players: players.length,
            names: playersNames,
            mode: gameMode,
            playersData: players
        });
        localStorage.setItem('pastGames', JSON.stringify(pastGames));
    }

    function loadGame() {
        const savedGame = localStorage.getItem('dartGame');
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            players = gameState.players;
            gameMode = gameState.gameMode;
            currentPlayerIndex = gameState.currentPlayerIndex;
            renderPlayerScoreboards();
            renderTotalScoreboard();
        }
    }

    clearTurnBtn.addEventListener('click', clearTurn);
    confirmTurnBtn.addEventListener('click', confirmTurn);
    newGameBtn.addEventListener('click', startNewGame);
    addPlayerBtn.addEventListener('click', addPlayer);
    saveGameBtn.addEventListener('click', saveGame);
    gameModeSelect.addEventListener('change', (e) => {
        gameMode = e.target.value;
    });

    initGame();
    loadGame();
});

function makeTurn(playerIndex) {
    const score = prompt('Enter score for this turn:');
    if (score && !isNaN(score)) {
        document.dispatchEvent(new CustomEvent('playerTurn', { detail: { playerIndex, score: parseInt(score) } }));
    }
}

document.addEventListener('playerTurn', (e) => {
    const { playerIndex, score } = e.detail;
    const players = JSON.parse(localStorage.getItem('dartGame')).players;
    players[playerIndex].scores.push(score);
    players[playerIndex].totalScore += score;
    localStorage.setItem('dartGame', JSON.stringify({ players, gameMode: 'Free', currentPlayerIndex: 0 }));
    document.querySelector(`#scores-${playerIndex}`).innerHTML += `
        <tr>
            <td>${players[playerIndex].scores.length}</td>
            <td>${score}</td>
        </tr>
    `;
    document.getElementById(`total-${playerIndex}`).innerText = players[playerIndex].totalScore;
});

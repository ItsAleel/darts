document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('dartboard');
    const ctx = canvas.getContext('2d');
    let players = [{ name: 'Player 1', scores: [], color: 'blue', totalScore: 0, gameMode: 'Free' }];
    let currentPlayer = 0;
    let currentTurnHits = [];
    const maxDartsPerTurn = 3;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;
    const tripleRingOuterRadius = radius * 0.5;
    const tripleRingInnerRadius = tripleRingOuterRadius - radius * 0.05;
    const doubleRingOuterRadius = radius * 0.9;
    const doubleRingInnerRadius = doubleRingOuterRadius - radius * 0.05;
    const bullOuterRadius = radius * 0.075;
    const bullInnerRadius = radius * 0.0375;
    const anglePerSection = (Math.PI * 2) / 20;
    const numbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

    let dartPositions = []; // Global array to store dart positions

    function drawDartboard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        canvas.width = 600;
        canvas.height = 600;

        const colors = {
            black: '#000000',
            white: '#FFFFFF',
            red: '#FF0000',
            green: '#008000',
            cream: '#c3b091',
            silver: '#AFB1AE',
            Cyan: '#00FFFF',
            Magenta: '#FF00FF',
            Yellow: '#FFFF00',
            Orange: '#FFA500',
            BrightPurple: '#800080',
            LimeGreen: '#00FF00',
            SkyBlue: '#87CEEB',
            Pink: '#FFC0CB',
            Gold: '#FFD700',
            LightGray: '#D3D3D3'
        };

        const drawSegment = (ctx, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, color) => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            ctx.lineTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        };

        const drawScoringSections = (ctx, centerX, centerY, radius, numbers, colors) => {
            numbers.forEach((number, index) => {
                const startAngle = anglePerSection * index - Math.PI / 2 - anglePerSection / 2;
                const endAngle = startAngle + anglePerSection;
                const isBlack = index % 2 === 0;

                const sectionColor = isBlack ? colors.black : colors.cream;
                const doubleTripleColor = isBlack ? colors.red : colors.green;

                drawSegment(ctx, centerX, centerY, bullOuterRadius, tripleRingInnerRadius, startAngle, endAngle, sectionColor);
                drawSegment(ctx, centerX, centerY, tripleRingInnerRadius, tripleRingOuterRadius, startAngle, endAngle, doubleTripleColor);
                drawSegment(ctx, centerX, centerY, tripleRingOuterRadius, doubleRingInnerRadius, startAngle, endAngle, sectionColor);
                drawSegment(ctx, centerX, centerY, doubleRingInnerRadius, doubleRingOuterRadius, startAngle, endAngle, doubleTripleColor);

                ctx.strokeStyle = colors.silver;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, tripleRingOuterRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX, centerY, tripleRingInnerRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX, centerY, doubleRingOuterRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX, centerY, doubleRingInnerRadius, 0, Math.PI * 2);
                ctx.stroke();
            });
            redrawDarts();
        };

        drawScoringSections(ctx, centerX, centerY, radius, numbers, colors);

        ctx.fillStyle = colors.white;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const startOffset = -Math.PI / 2 - anglePerSection / 2;
        numbers.forEach((number, index) => {
            const angle = startOffset + anglePerSection * (index + 0.5);
            const x = centerX + (doubleRingOuterRadius + 20) * Math.cos(angle);
            const y = centerY + (doubleRingOuterRadius + 20) * Math.sin(angle);
            ctx.save();
            ctx.translate(x, y);
            ctx.fillText(number.toString(), 0, 0);
            ctx.restore();
        });

        drawSegment(ctx, centerX, centerY, 0, bullInnerRadius, 0, Math.PI * 2, colors.red);
        drawSegment(ctx, centerX, centerY, bullInnerRadius, bullOuterRadius, 0, Math.PI * 2, colors.green);

        ctx.strokeStyle = colors.silver;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, bullOuterRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, bullInnerRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Function to add a player
    function addPlayer() {
        const colors = ['blue', 'Cyan', 'Magenta', 'Yellow', 'Orange', 'BrightPurple', 'LimeGreen', 'SkyBlue', 'Pink', 'Gold', 'LightGray'];
        let color = colors[players.length % colors.length];
        players.push({ name: `Player ${players.length + 1}`, scores: [], color: color, totalScore: 0 });
        updateUI();
    }

     // Function to remove a player with confirmation
     function removePlayer(index) {
        if (players.length > 1 && confirm("Are you sure you want to remove this player?")) {
            players.splice(index, 1);
            currentPlayer = currentPlayer % players.length;
            updateUI();
        }
    }


     // Function to change a player's name
    function changePlayerName(index) {
        const newName = prompt("Enter new name for the player:", players[index].name);
        if (newName) {
            players[index].name = newName;
            initializeScoreboards();
            initializeTotalScoreboard(); // Update the total score board as well
        }
    }

    function drawDart(x, y, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Store dart position
        dartPositions.push({x, y, color});
    }


    function redrawDarts() {
        dartPositions.forEach(dart => {
            drawDart(dart.x, dart.y, dart.color);
        });
    }

    // Function to initialize the scoreboards
function initializeScoreboards() {
    const rightPanel = document.getElementById('rightPanel');
    rightPanel.innerHTML = '';

    players.forEach((player, index) => {
        const scoreboard = document.createElement('div');
        scoreboard.classList.add('playerScoreboard');

        // Player indicator, name, and buttons
        const header = document.createElement('div');
        header.classList.add('playerHeader');
        const playerIndicator = document.createElement('div');
        playerIndicator.classList.add('playerIndicator');
        if (index === currentPlayer) {
            playerIndicator.classList.add('activeIndicator');
        }
        header.appendChild(playerIndicator);

        const playerName = document.createElement('span');
        playerName.classList.add('playerName');
        playerName.textContent = player.name;
        header.appendChild(playerName);

        const totalScoreDisplay = document.createElement('span');
        totalScoreDisplay.classList.add('totalScore');
        totalScoreDisplay.textContent = `Total Score: ${player.totalScore}`;
        header.appendChild(totalScoreDisplay);

        const changeNameButton = document.createElement('button');
        changeNameButton.textContent = 'Change Name';
        changeNameButton.addEventListener('click', () => changePlayerName(index));
        header.appendChild(changeNameButton);

        const removePlayerButton = document.createElement('button');
        removePlayerButton.textContent = 'Remove Player';
        removePlayerButton.addEventListener('click', () => removePlayer(index));
        header.appendChild(removePlayerButton);

        const makeTurnButton = document.createElement('button');
        makeTurnButton.textContent = 'Make Turn';
        makeTurnButton.addEventListener('click', () => { currentPlayer = index; highlightCurrentPlayer(); });
        header.appendChild(makeTurnButton);

        scoreboard.appendChild(header);

        // Table for headers
        const scoreTableHeader = document.createElement('table');
        scoreTableHeader.classList.add('scoreTable');
        scoreTableHeader.innerHTML = '<thead><tr><th>Turn</th><th>Hits</th><th>Score</th></tr></thead>';
        scoreboard.appendChild(header);
        scoreboard.appendChild(scoreTableHeader);

        // Scrollable body for the score table
        const scoreTableBodyContainer = document.createElement('div');
        scoreTableBodyContainer.classList.add('scoreTableBodyContainer');

        const scoreTableBody = document.createElement('table');
        scoreTableBody.classList.add('scoreTable');

        const tbody = document.createElement('tbody');
        player.scores.forEach((turn, turnIndex) => {
            const row = tbody.insertRow();
            row.insertCell().textContent = turnIndex + 1;
            row.insertCell().textContent = turn.hits.join(', ');
            row.insertCell().textContent = turn.score;
        });
        scoreTableBody.appendChild(tbody);

        scoreTableBodyContainer.appendChild(scoreTableBody);
        scoreboard.appendChild(scoreTableBodyContainer);

        rightPanel.appendChild(scoreboard);
    });
}


    function highlightCurrentPlayer() {
        document.querySelectorAll('.playerScoreboard').forEach((board, index) => {
            const indicator = board.querySelector('.playerIndicator');
            if (index === currentPlayer) {
                board.classList.add('activePlayer');
                indicator.classList.add('activeIndicator');
            } else {
                board.classList.remove('activePlayer');
                indicator.classList.remove('activeIndicator');
            }
        });
    }

    // Update total scores based on game mode
    function updateTotalScores() {
        players.forEach(player => {
            if (player.gameMode === 'Free') {
                player.totalScore += player.scores.reduce((sum, turn) => sum + turn.score, 0);
            } else {
                player.totalScore = player.scores.reduce((sum, turn) => sum - turn.score, player.startingScore);
            }
        });
    }


     // Function to initialize or update the scoreboards and total scores
    function updateUI() {
       initializeScoreboards();
       initializeTotalScoreboard();
       drawDartboard();
      highlightCurrentPlayer();
    }

      // Function to calculate score based on game mode
      function calculateScore(turnScore, player) {
        switch(player.gameMode) {
            case '301':
            case '501':
            case '701':
                return player.totalScore - turnScore;
            case 'Free':
            default:
                return player.totalScore + turnScore;
        }
    }

     // Update the scoreboard and total scores
     function updateScoreboard() {
        const score = currentTurnHits.reduce((a, b) => a + b, 0);
        players[currentPlayer].scores.push({ hits: currentTurnHits, score: score });
    
        // Calculate new total score based on game mode
        let newTotalScore = calculateScore(score, players[currentPlayer]);
        
        if (['301', '501', '701'].includes(players[currentPlayer].gameMode)) {
            if (newTotalScore === 0) {
                alert(`${players[currentPlayer].name} wins!`);
                // Reset the game or implement any other logic for game end
            } else if (newTotalScore < 0) {
                alert(`${players[currentPlayer].name} busts!`);
                // Player busts, do not update the total score
                players[currentPlayer].scores.pop(); // Remove the last score
            } else {
                // Update the total score
                players[currentPlayer].totalScore = newTotalScore;
            }
        } else {
            // For Free Mode, just update the total score
            players[currentPlayer].totalScore = newTotalScore;
        }
    
        currentPlayer = (currentPlayer + 1) % players.length;
        currentTurnHits = [];
        dartPositions = []; // Clear stored dart positions for the next turn
        updateUI();
    }




    function initializeTotalScoreboard() {
        const totalScoreboard = document.getElementById('totalScoreboard');
        totalScoreboard.innerHTML = '';

        players.forEach(player => {
            const playerScoreDiv = document.createElement('div');
            playerScoreDiv.classList.add('playerTotalScore');

            const playerNameSpan = document.createElement('span');
            playerNameSpan.textContent = player.name;
            playerScoreDiv.appendChild(playerNameSpan);

            const playerScoreSpan = document.createElement('span');
            playerScoreSpan.textContent = `Total Score: ${player.totalScore}`;
            playerScoreDiv.appendChild(playerScoreSpan);

            totalScoreboard.appendChild(playerScoreDiv);
        });
    }


     // Change game mode
     function changeGameMode(mode) {
        players.forEach(player => {
            player.gameMode = mode;
            switch (mode) {
                case '301':
                    player.startingScore = 301;
                    break;
                case '501':
                    player.startingScore = 501;
                    break;
                case '701':
                    player.startingScore = 701;
                    break;
                default:
                    player.gameMode = 'Free';
                    player.startingScore = 0;
            }
            player.totalScore = player.startingScore;
            player.scores = [];
        });
        updateUI();
    }

    // Event listeners for control buttons and game mode changes
    document.getElementById('gameModeSelect').addEventListener('change', (event) => {
        changeGameMode(event.target.value);
    });


    // Event listeners for control buttons
    
    document.getElementById('clearTurn').addEventListener('click', () => {
        currentTurnHits = [];
        dartPositions = []; // Clear stored dart positions
        drawDartboard(); // Redraw to clear darts
    });

    document.getElementById('confirmTurn').addEventListener('click', () => {
        if (currentTurnHits.length > 0 && currentTurnHits.length <= maxDartsPerTurn) {
            updateScoreboard();
        } else {
            alert(`Please throw between 1 and ${maxDartsPerTurn} darts.`);
        }
    });

    document.getElementById('newGame').addEventListener('click', () => {
        players.forEach(player => {
            player.scores = [];
            // Set the starting score based on the game mode
            switch(player.gameMode) {
                case '301':
                    player.totalScore = player.startingScore = 301;
                    break;
                case '501':
                    player.totalScore = player.startingScore = 501;
                    break;
                case '701':
                    player.totalScore = player.startingScore = 701;
                    break;
                default: // Covers 'Free' mode and any other cases
                    player.totalScore = player.startingScore = 0;
            }
        });
        currentPlayer = 0;
        currentTurnHits = [];
        dartPositions = []; // Clear stored dart positions
        updateUI();
    });
    
    
    document.getElementById('addPlayer').addEventListener('click', () => {
        addPlayer();
        redrawDarts(); // Redraw darts after adding a new player
    });


    // Canvas click event for dart throwing
    canvas.addEventListener('click', function(event) {
        if (currentTurnHits.length < maxDartsPerTurn) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const dx = x - centerX;
        const dy = y - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx) + Math.PI / 2;
        if (angle < 0) angle += 2 * Math.PI;

        // Determine which segment was clicked
        const segmentIndex = Math.floor((angle + anglePerSection / 2) % (2 * Math.PI) / anglePerSection);
        const segmentNumber = numbers[segmentIndex];

        let score = 0;
        if (distanceFromCenter <= bullInnerRadius) {
            score = 50; // Inner bullseye
        } else if (distanceFromCenter <= bullOuterRadius) {
            score = 25; // Outer bullseye
        } else if (distanceFromCenter <= tripleRingInnerRadius) {
            score = segmentNumber; // Single score
        } else if (distanceFromCenter <= tripleRingOuterRadius) {
            score = segmentNumber * 3; // Triple score
        } else if (distanceFromCenter <= doubleRingInnerRadius) {
            score = segmentNumber; // Single score
        } else if (distanceFromCenter <= doubleRingOuterRadius) {
            score = segmentNumber * 2; // Double score
        }

        if (currentTurnHits.length <= maxDartsPerTurn) {
            drawDart(x, y, players[currentPlayer].color);
        }

        currentTurnHits.push(score);
    }
    });

     // Initialize
     changeGameMode('Free');
     updateUI();
});

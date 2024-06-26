document.addEventListener('DOMContentLoaded', () => {
    const pastGamesTable = document.getElementById('pastGamesTable').querySelector('tbody');

    function loadPastGames() {
        const pastGames = JSON.parse(localStorage.getItem('pastGames')) || [];

        pastGames.forEach(game => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${game.date}</td>
                <td>${game.players}</td>
                <td>${game.names}</td>
                <td>${game.mode}</td>
                <td><button onclick="loadGame(${game.id})">Load</button></td>
            `;
            pastGamesTable.appendChild(row);
        });
    }

    function loadGame(gameId) {
        const pastGames = JSON.parse(localStorage.getItem('pastGames')) || [];
        const game = pastGames.find(g => g.id === gameId);
        
        if (game) {
            localStorage.setItem('dartGame', JSON.stringify({
                players: game.players,
                gameMode: game.mode,
                currentPlayerIndex: 0
            }));
            window.location.href = 'darts.html'; // Redirect to the game page
        } else {
            alert('Game not found.');
        }
    }

    loadPastGames();
});

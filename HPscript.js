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
        alert(`Loading game ID: ${gameId}`);
        // Logic to load the specific game state based on gameId
    }

    loadPastGames();
});

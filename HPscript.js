document.addEventListener('DOMContentLoaded', () => {
    loadPastGames();
});

function loadPastGames() {
    const dbRequest = indexedDB.open('DartsGameDB', 1); // Ensure this matches your DB name

    dbRequest.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['gameData'], 'readonly');
        const store = transaction.objectStore('gameData');
        const request = store.getAll();

        request.onsuccess = function(event) {
            const games = event.target.result;
            displayPastGames(games);
        };
    };
}

function displayPastGames(games) {
    const tableBody = document.getElementById('pastGamesTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing content

    games.forEach(game => {
        const gameDate = new Date(game.id); // Assuming 'id' is a Unix timestamp
        const playerNames = game.players.map(player => player.name).join(', '); // Get player names
        const gameMode = game.players[0]?.gameMode || 'Unknown'; // Get game mode from the first player, default to 'Unknown' if not available

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${gameDate.toLocaleDateString()}</td>
            <td>${game.players.length}</td>
            <td>${playerNames}</td>
            <td>${gameMode}</td>
            <td>
                <button onclick="resumeGame(${game.id})">Resume</button>
                <button onclick="deleteGame(${game.id}, this)">Delete</button>
            </td>
        `;
    });

    if (games.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = `<td colspan="5">No saved games available</td>`;
    }
}


function resumeGame(gameId) {
    window.location.href = `darts.html?gameId=${gameId}`;
}

function deleteGame(gameId, button) {
    const dbRequest = indexedDB.open('DartsGameDB', 1);

    dbRequest.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['gameData'], 'readwrite');
        const store = transaction.objectStore('gameData');

        store.delete(gameId).onsuccess = function() {
            // Remove the row from the table
            const row = button.parentNode.parentNode;
            row.parentNode.removeChild(row);

            // Optionally, add a notification for successful deletion
            alert('Game deleted successfully.');
        };
    };
}

import { makeDraw } from './masterDraws.js';

// Make boys draw
function generateBoysDraw(players, tableBodyId, isRestore = false) {
    // Build the draw from the masterDraw module
    const games = makeDraw(players);

    // Note: throughout this function, boysMemory will be updated
    // It will be updated when anything is edited or added to the table

    const tableBody = document.getElementById(tableBodyId);

    // INITIALIZE MEMORY
    // This is important if boys are added or removed from the draw
    if (!isRestore) {
        boysMemory = {};  // Only clear boysMemory if not restoring
        //console.log("1. Memory cleared!");
    }

    // If the table has already been created, we loop through and store values
    // This is different than boysMemory, which is used when the page is refreshed or the browser is closed

    const rows = tableBody.querySelectorAll("tr");

    let existingData = {}; // This will store previous table data

    if (!isRestore) {
        rows.forEach((row, index) => {
            const player1 = row.querySelector(".winner-button:nth-child(1)")?.textContent.trim();
            const player2 = row.querySelector(".winner-button:nth-child(2)")?.textContent.trim();
            const winner = row.querySelector(".winner-button.selected")?.textContent.trim();

            // Collect all scores for this game
            const scores = Array.from(row.querySelectorAll(".score-input")).map(input => {
                const value = input.value.trim();
                return value ? parseInt(value, 10) : null; // Convert to number or keep as null
            });

            // Split scores into groups of two for each game
            const [game1, game2, game3] = [
                scores.slice(0, 2),
                scores.slice(2, 4),
                scores.slice(4, 6),
            ];

            // Create a game number (index + 1)
            const gameNumber = index + 1;

            // Populate the object in the desired format
            existingData[gameNumber] = {
                [player1]: false,
                [player2]: false,
                Game1: game1 || [null, null],
                Completed: false
            };

            // Set the winner as true if possible
            if (winner === player1) existingData[gameNumber][player1] = true;
            if (winner === player2) existingData[gameNumber][player2] = true;
        });

        // MEMORY UPDATE
        // Rebuild boysMemory to match the new draw
        games.forEach((pair, index) => {
            const [player1, player2] = pair;
            boysMemory[index + 1] = {
                [player1]: false,
                [player2]: false,
                Game1: [null, null],
                Completed: false
            };

            // Restore previous data if it exists
            for (const game in existingData) {
                const existingPlayers = Object.keys(existingData[game]).filter(key => key !== 'Game1' && key !== 'Game2' && key !== 'Game3' && key !== 'Completed');
                const [existingPlayer1, existingPlayer2] = existingPlayers;

                if ((existingPlayer1 === player1 && existingPlayer2 === player2) ||
                    (existingPlayer1 === player2 && existingPlayer2 === player1)) {
                    boysMemory[index + 1][player1] = existingData[game][existingPlayer1];
                    boysMemory[index + 1][player2] = existingData[game][existingPlayer2];
                    boysMemory[index + 1].Game1 = existingData[game].Game1;
                    boysMemory[index + 1].Game2 = existingData[game].Game2;
                    boysMemory[index + 1].Game3 = existingData[game].Game3;
                    boysMemory[index + 1].Completed = existingData[game].Completed;
                }
            }
        });
    } else {
        // If it's being restored, populate `existingData` from boysMemory
        for (const game in boysMemory) {
            const [player1, player2] = Object.keys(boysMemory[game]).filter(key => key !== 'Game1' && key !== 'Game2' && key !== 'Game3' && key !== 'Completed');
            existingData[game] = {
                [player1]: boysMemory[game][player1],
                [player2]: boysMemory[game][player2],
                Game1: boysMemory[game].Game1,
                Game2: boysMemory[game].Game2,
                Game3: boysMemory[game].Game3,
                Completed: boysMemory[game].Completed
            };
        }

        //boysMemory = {};
        //console.log("2. Memory cleared!");
    }

    // Clear the table
    tableBody.innerHTML ='';

    games.forEach((pair, index) => {
        // Make a row (table row - tr)
        const row = document.createElement("tr");

        // Extract the two players from the pair
        // Ex: pair = ['Dan', 'Sam'] => player1 = 'Dan', player2 = 'Sam'
        const [player1, player2] = pair;
        
        //  --- Game cell (table data - td) numbers ---
        const gameCell = document.createElement("td");
        gameCell.classList.add("game-cell");
        const gameButton = document.createElement("button");
        gameButton.classList.add("game-button");
        gameButton.textContent = index + 1;
        
        // Use existingData to restore previous game button state if it exists
        const savedGame = existingData[index + 1]; // Ensure correct index lookup
        if (savedGame && savedGame["Completed"] === true) {
            gameButton.classList.add("selected");
        } else {
            gameButton.classList.remove("selected");
        }

        
        gameCell.appendChild(gameButton)
        row.appendChild(gameCell);

        // EVENT: Add click event to toggle winner selection
        gameButton.addEventListener("click", () => {
            console.log(boysMemory);
            const isSelected = gameButton.classList.contains("selected");
        
            if (isSelected) {
                gameButton.classList.remove("selected");
                boysMemory[index + 1]["Completed"] = false; // Toggle back to default
            } else {
                gameButton.classList.add("selected");
                boysMemory[index + 1]["Completed"] = true;
            }
            saveMemory();
        });

        // --- Match cell (2 buttons) ---
        const winnerCell = document.createElement("td");

        // Make the player1 button
        const player1Button = document.createElement("button");

        // Assign player1 button a class to help with CSS styling
        player1Button.classList.add("winner-button");

        // Set player1 button text
        player1Button.textContent = player1;

        // Make the player2 button
        const player2Button = document.createElement("button");

        // Assign player2 button a class to help with CSS styling
        player2Button.classList.add("winner-button");

        // Set player2 button text
        player2Button.textContent = player2;

        // Use existingData to restore previous winner if exists
        for (const game in existingData) {
            if (existingData[game][player1] === true && existingData[game][player2] === false) {
                player1Button.classList.add("selected");
                player2Button.classList.remove("selected");
            } else if (existingData[game][player2] === true && existingData[game][player1] === false) {
                player2Button.classList.add("selected");
                player1Button.classList.remove("selected");
            }
        }

        // Add both buttons to the match cell and add to row
        winnerCell.appendChild(player1Button);
        winnerCell.appendChild(player2Button);
        row.appendChild(winnerCell);

        // EVENT: Add click event to toggle winner selection
        player1Button.addEventListener("click", () => {
            const isSelected = player1Button.classList.contains("selected");
        
            if (isSelected) {
                player1Button.classList.remove("selected");
                boysMemory[index + 1][player1] = false; // Toggle back to default
            } else {
                player1Button.classList.add("selected");
                player2Button.classList.remove("selected");
        
                boysMemory[index + 1][player1] = true;
                boysMemory[index + 1][player2] = false;
            }
        
            saveMemory();
        });

        player2Button.addEventListener("click", () => {
            const isSelected = player2Button.classList.contains("selected");
        
            if (isSelected) {
                player2Button.classList.remove("selected");
                boysMemory[index + 1][player2] = false; // Toggle back to default
            } else {
                player2Button.classList.add("selected");
                player1Button.classList.remove("selected");
        
                boysMemory[index + 1][player2] = true;
                boysMemory[index + 1][player1] = false;
            }
        
            saveMemory();
        });

        // --- Scores cell (2 entry boxes) ---
        const scoresCell = document.createElement("td");
        scoresCell.className = 'scoresCell'
        const scoresContainer = document.createElement("div");
        scoresContainer.className = 'scores-container';

        const scoreInput1 = document.createElement('input');
        scoreInput1.inputMode = 'numeric';
        scoreInput1.className = 'score-input';
        scoreInput1.maxLength = 2;

        const dash = document.createElement('span');
        dash.className = 'dash';
        dash.textContent = '-';

        const scoreInput2 = document.createElement('input');
        scoreInput2.inputMode = 'numeric';
        scoreInput2.className = 'score-input';
        scoreInput2.maxLength = 2;

        scoresContainer.appendChild(scoreInput1);
        scoresContainer.appendChild(dash);
        scoresContainer.appendChild(scoreInput2);

        // MEMORY UPDATE
        scoreInput1.addEventListener('input', () => {
            boysMemory[index+1][`Game1`][0] = scoreInput1.value;
            saveMemory();
        });

        // MEMORY UPDATE
        scoreInput2.addEventListener('input', () => {
            boysMemory[index+1][`Game1`][1] = scoreInput2.value;
            saveMemory();
        });

        // Use existingData to restore previous scores if exists
        for (const game in existingData) {
            if ((player1 in existingData[game]) && (player2 in existingData[game])) {
                scoresContainer.querySelectorAll(".score-input")[0].value = existingData[game][`Game1`][0];
                scoresContainer.querySelectorAll(".score-input")[1].value = existingData[game][`Game1`][1];
            }
        }

        scoresCell.appendChild(scoresContainer);
        row.appendChild(scoresCell);

        // Add row to table
        tableBody.appendChild(row);
    })
    //console.log(boysMemory);
}

// Make girls draw
function generateGirlsDraw(players, tableBodyId, isRestore = false) {
    // Build the draw from the masterDraw module
    const games = makeDraw(players);

    // Note: throughout this function, girlsMemory will be updated
    // It will be updated when anything is edited or added to the table

    const tableBody = document.getElementById(tableBodyId);

    // INITIALIZE MEMORY
    // This is important if boys are added or removed from the draw
    if (!isRestore) {
        girlsMemory = {};  // Only clear girlsMemory if not restoring
        //console.log("1. Memory cleared!");
    }

    // If the table has already been created, we loop through and store values
    // This is different than girlsMemory, which is used when the page is refreshed or the browser is closed

    const rows = tableBody.querySelectorAll("tr");

    let existingData = {}; // This will store previous table data

    if (!isRestore) {
        rows.forEach((row, index) => {
            const player1 = row.querySelector(".winner-button:nth-child(1)")?.textContent.trim();
            const player2 = row.querySelector(".winner-button:nth-child(2)")?.textContent.trim();
            const winner = row.querySelector(".winner-button.selected")?.textContent.trim();

            // Collect all scores for this game
            const scores = Array.from(row.querySelectorAll(".score-input")).map(input => {
                const value = input.value.trim();
                return value ? parseInt(value, 10) : null; // Convert to number or keep as null
            });

            // Split scores into groups of two for each game
            const [game1, game2, game3] = [
                scores.slice(0, 2),
                scores.slice(2, 4),
                scores.slice(4, 6),
            ];

            // Create a game number (index + 1)
            const gameNumber = index + 1;

            // Populate the object in the desired format
            existingData[gameNumber] = {
                [player1]: false,
                [player2]: false,
                Game1: game1 || [null, null],
                Completed: false
            };

            // Set the winner as true if possible
            if (winner === player1) existingData[gameNumber][player1] = true;
            if (winner === player2) existingData[gameNumber][player2] = true;
        });

        // MEMORY UPDATE
        // Rebuild girlsMemory to match the new draw
        games.forEach((pair, index) => {
            const [player1, player2] = pair;
            girlsMemory[index + 1] = {
                [player1]: false,
                [player2]: false,
                Game1: [null, null],
                Completed: false
            };

            // Restore previous data if it exists
            for (const game in existingData) {
                const existingPlayers = Object.keys(existingData[game]).filter(key => key !== 'Game1' && key !== 'Game2' && key !== 'Game3');
                const [existingPlayer1, existingPlayer2] = existingPlayers;

                if ((existingPlayer1 === player1 && existingPlayer2 === player2) ||
                    (existingPlayer1 === player2 && existingPlayer2 === player1)) {
                    girlsMemory[index + 1][player1] = existingData[game][existingPlayer1];
                    girlsMemory[index + 1][player2] = existingData[game][existingPlayer2];
                    girlsMemory[index + 1].Game1 = existingData[game].Game1;
                    girlsMemory[index + 1].Game2 = existingData[game].Game2;
                    girlsMemory[index + 1].Game3 = existingData[game].Game3;
                    girlsMemory[index + 1].Completed = existingData[game].Completed;
                }
            }
        });
    } else {
        // If it's being restored, populate `existingData` from girlsMemory
        for (const game in girlsMemory) {
            const [player1, player2] = Object.keys(girlsMemory[game]).filter(key => key !== 'Game1' && key !== 'Game2' && key !== 'Game3');
            existingData[game] = {
                [player1]: girlsMemory[game][player1],
                [player2]: girlsMemory[game][player2],
                Game1: girlsMemory[game].Game1,
                Game2: girlsMemory[game].Game2,
                Game3: girlsMemory[game].Game3,
                Completed: girlsMemory[game].Completed
            };
        }

        //girlsMemory = {};
        //console.log("2. Memory cleared!");
    }

    // Clear the table
    tableBody.innerHTML ='';

    games.forEach((pair, index) => {
        // Make a row (table row - tr)
        const row = document.createElement("tr");

        // Extract the two players from the pair
        // Ex: pair = ['Dan', 'Sam'] => player1 = 'Dan', player2 = 'Sam'
        const [player1, player2] = pair;
        
        //  --- Game cell (table data - td) numbers ---
        const gameCell = document.createElement("td");
        gameCell.classList.add("game-cell");
        const gameButton = document.createElement("button");
        gameButton.classList.add("game-button");
        gameButton.textContent = index + 1;
        
        // Use existingData to restore previous game button state if it exists
        const savedGame = existingData[index + 1]; // Ensure correct index lookup
        if (savedGame && savedGame["Completed"] === true) {
            gameButton.classList.add("selected");
        } else {
            gameButton.classList.remove("selected");
        }

        
        gameCell.appendChild(gameButton)
        row.appendChild(gameCell);

        // EVENT: Add click event to toggle winner selection
        gameButton.addEventListener("click", () => {
            console.log(girlsMemory);
            const isSelected = gameButton.classList.contains("selected");
        
            if (isSelected) {
                gameButton.classList.remove("selected");
                girlsMemory[index + 1]["Completed"] = false; // Toggle back to default
            } else {
                gameButton.classList.add("selected");
                girlsMemory[index + 1]["Completed"] = true;
            }
            saveMemory();
        });

        // --- Match cell (2 buttons) ---
        const winnerCell = document.createElement("td");

        // Make the player1 button
        const player1Button = document.createElement("button");

        // Assign player1 button a class to help with CSS styling
        player1Button.classList.add("winner-button");

        // Set player1 button text
        player1Button.textContent = player1;

        // Make the player2 button
        const player2Button = document.createElement("button");

        // Assign player2 button a class to help with CSS styling
        player2Button.classList.add("winner-button");

        // Set player2 button text
        player2Button.textContent = player2;

        // Use existingData to restore previous winner if exists
        for (const game in existingData) {
            if (existingData[game][player1] === true && existingData[game][player2] === false) {
                player1Button.classList.add("selected");
                player2Button.classList.remove("selected");
            } else if (existingData[game][player2] === true && existingData[game][player1] === false) {
                player2Button.classList.add("selected");
                player1Button.classList.remove("selected");
            }
        }

        // Add both buttons to the match cell and add to row
        winnerCell.appendChild(player1Button);
        winnerCell.appendChild(player2Button);
        row.appendChild(winnerCell);

        // EVENT: Add click event to toggle winner selection
        player1Button.addEventListener("click", () => {
            const isSelected = player1Button.classList.contains("selected");
        
            if (isSelected) {
                player1Button.classList.remove("selected");
                girlsMemory[index + 1][player1] = false; // Toggle back to default
            } else {
                player1Button.classList.add("selected");
                player2Button.classList.remove("selected");
        
                girlsMemory[index + 1][player1] = true;
                girlsMemory[index + 1][player2] = false;
            }
        
            saveMemory();
        });

        player2Button.addEventListener("click", () => {
            const isSelected = player2Button.classList.contains("selected");
        
            if (isSelected) {
                player2Button.classList.remove("selected");
                girlsMemory[index + 1][player2] = false; // Toggle back to default
            } else {
                player2Button.classList.add("selected");
                player1Button.classList.remove("selected");
        
                girlsMemory[index + 1][player2] = true;
                girlsMemory[index + 1][player1] = false;
            }
        
            saveMemory();
        });

        // --- Scores cell (2 entry boxes) ---
        const scoresCell = document.createElement("td");
        scoresCell.className = 'scoresCell'
        const scoresContainer = document.createElement("div");
        scoresContainer.className = 'scores-container';

        const scoreInput1 = document.createElement('input');
        scoreInput1.inputMode = 'numeric';
        scoreInput1.className = 'score-input';
        scoreInput1.maxLength = 2;

        const dash = document.createElement('span');
        dash.className = 'dash';
        dash.textContent = '-';

        const scoreInput2 = document.createElement('input');
        scoreInput2.inputMode = 'numeric';
        scoreInput2.className = 'score-input';
        scoreInput2.maxLength = 2;

        scoresContainer.appendChild(scoreInput1);
        scoresContainer.appendChild(dash);
        scoresContainer.appendChild(scoreInput2);

        // MEMORY UPDATE
        scoreInput1.addEventListener('input', () => {
            girlsMemory[index+1][`Game1`][0] = scoreInput1.value;
            saveMemory();
        });

        // MEMORY UPDATE
        scoreInput2.addEventListener('input', () => {
            girlsMemory[index+1][`Game1`][1] = scoreInput2.value;
            saveMemory();
        });

        // Use existingData to restore previous scores if exists
        for (const game in existingData) {
            if ((player1 in existingData[game]) && (player2 in existingData[game])) {
                scoresContainer.querySelectorAll(".score-input")[0].value = existingData[game][`Game1`][0];
                scoresContainer.querySelectorAll(".score-input")[1].value = existingData[game][`Game1`][1];
            }
        }

        // Add three rows of inputs
        // for (let i = 1; i <= 3; i++) {
        //     const scoreRow = document.createElement('div');
        //     scoreRow.style.display = 'flex';
        //     scoreRow.style.alignItems = 'center';
        //     scoreRow.style.gap = '5px';

        //     const scoreInput1 = document.createElement('input');
        //     scoreInput1.inputMode = 'numeric';
        //     scoreInput1.className = 'score-input';
        //     scoreInput1.maxLength = 2;

        //     const dash = document.createElement('span');
        //     dash.className = 'dash';
        //     dash.textContent = '-';

        //     const scoreInput2 = document.createElement('input');
        //     scoreInput2.inputMode = 'numeric';
        //     scoreInput2.className = 'score-input';
        //     scoreInput2.maxLength = 2;

        //     // MEMORY UPDATE
        //     scoreInput1.addEventListener('input', () => {
        //         girlsMemory[index+1][`Game${i}`][0] = scoreInput1.value;
        //         saveMemory();
        //     });

        //     // MEMORY UPDATE
        //     scoreInput2.addEventListener('input', () => {
        //         girlsMemory[index+1][`Game${i}`][1] = scoreInput2.value;
        //         saveMemory();
        //     });

        //     scoreRow.appendChild(scoreInput1);
        //     scoreRow.appendChild(dash);
        //     scoreRow.appendChild(scoreInput2);

        //     // Use existingData to restore previous scores if exists
        //     for (const game in existingData) {
        //         if ((player1 in existingData[game]) && (player2 in existingData[game])) {
        //             scoreRow.querySelectorAll(".score-input")[0].value = existingData[game][`Game${i}`][0];
        //             scoreRow.querySelectorAll(".score-input")[1].value = existingData[game][`Game${i}`][1];
        //         }
        //     }
            
        //     // Add the row of two entry boxes to the row container
        //     scoresContainer.appendChild(scoreRow);
        // }

        scoresCell.appendChild(scoresContainer);
        row.appendChild(scoresCell);

        // Add row to table
        tableBody.appendChild(row);
    })
    //console.log(girlsMemory);
}

// Calculate boys results
function drawResults(memory, tableBodyId) {
    const resultsTable = document.getElementById(tableBodyId);

    resultsTable.innerHTML = '';

    let playerStats = {};

    // Loop through each game in memory
    for (const [gameIndex, gameData] of Object.entries(memory)) {
        // Get player results in the current game
        const playerResults = Object.entries(gameData).filter(([key]) => !key.startsWith("Game")); // Ignore "GameX" keys
    
        // Check if all players have false (both lost; i.e. the game hasn't been played)
        const allFalse = playerResults.every(([, value]) => value === false);
    
        if (allFalse) continue; // Skip empty games
        
        // Update the win/loss for each completed game
        for (const [key, value] of playerResults) {
            //Make a player if they already don't exist
            if (!playerStats[key]) {
                playerStats[key] = { wins: 0, losses: 0 };
            }
            if (value === true) {
                playerStats[key].wins += 1;
            } else if (value === false) {
                playerStats[key].losses += 1;
            }
        }
    }
    

    // Convert the object into an array of [key, value] pairs
    const sortedPlayerStats = Object.entries(playerStats).sort(([, a], [, b]) => b.wins - a.wins);

    // Populate table with data
    for (let i = 0; i < sortedPlayerStats.length; i++) {
        const player = sortedPlayerStats[i][0];
        const totalGames = sortedPlayerStats[i][1].wins + sortedPlayerStats[i][1].losses;
        const wins = sortedPlayerStats[i][1].wins;
        const losses = sortedPlayerStats[i][1].losses;
        const rank = i + 1;

        const row = document.createElement('tr');
        const playerCell = document.createElement('td');
        const totalGamesCell = document.createElement('td');
        const winsCell = document.createElement('td');
        const rankCell = document.createElement('td');

        playerCell.textContent = player;
        totalGamesCell.textContent = totalGames;
        winsCell.textContent = `${wins} - ${losses}`;
        rankCell.textContent = rank;

        row.appendChild(playerCell);
        row.appendChild(totalGamesCell);
        row.appendChild(winsCell);
        row.appendChild(rankCell);
        resultsTable.appendChild(row);
    }

}

// Save memory to LocalStorage
function saveMemory() {
    localStorage.setItem("boyAttendance", JSON.stringify(boyAttendance));
    localStorage.setItem("girlAttendance", JSON.stringify(girlAttendance));
    localStorage.setItem("boysMemory", JSON.stringify(boysMemory));
    localStorage.setItem("girlsMemory", JSON.stringify(girlsMemory));
    localStorage.setItem("boyPlayers", JSON.stringify(boyPlayers));
    localStorage.setItem("girlPlayers", JSON.stringify(girlPlayers));
}

// --- Global variables ---
let boyAttendance = [];
let girlAttendance = [];
let boysMemory = {};
let girlsMemory = {};
let boyPlayers = [];
let girlPlayers = [];


// --- EVENT LISTENERS ---

// Make Boys Draw button
boysDrawButton.addEventListener("click", () => {
    // Clear the previous list of players
    boyPlayers = []; // Clear the array to avoid duplicates

    document.querySelectorAll('#roster tbody tr').forEach(row => {
        const boy = row.children[1]?.textContent.trim();
        if (boy !== '') {
            boyPlayers.push(boy);
        }
        
    });
    //console.log(boyPlayers);
    generateBoysDraw(boyPlayers, "boysdraw");
    saveMemory(); // Save to localStorage
});

// Make Girls Draw button
girlsDrawButton.addEventListener("click", () => {
    // Clear the previous list of players
    girlPlayers = []; // Clear the array to avoid duplicates

    document.querySelectorAll('#roster tbody tr').forEach(row => {
        const girl = row.children[2]?.textContent.trim();
        if (girl !== '') {
            girlPlayers.push(girl);
        }
        
    });
    //console.log(girlPlayers);
    generateGirlsDraw(girlPlayers, "girlsdraw");
    saveMemory(); // Save to localStorage
});

// Add event listener for adding a new player
addButton.addEventListener("click", () => {
    // Get the value of the entry box
    const enteredText = entryBox.value.trim();

    // Check if the entry box has some text
    if (enteredText === "") {
        alert("Please enter some text.");
        return; // Exit if no text was entered
    }

    // Get the selected value from the radiobuttons
    const selectedGender = document.querySelector('input[name="gender"]:checked')?.value;

    // Check if a gender has been selected
    if (!selectedGender) {
        alert("Please select a gender.");
        return; // Exit if no gender is selected
    }

    // Determine the column to check (1 for Boys, 2 for Girls)
    const columnIndex = selectedGender === "Boys" ? 1 : 2;

    // The names must be unique to their column
    if (boyAttendance.includes(enteredText)) {
        alert("A boy has already been added with that name.");
        return; // Exit
    } else if (girlAttendance.includes(enteredText)) {
        alert("A girl has already been added with that name.");
        return; // Exit
    }

    // Function to create a trash icon for removing names
    function createDeleteIcon(cell) {
        const deleteIcon = document.createElement("span");
        deleteIcon.textContent = "🗑️";
        deleteIcon.classList.add("delete-icon");
        deleteIcon.style.display = "none"; // Initially hidden

        deleteIcon.addEventListener("click", () => {
            if (confirm("Remove this player?")) {
                // Get the name without the trash icon
                const nameOnly = cell.textContent.replace("🗑️", "").trim();

                // Update memory first
                if (cell.parentElement.children[1].textContent.replace("🗑️", "").trim() === nameOnly) {
                    boyAttendance = boyAttendance.filter(name => name !== nameOnly);
                } else if (cell.parentElement.children[2].textContent.replace("🗑️", "").trim() === nameOnly) {
                    girlAttendance = girlAttendance.filter(name => name !== nameOnly);
                }

                // Clear the cell and check if the row needs to be deleted
                cell.textContent = "";

                // Check if both Boy and Girl cells in the same row are empty
                const row = cell.parentElement;
                const boyCell = row.children[1];  // Column 1 (Boys)
                const girlCell = row.children[2]; // Column 2 (Girls)

                // If both cells are empty, remove the row
                if (boyCell.textContent.trim() === '' && girlCell.textContent.trim() === '') {
                    row.remove();
                }

                // Log attendance memory after update
                saveMemory();
            }
        });

        return deleteIcon;
    }

    // Check for an empty cell in the appropriate column
    let emptyCellFound = false;
    const rows = roster.querySelectorAll("tr");

    for (const row of rows) {
        const cell = row.children[columnIndex];
        if (cell && cell.textContent.trim() === "") {
            // Fill the first empty cell with the entered text
            cell.textContent = enteredText;
            cell.appendChild(createDeleteIcon(cell)); // Attach trash icon
            emptyCellFound = true;
            break; // Stop checking further rows
        }
    }

    // If no empty cell was found, add a new row
    if (!emptyCellFound) {
        const newRow = document.createElement("tr");

        // Create a cell for Boy and a cell for Girl
        const numberCell = document.createElement("td");
        const boyCell = document.createElement("td");
        const girlCell = document.createElement("td");

        // Get the current number of rows (excluding header)
        const tbody = roster.querySelector('tbody');
        const rowCount = tbody.querySelectorAll("tr").length + 1; // 1-based index

        numberCell.textContent = rowCount; // Assign the row number

        newRow.appendChild(numberCell);
        if (selectedGender === "Boys") {
            boyCell.textContent = enteredText;
            boyCell.appendChild(createDeleteIcon(boyCell)); // Attach trash icon
            newRow.appendChild(boyCell); // Append to the row
            newRow.appendChild(girlCell); // Empty girl cell
        } else if (selectedGender === "Girls") {
            girlCell.textContent = enteredText;
            girlCell.appendChild(createDeleteIcon(girlCell)); // Attach trash icon
            newRow.appendChild(boyCell); // Empty boy cell
            newRow.appendChild(girlCell); // Append to the row
        }

        // Get the tbody element and append the new row to it
        tbody.appendChild(newRow); // Append the new row to tbody
    }

    // Update memory
    if (columnIndex === 1) {
        boyAttendance.push(enteredText);
    } else if (columnIndex === 2) {
        girlAttendance.push(enteredText);
    }

    // Clear entry box
    entryBox.value = "";

    // Log attendance memory
    saveMemory();
});




// Remove Player(s) button
let removeMode = false; // Track mode state
removeButton.addEventListener("click", () => {
    removeMode = !removeMode; // Toggle mode
    document.querySelectorAll(".delete-icon").forEach(icon => {
        icon.style.display = removeMode ? "inline-block" : "none";
    });
    removeButton.textContent = removeMode ? "Done Removing" : "Remove Player(s)";
});

// Clear attendance button
attendanceButton.addEventListener("click", () => {
    // Ask for confirmation
    const confirmation = confirm("This clears all attendance. Are you sure you wish to proceed? ");

    if (!confirmation) return;

    boyAttendance = [];
    girlAttendance = [];

    const tbody = roster.tBodies[0]; // Get the first <tbody>
    while (tbody.rows.length > 0) {
        tbody.deleteRow(0); // Always delete the first row until none are left
    }

});

// Clear draws button
resetButton.addEventListener("click", () => {
    // Ask for confirmation
    const confirmation = confirm("This clears all data and memory! Are you sure you want to reset and erase everything? ");

    if (!confirmation) return;

    boysMemory = {};
    girlsMemory = {};
    boyPlayers = [];
    girlPlayers = [];
    const boysTable = document.getElementById("boysdraw");
    boysTable.innerHTML='';
    const girlsTable = document.getElementById("girlsdraw");
    girlsTable.innerHTML='';
    localStorage.clear();
});

// Results buttons
boysResultsButton.addEventListener("click", () => {
    let boysResults = drawResults(boysMemory, "boys-results-tbody");
});

girlsResultsButton.addEventListener("click", () => {
    let girlsResults = drawResults(girlsMemory, "girls-results-tbody");
});

// Load data from localStorage when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // --- ATTENDANCE TABLE ---
    const savedBoyAttendance = JSON.parse(localStorage.getItem("boyAttendance") || "[]");
    const savedGirlAttendance = JSON.parse(localStorage.getItem("girlAttendance") || "[]");

    // Initialize the attendance arrays
    boyAttendance = savedBoyAttendance;
    girlAttendance = savedGirlAttendance;

    // Ensure the table is restored properly
    const tbody = roster.querySelector('tbody');
    tbody.innerHTML = '';  // Clear existing table rows (only once)

    const maxRows = Math.max(boyAttendance.length, girlAttendance.length);

    // Add rows for each boy and girl
    for (let i = 0; i < maxRows; i++) {
        const newRow = document.createElement('tr');

        const numberCell = document.createElement('td');
        numberCell.textContent = i+1;
        newRow.appendChild(numberCell);

        const boyCell = document.createElement('td');
        boyCell.textContent = boyAttendance[i] || "";  // Fallback to empty if no boy at this index
        newRow.appendChild(boyCell);

        const girlCell = document.createElement('td');
        girlCell.textContent = girlAttendance[i] || "";  // Fallback to empty if no girl at this index
        newRow.appendChild(girlCell);

        tbody.appendChild(newRow);
    }

    // --- BOYS DRAW ---
    const savedBoysMemory = JSON.parse(localStorage.getItem("boysMemory") || "{}");
    const savedBoys = JSON.parse(localStorage.getItem("boyPlayers") || "[]");
    if (savedBoysMemory !== "{}") {
        boysMemory = savedBoysMemory;
        boyPlayers = savedBoys;

        // Generate the boys draw
        generateBoysDraw(boyPlayers, "boysdraw", Boolean(savedBoysMemory));
    }

    // --- GIRLS DRAW ---
    const savedGirlsMemory = JSON.parse(localStorage.getItem("girlsMemory") || "{}");
    const savedGirls = JSON.parse(localStorage.getItem("girlPlayers") || "[]");
    if (savedGirlsMemory !== "{}") {
        girlsMemory = savedGirlsMemory;
        girlPlayers = savedGirls;

        // Generate the girls draw
        generateGirlsDraw(girlPlayers, "girlsdraw", Boolean(savedGirlsMemory));
    }
});

// --- Tab Buttons ---
// Return arrays of tabButton objects and their contents
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // Hide all tab contents
        tabContents.forEach(content => content.classList.add('hidden'));

        // Activate the clicked button and show the corresponding tab content
        button.classList.add('active');
        document.getElementById(targetTab).classList.remove('hidden');
    });
});

// Set default tab to Attendance
document.querySelector('.tab-button[data-tab="attendance"]').click();

// Save data when the page is unloaded
window.addEventListener("beforeunload", saveMemory);
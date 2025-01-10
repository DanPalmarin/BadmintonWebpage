import { makeDraw } from './masterDraws.js';

function generateDraw(players, tableBodyId, isRestore = false) {
    // Build the draw from the masterDraw module
    const games = makeDraw(players);

    // Note: throughout this function, boysMemory will be updated
    // It will be updated when anything is edited or added to the table

    const tableBody = document.getElementById(tableBodyId);

    // INITIALIZE MEMORY
    // This is important if boys are added or removed from the draw
    if (!isRestore) {
        boysMemory = {};  // Only clear boysMemory if not restoring
        console.log("1. Memory cleared!");
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
                Game2: game2 || [null, null],
                Game3: game3 || [null, null],
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
                Game2: [null, null],
                Game3: [null, null],
            };

            // Restore previous data if it exists
            for (const game in existingData) {
                const existingPlayers = Object.keys(existingData[game]).filter(key => key !== 'Game1' && key !== 'Game2' && key !== 'Game3');
                const [existingPlayer1, existingPlayer2] = existingPlayers;

                if ((existingPlayer1 === player1 && existingPlayer2 === player2) ||
                    (existingPlayer1 === player2 && existingPlayer2 === player1)) {
                    boysMemory[index + 1][player1] = existingData[game][existingPlayer1];
                    boysMemory[index + 1][player2] = existingData[game][existingPlayer2];
                    boysMemory[index + 1].Game1 = existingData[game].Game1;
                    boysMemory[index + 1].Game2 = existingData[game].Game2;
                    boysMemory[index + 1].Game3 = existingData[game].Game3;
                }
            }
        });
    } else {
        // If it's being restored, populate `existingData` from boysMemory
        for (const game in boysMemory) {
            const [player1, player2] = Object.keys(boysMemory[game]).filter(key => key !== 'Game1' && key !== 'Game2' && key !== 'Game3');
            existingData[game] = {
                [player1]: boysMemory[game][player1],
                [player2]: boysMemory[game][player2],
                Game1: boysMemory[game].Game1,
                Game2: boysMemory[game].Game2,
                Game3: boysMemory[game].Game3,
            };
        }

        //boysMemory = {};
        console.log("2. Memory cleared!");
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
        gameCell.textContent = index + 1 // Sets the text to be 1 more than index
        row.appendChild(gameCell);

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
            // If player1 is selected, mark it using CSS
            // Deselect player2 button so only one is styled
            player1Button.classList.add("selected");
            player2Button.classList.remove("selected");
            
            // MEMORY UPDATE
            boysMemory[index+1][player1] = true;
            boysMemory[index+1][player2] = false;
        });

        player2Button.addEventListener("click", () => {
            // If player2 is selected, mark it using CSS
            // Deselect player1 button so only one is styled
            player2Button.classList.add("selected");
            player1Button.classList.remove("selected");

            // MEMORY UPDATE
            boysMemory[index+1][player2] = true;
            boysMemory[index+1][player1] = false;
        });

        // --- Scores cell (6 entry boxes) ---
        const scoresCell = document.createElement("td");
        const scoresContainer = document.createElement("div");

        // Add three rows of inputs
        for (let i = 1; i <= 3; i++) {
            const scoreRow = document.createElement('div');
            scoreRow.style.display = 'flex';
            scoreRow.style.alignItems = 'center';
            scoreRow.style.gap = '5px';

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

            // MEMORY UPDATE
            scoreInput1.addEventListener('input', () => {
                boysMemory[index+1][`Game${i}`][0] = scoreInput1.value;
            });

            // MEMORY UPDATE
            scoreInput2.addEventListener('input', () => {
                boysMemory[index+1][`Game${i}`][1] = scoreInput2.value;
            });

            scoreRow.appendChild(scoreInput1);
            scoreRow.appendChild(dash);
            scoreRow.appendChild(scoreInput2);

            // Use existingData to restore previous scores if exists
            for (const game in existingData) {
                if ((player1 in existingData[game]) && (player2 in existingData[game])) {
                    scoreRow.querySelectorAll(".score-input")[0].value = existingData[game][`Game${i}`][0];
                    scoreRow.querySelectorAll(".score-input")[1].value = existingData[game][`Game${i}`][1];
                }
            }
            
            // Add the row of two entry boxes to the row container
            scoresContainer.appendChild(scoreRow);
        }

        scoresCell.appendChild(scoresContainer);
        row.appendChild(scoresCell);

        // Add row to table
        tableBody.appendChild(row);
    })
    console.log(boysMemory);
}

// Save memory to LocalStorage
function saveMemory() {
    console.log(boysMemory);
    localStorage.setItem("boysMemory", JSON.stringify(boysMemory));
    localStorage.setItem("girlsMemory", JSON.stringify(boysMemory));
    localStorage.setItem("boyPlayers", JSON.stringify(boyPlayers));
    localStorage.setItem("girlPlayers", JSON.stringify(boyPlayers));
}


// Load boys draw table and fill values from boysMemory
function restoreDrawFromLocalStorage(tableBodyId) {
    const savedMemory = localStorage.getItem("boysMemory");
    const savedBoys = localStorage.getItem("boyPlayers");
    //const savedGirls = localStorage.getItem("girlPlayers");

    console.log(savedBoys);
    if (savedMemory !== "{}") {
        boysMemory = JSON.parse(savedMemory);
        boyPlayers = JSON.parse(savedBoys);
        //girlPlayers = JSON.parse(savedGirls);

        // Generate the draws
        generateDraw(boyPlayers, tableBodyId, Boolean(savedMemory));
        //generateDraw(girlPlayers, tableBodyId, Boolean(savedMemory));
    }
}


// --- Global variables ---
// This will store all boys draw data
let boysMemory = {};
let girlsMemory = {};
let boyPlayers = [];
let girlPlayers = [];


// --- Static event listeners ---
// Making the attendance table clickable
document.querySelectorAll('#roster td').forEach(cell => {
    cell.addEventListener('click', () => {
        cell.classList.toggle('roster-cell-selected');
    });
});

// Make Boys Draw button
boysDrawButton.addEventListener("click", () => {
    // Clear the previous list of players
    boyPlayers = []; // Clear the array to avoid duplicates

    document.querySelectorAll('#roster tbody tr').forEach(row => {
        const boy = row.children[0];
        boyPlayers.push(boy.textContent.trim());
        
    });
    console.log(boyPlayers);
    generateDraw(boyPlayers, "boysdraw");
    saveMemory(); // Save to localStorage
});

// Make Girls Draw button
girlsDrawButton.addEventListener("click", () => {
    // Clear the previous list of players
    girlPlayers = []; // Clear the array to avoid duplicates

    document.querySelectorAll('#roster tbody tr').forEach(row => {
        const girl = row.children[1];
        girlPlayers.push(girl.textContent.trim());
        
    });
    console.log(girlPlayers);
    generateDraw(girlPlayers, "girlsdraw");
    saveMemory(); // Save to localStorage
});

// Remove Selected Player(s) button
removeButton.addEventListener("click", () => {
    // Loop through each cell and remove the text content if it's highlighted
    document.querySelectorAll('#roster tbody td').forEach(cell => {
        if (cell.classList.contains('roster-cell-selected')) {
            cell.textContent = '';
            cell.classList.remove('roster-cell-selected');
        }
    });

    // Check if any row is empty and remove it
    document.querySelectorAll('#roster tbody tr').forEach(row => {
        const [cell1, cell2] = row.children;
        if (cell1.textContent.trim() === '' && cell2.textContent.trim() === '') {
            row.remove();
        }
    });
    
});

// Reset button
resetButton.addEventListener("click", () => {
    boysMemory = {};
    const boysTable = document.getElementById("boysdraw");
    boysTable.innerHTML='';
    localStorage.clear();
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

// Restore data when the page is loaded
window.addEventListener("load", () => restoreDrawFromLocalStorage("boysdraw"));



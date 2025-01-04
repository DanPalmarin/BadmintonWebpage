import { makeDraw } from './masterDraws.js';

// Function to generate draws
function generateDraw(players, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);

    if (!tableBody) {
        console.error(`Table body with ID ${tableBodyId} not found.`);
        return;
    }

    // Step 1: Collect existing data
    const existingData = {};
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {
        const player1 = row.querySelector(".winner-button:nth-child(1)")?.textContent.trim();
        const player2 = row.querySelector(".winner-button:nth-child(2)")?.textContent.trim();

        if (player1 && player2) {
            const key1 = `${player1} vs ${player2}`;
            const key2 = `${player2} vs ${player1}`;
            const winner = row.querySelector(".winner-button.selected")?.textContent.trim();

            // Collect all scores for this game
            const scores = Array.from(row.querySelectorAll(".score-input")).map(input => input.value.trim());

            existingData[key1] = { winner, scores };
            existingData[key2] = { winner, scores }; // Allow for reversed order lookup
        }
    });

    // Step 2: Generate new draw
    const games = makeDraw(players); // Assuming makeDraw generates the pairings

    // Step 3: Populate the table
    tableBody.innerHTML = ''; // Clear the table body

    games.forEach((pair, index) => {
        const [player1, player2] = pair;
        const key1 = `${player1} vs ${player2}`;
        const key2 = `${player2} vs ${player1}`;

        const row = document.createElement("tr");

        // Game cell
        const gameCell = document.createElement("td");
        gameCell.textContent = index + 1;
        row.appendChild(gameCell);

        // Winner cell
        const winnerCell = document.createElement("td");
        winnerCell.classList.add("winner-cell");

        const player1Button = document.createElement("button");
        player1Button.classList.add("winner-button");
        player1Button.textContent = player1;

        const player2Button = document.createElement("button");
        player2Button.classList.add("winner-button");
        player2Button.textContent = player2;

        // Restore previous winner if exists
        const existingWinner = existingData[key1]?.winner || existingData[key2]?.winner;
        if (existingWinner === player1) {
            player1Button.classList.add("selected");
        } else if (existingWinner === player2) {
            player2Button.classList.add("selected");
        }

        // Add click event to toggle winner selection
        player1Button.addEventListener("click", () => {
            // Ensure keys exist in `existingData`
        if (!existingData[key1]) existingData[key1] = { winner: null, scores: [] };
        if (!existingData[key2]) existingData[key2] = { winner: null, scores: [] };
            player1Button.classList.add("selected");
            player2Button.classList.remove("selected");

            // Save the selected winner to existingData and update localStorage
            existingData[key1].winner = player1;
            existingData[key2].winner = player1;
            saveDrawToLocalStorage(tableBodyId); // Save to localStorage
        });

        player2Button.addEventListener("click", () => {
            // Ensure keys exist in `existingData`
        if (!existingData[key1]) existingData[key1] = { winner: null, scores: [] };
        if (!existingData[key2]) existingData[key2] = { winner: null, scores: [] };
            player2Button.classList.add("selected");
            player1Button.classList.remove("selected");

            // Save the selected winner to existingData and update localStorage
            existingData[key1].winner = player2;
            existingData[key2].winner = player2;
            saveDrawToLocalStorage(tableBodyId); // Save to localStorage
        });

        winnerCell.appendChild(player1Button);
        winnerCell.appendChild(player2Button);
        row.appendChild(winnerCell);

        // Scores cell
        const scoresCell = document.createElement("td");
        const scoresContainer = document.createElement("div");
        scoresContainer.classList.add("scores-container");

        // Add three rows of inputs
        for (let i = 0; i < 3; i++) {
            const scoreRow = createScoreRow(i * 2);

            // Restore previous scores if exists
            const existingScores = existingData[key1]?.scores || existingData[key2]?.scores;
            if (existingScores && existingScores[i * 2] !== undefined) {
                scoreRow.querySelectorAll(".score-input")[0].value = existingScores[i * 2];
            }
            if (existingScores && existingScores[i * 2 + 1] !== undefined) {
                scoreRow.querySelectorAll(".score-input")[1].value = existingScores[i * 2 + 1];
            }

            scoresContainer.appendChild(scoreRow);
        }

        scoresCell.appendChild(scoresContainer);
        row.appendChild(scoresCell);

        // Add the row to the table
        tableBody.appendChild(row);
    });

    // Save the current draw state to localStorage
    saveDrawToLocalStorage(tableBodyId);
    console.log(`Draw saved for ${tableBodyId}:`, games); // Debug log
}

// Function to create a score row
function createScoreRow(inputIndexStart = 0) {
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

    // Input refocusing
    scoreInput1.addEventListener('input', () => {
        if (scoreInput1.value.length === 2) {
            scoreInput2.focus();
        }
    });

    scoreInput2.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && scoreInput2.value === '') {
            scoreInput1.focus();
        }
    });

    scoreRow.appendChild(scoreInput1);
    scoreRow.appendChild(dash);
    scoreRow.appendChild(scoreInput2);

    return scoreRow;
}

// Updated restoreDrawFromLocalStorage function
function restoreDrawFromLocalStorage(tableBodyId) {
    const drawData = JSON.parse(localStorage.getItem(`${tableBodyId}-draw`));

    if (drawData) {
        const tableBody = document.getElementById(tableBodyId);
        tableBody.innerHTML = ''; // Clear the table body first

        drawData.forEach((rowData, index) => {
            const row = document.createElement("tr");

            // Game cell
            const gameCell = document.createElement("td");
            gameCell.textContent = index + 1;
            row.appendChild(gameCell);

            // Winner cell
            const winnerCell = document.createElement("td");
            winnerCell.classList.add("winner-cell");

            const player1Button = document.createElement("button");
            player1Button.classList.add("winner-button");
            player1Button.textContent = rowData.players[0];
            
            player1Button.addEventListener("click", () => {
                player1Button.classList.add("selected");
                player2Button.classList.remove("selected");
            });

            const player2Button = document.createElement("button");
            player2Button.classList.add("winner-button");
            player2Button.textContent = rowData.players[1];
            
            player2Button.addEventListener("click", () => {
                player2Button.classList.add("selected");
                player1Button.classList.remove("selected");
            });

            // Restore the selected winner based on the stored data
            console.log(rowData.selectedWinner);
            if (rowData.selectedWinner === rowData.players[0]) {
                player1Button.classList.add("selected");
            } else if (rowData.selectedWinner === rowData.players[1]) {
                player2Button.classList.add("selected");
            }

            winnerCell.appendChild(player1Button);
            winnerCell.appendChild(player2Button);
            row.appendChild(winnerCell);

            // Scores cell
            const scoresCell = document.createElement("td");
            const scoresContainer = document.createElement("div");
            scoresContainer.classList.add("scores-container");
            scoresContainer.innerHTML = ""; // Clear any pre-existing scores

            rowData.scores.forEach((score) => {
                const scoreRow = document.createElement("div");
                scoreRow.style.display = "flex";
                scoreRow.style.alignItems = "center";
                scoreRow.style.gap = "5px";

                const scoreInput1 = document.createElement("input");
                scoreInput1.classList.add("score-input");
                scoreInput1.value = score[0] || ""; // Restore first score
                scoreRow.appendChild(scoreInput1);

                const dash = document.createElement("span");
                dash.textContent = "-";
                scoreRow.appendChild(dash);

                const scoreInput2 = document.createElement("input");
                scoreInput2.classList.add("score-input");
                scoreInput2.value = score[1] || ""; // Restore second score
                scoreRow.appendChild(scoreInput2);

                scoresContainer.appendChild(scoreRow);
            });

            scoresCell.appendChild(scoresContainer);
            row.appendChild(scoresCell);

            tableBody.appendChild(row);
        });
    }
}




function saveDrawToLocalStorage(tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    const rows = tableBody.querySelectorAll("tr");

    const drawData = Array.from(rows).map((row) => {
        const player1Button = row.querySelector(".winner-button:nth-child(1)");
        const player2Button = row.querySelector(".winner-button:nth-child(2)");
        const player1 = player1Button.textContent.trim();
        const player2 = player2Button.textContent.trim();

        // Save the selected winner (if any)
        const selectedWinner = row.querySelector(".winner-button.selected")?.textContent.trim() || null;

        const scores = Array.from(row.querySelectorAll(".score-input")).map((input) => input.value.trim());

        return {
            players: [player1, player2],
            selectedWinner,  // Save the selected winner here
            scores: chunkArray(scores, 2), // Group scores into pairs
        };
    });

    localStorage.setItem(`${tableBodyId}-draw`, JSON.stringify(drawData));
    console.log(`Saved draw for ${tableBodyId}:`, drawData);
}


// Utility to chunk scores into pairs
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}


// Restore the roster when the page is loaded
window.addEventListener('load', () => {
    restoreRosterFromLocalStorage();
    restoreDrawFromLocalStorage("schedule"); // Restore boys draw
    restoreDrawFromLocalStorage("girlnames"); // Restore girls draw
});





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


// Select the remove button
const removeButton = document.getElementById("removeButton");

// Add a click event listener to the button
removeButton.addEventListener("click", () => {
    // Select all table cells
    const cells = document.querySelectorAll('td');
    
    // Loop through each cell and remove the text content if it's highlighted
    cells.forEach(cell => {
        if (cell.style.backgroundColor === 'rgba(169, 169, 169, 0.5)') { // Check if the cell is highlighted gray
            cell.textContent = ''; // Remove the text (name) from the cell
            cell.style.backgroundColor = ''; // Reset the background color
        }
    });

    // Check if any row is empty and remove it
    const rows = document.querySelectorAll('#roster tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        // If both cells are empty, remove the row
        if (cells[0].textContent.trim() === "" && cells[1].textContent.trim() === "") {
            row.remove();
        }
    });

    // Save the updated roster to localStorage after removal
    saveRosterToLocalStorage();
});

// Select the input elements and button
const entryBox = document.getElementById("entryBox");
const dropdown = document.getElementById("gender");
const addButton = document.getElementById("addButton");
const roster = document.querySelector("#roster tbody");

// Add event listener for adding a new player
addButton.addEventListener("click", () => {
    // Get the value of the entry box
    const enteredText = entryBox.value.trim();

    // Get the selected value from the radiobuttons
    const selectedGender = document.querySelector('input[name="gender"]:checked')?.value;

    // Check if the entry box has some text
    if (enteredText === "") {
        alert("Please enter some text.");
        return; // Exit if no text was entered
    }

    // Check if a gender has been selected
    if (!selectedGender) {
        alert("Please select a gender.");
        return; // Exit if no gender is selected
    }

    // Determine the column to check (0 for Boys, 1 for Girls)
    const columnIndex = selectedGender === "Boys" ? 0 : 1;

    // Check for an empty cell in the appropriate column
    let emptyCellFound = false;
    const rows = roster.querySelectorAll("tr");

    for (const row of rows) {
        const cell = row.children[columnIndex];
        if (cell && cell.textContent.trim() === "") {
            // Fill the first empty cell with the entered text
            cell.textContent = enteredText;
            emptyCellFound = true;
            break; // Stop checking further rows
        }
    }

    // If no empty cell was found, add a new row
    if (!emptyCellFound) {
        const newRow = document.createElement("tr");

        // Create a cell for Boy and a cell for Girl
        const boyCell = document.createElement("td");
        const girlCell = document.createElement("td");

        if (selectedGender === "Boys") {
            boyCell.textContent = enteredText;
            newRow.appendChild(boyCell); // Append to the row
            newRow.appendChild(girlCell); // Empty girl cell
        } else if (selectedGender === "Girls") {
            girlCell.textContent = enteredText;
            newRow.appendChild(boyCell); // Empty boy cell
            newRow.appendChild(girlCell); // Append to the row
        }

        // Append the new row to the table body
        roster.appendChild(newRow);
    }

    // Save the updated roster to localStorage
    saveRosterToLocalStorage();

    // Reset input and dropdown
    entryBox.value = ""; // Clear entry box
});

// Function to save the current roster state to localStorage
function saveRosterToLocalStorage() {
    const rosterData = [];
    const rows = roster.querySelectorAll("tr");

    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll("td");
        cells.forEach(cell => rowData.push(cell.textContent.trim()));
        rosterData.push(rowData);
    });

    localStorage.setItem('roster', JSON.stringify(rosterData));
}

// Function to restore the roster state from localStorage
function restoreRosterFromLocalStorage() {
    const rosterData = JSON.parse(localStorage.getItem('roster'));

    if (rosterData) {
        roster.innerHTML = ''; // Clear the current table body

        rosterData.forEach(rowData => {
            const row = document.createElement("tr");

            rowData.forEach(cellData => {
                const cell = document.createElement("td");
                cell.textContent = cellData;
                row.appendChild(cell);
            });

            roster.appendChild(row);
        });
    }
}


// Colours a cell gray when clicked and clear when clicked again
document.querySelector('#roster tbody').addEventListener('click', function(event) {
    // Only handle click events on td elements
    if (event.target.tagName.toLowerCase() === 'td') {
        // Toggle between gray and default background color
        if (event.target.style.backgroundColor === 'rgba(169, 169, 169, 0.5)') {
            event.target.style.backgroundColor = ''; // Remove background color (clear it)
        } else {
            event.target.style.backgroundColor = 'rgba(169, 169, 169, 0.5)'; // Set background to gray
        }
    }
});


// Select the generate button
const generateButton = document.getElementById("generateButton");

generateButton.addEventListener("click", () => {
    const boyCells = document.querySelectorAll("#roster tbody tr td:first-child"); // Select all cells in the Boys column
    const girlCells = document.querySelectorAll("#roster tbody tr td:nth-child(2)"); // Select all cells in the Girls column

    let boyPlayers = [];
    let girlPlayers = [];

    // Extract names from the Boys column
    boyCells.forEach(cell => {
        const name = cell.textContent.trim();
        if (name) {
            boyPlayers.push(name); // Add name to the list if it's not empty
        }
    });

    // Check if any names were found
    if (boyPlayers.length === 0) {
        alert("No players in the Boys column.");
        return; // Exit if the Boys column is empty
    }

    // Extract names from the Girls column
    girlCells.forEach(cell => {
        const name = cell.textContent.trim();
        if (name) {
            girlPlayers.push(name); // Add name to the list if it's not empty
        }
    });

    // Check if any names were found
    if (girlPlayers.length === 0) {
        alert("No players in the Boys column.");
        return; // Exit if the Boys column is empty
    }

    // Sort the players array after the loop
    boyPlayers.sort();
    girlPlayers.sort();

    generateDraw(boyPlayers, "schedule");
    generateDraw(girlPlayers, "girlnames");
    
});



// Restore the roster when the page is loaded
window.addEventListener('load', () => {
    restoreRosterFromLocalStorage();
});

  
  
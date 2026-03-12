import { makeDraw } from './masterDraws.js';

function generateDraw(players, memory, key, tableBodyId) {
    const games = makeDraw(players);

    // MEMORY MANAGEMENT -----------------------------------------------------------
    // Create a mapping of existing games by player pair for quick lookup
    const gameMap = new Map(memory.map(game => [game.players.join('-'), game]));

    games.forEach((pair, index) => {
        const [player1, player2] = pair;
        const gameKey = `${player1}-${player2}`;

        if (gameMap.has(gameKey)) {
            // If the game exists, preserve its data but update its index
            memory[index] = gameMap.get(gameKey);
        } else {
            // Otherwise, create a fresh game entry
            memory[index] = {
                "players": [player1, player2],
                "winner": null,
                "score": [null, null],
                "completed": false
            };
        }
    });

    // Remove any extra games from memory if the new draw is shorter
    memory.length = games.length;

    saveToStorage(memory, key)
    //------------------------------------------------------------------------------

    // POPULATING THE DRAW TABLE ---------------------------------------------------
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML =''; // Clears table

    // Extract all data from memory
    memory.forEach((game, index) => {
        const row = document.createElement("tr"); // Make table row
        const { players, winner, score, completed } = game; // players = ['player1', 'player2'], winner = null, score = [null,null], completed = true/false
        const [player1, player2] = players; // player1 = 'player1, player2 = 'player2'
        const gameNum = index + 1; // We start counting games at 1
        
        // GAME CELL (includes 1 button)
        const gameCell = document.createElement("td");
        gameCell.classList.add("game-cell"); // Needed CSS styling
        const gameButton = document.createElement("button");
        gameButton.classList.add("game-button"); // Needed CSS styling
        gameButton.textContent = gameNum;

        // Decide its selected state based on memory
        if (completed === true) {
            gameButton.classList.add("selected");
        } else {
            gameButton.classList.remove("selected");
        }

        // EVENT: Add click event to toggle if the game is completed or not
        gameButton.addEventListener("click", () => {
            const isSelected = gameButton.classList.contains("selected"); // Get current state of button
            
            // When the user clicks the button, we need to set the opposite state of the current
            if (isSelected) {
                gameButton.classList.remove("selected");
                memory[index]["completed"] = false;
            } else {
                gameButton.classList.add("selected");
                memory[index]["completed"] = true;
            }
        
            saveToStorage(memory, key);
        });
        
        gameCell.appendChild(gameButton)
        row.appendChild(gameCell);

        // MATCH CELL (includes two buttons)
        const winnerCell = document.createElement("td");
        const player1Button = document.createElement("button");
        player1Button.classList.add("winner-button"); // Needed CSS styling
        player1Button.textContent = player1;

        const player2Button = document.createElement("button");
        player2Button.classList.add("winner-button"); // Needed CSS styling
        player2Button.textContent = player2;

        // Decide its selected state based on memory
        if (winner === player1) {
            player1Button.classList.add("selected");
            player2Button.classList.remove("selected");
        } else if (winner === player2) {
            player2Button.classList.add("selected");
            player1Button.classList.remove("selected");
        }


        // Add both buttons to the match cell and add to row
        winnerCell.appendChild(player1Button);
        winnerCell.appendChild(player2Button);
        row.appendChild(winnerCell);

        // EVENTS: Add click events to toggle winner selection
        player1Button.addEventListener("click", () => {
            const isSelected = player1Button.classList.contains("selected"); // Get current state of button
            
            // When the user clicks the button, we need to set the opposite state of the current
            if (isSelected) {
                player1Button.classList.remove("selected");
                memory[index]["winner"] = null;
            } else {
                player1Button.classList.add("selected");
                player2Button.classList.remove("selected");
                memory[index]["winner"] = player1;
            }
        
            saveToStorage(memory, key);
        });

        player2Button.addEventListener("click", () => {
            const isSelected = player2Button.classList.contains("selected"); // Get current state of button
            
            // When the user clicks the button, we need to set the opposite state of the current
            if (isSelected) {
                player2Button.classList.remove("selected");
                memory[index]["winner"] = null;
            } else {
                player2Button.classList.add("selected");
                player1Button.classList.remove("selected");
                memory[index]["winner"] = player2;
            }
        
            saveToStorage(memory, key);
        });
        
        // SCORES CELL (2 entry boxes)
        // Make two entry boxes separated by a dash
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

        // Decide the scores (values of each entry box) based on memory
        if (score[0] !== null) {
            scoreInput1.value = score[0];
        }
        
        if (score[1] !== null) {
            scoreInput2.value = score[1];
        }
        

        // EVENTS: Add event listeners on the inputs to update memory
        scoreInput1.addEventListener('input', () => {
            memory[index]["score"][0] = scoreInput1.value;
            saveToStorage(memory, key);

            // Shift focus from input 1 to 2 if the user hits the 2 digit limit on input 1
            if (scoreInput1.value.length >= 2) {
                scoreInput2.focus();
            }
        });

        scoreInput2.addEventListener('input', () => {
            memory[index]["score"][1] = scoreInput2.value;
            saveToStorage(memory, key);
        });

        scoresContainer.appendChild(scoreInput1);
        scoresContainer.appendChild(dash);
        scoresContainer.appendChild(scoreInput2);
        scoresCell.appendChild(scoresContainer);
        row.appendChild(scoresCell);

        // ADD ROW TO TABLE
        tableBody.appendChild(row);
    });
    //------------------------------------------------------------------------------
    
}

// Calculate boys and girls results
function drawResults(memory, tableBodyId) {
    const resultsTable = document.getElementById(tableBodyId);
    resultsTable.innerHTML = '';

    let playerStats = {};

    // Loop through each game in memory
    for (const game of memory) {
        const { players, winner } = game;

        // Skip the game if winner is null (game hasn't been played)
        if (winner === null) continue;

        // Initialize player stats if they don’t exist
        for (const player of players) {
            if (!playerStats[player]) {
                playerStats[player] = { wins: 0, losses: 0 };
            }
        }

        // Update win/loss counts
        playerStats[winner].wins += 1;
        const loser = players.find(p => p !== winner);
        playerStats[loser].losses += 1;
    }

    // Sort players by wins
    const sortedPlayerStats = Object.entries(playerStats).sort(([, a], [, b]) => b.wins - a.wins);

    // Populate table with data
    for (let i = 0; i < sortedPlayerStats.length; i++) {
        const player = sortedPlayerStats[i][0];
        const { wins, losses } = sortedPlayerStats[i][1];
        const totalGames = wins + losses;
        const rank = i + 1;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player}</td>
            <td>${totalGames}</td>
            <td>${wins}</td>
            <td>${losses}</td>
            <td>${rank}</td>
        `;

        resultsTable.appendChild(row);
    }
}

// Download the results as a CSV
function downloadCSV(memory, TableId, filename) {
    // BASIC RESULTS TABLE
    const table = document.getElementById(TableId);
    let csvContent = "";

    // Get table headers
    const headers = [...table.querySelectorAll("th")].map(th => `"${th.textContent.trim()}"`);
    csvContent += headers.join(",") + "\n";

    // Get table rows
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const cells = [...row.querySelectorAll("td")].map(td => `"${td.textContent.trim()}"`);
        csvContent += cells.join(",") + "\n";
    });

    // Add blank lines between tables
    csvContent += "\n\n\n";

    // FULL GAME RESULTS TABLE
    // Make headers
    csvContent += "Game,Players,Winner,Scores\n";

    // Iterate over each game in memory
    memory.forEach((game, gameIndex) => {
        const players = game.players;
        const player1 = players[0];
        const player2 = players[1];

        // Determine the winner
        const winner = game.winner ? game.winner : "None";

        // Handle scores (the score is an array with two values)
        let scores;
        if (game.score.every(score => score === null)) {
            scores = "Not Completed";
        } else {
            scores = game.score.join(" to ");
        }

        // Add the row to the CSV content
        csvContent += `${gameIndex + 1},${player1} vs ${player2},${winner},${scores}\n`;
    });

    // Create a Blob with the CSV data and trigger a download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}Results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Save boys/girls draws to LocalStorage
function saveToStorage(memory, key) {
    localStorage.setItem(key, JSON.stringify(memory));
}

// Save memory to LocalStorage
function saveMemory() {
    const gameState = {
        boysButtonState: boysDrawButton.disabled,
        girlsButtonState: girlsDrawButton.disabled,
        boysHeaderText: document.querySelector("#roster thead th:nth-child(2)").textContent.trim(),
        girlsHeaderText: document.querySelector("#roster thead th:nth-child(3)").textContent.trim(),
        boysText: boysDrawButton.textContent,
        girlsText: girlsDrawButton.textContent,
        boyAttendance: boyAttendance,
        girlAttendance: girlAttendance,
        boysDrawActivated: boysDrawActivated,  
        girlsDrawActivated: girlsDrawActivated,
        boyPlayers: boyPlayers,
        girlPlayers: girlPlayers
    };
    
    localStorage.setItem("gameState", JSON.stringify(gameState));
}

// Function to create a trash icon for removing names
function createDeleteIcon(cell) {
    const container = document.createElement("span");
    container.classList.add("icon-container");

    // Edit icon (placed first)
    const editIcon = document.createElement("span");
    editIcon.textContent = "✏️";
    editIcon.classList.add("edit-icon");
    editIcon.style.display = "none"; // Initially hidden

    // Swap icon for switching sides
    const swapIcon = document.createElement("span");
    swapIcon.textContent = "↔️"; // Two-sided arrow
    swapIcon.classList.add("swap-icon");
    swapIcon.style.display = "none"; // Initially hidden

    // Trash icon for removal
    const deleteIcon = document.createElement("span");
    deleteIcon.textContent = "🗑️";
    deleteIcon.classList.add("delete-icon");
    deleteIcon.style.display = "none"; // Initially hidden

    // Append icons in order
    container.appendChild(editIcon);
    container.appendChild(swapIcon);
    container.appendChild(deleteIcon);

    // Get the name without icons
    const getName = () => cell.textContent.replace(/[🗑️✏️↔️]/g, "").trim();

    // Delete functionality
    deleteIcon.addEventListener("click", () => {
        const nameOnly = getName();
        if (confirm(`Remove ${nameOnly}?`)) {
            const row = cell.parentElement;
            const boyCell = row.children[1];  // Boys column
            const girlCell = row.children[2]; // Girls column

            if (boyCell.textContent.includes(nameOnly)) {
                boyAttendance = boyAttendance.filter(name => name !== nameOnly);
                boyplayerRemoved = true;
            } else if (girlCell.textContent.includes(nameOnly)) {
                girlAttendance = girlAttendance.filter(name => name !== nameOnly);
                girlplayerRemoved = true;
            }

            cell.textContent = ""; // Clear name
            if (!boyCell.textContent.trim() && !girlCell.textContent.trim()) {
                row.remove(); // Remove empty row
                
                
            }

            remakeRoster(); // This fixes the row numbering and trapped blank cells
            // Display trash can and edit icon
            document.querySelectorAll(".edit-icon, .delete-icon, .swap-icon").forEach(icon => {
                icon.style.display = removeMode ? "inline-block" : "none";
            });
            saveMemory();
        }
    });

    // Edit functionality
    editIcon.addEventListener("click", () => {
        const oldName = getName();
        const newName = prompt(`Edit name for ${oldName}:`, oldName)?.trim();
        
        if (!newName || newName === oldName) return; // Cancel or no change
        
        // Determine if editing a boy's or girl's name
        const isBoy = boyAttendance.includes(oldName);
        const isGirl = girlAttendance.includes(oldName);

        // Ensure we only check for duplicates within the same list
        if (isBoy && boyAttendance.includes(newName)) {
            alert(`Error: The name "${newName}" is already in the list.`);
            return;
        }
        if (isGirl && girlAttendance.includes(newName)) {
            alert(`Error: The name "${newName}" is already in the list.`);
            return;
        }

        // Check if a draw has been made (by checking the activated state of the draw buttons)
        if (boysDrawActivated || girlsDrawActivated) {
            // Update memory only if a draw has been made
            if (isBoy) {
                const playerIndex = boyAttendance.indexOf(oldName);
                boyAttendance[playerIndex] = newName;
                // Update the corresponding entry in boysMemory
                boysMemory.forEach(game => {
                    if (game.players.includes(oldName)) {
                        game.players[game.players.indexOf(oldName)] = newName;
                    }
                    // Swap winner if necessary
                    if (game.winner === oldName) {
                        game.winner = newName;
                    }
                });
                boyplayerRemoved = true;
            } else if (isGirl) {
                const playerIndex = girlAttendance.indexOf(oldName);
                girlAttendance[playerIndex] = newName;
                // Update the corresponding entry in girlsMemory
                girlsMemory.forEach(game => {
                    if (game.players.includes(oldName)) {
                        game.players[game.players.indexOf(oldName)] = newName;
                    }
                    // Swap winner if necessary
                    if (game.winner === oldName) {
                        game.winner = newName;
                    }
                });
                girlplayerRemoved = true;
            }
            
            // Save memory after modification
            saveMemory();
        }

        // Update the name in the table
        cell.textContent = newName;
        cell.appendChild(container);
    });

    
    // Swap functionality
    swapIcon.addEventListener("click", () => {

        const nameOnly = getName();
        const row = cell.parentElement;
        const boyCell = row.children[1];  // Boys column
        const girlCell = row.children[2]; // Girls column
        
        if (confirm(`Swap ${nameOnly} to the other column?`)) {
            if (boyCell.textContent.includes(nameOnly)) {
                // Ensure uniqueness before swapping
                if (girlAttendance.includes(nameOnly)) {
                    alert("That name has already been added to that category.");
                    return;
                }

                // Add to girls first, then remove from boys
                girlAttendance.push(nameOnly);
                girlCell.textContent = nameOnly;
                boyAttendance = boyAttendance.filter(name => name !== nameOnly);
                boyCell.textContent = ""; // Clear old cell
                boyplayerRemoved = true;
                girlplayerRemoved = true;
            } else if (girlCell.textContent.includes(nameOnly)) {
                // Ensure uniqueness before swapping
                if (boyAttendance.includes(nameOnly)) {
                    alert("That name has already been added to that category.");
                    return;
                }

                // Add to boys first, then remove from girls
                boyAttendance.push(nameOnly);
                boyCell.textContent = nameOnly;
                girlAttendance = girlAttendance.filter(name => name !== nameOnly);
                girlCell.textContent = ""; // Clear old cell
                girlplayerRemoved = true;
                boyplayerRemoved = true;
            }

            remakeRoster(); // This fixes the row numbering and trapped blank cells
            // Display trash can and edit icon and swap icon
            document.querySelectorAll(".edit-icon, .delete-icon, .swap-icon").forEach(icon => {
                icon.style.display = removeMode ? "inline-block" : "none";
            });
            saveMemory();
        }
    });


    return container;
    
}

// Remake the roster table
function remakeRoster() {
    // Restore headers
    document.querySelector("#roster thead th:nth-child(2)").textContent = boysHeaderText;
    document.querySelector("#roster thead th:nth-child(3)").textContent = girlsHeaderText;

    // Restore names
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

        const boyName = boyAttendance[i] || "";

        if (boyName !== "") {

            const wrapper = document.createElement("div");
            wrapper.classList.add("roster-name-cell");

            const nameSpan = document.createElement("span");
            nameSpan.textContent = boyName;

            const iconBox = document.createElement("span");
            iconBox.classList.add("roster-icons");
            iconBox.appendChild(createDeleteIcon(boyCell));

            wrapper.appendChild(nameSpan);
            wrapper.appendChild(iconBox);

            boyCell.appendChild(wrapper);
        }

        newRow.appendChild(boyCell);

        // const boyCell = document.createElement('td');
        // boyCell.textContent = boyAttendance[i] || "";  // Fallback to empty if no boy at this index
        // if (boyCell.textContent !== "") {  // Check if name is not empty
        //     boyCell.appendChild(createDeleteIcon(boyCell));  // Attach trash icon only if name is not empty
        // }
        // newRow.appendChild(boyCell);
        
        const girlCell = document.createElement('td');

        const girlName = girlAttendance[i] || "";

        if (girlName !== "") {

            const wrapper = document.createElement("div");
            wrapper.classList.add("roster-name-cell");

            const nameSpan = document.createElement("span");
            nameSpan.textContent = girlName;

            const iconBox = document.createElement("span");
            iconBox.classList.add("roster-icons");
            iconBox.appendChild(createDeleteIcon(girlCell));

            wrapper.appendChild(nameSpan);
            wrapper.appendChild(iconBox);

            girlCell.appendChild(wrapper);
        }

        newRow.appendChild(girlCell);

        // const girlCell = document.createElement('td');
        // girlCell.textContent = girlAttendance[i] || "";  // Fallback to empty if no girl at this index
        // if (girlCell.textContent !== "") {  // Check if name is not empty
        //     girlCell.appendChild(createDeleteIcon(girlCell));  // Attach trash icon only if name is not empty
        // }
        // newRow.appendChild(girlCell);

        tbody.appendChild(newRow);
    }
}

// --- Global variables ---
let boyAttendance = [];
let girlAttendance = [];
let boysMemory = [];
let girlsMemory = [];
let boyPlayers = [];
let girlPlayers = [];
let removeMode = false; // Track mode state
let boyplayerRemoved = false; // Track if a boy player was removed
let girlplayerRemoved = false; // Track if a girl player was removed
let boysDrawActivated = false; // Track if boys draw button has been clicked
let girlsDrawActivated = false; // Track if girls draw button has been clicked
let boysButtonState = false; // true means disabled (grayed out)
let girlsButtonState = false; // true means disabled (grayed out)
let boysHeaderText = "Boys";
let girlsHeaderText = "Girls";
let boysDrawButtonText = `Make ${boysHeaderText} Draw`;
let girlsDrawButtonText = `Make ${girlsHeaderText} Draw`;

// After the DOM is loaded, we content all event listeners and pull from LocalStorage
document.addEventListener("DOMContentLoaded", () => {
    // --- EVENT LISTENERS ---

    // Make Boys Draw button
    boysDrawButton.addEventListener("click", () => {
        // This indicates that the boys draw button has been pressed
        // This is so we can decided whether to change the text to "Update Boys Draw" later on or not
        // See the removeButton for its use
        if (!boysDrawActivated) {
            boysDrawActivated = true;
        }

        saveMemory(); // Save boysDrawActivated state to localStorage

        // Disable the button to prevent multiple clicks
        boysDrawButton.disabled = true;

        // Clear the previous list of players
        boyPlayers = []; // Clear the array to avoid duplicates

        document.querySelectorAll('#roster tbody tr').forEach(row => {
            const boy = row.children[1]?.textContent.replace("✏️", "").replace("↔️", "").replace("🗑️", "").trim();
            
            if (boy !== '') {
                boyPlayers.push(boy);
            }
            
        });

        generateDraw(boyPlayers, boysMemory, "boysMemory", "boysdraw");
    });

    // Make Girls Draw button
    girlsDrawButton.addEventListener("click", () => {
        if (!girlsDrawActivated) {
            girlsDrawActivated = true;
        }

        saveMemory(); // Save girlsDrawActivated state to localStorage

        // Disable the button to prevent multiple clicks
        girlsDrawButton.disabled = true;

        // Clear the previous list of players
        girlPlayers = []; // Clear the array to avoid duplicates

        document.querySelectorAll('#roster tbody tr').forEach(row => {
            const girl = row.children[2]?.textContent.replace("✏️", "").replace("↔️", "").replace("🗑️", "").trim();
            if (girl !== '') {
                girlPlayers.push(girl);
            }
            
        });

        generateDraw(girlPlayers, girlsMemory, "girlsMemory", "girlsdraw");
    });

    // Add event listener for adding a new player
    addButton.addEventListener("click", () => {
        // Get the value of the entry box
        const enteredText = entryBox.value.trim();

        // Check if the entry box has some text
        if (enteredText === "") {
            alert("Please enter a name.");
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
        if (columnIndex === 1 && boyAttendance.includes(enteredText)) {
            alert("That name has already been added to that category.");
            return; // Exit
        } 
        if (columnIndex === 2 && girlAttendance.includes(enteredText)) {
            alert("That name has already been added to that category.");
            return; // Exit
        }

        // Check for an empty cell in the appropriate column
        let emptyCellFound = false;
        const rows = roster.querySelectorAll("tr");

        for (const row of rows) {
            const cell = row.children[columnIndex];
            if (cell && cell.textContent.trim() === "") {
                // Fill the first empty cell with the entered text
                const wrapper = document.createElement("div");
                wrapper.classList.add("roster-name-cell");

                const nameSpan = document.createElement("span");
                nameSpan.textContent = enteredText;

                const iconBox = document.createElement("span");
                iconBox.classList.add("roster-icons");
                iconBox.appendChild(createDeleteIcon(cell));

                wrapper.appendChild(nameSpan);
                wrapper.appendChild(iconBox);

                cell.appendChild(wrapper);

                //cell.textContent = enteredText;
                //cell.appendChild(createDeleteIcon(cell)); // Attach trash icon
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
                const wrapper = document.createElement("div");
                wrapper.classList.add("roster-name-cell");

                const nameSpan = document.createElement("span");
                nameSpan.textContent = enteredText;

                const iconBox = document.createElement("span");
                iconBox.classList.add("roster-icons");
                iconBox.appendChild(createDeleteIcon(boyCell));

                wrapper.appendChild(nameSpan);
                wrapper.appendChild(iconBox);

                boyCell.appendChild(wrapper);
                //boyCell.textContent = enteredText;
                //boyCell.appendChild(createDeleteIcon(boyCell)); // Attach edit and trash icons
                newRow.appendChild(boyCell); // Append to the row
                newRow.appendChild(girlCell); // Empty girl cell
            } else if (selectedGender === "Girls") {
                const wrapper = document.createElement("div");
                wrapper.classList.add("roster-name-cell");

                const nameSpan = document.createElement("span");
                nameSpan.textContent = enteredText;

                const iconBox = document.createElement("span");
                iconBox.classList.add("roster-icons");
                iconBox.appendChild(createDeleteIcon(girlCell));

                wrapper.appendChild(nameSpan);
                wrapper.appendChild(iconBox);

                girlCell.appendChild(wrapper);
                //girlCell.textContent = enteredText;
                //girlCell.appendChild(createDeleteIcon(girlCell)); // Attach edit and trash icons
                newRow.appendChild(boyCell); // Empty boy cell
                newRow.appendChild(girlCell); // Append to the row
            }

            // Get the tbody element and append the new row to it
            tbody.appendChild(newRow); // Append the new row to tbody
        }

        // Update memory
        // Always enable the boys and girls draw buttons when adding a name
        if (columnIndex === 1) {
            boyAttendance.push(enteredText);
            //boysDrawButton.disabled = false;
        } else if (columnIndex === 2) {
            girlAttendance.push(enteredText);
            //girlsDrawButton.disabled = false;
        }

        // Clear entry box
        entryBox.value = "";
        
        // If NOT in remove mode and a button was previously pressed, update the button
        if (!removeMode && columnIndex === 1 && boysDrawButton.disabled) {
            boysDrawButton.textContent = `Update ${boysHeaderText} Draw`;
            boysDrawButton.disabled = false;
        } else if (!removeMode && columnIndex === 2 && girlsDrawButton.disabled) {
            girlsDrawButton.textContent = `Update ${girlsHeaderText} Draw`;
            girlsDrawButton.disabled = false;
        }

        // Log attendance memory
        saveMemory();
    });

    // Remove Player(s) button
    removeButton.addEventListener("click", () => {
        removeMode = !removeMode; // Toggle mode

        // Select your headers and tabs
        const boysHeader = document.querySelector("#roster thead th:nth-child(2)"); // Boys header (2nd column)
        const girlsHeader = document.querySelector("#roster thead th:nth-child(3)"); // Girls header (3rd column)
        const boysTab = document.querySelector('.tab-button[data-tab="boys-draw"]');
        const girlsTab = document.querySelector('.tab-button[data-tab="girls-draw"]');
        const boysRadio = document.getElementById("boyLabel");
        const girlsRadio = document.getElementById("girlLabel");
        const boysDownload = document.getElementById("boysDownloadButton");
        const girlsDownload = document.getElementById("girlsDownloadButton");

        boysHeaderText = boysHeader.textContent.trim();
        girlsHeaderText = girlsHeader.textContent.trim();

        if (removeMode) {
            // Save previous button states when entering remove mode
            boysButtonState = boysDrawButton.disabled; // true means disabled (grayed out)
            girlsButtonState = girlsDrawButton.disabled; // true means disabled (grayed out)
            
            // Enable editing for headers
            boysHeader.contentEditable = "true";
            girlsHeader.contentEditable = "true";
            boysHeader.classList.add("editable");
            girlsHeader.classList.add("editable");
            saveMemory()
        } else {
            // Save changes, update tab names, and disable editing
            boysHeader.contentEditable = "false";
            girlsHeader.contentEditable = "false";
            boysHeader.classList.remove("editable");
            girlsHeader.classList.remove("editable");
            
            // Update text of radiobuttons, tabs, and draw buttons (which make be overwritten below with 'update')
            boysRadio.textContent = boysHeader.textContent.trim();
            girlsRadio.textContent = girlsHeader.textContent.trim();
            boysTab.textContent = boysHeader.textContent.trim();
            girlsTab.textContent = girlsHeader.textContent.trim();
            boysDownload.textContent = `Download ${boysHeaderText} Results`;
            girlsDownload.textContent = `Download ${girlsHeaderText} Results`;
            // Ensure the correct button text stays consistent
            if (boyplayerRemoved && boysDrawActivated) {
                boysDrawButton.textContent = `Update ${boysHeaderText} Draw`;
            } else {
                boysDrawButton.textContent = boysDrawButtonText;
            }

            if (girlplayerRemoved && girlsDrawActivated) {
                girlsDrawButton.textContent = `Update ${girlsHeaderText} Draw`;
            } else {
                girlsDrawButton.textContent = girlsDrawButtonText;
            }

            saveMemory()
        }

        // Decides to display trash can whether in remove mode or not
        // Display trash can and edit icon and swap icon
        document.querySelectorAll(".edit-icon, .delete-icon, .swap-icon").forEach(icon => {
            icon.style.display = removeMode ? "inline-block" : "none";
        });
        

        // Change button text and background colour depending on what mode you're in
        removeButton.textContent = removeMode ? "Done" : "Edit";
        removeButton.style.backgroundColor = removeMode ? "#FF7043" : "";

        // Disable/enable all buttons except the remove button
        document.querySelectorAll("button, input").forEach(el => {  
            if (el !== removeButton) { // Keep the toggle button enabled  
                el.disabled = removeMode;
                el.classList.toggle("disabled-mode", removeMode); // Add class for styling
            }
        });

        // Apply gray-out effect to everything if in remove mode
        document.body.classList.toggle("grayed-out", removeMode);

        // Manually disable and enable the boys and girls draw buttons
        if (!removeMode) {
            // Track if the button text was "Update" before entering edit mode
            let wasBoysDrawUpdated = boysDrawButton.textContent === `Update ${boysHeaderText} Draw`;
            let wasGirlsDrawUpdated = girlsDrawButton.textContent === `Update ${girlsHeaderText} Draw`;

            // Restore button states if no deletions
            if (!boyplayerRemoved) boysDrawButton.disabled = boysButtonState;
            if (!girlplayerRemoved) girlsDrawButton.disabled = girlsButtonState;
            
            saveMemory();

            // If deletions occurred, update buttons accordingly
            if (boyplayerRemoved && boysDrawActivated) {
                boysDrawButton.textContent = `Update ${boysHeaderText} Draw`;
                boysDrawButton.disabled = false;
                saveMemory();
            }
            if (girlplayerRemoved && girlsDrawActivated) {
                girlsDrawButton.textContent = `Update ${girlsHeaderText} Draw`;
                girlsDrawButton.disabled = false;
                saveMemory();
            }

            // If no deletions and the button was previously "Update", retain "Update" text
            if (!boyplayerRemoved && !wasBoysDrawUpdated) {
                boysDrawButton.textContent = `Make ${boysHeaderText} Draw`;
            }
            if (!girlplayerRemoved && !wasGirlsDrawUpdated) {
                girlsDrawButton.textContent = `Make ${girlsHeaderText} Draw`;
            }

            // Reset deletion flags
            boyplayerRemoved = false;
            girlplayerRemoved = false;
        }
    });

    rosterButton.addEventListener("click", () => {

    const proceed = confirm("This will clear the table and load the 2026 singles and doubles pairings. Continue?");
    if (!proceed) return;
        const singles = [
            "Lucas",
            "Lucky",
            "Kyle",
            "Nelson",
            "Fin",
            "Zyna",
            "Anika"
        ];

        const doubles = [
            "Nantas/Lyka",
            "Alex/Angela M",
            "Olivia/Sienna",
            "Shaylee/Angela B",
            "Nathan/Mary",
            "Chloe/Khloe",
            "Meg/Dion",
            "Garrett/Stephen",
            "Rey/Ryan",
            "Kien/Rashard",
            "Kayden/William",
            "Ethan/Jerfen",
            "Coaches"
        ];
    // const boys = [
    //     "Nantas",
    //     "Kayden",
    //     "Garrett",
    //     "Stephen",
    //     "Lucas",
    //     "Ethan",
    //     "Ryan",
    //     "Rashard",
    //     "William",
    //     "Nathan",
    //     "Jerfen",
    //     "Lucky",
    //     "Kien",
    //     "Rey",
    //     "Kyle"
    // ];

    // const girls = [
    //     "Lyka",
    //     "Angela M",
    //     "Alex",
    //     "Olivia",
    //     "Sienna",
    //     "Shaylee",
    //     "Mary",
    //     "Angela B",
    //     "Dion",
    //     "Anika",
    //     "Chloe A",
    //     "Meg",
    //     "Fin",
    //     "Zyna",
    //     "Khloe Y"
    // ];

    // Clear current memory arrays
    boyAttendance = [];
    girlAttendance = [];

    // Populate arrays
    boyAttendance.push(...singles);
    girlAttendance.push(...doubles);

    // Change all headings, buttons, and labels to be Singles and Doubles
    boysHeaderText = "Singles";
    girlsHeaderText = "Doubles";

    document.querySelector("#roster thead th:nth-child(2)").textContent = boysHeaderText;
    document.querySelector("#roster thead th:nth-child(3)").textContent = girlsHeaderText;

    document.getElementById("boyLabel").textContent = boysHeaderText;
    document.getElementById("girlLabel").textContent = girlsHeaderText;

    document.querySelector('.tab-button[data-tab="boys-draw"]').textContent = boysHeaderText;
    document.querySelector('.tab-button[data-tab="girls-draw"]').textContent = girlsHeaderText;

    document.getElementById("boysDownloadButton").textContent = `Download ${boysHeaderText} Results`;
    document.getElementById("girlsDownloadButton").textContent = `Download ${girlsHeaderText} Results`;

    document.getElementById("boysDrawButton").textContent = `Make ${boysHeaderText} Draw`;
    document.getElementById("girlsDrawButton").textContent = `Make ${girlsHeaderText} Draw`;

    // Rebuild the roster table
    remakeRoster(); 

    // Save to localStorage
    saveMemory();

});

    // Clear attendance button
    attendanceButton.addEventListener("click", () => {
        // Ask for confirmation
        const confirmation = confirm("This clears all attendance. Are you sure you wish to proceed? ");

        if (!confirmation) return;

        // Reset table headers
        //document.querySelector("#roster thead th:nth-child(2)").textContent = "Boys";
        //document.querySelector("#roster thead th:nth-child(3)").textContent = "Girls";

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

        boysMemory = [];
        girlsMemory = [];
        boyPlayers = [];
        girlPlayers = [];
        
        // Clear draws
        document.getElementById("boysdraw").innerHTML='';
        document.getElementById("girlsdraw").innerHTML='';

        removeMode = false;

        boysDrawButton.textContent = `Make ${boysHeaderText} Draw`;
        boysDrawButton.disabled = false;
        boysDrawActivated = false;

        girlsDrawButton.textContent = `Make ${girlsHeaderText} Draw`;
        girlsDrawButton.disabled = false;
        girlsDrawActivated = false;

        localStorage.clear(); // Clear all local storage
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

            // Auto-generate results when the "Results" tab is selected
            if (targetTab === "results") {
                drawResults(boysMemory, "boys-results-tbody");
                drawResults(girlsMemory, "girls-results-tbody");
            }
        });
    });

    // Set default tab to Attendance
    document.querySelector('.tab-button[data-tab="attendance"]').click();

    // Results download buttons
    boysDownloadButton.addEventListener("click", () => downloadCSV(boysMemory, 'boys-results', boysHeaderText));
    girlsDownloadButton.addEventListener("click", () => downloadCSV(girlsMemory, 'girls-results', girlsHeaderText));

    const savedState = JSON.parse(localStorage.getItem("gameState"));
    const savedBoysMemory = JSON.parse(localStorage.getItem("boysMemory") || "[]");
    boysMemory = savedBoysMemory;
    const savedGirlsMemory = JSON.parse(localStorage.getItem("girlsMemory") || "[]");
    girlsMemory = savedGirlsMemory;

    if (savedState) {
        // ATTENDANCE TABLE
        boysHeaderText = savedState.boysHeaderText || "Boys";
        girlsHeaderText = savedState.girlsHeaderText || "Girls";
        boyAttendance = savedState.boyAttendance || [];
        girlAttendance = savedState.girlAttendance || [];
        remakeRoster();

        // RADIO BUTTONS
        document.getElementById("boyLabel").textContent = boysHeaderText;
        document.getElementById("girlLabel").textContent = girlsHeaderText;

        // DRAW TAB NAMES
        document.querySelector('.tab-button[data-tab="boys-draw"]').textContent = boysHeaderText;
        document.querySelector('.tab-button[data-tab="girls-draw"]').textContent = girlsHeaderText;

        // DOWNLOAD BUTTON NAMES
        document.getElementById("boysDownloadButton").textContent = `Download ${boysHeaderText} Results`;
        document.getElementById("girlsDownloadButton").textContent = `Download ${girlsHeaderText} Results`;

        // BOYS AND GIRLS BUTTON ACTIVATION, STATE, AND TEXT
        boysDrawActivated = savedState.boysDrawActivated || false;
        girlsDrawActivated = savedState.girlsDrawActivated || false;

        boysDrawButton.disabled = savedState.boysButtonState || false;
        girlsDrawButton.disabled = savedState.girlsButtonState || false;

        boysDrawButton.textContent = savedState.boysText || `Make ${boysHeaderText} Draw`;
        girlsDrawButton.textContent = savedState.girlsText || `Make ${girlsHeaderText} Draw`;

        // BOYS DRAW
        //boysMemory = savedState.boysMemory || [];
        boyPlayers = savedState.boyPlayers || [];
        generateDraw(boyPlayers, boysMemory, "boysMemory", "boysdraw");

        // GIRLS DRAW
        //girlsMemory = savedState.girlsMemory || [];
        girlPlayers = savedState.girlPlayers || [];
        generateDraw(girlPlayers, girlsMemory, "girlsMemory", "girlsdraw");
    }
});


// Save data when the page is unloaded
// This should be supported across desktop and mobile browser
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveMemory();
});

window.addEventListener("pagehide", saveMemory);

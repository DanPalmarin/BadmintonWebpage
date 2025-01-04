export function makeDraw(players) {
    const isOdd = players.length % 2 !== 0;

    // Add a "Bye" if odd
    if (isOdd) {
        players.push("Bye");
    }

    const totalRounds = players.length - 1; // Number of rounds needed
    const matchesPerRound = Math.floor(players.length / 2);
    const draw = [];

    // Generate the draw
    for (let round = 0; round < totalRounds; round++) {
        const roundMatches = [];

        for (let match = 0; match < matchesPerRound; match++) {
            const player1 = players[match];
            const player2 = players[players.length - 1 - match];

            // Skip matches involving "Bye"
            if (player1 !== "Bye" && player2 !== "Bye") {
                roundMatches.push([player1, player2]);
            }
        }

        draw.push(...roundMatches);

        // Rotate players (except the first player) for the next round
        players.splice(1, 0, players.pop());
    }

    return draw;
}




// export function makeDraw(players) {
//     const size = players.length;
//     if (size < 2) {
//         return []; // No games possible with fewer than 2 players
//     } else if (size === 2) {
//         return [[players[0], players[1]]];
//     } else if (size === 3) {
//         return [
//             [players[0], players[1]],
//             [players[0], players[2]],
//             [players[1], players[2]],
//         ];
//     } else if (size > 3) {
//     // Total number of rounds
//     const rounds = size - 1;
//     const games = [];
    
//     // Create an array of player indices
//     let rotatedPlayers = [...players];

//     // Generate the round-robin schedule
//     for (let round = 0; round < rounds; round++) {
//         // Match players for the current round
//         for (let i = 0; i < Math.floor(size / 2); i++) {
//             const player1 = rotatedPlayers[i];
//             const player2 = rotatedPlayers[size - 1 - i];
//             games.push([player1, player2]);
//         }

//         // Rotate players (keeping the first player fixed)
//         rotatedPlayers = [rotatedPlayers[0], rotatedPlayers[size-1], ...rotatedPlayers.slice(1, -1)];
//     }

//     return games;
// }
// }
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
                const matchPlayers = [player1, player2];
                matchPlayers.sort();
                roundMatches.push(matchPlayers);
            }
        }

        draw.push(...roundMatches);

        // Rotate players (except the first player) for the next round
        players.splice(1, 0, players.pop());
    }

    return draw;
}
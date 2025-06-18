const { HLTV } = require('hltv');

// Pobierz nadchodzące mecze (np. dziś/jutro)
async function getUpcomingMatches() {
    const matches = await HLTV.getMatches();
    return matches
        .filter(m => m.date && m.team1 && m.team2)
        .slice(0, 10) // top 10
        .map(m => ({
            id: m.id,
            team1: m.team1.name,
            team2: m.team2.name,
            time: new Date(m.date).toLocaleString(),
            event: m.event.name
        }));
}

// Pobierz wynik danego meczu po ID
async function getMatchResult(matchId) {
    try {
        const match = await HLTV.getMatch({ id: matchId });
        if (!match || !match.team1 || !match.team2) return null;

        return {
            team1: match.team1.name,
            team2: match.team2.name,
            result: match.mapStats.map(m => `${m.name}: ${m.result}`),
            winner: match.team1.hasWon ? match.team1.name : match.team2.name
        };
    } catch (err) {
        console.error('Błąd HLTV:', err);
        return null;
    }
}

module.exports = {
    getUpcomingMatches,
    getMatchResult
};

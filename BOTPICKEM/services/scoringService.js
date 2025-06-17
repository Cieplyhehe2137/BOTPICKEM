// services/scoringService.js

const pickemService = require('./pickemService');
const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '../data/results.json');

function loadResults() {
    if (!fs.existsSync(resultsPath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
}

function calculateSwissScore(pick, swissResults) {
    let score = 0;
    if (!pick) return score;

    if (pick.threeZero === swissResults.threeZero) score += 4;
    if (pick.zeroThree === swissResults.zeroThree) score += 4;

    const correctAdvances = pick.advances.filter(team => swissResults.advances.includes(team));
    score += correctAdvances.length * 2;

    return score;
}

function calculatePlayoffsScore(pick, playoffsResults) {
    let score = 0;
    if (!pick) return score;

    const correctQF = pick.quarterfinals.filter(team => playoffsResults.quarterfinals.includes(team));
    score += correctQF.length * 2;

    const correctSF = pick.semifinals.filter(team => playoffsResults.semifinals.includes(team));
    score += correctSF.length * 4;

    if (pick.final === playoffsResults.final) score += 6;

    return score;
}

function calculateDoubleElimScore(pick, doubleElimResults) {
    let score = 0;
    if (!pick) return score;

    const correctUpper = pick.upperfinal.filter(team => doubleElimResults.upperfinal.includes(team));
    score += correctUpper.length * 3;

    const correctLower = pick.lowerfinal.filter(team => doubleElimResults.lowerfinal.includes(team));
    score += correctLower.length * 3;

    if (pick.grandfinal === doubleElimResults.grandfinal) score += 6;

    return score;
}

function calculateTotalScores() {
    const allPicks = pickemService.getAllPicks();
    const results = loadResults();

    const totalScores = [];

    for (const userId in allPicks) {
        const userPicks = allPicks[userId];
        let total = 0;

        total += calculateSwissScore(userPicks.swiss, results.swiss ?? {});
        total += calculatePlayoffsScore(userPicks.playoffs, results.playoffs ?? {});
        total += calculateDoubleElimScore(userPicks.doubleelim, results.doubleelim ?? {});

        totalScores.push({ userId, total });
    }

    totalScores.sort((a, b) => b.total - a.total);
    return totalScores;
}

module.exports = {
    calculateTotalScores
};

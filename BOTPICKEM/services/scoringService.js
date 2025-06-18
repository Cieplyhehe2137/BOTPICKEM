const path = require('path');
const fs = require('fs');

const picksPath = path.join(__dirname, '../data/picks.json');
const resultsPath = path.join(__dirname, '../data/results.json');

function loadPicks() {
    if (!fs.existsSync(picksPath)) return {};
    return JSON.parse(fs.readFileSync(picksPath));
}

function loadResults() {
    if (!fs.existsSync(resultsPath)) return {};
    return JSON.parse(fs.readFileSync(resultsPath));
}

function saveScores(fileName, scores) {
    const scoresPath = path.join(__dirname, `../data/${fileName}`);
    fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
}

module.exports = {
    loadPicks,
    loadResults,
    saveScores
};

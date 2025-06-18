const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PICKS_FILE = path.join(DATA_DIR, 'picks.json');

function ensureDataDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }
}

function loadPicks() {
    ensureDataDirectoryExists();

    if (!fs.existsSync(PICKS_FILE)) {
        fs.writeFileSync(PICKS_FILE, JSON.stringify({}));
    }

    const rawData = fs.readFileSync(PICKS_FILE);
    return JSON.parse(rawData);
}

function savePicks(picks) {
    ensureDataDirectoryExists();
    fs.writeFileSync(PICKS_FILE, JSON.stringify(picks, null, 2));
}

function saveUserPick(userId, pickData, category) {
    const picks = loadPicks();

    if (!picks[userId]) {
        picks[userId] = {};
    }

    picks[userId][category] = pickData;
    savePicks(picks);
}

function getUserPick(userId, category) {
    const picks = loadPicks();
    return picks[userId]?.[category] || null;
}

module.exports = {
    saveUserPick,
    getUserPick,
    loadPicks,
    savePicks
};

const fs = require("fs");
const path = require("path");

const PICKS_PATH = path.join(__dirname, "..", "data", "picks.json");

// Zapewnia, że plik istnieje
function ensurePicksFile() {
    if (!fs.existsSync(PICKS_PATH)) {
        fs.writeFileSync(PICKS_PATH, JSON.stringify({}, null, 2));
    }
}

// Zapisuje typy użytkownika dla danego wydarzenia
function submitPick(userId, eventId, pickData) {
    ensurePicksFile();

    const picks = JSON.parse(fs.readFileSync(PICKS_PATH, "utf8"));

    if (!picks[eventId]) {
        picks[eventId] = {};
    }

    picks[eventId][userId] = pickData;

    fs.writeFileSync(PICKS_PATH, JSON.stringify(picks, null, 2));
}

// Pobiera wszystkie typy
function getAllPicks() {
    ensurePicksFile();
    return JSON.parse(fs.readFileSync(PICKS_PATH, "utf8"));
}

// Pobiera typy konkretnego użytkownika
function getUserPick(userId, eventId) {
    const picks = getAllPicks();
    return picks[eventId]?.[userId] || null;
}

// Usuwa typ użytkownika dla danego eventu
function deleteUserPick(userId, eventId) {
    const picks = getAllPicks();
    if (picks[eventId] && picks[eventId][userId]) {
        delete picks[eventId][userId];
        fs.writeFileSync(PICKS_PATH, JSON.stringify(picks, null, 2));
    }
}

module.exports = {
    submitPick,
    getAllPicks,
    getUserPick,
    deleteUserPick
};

// ✅ scoreSaver.js – trwałe zapisywanie punktów i rankingu
const fs = require('fs');
const path = require('path');

const SCORES_PATH = path.join(__dirname, '../scores.json');

function loadScores() {
  try {
    return JSON.parse(fs.readFileSync(SCORES_PATH));
  } catch (e) {
    return {};
  }
}

function saveScore(userId, score) {
  const scores = loadScores();
  scores[userId] = score;
  fs.writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2));
}

function getAllScores() {
  return loadScores();
}

module.exports = { saveScore, getAllScores };

// backup.js

const fs = require('fs');
const path = require('path');
require('dotenv').config();

function performBackup() {
    try {
        const dataPath = path.join(__dirname, 'data');
        const backupPath = path.join(dataPath, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

        const picks = readJson(path.join(dataPath, 'picks.json'));
        const results = readJson(path.join(dataPath, 'results.json'));
        const history = readJson(path.join(dataPath, 'history.json'));
        const deadline = readJson(path.join(dataPath, 'deadline.json'));
        const events = readJson(path.join(dataPath, 'events.json'));

        const backupData = {
            timestamp: new Date().toISOString(),
            picks,
            results,
            history,
            deadline,
            events
        };

        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
        console.log(`Backup zapisany: ${backupPath}`);
    } catch (err) {
        console.error('Błąd podczas backupu:', err);
    }
}

function readJson(filePath) {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return {};
}

performBackup();

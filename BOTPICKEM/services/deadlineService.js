// services/deadlineService.js

const fs = require('fs');
const path = require('path');

const deadlinePath = path.join(__dirname, '../data/deadline.json');

function loadDeadline() {
    if (!fs.existsSync(deadlinePath)) {
        return null;
    }
    const data = JSON.parse(fs.readFileSync(deadlinePath, 'utf8'));
    return data.deadline ? new Date(data.deadline) : null;
}

function saveDeadline(deadline) {
    const data = { deadline: deadline.toISOString() };
    fs.writeFileSync(deadlinePath, JSON.stringify(data, null, 2), 'utf8');
}

function clearDeadline() {
    if (fs.existsSync(deadlinePath)) {
        fs.unlinkSync(deadlinePath);
    }
}

module.exports = {
    loadDeadline,
    saveDeadline,
    clearDeadline
};

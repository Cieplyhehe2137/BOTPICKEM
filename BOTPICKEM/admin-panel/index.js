require('dotenv').config();
const express = require('express');
const path = require('path');
const pickemService = ('../services/pickemService0');
const scoringService = require('../services/scoringService');
const fs = require('fs');

const app = express();
const PORT = process.env.ADMIN_PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Główna strona panelu
app.get('/', (req, res) => {
    const picks = pickemService.getAllPicks();
    const scores = scoringService.calculateTotalScores();
    res.render('index', {picks, scores});
})

// Endpoint backupowy (pełny eksport danych JSON)

app.get('/backup', (req, res) => {
    const backup = {
        picks: pickemService.getAllPicks(),
        scores: scoringService.calculateTotalScores()
    };
    res.header('Content-Type','application/json');
    res.send(JSON.stringify(backup, null, 2));
});

app.listen(PORT, () =>
    console.log('Admin Panel dostępny na porcie ${PORT}')
);



module.exports = {};

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const pickemService = require('../services/pickemServices');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('score_fullpickem')
        .setDescription('Policz punkty za pełny Pick\'Em'),

    async execute(interaction) {
        const picksPath = path.join(__dirname, '../data/picks.json');
        const resultsPath = path.join(__dirname, '../data/results.json');

        if (!fs.existsSync(picksPath) || !fs.existsSync(resultsPath)) {
            return interaction.reply({ content: 'Brakuje plików z typami lub wynikami.', ephemeral: true });
        }

        const picks = JSON.parse(fs.readFileSync(picksPath));
        const results = JSON.parse(fs.readFileSync(resultsPath));

        const userScores = {};

        for (const userId in picks) {
            const userPick = picks[userId];
            let score = 0;

            // 3-0
            if (results['3-0'] && userPick['3-0'] && results['3-0'].includes(userPick['3-0'])) {
                score += 4;
            }

            // 0-3
            if (results['0-3'] && userPick['0-3'] && results['0-3'].includes(userPick['0-3'])) {
                score += 4;
            }

            // Awansujące
            if (Array.isArray(results['advancing']) && Array.isArray(userPick['advancing'])) {
                for (const team of userPick['advancing']) {
                    if (results['advancing'].includes(team)) {
                        score += 2;
                    }
                }
            }

            // Półfinały
            if (Array.isArray(results['semifinal']) && Array.isArray(userPick['semifinal'])) {
                for (const team of userPick['semifinal']) {
                    if (results['semifinal'].includes(team)) {
                        score += 2;
                    }
                }
            }

            // Finał
            if (Array.isArray(results['final']) && Array.isArray(userPick['final'])) {
                for (const team of userPick['final']) {
                    if (results['final'].includes(team)) {
                        score += 3;
                    }
                }
            }

            // Zwycięzca
            if (results['winner'] && userPick['winner'] && results['winner'] === userPick['winner']) {
                score += 5;
            }

            userScores[userId] = score;
        }

        // Zapisz wyniki
        const scoresPath = path.join(__dirname, '../data/fullpickem_scores.json');
        fs.writeFileSync(scoresPath, JSON.stringify(userScores, null, 2));

        await interaction.reply({ content: '✅ Punkty za Full Pick\'Em zostały obliczone i zapisane!', ephemeral: true });
    }
};

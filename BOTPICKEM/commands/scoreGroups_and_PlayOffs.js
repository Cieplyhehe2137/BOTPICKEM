const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('score_groups_and_playoffs')
        .setDescription('Policz punkty za fazę grupową i playoffy'),

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

            if (Array.isArray(results.group) && Array.isArray(userPick.group)) {
                for (const team of userPick.group) {
                    if (results.group.includes(team)) {
                        score += 1;
                    }
                }
            }

            if (Array.isArray(results.playoff) && Array.isArray(userPick.playoff)) {
                for (const team of userPick.playoff) {
                    if (results.playoff.includes(team)) {
                        score += 2;
                    }
                }
            }

            userScores[userId] = score;
        }

        const scoresPath = path.join(__dirname, '../data/group_and_playoff_scores.json');
        fs.writeFileSync(scoresPath, JSON.stringify(userScores, null, 2));

        await interaction.reply({ content: '✅ Punkty za grupy i playoffy zostały policzone!', ephemeral: true });
    }
};

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const picksPath = path.join(__dirname, '..', 'data', 'picks.json');
const resultsPath = path.join(__dirname, '..', 'data', 'results.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('score_fullpickem')
        .setDescription('Policz punkty za pełne typowanie (3-0, 0-3, awansy, playoffy)'),

    async execute(interaction) {
        if (!fs.existsSync(picksPath) || !fs.existsSync(resultsPath)) {
            return interaction.reply({ content: 'Brakuje pliku z typami lub wynikami!', ephemeral: true });
        }

        const picksData = JSON.parse(fs.readFileSync(picksPath));
        const results = JSON.parse(fs.readFileSync(resultsPath));

        const eventName = 'full_pickem';
        const picks = picksData[eventName];

        if (!picks) {
            return interaction.reply({ content: 'Brak typów dla tego wydarzenia!', ephemeral: true });
        }

        const scoreboard = [];

        for (const userId in picks) {
            const pick = picks[userId];
            let score = 0;

            // 3-0
            if (pick.threezero === results.threezero) score += 4;

            // 0-3
            if (pick.zerothree === results.zerothree) score += 4;

            // Awanse
            for (const team of pick.advancing) {
                if (results.advancing.includes(team)) score += 2;
            }

            // Półfinały
            for (const team of pick.semifinalists) {
                if (results.semifinalists.includes(team)) score += 3;
            }

            // Finały
            for (const team of pick.finalists) {
                if (results.finalists.includes(team)) score += 3;
            }

            // Zwycięzca
            if (pick.winner === results.winner) score += 5;

            scoreboard.push({ userId, score });
        }

        scoreboard.sort((a, b) => b.score - a.score);

        const resultText = scoreboard.map((entry, index) =>
            `**${index + 1}.** <@${entry.userId}> — **${entry.score} pkt**`
        ).join('\n');

        return interaction.reply({ content: `📊 **Wyniki Pick'Em**\n\n${resultText}`, ephemeral: false });
    }
};

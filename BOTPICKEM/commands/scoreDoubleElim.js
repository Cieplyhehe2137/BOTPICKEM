const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const picksPath = path.join(__dirname, '..', 'data', 'picks.json');
const resultsPath = path.join(__dirname, '..', 'data', 'results_doubleelim.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('score_doubleelim')
        .setDescription('Policz punkty za typowanie drabinki double elimination'),

    async execute(interaction) {
        if (!fs.existsSync(picksPath) || !fs.existsSync(resultsPath)) {
            return interaction.reply({ content: 'Brakuje pliku z typami lub wynikami!', ephemeral: true });
        }

        const picksData = JSON.parse(fs.readFileSync(picksPath));
        const results = JSON.parse(fs.readFileSync(resultsPath));

        const eventName = 'double_elim';
        const picks = picksData[eventName];

        if (!picks) {
            return interaction.reply({ content: 'Brak typów dla tego wydarzenia!', ephemeral: true });
        }

        const scoreboard = [];

        for (const userId in picks) {
            const pick = picks[userId];
            let score = 0;

            for (const team of pick.upperfinal) {
                if (results.upperfinal.includes(team)) score += 3;
            }

            for (const team of pick.lowerfinal) {
                if (results.lowerfinal.includes(team)) score += 3;
            }

            if (pick.grandfinal === results.grandfinal) score += 5;

            scoreboard.push({ userId, score });
        }

        scoreboard.sort((a, b) => b.score - a.score);

        const resultText = scoreboard.map((entry, index) =>
            `**${index + 1}.** <@${entry.userId}> — **${entry.score} pkt**`
        ).join('\n');

        return interaction.reply({ content: `📊 **Wyniki Double Elim**\n\n${resultText}`, ephemeral: false });
    }
};

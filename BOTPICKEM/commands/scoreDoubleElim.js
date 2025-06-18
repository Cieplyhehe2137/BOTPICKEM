const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const picksPath = path.join(__dirname, '..', 'data', 'picks.json');
const resultsPath = path.join(__dirname, '..', 'data', 'results_doubleelim.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('score_doubleelim')
        .setDescription('Policz punkty za pełne typowanie drabinki Double Elimination (bez Grand Final)'),

    async execute(interaction) {
        if (!fs.existsSync(picksPath) || !fs.existsSync(resultsPath)) {
            return interaction.reply({ content: 'Brakuje pliku z typami lub wynikami!', ephemeral: true });
        }

        const picksData = JSON.parse(fs.readFileSync(picksPath));
        const results = JSON.parse(fs.readFileSync(resultsPath));

        const eventName = 'double_elim_full';
        const picks = picksData[eventName];

        if (!picks) {
            return interaction.reply({ content: 'Brak typów dla tego wydarzenia!', ephemeral: true });
        }

        const scoreboard = [];

        for (const userId in picks) {
            const pick = picks[userId];
            let score = 0;

            // Zwycięzcy ćwierćfinałów
            for (const team of pick.qf_winners) {
                if (results.qf_winners.includes(team)) score += 2;
            }

            // Zwycięzcy półfinałów (UB)
            for (const team of pick.sf_winners) {
                if (results.sf_winners.includes(team)) score += 2;
            }

            // Zwycięzca Upper Final
            if (pick.upperfinal_winner === results.upperfinal_winner) {
                score += 3;
            }

            // Zwycięzcy Lower Round 1
            for (const team of pick.lower_r1_winners) {
                if (results.lower_r1_winners.includes(team)) score += 2;
            }

            // Zwycięzcy Lower Round 2
            for (const team of pick.lower_r2_winners) {
                if (results.lower_r2_winners.includes(team)) score += 2;
            }

            // Zwycięzca Lower Final
            if (pick.lowerfinal_winner === results.lowerfinal_winner) {
                score += 3;
            }

            scoreboard.push({ userId, score });
        }

        scoreboard.sort((a, b) => b.score - a.score);

        const resultText = scoreboard.map((entry, index) =>
            `**${index + 1}.** <@${entry.userId}> — **${entry.score} pkt**`
        ).join('\n');

        return interaction.reply({ content: `📊 **Wyniki Double Elim (Full)**\n\n${resultText}`, ephemeral: false });
    }
};

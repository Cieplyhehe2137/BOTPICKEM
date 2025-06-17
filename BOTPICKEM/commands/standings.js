// commands/standings.js

const { SlashCommandBuilder } = require('discord.js');
const scoringService = require('../services/scoringService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('standings')
        .setDescription('Wyświetl aktualny ranking punktowy'),

    async execute(interaction) {
        const totalScores = scoringService.calculateTotalScores();

        if (!totalScores.length) {
            return interaction.reply('Brak zapisanych wyników.');
        }

        let response = '📊 **Aktualny ranking:**\n\n';

        for (let i = 0; i < totalScores.length; i++) {
            const entry = totalScores[i];
            const user = await interaction.client.users.fetch(entry.userId).catch(() => null);
            const username = user ? user.username : `Użytkownik ${entry.userId}`;
            response += `**${i + 1}.** ${username} — **${entry.total} pkt**\n`;
        }

        await interaction.reply(response);
    }
};

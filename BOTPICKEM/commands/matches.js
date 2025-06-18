// commands/matches.js
const { SlashCommandBuilder } = require('discord.js');
const { getUpcomingMatches } = require('../services/hltvService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('matches')
        .setDescription('Pokaż nadchodzące mecze z HLTV'),

    async execute(interaction) {
        const matches = await getUpcomingMatches();
        if (!matches || matches.length === 0) {
            return interaction.reply('Brak nadchodzących meczów 😥');
        }

        const response = matches.map(m =>
            `🏆 **${m.event}**
🕒 ${m.time}
💥 ${m.team1} vs ${m.team2}`).join('\n\n');

        await interaction.reply({ content: response, ephemeral: true });
    }
};

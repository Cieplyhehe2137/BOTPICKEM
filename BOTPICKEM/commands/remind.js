// commands/remind.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const deadlineService = require('../services/deadlineService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Wyślij ręczne przypomnienie o deadlinie (admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const deadline = deadlineService.loadDeadline();

        if (!deadline) {
            return interaction.reply('Brak ustawionego deadline\'u.');
        }

        await interaction.channel.send(`🔔 Przypomnienie: deadline na oddanie typów mija: **${deadline.toLocaleString()}**`);
        await interaction.reply({ content: 'Przypomnienie wysłane.', ephemeral: true });
    }
};

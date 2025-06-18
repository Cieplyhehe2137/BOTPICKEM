const { SlashCommandBuilder } = require('discord.js');
const deadlineService = require('../services/deadlineService');
const pickemService = require('../services/pickemService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit_fullpickem')
        .setDescription('Prześlij pełne typowanie 3-0, 0-3, awansy i playoffy')
        .addStringOption(option =>
            option.setName('threezero')
                .setDescription('Drużyna 3-0')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('zerothree')
                .setDescription('Drużyna 0-3')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('advancing')
                .setDescription('6 drużyn awansujących, oddzielone przecinkami')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('semifinalists')
                .setDescription('4 półfinalistów, oddzielonych przecinkami')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('finalists')
                .setDescription('2 finalistów, oddzielonych przecinkiem')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('winner')
                .setDescription('Zwycięzca turnieju')
                .setRequired(true)),

    async execute(interaction) {
        const deadline = deadlineService.loadDeadline();
        if (deadline && new Date() > deadline) {
            return interaction.reply({ content: 'Deadline minął! Nie możesz już typować.', ephemeral: true });
        }

        const userId = interaction.user.id;

        const threezero = interaction.options.getString('threezero');
        const zerothree = interaction.options.getString('zerothree');
        const advancing = interaction.options.getString('advancing').split(',').map(t => t.trim());
        const semifinalists = interaction.options.getString('semifinalists').split(',').map(t => t.trim());
        const finalists = interaction.options.getString('finalists').split(',').map(t => t.trim());
        const winner = interaction.options.getString('winner');

        if (advancing.length !== 6) {
            return interaction.reply({ content: 'Musisz podać **dokładnie 6 drużyn** awansujących!', ephemeral: true });
        }

        if (semifinalists.length !== 4) {
            return interaction.reply({ content: 'Musisz podać **dokładnie 4 drużyny** półfinałowe!', ephemeral: true });
        }

        if (finalists.length !== 2) {
            return interaction.reply({ content: 'Musisz podać **dokładnie 2 drużyny** finałowe!', ephemeral: true });
        }

        if (winner.length !== 1) {
            return interaction.reply({ content: 'Podaj zwycięzcę całego turnieju!', ephemeral: true });
        
        const pick = {
            userId,
            threezero,
            zerothree,
            advancing,
            semifinalists,
            finalists,
            winner,
            timestamp: new Date().toISOString()
        };

        pickemService.saveUserPick('full_pickem', userId, pick);

        return interaction.reply({ content: '✅ Twoje pełne typowanie zostało zapisane!', ephemeral: true });
    }
};

const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemServices');
const deadlineService = require('../services/deadlineService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit_doubleelim')
        .setDescription('Prześlij swoje typy na double elimination')
        .addStringOption(option =>
            option.setName('upperfinal')
                .setDescription('Upper Final (2 drużyny oddzielone przecinkiem)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('lowerfinal')
                .setDescription('Lower Final (2 drużyny oddzielone przecinkiem)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grandfinal')
                .setDescription('Grand Final (zwycięzca)')
                .setRequired(true)),

    async execute(interaction) {
        const deadline = deadlineService.loadDeadline();
        if (deadline && new Date() > deadline) {
            return interaction.reply({ content: '⛔ Deadline minął!', ephemeral: true });
        }

        const userId = interaction.user.id;
        const upperfinal = interaction.options.getString('upperfinal');
        const lowerfinal = interaction.options.getString('lowerfinal');
        const grandfinal = interaction.options.getString('grandfinal');

        const picks = {
            upperfinal: upperfinal.split(',').map(team => team.trim()),
            lowerfinal: lowerfinal.split(',').map(team => team.trim()),
            grandfinal: grandfinal.trim()
        };

        pickemService.saveUserPick(userId, picks, 'doubleelim');

        await interaction.reply({ content: '✅ Typy na double elimination zapisane!', ephemeral: true });
    }
};

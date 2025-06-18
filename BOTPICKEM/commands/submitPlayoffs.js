// commands/submitPlayoffs.js

const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemServices');
const deadlineService = require('../services/deadlineService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit_playoffs')
        .setDescription('Prześlij swoje typy na playoffy')
        .addStringOption(option => option.setName('quarterfinals').setDescription('Ćwierćfinały (4 drużyny)').setRequired(true))
        .addStringOption(option => option.setName('semifinals').setDescription('Półfinały (2 drużyny)').setRequired(true))
        .addStringOption(option => option.setName('final').setDescription('Zwycięzca finału').setRequired(true)),

    async execute(interaction) {
        const deadline = deadlineService.loadDeadline();
        if (deadline && new Date() > deadline) {
            return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
        }

        const userId = interaction.user.id;
        const quarterfinals = interaction.options.getString('quarterfinals').split(',').map(e => e.trim());
        const semifinals = interaction.options.getString('semifinals').split(',').map(e => e.trim());
        const final = interaction.options.getString('final');

        if (quarterfinals.length !== 4 || semifinals.length !== 2) {
            return interaction.reply({ content: 'Podaj dokładnie 4 drużyny do ćwierćfinału i 2 do półfinału.', ephemeral: true });
        }

        const pickData = { quarterfinals, semifinals, final };
        pickemService.submitPick(userId, 'playoffs', pickData);
        await interaction.reply({ content: 'Twoje typy na playoffy zostały zapisane!', ephemeral: true });
    }
};

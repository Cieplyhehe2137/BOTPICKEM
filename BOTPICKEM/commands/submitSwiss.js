// commands/submitSwiss.js

const { SlashCommandBuilder } = require('discord.js');
const pickemService = require('../services/pickemServices');
const deadlineService = require('../services/deadlineService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit_swiss')
        .setDescription('Prześlij swoje typy Swiss (3-0, 0-3, awanse)')
        .addStringOption(option => option.setName('threezero').setDescription('Typ 3-0').setRequired(true))
        .addStringOption(option => option.setName('zerothree').setDescription('Typ 0-3').setRequired(true))
        .addStringOption(option => option.setName('advances').setDescription('6 drużyn awansujących, oddzielone przecinkami').setRequired(true)),

    async execute(interaction) {
        const deadline = deadlineService.loadDeadline();
        if (deadline && new Date() > deadline) {
            return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
        }

        const userId = interaction.user.id;
        const threeZero = interaction.options.getString('threezero');
        const zeroThree = interaction.options.getString('zerothree');
        const advances = interaction.options.getString('advances').split(',').map(e => e.trim());

        if (advances.length !== 6) {
            return interaction.reply({ content: 'Podaj dokładnie 6 drużyn do awansu.', ephemeral: true });
        }

        const pickData = { threeZero, zeroThree, advances };
        pickemService.submitPick(userId, 'swiss', pickData);
        await interaction.reply({ content: 'Twoje typy Swiss zostały zapisane!', ephemeral: true });
    }
};

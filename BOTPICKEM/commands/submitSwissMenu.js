// 🟡 submitSwissMenu.js
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemServices');
const deadlineService = require('../services/deadlineService');
const teams = require('../data/teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitswissmenu')
    .setDescription('Typuj zwycięzców fazy Swiss (5 meczów)'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const rows = [];
    for (let i = 1; i <= 5; i++) {
      const select = new StringSelectMenuBuilder()
        .setCustomId(`swiss-${i}`)
        .setPlaceholder(`Mecz ${i}: wybierz zwycięzcę`)
        .addOptions(teams.map(t => ({ label: t, value: t })));
      rows.push(new ActionRowBuilder().addComponents(select));
    }

    await interaction.reply({ content: 'Wybierz zwycięzców meczów:', components: rows, ephemeral: true });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    const userId = interaction.user.id;
    const picks = [];

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });
      const index = parseInt(i.customId.split('-')[1]) - 1;
      picks[index] = i.values[0];
      await i.reply({ content: `Zapisano mecz ${index + 1}: ${i.values[0]}`, ephemeral: true });
      if (picks.filter(Boolean).length === 5) {
        pickemService.savePickSwiss(userId, picks);
        collector.stop();
      }
    });
  }
};

// 🟡 submitPlayoffsMenu.js
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');
const teams = require('../teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitplayoffsmenu')
    .setDescription('Typuj playoffy (ćwierćfinał, półfinał, finał)'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const selectQF = new StringSelectMenuBuilder()
      .setCustomId('qf')
      .setPlaceholder('Ćwierćfinał: zwycięzca')
      .addOptions(teams.map(t => ({ label: t, value: t })));
    const selectSF = new StringSelectMenuBuilder()
      .setCustomId('sf')
      .setPlaceholder('Półfinał: zwycięzca')
      .addOptions(teams.map(t => ({ label: t, value: t })));
    const selectF = new StringSelectMenuBuilder()
      .setCustomId('f')
      .setPlaceholder('Finał: zwycięzca')
      .addOptions(teams.map(t => ({ label: t, value: t })));

    const row1 = new ActionRowBuilder().addComponents(selectQF);
    const row2 = new ActionRowBuilder().addComponents(selectSF);
    const row3 = new ActionRowBuilder().addComponents(selectF);

    await interaction.reply({ content: 'Typuj playoffy:', components: [row1, row2, row3], ephemeral: true });

    const picks = {};
    const userId = interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      picks[i.customId] = i.values[0];
      await i.reply({ content: `Zapisano ${i.customId.toUpperCase()}: ${i.values[0]}`, ephemeral: true });

      if (Object.keys(picks).length === 3) {
        pickemService.savePickPlayoffs(userId, picks);
        collector.stop();
      }
    });
  }
};

// 🟡 submitDoubleElimMenu.js
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');
const teams = require('../teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitdoubleelimmenu')
    .setDescription('Typuj Double Elimination (Upper, Lower, Grand Final)'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const ids = ['upper', 'lower', 'grand'];
    const rows = ids.map(id => new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(`${id.charAt(0).toUpperCase() + id.slice(1)} Final: wybierz 2 drużyny`)
        .setMinValues(2)
        .setMaxValues(2)
        .addOptions(teams.map(t => ({ label: t, value: `${id}-${t}` })))
    ));

    await interaction.reply({ content: 'Wybierz swoje typy:', components: rows, ephemeral: true });

    const userId = interaction.user.id;
    const picks = {};
    const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });
      const key = i.customId;
      picks[key] = i.values.map(v => v.replace(`${key}-`, ''));
      await i.reply({ content: `Zapisano ${key}: ${picks[key].join(', ')}`, ephemeral: true });

      if (Object.keys(picks).length === 3) {
        pickemService.savePickDoubleElim(userId, picks);
        collector.stop();
      }
    });
  }
};



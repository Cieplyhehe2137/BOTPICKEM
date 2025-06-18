// ✅ submitDoubleElim.js z rozwijanym menu
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');
const teams = require('../teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitdoubleelim')
    .setDescription('Typuj drużyny do Upper, Lower i Grand Final'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const rows = ['upper', 'lower', 'grand'].map(id => new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(`Wybierz 2 drużyny do ${id.charAt(0).toUpperCase() + id.slice(1)} Final`)
        .setMinValues(2)
        .setMaxValues(2)
        .addOptions(teams.map(t => ({ label: t, value: `${id}-${t}` })))
    ));

    await interaction.reply({ content: 'Wybierz swoje typy:', components: rows, ephemeral: true });

    const picks = { upper: [], lower: [], grand: [] };
    const userId = interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      const key = i.customId;
      picks[key] = i.values.map(v => v.replace(`${key}-`, ''));
      await i.reply({ content: `Zapisano ${key}: ${picks[key].join(', ')}`, ephemeral: true });

      if (picks.upper.length === 2 && picks.lower.length === 2 && picks.grand.length === 2) {
        pickemService.savePickDoubleElim(userId, picks);
        collector.stop();
      }
    });
  }
};

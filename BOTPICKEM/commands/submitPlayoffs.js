// ✅ submitPlayoffs.js – 4 ćwierćfinały, 2 półfinały, 1 finał
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');
const teams = require('../teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitplayoffs')
    .setDescription('Typuj zwycięzców 4 ćwierćfinałów, 2 półfinałów i finału'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const rows = [];
    const rounds = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'final'];

    for (const id of rounds) {
      const select = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(`Wybierz zwycięzcę: ${id.toUpperCase()}`)
        .addOptions(teams.map(t => ({ label: t, value: t })));
      rows.push(new ActionRowBuilder().addComponents(select));
    }

    await interaction.reply({ content: 'Typuj wyniki playoffów:', components: rows, ephemeral: true });

    const picks = {};
    const userId = interaction.user.id;
    const expected = new Set(rounds);

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      picks[i.customId] = i.values[0];
      await i.reply({ content: `Zapisano ${i.customId.toUpperCase()}: ${i.values[0]}`, ephemeral: true });

      if (Object.keys(picks).length === rounds.length) {
        pickemService.savePickPlayoffs(userId, picks);
        collector.stop();
      }
    });
  }
};

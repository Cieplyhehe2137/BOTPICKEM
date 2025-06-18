// ✅ submit_groups_and_playoffs.js – rozwijane menu: 6 awansów + playoffy (2 ćw., 2 pół., 1 finał)
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemServices');
const deadlineService = require('../services/deadlineService');
const teams = require('../data/teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit_groups_and_playoffs')
    .setDescription('Typuj 6 awansów z grup + playoffy (2 ćw., 2 pół., finał)'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const advanceSelect = new StringSelectMenuBuilder()
      .setCustomId('advance')
      .setPlaceholder('Wybierz 6 drużyn do awansu z grup')
      .setMinValues(6)
      .setMaxValues(6)
      .addOptions(teams.map(t => ({ label: t, value: `adv-${t}` })));

    const playoffIds = ['qf1', 'qf2', 'sf1', 'sf2', 'final'];
    const playoffRows = playoffIds.map(id => new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(`${id.toUpperCase()}: wybierz zwycięzcę`)
        .addOptions(teams.map(t => ({ label: t, value: t })))
    ));

    const row1 = new ActionRowBuilder().addComponents(advanceSelect);
    await interaction.reply({ content: 'Typuj awanse i playoffy:', components: [row1, ...playoffRows], ephemeral: true });

    const userId = interaction.user.id;
    const picks = { advance: [], qf1: '', qf2: '', sf1: '', sf2: '', final: '' };

    const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      if (i.customId === 'advance') {
        picks.advance = i.values.map(v => v.replace('adv-', ''));
        await i.reply({ content: `Zapisano awanse: ${picks.advance.join(', ')}`, ephemeral: true });
      } else {
        picks[i.customId] = i.values[0];
        await i.reply({ content: `Zapisano ${i.customId.toUpperCase()}: ${i.values[0]}`, ephemeral: true });
      }

      const allSet = picks.advance.length === 6 && ['qf1','qf2','sf1','sf2','final'].every(k => picks[k]);
      if (allSet) {
        pickemService.savePickGroupsAndPlayoffs(userId, picks);
        collector.stop();
      }
    });
  }
};

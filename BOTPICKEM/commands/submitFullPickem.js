// ✅ submit_full_plus_playoffs.js – 3-0, 0-3, 6 awansów + 4 ćw., 2 pół., 1 finał
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');
const teams = require('../teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit_full_plus_playoffs')
    .setDescription('Typuj 3-0, 0-3, 6 awansów + pełne playoffy (ćw., półf., finał)'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const selects = [
      new StringSelectMenuBuilder()
        .setCustomId('3-0')
        .setPlaceholder('Wybierz 2 drużyny do 3-0')
        .setMinValues(2)
        .setMaxValues(2)
        .addOptions(teams.map(t => ({ label: t, value: `30-${t}` }))),

      new StringSelectMenuBuilder()
        .setCustomId('0-3')
        .setPlaceholder('Wybierz 2 drużyny do 0-3')
        .setMinValues(2)
        .setMaxValues(2)
        .addOptions(teams.map(t => ({ label: t, value: `03-${t}` }))),

      new StringSelectMenuBuilder()
        .setCustomId('advance')
        .setPlaceholder('Wybierz 6 drużyn do awansu')
        .setMinValues(6)
        .setMaxValues(6)
        .addOptions(teams.map(t => ({ label: t, value: `adv-${t}` })))
    ];

    const playoffIds = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'final'];
    const playoffSelects = playoffIds.map(id => new StringSelectMenuBuilder()
      .setCustomId(id)
      .setPlaceholder(`${id.toUpperCase()}: wybierz zwycięzcę`)
      .addOptions(teams.map(t => ({ label: t, value: t }))));

    const rows = [...selects.map(s => new ActionRowBuilder().addComponents(s)),
                   ...playoffSelects.map(s => new ActionRowBuilder().addComponents(s))];

    await interaction.reply({ content: 'Typuj Pick'Em:', components: rows, ephemeral: true });

    const userId = interaction.user.id;
    const picks = { '3-0': [], '0-3': [], advance: [], qf1: '', qf2: '', qf3: '', qf4: '', sf1: '', sf2: '', final: '' };
    const filled = new Set();

    const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      const id = i.customId;
      if (id === '3-0') {
        picks['3-0'] = i.values.map(v => v.replace('30-', ''));
      } else if (id === '0-3') {
        picks['0-3'] = i.values.map(v => v.replace('03-', ''));
      } else if (id === 'advance') {
        picks.advance = i.values.map(v => v.replace('adv-', ''));
      } else {
        picks[id] = i.values[0];
      }

      filled.add(id);
      await i.reply({ content: `Zapisano: ${id.toUpperCase()}`, ephemeral: true });

      const required = ['3-0', '0-3', 'advance', 'qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'final'];
      const allSet = required.every(k => (['3-0','0-3','advance'].includes(k) ? picks[k].length : picks[k]) );

      if (allSet) {
        pickemService.savePickFullPlusPlayoffs(userId, picks);
        collector.stop();
      }
    });
  }
};

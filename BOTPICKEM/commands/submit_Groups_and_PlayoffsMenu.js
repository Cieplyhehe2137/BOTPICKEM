// 🟡 submit_groups_and_playoffs_menu.js
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');
const teams = require('../teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitgroupplayoffsmenu')
    .setDescription('Typuj awanse z grup i playoffy (ćw., pół., finał)'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const advanceSelect = new StringSelectMenuBuilder()
      .setCustomId('advance')
      .setPlaceholder('Wybierz 6 drużyn do awansu')
      .setMinValues(6)
      .setMaxValues(6)
      .addOptions(teams.map(t => ({ label: t, value: `adv-${t}` })));

    const playoffIds = ['qf', 'sf', 'f'];
    const playoffRows = playoffIds.map(id => new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(`${id.toUpperCase()}: wybierz zwycięzcę`)
        .addOptions(teams.map(t => ({ label: t, value: t })))
    ));

    const row1 = new ActionRowBuilder().addComponents(advanceSelect);
    await interaction.reply({ content: 'Typuj awanse i playoffy:', components: [row1, ...playoffRows], ephemeral: true });

    const userId = interaction.user.id;
    const picks = { advance: [], qf: '', sf: '', f: '' };

    const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      if (i.customId === 'advance') {
        picks.advance = i.values.map(v => v.replace('adv-', ''));
        await i.reply({ content: `Zapisano awanse: ${picks.advance.join(', ')}`, ephemeral: true });
      } else {
        picks[i.customId] = i.values[0];
        await i.reply({ content: `Zapisano ${i.customId.toUpperCase()}: ${i.values[0]}`, ephemeral: true });
      }

      if (picks.advance.length === 6 && picks.qf && picks.sf && picks.f) {
        pickemService.savePickGroupsAndPlayoffs(userId, picks);
        collector.stop();
      }
    });
  }
};

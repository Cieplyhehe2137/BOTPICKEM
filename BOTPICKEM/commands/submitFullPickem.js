// ✅ submitFullPickem.js z rozwijanym menu
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');
const teams = require('../teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitfullpickem')
    .setDescription('Typuj 3-0, 0-3 i 6 drużyn do awansu'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const select30 = new StringSelectMenuBuilder()
      .setCustomId('pick30')
      .setPlaceholder('Wybierz drużynę 3-0')
      .addOptions(teams.map(t => ({ label: t, value: 'pick30-' + t })));

    const select03 = new StringSelectMenuBuilder()
      .setCustomId('pick03')
      .setPlaceholder('Wybierz drużynę 0-3')
      .addOptions(teams.map(t => ({ label: t, value: 'pick03-' + t })));

    const selectAdv = new StringSelectMenuBuilder()
      .setCustomId('adv')
      .setPlaceholder('Wybierz 6 drużyn do awansu')
      .setMinValues(6)
      .setMaxValues(6)
      .addOptions(teams.map(t => ({ label: t, value: 'adv-' + t })));

    const rows = [
      new ActionRowBuilder().addComponents(select30),
      new ActionRowBuilder().addComponents(select03),
      new ActionRowBuilder().addComponents(selectAdv)
    ];

    await interaction.reply({ content: 'Wybierz swoje typy:', components: rows, ephemeral: true });

    const picks = { "3-0": "", "0-3": "", advance: [] };
    const userId = interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      if (i.customId === 'pick30') {
        picks["3-0"] = i.values[0].replace('pick30-', '');
        await i.reply({ content: `Zapisano 3-0: ${picks["3-0"]}`, ephemeral: true });
      }

      if (i.customId === 'pick03') {
        picks["0-3"] = i.values[0].replace('pick03-', '');
        await i.reply({ content: `Zapisano 0-3: ${picks["0-3"]}`, ephemeral: true });
      }

      if (i.customId === 'adv') {
        picks.advance = i.values.map(v => v.replace('adv-', ''));
        await i.reply({ content: `Zapisano awanse: ${picks.advance.join(', ')}`, ephemeral: true });
        pickemService.savePickFull(userId, picks);
        collector.stop();
      }
    });
  }
};

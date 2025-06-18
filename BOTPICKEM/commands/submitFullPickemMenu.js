// commands/submitFullPickemMenu.js
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService = require('../services/pickemServices');
const deadlineService = require('../services/deadlineService');

// Przykladowe drużyny (na razie statyczne)
const teams = ["G2", "Vitality", "Navi", "Furia", "Spirit", "VP", "FaZe", "Mongolz"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitfullmenu')
    .setDescription('Typuj 3-0, 0-3 i 6 drużyn do awansu z menu'),

  async execute(interaction) {
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const select30 = new StringSelectMenuBuilder()
      .setCustomId('pick-30')
      .setPlaceholder('Wybierz drużynę 3-0')
      .addOptions(teams.map(team => ({ label: team, value: `30-${team}` })));

    const select03 = new StringSelectMenuBuilder()
      .setCustomId('pick-03')
      .setPlaceholder('Wybierz drużynę 0-3')
      .addOptions(teams.map(team => ({ label: team, value: `03-${team}` })));

    const selectAdvance = new StringSelectMenuBuilder()
      .setCustomId('pick-advance')
      .setPlaceholder('Wybierz 6 drużyn do awansu')
      .setMinValues(6)
      .setMaxValues(6)
      .addOptions(teams.map(team => ({ label: team, value: `adv-${team}` })));

    const row1 = new ActionRowBuilder().addComponents(select30);
    const row2 = new ActionRowBuilder().addComponents(select03);
    const row3 = new ActionRowBuilder().addComponents(selectAdvance);

    await interaction.reply({ content: 'Wybierz swoje typy:', components: [row1, row2, row3], ephemeral: true });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    const userId = interaction.user.id;
    const picks = { "3-0": "", "0-3": "", "advance": [] };

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      if (i.customId === 'pick-30') {
        picks["3-0"] = i.values[0].replace('30-', '');
        await i.reply({ content: `Zapisano 3-0: ${picks["3-0"]}`, ephemeral: true });
      }

      if (i.customId === 'pick-03') {
        picks["0-3"] = i.values[0].replace('03-', '');
        await i.reply({ content: `Zapisano 0-3: ${picks["0-3"]}`, ephemeral: true });
      }

      if (i.customId === 'pick-advance') {
        picks["advance"] = i.values.map(v => v.replace('adv-', ''));
        pickemService.savePickFull(userId, picks);
        await i.reply({ content: `Zapisano awanse: ${picks["advance"].join(', ')}`, ephemeral: true });
        collector.stop();
      }
    });
  }
};

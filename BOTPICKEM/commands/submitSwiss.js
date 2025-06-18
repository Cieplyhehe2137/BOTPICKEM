// ✅ submitSwiss.js z rozwijanym menu
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const pickemService3 = require('../services/pickemService');
const deadlineService3 = require('../services/deadlineService');
const teams3 = require('../teams.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submitswiss')
    .setDescription('Typuj zwycięzców 5 meczów fazy Swiss'),

  async execute(interaction) {
    const deadline = deadlineService3.loadDeadline();
    if (deadline && new Date() > deadline) {
      return interaction.reply({ content: 'Deadline minął!', ephemeral: true });
    }

    const rows = [];
    for (let i = 1; i <= 5; i++) {
      const select = new StringSelectMenuBuilder()
        .setCustomId(`match${i}`)
        .setPlaceholder(`Mecz ${i}: wybierz zwycięzcę`)
        .addOptions(teams3.map(t => ({ label: t, value: t })));
      rows.push(new ActionRowBuilder().addComponents(select));
    }

    await interaction.reply({ content: 'Wybierz zwycięzców meczów:', components: rows, ephemeral: true });

    const picks = [];
    const userId = interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: 'To nie Twoje typy!', ephemeral: true });

      const index = parseInt(i.customId.replace('match', '')) - 1;
      picks[index] = i.values[0];
      await i.reply({ content: `Zapisano mecz ${index + 1}: ${i.values[0]}`, ephemeral: true });

      if (picks.filter(Boolean).length === 5) {
        pickemService3.savePickSwiss(userId, picks);
        collector.stop();
      }
    });
  }
};

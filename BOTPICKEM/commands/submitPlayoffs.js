// ✅ submitPlayoffs.js z rozwijanym menu
const {{ SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType }} = require('discord.js');
const pickemService = require('../services/pickemService');
const deadlineService = require('../services/deadlineService');
const teams = require('../teams.json');

module.exports = {{
  data: new SlashCommandBuilder()
    .setName('submitplayoffs')
    .setDescription('Typuj playoffy: ćwierćfinał, półfinał, finał'),

  async execute(interaction) {{
    const deadline = deadlineService.loadDeadline();
    if (deadline && new Date() > deadline) {{
      return interaction.reply({{ content: 'Deadline minął!', ephemeral: true }});
    }}

    const rows = ['qf', 'sf', 'f'].map(id => new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(`Wybierz zwycięzcę ${id.toUpperCase()}`)
        .addOptions(teams.map(t => ({{ label: t, value: t }})))
    ));

    await interaction.reply({{ content: 'Wybierz zwycięzców:', components: rows, ephemeral: true }});

    const picks = {{ qf: '', sf: '', f: '' }};
    const userId = interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({{ componentType: ComponentType.StringSelect, time: 60000 }});

    collector.on('collect', async i => {{
      if (i.user.id !== userId) return i.reply({{ content: 'To nie Twoje typy!', ephemeral: true }});
      picks[i.customId] = i.values[0];
      await i.reply({{ content: `Zapisano ${i.customId.toUpperCase()}: ${{i.values[0]}}`, ephemeral: true }});

      if (picks.qf && picks.sf && picks.f) {{
        pickemService.savePickPlayoffs(userId, picks);
        collector.stop();
      }}
    }});
  }}
}};

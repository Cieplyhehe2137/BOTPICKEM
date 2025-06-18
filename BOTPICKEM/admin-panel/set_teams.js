// ✅ set_teams.js – admin komenda do ustawienia drużyn
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set_teams')
    .setDescription('Ustaw drużyny do Pick'Emów (oddzielone przecinkami)')
    .addStringOption(option =>
      option.setName('lista')
        .setDescription('Lista drużyn, oddzielone przecinkami')
        .setRequired(true)
    ),

  async execute(interaction) {
    const isAdmin = interaction.member.permissions.has('Administrator');
    if (!isAdmin) {
      return interaction.reply({ content: 'Tylko administrator może ustawić drużyny!', ephemeral: true });
    }

    const rawList = interaction.options.getString('lista');
    const teams = rawList.split(',').map(t => t.trim()).filter(Boolean);

    const filePath = path.join(__dirname, '../teams.json');
    fs.writeFileSync(filePath, JSON.stringify(teams, null, 2));

    await interaction.reply({ content: `✅ Zaktualizowano drużyny:
${teams.join(', ')}`, ephemeral: false });
  }
};
